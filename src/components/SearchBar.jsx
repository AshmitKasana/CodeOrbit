import { forwardRef, useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Compass, Search, X } from 'lucide-react'
import { EXAMPLE_QUERIES, TOPIC_CATALOG } from '../utils/constants'
import { hasBuiltInGuide } from '../services/knowledgeBase'
import Magnetic from './Magnetic'

const QUICK_LANGUAGES = ['All', 'Python', 'Java', 'C++', 'JavaScript', 'Go', 'Rust']

const ALL_TOPICS = Object.entries(TOPIC_CATALOG).flatMap(([category, topics]) =>
  topics.map((topic) => ({ topic, category, hasGuide: hasBuiltInGuide(topic) }))
)

const SearchBar = forwardRef(function SearchBar({ onSubmit, size = 'lg', autoFocus = false }, ref) {
  const [value, setValue] = useState('')
  const [selectedLang, setSelectedLang] = useState('All')
  const [focused, setFocused] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % EXAMPLE_QUERIES.length), 3200)
    return () => clearInterval(id)
  }, [])

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    return ALL_TOPICS.filter(
      (item) => item.topic.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [value])

  function buildQuery(raw) {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    if (selectedLang !== 'All' && !trimmed.toLowerCase().includes(selectedLang.toLowerCase())) {
      return `${trimmed} in ${selectedLang}`
    }
    return trimmed
  }

  function submit(overrideQuery) {
    const q = buildQuery(typeof overrideQuery === 'string' ? overrideQuery : value)
    if (q) {
      setFocused(false)
      onSubmit(q)
    }
  }

  const big = size === 'lg'

  return (
    <div className="relative w-full">
      <div
        className={`glass-surface flex items-center gap-2.5 rounded-2xl transition focus-within:border-black/25 focus-within:shadow-glow dark:focus-within:border-white/25 ${
          big ? 'px-4 py-3 sm:px-5 sm:py-3.5' : 'px-3.5 py-2'
        }`}
      >
        <Search className="shrink-0 text-slate-400" size={big ? 20 : 17} />
        <input
          ref={ref}
          autoFocus={autoFocus}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={`Search any topic… e.g. "${EXAMPLE_QUERIES[placeholderIdx]}"`}
          className={`w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 ${
            big ? 'text-base sm:text-lg' : 'text-sm'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            aria-label="Clear search"
            className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        )}
        {big && (
          <select
            aria-label="Language filter"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="hidden shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 dark:border-surface-border dark:bg-white/[0.05] dark:text-slate-300 sm:block"
          >
            {QUICK_LANGUAGES.map((lang) => (
              <option key={lang} value={lang} className="bg-white text-slate-900 dark:bg-[#141416] dark:text-white">
                {lang === 'All' ? 'All Languages' : lang}
              </option>
            ))}
          </select>
        )}
        {big && (
          <kbd className="hidden shrink-0 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400 dark:border-surface-border md:block">
            ⌘K
          </kbd>
        )}
        <Magnetic strength={big ? 0.25 : 0}>
          <button
            type="button"
            onClick={() => submit()}
            disabled={!value.trim()}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl bg-accent font-medium text-accent-fg transition active:scale-[0.97] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
              big ? 'px-5 py-2.5 text-sm sm:text-base' : 'px-3.5 py-1.5 text-sm'
            }`}
          >
            Learn <ArrowRight size={16} />
          </button>
        </Magnetic>
      </div>

      {/* Instant autocomplete dropdown */}
      {focused && suggestions.length > 0 && (
        <div className="glass-surface absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white/95 p-1.5 text-left shadow-lg dark:bg-[#141416]/95">
          {suggestions.map((item) => (
            <button
              key={item.topic}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                submit(item.topic)
              }}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2 font-medium">
                <BookOpen size={14} className="text-slate-400" />
                {item.topic}
                {selectedLang !== 'All' && (
                  <span className="text-xs font-normal text-slate-400">in {selectedLang}</span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                {item.hasGuide && (
                  <span className="rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 text-[10px] font-semibold text-signal">
                    Guide
                  </span>
                )}
                <span className="text-xs text-slate-400">{item.category}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {big && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-400">Try:</span>
          {EXAMPLE_QUERIES.slice(0, 5).map((ex) => (
            <button key={ex} type="button" onClick={() => submit(ex)} className="chip text-xs">
              {ex}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const random = ALL_TOPICS[Math.floor(Math.random() * ALL_TOPICS.length)]
              if (random) submit(random.topic)
            }}
            className="chip inline-flex items-center gap-1 border-signal/30 text-xs font-medium text-signal hover:border-signal"
            title="Open a random DSA topic"
          >
            <Compass size={13} /> Surprise me
          </button>
        </div>
      )}
    </div>
  )
})

export default SearchBar
