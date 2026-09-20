import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'

/** Transport bar shared by the sorting and searching labs. */
export default function PlaybackControls({ playback, total, speed, onSpeedChange }) {
  const { index, playing, atEnd, toggle, next, prev, restart, seek } = playback
  const last = Math.max(0, total - 1)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={restart} className="icon-btn" aria-label="Restart" title="Restart">
          <RotateCcw size={15} />
        </button>
        <button onClick={prev} disabled={index === 0} className="icon-btn disabled:opacity-40" aria-label="Previous step" title="Previous step (←)">
          <SkipBack size={15} />
        </button>
        <button onClick={toggle} className="btn-primary min-w-[6.5rem]" aria-label={playing ? 'Pause' : 'Play'} title="Play / pause (Space)">
          {playing ? <Pause size={15} /> : <Play size={15} />}
          {playing ? 'Pause' : atEnd && index > 0 ? 'Replay' : 'Play'}
        </button>
        <button onClick={next} disabled={atEnd} className="icon-btn disabled:opacity-40" aria-label="Next step" title="Next step (→)">
          <SkipForward size={15} />
        </button>

        <label className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Speed
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-28 accent-[#5b7fff]"
            aria-label="Playback speed"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={last}
          value={Math.min(index, last)}
          onChange={(e) => seek(Number(e.target.value))}
          className="flex-1 accent-[#5b7fff]"
          aria-label="Timeline"
        />
        <span className="w-24 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
          {Math.min(index, last) + 1} / {total}
        </span>
      </div>
    </div>
  )
}
