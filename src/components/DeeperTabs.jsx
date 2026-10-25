import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Collapses the reference-style parts of a lesson (syntax, memory, language
 * comparison, mistakes, interview, practice) into one tabbed panel, so the
 * main lesson reads as a short, focused story instead of a long scroll.
 * `tabs` = [{ id, label, content }] — tabs with no content are skipped.
 */
export default function DeeperTabs({ tabs = [] }) {
  const available = tabs.filter((t) => t.content)
  const [active, setActive] = useState(available[0]?.id)
  if (available.length === 0) return null

  const current = available.find((t) => t.id === active) || available[0]

  return (
    <div>
      <div role="tablist" aria-label="Go deeper" className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 px-1 dark:border-surface-border">
        {available.map((t) => {
          const selected = t.id === current.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(t.id)}
              className={`relative shrink-0 whitespace-nowrap px-3.5 pb-3 pt-1 text-sm font-medium transition-colors ${
                selected ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
              {selected && (
                <motion.span
                  layoutId="deeper-tab-underline"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-signal"
                />
              )}
            </button>
          )
        })}
      </div>
      <motion.div key={current.id} role="tabpanel" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {current.content}
      </motion.div>
    </div>
  )
}
