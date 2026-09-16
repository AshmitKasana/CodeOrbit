import { motion } from 'framer-motion'
import { Check, Skull } from 'lucide-react'
import { LOADING_STAGES } from '../services/aiService'

export default function LoadingState({ stageIndex = 0 }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* orbiting ring with a single traveling dot */}
          <span className="orbit-ring absolute inset-0 animate-orbitSpinSlow">
            <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-white" />
          </span>
          <motion.div
            animate={{ y: [0, -6, 0], opacity: [1, 0.6, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-surface-border dark:bg-surface-card dark:text-slate-200"
          >
            <Skull size={26} />
          </motion.div>
        </div>

        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 font-medium text-slate-800 dark:text-slate-100"
        >
          {LOADING_STAGES[stageIndex] || LOADING_STAGES[0]}
        </motion.p>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LOADING_STAGES.map((stage, i) => (
            <li key={stage} className="flex items-center gap-1.5 text-xs">
              {i < stageIndex ? (
                <Check size={12} className="text-slate-900 dark:text-white" />
              ) : i === stageIndex ? (
                <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-slate-900 dark:bg-white" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full border border-slate-300 dark:border-surface-border" />
              )}
              <span className={i <= stageIndex ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}>
                {stage}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 space-y-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
            className="card space-y-2 p-5"
          >
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
