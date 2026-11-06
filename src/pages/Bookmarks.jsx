import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Bookmark, Search, Trash2, X } from 'lucide-react'
import { clearBookmarks, getBookmarks, toggleBookmark } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'
import Reveal from '../components/Reveal'

export default function Bookmarks() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => setBookmarks(getBookmarks(user?.id)), [user?.id])

  function remove(b) {
    const next = toggleBookmark(b, user?.id)
    setBookmarks(next)
  }

  function handleClearAll() {
    setBookmarks(clearBookmarks(user?.id))
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return bookmarks
    return bookmarks.filter(
      (b) => b.title?.toLowerCase().includes(q) || (b.language && b.language.toLowerCase().includes(q))
    )
  }, [bookmarks, filter])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Reveal className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Bookmarks</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
          Topics you&apos;ve saved for later, tied to your account on this browser.
        </p>
      </Reveal>

      {bookmarks.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:bg-surface/60 dark:focus-within:border-white/50">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter saved bookmarks..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
            {filter && (
              <button onClick={() => setFilter('')} aria-label="Clear filter" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="btn-secondary shrink-0 px-3 py-2 text-xs text-slate-500 hover:text-red-500"
          >
            <Trash2 size={13} /> Clear All ({bookmarks.length})
          </button>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Bookmark size={28} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            No bookmarks yet. Open a topic and click &ldquo;Bookmark&rdquo; to save it here.
          </p>
          <button onClick={() => navigate('/topics')} className="btn-primary mt-4">
            Browse Topics
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-400">
          No bookmarks match &ldquo;{filter}&rdquo;.
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((b) => (
              <motion.div
                key={b.slug}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="card card-hover group flex items-center justify-between px-4 py-3.5"
              >
                <button
                  onClick={() => navigate(`/learn/${b.slug}`, { state: { rawQuery: b.title } })}
                  className="flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-950 dark:text-slate-100 dark:hover:text-white"
                >
                  <span>{b.title}</span>
                  {b.language && <span className="text-xs font-normal text-slate-400">({b.language})</span>}
                  <ArrowUpRight
                    size={14}
                    className="text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal group-hover:opacity-100"
                  />
                </button>
                <button
                  onClick={() => remove(b)}
                  aria-label="Remove bookmark"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
