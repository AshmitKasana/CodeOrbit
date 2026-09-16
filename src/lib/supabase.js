import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True only when both env vars are present. The rest of the app (authService,
 * AuthContext, the auth pages) checks this before touching `supabase` so a
 * developer who hasn't set up a Supabase project yet gets a clear "not
 * configured" message instead of a crash or — worse — a fake logged-in state.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Code Orbit] Supabase is not configured — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. ' +
      'Authentication features will show a "not configured" message instead of working. See AUTH_SETUP.md.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
