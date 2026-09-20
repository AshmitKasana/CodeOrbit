import { useState } from 'react'
import { AlertCircle, Check, Mail, Send, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Reveal from '../components/Reveal'

export default function Settings() {
  const { user, resetPasswordForEmail } = useAuth()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState(null)

  async function handlePasswordReset() {
    setStatus('sending')
    setError(null)
    const { error } = await resetPasswordForEmail(user.email)
    if (error) {
      setError(error.message)
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Reveal className="mb-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-surface-border dark:text-slate-300">
            <SettingsIcon size={17} />
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="card space-y-6 p-6 sm:p-8">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Account email</p>
          <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Mail size={14} className="text-slate-400" /> {user?.email}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6 dark:border-surface-border">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Password</p>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Send a password reset link to your email — click it to choose a new password.
          </p>
          <button onClick={handlePasswordReset} disabled={status === 'sending'} className="btn-secondary">
            <Send size={14} /> {status === 'sending' ? 'Sending...' : 'Send Password Reset Email'}
          </button>
          {status === 'sent' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Check size={12} /> Check your email for a reset link.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6 dark:border-surface-border">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">AI lessons</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Code Orbit is free. To keep the AI sustainable, each account gets a daily allowance of AI-generated lessons and follow-up
            questions that resets at midnight UTC. Lessons you have already opened, the Algorithm Visualizer and the Big-O Explorer never
            count against it.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6 dark:border-surface-border">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Appearance</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Toggle dark / light mode anytime from the sun/moon icon in the navbar.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
