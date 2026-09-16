import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Wraps a single child element and shows a small glass tooltip above it on
 * hover/focus. Keep tooltip text short — this is for a one-line hint, not
 * for content.
 */
export default function GlassTooltip({ text, children, side = 'top' }) {
  const [show, setShow] = useState(false)
  if (!text) return children

  const positionClass =
    side === 'bottom'
      ? 'top-[calc(100%+6px)]'
      : 'bottom-[calc(100%+6px)]'

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            transition={{ duration: 0.12 }}
            className={`glass-surface pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-800 dark:bg-[#141416]/90 dark:text-slate-100 ${positionClass}`}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
