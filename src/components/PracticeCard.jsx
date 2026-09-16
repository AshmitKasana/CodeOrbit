import { useState } from 'react'
import { Lightbulb, ChevronDown } from 'lucide-react'
import CodeBlock from './CodeBlock'

const DIFFICULTY_STYLE = {
  Easy: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-white/10',
  Medium: 'text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-white/[0.14]',
  Hard: 'text-white bg-slate-900 dark:text-slate-900 dark:bg-white',
}

export default function PracticeCard({ problem, difficulty }) {
  const [open, setOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${DIFFICULTY_STYLE[difficulty]}`}>{difficulty}</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{problem.title}</span>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-surface-border">
          <p className="prose-dsa text-sm">{problem.statement}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Input" value={problem.input} />
            <InfoBlock label="Output" value={problem.output} />
            <InfoBlock label="Constraints" value={problem.constraints} />
            <InfoBlock label="Example" value={problem.example} mono />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setShowHint((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900/40 hover:text-slate-900 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
            >
              <Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button
              onClick={() => setShowSolution((s) => !s)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900/40 hover:text-slate-900 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
            >
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          </div>

          {showHint && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
              💡 {problem.hint}
            </div>
          )}

          {showSolution && (
            <div className="space-y-3">
              <CodeBlock code={problem.solution} language="Python" />
              <p className="prose-dsa text-sm">{problem.explanation}</p>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-200">
                {problem.complexity}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.03]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
