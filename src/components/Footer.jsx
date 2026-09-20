import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import OrbitMark from './OrbitMark'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/topics', label: 'Topics' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/practice', label: 'Practice' },
  { to: '/interview', label: 'Interview' },
  { to: '/visualizer', label: 'Visualizer' },
  { to: '/complexity', label: 'Big-O' },
  { to: '/about', label: 'About' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 py-10 dark:border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 font-semibold text-slate-900 sm:justify-start dark:text-white">
              <OrbitMark size={18} />
              <span className="font-display text-base">Code Orbit</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore. Learn. Master.</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="transition hover:text-slate-900 dark:hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Signature block — the most-seen credit on the site, since the
              footer renders on every single page. */}
          <a
            href="https://github.com/AshmitKasana"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ashmit Kasana on GitHub"
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-signal/40 dark:border-surface-border"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/10 text-signal transition group-hover:animate-orbitSpin">
              <OrbitMark size={16} />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">Ashmit Kasana</span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Github size={11} /> Owner &amp; Creator
              </span>
            </span>
          </a>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row dark:border-surface-border">
          <span>
            &copy; {year} Code Orbit — designed &amp; engineered by{' '}
            <a
              href="https://github.com/AshmitKasana"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 dark:text-slate-400 dark:decoration-slate-600 dark:hover:text-white"
            >
              Ashmit Kasana
            </a>
            .
          </span>
          <span>Made with React, Vite &amp; Tailwind CSS</span>
        </div>
      </div>
    </footer>
  )
}
