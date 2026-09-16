/**
 * Sticky glass navigation chrome. Fully transparent at the top of the page
 * (so it doesn't fight a hero section) and becomes a proper Liquid Glass
 * surface — blurred, translucent, softly bordered — once the page scrolls.
 */
export default function GlassNavbar({ scrolled, className = '', children }) {
  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-black/10 bg-white/60 shadow-glass backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.06]'
          : 'border-transparent bg-transparent'
      } ${className}`}
    >
      {children}
    </header>
  )
}
