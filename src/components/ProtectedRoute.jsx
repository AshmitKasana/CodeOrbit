import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/**
 * Actually gates a route — not just a hidden nav link. While the session is
 * being restored (page refresh) it shows a spinner instead of flashing the
 * login page; once resolved, an unauthenticated visitor is redirected to
 * /login with the originally-requested location so they land back here after
 * signing in.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={22} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
