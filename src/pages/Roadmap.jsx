import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, CircleDashed, Loader2 } from 'lucide-react'
import { ROADMAP } from '../utils/constants'
import { getRoadmapProgress, setRoadmapStatus, slugify } from '../utils/helpers'
import { recordActivity } from '../lib/progress'
import Reveal, { revealItem } from '../components/Reveal'
import { useAuth } from '../hooks/useAuth'

const STATUSES = ['Not Started', 'Learning', 'Completed']
const STATUS_STYLE = {
  'Not Started': 'border-slate-300 text-slate-400 dark:border-surface-border',
  Learning: 'border-slate-500 text-slate-700 dark:border-slate-400 dark:text-slate-200',
  Completed: 'border-slate-900 bg-accent text-accent-fg dark:border-white',
}
const STATUS_ICON = { 'Not Started': CircleDashed, Learning: Loader2, Completed: Check }

export default function Roadmap() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [progress, setProgress] = useState({})

  useEffect(() => setProgress(getRoadmapProgress(user?.id)), [user?.id])

  function cycleStatus(id, current) {
    const next = STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length]
    setRoadmapStatus(id, next, user?.id)
    if (next === 'Completed') recordActivity(user?.id, 'roadmap')
    setProgress((p) => ({ ...p, [id]: next }))
  }

  const completedCount = Object.values(progress).filter((s) => s === 'Completed').length
  const pct = Math.round((completedCount / ROADMAP.length) * 100)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">The Orbit Roadmap</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
          Follow the recommended order to build a complete DSA foundation. Click a topic to learn it; click its badge to update your progress.
        </p>
        <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">{completedCount} / {ROADMAP.length} completed ({pct}%)</p>
      </div>

      <Reveal stagger={0.025} as="ol" className="relative pl-10">
        {/* Continuous vertical timeline rail */}
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-surface-border" />
        {ROADMAP.map((step, i) => {
          const status = progress[step.id] || 'Not Started'
          const Icon = STATUS_ICON[status]
          return (
            <motion.li key={step.id} variants={revealItem} className="relative mb-5 last:mb-0">
              <span
                className={`absolute -left-10 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white transition-colors dark:bg-surface ${
                  status === 'Completed'
                    ? 'border-slate-900 dark:border-white'
                    : status === 'Learning'
                    ? 'border-slate-500 dark:border-slate-400'
                    : 'border-slate-200 dark:border-surface-border'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === 'Completed' ? 'bg-slate-900 dark:bg-white' : status === 'Learning' ? 'bg-slate-500 dark:bg-slate-400' : 'bg-slate-200 dark:bg-surface-border'
                  }`}
                />
              </span>
              <div className="card card-hover flex items-center justify-between gap-4 px-5 py-4">
                <button
                  type="button"
                  onClick={() => navigate(`/learn/${slugify(step.topic)}`, { state: { rawQuery: step.topic } })}
                  className="text-left font-medium text-slate-800 hover:text-slate-950 dark:text-slate-100 dark:hover:text-white"
                >
                  {i + 1}. {step.label}
                </button>
                <button
                  type="button"
                  onClick={() => cycleStatus(step.id, status)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition active:scale-95 ${STATUS_STYLE[status]}`}
                >
                  <Icon size={12} className={status === 'Learning' ? 'animate-spin' : ''} />
                  {status}
                </button>
              </div>
            </motion.li>
          )
        })}
      </Reveal>
    </div>
  )
}
