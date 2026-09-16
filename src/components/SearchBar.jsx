import { forwardRef, useEffect, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { EXAMPLE_QUERIES } from '../utils/constants'
import Magnetic from './Magnetic'

const SearchBar = forwardRef(function SearchBar({ onSubmit, size = 'lg', autoFocus = false }, ref) {
  const [value, setValue] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % EXAMPLE_QUERIES.length), 3200)
    return () => clearInterval(id)
  }, [])

  function submit() {
    const q = value.trim()
    if (q) onSubmit(q)
  }

  const big = size === 'lg'

  return (
    <div className="w-full">
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
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={`e.g. "${EXAMPLE_QUERIES[placeholderIdx]}"`}
          className={`w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 ${
            big ? 'text-lg' : 'text-sm'
          }`}
        />
        {big && (
          <kbd className="hidden shrink-0 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400 dark:border-surface-border sm:block">
            ⌘K
          </kbd>
        )}
        <Magnetic strength={big ? 0.3 : 0}>
          <button
            onClick={submit}
            disabled={!value.trim()}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl bg-accent font-medium text-accent-fg transition active:scale-[0.97] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
              big ? 'px-5 py-2.5' : 'px-3.5 py-1.5 text-sm'
            }`}
          >
            Learn <ArrowRight size={16} />
          </button>
        </Magnetic>
      </div>

      {big && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {EXAMPLE_QUERIES.slice(0, 4).map((ex) => (
            <button key={ex} onClick={() => onSubmit(ex)} className="chip text-xs">
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default SearchBar
