// Minimal example backend for DSA AI.
//
// This is the ONLY place a real AI provider API key should ever be read.
// The frontend (src/services/aiService.js) calls POST /api/generate and
// never sees this key. Enable it by setting VITE_USE_REAL_AI=true in the
// frontend .env and running `npm run server` alongside `npm run dev`
// (vite.config.js proxies /api to this server in development).
//
// Swap `callProvider()` below for whatever LLM you use (Anthropic, OpenAI,
// a self-hosted model, etc). It must return an object matching the schema
// documented at the top of src/services/aiService.js.

import 'dotenv/config'
import express from 'express'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 8787
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

app.listen(PORT, () => {
  console.log(`DSA AI backend listening on http://localhost:${PORT}`)
})
