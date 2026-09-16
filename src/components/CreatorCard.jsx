import OrbitMark from './OrbitMark'
import GlassCard from './glass/GlassCard'

/**
 * The one place in the UI where the signal accent is allowed to be bright —
 * a small illuminated glass card crediting Code Orbit's creator.
 */
export default function CreatorCard({ className = '' }) {
  return (
    <GlassCard className={`signal-border-glow flex items-center gap-4 rounded-2xl ${className}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/10 text-signal">
        <OrbitMark size={22} spin />
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">Ashmit Kasana</p>
        <p className="text-sm font-medium uppercase tracking-wide text-signal">Owner &amp; Creator</p>
      </div>
    </GlassCard>
  )
}
