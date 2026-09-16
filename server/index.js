// Minimal example backend for DSA AI + Stripe billing.
//
// This is the ONLY place real provider secret keys (Anthropic, Stripe,
// Supabase's service_role) should ever be read. The frontend calls the
// /api/* routes below and never sees any of these keys.
//
// AI generation: swap `callProvider()` for whatever LLM you use — it must
// return an object matching the schema documented at the top of
// src/services/aiService.js.
//
// Billing: see BILLING_SETUP.md for the full Stripe + Supabase setup. In
// short — /api/billing/create-checkout-session starts a subscription
// purchase, /api/billing/create-portal-session lets an existing subscriber
// manage/cancel it, and /api/billing/webhook is what Stripe calls back to
// tell us a payment succeeded (which is what actually flips a user to
// "pro" — the frontend never grants that itself).

import 'dotenv/config'
import express from 'express'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const app = express()

const PORT = process.env.PORT || 8787

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null
if (!stripe) {
  console.warn('[server] STRIPE_SECRET_KEY is not set — /api/billing/* routes will return 503 until it is. See BILLING_SETUP.md.')
}

// Reuses the same Supabase project as the frontend, but with the
// service_role key — which bypasses Row Level Security — so the webhook
// can write subscription status for a user who isn't in the middle of an
// active session. NEVER expose this key to the frontend or commit it; it
// must only ever live in this server-side .env file. The project URL
// itself isn't secret, so reusing VITE_SUPABASE_URL here is fine.
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
    : null
if (!supabaseAdmin) {
  console.warn('[server] SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL not set — billing writes will no-op. See BILLING_SETUP.md.')
}

// --- Stripe webhook -------------------------------------------------------
// Stripe signs the RAW request body, so this route needs express.raw()
// instead of the JSON parser — and it must be registered BEFORE the global
// express.json() below, or Express will have already consumed/parsed the
// body by the time this handler runs, leaving nothing for signature
// verification to check.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).end()

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret)
  } catch (err) {
    console.error('[server] Stripe webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      // Fires once, right after a successful Checkout — this is what
      // actually grants "pro" for a brand-new subscriber.
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id
        if (userId && supabaseAdmin) {
          await supabaseAdmin.from('subscriptions').upsert(
            {
              user_id: userId,
              plan: 'pro',
              status: 'active',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
            },
            { onConflict: 'user_id' }
          )
        }
        break
      }
      // Fires on renewals, cancellations, and payment failures — keeps
      // plan/status in sync for the lifetime of the subscription.
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        if (supabaseAdmin) {
          const isActive = sub.status === 'active' || sub.status === 'trialing'
          await supabaseAdmin
            .from('subscriptions')
            .update({
              plan: isActive ? 'pro' : 'free',
              status: sub.status,
              current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            })
            .eq('stripe_subscription_id', sub.id)
        }
        break
      }
      default:
        break // other event types are safely ignored
    }
    res.json({ received: true })
  } catch (err) {
    console.error('[server] Stripe webhook handler failed:', err)
    res.status(500).json({ error: 'Webhook handler error.' })
  }
})

// Every route below this line gets JSON body parsing.
app.use(express.json())

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS
  }
  entry.count += 1
  hits.set(ip, entry)
  return entry.count > RATE_LIMIT_MAX
}

app.post('/api/generate', async (req, res) => {
  const ip = req.ip
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' })
  }

  const { query, level } = req.body || {}
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A non-empty "query" string is required.' })
  }

  try {
    const result = await callProvider(query, level)
    res.json(result)
  } catch (err) {
    console.error('AI provider call failed:', err)
    res.status(502).json({ error: 'The AI provider request failed.' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

async function callProvider(query, level) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set — configure your provider key in a server-side .env file.')
  }

  // Example shape only — replace with a real call to your provider's SDK/API,
  // instructing it to return JSON matching the aiService.js schema, then
  // JSON.parse + validate the response before returning it to the client.
  throw new Error('callProvider() is a stub — implement your AI provider call here.')
}

// --- Billing: checkout + portal -------------------------------------------

/** Resolves the signed-in Supabase user from a `Bearer <access_token>` header. */
async function getUserFromRequest(req) {
  if (!supabaseAdmin) return null
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error) return null
  return data.user
}

app.post('/api/billing/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payments are not configured on the server yet. See BILLING_SETUP.md.' })

  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Please sign in before upgrading.' })

  const { priceId } = req.body || {}
  if (!priceId) return res.status(400).json({ error: 'priceId is required.' })

  try {
    // Reuse an existing Stripe customer for this user if we've already made
    // one, so repeat purchases/upgrades don't fragment into duplicates.
    let customerId
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
      customerId = data?.stripe_customer_id || undefined
    }

    const origin = req.headers.origin || `http://localhost:${PORT}`
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      success_url: `${origin}/settings?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('[server] Stripe checkout session creation failed:', err)
    res.status(502).json({ error: 'Could not start checkout.' })
  }
})

app.post('/api/billing/create-portal-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payments are not configured on the server yet. See BILLING_SETUP.md.' })

  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Please sign in first.' })
  if (!supabaseAdmin) return res.status(503).json({ error: 'Billing database is not configured.' })

  const { data } = await supabaseAdmin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
  if (!data?.stripe_customer_id) return res.status(400).json({ error: "You don't have a billing account yet — upgrade first." })

  try {
    const origin = req.headers.origin || `http://localhost:${PORT}`
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${origin}/settings`,
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('[server] Stripe portal session creation failed:', err)
    res.status(502).json({ error: 'Could not open the billing portal.' })
  }
})

app.listen(PORT, () => {
  console.log(`DSA AI backend listening on http://localhost:${PORT}`)
})
