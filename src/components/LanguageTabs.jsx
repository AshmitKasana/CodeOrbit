import { motion } from 'framer-motion'

export default function LanguageTabs({ languages, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2 dark:border-surface-border">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className="relative rounded-lg px-3 py-1.5 text-sm font-medium transition active:scale-[0.97]"
        >
          {active === lang && (
            <motion.span
              layoutId="lang-tab-active"
              className="absolute inset-0 rounded-lg bg-accent"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative ${active === lang ? 'text-accent-fg' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
            {lang}
          </span>
        </button>
      ))}
    </div>
  )
}
