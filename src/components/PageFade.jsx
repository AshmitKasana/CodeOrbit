import { motion } from 'framer-motion'

/**
 * Per-route entrance animation. Deliberately simple (opacity + y only, no
 * exit choreography / AnimatePresence route-keying) so every route gets a
 * smooth transition without the fragility of juggling exit animations
 * against React Router's own navigation. Framer Motion's own
 * prefers-reduced-motion handling (via <MotionConfig reducedMotion="user">
 * in main.jsx) takes care of skipping this for users who've asked for less
 * motion.
 */
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1]

export default function PageFade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}
