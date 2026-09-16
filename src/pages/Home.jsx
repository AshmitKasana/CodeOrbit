import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, GitCompareArrows, History, Layers, ListChecks, Sparkles } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import Reveal, { revealItem } from '../components/Reveal'
import { slugify, getHistory } from '../utils/helpers'
import { TOPIC_CATALOG } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

const FEATURES = [
  { icon: Sparkles, title: 'Natural-language search', text: 'Ask in plain English — "Explain pointers in Java" — no rigid syntax required.' },
  { icon: GitCompareArrows, title: 'Cross-language comparison', text: 'Every topic is compared across Java, C++, Python, JavaScript and more.' },
  { icon: Layers, title: 'Visual explanations', text: 'Arrays, linked lists, trees and graphs rendered as clear diagrams.' },
  { icon: Code2, title: 'Runnable code examples', text: 'Copy, expand, switch languages, and run snippets in an interactive playground.' },
  { icon: ListChecks, title: 'Practice & interview prep', text: 'Auto-generated easy/medium/hard problems plus common interview questions.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [history, setHistory] = useState([])

  useEffect(() => setHistory(getHistory(user?.id)), [user?.id])

  function handleSubmit(query) {
    navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })
  }

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:pt-28">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_55%_at_50%_15%,black,transparent)]" />
        <div className="orbit-ring pointer-events-none absolute left-1/2 top-8 -z-10 h-[420px] w-[420px] -translate-x-1/2 animate-orbitSpinSlow opacity-70" />

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={revealItem} className="card card-hover p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-surface-border dark:text-slate-300">
                <f.icon size={17} />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
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
    </div>
  )
}
