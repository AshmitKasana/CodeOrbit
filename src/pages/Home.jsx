import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, BookOpen, Code2, Compass, Gauge,
  GitCompareArrows, History, Layers, ListChecks, MessageCircleQuestion,
  Route, Sparkles, Target,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import Reveal, { revealItem } from '../components/Reveal'
import Spotlight from '../components/Spotlight'
import CreatorCard from '../components/CreatorCard'
import { slugify, getHistory } from '../utils/helpers'
import {
  ALGO_COMPLEXITY_TABLE,
  BIG_O_INPUT_GUIDE,
  DS_COMPLEXITY_TABLE,
  PATTERN_DECISION_GUIDE,
  TOPIC_CATALOG,
} from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

const QUICK_DESTINATIONS = [
  {
    to: '/topics',
    title: 'Pattern & Topic Guides',
    badge: '65+ Topics',
    description: 'Hand-crafted guides for Two Pointers, Sliding Window, DP, Graphs & more with Python and JS templates.',
    cta: 'Browse topics',
    icon: BookOpen,
  },
  {
    to: '/roadmap',
    title: '20-Step Learning Path',
    badge: 'Interactive',
    description: 'Follow a structured step-by-step curriculum from Big-O & Arrays to Dynamic Programming and System Design.',
    cta: 'Open roadmap',
    icon: Route,
  },
  {
    to: '/practice',
    title: 'Practice Problems',
    badge: 'Easy · Med · Hard',
    description: 'Solve curated coding problems with progressive hints, complexity analysis, and step-by-step solutions.',
    cta: 'Start practicing',
    icon: Target,
  },
  {
    to: '/interview',
    title: 'Interview Question Bank',
    badge: '48+ Q&As + Quiz',
    description: 'Drill real technical interview questions with concise takeaways, interviewer tips, and flashcard quiz mode.',
    cta: 'Open Question Bank',
    icon: MessageCircleQuestion,
  },
]

