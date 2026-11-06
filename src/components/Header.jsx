import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Menu, Search, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import OrbitMark from './OrbitMark'
import GlassNavbar from './glass/GlassNavbar'
import GlassTooltip from './glass/GlassTooltip'
import AccountMenu from './AccountMenu'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/topics', label: 'Topics' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/practice', label: 'Practice' },
  { to: '/interview', label: 'Interview' },
  { to: '/about', label: 'About' },
]

export default function Header({ theme, onToggleTheme, onOpenSearch }) {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const mobileItems = user
    ? [
        ...NAV,
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/profile', label: 'Profile' },
        { to: '/bookmarks', label: 'Bookmarks' },
        { to: '/settings', label: 'Settings' },
      ]
    : [...NAV, { to: '/login', label: 'Log In' }, { to: '/signup', label: 'Sign Up' }]

  return (
    <GlassNavbar scrolled={scrolled}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-10 lg:gap-14 lg:px-8">
        <Link
          to="/"
          className="group flex h-9 shrink-0 items-center gap-3 whitespace-nowrap font-semibold text-slate-900 md:justify-self-end dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-900 shadow-sm transition-transform duration-300 ease-out-expo group-hover:rotate-45 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
            <OrbitMark size={17} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">Code Orbit</span>
        </Link>

        <nav className="hidden h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200/70 bg-slate-100/60 px-1.5 py-1 whitespace-nowrap md:flex md:justify-self-center dark:border-white/[0.07] dark:bg-white/[0.03]">
          {NAV.map((item, i) => (
            <NavLink
              key={item.label + i}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `focus-ring relative flex h-7 items-center whitespace-nowrap rounded-lg px-4 text-xs font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="header-nav-pill"
                      transition={{ type: 'spring', stiffness: 600, damping: 38, mass: 0.5 }}
                      className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-white shadow-sm dark:bg-white/[0.1]"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex h-9 shrink-0 items-center gap-3 whitespace-nowrap md:justify-self-start">
          <GlassTooltip text="Search (⌘K)" side="bottom">
            <button onClick={onOpenSearch} aria-label="Search" className="icon-btn shrink-0">
              <Search size={16} />
            </button>
          </GlassTooltip>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* Account slot: avatar menu when signed in, Log In / Sign Up otherwise. */}
          <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
            {loading ? (
              <span className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            ) : user ? (
              <AccountMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary h-9 shrink-0 whitespace-nowrap rounded-lg px-4 py-0 text-xs font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary h-9 shrink-0 whitespace-nowrap rounded-lg px-4 py-0 text-xs font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="icon-btn shrink-0 md:hidden">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface overflow-hidden rounded-none border-x-0 border-b-0 border-t-black/10 shadow-none dark:border-t-white/10 md:hidden"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {mobileItems.map((item, i) => (
                <NavLink
                  key={item.label + i}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-accent/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </GlassNavbar>
  )
}
