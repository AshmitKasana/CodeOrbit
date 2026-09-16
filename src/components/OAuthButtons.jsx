import { useState } from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import GlassButton from './glass/GlassButton'

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 3-4.32 3-7.36Z"
        fill="currentColor"
        opacity=".9"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.63-2.42l-3.24-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
        fill="currentColor"
        opacity=".7"
      />
      <path
        d="M6.4 13.92a5.98 5.98 0 0 1 0-3.84V7.5H3.06a10 10 0 0 0 0 9l3.34-2.58Z"
        fill="currentColor"
        opacity=".5"
      />
      <path
        d="M12 5.98c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.34 2.58c.8-2.36 3-4.1 5.6-4.1Z"
        fill="currentColor"
        opacity=".8"
      />
    </svg>
  )
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M16.36 1.5c.1 1.1-.32 2.16-1 2.95-.68.79-1.8 1.4-2.9 1.3-.12-1.06.36-2.15 1.02-2.9.68-.78 1.85-1.36 2.88-1.35ZM19.9 17.16c-.36.83-.79 1.6-1.3 2.32-.7.99-1.28 1.68-1.73 2.06-.7.65-1.44.98-2.24 1-.57.01-1.26-.16-2.06-.51-.8-.35-1.53-.51-2.2-.51-.7 0-1.45.16-2.26.51-.81.35-1.46.53-1.96.55-.77.03-1.53-.31-2.26-1.02-.48-.44-1.1-1.17-1.85-2.2-.8-1.1-1.46-2.38-1.98-3.83-.55-1.56-.83-3.07-.83-4.53 0-1.67.36-3.11 1.08-4.32a6.36 6.36 0 0 1 2.26-2.3 6.1 6.1 0 0 1 3.06-.87c.63 0 1.46.2 2.5.58 1.04.39 1.7.58 2 .58.22 0 .96-.22 2.19-.67 1.16-.41 2.14-.58 2.94-.51 2.18.18 3.82 1.03 4.9 2.58-1.95 1.18-2.92 2.83-2.9 4.94.02 1.65.61 3.02 1.77 4.11.53.5 1.12.89 1.77 1.16-.14.42-.3.82-.46 1.2Z" />
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
          {loadingProvider === 'github' ? <LoaderCircle size={16} className="animate-spin" /> : <span className="font-mono text-xs">gh</span>}
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
