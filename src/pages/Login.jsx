import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LoaderCircle, LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import OAuthButtons from '../components/OAuthButtons'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const { data, error } = await signIn({ email: email.trim(), password })
      if (error) {
        setFormError(error.message || 'Something went wrong signing you in.')
        setLoading(false)
        return
      }
      if (data?.session) {
        navigate(from, { replace: true })
      } else {
        setLoading(false)
      }
    } catch {
      setFormError('A network error occurred. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Code Orbit Account"
      title="Welcome back."
      subtitle="Continue your journey through Code Orbit."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-slate-900 hover:underline dark:text-white">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <div>
          <FormField
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="shrink-0 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Forgot password?
            </Link>
          </div>
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/5 px-3 py-2.5 text-sm text-red-500">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <LogIn size={16} />}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-surface-border" />
        or continue with
        <span className="h-px flex-1 bg-slate-200 dark:bg-surface-border" />
      </div>

      <OAuthButtons showGithub />
    </AuthLayout>
  )
}
