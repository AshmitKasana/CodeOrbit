import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Github, LogIn, LogOut, Menu, Search, UserPlus, X } from 'lucide-react'
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
]

export default function Header({ theme, onToggleTheme, onOpenSearch }) {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const mobileItems = user
    ? [...NAV, { to: '/dashboard', label: 'Dashboard' }, { to: '/profile', label: 'Profile' }, { to: '/bookmarks', label: 'Bookmarks' }, { to: '/about', label: 'About' }]
    : [...NAV, { to: '/about', label: 'About' }, { to: '/login', label: 'Log In' }, { to: '/signup', label: 'Sign Up' }]

  return (
    <GlassNavbar scrolled={scrolled}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <OrbitMark size={20} />
          <span className="font-display text-[15px] tracking-tight">Code Orbit</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item, i) => (
            <NavLink
              key={item.label + i}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `focus-ring rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <GlassTooltip text="Search (⌘K)">
            <button onClick={onOpenSearch} aria-label="Search" className="icon-btn hidden sm:flex">
              <Search size={16} />
            </button>
          </GlassTooltip>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <GlassTooltip text="Ashmit Kasana on GitHub">
            <motion.a
              href="https://github.com/AshmitKasana"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ashmit Kasana on GitHub"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="icon-btn hidden sm:flex"
            >
              <Github size={16} />
            </motion.a>
          </GlassTooltip>

          <button onClick={onOpenSearch} aria-label="Search" className="icon-btn sm:hidden">
            <Search size={16} />
          </button>

          {/* Account slot: avatar menu when signed in, Log In / Sign Up otherwise. */}
          <div className="ml-1 hidden items-center gap-1.5 sm:flex">
            {loading ? (
              <span className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            ) : user ? (
              <AccountMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <LogIn size={14} /> Log In
                </Link>
                <Link to="/signup" className="btn-primary px-3.5 py-1.5 text-sm">
                  <UserPlus size={14} /> Sign Up
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="icon-btn md:hidden">
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
            transition={{ duration: 0.22, ease: 'easeOut' }}
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
              <a
                href="https://github.com/AshmitKasana"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ashmit Kasana on GitHub"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                <Github size={15} /> GitHub
              </a>
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
