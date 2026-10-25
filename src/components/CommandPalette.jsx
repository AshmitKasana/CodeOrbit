import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Bookmark, BookOpen, Brain, Github, Home as HomeIcon, Info, LayoutDashboard, LogIn, LogOut,
  MessageCircleQuestion, Moon, Route, Search, Sun, Target, UserPlus,
} from 'lucide-react'
import GlassModal from './glass/GlassModal'
import { TOPIC_CATALOG } from '../utils/constants'
import { hasBuiltInGuide, searchAllDSA } from '../services/knowledgeBase'
import { slugify } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'

const TOPIC_COMMANDS = Object.entries(TOPIC_CATALOG).flatMap(([category, topics]) =>
  topics.map((topic) => ({
    id: `topic-${slugify(topic)}`,
    label: topic,
    badge: category,
    hasGuide: hasBuiltInGuide(topic),
    topic,
  }))
)

/**
 * Global ⌘K / Ctrl+K command palette — works from any page: jump anywhere in
 * the app, search across all 65+ DSA topics & guides, toggle the theme, or
 * type a free-text DSA question and route straight to a Learn page.
 */
export default function CommandPalette({ open, onClose, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  const staticCommands = useMemo(
    () => [
      { id: 'home', label: 'Go to Home', badge: 'Page', icon: HomeIcon, action: () => navigate('/') },
      { id: 'topics', label: 'Browse All Topics & Guides', badge: 'Page', icon: Brain, action: () => navigate('/topics') },
      { id: 'roadmap', label: 'Open the DSA Roadmap', badge: 'Page', icon: Route, action: () => navigate('/roadmap') },
      { id: 'practice', label: 'Practice Problems', badge: 'Page', icon: Target, action: () => navigate('/practice') },
      { id: 'interview', label: 'Interview Question Bank & Quiz', badge: 'Page', icon: MessageCircleQuestion, action: () => navigate('/interview') },
      ...(user
        ? [
            { id: 'dashboard', label: 'Go to Dashboard', badge: 'Account', icon: LayoutDashboard, action: () => navigate('/dashboard') },
            { id: 'bookmarks', label: 'View Bookmarks', badge: 'Account', icon: Bookmark, action: () => navigate('/bookmarks') },
          ]
        : [
            { id: 'login', label: 'Log In', badge: 'Account', icon: LogIn, action: () => navigate('/login') },
            { id: 'signup', label: 'Sign Up', badge: 'Account', icon: UserPlus, action: () => navigate('/signup') },
          ]),
      { id: 'about', label: 'About Code Orbit', badge: 'Page', icon: Info, action: () => navigate('/about') },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        badge: 'Theme',
        icon: theme === 'dark' ? Sun : Moon,
        action: onToggleTheme,
      },
      {
        id: 'github',
        label: "Open Ashmit Kasana's GitHub",
        badge: 'External',
        icon: Github,
        action: () => window.open('https://github.com/AshmitKasana', '_blank', 'noopener,noreferrer'),
      },
      ...(user ? [{ id: 'signout', label: 'Sign Out', badge: 'Account', icon: LogOut, action: async () => { await signOut(); navigate('/') } }] : []),
    ],
    [navigate, theme, onToggleTheme, user, signOut]
  )

  const topicItems = useMemo(
    () =>
      TOPIC_COMMANDS.map((t) => ({
        ...t,
        icon: BookOpen,
        action: () => navigate(`/learn/${slugify(t.topic)}`, { state: { rawQuery: t.topic } }),
      })),
    [navigate]
  )

  const q = query.trim().toLowerCase()
  const filteredStatic = q
    ? staticCommands.filter((c) => c.label.toLowerCase().includes(q) || (c.badge && c.badge.toLowerCase().includes(q)))
    : staticCommands
  const filteredTopics = useMemo(() => {
    if (!q) return topicItems.filter((t) => t.hasGuide).slice(0, 8)
    return searchAllDSA(q, 10).map((res) => ({
      id: `search-${res.id}`,
      label: res.title,
      sublabel: res.hook,
      badge: res.complexity ? `${res.complexity} · ${res.category}` : res.category,
      icon: res.type === 'problem' ? MessageCircleQuestion : BookOpen,
      action: () => navigate(`/learn/${slugify(res.query)}`, { state: { rawQuery: res.query } }),
    }))
  }, [q, topicItems, navigate])

  const askAction = query.trim()
    ? [{ id: 'ask', label: `Learn "${query.trim()}"`, badge: 'Custom Query', icon: Search, action: () => navigate(`/learn/${slugify(query.trim())}`, { state: { rawQuery: query.trim() } }) }]
    : []

  const items = [...askAction, ...filteredTopics, ...filteredStatic]

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 20)
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
          placeholder="Jump to any DSA topic, pattern guide, or page..."
          className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        <kbd className="shrink-0 rounded-md border border-black/10 px-1.5 py-0.5 text-xs text-slate-400 dark:border-white/10">esc</kbd>
      </div>

      <div className="max-h-[55vh] overflow-y-auto p-2">
        {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">No matches.</p>}
        {items.map((item, i) => (
          <button
            key={item.id}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => run(item)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
              i === activeIndex ? 'bg-black/[0.06] dark:bg-white/10' : ''
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/10 text-slate-500 dark:border-white/10 dark:text-slate-400">
              <item.icon size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-slate-800 dark:text-slate-100">{item.label}</p>
              {item.sublabel && (
                <p className="truncate text-xs text-slate-400">{item.sublabel}</p>
              )}
            </div>
            {item.badge && (
              <span className="shrink-0 text-xs text-slate-400">{item.badge}</span>
            )}
            {i === activeIndex && <ArrowRight size={14} className="shrink-0 text-slate-400" />}
          </button>
        ))}
      </div>
    </GlassModal>
  )
}
