import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, ChevronRight, LayoutDashboard, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function initialsFor(name, email) {
  const source = name || email || '?'
  const parts = source.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/**
 * The logged-in state of the navbar's account slot: an avatar button that
 * opens an animated Liquid Glass dropdown (Dashboard / Profile / Bookmarks /
 * Settings / Sign Out).
 */
export default function AccountMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const name = user?.user_metadata?.name || null
  const email = user?.email || ''

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-fg transition active:scale-95"
      >
        {initialsFor(name, email)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="glass-surface absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-xl bg-white/90 p-1.5 dark:bg-[#141416]/90"
          >
            <div className="border-b border-black/10 px-3 py-2.5 dark:border-white/10">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{name || email.split('@')[0]}</p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
            <div className="p-1">
              {ITEMS.map((item) => (
                <button
                  key={item.to}
                  onClick={() => {
                    setOpen(false)
                    navigate(item.to)
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <item.icon size={15} className="text-slate-400" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={13} className="text-slate-300 opacity-0 transition group-hover:opacity-100 dark:text-slate-600" />
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
