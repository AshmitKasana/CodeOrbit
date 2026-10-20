import { motion } from 'framer-motion'
import { EXPLANATION_LEVELS } from '../utils/constants'

export default function LevelSelector({ level, onChange }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-surface-border dark:bg-white/[0.03]">
      <div className="flex w-max gap-0.5">
        {EXPLANATION_LEVELS.map((l) => {
          const active = level === l
          return (
            <button
              key={l}
              onClick={() => onChange(l)}
              className={`relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 active:scale-[0.97] ${
                active
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="level-selector-pill"
                  transition={{ type: 'spring', stiffness: 600, damping: 38, mass: 0.5 }}
                  className="pointer-events-none absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-surface-card"
                />
              )}
              <span className="relative z-10">{l}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
