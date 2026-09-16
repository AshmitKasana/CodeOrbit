import { useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

/**
 * A glass-surfaced form field with an optional leading icon, an optional
 * trailing adornment (e.g. the password show/hide toggle), and an inline
 * animated error message — never a browser alert(). Always renders a real
 * (visually-hidden) <label> tied to the input via id/htmlFor — a placeholder
 * alone is not an accessible name.
 */
export default function FormField({ icon: Icon, endAdornment, error, label, className = '', ...inputProps }) {
  const id = useId()
  const errorId = `${id}-error`
  const accessibleLabel = label || inputProps.placeholder || inputProps.name

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {accessibleLabel}
      </label>
      <div
        className={`glass-surface flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition focus-within:border-black/25 dark:focus-within:border-white/25 ${
          error ? 'border-red-400/60 dark:border-red-400/40' : ''
        }`}
      >
        {Icon && <Icon size={16} className="shrink-0 text-slate-400" aria-hidden="true" />}
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        {endAdornment}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 overflow-hidden text-xs text-red-500"
          >
            <AlertCircle size={12} className="shrink-0" aria-hidden="true" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
