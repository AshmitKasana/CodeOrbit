import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/**
 * A glass-surfaced dropdown trigger + panel. Closes on outside click or
 * Escape. `options` is [{ id, label }]; `onSelect(id)` fires on choice.
 */
export default function GlassDropdown({ label, options, activeId, onSelect, align = 'left', fullWidth = false, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const active = options.find((o) => o.id === activeId)

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'block w-full' : 'inline-block'} ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`glass-surface glass-interactive flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 ${
          fullWidth ? 'w-full justify-between' : ''
        }`}
      >
        {activeId != null ? (label ? `${label}: ${active?.label ?? ''}` : active?.label) : label}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`glass-surface absolute top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl bg-white/90 p-1 dark:bg-[#141416]/90 ${
              fullWidth ? 'w-full' : 'min-w-[10rem]'
            } ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  onSelect(o.id)
                  setOpen(false)
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  o.id === activeId
                    ? 'bg-black/5 font-medium text-slate-900 dark:bg-white/10 dark:text-white'
                    : 'text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
