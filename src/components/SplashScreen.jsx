import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import OrbitMark from './OrbitMark'

const SPLASH_KEY = 'codeorbit:splash-shown'

/**
 * A brief, branded intro — the same instinct behind Apple/Microsoft product
 * splash moments — shown exactly once per browser session (sessionStorage,
 * not localStorage, so it's back the next time someone actually opens the
 * app fresh). Skipped entirely for `prefers-reduced-motion` and for anyone
 * who already saw it this session, so it never becomes a tax on repeat
 * navigation. Purely additive: it renders nothing (null) once past its
 * one moment, and never blocks the app underneath from mounting.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let alreadyShown = true
    try {
      alreadyShown = sessionStorage.getItem(SPLASH_KEY) === '1'
    } catch {
      /* storage unavailable — treat as already shown, fail quiet not loud */
    }
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (alreadyShown || prefersReduced) return

    setVisible(true)
    try {
      sessionStorage.setItem(SPLASH_KEY, '1')
    } catch {
      /* ignore */
    }
    const timer = setTimeout(() => setVisible(false), 950)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-surface"
        >
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-slate-900 dark:text-white">
              <OrbitMark size={42} spin />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Code Orbit
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
