import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import OrbitMark from './OrbitMark'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/topics', label: 'Topics' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/practice', label: 'Practice' },
  { to: '/interview', label: 'Interview' },
  { to: '/about', label: 'About' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10 dark:border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 font-semibold text-slate-900 sm:justify-start dark:text-white">
              <OrbitMark size={16} />
              <span className="font-display">Code Orbit</span>
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

          <a
            href="https://github.com/AshmitKasana"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ashmit Kasana on GitHub"
            className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <Github size={15} /> GitHub
          </a>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row dark:border-surface-border">
          <span>Ashmit Kasana — Owner &amp; Creator</span>
          <span>Made with React, Vite &amp; Tailwind CSS</span>
        </div>
      </div>
    </footer>
  )
}
