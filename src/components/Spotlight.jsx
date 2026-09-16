import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * A soft, cursor-following glow layered behind hero content — the same
 * "spotlight" language used by premium gaming/tech product pages (Razer,
 * NVIDIA) to make a dark surface feel alive without ever moving the actual
 * content. Purely decorative and always `pointer-events-none`, so it never
 * intercepts clicks on real content in front of it — position is tracked via
 * a window-level listener instead of relying on this layer receiving events.
 * Uses the app's reserved `signal` accent, staying consistent with the one
 * place color is allowed to pop (see index.css).
 */
export default function Spotlight({ className = '', size = 480, color = 'rgba(91,127,255,0.16)' }) {
  const ref = useRef(null)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)
  const springX = useSpring(x, { stiffness: 120, damping: 25, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 120, damping: 25, mass: 0.5 })

  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return

    function onMove(e) {
      const rect = parent.getBoundingClientRect()
      const withinX = e.clientX >= rect.left && e.clientX <= rect.right
      const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom
      if (withinX && withinY) {
        x.set(e.clientX - rect.left)
        y.set(e.clientY - rect.top)
      } else {
        x.set(-9999)
        y.set(-9999)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y])

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: size,
          height: size,
          left: springX,
          top: springY,
          x: -size / 2,
          y: -size / 2,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
      />
    </div>
  )
}
