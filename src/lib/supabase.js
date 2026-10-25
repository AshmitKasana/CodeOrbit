import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://lcvjewevctyvmbduaote.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_bYEfMfvWWeSTkRuVmld4Qw_RLjJ0JhN'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

/**
 * True when both Supabase URL and public anon key are available.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
