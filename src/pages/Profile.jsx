import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Award,
  Bookmark,
  Calendar,
  Check,
  Code2,
  Edit3,
  Flame,
  Github,
  LogOut,
  Mail,
  Route,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getBookmarks, getPreferredLanguage, getRoadmapProgress, setPreferredLanguage } from '../utils/helpers'
import { computeStats, evaluateBadges, getActivity } from '../lib/progress'
import { ROADMAP, SUPPORTED_LANGUAGES } from '../utils/constants'
import Reveal from '../components/Reveal'

function initialsFor(name, email) {
  const source = name || email || '?'
  const parts = source.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

export default function Profile() {
  const { user, signOut, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const name =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    null
  const email = user?.email || ''
  const githubUsername = user?.user_metadata?.user_name || ''
  const bio = user?.user_metadata?.bio || ''
  const prefLang = user?.user_metadata?.preferredLanguage || getPreferredLanguage(user?.id)
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const joined = user?.created_at ? new Date(user.created_at) : null

  const [editName, setEditName] = useState(name || email.split('@')[0] || '')
  const [editBio, setEditBio] = useState(bio)
  const [editGithub, setEditGithub] = useState(githubUsername)
  const [editLang, setEditLang] = useState(prefLang)

  const bookmarks = useMemo(() => getBookmarks(user?.id), [user?.id])
  const progress = useMemo(() => getRoadmapProgress(user?.id), [user?.id])
  const activity = useMemo(() => getActivity(user?.id), [user?.id])
  const stats = useMemo(() => computeStats(activity, progress), [activity, progress])
  const badges = useMemo(() => evaluateBadges(stats, ROADMAP.length), [stats])
  const earnedBadges = badges.filter((b) => b.earned)
  const completedCount = ROADMAP.filter((s) => progress[s.id] === 'Completed').length

  async function handleSaveInline(e) {
    e.preventDefault()
    setSaving(true)
    const cleanGh = editGithub.trim().replace(/^@/, '')
    setPreferredLanguage(editLang, user?.id)
    if (typeof updateUserProfile === 'function') {
      await updateUserProfile({
        name: editName.trim() || email.split('@')[0] || 'Learner',
        username: cleanGh,
        bio: editBio.trim(),
        preferredLanguage: editLang,
        avatar_url: cleanGh && !avatarUrl ? `https://github.com/${cleanGh}.png` : avatarUrl,
      })
    }
    setSaving(false)
    setEditing(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Reveal className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xl font-semibold text-accent-fg shadow-glow">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name || email} className="h-full w-full object-cover" />
              ) : (
                initialsFor(name, email)
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-display text-xl font-bold text-slate-900 dark:text-white">
                  {name || email.split('@')[0]}
                </p>
                <span className="rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 text-xs font-semibold text-signal">
                  Level {stats.level} · {stats.xp} XP
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
                <Mail size={13} className="shrink-0" /> {email}
              </p>
              {githubUsername && (
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Github size={12} /> @{githubUsername}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditName(name || email.split('@')[0] || '')
                setEditBio(bio)
                setEditGithub(githubUsername)
                setEditLang(prefLang)
                setEditing((e) => !e)
              }}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              {editing ? <X size={14} /> : <Edit3 size={14} />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
            <Link to="/settings" className="icon-btn" title="Account Settings" aria-label="Account Settings">
              <Settings size={15} />
            </Link>
          </div>
        </div>

        {bio && !editing && (
          <p className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.02] dark:text-slate-300">
            {bio}
          </p>
        )}

        <AnimatePresence initial={false}>
          {editing && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSaveInline}
              className="mt-5 overflow-hidden border-t border-slate-200 pt-5 dark:border-surface-border"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-surface-border dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="e.g. AshmitKasana"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-surface-border dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Preferred Language
                  </label>
                  <select
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-surface-border dark:bg-[#141416] dark:text-white"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Bio / Learning Goal
                  </label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="What are you learning?"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-surface-border dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs">
                  <Check size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          {joined && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} /> Joined{' '}
              {joined.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Code2 size={12} /> Default Language: <strong className="text-slate-600 dark:text-slate-300">{prefLang}</strong>
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-surface-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Route size={12} /> Learning Progress
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {completedCount} / {ROADMAP.length} roadmap steps completed
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-surface-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Bookmark size={12} /> Bookmarks
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{bookmarks.length} saved topics</p>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-surface-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Flame size={12} /> Active Streak
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'} ({earnedBadges.length}/{badges.length} badges)
            </p>
          </div>
        </div>

        {earnedBadges.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Award size={12} /> Earned Badges
            </p>
            <div className="flex flex-wrap gap-1.5">
              {earnedBadges.map((b) => (
                <span
                  key={b.id}
                  title={b.description}
                  className="rounded-full border border-signal/40 bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal"
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {bookmarks.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent bookmarks</p>
            <div className="flex flex-wrap gap-2">
              {bookmarks.slice(0, 6).map((b) => (
                <button
                  key={b.slug}
                  onClick={() => navigate(`/learn/${b.slug}`, { state: { rawQuery: b.title } })}
                  className="chip text-xs"
                >
                  {b.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSignOut} disabled={signingOut} className="btn-secondary mt-8 w-full">
          <LogOut size={15} /> {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </Reveal>
    </div>
  )
}
