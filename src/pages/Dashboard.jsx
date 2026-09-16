import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bookmark, BookOpen, Compass, History, ListChecks, Route } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getBookmarks, getHistory, getRoadmapProgress, slugify } from '../utils/helpers'
import { ROADMAP, TOPIC_CATALOG } from '../utils/constants'
import Reveal, { revealItem } from '../components/Reveal'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Learner'
  const history = useMemo(() => getHistory(user?.id), [user?.id])
  const bookmarks = useMemo(() => getBookmarks(user?.id), [user?.id])
  const progress = useMemo(() => getRoadmapProgress(user?.id), [user?.id])

  const completed = ROADMAP.filter((step) => progress[step.id] === 'Completed')
  const progressPct = Math.round((completed.length / ROADMAP.length) * 100)
  const continueLearning = history[0]

  const recommended = useMemo(() => {
    const seen = new Set([...bookmarks.map((b) => b.slug), ...history.map((h) => h.slug)])
    return Object.values(TOPIC_CATALOG)
      .flat()
      .filter((t) => !seen.has(slugify(t)))
      .slice(0, 6)
  }, [bookmarks, history])

  function open(topic, slug) {
    navigate(`/learn/${slug || slugify(topic)}`, { state: { rawQuery: topic } })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Welcome back, {displayName}.
        </h1>
      </Reveal>

      <Reveal stagger={0.06} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={revealItem} className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Compass size={15} /> Continue Learning
          </div>
          {continueLearning ? (
            <button
              onClick={() => open(continueLearning.query, continueLearning.slug)}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left dark:border-surface-border"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{continueLearning.title || continueLearning.query}</p>
                {continueLearning.language && <p className="text-xs text-slate-400">{continueLearning.language}</p>}
              </div>
              <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-white" />
            </button>
          ) : (
            <p className="text-sm text-slate-400">
              You haven&apos;t started a topic yet. <a href="/topics" className="underline">Browse Topics</a> to begin.
            </p>
          )}
        </motion.div>

        <motion.div variants={revealItem} className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Route size={15} /> Learning Progress
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            <div className="h-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {completed.length} / {ROADMAP.length} roadmap steps completed ({progressPct}%)
          </p>
          <a href="/roadmap" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline dark:text-white">
            View Roadmap <ArrowRight size={13} />
          </a>
        </motion.div>

        <motion.div variants={revealItem} className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <History size={15} /> Recent Searches
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No searches yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {history.slice(0, 5).map((h) => (
                <li key={h.slug + h.timestamp}>
                  <button onClick={() => open(h.query, h.slug)} className="text-left text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                    {h.title || h.query}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={revealItem} className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Bookmark size={15} /> Bookmarks ({bookmarks.length})
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-slate-400">
              No bookmarks yet. <a href="/topics" className="underline">Browse Topics</a>.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {bookmarks.slice(0, 5).map((b) => (
                <li key={b.slug}>
                  <button onClick={() => open(b.title, b.slug)} className="text-left text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                    {b.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <a href="/bookmarks" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline dark:text-white">
            View All <ArrowRight size={13} />
          </a>
        </motion.div>

        <motion.div variants={revealItem} className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <ListChecks size={15} /> Completed Topics
          </div>
          {completed.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing marked complete yet — track progress on the Roadmap.</p>
          ) : (
            <ul className="space-y-1.5">
              {completed.slice(0, 5).map((step) => (
                <li key={step.id} className="text-sm text-slate-600 dark:text-slate-300">
                  {step.label}
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={revealItem} className="card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <BookOpen size={15} /> Recommended Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {recommended.map((t) => (
              <button key={t} onClick={() => open(t)} className="chip">
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      </Reveal>
    </div>
  )
}
