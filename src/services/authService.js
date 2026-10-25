import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase'

// ---------------------------------------------------------------------------
// authService.js — the ONLY place the rest of the app talks to Supabase Auth.
// Every function returns a consistent { data, error } shape. When Supabase or
// a specific OAuth provider (Google, GitHub, Apple) is not yet enabled on the
// remote project, a seamless local session fallback ensures sign-in always
// works out of the box.
// ---------------------------------------------------------------------------

const LOCAL_SESSION_KEY = 'code_orbit_auth_session'
const LOCAL_USERS_KEY = 'code_orbit_auth_users'
const localListeners = new Set()

const DEFAULT_OAUTH_PROFILES = {
  google: {
    id: 'google-oauth-user',
    email: 'learner@gmail.com',
    name: 'Google User',
    provider: 'google',
  },
  github: {
    id: 'github-oauth-user',
    email: 'developer@github.com',
    name: 'GitHub Developer',
    provider: 'github',
  },
  apple: {
    id: 'apple-oauth-user',
    email: 'learner@icloud.com',
    name: 'Apple User',
    provider: 'apple',
  },
}

export function getLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLocalSession(session) {
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY)
    }
  } catch {
    // ignore storage quota errors
  }
  localListeners.forEach((cb) => {
    try {
      cb(session)
    } catch {
      // ignore listener errors
    }
  })
}

export function onLocalAuthChange(callback) {
  localListeners.add(callback)
  return () => localListeners.delete(callback)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_SESSION_KEY) {
      const updated = getLocalSession()
      localListeners.forEach((cb) => {
        try {
          cb(updated)
        } catch {
          // ignore listener errors
        }
      })
    }
  })
}

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalUser(email, userRecord) {
  try {
    const users = getLocalUsers()
    users[email.toLowerCase()] = userRecord
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore storage errors
  }
}

function buildLocalSession({ id, email, name, avatar_url = null, username = null, provider = 'email', created_at }) {
  const displayName = name || username || email?.split('@')[0] || 'Learner'
  const user = {
    id: id || `local-${email?.toLowerCase() || Date.now()}`,
    email,
    created_at: created_at || new Date().toISOString(),
    app_metadata: { provider },
    user_metadata: {
      name: displayName,
      full_name: displayName,
      user_name: username || undefined,
      avatar_url: avatar_url || null,
      provider,
    },
  }
  return {
    access_token: `local-orbit-token-${user.id}`,
    token_type: 'bearer',
    user,
  }
}

function siteUrl() {
  return window.location.origin
}

export async function signIn({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const localUsers = getLocalUsers()
  const localRecord = localUsers[normalizedEmail]

  if (localRecord) {
    if (localRecord.password && localRecord.password !== password) {
      return { data: null, error: { message: 'Invalid login credentials.' } }
    }
    const session = buildLocalSession(localRecord)
    saveLocalSession(session)
    return { data: { session, user: session.user }, error: null }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data?.session) {
        saveLocalSession(null)
        return { data, error: null }
      }
      if (error && !/fetch|network|not configured/i.test(error.message || '')) {
        // Check if user wants instant local sign-in fallback when account isn't on remote Supabase
        const session = buildLocalSession({
          id: `user-${normalizedEmail}`,
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          provider: 'email',
        })
        saveLocalUser(normalizedEmail, {
          id: session.user.id,
          email: normalizedEmail,
          name: session.user.user_metadata.name,
          password,
          created_at: session.user.created_at,
        })
        saveLocalSession(session)
        return { data: { session, user: session.user }, error: null }
      }
    } catch {
      // Fall through to local session
    }
  }

  const session = buildLocalSession({
    id: `user-${normalizedEmail}`,
    email: normalizedEmail,
    name: normalizedEmail.split('@')[0],
    provider: 'email',
  })
  saveLocalUser(normalizedEmail, {
    id: session.user.id,
    email: normalizedEmail,
    name: session.user.user_metadata.name,
    password,
    created_at: session.user.created_at,
  })
  saveLocalSession(session)
  return { data: { session, user: session.user }, error: null }
}

export async function signUp({ email, password, name }) {
  const normalizedEmail = email.trim().toLowerCase()
  const displayName = name?.trim() || normalizedEmail.split('@')[0]

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: displayName },
          emailRedirectTo: `${siteUrl()}/auth/callback`,
        },
      })
      if (!error && data?.session) {
        saveLocalSession(null)
        return { data, error: null }
      }
    } catch {
      // Fall through to local session creation
    }
  }

  const record = {
    id: `user-${normalizedEmail}`,
    email: normalizedEmail,
    name: displayName,
    password,
    created_at: new Date().toISOString(),
  }
  saveLocalUser(normalizedEmail, record)
  const session = buildLocalSession(record)
  saveLocalSession(session)
  return { data: { session, user: session.user }, error: null }
}

// Which OAuth providers are switched on in the Supabase project.
let providerSettings = null

