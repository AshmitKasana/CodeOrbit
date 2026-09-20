import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Bookmark, Brain, Github, Home as HomeIcon, Info, LayoutDashboard, LogIn, LogOut,
  MessageCircleQuestion, Moon, Route, Search, Sparkles, Sun, Target, UserPlus,
} from 'lucide-react'
import GlassModal from './glass/GlassModal'
import { slugify } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'

/**
 * Global ⌘K / Ctrl+K command palette — the one place a Glass modal owns
 * real navigation, not just a visual flourish. Works from any page: jump
 * anywhere in the app, toggle the theme, or type a free-text DSA question
 * and it routes straight to a Learn page, same as the home search bar.
 */
export default function CommandPalette({ open, onClose, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  const staticCommands = useMemo(
    () => [
      { id: 'home', label: 'Go to Home', icon: HomeIcon, action: () => navigate('/') },
      { id: 'topics', label: 'Browse Topics', icon: Brain, action: () => navigate('/topics') },
      { id: 'roadmap', label: 'Open the Roadmap', icon: Route, action: () => navigate('/roadmap') },
      { id: 'practice', label: 'Practice Problems', icon: Target, action: () => navigate('/practice') },
      { id: 'interview', label: 'Interview Prep', icon: MessageCircleQuestion, action: () => navigate('/interview') },
      { id: 'visualizer', label: 'Algorithm Visualizer', icon: Sparkles, action: () => navigate('/visualizer') },
      { id: 'complexity', label: 'Big-O Explorer', icon: BarChart3, action: () => navigate('/complexity') },
      ...(user
        ? [
            { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
            { id: 'bookmarks', label: 'View Bookmarks', icon: Bookmark, action: () => navigate('/bookmarks') },
          ]
        : [
            { id: 'login', label: 'Log In', icon: LogIn, action: () => navigate('/login') },
            { id: 'signup', label: 'Sign Up', icon: UserPlus, action: () => navigate('/signup') },
          ]),
      { id: 'about', label: 'About Code Orbit', icon: Info, action: () => navigate('/about') },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: theme === 'dark' ? Sun : Moon,
        action: onToggleTheme,
      },
      {
        id: 'github',
        label: "Open Ashmit Kasana's GitHub",
        icon: Github,
        action: () => window.open('https://github.com/AshmitKasana', '_blank', 'noopener,noreferrer'),
      },
      ...(user ? [{ id: 'signout', label: 'Sign Out', icon: LogOut, action: async () => { await signOut(); navigate('/') } }] : []),
    ],
    [navigate, theme, onToggleTheme, user, signOut]
  )

  const q = query.trim().toLowerCase()
  const filtered = q ? staticCommands.filter((c) => c.label.toLowerCase().includes(q)) : staticCommands

  const askAction = query.trim()
    ? [{ id: 'ask', label: `Ask Code Orbit about "${query.trim()}"`, icon: Search, action: () => navigate(`/learn/${slugify(query.trim())}`, { state: { rawQuery: query.trim() } }) }]
    : []

  const items = [...askAction, ...filtered]

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  function run(item) {
    item.action()
    onClose()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault()
      run(items[activeIndex])
    }
  }

  return (
    <GlassModal open={open} onClose={onClose}>
      <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3.5 dark:border-white/10">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search topics, or ask anything..."
          className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        <kbd className="shrink-0 rounded-md border border-black/10 px-1.5 py-0.5 text-xs text-slate-400 dark:border-white/10">esc</kbd>
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-2">
        {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">No matches.</p>}
        {items.map((item, i) => (
          <button
            key={item.id}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => run(item)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              i === activeIndex ? 'bg-black/[0.06] dark:bg-white/10' : ''
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/10 text-slate-500 dark:border-white/10 dark:text-slate-400">
              <item.icon size={14} />
            </span>
            <span className="flex-1 truncate text-slate-800 dark:text-slate-100">{item.label}</span>
            {i === activeIndex && <ArrowRight size={14} className="shrink-0 text-slate-400" />}
          </button>
        ))}
      </div>
    </GlassModal>
  )
}
