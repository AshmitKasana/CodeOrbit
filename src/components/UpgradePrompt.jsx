import { Link } from 'react-router-dom'
import { Sparkles, Zap } from 'lucide-react'
import { FREE_DAILY_GENERATION_LIMIT } from '../utils/constants'

/**
 * Shown in place of a generation result once the free-tier daily quota is
 * used up. Deliberately not an error state — this is Code Orbit working
 * exactly as designed, so it gets its own tone (no red, no "something went
 * wrong") and a clear path forward.
 */
export default function UpgradePrompt({ isSignedIn }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-signal/30 bg-signal/10 text-signal">
        <Zap size={24} />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold text-slate-900 dark:text-white">
        You've used today's {FREE_DAILY_GENERATION_LIMIT} free explanations.
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Your quota resets at midnight — or upgrade to Pro for unlimited AI-generated explanations, right now.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/pricing" className="btn-primary">
          <Sparkles size={15} /> Upgrade to Pro
        </Link>
        {!isSignedIn && (
          <Link to="/signup" className="btn-secondary">
            Create a free account
          </Link>
        )}
      </div>
    </div>
  )
}
