import { ArrowUpRight, Github } from 'lucide-react'
import OrbitMark from './OrbitMark'
import GlassCard from './glass/GlassCard'

/**
 * The one place in the UI where the signal accent is allowed to be bright —
 * a small illuminated glass card crediting Code Orbit's creator.
 */
export default function CreatorCard({ className = '' }) {
  return (
    <a
      href="https://github.com/AshmitKasana"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ashmit Kasana — Owner & Creator on GitHub"
      className={`group block ${className}`}
    >
      <GlassCard hover className="signal-border-glow flex items-center justify-between gap-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/10 text-signal">
            <OrbitMark size={22} spin />
          </span>
          <div className="text-left">
            <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">Ashmit Kasana</p>
            <p className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-signal">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulseSoft rounded-full bg-signal" aria-hidden="true" />
              Owner &amp; Creator
            </p>
          </div>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-500 transition group-hover:border-signal/40 group-hover:text-signal dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          <Github size={16} />
        </span>
      </GlassCard>
    </a>
  )
}
