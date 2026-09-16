import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ---------------------------------------------------------------------------
// authService.js — the ONLY place the rest of the app talks to Supabase Auth.
// Every function returns a consistent { data, error } shape (error is either
// a real Supabase AuthError or a local NOT_CONFIGURED error) so UI components
// never need to know whether Supabase is actually set up.
// ---------------------------------------------------------------------------

const NOT_CONFIGURED_ERROR = {
  message: 'Authentication is not configured yet. Ask the site owner to set up Supabase — see AUTH_SETUP.md.',
  code: 'NOT_CONFIGURED',
}

function guard() {
  if (!isSupabaseConfigured) return { data: null, error: NOT_CONFIGURED_ERROR }
  return null
}

function siteUrl() {
  return window.location.origin
}

export async function signIn({ email, password }) {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp({ email, password, name }) {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signInWithGoogle() {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  })
  return { data, error }
}

export async function signInWithApple() {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  })
  return { data, error }
}

// Optional per the spec — same architecture as Google/Apple.
export async function signInWithGithub() {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  })
  return { data, error }
}

export async function signOut() {
  const blocked = guard()
  if (blocked) return blocked
  const { error } = await supabase.auth.signOut()
  return { data: null, error }
}

export async function resetPasswordForEmail(email) {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/reset-password`,
  })
  return { data, error }
}

export async function updatePassword(password) {
  const blocked = guard()
  if (blocked) return blocked
  const { data, error } = await supabase.auth.updateUser({ password })
  return { data, error }
}

export async function getSession() {
  if (!isSupabaseConfigured) return { data: { session: null }, error: null }
  return supabase.auth.getSession()
}

/**
 * Best-effort upsert into a `profiles` table (id, name, avatar_url,
 * created_at) keyed by the Supabase auth user id. Never blocks or throws —
 * if the table doesn't exist yet (the developer hasn't run the SQL in
 * AUTH_SETUP.md), this quietly no-ops with a console note instead of
 * breaking sign-in/sign-up.
 */
export async function syncProfile(user) {
  if (!isSupabaseConfigured || !supabase || !user) return
  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
        avatar_url: user.user_metadata?.avatar_url || null,
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
