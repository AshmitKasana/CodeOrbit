export default function ComparisonTable({ comparison }) {
  if (!comparison || !comparison.rows?.length) return null
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-surface-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.04]">
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-600 dark:border-surface-border dark:text-slate-300">
              Concept
            </th>
            {comparison.columns.map((col) => (
              <th key={col} className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-600 dark:border-surface-border dark:text-slate-300">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-white/[0.02]">
              <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-700 dark:border-surface-border/60 dark:text-slate-200">
                {row.concept}
              </td>
              {row.values.map((v, j) => (
                <td key={j} className="border-b border-slate-100 px-4 py-3 text-slate-600 dark:border-surface-border/60 dark:text-slate-400">
                  {formatValue(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatValue(v) {
  if (v === 'Yes') return <span className="font-medium text-slate-900 dark:text-white">Yes</span>
  if (v === 'No') return <span className="font-medium text-slate-400 dark:text-slate-500">No</span>
  return v
}
