import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Code2, GitCompareArrows, History, Layers, ListChecks, Sparkles } from 'lucide-react'
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
