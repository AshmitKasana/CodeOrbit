import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, CircleDashed, Loader2, RotateCcw } from 'lucide-react'
import { ROADMAP } from '../utils/constants'
import { getTopicHook } from '../services/knowledgeBase'
import { getRoadmapProgress, resetRoadmapProgress, setRoadmapStatus, slugify } from '../utils/helpers'
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
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => setProgress(getRoadmapProgress(user?.id)), [user?.id])

  function cycleStatus(id, current) {
    const next = STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length]
    setRoadmapStatus(id, next, user?.id)
    if (next === 'Completed') recordActivity(user?.id, 'roadmap')
    setProgress((p) => ({ ...p, [id]: next }))
  }

  function handleResetAll() {
    setProgress(resetRoadmapProgress(user?.id))
  }

  const completedCount = Object.values(progress).filter((s) => s === 'Completed').length
  const learningCount = Object.values(progress).filter((s) => s === 'Learning').length
  const pct = Math.round((completedCount / ROADMAP.length) * 100)

  const visibleSteps = useMemo(() => {
    return ROADMAP.map((step, index) => ({
      ...step,
      index,
      status: progress[step.id] || 'Not Started',
    })).filter((s) => statusFilter === 'All' || s.status === statusFilter)
  }, [progress, statusFilter])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">Step-by-Step Path</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          The Orbit Roadmap
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
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
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span>
            {completedCount} / {ROADMAP.length} completed ({pct}%)
          </span>
          {learningCount > 0 && <span>· {learningCount} in progress</span>}
          {(completedCount > 0 || learningCount > 0) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>

        {/* Status Filter Controls */}
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {['All', ...STATUSES].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                statusFilter === f
                  ? 'bg-accent text-accent-fg'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visibleSteps.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-400">
          No roadmap topics match the &ldquo;{statusFilter}&rdquo; filter.
        </div>
      ) : (
        <Reveal stagger={0.025} as="ol" className="relative pl-10">
          {/* Continuous vertical timeline rail */}
          <span className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-surface-border" />
          {visibleSteps.map((step) => {
            const status = step.status
            const Icon = STATUS_ICON[status]
            return (
              <motion.li key={step.id} variants={revealItem} layout className="relative mb-5 last:mb-0">
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
                      status === 'Completed'
                        ? 'bg-slate-900 dark:bg-white'
                        : status === 'Learning'
                          ? 'bg-slate-500 dark:bg-slate-400'
                          : 'bg-slate-200 dark:bg-surface-border'
                    }`}
                  />
                </span>
                <div className="card card-hover flex items-center justify-between gap-4 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/learn/${slugify(step.topic)}`, { state: { rawQuery: step.topic } })}
                    className="text-left"
                  >
                    <p className="font-medium text-slate-800 hover:text-slate-950 dark:text-slate-100 dark:hover:text-white">
                      {step.index + 1}. {step.label}
                    </p>
                    {(getTopicHook(step.topic) || step.summary) && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {getTopicHook(step.topic) || step.summary}
                      </p>
                    )}
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
      )}
    </div>
  )
}
