// ---------------------------------------------------------------------------
// Billing config for the frontend. There is no Stripe.js/Elements usage
// here on purpose — checkout happens via a full-page redirect to a Stripe
// Checkout session created by the backend (server/index.js), so the
// frontend never needs to load Stripe's client SDK or touch card data at
// all. This file exists only so the rest of the app can ask "is billing
// even configured?" the same way it already asks isSupabaseConfigured.
// ---------------------------------------------------------------------------

export const isStripeConfigured = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

if (!isStripeConfigured && import.meta.env.DEV) {
  console.warn(
    '[Code Orbit] Stripe is not configured — VITE_STRIPE_PUBLISHABLE_KEY is missing. ' +
      'The Pricing page will render, but "Upgrade" shows a "not configured" message instead of ' +
      'starting checkout. See BILLING_SETUP.md.'
  )
}
