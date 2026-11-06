import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Code2,
  GitCompareArrows,
  History,
  Layers,
  ListChecks,
  MessageCircleQuestion,
  Route,
  Sparkles,
  Trash2,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import CreatorCard from '../components/CreatorCard'
import Reveal, { revealItem } from '../components/Reveal'
import { clearHistory, getHistory, slugify } from '../utils/helpers'
import { TOPIC_CATALOG } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Natural-language search',
    text: 'Ask in plain English — Code Orbit parses the topic and language for you in seconds.',
  },
  {
    icon: GitCompareArrows,
    title: 'Cross-language comparison',
    text: 'Compare syntax, idioms, and trade-offs across Java, C++, Python, JS, Go, and Rust.',
  },
  {
    icon: Layers,
    title: 'Visual explanations',
    text: 'Arrays, linked lists, trees, and graphs rendered as interactive step-by-step diagrams.',
  },
  {
    icon: Code2,
    title: 'Runnable code examples',
    text: 'Copy, switch languages, and execute snippets directly in the browser playground.',
  },
  {
    icon: ListChecks,
    title: 'Practice & interview prep',
    text: 'Curated Easy, Medium, and Hard problems plus company-tagged interview questions.',
  },
  {
    icon: Route,
    title: 'Guided roadmap & progress',
    text: 'Follow an 18-step DSA path while tracking your daily streak, XP, and milestones.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const heroRef = useRef(null)

  const { scrollY } = useScroll()
  const ringY = useTransform(scrollY, [0, 500], [0, 120])
  const ringOpacity = useTransform(scrollY, [0, 400], [0.7, 0])

  useEffect(() => setHistory(getHistory(user?.id)), [user?.id])

  function handleSubmit(query) {
    navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })
  }

  function handleClearHistory() {
    clearHistory(user?.id)
    setHistory([])
  }

  return (
    <div className="relative">
      <section ref={heroRef} className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_55%_at_50%_15%,black,transparent)]" />
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
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-slate-900 sm:text-6xl dark:text-white"
          >
            Master DSA.
            <br />
            At your own orbit.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 max-w-xl text-base text-slate-500 sm:text-lg dark:text-slate-400"
          >
            Ask anything about Data Structures, Algorithms, Programming Languages, and Computer Science.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <SearchBar onSubmit={handleSubmit} size="lg" />
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pb-20 sm:px-6 lg:px-8">
        {history.length > 0 && (
          <Reveal as="section">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <History size={13} /> Recent Searches
              </span>
              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1 font-medium normal-case tracking-normal transition hover:text-slate-700 dark:hover:text-slate-200"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 6).map((h) => (
                <button
                  key={h.slug + h.timestamp}
                  type="button"
                  onClick={() => navigate(`/learn/${h.slug}`, { state: { rawQuery: h.query } })}
                  className="chip text-xs"
                >
                  {h.title || h.query}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal as="section" stagger={0.03}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Study the patterns &amp; drill the questions
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div variants={revealItem} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 450, damping: 30 }} className="h-full">
              <Link to="/topics" className="card card-hover group flex h-full flex-col justify-between p-6">
                <div>
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-signal/30 bg-signal/10 text-signal">
                    <BookOpen size={18} />
                  </span>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Pattern &amp; Topic Guides</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    65+ structured guides for Two Pointers, Sliding Window, Trees, Graphs, and Dynamic Programming.
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  Browse topics <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>

            <motion.div variants={revealItem} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 450, damping: 30 }} className="h-full">
              <Link to="/interview" className="card card-hover group flex h-full flex-col justify-between p-6">
                <div>
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-signal/30 bg-signal/10 text-signal">
                    <MessageCircleQuestion size={18} />
                  </span>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Interview Question Bank</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    120+ company-tagged questions across 12 categories with an interactive Flashcard Quiz Mode.
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  Open Question Bank <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          </div>
        </Reveal>

        <Reveal as="section" stagger={0.025}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">Explore by category</h2>
            <Link to="/topics" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(TOPIC_CATALOG).map(([category, topics]) => (
              <motion.div key={category} variants={revealItem} className="card flex h-full flex-col justify-between p-6">
                <div>
                  <div className="mb-3.5 flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">{category}</h3>
                    <span className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:border-surface-border dark:bg-white/[0.04] dark:text-slate-400">
                      {topics.length} topics
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {topics.slice(0, 4).map((t) => (
                      <button
                        key={t}
                        type="button"
                        title={t}
                        onClick={() => navigate(`/learn/${slugify(t)}`, { state: { rawQuery: t } })}
                        className="truncate rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white dark:border-surface-border dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-white dark:hover:bg-white dark:hover:text-slate-900"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Link
                  to="/topics"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Explore all {topics.length} <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" stagger={0.03}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">Platform features</h2>
          </div>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={revealItem}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="card card-hover flex h-full flex-col p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
                  <f.icon size={18} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="pt-2 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Created &amp; Engineered By
          </p>
          <CreatorCard className="mx-auto max-w-md text-left" />
        </Reveal>
      </div>
    </div>
  )
}
