/**
 * The Code Orbit mark: a small dot orbited by a single ring. Pure currentColor
 * so it inherits text color everywhere it's used (navbar, footer, loader, favicon-adjacent UI).
 */
export default function OrbitMark({ size = 18, spin = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`${spin ? 'animate-orbitSpinSlow' : ''} ${className}`}
      style={{ transformOrigin: '50% 50%' }}
    >
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.4" transform="rotate(-28 12 12)" />
    </svg>
  )
}
