import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, BookOpen, Loader2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PracticeCard from '../components/PracticeCard'
import LimitReached from '../components/LimitReached'
import QuotaBadge from '../components/QuotaBadge'
import { generateExplanation } from '../services/aiService'
import { slugify } from '../utils/helpers'
import { TOPIC_CATALOG } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

const POPULAR_TOPICS = [
  'Arrays',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Linked List',
  'Stack',
  'Heap',
  'BFS',
  'Dynamic Programming',
  'Graphs',
]

const CATEGORIES = ['Popular', ...Object.keys(TOPIC_CATALOG)]

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState('Arrays')
  const [limit, setLimit] = useState(null)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Popular')
  const [diffFilter, setDiffFilter] = useState('all')

  async function loadTopic(topic) {
    setLimit(null)
    setError(null)
    setLoading(true)
    setQuery(topic)
    try {
      const data = await generateExplanation(topic, 'Intermediate', () => {}, { focus: 'practice' })
      setResult(data)
    } catch (err) {
      if (err?.code === 'QUOTA_EXCEEDED') setLimit({ quota: err.quota, signedIn: err.signedIn })
      else setError(err?.message || 'Something went wrong generating problems. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTopic('Arrays')
  }, [])

  const diffsToRender = diffFilter === 'all' ? ['easy', 'medium', 'hard'] : [diffFilter]
  const visibleTopics =
    activeCategory === 'Popular' ? POPULAR_TOPICS : TOPIC_CATALOG[activeCategory] || POPULAR_TOPICS

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">Hands-On Problem Solving</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Practice Problems
        </h1>
        <p className="mx-auto mt-2.5 max-w-lg text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Choose a topic below or search any concept to practice Easy, Medium, and Hard problems with hints and step-by-step solutions.
        </p>
        <QuotaBadge className="mt-3" />
      </div>

      {/* Clean Topic Selector Card */}
      <div className="card p-4 sm:p-5">
        <SearchBar size="sm" onSubmit={loadTopic} />

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-3 dark:border-surface-border">
          <span className="mr-1 text-xs font-medium text-slate-400">Category:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                activeCategory === c
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => loadTopic(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                query === t
                  ? 'border-signal bg-signal text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-400 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={18} /> Loading practice problems...
        </div>
      )}

      {!loading && limit && <LimitReached quota={limit.quota} signedIn={Boolean(user) || limit.signedIn} />}

      {!loading && error && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!loading && !limit && !error && result && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-surface-border dark:bg-white/[0.02]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {result.title}
                </h2>
                <span className="rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-semibold text-signal">
                  Practice Set
                </span>
              </div>
              <button
                onClick={() => navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-signal dark:text-slate-400"
              >
                <BookOpen size={13} /> Open full {result.title} guide &amp; interactive diagram <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-surface-border dark:bg-surface-card">
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiffFilter(d.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    diffFilter === d.id
                      ? 'bg-accent text-accent-fg shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {diffsToRender.map((diff) => (
            <div key={diff}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {diff} Problems
              </h3>
              <div className="space-y-3">
                {result.practiceProblems[diff]?.map((p, i) => (
                  <PracticeCard key={i} problem={p} difficulty={diff.charAt(0).toUpperCase() + diff.slice(1)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
