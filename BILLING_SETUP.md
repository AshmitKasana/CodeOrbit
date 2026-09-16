# Billing Setup — Code Orbit

Code Orbit uses **Stripe** for the Pro subscription plan and **Supabase**
(via its `service_role` key, backend-only) to store who's actually paying.
The frontend never touches a Stripe secret key or card data — checkout is a
full-page redirect to a Stripe-hosted page, and the app only ever asks
"is this user's plan 'pro'?" by reading a `subscriptions` table:

```
src/lib/stripe.js            — isStripeConfigured flag only, no Stripe.js/Elements
src/services/billingService.js — every fetch to /api/billing/*, in one place
src/hooks/useSubscription.js  — reads the current user's plan from Supabase
src/hooks/useGenerationGate.js — the free-tier daily limit + Pro bypass
server/index.js               — /api/billing/create-checkout-session,
                                 /api/billing/create-portal-session,
                                 /api/billing/webhook
```

If `VITE_STRIPE_PUBLISHABLE_KEY` isn't set, the Pricing page still renders
(with a "payments not configured yet" notice) and every billing action
returns a clear error instead of crashing or faking a Pro upgrade.

## 1. Create the Stripe product & prices

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Product catalog** → **Add product**.
2. Name it "Code Orbit Pro" (or whatever you like).
3. Add two **recurring** prices on it: one monthly, one yearly — whatever
   amounts you want (the numbers in `src/utils/constants.js`'s `PRICING_PLANS`
   are just placeholders; change them to match).
4. Copy each price's **API ID** (starts with `price_...`) into:
   - `VITE_STRIPE_PRICE_ID_MONTHLY`
   - `VITE_STRIPE_PRICE_ID_YEARLY`

## 2. Get your API keys

**Developers → API keys** in the Stripe dashboard:

- **Publishable key** (`pk_...`) → `VITE_STRIPE_PUBLISHABLE_KEY`
- **Secret key** (`sk_...`) → `STRIPE_SECRET_KEY` (backend `.env` only — never commit, never prefix with `VITE_`)

Use the **test mode** keys while developing (toggle in the dashboard's top
bar) — test-mode Checkout accepts Stripe's [test card numbers](https://docs.stripe.com/testing)
like `4242 4242 4242 4242` with any future expiry/CVC, no real charge.

## 3. Set up the webhook

Stripe needs to tell your server when a payment actually succeeds — that's
the *only* thing that flips a user to "pro" (the frontend calling
`startCheckout()` just starts the payment; it never grants access itself).

**Local development** — install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then:

```bash
stripe listen --forward-to localhost:8787/api/billing/webhook
```

This prints a webhook signing secret (`whsec_...`) — put it in
`STRIPE_WEBHOOK_SECRET`. Keep `stripe listen` running alongside `npm run dev`
and `npm run server` while testing checkout.

**Production** — in the Stripe dashboard: **Developers → Webhooks → Add endpoint**.

- Endpoint URL: `https://your-domain.com/api/billing/webhook`
- Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` on your host (Netlify/Vercel/etc. environment variables — NOT the frontend build env).

Note: `server/index.js` is a plain Express app included as a *reference*
backend. Deploying it depends on your host — Netlify/Vercel serve the
frontend as static files and need this server run separately (a
Netlify/Vercel Function, a small VM, Railway, Render, etc.) since it's not
a serverless function itself. Whatever you use, the webhook route must
receive the **raw** request body (see the comment in `server/index.js` for
why) — most platforms' function runtimes handle this differently, so check
your platform's docs for "Stripe webhook raw body."

## 4. The `subscriptions` table

Run this once in the Supabase SQL editor:

```sql
create table if not exists public.subscriptions (
  user_id uuid references auth.users(id) on delete cascade primary key,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

-- Users can read their own plan (useSubscription.js relies on this)...
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ...but there is NO insert/update policy for regular users. Only the
-- backend — using the service_role key, which bypasses RLS entirely — ever
-- writes to this table, via the Stripe webhook. This is what actually
-- prevents someone from granting themselves "pro" by calling the Supabase
-- client directly from the browser console.
```

## 5. The Supabase service role key

**Settings → API** in your Supabase project → copy the **service_role**
key (NOT the anon key you already have) into `SUPABASE_SERVICE_ROLE_KEY`,
backend `.env` only.

- This key bypasses Row Level Security completely — treat it like a
  database root password.
- It must **never** be prefixed `VITE_`, appear in any frontend file, or be
  committed. `server/index.js` is the only place that reads it.

## 6. Get the daily free limit right

`FREE_DAILY_GENERATION_LIMIT` in `src/utils/constants.js` controls how many
AI-generated explanations a Free-plan visitor gets per day before
`UpgradePrompt` shows. It's enforced client-side (localStorage, scoped per
signed-in user id — see `getUsageToday`/`incrementUsageToday` in
`helpers.js`), which is a deliberate MVP tradeoff: it nudges free users
toward upgrading without a database write on every single generation, but
it's not tamper-proof (clearing localStorage resets it). If that matters
for your use case, harden it by moving the counter into a Supabase table
(e.g. `usage_daily(user_id, day, count)`) checked server-side in
`server/index.js`'s `/api/generate` handler instead of purely client-side.

## 7. Security notes

- Never handle raw card numbers anywhere in this codebase — Checkout and
  the customer portal are both entirely Stripe-hosted pages the browser is
  redirected to.
- The Stripe **secret key** and **webhook signing secret** are backend-only,
  same rule as `ANTHROPIC_API_KEY` and the Supabase `service_role` key.
- `client_reference_id` (the Supabase user id) is what ties a completed
  Stripe Checkout session back to the right account — don't remove it from
  `create-checkout-session` in `server/index.js`.
