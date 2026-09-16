import { motion } from 'framer-motion'

/**
 * A glass surface sized/padded for content — used sparingly for a handful of
 * standout cards (creator card, feature spotlight) rather than every card on
 * the site. Most content cards should use the solid `.card` class instead.
 */
export default function GlassCard({ className = '', hover = false, children, ...rest }) {
  const Comp = hover ? motion.div : 'div'
  const hoverProps = hover ? { whileHover: { y: -3 }, transition: { duration: 0.2, ease: 'easeOut' } } : {}
  return (
    <Comp className={`glass-panel p-6 ${hover ? 'glass-interactive' : ''} ${className}`} {...hoverProps} {...rest}>
      {children}
    </Comp>
  )
}
