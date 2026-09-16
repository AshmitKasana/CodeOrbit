import { EXPLANATION_LEVELS } from '../utils/constants'

export default function LevelSelector({ level, onChange }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-surface-border dark:bg-white/[0.03]">
      <div className="flex w-max gap-0.5">
        {EXPLANATION_LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition active:scale-[0.97] ${
              level === l
                ? 'bg-white text-slate-900 shadow-sm dark:bg-surface-card dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
