import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check, CircleDashed, Loader2 } from 'lucide-react'
import { ROADMAP } from '../utils/constants'
import { getRoadmapProgress, setRoadmapStatus, slugify } from '../utils/helpers'
import { recordActivity } from '../lib/progress'
import Reveal, { revealItem } from '../components/Reveal'
import { useAuth } from '../hooks/useAuth'

const STATUSES = ['Not Started', 'Learning', 'Completed']
const STATUS_STYLE = {
  'Not Started': 'border-slate-300 text-slate-400 dark:border-surface-border',
  Learning: 'border-signal/40 bg-signal/10 text-signal',
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

  const completedCount = Object.values(progress).filter((s) => s === 'Completed').length
  const learningCount = Object.values(progress).filter((s) => s === 'Learning').length
  const pct = Math.round((completedCount / ROADMAP.length) * 100)

  const visibleSteps = ROADMAP.map((step, index) => ({
    ...step,
    index,
    status: progress[step.id] || 'Not Started',
  })).filter((step) => statusFilter === 'All' || step.status === statusFilter)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">20-Step Structured Path</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">The Orbit Roadmap</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
          Follow the recommended order from foundations to advanced graph &amp; DP paradigms. Click any concept chip to open its lesson, or click a step&apos;s badge to track progress.
        </p>
        <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
          <motion.div
            className="h-full bg-signal"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {completedCount} / {ROADMAP.length} completed ({pct}%) {learningCount > 0 ? `• ${learningCount} in progress` : ''}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 flex flex-wrap justify-center gap-1.5">
        {['All', ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              statusFilter === s
                ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-surface-border dark:text-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Reveal stagger={0.02} as="ol" className="relative pl-10">
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-surface-border" />
        {visibleSteps.map((step) => {
          const { status, index: i } = step
          const Icon = STATUS_ICON[status]
          return (
            <motion.li key={step.id} variants={revealItem} className="relative mb-5 last:mb-0">
              <span
                className={`absolute -left-10 top-6 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white transition-colors dark:bg-surface ${
                  status === 'Completed'
                    ? 'border-slate-900 dark:border-white'
                    : status === 'Learning'
                    ? 'border-signal'
                    : 'border-slate-200 dark:border-surface-border'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === 'Completed' ? 'bg-slate-900 dark:bg-white' : status === 'Learning' ? 'bg-signal' : 'bg-slate-200 dark:bg-surface-border'
                  }`}
                />
              </span>
              <div className="card card-hover p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {step.phase && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-signal">
                          {step.phase}
                        </span>
                      )}
                      {step.complexity && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {step.complexity}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/learn/${slugify(step.topic)}`, { state: { rawQuery: step.topic } })}
                      className="inline-flex items-center gap-1.5 text-left text-base font-semibold text-slate-900 transition hover:text-signal dark:text-white dark:hover:text-signal"
                    >
                      {i + 1}. {step.label}
                      <ArrowUpRight size={15} className="text-slate-400" />
                    </button>
                  </div>

                  <button
                    onClick={() => cycleStatus(step.id, status)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition active:scale-95 ${STATUS_STYLE[status]}`}
                  >
                    <Icon size={12} className={status === 'Learning' ? 'animate-spin' : ''} />
                    {status}
                  </button>
                </div>

                {step.summary && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{step.summary}</p>
                )}

                {step.concepts?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.concepts.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => navigate(`/learn/${slugify(c)}`, { state: { rawQuery: c } })}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-900/40 hover:text-slate-900 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.li>
          )
        })}
      </Reveal>
    </div>
  )
}
