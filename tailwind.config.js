/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-adaptive monochrome accent — near-black in light mode,
        // near-white in dark mode. Values live in CSS custom properties
        // (see index.css) so every `accent` utility auto-flips with the
        // `.dark`/`.light` class on <html>, no `dark:` variant needed.
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          fg: 'rgb(var(--accent-fg) / <alpha-value>)',
        },
        surface: {
          DEFAULT: '#0a0a0b',
          raised: '#101012',
          card: '#141416',
          border: '#26262a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--accent) / 0.12), 0 8px 30px rgb(var(--accent) / 0.08)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        orbitSpin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        floatY: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out',
        shimmer: 'shimmer 1.6s infinite linear',
        orbitSpin: 'orbitSpin 5s linear infinite',
        orbitSpinSlow: 'orbitSpin 12s linear infinite',
        floatY: 'floatY 3.2s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
