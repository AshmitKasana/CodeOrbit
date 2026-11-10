import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUp, Loader2, MessageSquareCode, RotateCcw } from 'lucide-react'

const SUGGESTIONS = [
  'Explain this with a real-world example',
  'Show me an interview-level example',
  'Explain the memory diagram',
  'What is the time & space complexity?',
  'Give me a harder problem',
]

export default function FollowUpChat({ conversation, loading, onAsk, onClear }) {
  const [value, setValue] = useState('')

  function submit(text) {
    const q = (text ?? value).trim()
    if (!q || loading) return
    onAsk(q)
    setValue('')
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquareCode size={18} className="text-signal" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Interactive Concept Q&amp;A</h3>
        </div>
        {conversation.length > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </div>

      {conversation.length > 0 && (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'ml-auto max-w-[85%] bg-accent text-accent-fg'
                  : 'prose-dsa max-w-[92%] border border-slate-200/70 bg-slate-50/80 dark:border-surface-border dark:bg-white/[0.03]'
              }`}
            >
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400 dark:bg-white/[0.04]">
              <Loader2 size={14} className="animate-spin" /> Preparing explanation...
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => submit(s)} className="chip text-xs">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:focus-within:border-white/50">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ask about complexity, edge cases, memory, or an interview follow-up..."
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
        <button
          type="button"
          onClick={() => submit()}
          disabled={!value.trim() || loading}
          aria-label="Send question"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg transition active:scale-95 disabled:opacity-40"
        >
          <ArrowUp size={15} />
        </button>
      </div>
    </div>
  )
}
