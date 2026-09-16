import { useState } from 'react'
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

// A crisper, more accurate Apple glyph than the previous one — still plain
// `currentColor`, per Apple's own Sign in with Apple HIG: the mark should
// adapt to the surrounding UI's color, not carry a fixed brand color.
function AppleGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.36.07 2.31.75 3.09.81 1.18-.24 2.31-.94 3.57-.85 1.5.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  )
}

/**
 * Google/Apple/GitHub OAuth buttons — self-contained (owns its own loading
 * and error state) so Login and Signup can drop it in identically. Each
 * click goes through the real Supabase OAuth flow; if Supabase isn't
 * configured yet, the resulting error is shown inline rather than the
 * button silently doing nothing.
 */
export default function OAuthButtons({ showGithub = false }) {
  const { signInWithGoogle, signInWithApple, signInWithGithub, configured } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState(null)
  const [error, setError] = useState(null)

  async function handle(provider, fn) {
    setError(null)
    setLoadingProvider(provider)
    const { error } = await fn()
    if (error) {
      setError(error.message)
      setLoadingProvider(null)
    }
    // On success Supabase redirects the whole page to the provider, so there
    // is nothing further to do here — the button just stays in a loading
    // state until the browser navigates away.
  }

  return (
    <div>
      <div className={`grid gap-2.5 ${showGithub ? 'sm:grid-cols-1' : 'sm:grid-cols-2'}`}>
        <GlassButton
          type="button"
          onClick={() => handle('google', signInWithGoogle)}
          disabled={!!loadingProvider}
          className="w-full"
        >
          {loadingProvider === 'google' ? <LoaderCircle size={16} className="animate-spin" /> : <GoogleGlyph />}
          Continue with Google
        </GlassButton>
        <GlassButton
          type="button"
          onClick={() => handle('apple', signInWithApple)}
          disabled={!!loadingProvider}
          className="w-full"
        >
          {loadingProvider === 'apple' ? <LoaderCircle size={16} className="animate-spin" /> : <AppleGlyph />}
          Continue with Apple
        </GlassButton>
      </div>

      {showGithub && (
        <GlassButton
          type="button"
          onClick={() => handle('github', signInWithGithub)}
          disabled={!!loadingProvider}
          className="mt-2.5 w-full"
        >
          {loadingProvider === 'github' ? <LoaderCircle size={16} className="animate-spin" /> : <Github size={16} className="shrink-0" />}
          Continue with GitHub
        </GlassButton>
      )}

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} className="shrink-0" /> {error}
        </p>
      )}
      {!configured && !error && (
        <p className="mt-3 text-xs text-slate-400">
          Social sign-in requires Supabase to be configured — see <code className="font-mono">AUTH_SETUP.md</code>.
        </p>
      )}
    </div>
  )
}
