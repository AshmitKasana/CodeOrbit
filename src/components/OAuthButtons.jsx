import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Github, LoaderCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import GlassButton from './glass/GlassButton'

// The real, four-color Google "G" — Google's own brand guidelines require
// this mark to ship in its official colors, never recolored to match a
// host site's palette. That makes it the one deliberate, sanctioned
// exception to Code Orbit's otherwise-monochrome system (see index.css):
// third-party sign-in marks must stay instantly recognizable as themselves.
function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9087c1.7018-1.5668 2.6836-3.8749 2.6836-6.6151Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3427 0-4.3282-1.5818-5.0364-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18Z" />
      <path fill="#FBBC05" d="M3.9636 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9636 10.71Z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6718 5.1618 6.6573 3.5795 9 3.5795Z" />
    </svg>
  )
}

/**
 * Google & GitHub OAuth buttons — self-contained (owns its own loading
 * and error state) so Login and Signup can drop it in identically.
 */
const PROVIDER_LABEL = { google: 'Google', github: 'GitHub' }

function friendlyOAuthError(provider, message = '') {
  if (/provider is not enabled|unsupported provider|missing oauth secret/i.test(message)) {
    return `${PROVIDER_LABEL[provider]} sign-in isn't available on this site yet. Please use another option above.`
  }
  return message
}

export default function OAuthButtons() {
  const { signInWithGoogle, signInWithGithub } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [loadingProvider, setLoadingProvider] = useState(null)
  const [error, setError] = useState(null)

  async function handle(provider, fn) {
    setError(null)
    setLoadingProvider(provider)
    try {
      const result = await fn()
      if (result?.error) {
        setError(friendlyOAuthError(provider, result.error.message))
        setLoadingProvider(null)
        return
      }
      if (result?.data?.redirectPath) {
        navigate(result.data.redirectPath, { state: { from } })
        return
      }
      if (result?.data?.session && !result?.data?.url) {
        navigate(from, { replace: true })
        return
      }
      if (!result?.data?.url) {
        setLoadingProvider(null)
      }
    } catch {
      setError(`Could not sign in with ${PROVIDER_LABEL[provider] || provider}. Please try again.`)
      setLoadingProvider(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <GlassButton
          type="button"
          onClick={() => handle('google', signInWithGoogle)}
          disabled={!!loadingProvider}
          className="w-full whitespace-nowrap"
        >
          {loadingProvider === 'google' ? <LoaderCircle size={16} className="animate-spin" /> : <GoogleGlyph />}
          Continue with Google
        </GlassButton>
        <GlassButton
          type="button"
          onClick={() => handle('github', signInWithGithub)}
          disabled={!!loadingProvider}
          className="w-full whitespace-nowrap"
        >
          {loadingProvider === 'github' ? <LoaderCircle size={16} className="animate-spin" /> : <Github size={16} className="shrink-0" />}
          Continue with GitHub
        </GlassButton>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}
