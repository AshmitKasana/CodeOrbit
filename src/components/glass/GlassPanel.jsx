/**
 * Base Liquid Glass surface: translucent, blurred, subtly bordered with an
 * inner highlight. Every other Glass* component builds on this. Use for
 * floating/important UI (navbar, search, modals, dropdowns) — not for dense
 * reading content, which should stay solid/high-contrast (see `.card`).
 */
export default function GlassPanel({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`glass-panel ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
