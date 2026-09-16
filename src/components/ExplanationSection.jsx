import Reveal from './Reveal'

export default function ExplanationSection({ id, icon: Icon, title, children }) {
  return (
    <Reveal as="section" id={id} className="scroll-mt-24 py-8">
      <div className="mb-4 flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-surface-border dark:text-slate-400">
            <Icon size={15} />
          </span>
        )}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </Reveal>
  )
}
