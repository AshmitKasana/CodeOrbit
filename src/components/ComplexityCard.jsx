const ROWS = [
  { key: 'best', label: 'Best Case' },
  { key: 'average', label: 'Average Case' },
  { key: 'worst', label: 'Worst Case' },
]

export default function ComplexityCard({ complexity }) {
  if (!complexity) return null
  return (
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
          <span className="text-sm text-slate-600 dark:text-slate-400">Extra Space</span>
          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{complexity.space}</span>
        </div>
        {complexity.explanation && <p className="prose-dsa mt-4 text-sm">{complexity.explanation}</p>}
      </div>
    </div>
  )
}
