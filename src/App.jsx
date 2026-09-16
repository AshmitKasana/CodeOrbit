import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import CommandPalette from './components/CommandPalette'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Topics from './pages/Topics'
import Roadmap from './pages/Roadmap'
import Practice from './pages/Practice'
import Interview from './pages/Interview'
import Bookmarks from './pages/Bookmarks'
import About from './pages/About'
import { getStoredTheme, setStoredTheme } from './utils/helpers'

export default function App() {
  const [theme, setTheme] = useState(() => getStoredTheme() || 'dark')
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    setStoredTheme(theme)
  }, [theme])

  // ⌘K / Ctrl+K opens the global command palette from anywhere in the app.
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-surface">
      <Header theme={theme} onToggleTheme={toggleTheme} onOpenSearch={() => setPaletteOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:topic" element={<Learn />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  )
}
