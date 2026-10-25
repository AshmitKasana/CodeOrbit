import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, ArrowUpRight, BookOpen, Briefcase, Building2, Check, ChevronDown, Clock,
  Code2, Compass, Copy, ExternalLink, Eye, HelpCircle, Layers, Loader2,
  RotateCcw, Search, Shuffle, Sparkles, Terminal, X,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import InterviewQuestion from '../components/InterviewQuestion'
import LimitReached from '../components/LimitReached'
import QuotaBadge from '../components/QuotaBadge'
import { generateExplanation } from '../services/aiService'
import {
  DIFFICULTIES,
  JOB_ROLES,
  QUESTIONS,
  QUESTION_CATEGORIES,
  clearReviewed,
  filterQuestions,
  getCategoryLabel,
  getReviewed,
  getRoleLabel,
  pickQuizQuestion,
  questionStats,
  resolveJobRole,
  setReviewed as saveQuestionReviewed,
  toggleReviewed as toggleQuestionReviewed,
} from '../lib/questionBank'
import {
  ALGO_COMPLEXITY_TABLE,
  BIG_O_INPUT_GUIDE,
  DS_COMPLEXITY_TABLE,
  PATTERN_DECISION_GUIDE,
} from '../utils/constants'
import { recordActivity } from '../lib/progress'
import { slugify } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'

const QUICK_TOPICS = ['Pointers', 'Arrays', 'Linked List', 'HashMap', 'Dynamic Programming', 'Graphs']
const TOP_COMPANIES = ['all', 'Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Bloomberg', 'Uber']

const DIFF_BADGE = {
  Easy: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/10',
  Medium: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-300 dark:bg-amber-500/10',
  Hard: 'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-300 dark:bg-rose-500/10',
}

const INTERVIEW_TIMELINE = [
  {
    time: 'Min 0 – 5',
    title: 'Clarify Constraints & Edge Cases',
    desc: 'Never jump straight into coding. Ask about input size n, value ranges (negatives, duplicates, overflow), sortedness, and whether you can mutate the input.',
    checklist: ['Is the input sorted or can it contain duplicates?', 'What happens on empty input, 1 element, or all-negative numbers?', 'Are we optimizing for time, memory, or streaming reads?'],
  },
  {
    time: 'Min 5 – 12',
    title: 'State Brute Force → Pitch Optimal Pattern',
    desc: 'Take 30 seconds to state the naive baseline and its Big-O so you have a safety net. Then identify the bottleneck and propose the optimal data structure or pattern before writing code.',
    checklist: ['State baseline: "Brute force checks all pairs in O(n²) time, O(1) space."', 'Name the pattern: "Using a hash map / sliding window / monotonic stack drops lookup to O(1)."', 'Get explicit interviewer sign-off on Time & Space Big-O before coding.'],
  },
  {
    time: 'Min 12 – 32',
    title: 'Write Clean, Idiomatic Code Out Loud',
    desc: 'Narrate your invariants while coding. Use descriptive variable names (left/right, slow/fast, indeg, prefixSum) and extract small helpers so you do not get lost in indices.',
    checklist: ['Write loop invariants clearly (e.g., window [left..right] has unique chars).', 'Guard against off-by-one, integer overflow, and null pointer dereferences.', 'Keep control flow flat with early returns.'],
  },
  {
    time: 'Min 32 – 40',
    title: 'Dry-Run With a Small Concrete Trace',
    desc: 'Do not wait for the interviewer to find your bug. Trace a 3–4 element example line by line, writing down variable values at each iteration, then test boundary inputs.',
    checklist: ['Trace a normal 3-element input step by step.', 'Check empty / single-element / duplicate / cycle edge cases.', 'Verify your final return value matches the problem type.'],
  },
  {
    time: 'Min 40 – 45',
    title: 'Handle Follow-Ups & Production Scale',
    desc: 'Interviewers almost always ask "What if the input doesn’t fit in RAM?" or "How do we make this thread-safe?". Every question in our bank includes the exact follow-up asked in real rounds.',
    checklist: ['Memory bound: External merge sort, streaming min-heap, or sharding by hash.', 'Concurrency: Read-write locks, lock striping (ConcurrentHashMap), or immutable snapshots.', 'Skewed data: Tree balancing, randomized pivots, or bucketed counters.'],
  },
]

