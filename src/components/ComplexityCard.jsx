import { useState } from 'react'

const ROWS = [
  { key: 'best', label: 'Best Case' },
  { key: 'average', label: 'Average Case' },
  { key: 'worst', label: 'Worst Case' },
]

const N_PRESETS = [16, 1024, 10000, 100000]

function formatOps(num) {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B ops`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M ops`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K ops`
  return `${Math.round(num)} ops`
}

export default function ComplexityCard({ complexity }) {
  const [n, setN] = useState(1024)
  if (!complexity) return null

  const logN = Math.max(1, Math.round(Math.log2(n)))
  const comparisons = [
    { label: 'O(1)', ops: formatOps(1) },
    { label: 'O(log n)', ops: formatOps(logN) },
    { label: 'O(n)', ops: formatOps(n) },
    { label: 'O(n log n)', ops: formatOps(n * logN) },
    { label: 'O(n²)', ops: formatOps(n * n) },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card card-hover p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time Complexity</h4>
          <div className="space-y-2.5">
            {ROWS.map((r) => (
              <div key={r.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.03]">
                <span className="text-sm text-slate-600 dark:text-slate-400">{r.label}</span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{complexity[r.key]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-hover p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Space Complexity</h4>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.03]">
            <span className="text-sm text-slate-600 dark:text-slate-400">Auxiliary Space</span>
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{complexity.space}</span>
          </div>
          {complexity.explanation && <p className="prose-dsa mt-4 text-sm">{complexity.explanation}</p>}
        </div>
      </div>

      {/* Interactive Operation Scale Explorer */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Interactive Scale Simulator (at input size n = {n.toLocaleString()})
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {N_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setN(preset)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs transition ${
                  n === preset
                    ? 'border-signal bg-signal/10 font-semibold text-signal'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400 dark:border-surface-border dark:text-slate-400'
                }`}
              >
                n={preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {comparisons.map((c) => (
            <div key={c.label} className="rounded-lg bg-slate-50 px-3 py-2 text-center dark:bg-white/[0.03]">
              <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{c.label}</div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{c.ops}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
