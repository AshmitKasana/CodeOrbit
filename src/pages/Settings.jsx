import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Check, CreditCard, Loader2, Mail, Send, Settings as SettingsIcon, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { openBillingPortal } from '../services/billingService'
import Reveal from '../components/Reveal'

export default function Settings() {
  const { user, resetPasswordForEmail } = useAuth()
  const { isPro, loading: subLoading } = useSubscription()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState(null)

  async function handleManageBilling() {
    setPortalLoading(true)
    setPortalError(null)
    const { error } = await openBillingPortal()
    if (error) {
      setPortalError(error.message)
      setPortalLoading(false)
    }
    // On success, openBillingPortal redirects the whole page to Stripe.
  }

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
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Plan &amp; billing</p>
          {subLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={13} className="animate-spin" /> Checking your plan...
            </div>
          ) : isPro ? (
            <>
              <p className="mb-3 flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
                <Sparkles size={14} className="text-signal" /> You&apos;re on the <strong>Pro</strong> plan.
              </p>
              <button onClick={handleManageBilling} disabled={portalLoading} className="btn-secondary">
                {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                {portalLoading ? 'Opening...' : 'Manage Billing'}
              </button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                You&apos;re on the <strong className="text-slate-700 dark:text-slate-200">Free</strong> plan.
              </p>
              <Link to="/pricing" className="btn-primary">
                <Sparkles size={14} /> Upgrade to Pro
              </Link>
            </>
          )}
          {portalError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle size={12} /> {portalError}
            </p>
          )}
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