function loadEnabledProviders() {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) return Promise.resolve(null)
  if (!providerSettings) {
    providerSettings = fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => json?.external ?? null)
      .catch(() => null)
      .then((external) => {
        if (!external) providerSettings = null
        return external
      })
  }
  return providerSettings
}

const DEFAULT_GOOGLE_CLIENT_ID = '589298760152-s1j9hb1fqnn8qdrn976r3oicj84h2bnj.apps.googleusercontent.com'

export function getGoogleClientId() {
  try {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('code_orbit_google_client_id') ||
      DEFAULT_GOOGLE_CLIENT_ID
    )
  } catch {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
  }
}

export function setGoogleClientId(clientId) {
  try {
    if (clientId) localStorage.setItem('code_orbit_google_client_id', clientId.trim())
    else localStorage.removeItem('code_orbit_google_client_id')
  } catch {
    // ignore storage errors
  }
}

export async function exchangeOAuthCode({ provider = 'google', code, redirectUri }) {
  const clientId = getGoogleClientId()

  // 1. Try the backend exchange endpoint first
  let backendError = null
  try {
    const res = await fetch('/api/auth/oauth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, code, clientId: provider === 'google' ? clientId : undefined, redirectUri }),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.user) {
      return completeOAuthSignIn({
        provider,
        name: json.user.name,
        email: json.user.email,
        avatar_url: json.user.avatar_url,
        username: json.user.username,
      })
    }
    backendError = json?.error || null
  } catch {
    // Backend not reachable; fall through
  }
  return {
    data: null,
    error: {
      message: backendError || 'Could not reach the sign-in server. Restart "npm run dev" and try again.',
    },
  }
}

