import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Loader2, Sparkles } from 'lucide-react'
import Reveal from '../components/Reveal'
import { PRICING_PLANS } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { startCheckout } from '../services/billingService'
import { isStripeConfigured } from '../lib/stripe'

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPro } = useSubscription()
  const [cycle, setCycle] = useState('monthly') // monthly | yearly
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError] = useState(null)

  async function handleUpgrade(plan) {
    if (plan.id === 'free') return
    if (!user) {
      navigate('/signup', { state: { from: { pathname: '/pricing' } } })
      return
    }
    setError(null)
    setLoadingPlan(plan.id)
    const { error } = await startCheckout(plan.priceId[cycle])
    if (error) {
      setError(error.message)
      setLoadingPlan(null)
    }
    // On success, startCheckout redirects the whole page to Stripe — nothing
    // further to do here.
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pricing</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Simple pricing. Serious prep.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
          Start free. Upgrade whenever the daily limit starts feeling small.
        </p>

        <div className="mx-auto mt-6 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-surface-border dark:bg-white/[0.03]">
          {['monthly', 'yearly'].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                cycle === c
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-surface-card dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {c} {c === 'yearly' && <span className="ml-1 text-xs text-signal">save ~27%</span>}
            </button>
          ))}
        </div>
      </Reveal>

      {!isStripeConfigured && (
        <div className="mx-auto mb-8 flex max-w-lg items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>
            Payments aren&apos;t configured on this deployment yet — the plans below are for preview. See{' '}
            <code className="font-mono">BILLING_SETUP.md</code>.
          </span>
        </div>
      )}

      {error && (
        <div className="mx-auto mb-8 flex max-w-lg items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Reveal stagger={0.08} className="grid gap-6 sm:grid-cols-2">
        {PRICING_PLANS.map((plan) => {
          const price = plan.price[cycle]
          const isCurrent = (plan.id === 'pro' && isPro) || (plan.id === 'free' && !isPro)
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl border p-7 ${
                plan.highlight
                  ? 'border-signal/40 bg-signal/[0.03] shadow-signal'
                  : 'border-slate-200 bg-white dark:border-surface-border dark:bg-surface-card'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-signal px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles size={11} /> Most popular
                </span>
              )}

              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">${price}</span>
                <span className="text-sm text-slate-400">
                  {price > 0 ? `/ ${cycle === 'monthly' ? 'mo' : 'yr'}` : 'forever'}
                </span>
              </div>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check size={15} className="mt-0.5 shrink-0 text-signal" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrent || loadingPlan === plan.id || (plan.id === 'free' && Boolean(user))}
                className={`mt-7 w-full ${plan.highlight ? 'btn-primary' : 'btn-secondary'} disabled:opacity-60`}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : isCurrent ? (
                  'Current Plan'
                ) : plan.id === 'free' ? (
                  'Get Started Free'
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            </motion.div>
          )
        })}
      </Reveal>

      <Reveal className="mx-auto mt-16 max-w-2xl">
        <h2 className="mb-4 text-center font-display text-xl font-semibold text-slate-900 dark:text-white">
          Frequently asked
        </h2>
        <div className="space-y-4">
          <FaqItem q="Can I cancel anytime?" a="Yes — manage or cancel your subscription anytime from Settings. You keep Pro access until the end of your current billing period." />
          <FaqItem q="What happens when I hit the free daily limit?" a="You'll see an upgrade prompt instead of a generated explanation. Your quota resets every day at midnight, no matter what." />
          <FaqItem q="Do you store my card details?" a="No — Code Orbit never sees or stores your card. Checkout and billing are handled entirely by Stripe." />
        </div>
      </Reveal>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <div className="card p-5">
      <p className="font-medium text-slate-900 dark:text-white">{q}</p>
      <p className="prose-dsa mt-1.5 text-sm">{a}</p>
    </div>
  )
}
