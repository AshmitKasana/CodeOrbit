import { Link } from 'react-router-dom'
import OrbitMark from './OrbitMark'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 dark:border-surface-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <OrbitMark size={14} />
          <span>Code Orbit — explore. learn. master.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="transition hover:text-slate-800 dark:hover:text-slate-200">
            About
          </Link>
          <span>Created by Ashmit Kasana</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">React, Vite &amp; Tailwind CSS</span>
        </div>
      </div>
    </footer>
  )
}
