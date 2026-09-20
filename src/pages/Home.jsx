import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Code2, GitCompareArrows, History, Layers, ListChecks, Sparkles } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import Reveal, { revealItem } from '../components/Reveal'
import Spotlight from '../components/Spotlight'
import CreatorCard from '../components/CreatorCard'
import { slugify, getHistory } from '../utils/helpers'
import { TOPIC_CATALOG } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

// `big: true` entries take the wide slot in the bento grid below — the
// pattern Apple's product pages use to give one feature visual priority
// instead of a uniform, monotonous card grid.
const FEATURES = [
  { icon: Sparkles, title: 'Natural-language search', text: 'Ask in plain English — "Explain pointers in Java" — no rigid syntax required. Code Orbit parses the topic and language for you.', big: true },
  { icon: GitCompareArrows, title: 'Cross-language comparison', text: 'Every topic is compared across Java, C++, Python, JavaScript and more.' },
  { icon: Layers, title: 'Visual explanations', text: 'Arrays, linked lists, trees and graphs rendered as clear diagrams.' },
  { icon: Code2, title: 'Runnable code examples', text: 'Copy, expand, switch languages, and run snippets in an interactive playground.' },
  { icon: ListChecks, title: 'Practice & interview prep', text: 'Auto-generated easy/medium/hard problems plus common interview questions.' },
]

// Static bar heights for the little "sorting" preview on the Visualizer card.
const PREVIEW_BARS = [40, 72, 28, 90, 55, 18, 80, 46, 64, 32, 86, 22]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const heroRef = useRef(null)

  const { scrollY } = useScroll()
  // Apple-product-page-style parallax: the orbit ring drifts and fades as
  // you scroll past the hero, instead of just sitting there static.
  const ringY = useTransform(scrollY, [0, 500], [0, 120])
  const ringOpacity = useTransform(scrollY, [0, 400], [0.7, 0])

  useEffect(() => setHistory(getHistory(user?.id)), [user?.id])

  function handleSubmit(query) {
    navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })
  }

  return (
    <div>
      <section ref={heroRef} className="relative overflow-hidden px-4 pb-20 pt-20 sm:pt-28">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_55%_at_50%_15%,black,transparent)]" />
        <Spotlight />
        <motion.div
          style={{ y: ringY, opacity: ringOpacity }}
          className="orbit-ring pointer-events-none absolute left-1/2 top-8 -z-10 h-[420px] w-[420px] -translate-x-1/2 animate-orbitSpinSlow"
        />

        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-surface-border dark:text-slate-400"
          >
            <Sparkles size={12} /> AI-powered DSA learning
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl"
          >
            Master DSA.
            <br />
            At your own orbit.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-lg text-slate-500 dark:text-slate-400"
          >
            Ask anything about Data Structures, Algorithms, Programming Languages, and Computer Science.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-9">
            <SearchBar onSubmit={handleSubmit} size="lg" />
          </motion.div>
        </div>
      </section>

      {history.length > 0 && (
        <Reveal as="section" className="mx-auto max-w-4xl px-4 pb-14">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <History size={15} /> Recent Searches
          </div>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 8).map((h) => (
              <button key={h.slug + h.timestamp} onClick={() => navigate(`/learn/${h.slug}`, { state: { rawQuery: h.query } })} className="chip">
                {h.title || h.query}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal as="section" stagger={0.08} className="mx-auto max-w-6xl px-4 pb-20">
        {/* Bento grid: one feature takes the wide slot for visual priority,
            instead of every card fighting for equal attention. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={revealItem}
              whileHover={{ y: -3 }}
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

      <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-signal">Interactive labs</p>
        <h2 className="mb-6 mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">Don&apos;t just read it — watch it run.</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/visualizer" className="card card-hover group p-6">
            <div className="mb-5 flex h-24 items-end gap-1" aria-hidden="true">
              {PREVIEW_BARS.map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t bg-slate-200 transition-colors duration-300 group-hover:bg-signal/70 dark:bg-white/10 dark:group-hover:bg-signal/70"
                  style={{ height: `${h}%`, transitionDelay: `${i * 25}ms` }}
                />
              ))}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Algorithm Visualizer</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Step through bubble, merge, quick and heap sort — or race two algorithms on the same data. Pause, rewind and see exactly why
              O(n log n) beats O(n²).
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
              Open the lab <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link to="/complexity" className="card card-hover group p-6">
            <svg viewBox="0 0 200 96" className="mb-5 h-24 w-full" fill="none" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4,88 L196,86" stroke="#10b981" />
              <path d="M4,86 C50,50 110,42 196,38" stroke="#14b8a6" />
              <path d="M4,88 L196,44" stroke="#5b7fff" />
              <path d="M4,88 C90,80 150,50 196,8" stroke="#f59e0b" />
              <path d="M4,88 C120,84 165,60 196,4" stroke="#ef4444" className="transition-all duration-500 group-hover:opacity-60" />
            </svg>
            <h3 className="font-semibold text-slate-900 dark:text-white">Big-O Explorer</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Drag a slider and watch O(1) to O(n!) diverge. See how long each would really take on a billion-operations-per-second
              machine, plus the data-structure cheat sheet interviewers expect.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
              Explore complexity <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-6 font-display text-2xl font-bold text-slate-900 dark:text-white">Explore by category</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(TOPIC_CATALOG).map(([category, topics]) => (
            <div key={category} className="card p-5">
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {topics.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(`/learn/${slugify(t)}`, { state: { rawQuery: t } })}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-900 hover:text-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-900"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
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
