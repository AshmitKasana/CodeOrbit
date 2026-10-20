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

  function jumpTo(e, id) {
    e.preventDefault()
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-2 lg:block">
      <p className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-slate-200 dark:border-surface-border">
        {SIDEBAR_SECTIONS.map((s) => (
          <li key={s.id} className="relative">
            {active === s.id && (
              <span className="absolute -left-px top-1 bottom-1 w-0.5 rounded-full bg-signal" />
            )}
            <a
              href={`#${s.id}`}
              onClick={(e) => jumpTo(e, s.id)}
              className={`block rounded-r-lg px-3 py-1.5 text-xs transition ${
                active === s.id
                  ? 'bg-signal/10 font-semibold text-signal'
                  : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-100'
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
