import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CommandPalette from './components/CommandPalette'
import ProtectedRoute from './components/ProtectedRoute'
import PageFade from './components/PageFade'
import OrbitMark from './components/OrbitMark'
import AmbientBackground from './components/AmbientBackground'
import Spotlight from './components/Spotlight'
import Home from './pages/Home'
import Topics from './pages/Topics'
import Roadmap from './pages/Roadmap'
import Practice from './pages/Practice'
import Interview from './pages/Interview'
import { getStoredTheme, setStoredTheme } from './utils/helpers'

// Core navbar tabs (Home, Topics, Roadmap, Practice, Interview) load eagerly
// so switching top-level tabs is instantaneous. Heavy or secondary routes
// (Learn with its code playground, Auth, Account pages) stay code-split and
// Learn is preloaded right after first paint.
const loadLearn = () => import('./pages/Learn')
const Learn = lazy(loadLearn)
const Bookmarks = lazy(() => import('./pages/Bookmarks'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function page(element) {
  return <PageFade>{element}</PageFade>
}

// Minimal, on-brand fallback while a lazy route chunk downloads — this only
// ever flashes briefly on a slow connection or a cold cache.
function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="text-slate-300 dark:text-slate-600">
        <OrbitMark size={28} spin />
      </span>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => getStoredTheme() || 'dark')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()
  const isOAuthPopup = new URLSearchParams(location.search).get('popup') === '1'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    setStoredTheme(theme)
  }, [theme])

  // Preload the Learn route chunk in the background right after initial paint
  // so clicking any topic from Home, Topics, or Roadmap opens with zero delay.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLearn().catch(() => {})
    }, 100)
    return () => clearTimeout(timer)
  }, [])

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
      <div className="relative isolate flex min-h-screen flex-col bg-white dark:bg-surface">
        {!isOAuthPopup && <AmbientBackground />}
        {!isOAuthPopup && <Spotlight />}
        {!isOAuthPopup && (
          <Header theme={theme} onToggleTheme={toggleTheme} onOpenSearch={() => setPaletteOpen(true)} />
        )}
        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
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

              <Route path="*" element={page(<NotFound />)} />
            </Routes>
          </Suspense>
        </main>
        {!isOAuthPopup && <Footer />}
        {!isOAuthPopup && (
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
        )}
      </div>
    </AuthProvider>
  )
}
