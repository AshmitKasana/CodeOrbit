import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CommandPalette from './components/CommandPalette'
import ProtectedRoute from './components/ProtectedRoute'
import PageFade from './components/PageFade'
import OrbitMark from './components/OrbitMark'
import Home from './pages/Home'
import { getStoredTheme, setStoredTheme } from './utils/helpers'

// Home loads eagerly — it's the very first thing almost every visitor sees.
// Everything else is route-split so the initial bundle doesn't have to pay
// for Monaco, the syntax highlighter, or Supabase before the app is even
// interactive. This is the single highest-leverage performance change for a
// site whose homepage is a search box: heavy, rarely-hit pages (the code
// playground, auth, settings) shouldn't cost anyone who never visits them.
const Learn = lazy(() => import('./pages/Learn'))
const Topics = lazy(() => import('./pages/Topics'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Practice = lazy(() => import('./pages/Practice'))
const Interview = lazy(() => import('./pages/Interview'))
const Visualizer = lazy(() => import('./pages/Visualizer'))
const Complexity = lazy(() => import('./pages/Complexity'))
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
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={page(<Home />)} />
              <Route path="/learn/:topic" element={page(<Learn />)} />
              <Route path="/topics" element={page(<Topics />)} />
              <Route path="/roadmap" element={page(<Roadmap />)} />
              <Route path="/practice" element={page(<Practice />)} />
              <Route path="/interview" element={page(<Interview />)} />
              <Route path="/visualizer" element={page(<Visualizer />)} />
              <Route path="/complexity" element={page(<Complexity />)} />
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
        <Footer />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    </AuthProvider>
  )
}
