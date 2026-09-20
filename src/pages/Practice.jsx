import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PracticeCard from '../components/PracticeCard'
import LimitReached from '../components/LimitReached'
import QuotaBadge from '../components/QuotaBadge'
import { generateExplanation } from '../services/aiService'
import { slugify } from '../utils/helpers'
import { TOPIC_CATALOG } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

const QUICK_TOPICS = ['Arrays', 'Linked List', 'Binary Search', 'Dynamic Programming', 'Graphs', 'Pointers']

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState(null)
  const [limit, setLimit] = useState(null)
  const [error, setError] = useState(null)

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Practice Problems</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
          Pick a topic to generate easy, medium and hard practice problems — hints and solutions hidden by default.
        </p>
        <QuotaBadge className="mt-3" />
      </div>

      <SearchBar size="sm" onSubmit={loadTopic} />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {QUICK_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => loadTopic(t)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
              query === t
                ? 'border-slate-900 bg-accent/10 text-slate-900 dark:border-white dark:text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={18} /> Generating practice problems...
        </div>
      )}

      {!loading && limit && <LimitReached quota={limit.quota} signedIn={Boolean(user) || limit.signedIn} />}

      {!loading && error && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!loading && !limit && !error && result && (
        <div className="mt-10 space-y-8">
          <button
            onClick={() => navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-900 hover:underline dark:text-white"
          >
            View full lesson on {result.title} <ArrowUpRight size={14} />
          </button>
          {['easy', 'medium', 'hard'].map((diff) => (
            <div key={diff}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{diff}</h3>
              <div className="space-y-3">
                {result.practiceProblems[diff]?.map((p, i) => (
                  <PracticeCard key={i} problem={p} difficulty={diff.charAt(0).toUpperCase() + diff.slice(1)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !limit && !error && !result && (
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {Object.values(TOPIC_CATALOG).flat().slice(0, 9).map((t) => (
            <button key={t} onClick={() => loadTopic(t)} className="card card-hover px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
