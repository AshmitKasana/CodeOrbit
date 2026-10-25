import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Layers, Loader2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PracticeCard from '../components/PracticeCard'
import LimitReached from '../components/LimitReached'
import QuotaBadge from '../components/QuotaBadge'
import { generateExplanation } from '../services/aiService'
import { findEntry } from '../services/knowledgeBase'
import { PRACTICE_CATEGORIES } from '../data/practiceProblemsBank'
import { scopedKey, slugify } from '../utils/helpers'
import { recordActivity } from '../lib/progress'
import { useAuth } from '../hooks/useAuth'

const SOLVED_KEY = 'dsa-ai:solved-practice'

function loadSolved(userId) {
  try {
    const raw = localStorage.getItem(scopedKey(SOLVED_KEY, userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSolved(ids, userId) {
  try {
    localStorage.setItem(scopedKey(SOLVED_KEY, userId), JSON.stringify(ids))
  } catch {
    /* ignore storage errors */
  }
}

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('Arrays')
  const [activeCat, setActiveCat] = useState(PRACTICE_CATEGORIES[0].id)
  const [activeDiff, setActiveDiff] = useState('all')
  const [unsolvedOnly, setUnsolvedOnly] = useState(false)
  const [solvedIds, setSolvedIds] = useState(() => loadSolved(user?.id))
  const [limit, setLimit] = useState(null)
  const [error, setError] = useState(null)

  // Initial synchronous build for instant render & SSR
  const [result, setResult] = useState(() => {
    const entry = findEntry('Arrays')
    return entry ? entry.build() : null
  })

  useEffect(() => {
    setSolvedIds(loadSolved(user?.id))
  }, [user?.id])

  async function loadTopic(topic) {
    setLimit(null)
    setError(null)
    setQuery(topic)

    // Auto-select the category tab if the topic belongs to one
    const matchingCat = PRACTICE_CATEGORIES.find((cat) =>
      cat.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
    )
    if (matchingCat) setActiveCat(matchingCat.id)

    setLoading(true)
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

  function handleToggleSolved(problemKey) {
    const exists = solvedIds.includes(problemKey)
    const next = exists ? solvedIds.filter((id) => id !== problemKey) : [...solvedIds, problemKey]
    setSolvedIds(next)
    saveSolved(next, user?.id)
    if (!exists) {
      recordActivity(user?.id, 'question')
    }
  }

  const visibleTopics = useMemo(() => {
    if (activeCat === 'all') {
      return PRACTICE_CATEGORIES.flatMap((c) => c.topics)
    }
    return PRACTICE_CATEGORIES.find((c) => c.id === activeCat)?.topics || PRACTICE_CATEGORIES[0].topics
  }, [activeCat])

  const problemsByDiff = useMemo(() => {
    const easy = (result?.practiceProblems?.easy || []).map((p, i) => ({
      ...p,
      _diff: 'Easy',
      _key: p.id || `${slugify(result?.title || query)}-easy-${i}`,
    }))
    const medium = (result?.practiceProblems?.medium || []).map((p, i) => ({
      ...p,
      _diff: 'Medium',
      _key: p.id || `${slugify(result?.title || query)}-medium-${i}`,
    }))
    const hard = (result?.practiceProblems?.hard || []).map((p, i) => ({
      ...p,
      _diff: 'Hard',
      _key: p.id || `${slugify(result?.title || query)}-hard-${i}`,
    }))
    return { easy, medium, hard, all: [...easy, ...medium, ...hard] }
  }, [result, query])

  const filteredProblems = useMemo(() => {
    const list = problemsByDiff[activeDiff] || problemsByDiff.all
    if (!unsolvedOnly) return list
    const done = new Set(solvedIds)
    return list.filter((p) => !done.has(p._key))
  }, [problemsByDiff, activeDiff, unsolvedOnly, solvedIds])

  const topicSolvedCount = useMemo(() => {
    const done = new Set(solvedIds)
    return problemsByDiff.all.filter((p) => done.has(p._key)).length
  }, [problemsByDiff.all, solvedIds])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Practice Problems Across 60+ DSA Topics
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
          Pick any category and topic below — or search any data structure, algorithm, or pattern — for curated Easy, Medium, and Hard problems with hints, runnable Python solutions, LeetCode links, and Big-O analysis.
        </p>
        <QuotaBadge className="mt-3" />
      </div>

      <SearchBar size="sm" onSubmit={loadTopic} placeholder="Search any DSA topic or pattern for practice problems (e.g., Fenwick Tree, KMP, Trie, Monotonic Stack)..." />

      {/* Category Switcher */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-surface-border dark:bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 dark:border-surface-border">
          <div className="flex flex-wrap items-center gap-1.5">
            {PRACTICE_CATEGORIES.map((cat) => {
              const active = activeCat === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setActiveCat('all')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeCat === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <Layers size={12} /> All {PRACTICE_CATEGORIES.reduce((s, c) => s + c.topics.length, 0)} Topics
            </button>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Total Solved: <strong className="text-slate-700 dark:text-slate-200">{solvedIds.length}</strong>
          </span>
        </div>

        {/* Topic Pills for Selected Category */}
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleTopics.map((t) => {
            const isSelected = query.toLowerCase() === t.toLowerCase()
            return (
              <button
                key={t}
                type="button"
                onClick={() => loadTopic(t)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-surface-border dark:bg-surface-card dark:text-slate-300 dark:hover:border-white/40'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={18} /> Loading practice problems for {query}...
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
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{result.title}</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {problemsByDiff.all.length} problems
                  </span>
                  {topicSolvedCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                      <CheckCircle2 size={12} /> {topicSolvedCount}/{problemsByDiff.all.length} solved
                    </span>
                  )}
                </div>
                {result.summary && (
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{result.summary}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 dark:border-surface-border dark:text-slate-200 dark:hover:border-white/40"
              >
                Read concept lesson <ArrowUpRight size={14} />
              </button>
            </div>

            {result.relatedTopics?.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-200/70 pt-3 dark:border-surface-border">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Related Practice:
                </span>
                {result.relatedTopics.slice(0, 6).map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => loadTopic(rel)}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {rel} →
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-surface-border">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
              ].map((tab) => {
                const count = problemsByDiff[tab.id]?.length || 0
                const active = activeDiff === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDiff(tab.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-accent text-accent-fg'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setUnsolvedOnly((u) => !u)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                unsolvedOnly
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 text-slate-500 hover:border-slate-400 dark:border-surface-border dark:text-slate-400'
              }`}
            >
              Unsolved only
            </button>
          </div>

          {filteredProblems.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {unsolvedOnly
                ? 'You have solved all problems in this filter! Toggle off "Unsolved only" to review them.'
                : 'No problems in this difficulty tab — switch to "All" to view all problems for this topic.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProblems.map((p) => (
                <PracticeCard
                  key={p._key}
                  problem={p}
                  difficulty={p._diff}
                  solved={solvedIds.includes(p._key)}
                  onToggleSolved={() => handleToggleSolved(p._key)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
