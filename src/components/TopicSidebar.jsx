import { useEffect, useState } from 'react'
import { SIDEBAR_SECTIONS } from '../utils/constants'
import GlassDropdown from './glass/GlassDropdown'

export default function TopicSidebar() {
  const [active, setActive] = useState(SIDEBAR_SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    SIDEBAR_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-2 lg:block">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">On this page</p>
      <ul className="space-y-0.5 border-l border-slate-200 dark:border-surface-border">
        {SIDEBAR_SECTIONS.map((s) => (
          <li key={s.id} className="relative">
            {active === s.id && <span className="absolute -left-px top-0 h-full w-px bg-slate-900 dark:bg-white" />}
            <a
              href={`#${s.id}`}
              className={`block px-3 py-1.5 text-sm transition ${
                active === s.id
                  ? 'font-medium text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function MobileTopicNav() {
  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mb-4 lg:hidden">
      <GlassDropdown
        label="Jump to section"
        options={SIDEBAR_SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
        onSelect={jumpTo}
        fullWidth
      />
    </div>
  )
}
