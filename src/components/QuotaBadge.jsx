import { Zap } from 'lucide-react'
import { useQuota } from '../hooks/useQuota'

/** Small "AI lessons left today" pill. Renders nothing until the backend has reported a quota. */
export default function QuotaBadge({ scope = 'generate', label = 'AI lessons left today', className = '' }) {
  const quota = useQuota()[scope]
  if (!quota) return null

  const low = quota.remaining <= 1
  return (
    <span
      title="Resets at midnight UTC. Cached lessons and the interactive labs never use your quota."
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        low
          ? 'border-signal/40 bg-signal/10 text-signal'
          : 'border-slate-200 text-slate-500 dark:border-surface-border dark:text-slate-400'
      } ${className}`}
    >
      <Zap size={11} />
      {label}: {quota.remaining}/{quota.limit}
    </span>
  )
}
