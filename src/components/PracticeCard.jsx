import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, ChevronDown, CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import CodeBlock from './CodeBlock'

const DIFFICULTY_STYLE = {
  Easy: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-white/10',
  Medium: 'text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-white/[0.14]',
  Hard: 'text-white bg-slate-900 dark:text-slate-900 dark:bg-white',
}

export default function PracticeCard({ problem, difficulty, solved = false, onToggleSolved }) {
  const [open, setOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  return (
    <div className="card overflow-hidden">
      <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5 text-left"
        >
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_STYLE[difficulty]}`}>
            {difficulty}
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{problem.title}</span>
          {problem.pattern && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-surface-border dark:bg-white/[0.04] dark:text-slate-400">
              {problem.pattern}
            </span>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {onToggleSolved && (
            <button
              type="button"
              onClick={onToggleSolved}
              title={solved ? 'Mark as unsolved' : 'Mark as solved'}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                solved
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 text-slate-500 hover:border-slate-400 dark:border-surface-border dark:text-slate-400 dark:hover:border-white/40'
              }`}
            >
              {solved ? <CheckCircle2 size={13} /> : <Circle size={13} />}
              <span className="hidden sm:inline">{solved ? 'Solved' : 'Solve'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle problem details"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <ChevronDown size={18} className={`transition-transform duration-200 ease-out-expo ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-surface-border">
              <p className="prose-dsa text-sm">{problem.statement}</p>

              {(problem.companies?.length > 0 || problem.leetcodeUrl) && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {problem.companies?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Asked at:</span>
                      {problem.companies.slice(0, 5).map((co) => (
                        <span
                          key={co}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
                        >
                          {co}
                        </span>
                      ))}
                    </div>
                  )}
                  {problem.leetcodeUrl && (
                    <a
                      href={problem.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-signal hover:underline"
                    >
                      Try on LeetCode <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              {(problem.input || problem.output || problem.constraints || problem.example) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock label="Input" value={problem.input} />
                  <InfoBlock label="Output" value={problem.output} />
                  <InfoBlock label="Constraints" value={problem.constraints} />
                  <InfoBlock label="Example" value={problem.example} mono />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowHint((s) => !s)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900/40 hover:text-slate-900 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
                >
                  <Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolution((s) => !s)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900/40 hover:text-slate-900 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
                      💡 {problem.hint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {showSolution && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      <CodeBlock code={problem.solution} language="Python" />
                      <p className="prose-dsa text-sm">{problem.explanation}</p>
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-200">
                        {problem.complexity}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoBlock({ label, value, mono }) {
  if (!value) return null
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.03]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
