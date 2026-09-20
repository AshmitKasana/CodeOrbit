import { Link } from 'react-router-dom'
import { BarChart3, Play, UserPlus, Zap } from 'lucide-react'
import { formatResetIn } from '../services/quotaStore'

/**
 * Shown in place of a generation result once the day's AI quota is used up.
 * Deliberately not an error state — this is the app working as designed, so
 * it gets its own tone and points at things that don't need the AI at all.
 */
export default function LimitReached({ quota, signedIn }) {
  const resetIn = quota?.resetsAt ? formatResetIn(quota.resetsAt) : ''

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-signal/30 bg-signal/10 text-signal">
        <Zap size={24} />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold text-slate-900 dark:text-white">
        {quota?.limit ? `You've used today's ${quota.limit} AI lessons.` : "You've reached today's AI limit."}
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {resetIn ? `Your quota resets in ${resetIn}. ` : 'Your quota resets at midnight UTC. '}
        {signedIn
          ? 'Lessons you have already opened stay available, and the interactive labs never use your quota.'
          : 'Signed-in learners get a higher daily limit — and the interactive labs never use any quota.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/visualizer" className="btn-primary">
          <Play size={15} /> Try the Algorithm Visualizer
        </Link>
        <Link to="/complexity" className="btn-secondary">
          <BarChart3 size={15} /> Big-O Explorer
        </Link>
        {!signedIn && (
          <Link to="/signup" className="btn-secondary">
            <UserPlus size={15} /> Create a free account
          </Link>
        )}
      </div>
    </div>
  )
}
