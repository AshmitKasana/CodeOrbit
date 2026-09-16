import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Github, Menu, Search, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import OrbitMark from './OrbitMark'
import GlassNavbar from './glass/GlassNavbar'
import GlassTooltip from './glass/GlassTooltip'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/topics', label: 'Topics' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/practice', label: 'Practice' },
  { to: '/interview', label: 'Interview' },
]

export default function Header({ theme, onToggleTheme, onOpenSearch }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
          <GlassTooltip text="GitHub">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="icon-btn hidden sm:flex">
              <Github size={16} />
            </a>
          </GlassTooltip>
          <GlassTooltip text="Bookmarks">
            <Link to="/bookmarks" aria-label="Bookmarks" className="icon-btn hidden sm:flex">
              <Bookmark size={16} />
            </Link>
          </GlassTooltip>
          <button onClick={onOpenSearch} aria-label="Search" className="icon-btn sm:hidden">
            <Search size={16} />
          </button>
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
              {[...NAV, { to: '/bookmarks', label: 'Bookmarks' }, { to: '/about', label: 'About' }].map((item, i) => (
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
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </GlassNavbar>
  )
}
