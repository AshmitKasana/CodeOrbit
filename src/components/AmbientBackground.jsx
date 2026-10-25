import { useEffect, useRef } from 'react'

/**
 * Living background for the homepage: a field of softly drifting particles
 * that link up into constellations when they pass near each other, the
 * pointer gently pulls/pushes nearby particles, and a few slow gradient
 * "nebula" blobs float underneath. Purely decorative (aria-hidden,
 * pointer-events-none), pauses when the tab is hidden, scales particle count
 * with area, and is skipped entirely for prefers-reduced-motion users.
 */
export default function AmbientBackground({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let particles = []
    let raf = 0
    let running = true
    const pointer = { x: -9999, y: -9999 }
    const LINK_DIST = 120

    const isDark = () => document.documentElement.classList.contains('dark')

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(70, Math.max(24, Math.floor((width * height) / 45000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
        tw: Math.random() * Math.PI * 2,
        signal: Math.random() < 0.12,
      }))
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
    }
    function onLeave() {
      pointer.x = -9999
      pointer.y = -9999
    }

    function frame(t) {
      if (!running) return
      ctx.clearRect(0, 0, width, height)
      const dark = isDark()
      const base = dark ? '255,255,255' : '15,23,42'
      const signal = '91,127,255'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = p.x - pointer.x
        const dy = p.y - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < 160 * 160) {
          const d = Math.sqrt(d2) || 1
          const force = (1 - d / 160) * 0.35
          p.vx += (dx / d) * force * 0.05
          p.vy += (dy / d) * force * 0.05
        }

        p.vx *= 0.995
        p.vy *= 0.995
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = width + 10
        else if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        else if (p.y > height + 10) p.y = -10

        const twinkle = 0.5 + 0.5 * Math.sin(t / 900 + p.tw)
        const alpha = (dark ? 0.25 : 0.2) + twinkle * (dark ? 0.45 : 0.3)
        ctx.beginPath()
        ctx.fillStyle = `rgba(${p.signal ? signal : base},${alpha})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const lx = p.x - q.x
          const ly = p.y - q.y
          const dist2 = lx * lx + ly * ly
          if (dist2 < LINK_DIST * LINK_DIST) {
            const a = (1 - Math.sqrt(dist2) / LINK_DIST) * (dark ? 0.16 : 0.12)
            ctx.strokeStyle = `rgba(${p.signal || q.signal ? signal : base},${a})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(frame)
    }

    function onVisibility() {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Slow-floating nebula glows */}
      <div className="ambient-blob absolute -left-32 top-[8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(91,127,255,0.12),transparent_70%)] blur-3xl" />
      <div className="ambient-blob-slow absolute -right-40 top-[50%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.08),transparent_70%)] blur-3xl" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
