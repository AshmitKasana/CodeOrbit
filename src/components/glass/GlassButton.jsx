import { motion } from 'framer-motion'

/**
 * A glass-surfaced button for floating/secondary actions that sit on top of
 * translucent chrome (navbar, modals, command palette). Primary calls to
 * action elsewhere in the app should keep using `.btn-primary` (solid,
 * high-contrast) — glass is for chrome, not for the thing you most want
 * someone to click.
 */
export default function GlassButton({ className = '', children, ...rest }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`glass-surface glass-interactive inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/60 dark:text-slate-100 dark:disabled:hover:bg-white/[0.06] ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
