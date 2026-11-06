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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">Curriculum &amp; Guides</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Topic Explorer
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
          Pick any data structure, algorithm, or pattern to open an interactive lesson.
        </p>
      </div>

      {/* Compact search bar */}
      <div className="mx-auto mb-5 max-w-md">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2.5 transition focus-within:border-slate-900/50 dark:border-surface-border dark:bg-surface-card/70 dark:focus-within:border-white/50">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 65+ topics..."
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
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === c
                ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                : 'border-slate-200 bg-white/50 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-surface-border dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/30 dark:hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && deepMatches.length === 0 && query.trim() && (
        <div className="card mx-auto max-w-md p-8 text-center">
          <p className="text-sm text-slate-400">No catalog topics match &ldquo;{query}&rdquo;.</p>
          <button
            type="button"
            onClick={() => open(query.trim())}
            className="btn-primary mt-4 inline-flex items-center gap-1.5 text-xs"
          >
            Learn &ldquo;{query.trim()}&rdquo; <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      <div className="space-y-9">
        {filtered.map(([category, topics]) => (
          <section key={category}>
            <div className="mb-3.5 flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-surface-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {category}
              </h2>
              <span className="text-xs text-slate-400">{topics.length} topics</span>
            </div>
            <Reveal stagger={0.012} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {topics.map((t) => (
                <motion.button
                  key={t}
                  variants={revealItem}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => open(t)}
                  className="card card-hover group flex h-12 items-center justify-between gap-2 px-4 text-left"
                >
                  <span className="truncate text-sm font-medium text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                    {t}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700 group-hover:opacity-100 dark:text-slate-600 dark:group-hover:text-slate-200"
                  />
                </motion.button>
              ))}
            </Reveal>
          </section>
        ))}

        {deepMatches.length > 0 && (
          <section>
            <div className="mb-3.5 border-b border-slate-200/80 pb-2 dark:border-surface-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matching Concepts &amp; Problems
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {deepMatches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => open(m.query)}
                  className="card card-hover group flex h-full items-center justify-between gap-3 px-4 py-3.5 text-left"
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
