import { useState } from 'react'
import { ArrowUp, Loader2, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'Explain this with a real-world example',
  "Show me an interview-level example",
  'Explain the memory diagram',
  'Give me a harder problem',
]

export default function FollowUpChat({ conversation, loading, onAsk }) {
  const [value, setValue] = useState('')

  function submit(text) {
    const q = (text ?? value).trim()
    if (!q || loading) return
    onAsk(q)
    setValue('')
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-slate-500 dark:text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Still confused? Ask Code Orbit</h3>
      </div>

      {conversation.length > 0 && (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'ml-auto max-w-[85%] bg-accent text-accent-fg'
                  : 'prose-dsa max-w-[90%] bg-slate-50 dark:bg-white/[0.04]'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400 dark:bg-white/[0.04]">
              <Loader2 size={14} className="animate-spin" /> Thinking...
            </div>
          )}
        </div>
      )}

      {conversation.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => submit(s)} className="chip text-xs">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:focus-within:border-white/50">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ask a follow-up question..."
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
        <button
          onClick={() => submit()}
          disabled={!value.trim() || loading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg transition active:scale-95 disabled:opacity-40"
        >
          <ArrowUp size={15} />
        </button>
      </div>
    </div>
  )
}
