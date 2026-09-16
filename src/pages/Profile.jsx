import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Calendar, LogOut, Mail, Route } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getBookmarks, getRoadmapProgress } from '../utils/helpers'
import { ROADMAP } from '../utils/constants'
import Reveal from '../components/Reveal'

function initialsFor(name, email) {
  const source = name || email || '?'
  const parts = source.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const name = user?.user_metadata?.name || null
  const email = user?.email || ''
  const joined = user?.created_at ? new Date(user.created_at) : null
  const bookmarks = useMemo(() => getBookmarks(user?.id), [user?.id])
  const progress = useMemo(() => getRoadmapProgress(user?.id), [user?.id])
  const completedCount = ROADMAP.filter((s) => progress[s.id] === 'Completed').length

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Reveal className="card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-semibold text-accent-fg">
            {initialsFor(name, email)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-bold text-slate-900 dark:text-white">{name || email.split('@')[0]}</p>
            <p className="flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
              <Mail size={13} className="shrink-0" /> {email}
            </p>
          </div>
        </div>

        {joined && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={12} /> Joined {joined.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-surface-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Route size={12} /> Learning Progress
            </div>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {completedCount} / {ROADMAP.length} roadmap steps completed
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-surface-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Bookmark size={12} /> Bookmarks
            </div>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{bookmarks.length} saved topics</p>
          </div>
        </div>

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
