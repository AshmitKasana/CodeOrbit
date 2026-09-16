import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import OrbitMark from '../components/OrbitMark'

/**
 * Landing point for every OAuth redirect (Google, Apple, GitHub). The
 * Supabase client already exchanges the URL's auth code/tokens for a session
 * on load (detectSessionInUrl: true) — this page just waits for that to
 * resolve, then routes to the dashboard, showing a clear error instead of a
 * silent redirect if it fails.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Authentication is not configured yet. See AUTH_SETUP.md.')
      return
    }

    let cancelled = false

    async function resolve() {
      // Give the Supabase client a brief moment to parse the callback URL.
      const { data, error } = await supabase.auth.getSession()
      if (cancelled) return
      if (error || !data.session) {
        setError(error?.message || 'We could not complete sign-in. Please try again.')
        return
      }
      navigate('/dashboard', { replace: true })
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 text-red-500">
            <AlertCircle size={24} />
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <a href="/login" className="btn-secondary mt-5">
            Back to Login
          </a>
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
