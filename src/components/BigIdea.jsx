import { motion } from 'framer-motion'
import { Check, Lightbulb } from 'lucide-react'

/**
 * The first thing a learner sees on a lesson: one real-world analogy and a
 * handful of key takeaways — the "if you remember nothing else" summary.
 */
export default function BigIdea({ analogy, takeaways = [] }) {
  if (!analogy && takeaways.length === 0) return null

  return (
    <section id="big-idea" className="scroll-mt-24 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-signal/20 bg-gradient-to-br from-signal/[0.08] via-transparent to-transparent p-6 sm:p-7"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-signal/10 blur-3xl" />

        {analogy && (
          <div className="relative flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
              <Lightbulb size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-signal">Think of it like this</p>
              <p className="mt-1.5 text-[17px] leading-relaxed text-slate-800 dark:text-slate-100">{analogy}</p>
            </div>
          </div>
        )}

        {takeaways.length > 0 && (
          <div className={`relative ${analogy ? 'mt-6 border-t border-slate-200/70 pt-5 dark:border-white/10' : ''}`}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Key takeaways</p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {takeaways.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.25 }}
                  className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-signal" />
                  <span>{t}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </section>
  )
}
