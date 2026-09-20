// Code Orbit backend entry point.
//
// This is the ONLY place provider secrets (the Anthropic key and the Supabase
// service_role key) are ever read. The browser talks to /api/* and never sees
// them. See server/app.js for the routes and README.md for deployment.
//
// Environment (all optional — the app degrades gracefully):
//   ANTHROPIC_API_KEY          enables real AI. Without it /api/generate returns
//                              503 and the frontend uses its local generator.
//   ANTHROPIC_MODEL            default "claude-opus-5"
//   AI_EFFORT                  default "low" (low | medium | high | xhigh | max)
//   SUPABASE_SERVICE_ROLE_KEY  + VITE_SUPABASE_URL: verify signed-in users and
//                              store quotas durably (see supabase/ai_usage.sql)
//   QUOTA_GENERATE_ANON / QUOTA_GENERATE_USER / QUOTA_CHAT_ANON / QUOTA_CHAT_USER
//   CORS_ORIGIN                comma-separated allowed origins (or "*")
//   TRUST_PROXY                set to "1" when behind a reverse proxy/load balancer
//   PORT                       default 8787

import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

import { createApp, DEFAULT_LIMITS } from './app.js'
import { createAnthropicGenerator } from './lib/ai.js'
import { createIdentityResolver } from './lib/auth.js'
import { createBurstLimiter } from './lib/burst.js'
import { createTtlCache } from './lib/cache.js'
import { createMemoryQuota, createSupabaseQuota } from './lib/quota.js'

const env = process.env
const int = (value, fallback) => {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// --- AI provider ------------------------------------------------------------
const generator = env.ANTHROPIC_API_KEY
  ? createAnthropicGenerator({
      client: new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }),
      model: env.ANTHROPIC_MODEL || 'claude-opus-5',
      effort: env.AI_EFFORT || 'low',
    })
  : null

// --- Supabase (optional): identity verification + durable quotas -------------
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const supabaseAdmin =
  supabaseUrl && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null

const quota = supabaseAdmin ? createSupabaseQuota({ client: supabaseAdmin }) : createMemoryQuota()

const limits = {
  generate: {
    anon: int(env.QUOTA_GENERATE_ANON, DEFAULT_LIMITS.generate.anon),
    user: int(env.QUOTA_GENERATE_USER, DEFAULT_LIMITS.generate.user),
  },
  chat: {
    anon: int(env.QUOTA_CHAT_ANON, DEFAULT_LIMITS.chat.anon),
    user: int(env.QUOTA_CHAT_USER, DEFAULT_LIMITS.chat.user),
  },
}

const app = createApp({
  generator,
  quota,
  limits,
  cache: createTtlCache(),
  burst: createBurstLimiter(),
  resolveIdentity: createIdentityResolver({ supabaseAdmin, salt: env.QUOTA_HASH_SALT || env.SUPABASE_SERVICE_ROLE_KEY || 'code-orbit' }),
  corsOrigin: env.CORS_ORIGIN,
  trustProxy: env.TRUST_PROXY === '1' ? 1 : env.TRUST_PROXY || false,
})

const PORT = int(env.PORT, 8787)
app.listen(PORT, () => {
  console.log(`Code Orbit backend listening on http://localhost:${PORT}`)
  console.log(
    generator
      ? `  AI:    ${generator.model} (effort: ${env.AI_EFFORT || 'low'})`
      : '  AI:    not configured - set ANTHROPIC_API_KEY to enable real lessons (frontend falls back to the local generator)'
  )
  console.log(`  Quota: ${quota.kind} - generate ${limits.generate.anon}/${limits.generate.user}, chat ${limits.chat.anon}/${limits.chat.user} per day (anon/signed-in)`)
})
