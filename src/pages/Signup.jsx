import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Eye, EyeOff, LoaderCircle, Lock, Mail, Send, User, UserPlus } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import OAuthButtons from '../components/OAuthButtons'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  function validate() {
    const errors = {}
    if (!name.trim()) errors.name = 'Name is required.'
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
    if (!agreedToTerms) errors.terms = 'You must agree to the Terms to continue.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const { data, error } = await signUp({ email: email.trim(), password, name: name.trim() })
      if (error) {
        setFormError(error.message || 'Something went wrong creating your account.')
        setLoading(false)
        return
      }
      if (data?.session) {
        // Email confirmation is disabled on this Supabase project — the user
        // is already signed in.
        navigate('/dashboard', { replace: true })
      } else {
        // Supabase requires email confirmation — do NOT fake a logged-in state.
        setAwaitingConfirmation(true)
        setLoading(false)
      }
    } catch {
      setFormError('A network error occurred. Please check your connection and try again.')
      setLoading(false)
    }
  }

  if (awaitingConfirmation) {
    return (
      <AuthLayout eyebrow="One more step" title="Check your email.">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
            <Send size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <p>
              We&apos;ve sent a verification link to <strong className="text-slate-900 dark:text-white">{email}</strong>. Confirm your
              email to continue.
            </p>
          </div>
          <Link to="/login" className="btn-secondary w-full">
            Back to Login
          </Link>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Join Code Orbit"
      title="Enter the Orbit."
      subtitle="Create your Code Orbit account and start learning."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 hover:underline dark:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField icon={User} placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
        <FormField
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <FormField
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
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
        <FormField
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <span className="relative mt-0.5 h-[18px] w-[18px] shrink-0">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                aria-invalid={fieldErrors.terms ? 'true' : undefined}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded border transition ${
                  agreedToTerms ? 'border-slate-900 bg-accent text-accent-fg dark:border-white' : 'border-slate-300 dark:border-surface-border'
                }`}
              >
                {agreedToTerms && <Check size={12} />}
              </span>
            </span>
            I agree to the Terms of Service and Privacy Policy.
          </label>
          {fieldErrors.terms && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle size={12} /> {fieldErrors.terms}
            </p>
          )}
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/5 px-3 py-2.5 text-sm text-red-500">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {loading ? 'Creating account...' : 'Create Account'}
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
