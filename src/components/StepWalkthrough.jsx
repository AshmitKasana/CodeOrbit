import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

/**
 * Turns a lesson's "how it works" into a step-by-step walkthrough the learner
 * clicks through at their own pace (buttons, dots, or ← / → keys), instead of
 * one dense paragraph. Optional `aside` (e.g. the diagram) sits alongside.
 */
export default function StepWalkthrough({ steps = [], aside = null }) {
  const [index, setIndex] = useState(0)
  const total = steps.length
  const atEnd = index === total - 1

  useEffect(() => setIndex(0), [steps])

  if (total === 0) return null

  const go = (next) => setIndex(Math.max(0, Math.min(total - 1, next)))

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  return (
    <div className={`grid gap-5 ${aside ? 'lg:grid-cols-[1fr_1fr]' : ''}`}>
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="step-by-step walkthrough"
        className="card focus-ring flex flex-col p-5 outline-none"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-signal">
            Step {index + 1} of {total}
          </span>
          <div className="flex gap-1.5" role="tablist" aria-label="Steps">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to step ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-signal' : i < index ? 'w-1.5 bg-signal/50' : 'w-1.5 bg-slate-300 dark:bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative min-h-[96px] flex-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200"
            >
              {steps[index].text}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">
            <ChevronLeft size={15} /> Back
          </button>
          {atEnd ? (
            <button type="button" onClick={() => go(0)} className="btn-secondary px-3 py-1.5 text-sm">
              <RotateCcw size={14} /> Start over
            </button>
          ) : (
            <button type="button" onClick={() => go(index + 1)} className="btn-primary px-3 py-1.5 text-sm">
              Next <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>

      {aside && <div className="card overflow-hidden p-4">{aside}</div>}
    </div>
  )
}
