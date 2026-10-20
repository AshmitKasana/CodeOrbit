import { motion } from 'framer-motion'

/**
 * Scroll-in reveal used across page sections. `whileInView` fires once and
 * never hijacks scroll — it just animates opacity/translateY as content
 * naturally enters the viewport. Pass `stagger` to fade in direct children
 * one after another instead of all at once.
 */
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1]

export default function Reveal({ children, className = '', delay = 0, stagger = 0, as = motion.div, ...rest }) {
  // Accept either a motion component or a plain tag name string (e.g. "section").
  const Tag = typeof as === 'string' ? motion[as] : as

  if (stagger > 0) {
    return (
      <Tag
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -15px 0px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
        {...rest}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -15px 0px' }}
      transition={{ duration: 0.22, ease: EASE_OUT_EXPO, delay }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export const revealItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_OUT_EXPO } },
}
