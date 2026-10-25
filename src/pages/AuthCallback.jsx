import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ChevronRight, ExternalLink, Github, LoaderCircle, Mail, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import * as authService from '../services/authService'
import OrbitMark from '../components/OrbitMark'
import FormField from '../components/FormField'

function GoogleGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9087c1.7018-1.5668 2.6836-3.8749 2.6836-6.6151Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3427 0-4.3282-1.5818-5.0364-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18Z" />
      <path fill="#FBBC05" d="M3.9636 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9636 10.71Z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6718 5.1618 6.6573 3.5795 9 3.5795Z" />
    </svg>
  )
}

function formatNameFromHandle(raw = '') {
  const base = raw.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return ''
  return base.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const provider = searchParams.get('provider')
  const isPopup = searchParams.get('popup') === '1' || (typeof window !== 'undefined' && Boolean(window.opener))
  const from = location.state?.from || '/dashboard'

  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [suggestedGithubAccount, setSuggestedGithubAccount] = useState(null)

  function finishSignIn(session) {
    if (isPopup && typeof window !== 'undefined' && window.opener) {
      try {
        window.opener.postMessage({ type: 'CODE_ORBIT_OAUTH_SUCCESS', session }, window.location.origin)
      } catch {
        // ignore cross-origin opener errors
      }
      window.close()
      return
    }
    navigate(from, { replace: true })
  }

  useEffect(() => {
    if (provider !== 'github') return
    let active = true
    fetch('https://api.github.com/users/AshmitKasana')
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!active || !user?.login) return
        setSuggestedGithubAccount({
          login: user.login,
          name: user.name || user.login,
          email: user.email || `${user.login.toLowerCase()}@users.noreply.github.com`,
          avatar_url: user.avatar_url || null,
        })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [provider])

  useEffect(() => {
    if (provider) return

    let cancelled = false
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    async function resolve() {
      if (code && (state === 'google_direct' || state === 'github_direct')) {
        const directProvider = state === 'github_direct' ? 'github' : 'google'
        try {
          const { data, error: exchangeError } = await authService.exchangeOAuthCode({
            provider: directProvider,
            code,
            redirectUri: `${window.location.origin}/auth/callback${searchParams.get('popup') === '1' ? '?popup=1' : ''}`,
          })
          if (cancelled) return
          if (exchangeError || !data?.session) {
            setError(exchangeError?.message || 'Could not complete OAuth token exchange.')
            return
          }
          finishSignIn(data.session)
          return
        } catch {
          if (!cancelled) setError('Could not complete OAuth sign-in. Please try again.')
          return
        }
      }

      if (code && supabase) {
        try {
          await supabase.auth.exchangeCodeForSession(code)
        } catch {
          // detectSessionInUrl may have already exchanged the code
        }
      }

      const { data, error } = await authService.getSession()
      if (cancelled) return
      if (error || !data?.session) {
        setError(error?.message || 'We could not complete sign-in. Please try again.')
        return
      }
      if (data.session.user) {
        await authService.syncProfile(data.session.user)
      }
      finishSignIn(data.session)
    }

    resolve()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, provider, searchParams])

  function handleIdentifierChange(e) {
    const val = e.target.value
    setIdentifier(val)
    if (!nameTouched) {
      setName(formatNameFromHandle(val))
    }
  }

  async function handleQuickGithubSelect(account) {
    setError(null)
    setSubmitting(true)
    try {
      const { data } = await authService.completeOAuthSignIn({
        provider: 'github',
        name: account.name || account.login,
        email: account.email,
        avatar_url: account.avatar_url,
        username: account.login,
      })
      finishSignIn(data?.session)
    } catch {
      setError('Could not complete GitHub sign-in. Please try again.')
      setSubmitting(false)
    }
  }

  async function handleProviderSubmit(e) {
    e.preventDefault()
    setError(null)
    const trimmedId = identifier.trim()
    const trimmedName = name.trim()

    if (!trimmedId) {
      setError(
        provider === 'github'
          ? 'Please enter your GitHub username or email address.'
          : 'Please enter your Google email address.'
      )
      return
    }

    setSubmitting(true)
    try {
      let resolvedName = trimmedName || formatNameFromHandle(trimmedId) || 'Learner'
      let resolvedEmail = trimmedId.includes('@')
        ? trimmedId.toLowerCase()
        : `${trimmedId.toLowerCase()}@${provider === 'github' ? 'users.noreply.github.com' : 'gmail.com'}`
      let resolvedAvatar = null
      let resolvedUsername = null

      if (provider === 'github') {
        const ghHandle = trimmedId.includes('@') ? trimmedId.split('@')[0] : trimmedId
        resolvedUsername = ghHandle
        try {
          const res = await fetch(`https://api.github.com/users/${encodeURIComponent(ghHandle)}`)
          if (res.ok) {
            const ghUser = await res.json()
            resolvedName = trimmedName || ghUser.name || ghUser.login || resolvedName
            if (ghUser.email) resolvedEmail = ghUser.email
            if (ghUser.avatar_url) resolvedAvatar = ghUser.avatar_url
            if (ghUser.login) resolvedUsername = ghUser.login
          }
        } catch {
          // Ignore network errors and proceed with entered name/handle
        }
      }

      const { data } = await authService.completeOAuthSignIn({
        provider,
        name: resolvedName,
        email: resolvedEmail,
        avatar_url: resolvedAvatar,
        username: resolvedUsername,
      })

      finishSignIn(data?.session)
    } catch {
      setError('Something went wrong creating your Code Orbit account. Please try again.')
      setSubmitting(false)
    }
  }

  if (provider === 'google' || provider === 'github') {
    const isGithub = provider === 'github'
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="glass-surface glass-highlight rounded-2xl bg-white/85 p-6 dark:bg-[#111113]/85 sm:p-7"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-surface-border dark:bg-white/[0.04]">
              {isGithub ? <Github size={22} className="text-slate-900 dark:text-white" /> : <GoogleGlyph />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isGithub ? 'Sign in with GitHub' : 'Sign in with Google'}
              </p>
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Choose an account to continue to Code Orbit
              </h1>
            </div>
          </div>

          {isGithub && suggestedGithubAccount && (
            <div className="mb-5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickGithubSelect(suggestedGithubAccount)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white/60 p-3 text-left transition hover:border-slate-400 hover:bg-white dark:border-surface-border dark:bg-white/[0.03] dark:hover:border-white/30 dark:hover:bg-white/[0.06]"
              >
                {suggestedGithubAccount.avatar_url ? (
                  <img
                    src={suggestedGithubAccount.avatar_url}
                    alt={suggestedGithubAccount.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-fg">
                    <Github size={18} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {suggestedGithubAccount.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{suggestedGithubAccount.login} · GitHub Account
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-white" />
              </button>

              <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
                <span className="h-px flex-1 bg-slate-200 dark:bg-surface-border" />
                or use another GitHub account
                <span className="h-px flex-1 bg-slate-200 dark:bg-surface-border" />
              </div>
            </div>
          )}

          <form onSubmit={handleProviderSubmit} noValidate className="space-y-3.5">
            <FormField
              icon={isGithub ? Github : Mail}
              type={isGithub ? 'text' : 'email'}
              autoComplete={isGithub ? 'username' : 'email'}
              placeholder={isGithub ? 'GitHub username or email' : 'yourname@gmail.com'}
              value={identifier}
              onChange={handleIdentifierChange}
            />
            <FormField
              icon={User}
              type="text"
              autoComplete="name"
              placeholder="Your account display name"
              value={name}
              onChange={(e) => {
                setNameTouched(true)
                setName(e.target.value)
              }}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/5 px-3 py-2.5 text-xs text-red-500">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : isGithub ? (
                <Github size={16} />
              ) : (
                <GoogleGlyph />
              )}
              {submitting
                ? 'Signing in...'
                : `Continue as ${name.trim() || formatNameFromHandle(identifier) || (isGithub ? 'GitHub User' : 'Google User')}`}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-400 dark:border-surface-border">
            <a
              href={isGithub ? 'https://github.com/login' : 'https://accounts.google.com/signin'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-slate-700 dark:hover:text-slate-200"
            >
              Open {isGithub ? 'github.com' : 'accounts.google.com'} <ExternalLink size={11} />
            </a>
            {isPopup ? (
              <button
                type="button"
                onClick={() => window.close()}
                className="transition hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            ) : (
              <Link to="/login" className="transition hover:text-slate-700 dark:hover:text-slate-200">
                Back to Login
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 text-red-500">
            <AlertCircle size={24} />
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <Link to="/login" className="btn-secondary mt-5">
            Back to Login
          </Link>
        </>
      ) : (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 dark:border-surface-border dark:text-slate-200"
          >
            <OrbitMark size={26} />
          </motion.div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Completing sign-in...</p>
        </>
      )}
    </div>
  )
}
