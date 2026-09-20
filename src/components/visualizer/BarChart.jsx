// One frame of a sorting run, drawn as bars. All state (which bars are being
// compared / swapped / already sorted) comes straight from the recorded step.

const BAR_STYLES = {
  swap: 'bg-slate-900 dark:bg-white',
  compare: 'bg-signal',
  pivot: 'bg-signal/50 ring-2 ring-signal',
  sorted: 'bg-emerald-500/80',
  active: 'bg-slate-400 dark:bg-slate-500',
  dim: 'bg-slate-200 dark:bg-white/10',
  idle: 'bg-slate-300 dark:bg-slate-600',
}

export function barState(step, index) {
  if (step.swap?.includes(index) || step.writes?.includes(index)) return 'swap'
  if (step.compare?.includes(index)) return 'compare'
  if (step.pivot === index) return 'pivot'
  if (step.sorted.includes(index)) return 'sorted'
  if (step.range) return index >= step.range[0] && index <= step.range[1] ? 'active' : 'dim'
  return 'idle'
}

export default function BarChart({ step, maxValue, height = 260, showValues = false }) {
  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height }} role="img" aria-label={step.message || 'Array visualisation'}>
        {step.array.map((value, i) => (
          <div
            key={i}
            className={`min-w-0 flex-1 rounded-t-[3px] transition-[height,background-color] duration-100 ${BAR_STYLES[barState(step, i)]}`}
            style={{ height: `${Math.max(3, (value / maxValue) * 100)}%` }}
          />
        ))}
      </div>
      {showValues && (
        <div className="mt-1 flex gap-[2px]">
          {step.array.map((value, i) => (
            <span key={i} className="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function Legend() {
  const items = [
    ['compare', 'Comparing'],
    ['swap', 'Swapping / writing'],
    ['pivot', 'Pivot / minimum'],
    ['sorted', 'In final position'],
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
      {items.map(([state, label]) => (
        <span key={state} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${BAR_STYLES[state]}`} />
          {label}
        </span>
      ))}
    </div>
  )
}