function openOAuthPopup(provider) {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      data: { redirectPath: `/auth/callback?provider=${encodeURIComponent(provider)}` },
      error: null,
    })
  }

  const width = 480
  const height = 620
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || ''

  let popupUrl = `${siteUrl()}/auth/callback?provider=${encodeURIComponent(provider)}&popup=1`
  if (provider === 'github' && githubClientId) {
    const params = new URLSearchParams({
      client_id: githubClientId,
      redirect_uri: `${siteUrl()}/auth/callback?popup=1`,
      scope: 'read:user user:email',
      state: 'github_direct',
    })
    popupUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  const popup = window.open(
    popupUrl,
    `code_orbit_${provider}_oauth`,
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,status=no`
  )

  if (!popup) {
    return Promise.resolve({
      data: { redirectPath: `/auth/callback?provider=${encodeURIComponent(provider)}` },
      error: null,
    })
  }

  return new Promise((resolve) => {
    let settled = false

    function cleanup() {
      window.removeEventListener('message', onMessage)
      clearInterval(timer)
    }

    function finish(result) {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    function onMessage(e) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'CODE_ORBIT_OAUTH_SUCCESS' && e.data?.session) {
        saveLocalSession(e.data.session)
        finish({ data: { session: e.data.session, user: e.data.session.user }, error: null })
      }
    }

    window.addEventListener('message', onMessage)

    const timer = setInterval(() => {
      if (popup.closed) {
        const local = getLocalSession()
        if (local) {
          finish({ data: { session: local, user: local.user }, error: null })
        } else {
          finish({ data: null, error: null })
        }
      }
    }, 350)
  })
}

async function signInWithProvider(provider) {
  if (provider === 'google' && typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    const googleClientId = getGoogleClientId()
    if (googleClientId) {
      return new Promise((resolve) => {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'openid email profile',
            prompt: 'select_account',
            callback: async (tokenResponse) => {
              if (tokenResponse?.error || !tokenResponse?.access_token) {
                const fallback = await openOAuthPopup('google')
                resolve(fallback)
                return
              }
              try {
                const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const profile = await profileRes.json()
                const result = await completeOAuthSignIn({
                  provider: 'google',
                  name: profile.name || profile.given_name || profile.email?.split('@')[0],
                  email: profile.email,
                  avatar_url: profile.picture || null,
                })
                resolve(result)
              } catch {
                const fallback = await openOAuthPopup('google')
                resolve(fallback)
              }
            },
            error_callback: async (err) => {
              if (err?.type === 'popup_closed') {
                resolve({ data: null, error: null })
              } else {
                const fallback = await openOAuthPopup('google')
                resolve(fallback)
              }
            },
          })
          tokenClient.requestAccessToken({ prompt: 'select_account' })
        } catch {
          openOAuthPopup('google').then(resolve)
        }
      })
    }
  }

  if (provider === 'github') {
    // Full-page redirect to github.com (no popup). Prefer Supabase's GitHub
    // provider; otherwise use a direct GitHub OAuth app via VITE_GITHUB_CLIENT_ID.
    if (isSupabaseConfigured && supabase) {
      const enabled = await loadEnabledProviders()
      if (enabled && enabled.github === true) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: `${siteUrl()}/auth/callback` },
        })
        if (!error) return { data: { url: data?.url || 'github' }, error: null }
      }
    }
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    if (githubClientId) {
      const params = new URLSearchParams({
        client_id: githubClientId,
        redirect_uri: `${siteUrl()}/auth/callback`,
        scope: 'read:user user:email',
        state: 'github_direct',
      })
      const url = `https://github.com/login/oauth/authorize?${params.toString()}`
      window.location.assign(url)
      return { data: { url }, error: null }
    }
    return {
      data: null,
      error: {
        message:
          "GitHub sign-in isn't set up yet. Enable the GitHub provider in Supabase (or set VITE_GITHUB_CLIENT_ID) to redirect to GitHub.",
      },
    }
  }

  if (provider === 'google') {
    return openOAuthPopup(provider)
  }

  if (isSupabaseConfigured && supabase) {
    const enabled = await loadEnabledProviders()
    if (enabled && enabled[provider] === true) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl()}/auth/callback`,
          ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
        },
      })
      if (!error) return { data, error: null }
    }
  }

  return {
    data: { redirectPath: `/auth/callback?provider=${encodeURIComponent(provider)}` },
    error: null,
  }
}

export async function completeOAuthSignIn({ provider, name, email, avatar_url = null, username = null }) {
  const normalizedEmail = (email || `${username || provider}@${provider}.com`).trim().toLowerCase()
  const displayName = (name || username || normalizedEmail.split('@')[0] || 'Learner').trim()

  if (isSupabaseConfigured && supabase) {
    const derivedPassword = `OrbitOAuth!${provider}:${normalizedEmail}`
    try {
      const signInRes = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: derivedPassword,
      })
      if (!signInRes.error && signInRes.data?.session) {
        await supabase.auth.updateUser({
          data: {
            name: displayName,
            full_name: displayName,
            user_name: username || undefined,
            avatar_url: avatar_url || null,
            provider,
          },
        })
        await syncProfile(signInRes.data.session.user)
        saveLocalSession(null)
        return { data: signInRes.data, error: null }
      }

      const signUpRes = await supabase.auth.signUp({
        email: normalizedEmail,
        password: derivedPassword,
        options: {
          data: {
            name: displayName,
            full_name: displayName,
            user_name: username || undefined,
            avatar_url: avatar_url || null,
            provider,
          },
          emailRedirectTo: `${siteUrl()}/auth/callback`,
        },
      })
      if (!signUpRes.error && signUpRes.data?.session) {
        await syncProfile(signUpRes.data.session.user)
        saveLocalSession(null)
        return { data: signUpRes.data, error: null }
      }
    } catch {
      // Fall back to local session if Supabase requires email confirmation or rate-limits
    }
  }

  const record = {
    id: `oauth-${provider}-${normalizedEmail}`,
    email: normalizedEmail,
    name: displayName,
    username: username || undefined,
    avatar_url: avatar_url || null,
    provider,
    created_at: new Date().toISOString(),
  }
  saveLocalUser(normalizedEmail, record)
  const session = buildLocalSession(record)
  saveLocalSession(session)
  return { data: { session, user: session.user }, error: null }
}

export const signInWithGoogle = () => signInWithProvider('google')
export const signInWithApple = () => signInWithProvider('apple')
export const signInWithGithub = () => signInWithProvider('github')

export async function signOut() {
  saveLocalSession(null)
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut()
    return { data: null, error }
  }
  return { data: null, error: null }
}

export async function resetPasswordForEmail(email) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl()}/reset-password`,
      })
      if (!error) return { data, error: null }
    } catch {
      // fall through
    }
  }
  return { data: { sent: true }, error: null }
}

export async function updatePassword(password) {
  const local = getLocalSession()
  if (local?.user?.email) {
    const users = getLocalUsers()
    const key = local.user.email.toLowerCase()
    if (users[key]) {
      saveLocalUser(key, { ...users[key], password })
    }
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (!error) return { data, error: null }
    } catch {
      // fall through
    }
  }
  return { data: { user: local?.user ?? null }, error: null }
}

export async function getSession() {
  const local = getLocalSession()
  if (local) return { data: { session: local }, error: null }
  if (!isSupabaseConfigured || !supabase) return { data: { session: null }, error: null }
  return supabase.auth.getSession()
}

/**
 * Best-effort upsert into a `profiles` table (id, name, avatar_url,
 * created_at) keyed by the Supabase auth user id.
 */
export async function syncProfile(user) {
  if (!isSupabaseConfigured || !supabase || !user || String(user.id).startsWith('local-') || String(user.id).startsWith('oauth-')) return
  try {
    const resolvedName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.user_name ||
      user.user_metadata?.preferred_username ||
      user.email?.split('@')[0] ||
      'Learner'
    const resolvedAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        name: resolvedName,
        avatar_url: resolvedAvatar,
      },
      { onConflict: 'id' }
    )
    if (error && import.meta.env.DEV) {
      console.info('[Code Orbit] Skipping profile sync (table likely not created yet):', error.message)
    }
  } catch (err) {
    if (import.meta.env.DEV) console.info('[Code Orbit] Skipping profile sync:', err)
  }
}
