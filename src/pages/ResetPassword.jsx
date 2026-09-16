import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Eye, EyeOff, LoaderCircle, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate() {
    const errors = {}
    if (!password) errors.password = 'Password is required.'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      setFormError(
        error.code === 'NOT_CONFIGURED'
          ? error.message
          : `${error.message} — you may need to open the reset link from your email again.`
      )
      return
    }
    setSuccess(true)
    setTimeout(() => navigate('/login', { replace: true }), 1800)
  }

  if (success) {
    return (
      <AuthLayout eyebrow="Password reset" title="Password updated.">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
          <Check size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p>Your password has been updated. Taking you to login...</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Password reset" title="Choose a new password." subtitle="This link works once — pick a password you'll remember.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="New password"
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
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/5 px-3 py-2.5 text-sm text-red-500">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Lock size={16} />}
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  )
}