const FEATURES = [
  { icon: Sparkles, title: 'Natural-language search', text: 'Ask in plain English — "Explain pointers in Java" — no rigid syntax required. Code Orbit parses the topic and language for you.', big: true },
  { icon: GitCompareArrows, title: 'Cross-language comparison', text: 'Every topic is compared across Java, C++, Python, JavaScript and more.' },
  { icon: Layers, title: 'Interactive visual diagrams', text: 'Step through arrays, linked lists, stacks, queues, trees and BFS/DFS graphs interactively.' },
  { icon: Code2, title: 'Runnable code examples', text: 'Copy, expand, switch languages, and run snippets in an interactive playground.' },
  { icon: ListChecks, title: 'Practice & interview prep', text: 'Easy/medium/hard problems, 48+ curated interview questions, and a flashcard quiz mode.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [selectedPatternId, setSelectedPatternId] = useState(PATTERN_DECISION_GUIDE[0].id)
  const [studioTab, setStudioTab] = useState('patterns')
  const [activeCatFilter, setActiveCatFilter] = useState('All')
  const heroRef = useRef(null)

  const { scrollY } = useScroll()
  const ringY = useTransform(scrollY, [0, 500], [0, 120])
  const ringOpacity = useTransform(scrollY, [0, 400], [0.7, 0])

  useEffect(() => setHistory(getHistory(user?.id)), [user?.id])

  function handleSubmit(query) {
    navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })
  }

  const activePattern = PATTERN_DECISION_GUIDE.find((p) => p.id === selectedPatternId) || PATTERN_DECISION_GUIDE[0]
  const categoryEntries = Object.entries(TOPIC_CATALOG).filter(
    ([category]) => activeCatFilter === 'All' || category === activeCatFilter
  )

  return (
    <div>
      {/* Clean, focused Hero */}
      <section ref={heroRef} className="relative overflow-hidden px-4 pb-14 pt-16 sm:pt-24">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_55%_at_50%_15%,black,transparent)]" />
        <Spotlight />
        <motion.div
          aria-hidden="true"
          style={{ y: ringY, opacity: ringOpacity }}
          className="orbit-ring pointer-events-none absolute left-1/2 top-6 -z-10 h-[440px] w-[440px] -translate-x-1/2 animate-orbitSpinSlow"
        >
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-signal shadow-signal" />
        </motion.div>
        <motion.div
          aria-hidden="true"
          style={{ y: ringY, opacity: ringOpacity }}
          className="orbit-ring pointer-events-none absolute left-1/2 top-[72px] -z-10 h-[300px] w-[300px] -translate-x-1/2 animate-orbitSpinReverse"
        >
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-400 dark:bg-white/50" />
        </motion.div>

        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-slate-900 dark:text-white sm:text-6xl"
          >
            Master DSA.
            <br />
            At your own orbit.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg"
          >
            Search any data structure, algorithm, or coding pattern for interactive diagrams, multi-language code, and interview prep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <SearchBar onSubmit={handleSubmit} size="lg" />
          </motion.div>
        </div>
      </section>

      {history.length > 0 && (
        <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-10">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 dark:border-surface-border dark:bg-white/[0.02]">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <History size={13} /> Jump back in:
            </span>
            {history.slice(0, 6).map((h) => (
              <button
                key={h.slug + h.timestamp}
                onClick={() => navigate(`/learn/${h.slug}`, { state: { rawQuery: h.query } })}
                className="chip bg-white text-xs dark:bg-surface-card"
              >
                {h.title || h.query}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* 4-Card Core Navigation Hub */}
      <Reveal as="section" stagger={0.03} className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-signal">Everything in one place</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              Choose how you want to learn
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_DESTINATIONS.map((item) => (
            <motion.div
              key={item.to}
              variants={revealItem}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            >
              <Link to={item.to} className="card card-hover group flex h-full flex-col justify-between p-5">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-signal/30 bg-signal/10 text-signal transition-transform duration-200 ease-out-expo group-hover:scale-105">
                      <item.icon size={18} />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:text-signal dark:text-white">
                  {item.cta} <ArrowRight size={13} className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* Unified Interactive DSA Reference Studio (Pattern Finder + Big-O Cheat Sheets in one clean card) */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-signal">
              <Compass size={14} /> Interactive DSA Reference
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              Pattern Finder &amp; Big-O Cheat Sheet
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Match problem clues to the right algorithm pattern or compare time &amp; space complexities in one click.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-surface-border dark:bg-white/[0.04]">
            {[
              { id: 'patterns', label: 'Pattern Finder', icon: Compass },
              { id: 'ds', label: 'Data Structures Big-O', icon: Layers },
              { id: 'algo', label: 'Algorithms Big-O', icon: Gauge },
              { id: 'constraints', label: 'Input Size → Big-O', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStudioTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  studioTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-surface-card dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <tab.icon size={13} className={studioTab === tab.id ? 'text-signal' : ''} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {studioTab === 'patterns' && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="grid gap-2 sm:grid-cols-2 lg:col-span-7">
              {PATTERN_DECISION_GUIDE.map((item) => {
                const active = item.id === activePattern.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPatternId(item.id)}
                    className={`rounded-2xl border p-3.5 text-left transition-all duration-150 ${
                      active
                        ? 'border-signal bg-signal/10 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-surface-border dark:bg-surface-card dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${active ? 'text-signal' : 'text-slate-900 dark:text-white'}`}>
                        {item.pattern}
                      </span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.symptom}</p>
                  </button>
                )
              })}
            </div>

            <div className="lg:col-span-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activePattern.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="card flex h-full flex-col justify-between border-signal/30 p-6"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-xs font-semibold text-signal">
                        Recommended Pattern
                      </span>
                      <div className="flex gap-2 font-mono text-xs">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          Time: {activePattern.time}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          Space: {activePattern.space}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
                      {activePattern.pattern}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Clue: &ldquo;{activePattern.symptom}&rdquo;
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {activePattern.whenToUse}
                    </p>

                    <div className="mt-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Classic Problems (Click to learn)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activePattern.examples.map((ex) => (
                          <button
                            key={ex}
                            type="button"
                            onClick={() => handleSubmit(ex)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 transition hover:border-signal hover:text-signal dark:border-surface-border dark:bg-white/[0.04] dark:text-slate-300"
                          >
                            {ex} ↗
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-surface-border">
                    <button
                      type="button"
                      onClick={() => handleSubmit(activePattern.topic)}
                      className="btn-primary text-xs"
                    >
                      Open {activePattern.topic} Guide <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/practice')}
                      className="btn-secondary text-xs"
                    >
                      Practice Problems
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {studioTab === 'ds' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-400">
                    <th className="px-4 py-3">Data Structure</th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Search</th>
                    <th className="px-4 py-3">Insert</th>
                    <th className="px-4 py-3">Delete</th>
                    <th className="px-4 py-3">Space</th>
                    <th className="px-4 py-3">Key Takeaway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-surface-border">
                  {DS_COMPLEXITY_TABLE.map((row) => (
                    <tr
                      key={row.name}
                      onClick={() => handleSubmit(row.topic)}
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <span className="inline-flex items-center gap-1">
                          {row.name} <ArrowUpRight size={13} className="text-slate-400" />
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.access}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.search}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.insert}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.deleteOp}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.space}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {studioTab === 'algo' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-400">
                    <th className="px-4 py-3">Algorithm</th>
                    <th className="px-4 py-3">Best</th>
                    <th className="px-4 py-3">Average</th>
                    <th className="px-4 py-3">Worst</th>
                    <th className="px-4 py-3">Space</th>
                    <th className="px-4 py-3">Stable</th>
                    <th className="px-4 py-3">When to Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-surface-border">
                  {ALGO_COMPLEXITY_TABLE.map((row) => (
                    <tr
                      key={row.name}
                      onClick={() => handleSubmit(row.topic)}
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <span className="inline-flex items-center gap-1">
                          {row.name} <ArrowUpRight size={13} className="text-slate-400" />
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.best}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.average}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.worst}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.space}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.stable}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {studioTab === 'constraints' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-400">
                    <th className="px-4 py-3">Input Size Constraint (n)</th>
                    <th className="px-4 py-3">Max Acceptable Time Complexity</th>
                    <th className="px-4 py-3">Typical Paradigms &amp; Patterns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-surface-border">
                  {BIG_O_INPUT_GUIDE.map((row) => (
                    <tr key={row.constraint} className="hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-white">{row.constraint}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-signal">{row.targetBigO}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.typicalApproach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Reveal>

      {/* Explore by Category */}
      <Reveal as="section" stagger={0.025} className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Explore by category</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Click any topic chip to open its full interactive guide.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', ...Object.keys(TOPIC_CATALOG)].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCatFilter(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  activeCatFilter === cat
                    ? 'border-slate-900 bg-accent text-accent-fg dark:border-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-surface-border dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryEntries.map(([category, topics]) => (
            <motion.div key={category} variants={revealItem} className="card card-hover p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">{category}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                  {topics.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(`/learn/${slugify(t)}`, { state: { rawQuery: t } })}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 transition-all duration-200 ease-out-expo hover:-translate-y-px hover:bg-slate-900 hover:text-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-900"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* Platform Highlights Bento */}
      <Reveal as="section" stagger={0.03} className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={revealItem}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`card card-hover p-6 ${f.big ? 'sm:col-span-2 lg:col-span-2 lg:row-span-1' : ''}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-surface-border dark:text-slate-300">
                <f.icon size={18} />
              </span>
              <h3 className={`mt-4 font-semibold text-slate-900 dark:text-white ${f.big ? 'text-lg' : ''}`}>{f.title}</h3>
              <p className={`mt-1.5 text-sm text-slate-500 dark:text-slate-400 ${f.big ? 'max-w-md' : ''}`}>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto max-w-4xl px-4 pb-24">
        <p className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-400">
          Designed &amp; engineered solo
        </p>
        <CreatorCard className="mx-auto max-w-md" />
      </Reveal>
    </div>
  )
}
