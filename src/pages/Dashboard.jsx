import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Award, Bookmark, BookOpen, Compass, Flame, History, ListChecks, Lock, Route } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getBookmarks, getHistory, getRoadmapProgress, slugify } from '../utils/helpers'
import { computeStats, evaluateBadges, getActivity, recentDays } from '../lib/progress'
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

  const activity = useMemo(() => getActivity(user?.id), [user?.id])
  const stats = useMemo(() => computeStats(activity, progress), [activity, progress])
  const badges = useMemo(() => evaluateBadges(stats, ROADMAP.length), [stats])
  const week = useMemo(() => recentDays(activity, 7), [activity])
  const earnedCount = badges.filter((b) => b.earned).length

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
        <motion.div variants={revealItem} className="card p-5 md:col-span-2 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Flame size={15} /> Your Orbit
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <p className="font-display text-4xl font-bold text-slate-900 dark:text-white">
                {stats.currentStreak}
                <span className="ml-1.5 text-base font-medium text-slate-400">day streak</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Longest: {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'} · {stats.activeDays} active {stats.activeDays === 1 ? 'day' : 'days'}</p>
              <div className="mt-4 flex gap-1.5" aria-label="Activity in the last 7 days">
                {week.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-1" title={`${d.day}: ${d.total} ${d.total === 1 ? 'action' : 'actions'}`}>
                    <span className={`h-7 w-7 rounded-lg border ${d.active ? 'border-signal bg-signal/80' : 'border-slate-200 dark:border-surface-border'}`} />
                    <span className="text-[10px] text-slate-400">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${d.day}T12:00:00Z`).getUTCDay()]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Level {stats.level} <span className="text-slate-400">· {stats.xp} XP</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${(stats.xpIntoLevel / stats.xpForNext) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{stats.xpForNext - stats.xpIntoLevel} XP to level {stats.level + 1}</p>
              <p className="mt-3 text-xs text-slate-400">
                Earn XP by opening lessons (+10), finishing a visualizer run (+5), exploring Big-O (+3) and completing roadmap steps (+25).
              </p>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Award size={14} /> Badges <span className="text-slate-400">· {earnedCount}/{badges.length}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b) => (
                  <span
                    key={b.id}
                    title={b.description}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      b.earned
                        ? 'border-signal/40 bg-signal/10 text-signal'
                        : 'border-slate-200 text-slate-400 dark:border-surface-border'
                    }`}
                  >
                    {!b.earned && <Lock size={10} />}
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

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
