import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, LoaderCircle, Mail, Send } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    const { error } = await resetPasswordForEmail(email.trim())
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="Password reset" title="Check your email.">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
            <Send size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <p>Check your email for a password reset link.</p>
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
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="font-medium text-slate-900 hover:underline dark:text-white">
          Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  )
}
