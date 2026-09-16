import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Boxes, Cpu, Rocket, Search, X } from 'lucide-react'
import { TOPIC_CATALOG } from '../utils/constants'
import { slugify } from '../utils/helpers'
import Reveal, { revealItem } from '../components/Reveal'

const ICONS = { 'Data Structures': Boxes, Algorithms: Cpu, Advanced: Rocket }
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
      .map(([category, topics]) => [category, q ? topics.filter((t) => t.toLowerCase().includes(q)) : topics])
      .filter(([, topics]) => topics.length > 0)
  }, [query, activeCategory])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Topic Explorer</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          Browse every core data structure and algorithm. Click any topic for a full AI-generated explanation.
        </p>
      </div>

      <div className="mx-auto mb-4 max-w-lg">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 transition focus-within:border-slate-900/50 dark:border-surface-border dark:focus-within:border-white/50">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter topics..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear filter" className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              activeCategory === c
                ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-400">No topics match "{query}".</p>
      )}

      <div className="space-y-10">
        {filtered.map(([category, topics]) => {
          const Icon = ICONS[category] || Boxes
          return (
            <section key={category}>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-surface-border dark:text-slate-300">
                  <Icon size={18} />
                </span>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{category}</h2>
              </div>
              <Reveal stagger={0.04} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {topics.map((t) => (
                  <motion.button
                    key={t}
                    variants={revealItem}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => open(t)}
                    className="card card-hover group flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {t}
                    <ArrowUpRight size={14} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </motion.button>
                ))}
              </Reveal>
            </section>
          )
        })}
      </div>
    </div>
  )
}
