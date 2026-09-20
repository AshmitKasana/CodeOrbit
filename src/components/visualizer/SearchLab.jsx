import { useEffect, useMemo, useRef, useState } from 'react'
import { Shuffle } from 'lucide-react'
import PlaybackControls from './PlaybackControls'
import { usePlayback } from '../../hooks/usePlayback'
import { useAuth } from '../../hooks/useAuth'
import { recordActivity } from '../../lib/progress'
import { binarySearchSteps, compareSearchCosts, linearSearchSteps } from '../../lib/algorithms/searching'

const SIZES = [8, 12, 16, 20, 24]

/** A sorted array of distinct integers. */
function makeSortedArray(n) {
  const values = new Set()
  while (values.size < n) values.add(1 + Math.floor(Math.random() * 99))
  return [...values].sort((a, b) => a - b)
}

/** A value that is not in the array (to demonstrate an unsuccessful search). */
function missingValue(array) {
  for (let v = 1 + Math.floor(Math.random() * 99), tries = 0; tries < 200; v = (v % 99) + 1, tries++) {
    if (!array.includes(v)) return v
  }
  return 0
}

function cellClass(step, index, found) {
  if (found === index) return 'border-emerald-500 bg-emerald-500 text-white'
  if (step.checking === index) return 'border-signal bg-signal text-white'
  if (step.eliminated.includes(index)) return 'border-slate-200 text-slate-300 dark:border-surface-border dark:text-slate-600'
  if (step.lo !== null && index >= step.lo && index <= step.hi) return 'border-signal/50 text-slate-900 dark:text-white'
  return 'border-slate-300 text-slate-800 dark:border-slate-600 dark:text-slate-100'
}

export default function SearchLab() {
  const { user } = useAuth()
  const [size, setSize] = useState(16)
  const [array, setArray] = useState(() => makeSortedArray(16))
  const [target, setTarget] = useState(() => array[11])
  const [algoId, setAlgoId] = useState('binary')
  const [speed, setSpeed] = useState(4)

  const steps = useMemo(
    () => (algoId === 'binary' ? binarySearchSteps(array, target) : linearSearchSteps(array, target)),
    [algoId, array, target]
  )
  const costs = useMemo(() => compareSearchCosts(array, target), [array, target])
  const resetKey = `${algoId}|${target}|${array.join(',')}`
  const playback = usePlayback(steps.length, { speed, resetKey })
  const step = steps[Math.min(playback.index, steps.length - 1)]
  const finished = playback.index >= steps.length - 1
  const found = finished ? step.found : null

  const recordedFor = useRef(null)
  useEffect(() => {
    if (playback.atEnd && playback.index > 0 && recordedFor.current !== resetKey) {
      recordedFor.current = resetKey
      recordActivity(user?.id, 'visualizer')
    }
  }, [playback.atEnd, playback.index, resetKey, user?.id])

  function regenerate(n = size) {
    const next = makeSortedArray(n)
    setArray(next)
    setTarget(next[Math.floor(Math.random() * next.length)])
  }

  const maxComparisons = Math.max(costs.linear, costs.binary, 1)

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Algorithm</p>
            <div className="flex gap-2">
              {[['binary', 'Binary search'], ['linear', 'Linear search']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setAlgoId(id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    algoId === id
                      ? 'border-slate-900 bg-accent/10 font-medium text-slate-900 dark:border-white dark:text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="text-xs text-slate-500 dark:text-slate-400">
            <span className="mb-1.5 block font-semibold uppercase tracking-wide text-slate-400">Array size: {size}</span>
            <input
              type="range"
              min="0"
              max={SIZES.length - 1}
              value={SIZES.indexOf(size)}
              onChange={(e) => {
                const next = SIZES[Number(e.target.value)]
                setSize(next)
                regenerate(next)
              }}
              className="w-full accent-[#5b7fff]"
            />
          </label>

          <label className="text-xs text-slate-500 dark:text-slate-400">
            <span className="mb-1.5 block font-semibold uppercase tracking-wide text-slate-400">Target value</span>
            <select
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 dark:border-surface-border dark:bg-surface-card dark:text-slate-200"
            >
              {array.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
              {!array.includes(target) && <option value={target}>{target} (not in array)</option>}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button onClick={() => regenerate()} className="btn-secondary flex-1">
              <Shuffle size={15} /> New array
            </button>
            <button onClick={() => setTarget(missingValue(array))} className="btn-secondary flex-1" title="Pick a value that is not in the array">
              Missing value
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Looking for <span className="font-mono text-signal">{target}</span>
          </h3>
          {finished && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                step.found !== null ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/15 text-slate-500 dark:text-slate-400'
              }`}
            >
              {step.found !== null ? `Found at index ${step.found}` : 'Not found'}
            </span>
          )}
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max justify-center gap-1.5">
            {array.map((value, i) => (
              <div key={i} className="flex w-11 flex-col items-center gap-1">
                <span className="h-4 font-mono text-[10px] font-semibold text-signal">
                  {[step.lo === i && 'lo', step.checking === i && step.lo !== null && 'mid', step.hi === i && 'hi'].filter(Boolean).join('·')}
                </span>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold transition-colors duration-150 ${cellClass(step, i, found)}`}>
                  {value}
                </div>
                <span className="font-mono text-[10px] text-slate-400">{i}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 min-h-[2.5rem] text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
          {step.message}
        </p>
        <p className="font-mono text-xs text-slate-400">Comparisons so far: {step.comparisons}</p>
      </div>

      <div className="card p-4 sm:p-5">
        <PlaybackControls playback={playback} total={steps.length} speed={speed} onSpeedChange={setSpeed} />
      </div>

      <div className="card p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Cost for this search: linear vs binary</h3>
        <div className="space-y-3">
          {[['Linear search', costs.linear, 'bg-slate-400 dark:bg-slate-500'], ['Binary search', costs.binary, 'bg-signal']].map(([label, count, color]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{label}</span>
                <span className="font-mono">{count} comparisons</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(count / maxComparisons) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Binary search needs a sorted array but takes O(log n) comparisons — about {Math.floor(Math.log2(array.length)) + 1} at most for {array.length} values —
          while linear search is O(n).
        </p>
      </div>
    </div>
  )
}
