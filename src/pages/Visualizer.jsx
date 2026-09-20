import { useState } from 'react'
import { ArrowDownUp, Search } from 'lucide-react'
import Reveal from '../components/Reveal'
import SortingLab from '../components/visualizer/SortingLab'
import SearchLab from '../components/visualizer/SearchLab'

const TABS = [
  { id: 'sorting', label: 'Sorting', icon: ArrowDownUp },
  { id: 'searching', label: 'Searching', icon: Search },
]

export default function Visualizer() {
  const [tab, setTab] = useState('sorting')

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-surface-border dark:text-slate-400">
          Interactive lab
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Algorithm Visualizer</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          Watch algorithms think, one step at a time. Pause, step backwards, change the input, or race two sorting algorithms on the
          same data. Runs entirely in your browser — no AI quota needed.
        </p>
      </Reveal>

      <div className="mb-6 flex justify-center">
        <div role="tablist" className="inline-flex rounded-xl border border-slate-200 p-1 dark:border-surface-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? 'bg-accent text-accent-fg'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sorting' ? <SortingLab /> : <SearchLab />}
    </div>
  )
}
