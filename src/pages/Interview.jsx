import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, ArrowUpRight, Check, ChevronDown, Eye, Loader2,
  RotateCcw, Search, Shuffle, Sparkles, X,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import InterviewQuestion from '../components/InterviewQuestion'
import LimitReached from '../components/LimitReached'
import QuotaBadge from '../components/QuotaBadge'
import { generateExplanation } from '../services/aiService'
import {
  DIFFICULTIES,
  QUESTIONS,
  QUESTION_CATEGORIES,
  clearReviewed,
  filterQuestions,
  getCategoryLabel,
  getReviewed,
  pickQuizQuestion,
  questionStats,
  setReviewed as saveQuestionReviewed,
  toggleReviewed as toggleQuestionReviewed,
} from '../lib/questionBank'
import { recordActivity } from '../lib/progress'
import { slugify } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'

const QUICK_TOPICS = ['Pointers', 'Arrays', 'Linked List', 'HashMap', 'Dynamic Programming', 'Graphs']

const DIFF_BADGE = {
  Easy: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-white/10',
  Medium: 'text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-white/[0.14]',
  Hard: 'text-white bg-slate-900 dark:text-slate-900 dark:bg-white',
}

export default function Interview() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Question Bank state
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [filterText, setFilterText] = useState('')
  const [unreviewedOnly, setUnreviewedOnly] = useState(false)
  const [reviewed, setReviewedState] = useState(() => getReviewed(user?.id))
  const [quizItem, setQuizItem] = useState(null)
  const [quizRevealed, setQuizRevealed] = useState(false)

  // AI custom topic generator state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState(null)
  const [limit, setLimit] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setReviewedState(getReviewed(user?.id))
  }, [user?.id])

  const stats = useMemo(() => questionStats(QUESTIONS, reviewed), [reviewed])
  const filtered = useMemo(
    () => filterQuestions(QUESTIONS, { category, difficulty, query: filterText, unreviewedOnly, reviewed }),
    [category, difficulty, filterText, unreviewedOnly, reviewed]
  )
  const reviewedSet = useMemo(() => new Set(reviewed), [reviewed])

  function handleToggleReviewed(id) {
    const wasReviewed = reviewedSet.has(id)
    const next = toggleQuestionReviewed(id, user?.id)
    setReviewedState(next)
    if (!wasReviewed) recordActivity(user?.id, 'question')
  }

  function startQuiz(excludeId = null) {
    const pool = filtered.length > 0 ? filtered : QUESTIONS
    const picked = pickQuizQuestion(pool, reviewed, { excludeId })
    setQuizItem(picked)
    setQuizRevealed(false)
  }

  function markQuizAndNext() {
    if (!quizItem) return
    if (!reviewedSet.has(quizItem.id)) {
      const next = saveQuestionReviewed(quizItem.id, true, user?.id)
      setReviewedState(next)
      recordActivity(user?.id, 'question')
    }
    startQuiz(quizItem.id)
  }

  function handleResetProgress() {
    setReviewedState(clearReviewed(user?.id))
  }

  async function loadTopic(topic) {
    setLimit(null)
    setError(null)
    setLoading(true)
    setQuery(topic)
    try {
      const data = await generateExplanation(topic, 'Interview', () => {}, { focus: 'interview' })
      setResult(data)
    } catch (err) {
      if (err?.code === 'QUOTA_EXCEEDED') setLimit({ quota: err.quota, signedIn: err.signedIn })
      else setError(err?.message || 'Something went wrong generating questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pct = stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">Interview Question Bank</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Interview Prep</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          Drill {stats.total} curated DSA interview questions across {QUESTION_CATEGORIES.length} categories — or generate custom questions on any topic below.
        </p>
      </div>

      {/* Progress & Quiz bar */}
      <div className="card mb-6 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Reviewed: {stats.reviewed} / {stats.total} ({pct}%)
            </span>
            {stats.reviewed > 0 && (
              <button
                type="button"
                onClick={handleResetProgress}
                className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            <div className="h-full rounded-full bg-signal transition-all duration-500 ease-out-expo" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => (quizItem ? setQuizItem(null) : startQuiz())}
          className="btn-primary shrink-0"
        >
          <Shuffle size={15} /> {quizItem ? 'Exit Quiz Mode' : 'Quiz Me'}
        </button>
      </div>

      {/* Flashcard Quiz Mode */}
      <AnimatePresence initial={false}>
        {quizItem && (
          <motion.div
            key="quiz-panel"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 overflow-hidden"
          >
            <div className="card border-signal/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFF_BADGE[quizItem.difficulty]}`}>
                    {quizItem.difficulty}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{getCategoryLabel(quizItem.category)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuizItem(null)}
                  aria-label="Close quiz"
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={quizItem.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">{quizItem.question}</p>

                  {!quizRevealed ? (
                    <button type="button" onClick={() => setQuizRevealed(true)} className="btn-secondary mt-5">
                      <Eye size={15} /> Reveal Answer
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-surface-border"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{quizItem.shortAnswer}</p>
                      <p className="prose-dsa text-sm">{quizItem.detailedAnswer}</p>
                      {quizItem.tip && (
                        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
                          <Sparkles size={14} className="mt-0.5 shrink-0" />
                          <span>{quizItem.tip}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button type="button" onClick={markQuizAndNext} className="btn-primary">
                          <Check size={15} /> Mark Reviewed &amp; Next
                        </button>
                        <button type="button" onClick={() => startQuiz(quizItem.id)} className="btn-secondary">
                          <Shuffle size={15} /> Skip to Next
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 transition focus-within:border-slate-900/50 dark:border-surface-border dark:focus-within:border-white/50">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search questions, answers, or tips..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {filterText && (
            <button onClick={() => setFilterText('')} aria-label="Clear search" className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['all', ...DIFFICULTIES].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                difficulty === d
                  ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
              }`}
            >
              {d === 'all' ? 'All levels' : d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUnreviewedOnly((u) => !u)}
            aria-pressed={unreviewedOnly}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
              unreviewedOnly
                ? 'border-signal/40 bg-signal/10 text-signal'
                : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
            }`}
          >
            Unreviewed only
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            category === 'all'
              ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
              : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
          }`}
        >
          All ({stats.total})
        </button>
        {QUESTION_CATEGORIES.map((c) => {
          const catStat = stats.byCategory[c.id] || { total: 0, reviewed: 0 }
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                category === c.id
                  ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
              }`}
            >
              {c.label} ({catStat.reviewed}/{catStat.total})
            </button>
          )
        })}
      </div>

      {/* Question Bank List */}
      {filtered.length === 0 ? (
        <div className="card py-12 text-center text-sm text-slate-400">
          No questions match your current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <BankQuestionCard
              key={item.id}
              item={item}
              index={i}
              reviewed={reviewedSet.has(item.id)}
              onToggleReviewed={() => handleToggleReviewed(item.id)}
            />
          ))}
        </div>
      )}

      {/* Custom AI Topic Generator */}
      <div className="mt-14 border-t border-slate-200 pt-12 dark:border-surface-border">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Ask for a Specific Topic</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
            Generate tailored interview questions on any topic or language.
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
            <Loader2 className="animate-spin" size={18} /> Generating interview questions...
          </div>
        )}

        {!loading && limit && <LimitReached quota={limit.quota} signedIn={Boolean(user) || limit.signedIn} />}

        {!loading && error && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {!loading && !limit && !error && result && (
          <div className="mt-10 space-y-3">
            <button
              onClick={() => navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })}
              className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-900 hover:underline dark:text-white"
            >
              View full lesson on {result.title} <ArrowUpRight size={14} />
            </button>
            {result.interviewQuestions.map((q, i) => (
              <InterviewQuestion key={i} item={q} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BankQuestionCard({ item, index, reviewed, onToggleReviewed }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-start justify-between gap-3 text-left"
        >
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Q{index + 1}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${DIFF_BADGE[item.difficulty]}`}>
                {item.difficulty}
              </span>
              <span className="text-xs text-slate-400">{getCategoryLabel(item.category)}</span>
            </div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{item.question}</p>
          </div>
          <ChevronDown size={18} className={`mt-1 shrink-0 text-slate-400 transition-transform duration-300 ease-out-expo ${open ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onToggleReviewed}
          aria-pressed={reviewed}
          aria-label={reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
          title={reviewed ? 'Reviewed' : 'Mark as reviewed (+3 XP)'}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ease-out-expo active:scale-90 ${
            reviewed
              ? 'border-signal bg-signal text-white'
              : 'border-slate-200 text-slate-400 hover:border-slate-400 dark:border-surface-border dark:hover:border-white/40'
          }`}
        >
          <Check size={13} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-slate-200 px-5 py-4 dark:border-surface-border">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.shortAnswer}</p>
              <p className="prose-dsa text-sm">{item.detailedAnswer}</p>
              {item.tip && (
                <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
                  <Sparkles size={14} className="mt-0.5 shrink-0" />
                  <span>{item.tip}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
