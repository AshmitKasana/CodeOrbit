import { motion } from 'framer-motion'
import OrbitMark from './OrbitMark'

function OrbitalVisual({ compact = false }) {
  const size = compact ? 160 : 340
  return (
    <div className={`relative flex items-center justify-center ${compact ? 'h-40' : 'h-full'}`} aria-hidden="true">
      <span
        className="orbit-ring absolute animate-orbitSpinSlow opacity-70"
        style={{ width: size, height: size }}
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-signal shadow-signal" />
      </span>
      <span
        className="orbit-ring absolute opacity-40"
        style={{ width: size * 0.68, height: size * 0.68, animation: 'orbitSpin 18s linear infinite reverse' }}
      >
        <span className="absolute left-full top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-400 dark:bg-slate-500" />
      </span>
      <div className="dot-grid absolute inset-0 -z-10 rounded-full [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-surface-border dark:bg-surface-card dark:text-slate-100">
        <OrbitMark size={28} />
      </span>
    </div>
  )
}

/**
 * Shared split layout for the auth pages: an animated orbital visual on the
 * left (desktop) / compact above the form (mobile), and a Liquid Glass card
 * on the right holding the actual form content.
 */
export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:py-16">
      <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="hidden lg:block">
          <OrbitalVisual />
        </div>
        <div className="block lg:hidden">
          <OrbitalVisual compact />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="glass-panel mx-auto w-full max-w-md p-7 sm:p-9"
        >
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-signal">{eyebrow}</p>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}

          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
        </motion.div>
      </div>
    </div>
  )
}
