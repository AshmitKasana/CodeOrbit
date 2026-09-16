import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CommandPalette from './components/CommandPalette'
import ProtectedRoute from './components/ProtectedRoute'
import PageFade from './components/PageFade'

import Home from './pages/Home'
import Learn from './pages/Learn'
import Topics from './pages/Topics'
import Roadmap from './pages/Roadmap'
import Practice from './pages/Practice'
import Interview from './pages/Interview'
import Bookmarks from './pages/Bookmarks'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

import { getStoredTheme, setStoredTheme } from './utils/helpers'

function page(element) {
  return <PageFade>{element}</PageFade>
}

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
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface">
        <Header theme={theme} onToggleTheme={toggleTheme} onOpenSearch={() => setPaletteOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={page(<Home />)} />
            <Route path="/learn/:topic" element={page(<Learn />)} />
            <Route path="/topics" element={page(<Topics />)} />
            <Route path="/roadmap" element={page(<Roadmap />)} />
            <Route path="/practice" element={page(<Practice />)} />
            <Route path="/interview" element={page(<Interview />)} />
            <Route path="/about" element={page(<About />)} />

            <Route path="/login" element={page(<Login />)} />
            <Route path="/signup" element={page(<Signup />)} />
            <Route path="/forgot-password" element={page(<ForgotPassword />)} />
            <Route path="/reset-password" element={page(<ResetPassword />)} />
            <Route path="/auth/callback" element={page(<AuthCallback />)} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {page(<Dashboard />)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  {page(<Profile />)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute>
                  {page(<Bookmarks />)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  {page(<Settings />)}
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    </AuthProvider>
  )
}
