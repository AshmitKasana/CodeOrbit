import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * The current user's plan, read from the `subscriptions` table (see
 * BILLING_SETUP.md for the schema + RLS policy). Only the backend — using
 * the Supabase service_role key, via the Stripe webhook — ever writes to
 * that table, so this is trustworthy even though it's read from the
 * client: a user cannot grant themselves "pro" by calling Supabase directly.
 *
 * Defaults to 'free' whenever there's no signed-in user, Supabase isn't
 * configured, or the table doesn't exist yet (e.g. BILLING_SETUP.md's SQL
 * hasn't been run) — never throws, never blocks rendering.
 */
export function useSubscription() {
  const { user } = useAuth()
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(Boolean(user))

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setPlan('free')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error && import.meta.env.DEV) {
          console.info('[Code Orbit] Could not read subscription (table likely not created yet):', error.message)
        }
        const notExpired = !data?.current_period_end || new Date(data.current_period_end) > new Date()
        const isPro = data?.plan === 'pro' && data?.status === 'active' && notExpired
        setPlan(isPro ? 'pro' : 'free')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  return { plan, isPro: plan === 'pro', loading }
}
