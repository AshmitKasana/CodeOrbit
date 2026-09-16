import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { isStripeConfigured } from '../lib/stripe'

// ---------------------------------------------------------------------------
// billingService.js — the ONLY place the rest of the app talks to Stripe.
// Every function returns a consistent { error } shape (null on success), the
// same convention authService.js uses, so UI components never need to know
// whether Stripe is actually set up.
// ---------------------------------------------------------------------------

const NOT_CONFIGURED_ERROR = {
  message: 'Payments are not configured yet. Ask the site owner to set up Stripe — see BILLING_SETUP.md.',
  code: 'NOT_CONFIGURED',
}

async function authHeaders() {
  if (!isSupabaseConfigured) return {}
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body || {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { data: null, error: { message: data.error || `Request failed (${res.status}).` } }
  return { data, error: null }
}

/**
 * Starts a Stripe Checkout session for the given price and redirects the
 * whole page to it. Requires a signed-in user (the backend attaches their
 * id via client_reference_id so the webhook knows who to upgrade).
 */
export async function startCheckout(priceId) {
  if (!isStripeConfigured) return { error: NOT_CONFIGURED_ERROR }
  if (!priceId) return { error: { message: 'This plan is missing its Stripe price ID — see BILLING_SETUP.md.' } }

  const { data, error } = await postJson('/api/billing/create-checkout-session', { priceId })
  if (error) return { error }
  if (!data?.url) return { error: { message: 'Unexpected response starting checkout.' } }
  window.location.href = data.url
  return { error: null }
}

/**
 * Opens the Stripe-hosted billing portal (update card, view invoices,
 * cancel) for the current user's existing subscription.
 */
export async function openBillingPortal() {
  if (!isStripeConfigured) return { error: NOT_CONFIGURED_ERROR }

  const { data, error } = await postJson('/api/billing/create-portal-session', {})
  if (error) return { error }
  if (!data?.url) return { error: { message: 'Unexpected response opening the billing portal.' } }
  window.location.href = data.url
  return { error: null }
}
