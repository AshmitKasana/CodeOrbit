import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Code2,
  Download,
  Github,
  KeyRound,
  Mail,
  Moon,
  RotateCcw,
  Save,
  Send,
  Settings as SettingsIcon,
  Sun,
  Trash2,
  User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  clearBookmarks,
  clearHistory,
  getBookmarks,
  getHistory,
  getPreferredLanguage,
  getRoadmapProgress,
  getStoredTheme,
  resetRoadmapProgress,
  setPreferredLanguage,
  setStoredTheme,
} from '../utils/helpers'
import { SUPPORTED_LANGUAGES } from '../utils/constants'
import Reveal from '../components/Reveal'

export default function Settings() {
  const { user, resetPasswordForEmail, updatePassword, updateUserProfile } = useAuth()

  const initialName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split('@')[0] ||
    ''
  const initialGithub = user?.user_metadata?.user_name || ''
  const initialAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''
  const initialBio = user?.user_metadata?.bio || ''
  const initialLang = user?.user_metadata?.preferredLanguage || getPreferredLanguage(user?.id)

  const [displayName, setDisplayName] = useState(initialName)
  const [githubHandle, setGithubHandle] = useState(initialGithub)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar)
  const [bio, setBio] = useState(initialBio)
  const [prefLang, setPrefLang] = useState(initialLang)
  const [profileStatus, setProfileStatus] = useState('idle') // idle | saving | saved | error
  const [profileError, setProfileError] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [pwStatus, setPwStatus] = useState('idle') // idle | saving | saved | error
  const [pwError, setPwError] = useState(null)

  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState(null)

  const [themeMode, setThemeMode] = useState(() => getStoredTheme() || 'dark')
  const [dataNotice, setDataNotice] = useState(null)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileStatus('saving')
    setProfileError(null)

    let resolvedAvatar = avatarUrl.trim()
    const cleanGh = githubHandle.trim().replace(/^@/, '')
    if (cleanGh && !resolvedAvatar) {
      resolvedAvatar = `https://github.com/${cleanGh}.png`
      setAvatarUrl(resolvedAvatar)
    }

    setPreferredLanguage(prefLang, user?.id)

    if (typeof updateUserProfile === 'function') {
      const { error: updateErr } = await updateUserProfile({
        name: displayName.trim() || user?.email?.split('@')[0] || 'Learner',
        username: cleanGh,
        avatar_url: resolvedAvatar,
        bio: bio.trim(),
        preferredLanguage: prefLang,
      })
      if (updateErr) {
        setProfileError(updateErr.message)
        setProfileStatus('error')
        return
      }
    }

    setProfileStatus('saved')
    setTimeout(() => setProfileStatus('idle'), 2200)
  }

  function handleSyncGithubAvatar() {
    const cleanGh = githubHandle.trim().replace(/^@/, '')
    if (!cleanGh) return
    setAvatarUrl(`https://github.com/${cleanGh}.png`)
  }

  async function handleDirectPasswordUpdate(e) {
    e.preventDefault()
    setPwError(null)
    if (!newPassword || newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.')
      setPwStatus('error')
      return
    }
    setPwStatus('saving')
    if (typeof updatePassword === 'function') {
      const { error: err } = await updatePassword(newPassword)
      if (err) {
        setPwError(err.message)
        setPwStatus('error')
        return
      }
    }
    setNewPassword('')
    setPwStatus('saved')
    setTimeout(() => setPwStatus('idle'), 2200)
  }

  async function handlePasswordReset() {
    setStatus('sending')
    setError(null)
    const { error } = await resetPasswordForEmail(user.email)
    if (error) {
      setError(error.message)
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  function applyTheme(nextTheme) {
    setThemeMode(nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    document.documentElement.classList.toggle('light', nextTheme === 'light')
    setStoredTheme(nextTheme)
  }

  function flashNotice(msg) {
    setDataNotice(msg)
    setTimeout(() => setDataNotice(null), 2400)
  }

  function handleClearHistory() {
    clearHistory(user?.id)
    flashNotice('Search history cleared.')
  }

  function handleClearBookmarks() {
    clearBookmarks(user?.id)
    flashNotice('Saved bookmarks cleared.')
  }

  function handleResetRoadmap() {
    resetRoadmapProgress(user?.id)
    flashNotice('Roadmap milestones reset.')
  }

  function handleExportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { email: user?.email, name: displayName, preferredLanguage: prefLang },
      bookmarks: getBookmarks(user?.id),
      history: getHistory(user?.id),
      roadmapProgress: getRoadmapProgress(user?.id),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code-orbit-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flashNotice('Exported your learning data as JSON.')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Reveal className="mb-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-surface-border dark:text-slate-300">
            <SettingsIcon size={18} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings &amp; Controls</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your identity, coding preferences, theme, security, and saved data
            </p>
          </div>
        </div>
      </Reveal>

      <div className="space-y-6">
        {/* Profile & Coding Preferences */}
        <Reveal delay={0.03} className="card p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={16} className="text-signal" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Account &amp; Profile Details</h2>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Mail size={13} className="text-slate-400" /> {user?.email}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900/50 dark:border-surface-border dark:bg-white/[0.03] dark:text-white dark:focus:border-white/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  GitHub Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="e.g. AshmitKasana"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900/50 dark:border-surface-border dark:bg-white/[0.03] dark:text-white dark:focus:border-white/50"
                  />
                  <button
                    type="button"
                    onClick={handleSyncGithubAvatar}
                    title="Load avatar from GitHub username"
                    className="btn-secondary shrink-0 px-3 py-2 text-xs"
                  >
                    <Github size={14} /> Sync
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://github.com/username.png"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900/50 dark:border-surface-border dark:bg-white/[0.03] dark:text-white dark:focus:border-white/50"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Code2 size={12} /> Default Code Language
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900/50 dark:border-surface-border dark:bg-[#141416] dark:text-white dark:focus:border-white/50"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Short Bio / Goal
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Preparing for SWE interviews & mastering graph algorithms"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900/50 dark:border-surface-border dark:bg-white/[0.03] dark:text-white dark:focus:border-white/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button type="submit" disabled={profileStatus === 'saving'} className="btn-primary">
                <Save size={14} /> {profileStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
              </button>
              <AnimatePresence>
                {profileStatus === 'saved' && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <Check size={14} /> Profile &amp; preferences saved!
                  </motion.span>
                )}
              </AnimatePresence>
              {profileStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle size={13} /> {profileError}
                </span>
              )}
            </div>
          </form>
        </Reveal>

        {/* Appearance & Theme Controls */}
        <Reveal delay={0.05} className="card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Appearance</p>
              <h2 className="mt-1 font-semibold text-slate-900 dark:text-white">Interface Theme</h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Switch between Dark and Light mode anytime from here, the navbar icon, or Ctrl+K.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-surface-border dark:bg-white/[0.03]">
              <button
                type="button"
                onClick={() => applyTheme('dark')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  themeMode === 'dark'
                    ? 'bg-accent text-accent-fg shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Moon size={13} /> Dark
              </button>
              <button
                type="button"
                onClick={() => applyTheme('light')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  themeMode === 'light'
                    ? 'bg-accent text-accent-fg shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Sun size={13} /> Light
              </button>
            </div>
          </div>
        </Reveal>

        {/* Password & Security */}
        <Reveal delay={0.07} className="card space-y-6 p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-signal" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Password &amp; Security</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your account password directly or request a password reset email.
            </p>

            <form onSubmit={handleDirectPasswordUpdate} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900/50 dark:border-surface-border dark:bg-white/[0.03] dark:text-white dark:focus:border-white/50"
              />
              <button type="submit" disabled={pwStatus === 'saving'} className="btn-primary shrink-0">
                <KeyRound size={14} /> {pwStatus === 'saving' ? 'Updating...' : 'Update Password'}
              </button>
            </form>
            {pwStatus === 'saved' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Check size={13} /> Password updated successfully.
              </p>
            )}
            {pwStatus === 'error' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle size={13} /> {pwError}
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-5 dark:border-surface-border">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Email Reset Link</p>
            <button onClick={handlePasswordReset} disabled={status === 'sending'} className="btn-secondary">
              <Send size={14} /> {status === 'sending' ? 'Sending...' : 'Send Password Reset Email'}
            </button>
            {status === 'sent' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Check size={12} /> Check your email for a reset link.
              </p>
            )}
            {status === 'error' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>
        </Reveal>

        {/* Data & Learning Progress Controls */}
        <Reveal delay={0.09} className="card space-y-5 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace &amp; Data Controls</p>
            <h2 className="mt-1 font-semibold text-slate-900 dark:text-white">Manage Saved Activity</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Export your saved progress as JSON or reset specific parts of your local learning history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={handleExportData} className="btn-secondary text-xs">
              <Download size={14} /> Export Data (JSON)
            </button>
            <button type="button" onClick={handleClearHistory} className="btn-secondary text-xs">
              <Trash2 size={14} /> Clear Search History
            </button>
            <button type="button" onClick={handleClearBookmarks} className="btn-secondary text-xs">
              <Trash2 size={14} /> Clear Bookmarks
            </button>
            <button type="button" onClick={handleResetRoadmap} className="btn-secondary text-xs">
              <RotateCcw size={14} /> Reset Roadmap Progress
            </button>
          </div>

          <AnimatePresence>
            {dataNotice && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium text-signal"
              >
                <Check size={13} /> {dataNotice}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="border-t border-slate-200 pt-5 dark:border-surface-border">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">AI lessons</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Code Orbit is free. Each account gets a daily allowance of custom lessons and follow-up questions that resets at midnight UTC.
              Built-in topic guides, practice problems, and the Interview Question Bank are always unlimited.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