export default function Interview() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Main view tab
  const [activeTab, setActiveTab] = useState('bank')

  // Question Bank state
  const [role, setRole] = useState('all')
  const [customRoleInput, setCustomRoleInput] = useState('')
  const [category, setCategory] = useState('all')
  const [customTopicInput, setCustomTopicInput] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [company, setCompany] = useState('all')
  const [filterText, setFilterText] = useState('')
  const [unreviewedOnly, setUnreviewedOnly] = useState(false)
  const [reviewed, setReviewedState] = useState(() => getReviewed(user?.id))
  const [quizItem, setQuizItem] = useState(null)
  const [quizRevealed, setQuizRevealed] = useState(false)

  // AI custom topic generator state
  const [showCustomGenerator, setShowCustomGenerator] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState(null)
  const [limit, setLimit] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setReviewedState(getReviewed(user?.id))
  }, [user?.id])

  const effectiveRole = customRoleInput.trim() ? customRoleInput.trim() : role
  const stats = useMemo(() => questionStats(QUESTIONS, reviewed), [reviewed])
  const filtered = useMemo(
    () =>
      filterQuestions(QUESTIONS, {
        category,
        topicQuery: customTopicInput,
        role: effectiveRole,
        difficulty,
        company,
        query: filterText,
        unreviewedOnly,
        reviewed,
      }),
    [category, customTopicInput, effectiveRole, difficulty, company, filterText, unreviewedOnly, reviewed]
  )
  const activeRoleObj = useMemo(() => resolveJobRole(effectiveRole), [effectiveRole])
  const groupedByTopic = useMemo(() => {
    return QUESTION_CATEGORIES
      .map((cat) => ({
        ...cat,
        items: filtered.filter((q) => q.category === cat.id),
      }))
      .filter((g) => g.items.length > 0)
  }, [filtered])
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">Interview Question Bank</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Real Technical Interview Prep
        </h1>
        <p className="mx-auto mt-2.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Master the {stats.total} highest-frequency coding and conceptual questions asked at Google, Amazon, Meta, and Microsoft — complete with optimal code, exact Big-O, LeetCode links, and real interviewer follow-ups.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {[
          { id: 'bank', label: `Live Question Bank (${stats.total})`, icon: Code2 },
          { id: 'patterns', label: 'Pattern & Constraint Cheat Sheet', icon: Compass },
          { id: 'playbook', label: '45-Min Round Playbook & Big-O', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === id
                ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:bg-surface/60 dark:text-slate-300 dark:hover:border-white/40'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'bank' && (
        <>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFF_BADGE[quizItem.difficulty]}`}>
                        {quizItem.difficulty}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{getCategoryLabel(quizItem.category)}</span>
                      {quizItem.pattern && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                          {quizItem.pattern}
                        </span>
                      )}
                      {quizItem.leetcode && (
                        <a
                          href={`https://leetcode.com/problems/${quizItem.leetcode.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 hover:border-slate-400 dark:border-surface-border dark:text-slate-300"
                        >
                          LC #{quizItem.leetcode.id} <ExternalLink size={11} />
                        </a>
                      )}
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
                      <p className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {quizItem.question}
                      </p>

                      {!quizRevealed ? (
                        <button type="button" onClick={() => setQuizRevealed(true)} className="btn-secondary mt-5">
                          <Eye size={15} /> Reveal Optimal Solution
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          className="mt-4 space-y-4 border-t border-slate-200 pt-4 dark:border-surface-border"
                        >
                          <QuestionSolutionBody item={quizItem} onNavigateTopic={(t) => navigate(`/learn/${slugify(t)}`, { state: { rawQuery: t } })} />
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

          {/* 1. Job Role Selector + Custom Role Input */}
          <div className="card mb-4 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Briefcase size={13} className="text-signal" /> 1. Target Job Role (Select or Type Any Role)
              </span>
              {(role !== 'all' || customRoleInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setRole('all')
                    setCustomRoleInput('')
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Reset role
                </button>
              )}
            </div>

            <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:bg-surface/60 dark:focus-within:border-white/50">
              <Briefcase size={14} className="shrink-0 text-slate-400" />
              <input
                value={customRoleInput}
                onChange={(e) => {
                  setCustomRoleInput(e.target.value)
                  if (e.target.value.trim()) setRole('all')
                }}
                placeholder="Type any job role (e.g., Android Developer, Backend Engineer, Data Scientist, SRE, Quant, iOS, Cloud)..."
                className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm dark:text-white dark:placeholder:text-slate-500"
              />
              {customRoleInput && (
                <button
                  type="button"
                  onClick={() => setCustomRoleInput('')}
                  aria-label="Clear custom role"
                  className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRole('all')
                  setCustomRoleInput('')
                }}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  role === 'all' && !customRoleInput
                    ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
                }`}
              >
                All Job Roles
              </button>
              {JOB_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id)
                    setCustomRoleInput('')
                  }}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                    (role === r.id && !customRoleInput) || (customRoleInput && activeRoleObj?.id === r.id && !activeRoleObj?.customTitle)
                      ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {activeRoleObj && (
              <div className="mt-3 space-y-2 rounded-xl border border-signal/25 bg-signal/[0.06] px-3.5 py-3 text-xs">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="text-slate-700 dark:text-slate-200">
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {activeRoleObj.customTitle ? `${activeRoleObj.customTitle} (${activeRoleObj.shortLabel} Track)` : activeRoleObj.label}:
                    </strong>{' '}
                    {activeRoleObj.focus}
                  </p>
                  <span className="shrink-0 self-start rounded-full bg-signal/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-signal sm:self-center">
                    {activeRoleObj.targetMix}
                  </span>
                </div>
                {activeRoleObj.mustKnow && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Priority DSA for this role:</span>
                    {activeRoleObj.mustKnow.map((topicTag) => (
                      <span
                        key={topicTag}
                        className="rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-white/[0.07] dark:text-slate-200"
                      >
                        {topicTag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. DSA Topic Selector + Custom Topic Input */}
          <div className="card mb-4 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Layers size={13} className="text-signal" /> 2. DSA Topic or Pattern (Select or Type Any Topic)
              </span>
              {(category !== 'all' || customTopicInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory('all')
                    setCustomTopicInput('')
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Reset topic
                </button>
              )}
            </div>

            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:bg-surface/60 dark:focus-within:border-white/50">
                <Layers size={14} className="shrink-0 text-slate-400" />
                <input
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder="Type any DSA topic or pattern (e.g., Sliding Window, Trie, Dijkstra, LRU Cache, Monotonic Stack, Bitmask)..."
                  className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm dark:text-white dark:placeholder:text-slate-500"
                />
                {customTopicInput && (
                  <button
                    type="button"
                    onClick={() => setCustomTopicInput('')}
                    aria-label="Clear custom topic"
                    className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {(customRoleInput.trim() || customTopicInput.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    const topicPart = customTopicInput.trim() || (category !== 'all' ? getCategoryLabel(category) : 'Data Structures and Algorithms')
                    const rolePart = customRoleInput.trim() || (activeRoleObj ? activeRoleObj.label : '')
                    const combinedPrompt = rolePart ? `${topicPart} for ${rolePart}` : topicPart
                    setShowCustomGenerator(true)
                    loadTopic(combinedPrompt)
                  }}
                  className="btn-secondary shrink-0 text-xs"
                >
                  <Sparkles size={13} /> Generate Custom AI Questions
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCategory('all')
                  setCustomTopicInput('')
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  category === 'all' && !customTopicInput
                    ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
                }`}
              >
                All DSA Topics
              </button>
              {QUESTION_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id)
                    setCustomTopicInput('')
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    category === c.id
                      ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search, Difficulty & Company Filters */}
          <div className="mb-3 flex flex-col gap-2.5 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2 transition focus-within:border-slate-900/50 dark:border-surface-border dark:bg-surface/60 dark:focus-within:border-white/50">
              <Search size={15} className="shrink-0 text-slate-400" />
              <input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search by problem, LeetCode #, pattern, role, or company..."
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

          {/* Company Filter Row */}
          <div className="mb-6 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <Building2 size={12} /> Company:
            </span>
            {TOP_COMPANIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCompany(c)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  company === c
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>

          {/* Question Bank List Grouped by DSA Topic */}
          {groupedByTopic.length === 0 ? (
            <div className="card py-12 text-center text-sm text-slate-400">
              No questions match your current filters.
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByTopic.map((group) => (
                <section key={group.id}>
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-surface-border/70">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {group.label}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {group.items.length} {group.items.length === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.items.map((item, i) => (
                      <BankQuestionCard
                        key={item.id}
                        item={item}
                        index={i}
                        reviewed={reviewedSet.has(item.id)}
                        onToggleReviewed={() => handleToggleReviewed(item.id)}
                        onNavigateTopic={(t) => navigate(`/learn/${slugify(t)}`, { state: { rawQuery: t } })}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Custom AI Topic Generator */}
          <div className="mt-12 border-t border-slate-200 pt-8 dark:border-surface-border">
            {!showCustomGenerator ? (
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 p-5 sm:flex-row dark:border-surface-border">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Preparing for a specific stack or niche topic?</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Generate custom interview questions and answers on any algorithm, language, or system concept.
                  </p>
                </div>
                <button type="button" onClick={() => setShowCustomGenerator(true)} className="btn-secondary shrink-0">
                  <Sparkles size={15} /> Custom Topic Generator
                </button>
              </div>
            ) : (
              <div>
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
            )}
          </div>
        </>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-10">
          {/* Input Size Constraint Decoder */}
          <section className="card p-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-signal">Step 1 in Every Coding Interview</p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                Read the Input Constraint `n` to Know the Target Big-O
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Online judges and interview platforms perform roughly 10⁸ operations per second. Before designing an algorithm, check the maximum value of `n` to eliminate Approaches that will Time Limit Exceed (TLE).
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-surface-border">
                    <th className="py-2.5 pr-4">Input Constraint (n)</th>
                    <th className="py-2.5 px-4">Required Time Complexity</th>
                    <th className="py-2.5 pl-4">Patterns to Reach For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-surface-border/70">
                  {BIG_O_INPUT_GUIDE.map((row) => (
                    <tr key={row.constraint}>
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-slate-900 dark:text-white">{row.constraint}</td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-signal">{row.targetBigO}</td>
                      <td className="py-3 pl-4 text-xs text-slate-600 dark:text-slate-300">{row.typicalApproach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pattern Decision Matrix */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-signal">Step 2: Map the Problem Clue to a Pattern</p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                10 Core Interview Patterns &amp; When to Use Them
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {PATTERN_DECISION_GUIDE.map((item) => (
                <div key={item.id} className="card flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {item.pattern}
                      </h3>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                        {item.time} · {item.space}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-signal">
                      Clue: “{item.symptom}”
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.whenToUse}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-slate-200/70 pt-3 dark:border-surface-border/70">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {item.examples.map((ex) => (
                          <span key={ex} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-white/[0.05] dark:text-slate-400">
                            {ex}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/learn/${slugify(item.topic)}`, { state: { rawQuery: item.topic } })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline dark:text-white"
                      >
                        Guide <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'playbook' && (
        <div className="space-y-10">
          {/* 45-Minute Interview Rubric */}
          <section className="card p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-signal">How Interviewers Grade You</p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                The 45-Minute Live Coding Blueprint
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                At Google, Meta, Amazon, and Microsoft, interviewers score four signals: Problem Solving, Coding, Verification, and Technical Communication. Follow this timeline in every round.
              </p>
            </div>
            <div className="space-y-4">
              {INTERVIEW_TIMELINE.map((phase) => (
                <div key={phase.time} className="rounded-xl border border-slate-200/80 p-4 dark:border-surface-border">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-md bg-signal/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-signal">
                      {phase.time}
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{phase.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{phase.desc}</p>
                  <ul className="mt-2.5 space-y-1">
                    {phase.checklist.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Check size={13} className="mt-0.5 shrink-0 text-signal" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Data Structure Complexity Reference */}
          <section className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Data Structure Big-O Cheat Sheet
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold uppercase tracking-wider text-slate-400 dark:border-surface-border">
                    <th className="py-2 pr-3">Structure</th>
                    <th className="py-2 px-2">Access</th>
                    <th className="py-2 px-2">Search</th>
                    <th className="py-2 px-2">Insert</th>
                    <th className="py-2 px-2">Delete</th>
                    <th className="py-2 pl-3">Interview Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-surface-border/70">
                  {DS_COMPLEXITY_TABLE.map((row) => (
                    <tr key={row.name}>
                      <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.access}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.search}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.insert}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.deleteOp}</td>
                      <td className="py-2.5 pl-3 text-slate-500 dark:text-slate-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Algorithm Complexity Reference */}
          <section className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              Sorting &amp; Graph Algorithm Big-O Cheat Sheet
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold uppercase tracking-wider text-slate-400 dark:border-surface-border">
                    <th className="py-2 pr-3">Algorithm</th>
                    <th className="py-2 px-2">Average</th>
                    <th className="py-2 px-2">Worst</th>
                    <th className="py-2 px-2">Space</th>
                    <th className="py-2 px-2">Stable</th>
                    <th className="py-2 pl-3">Key Trade-off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-surface-border/70">
                  {ALGO_COMPLEXITY_TABLE.map((row) => (
                    <tr key={row.name}>
                      <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.average}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.worst}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">{row.space}</td>
                      <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{row.stable}</td>
                      <td className="py-2.5 pl-3 text-slate-500 dark:text-slate-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function QuestionSolutionBody({ item, onNavigateTopic }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!item.code || !navigator?.clipboard) return
    navigator.clipboard.writeText(item.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Optimal Complexity & Company Bar */}
      {(item.complexity || (item.companies && item.companies.length > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-2 text-xs dark:border-surface-border dark:bg-white/[0.02]">
          {item.complexity && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-slate-700 dark:text-slate-200">
                <strong className="font-semibold text-slate-900 dark:text-white">Time:</strong> {item.complexity.time}
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-200">
                <strong className="font-semibold text-slate-900 dark:text-white">Space:</strong> {item.complexity.space}
              </span>
            </div>
          )}
          {item.companies && item.companies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Asked at:</span>
              {item.companies.map((co) => (
                <span
                  key={co}
                  className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs dark:bg-white/[0.07] dark:text-slate-300"
                >
                  {co}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 30-Second Pitch */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-signal">30-Second Interview Pitch</p>
        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{item.shortAnswer}</p>
      </div>

      {/* Whiteboard Walkthrough */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Whiteboard Explanation &amp; Trade-Offs</p>
        <p className="mt-1 prose-dsa text-sm">{item.detailedAnswer}</p>
      </div>

      {/* Optimal Reference Code */}
      {item.code && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-slate-100 dark:border-surface-border">
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-slate-300">
              <Terminal size={12} /> Reference Implementation
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-slate-100">
            <code>{item.code}</code>
          </pre>
        </div>
      )}

      {/* Real Interviewer Follow-up */}
      {item.followUp && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
          <p className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
            <HelpCircle size={13} /> Real Interviewer Follow-Up
          </p>
          <p className="mt-1">{item.followUp}</p>
        </div>
      )}

      {/* Pro Tip & Action Links */}
      <div className="flex flex-col justify-between gap-3 pt-1 sm:flex-row sm:items-center">
        {item.tip && (
          <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles size={13} className="mt-0.5 shrink-0 text-signal" />
            <span><strong className="font-medium text-slate-700 dark:text-slate-200">Pro tip:</strong> {item.tip}</span>
          </div>
        )}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {item.topic && (
            <button
              type="button"
              onClick={() => onNavigateTopic(item.topic)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 dark:border-surface-border dark:text-slate-200 dark:hover:border-white/40"
            >
              <BookOpen size={12} /> Concept Guide
            </button>
          )}
          {item.leetcode && (
            <a
              href={`https://leetcode.com/problems/${item.leetcode.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 dark:border-surface-border dark:text-slate-200 dark:hover:border-white/40"
            >
              Solve LC #{item.leetcode.id} <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function BankQuestionCard({ item, index, reviewed, onToggleReviewed, onNavigateTopic }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-start justify-between gap-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Q{index + 1}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DIFF_BADGE[item.difficulty]}`}>
                {item.difficulty}
              </span>
              <span className="text-xs text-slate-400">{getCategoryLabel(item.category)}</span>
              {item.pattern && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  {item.pattern}
                </span>
              )}
              {item.leetcode && (
                <span className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 dark:border-surface-border dark:text-slate-400">
                  LC #{item.leetcode.id}
                </span>
              )}
              {item.complexity && (
                <span className="hidden font-mono text-[11px] text-slate-400 sm:inline">
                  · {item.complexity.time}
                </span>
              )}
            </div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{item.question}</p>
            {((item.roles && item.roles.length > 0) || (item.companies && item.companies.length > 0)) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {(item.roles || []).map((rId) => (
                  <span
                    key={rId}
                    className="rounded border border-signal/25 bg-signal/[0.07] px-1.5 py-0.5 text-[10px] font-medium text-signal"
                  >
                    {getRoleLabel(rId)}
                  </span>
                ))}
                {(item.companies || []).slice(0, 4).map((co) => (
                  <span
                    key={co}
                    className="rounded bg-slate-100/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"
                  >
                    {co}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ChevronDown size={18} className={`mt-1 shrink-0 text-slate-400 transition-transform duration-200 ease-out-expo ${open ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onToggleReviewed}
          aria-pressed={reviewed}
          aria-label={reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
          title={reviewed ? 'Reviewed' : 'Mark as reviewed (+3 XP)'}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 ease-out-expo active:scale-90 ${
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
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200 px-5 py-4 dark:border-surface-border">
              <QuestionSolutionBody item={item} onNavigateTopic={onNavigateTopic} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
