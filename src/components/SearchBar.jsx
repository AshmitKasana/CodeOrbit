import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BookOpen, Check, ChevronDown, Code2, Search, X } from 'lucide-react'
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
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const langMenuRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % EXAMPLE_QUERIES.length), 3200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!langMenuOpen) return
    function onDocClick(e) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false)
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setLangMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [langMenuOpen])

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
    const raw =
      typeof overrideQuery === 'string'
        ? overrideQuery
        : value.trim() || EXAMPLE_QUERIES[placeholderIdx]
    const q = buildQuery(raw)
    if (q) {
      setFocused(false)
      setLangMenuOpen(false)
      onSubmit(q)
    }
  }

  const big = size === 'lg'

  return (
    <div className="relative w-full">
      <div
        className={`glass-surface flex items-center gap-3 rounded-2xl transition focus-within:border-black/25 focus-within:shadow-glow dark:focus-within:border-white/25 ${
          big ? 'px-5 py-4' : 'px-4 py-2.5'
        }`}
      >
        <Search className="shrink-0 text-slate-400" size={big ? 22 : 18} />
        <input
          ref={ref}
          autoFocus={autoFocus}
          value={value}
          onFocus={() => {
            setFocused(true)
            setLangMenuOpen(false)
          }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={`e.g. "${EXAMPLE_QUERIES[placeholderIdx]}"`}
          className={`w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 ${
            big ? 'text-lg' : 'text-sm'
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
          <div ref={langMenuRef} className="relative hidden shrink-0 sm:block">
            <button
              type="button"
              aria-label="Choose language"
              aria-expanded={langMenuOpen}
              onClick={() => setLangMenuOpen((o) => !o)}
              className={`glass-surface glass-interactive flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedLang !== 'All'
                  ? 'border-signal/40 bg-signal/10 text-signal dark:border-signal/40 dark:bg-signal/15'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <Code2 size={13} className={selectedLang !== 'All' ? 'text-signal' : 'text-slate-400'} />
              <span>{selectedLang === 'All' ? 'All Languages' : selectedLang}</span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  role="listbox"
                  aria-label="Language options"
                  className="glass-surface absolute right-0 top-[calc(100%+8px)] z-40 min-w-[11rem] overflow-hidden rounded-2xl bg-white/95 p-1.5 text-left shadow-xl backdrop-blur-xl dark:bg-[#141416]/95"
                >
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Language
                  </div>
                  {QUICK_LANGUAGES.map((lang) => {
                    const active = selectedLang === lang
                    return (
                      <button
                        key={lang}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSelectedLang(lang)
                          setLangMenuOpen(false)
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs transition ${
                          active
                            ? 'bg-signal/10 font-semibold text-signal dark:bg-signal/15'
                            : 'font-medium text-slate-700 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>{lang === 'All' ? 'All Languages' : lang}</span>
                        {active && <Check size={13} className="shrink-0 text-signal" />}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <Magnetic strength={big ? 0.3 : 0}>
          <button
            type="button"
            onClick={() => submit()}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl bg-accent font-medium text-accent-fg transition active:scale-[0.97] hover:opacity-90 ${
              big ? 'px-5 py-2.5' : 'px-3.5 py-1.5 text-sm'
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
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {EXAMPLE_QUERIES.slice(0, 5).map((ex) => (
            <button key={ex} type="button" onClick={() => submit(ex)} className="chip text-xs">
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default SearchBar
