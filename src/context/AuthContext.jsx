import { createContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import * as authService from '../services/authService'

export const AuthContext = createContext(null)

/**
 * Wraps the whole app. Owns the live Supabase session (via
 * onAuthStateChange, so every component reacts instantly to sign in/out —
 * including a session restored from storage on page load) and exposes the
 * auth actions so UI components never import authService directly.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getLocalSession())
  const [loading, setLoading] = useState(() => isSupabaseConfigured && !authService.getLocalSession())

  useEffect(() => {
    const unsubscribeLocal = authService.onLocalAuthChange((localSession) => {
      setSession(localSession)
      setLoading(false)
    })

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return unsubscribeLocal
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const local = authService.getLocalSession()
      setSession(local || data?.session || null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const local = authService.getLocalSession()
      const resolved = newSession || local || null
      setSession(resolved)
      setLoading(false)
      if (newSession?.user) authService.syncProfile(newSession.user)
    })

    return () => {
      active = false
      unsubscribeLocal()
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user: session?.user ?? null,
    session,
    loading,
    configured: true,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signInWithGoogle: authService.signInWithGoogle,
    signInWithApple: authService.signInWithApple,
    signInWithGithub: authService.signInWithGithub,
    signOut: authService.signOut,
    resetPasswordForEmail: authService.resetPasswordForEmail,
    updatePassword: authService.updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
