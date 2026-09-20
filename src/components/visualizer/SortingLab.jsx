import { useEffect, useMemo, useRef, useState } from 'react'
import { Flag, Shuffle } from 'lucide-react'
import BarChart, { Legend } from './BarChart'
import PlaybackControls from './PlaybackControls'
import { usePlayback } from '../../hooks/usePlayback'
import { useAuth } from '../../hooks/useAuth'
import { recordActivity } from '../../lib/progress'
import { ARRAY_PRESETS, SORTING_ALGORITHMS, arrayPreset, generateSortingSteps, getSortingAlgorithm } from '../../lib/algorithms/sorting'

const MIN_SIZE = 8
const MAX_SIZE = 60

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.04]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}

function Panel({ algo, step, totalSteps, index, maxValue, showValues, finished }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{algo.name}</h3>
        {finished && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Flag size={11} /> Finished
          </span>
        )}
      </div>
      <BarChart step={step} maxValue={maxValue} showValues={showValues} />
      <p className="mt-3 min-h-[2.5rem] text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
        {step.message}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Comparisons" value={step.comparisons} />
        <Stat label={algo.id === 'merge' ? 'Writes' : 'Swaps'} value={step.swaps} />
        <Stat label="Step" value={`${Math.min(index, totalSteps - 1) + 1}/${totalSteps}`} />
      </div>
    </div>
  )
}

export default function SortingLab() {
  const { user } = useAuth()
  const [algoId, setAlgoId] = useState('bubble')
  const [raceId, setRaceId] = useState('')
  const [size, setSize] = useState(24)
  const [preset, setPreset] = useState('random')
  const [speed, setSpeed] = useState(6)
  const [array, setArray] = useState(() => arrayPreset('random', 24))

  const algo = getSortingAlgorithm(algoId)
  const raceAlgo = raceId ? getSortingAlgorithm(raceId) : null

  const stepsA = useMemo(() => generateSortingSteps(algoId, array), [algoId, array])
  const stepsB = useMemo(() => (raceId ? generateSortingSteps(raceId, array) : null), [raceId, array])
  const total = Math.max(stepsA.length, stepsB?.length ?? 0)
  const resetKey = `${algoId}|${raceId}|${array.join(',')}`

  const playback = usePlayback(total, { speed, resetKey })
  const stepAt = (steps) => steps[Math.min(playback.index, steps.length - 1)]
  const stepA = stepAt(stepsA)
  const stepB = stepsB ? stepAt(stepsB) : null
  const maxValue = Math.max(...array, 1)

  function newArray(nextPreset = preset, nextSize = size) {
    setArray(arrayPreset(nextPreset, nextSize))
  }

  // Count a completed run toward the learner's streak, once per run.
  const recordedFor = useRef(null)
  useEffect(() => {
    if (playback.atEnd && playback.index > 0 && recordedFor.current !== resetKey) {
      recordedFor.current = resetKey
      recordActivity(user?.id, 'visualizer')
    }
  }, [playback.atEnd, playback.index, resetKey, user?.id])

  // Keyboard: Space = play/pause, ←/→ = step.
  const { toggle, next, prev } = playback
  useEffect(() => {
    function onKeyDown(e) {
      if (e.target.closest?.('input, select, textarea, button, [contenteditable]')) return
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle, next, prev])

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-4 sm:p-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Algorithm</p>
          <div className="flex flex-wrap gap-2">
            {SORTING_ALGORITHMS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAlgoId(a.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  algoId === a.id
                    ? 'border-slate-900 bg-accent/10 font-medium text-slate-900 dark:border-white dark:text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-900/40 dark:border-surface-border dark:text-slate-300 dark:hover:border-white/40'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-500 dark:text-slate-400">
            <span className="mb-1.5 block font-semibold uppercase tracking-wide text-slate-400">Array size: {size}</span>
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={size}
              onChange={(e) => {
                const next = Number(e.target.value)
                setSize(next)
                newArray(preset, next)
              }}
              className="w-full accent-[#5b7fff]"
            />
          </label>

          <label className="text-xs text-slate-500 dark:text-slate-400">
            <span className="mb-1.5 block font-semibold uppercase tracking-wide text-slate-400">Input shape</span>
            <select
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value)
                newArray(e.target.value, size)
              }}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 dark:border-surface-border dark:bg-surface-card dark:text-slate-200"
            >
              {ARRAY_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-500 dark:text-slate-400">
            <span className="mb-1.5 block font-semibold uppercase tracking-wide text-slate-400">Race against</span>
            <select
              value={raceId}
              onChange={(e) => setRaceId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 dark:border-surface-border dark:bg-surface-card dark:text-slate-200"
            >
              <option value="">— none —</option>
              {SORTING_ALGORITHMS.filter((a) => a.id !== algoId).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button onClick={() => newArray()} className="btn-secondary w-full">
              <Shuffle size={15} /> New array
            </button>
          </div>
        </div>
      </div>

      <div className={`grid gap-5 ${raceAlgo ? 'lg:grid-cols-2' : ''}`}>
        <Panel
          algo={algo}
          step={stepA}
          totalSteps={stepsA.length}
          index={playback.index}
          maxValue={maxValue}
          showValues={size <= 24 && !raceAlgo}
          finished={playback.index >= stepsA.length - 1}
        />
        {raceAlgo && (
          <Panel
            algo={raceAlgo}
            step={stepB}
            totalSteps={stepsB.length}
            index={playback.index}
            maxValue={maxValue}
            showValues={false}
            finished={playback.index >= stepsB.length - 1}
          />
        )}
      </div>

      <div className="card space-y-4 p-4 sm:p-5">
        <PlaybackControls playback={playback} total={total} speed={speed} onSpeedChange={setSpeed} />
        <Legend />
      </div>

      {raceAlgo && (
        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Race result on this array ({size} values)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[[algo, stepsA], [raceAlgo, stepsB]].map(([a, steps]) => {
              const end = steps[steps.length - 1]
              return (
                <div key={a.id} className="rounded-xl border border-slate-200 p-3 dark:border-surface-border">
                  <div className="font-medium text-slate-900 dark:text-white">{a.name}</div>
                  <div className="mt-1 font-mono text-sm text-slate-600 dark:text-slate-300">
                    {end.comparisons} comparisons · {end.swaps} {a.id === 'merge' ? 'writes' : 'swaps'} · {steps.length - 1} steps
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h3 className="mb-2 font-display text-base font-semibold text-slate-900 dark:text-white">How {algo.name} works</h3>
          <p className="prose-dsa text-sm">{algo.blurb}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat label="Best" value={algo.best} />
            <Stat label="Average" value={algo.average} />
            <Stat label="Worst" value={algo.worst} />
            <Stat label="Space" value={algo.space} />
            <Stat label="Stable" value={algo.stable ? 'Yes' : 'No'} />
          </div>
        </div>
        <div className="card p-4 sm:p-5">
          <h3 className="mb-2 font-display text-base font-semibold text-slate-900 dark:text-white">Pseudocode</h3>
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 font-mono text-[13px] leading-relaxed text-slate-700 dark:bg-white/[0.04] dark:text-slate-200">
            {algo.pseudocode.join('\n')}
          </pre>
          <p className="mt-3 text-xs text-slate-400">Tip: try “Nearly sorted” with Insertion Sort, or “Reversed” with Quick Sort, to see best and worst cases.</p>
        </div>
      </div>
    </div>
  )
}
