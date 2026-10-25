import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { TOPIC_CATALOG } from '../utils/constants'
import { searchAllDSA } from '../services/knowledgeBase'
import { slugify } from '../utils/helpers'
import Reveal, { revealItem } from '../components/Reveal'

const CATEGORIES = Object.keys(TOPIC_CATALOG)

export default function Topics() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  function open(topic) {
    navigate(`/learn/${slugify(topic)}`, { state: { rawQuery: topic } })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return Object.entries(TOPIC_CATALOG)
      .filter(([category]) => activeCategory === 'All' || category === activeCategory)
      .map(([category, topics]) => [
        category,
        topics.filter((t) => !q || t.toLowerCase().includes(q)),
      ])
      .filter(([, topics]) => topics.length > 0)
  }, [query, activeCategory])

  const deepMatches = useMemo(() => {
    if (!query.trim()) return []
    const shownNames = new Set(filtered.flatMap(([, topics]) => topics.map((t) => t.toLowerCase())))
    return searchAllDSA(query, 8).filter((m) => !shownNames.has(m.title.toLowerCase()))
  }, [query, filtered])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Topic Explorer</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
          Pick any data structure, algorithm, or pattern to open an interactive lesson.
        </p>
      </div>

      {/* Compact search bar */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:bg-surface/60 dark:focus-within:border-white/50">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear filter" className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-1.5">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeCategory === c
                ? 'bg-accent text-accent-fg'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && deepMatches.length === 0 && query.trim() && (
        <div className="text-center">
          <p className="text-sm text-slate-400">No catalog topics match "{query}".</p>
          <button
            type="button"
            onClick={() => open(query.trim())}
            className="btn-primary mt-3 inline-flex items-center gap-1.5 text-xs"
          >
            Learn "{query.trim()}" <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      <div className="space-y-8">
        {filtered.map(([category, topics]) => (
          <section key={category}>
            <div className="mb-3 border-b border-slate-200/70 pb-2 dark:border-surface-border/70">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {category}
              </h2>
            </div>
            <Reveal stagger={0.012} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {topics.map((t) => (
                <motion.button
                  key={t}
                  variants={revealItem}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => open(t)}
                  className="card card-hover group flex items-center justify-between gap-2 px-3.5 py-2.5 text-left"
                >
                  <span className="truncate text-sm font-medium text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                    {t}
                  </span>
                  <ArrowUpRight
                    size={13}
                    className="shrink-0 text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700 group-hover:opacity-100 dark:text-slate-600 dark:group-hover:text-slate-200"
                  />
                </motion.button>
              ))}
            </Reveal>
          </section>
        ))}

        {deepMatches.length > 0 && (
          <section>
            <div className="mb-3 border-b border-slate-200/70 pb-2 dark:border-surface-border/70">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matching Concepts &amp; Problems
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {deepMatches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => open(m.query)}
                  className="card card-hover group flex items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                      {m.title}
                    </p>
                    {m.hook && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {m.hook}
                      </p>
                    )}
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:group-hover:text-white"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
