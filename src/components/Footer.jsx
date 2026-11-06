import { Link } from 'react-router-dom'
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
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200/80 py-10 dark:border-surface-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 font-semibold text-slate-900 sm:justify-start dark:text-white"
            >
              <OrbitMark size={18} />
              <span className="font-display text-base font-bold tracking-tight">Code Orbit</span>
            </Link>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Explore. Learn. Master.</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="transition hover:text-slate-900 dark:hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-center border-t border-slate-200/70 pt-6 text-center text-xs text-slate-400 dark:border-surface-border">
          <span>
            &copy; {year} Code Orbit — designed &amp; engineered by{' '}
            <a
              href="https://github.com/AshmitKasana"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-white"
            >
              Ashmit Kasana
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  )
}
