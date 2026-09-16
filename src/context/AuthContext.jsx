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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
      if (newSession?.user) authService.syncProfile(newSession.user)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user: session?.user ?? null,
    session,
    loading,
    configured: isSupabaseConfigured,
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
