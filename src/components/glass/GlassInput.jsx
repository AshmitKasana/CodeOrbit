import { forwardRef } from 'react'

/**
 * A glass-surfaced input container. Pass an icon element and the actual
 * <input> as children so callers keep full control of the input's own
 * props/ref (used by SearchBar, the command palette, etc.).
 */
const GlassInput = forwardRef(function GlassInput({ icon, className = '', children, size = 'md', ...rest }, ref) {
  const pad = size === 'lg' ? 'px-5 py-4' : 'px-4 py-2.5'
  return (
    <div
      ref={ref}
      className={`glass-surface flex items-center gap-3 rounded-2xl transition focus-within:border-black/25 dark:focus-within:border-white/25 ${pad} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </div>
  )
})

export default GlassInput
