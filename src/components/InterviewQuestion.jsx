import { useState } from 'react'
import { ChevronDown, MessageCircleQuestion, Sparkles } from 'lucide-react'

export default function InterviewQuestion({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left">
        <div className="flex items-start gap-3">
          <MessageCircleQuestion size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
          <div>
            <span className="text-xs font-semibold text-slate-400">Q{index + 1}</span>
            <p className="font-medium text-slate-800 dark:text-slate-100">{item.question}</p>
          </div>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-200 px-5 py-4 dark:border-surface-border">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.shortAnswer}</p>
          <p className="prose-dsa text-sm">{item.detailedAnswer}</p>
          {item.tip && (
            <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
              <Sparkles size={14} className="mt-0.5 shrink-0" />
              <span>{item.tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
