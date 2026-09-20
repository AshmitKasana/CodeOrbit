import { Bookmark, BookmarkCheck, Code2, Database, Sparkles } from 'lucide-react'
import LevelSelector from './LevelSelector'
import QuotaBadge from './QuotaBadge'

export default function TopicHeader({ result, level, onLevelChange, bookmarked, onToggleBookmark }) {
  return (
    <div className="border-b border-slate-200 pb-6 dark:border-surface-border">
      <div className="flex flex-wrap items-center gap-2">
        {result.language && (
          <span className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-surface-border dark:text-slate-300">
            <Code2 size={12} /> {result.language}
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
          {level}
        </span>
        {result.source === 'ai' ? (
          <span className="flex items-center gap-1 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-xs font-medium text-signal">
            <Sparkles size={12} /> AI-generated
          </span>
        ) : (
          <span
            title="This lesson comes from Code Orbit's built-in offline content. Connect the AI backend for full, tailored lessons on any topic."
            className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 dark:border-surface-border dark:text-slate-400"
          >
            <Database size={12} /> Built-in demo content
          </span>
        )}
        <QuotaBadge className="sm:ml-auto" />
      </div>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {result.title}
      </h1>
      <p className="prose-dsa mt-3 max-w-3xl text-base">{result.summary}</p>

      {result.languageNote && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
          ⚠️ {result.languageNote}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <LevelSelector level={level} onChange={onLevelChange} />
        <button
          onClick={onToggleBookmark}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
            bookmarked
              ? 'border-slate-900 bg-accent/10 text-slate-900 dark:border-white dark:text-white'
              : 'border-slate-200 text-slate-600 hover:border-slate-900/40 hover:text-slate-900 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white'
          }`}
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>
    </div>
  )
}
