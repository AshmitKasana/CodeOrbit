// The Express app, built by a factory so every dependency (AI generator, quota
// store, cache, identity resolver) can be swapped for a fake in tests.
//
//   POST /api/generate   { query, level?, focus? } -> { lesson, cached, quota }
//   POST /api/followup   { topic, question, ... }  -> { answer, quota }
//   GET  /api/quota                                -> { generate, chat }
//   GET  /api/health
//
// Request flow for the two AI routes:
//   validate -> (503 if no AI configured) -> burst limit -> [cache hit? done]
//   -> claim daily quota (429 if exhausted) -> call the model
//   -> on any failure give the quota unit back.

import express from 'express'
import { cacheKeyFor } from './lib/cache.js'
import { FOCUSES, GenerationError, LEVELS, MAX_QUERY_LENGTH } from './lib/ai.js'

export const DEFAULT_LIMITS = {
  generate: { anon: 5, user: 25 },
  chat: { anon: 10, user: 50 },
}

const MAX_QUESTION_LENGTH = 500

const publicQuota = ({ used, limit, remaining, resetsAt }) => ({ used, limit, remaining, resetsAt })

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function createApp({
  generator = null,
  quota,
  cache,
  resolveIdentity,
  burst,
  limits = DEFAULT_LIMITS,
  corsOrigin = '',
  trustProxy = false,
  logger = console,
}) {
  const app = express()
  app.disable('x-powered-by')
  if (trustProxy) app.set('trust proxy', trustProxy)

  // --- CORS: same-origin by default; opt in to specific origins via CORS_ORIGIN.
  const allowedOrigins = parseOrigins(corsOrigin)
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  app.use(express.json({ limit: '32kb' }))

  const limitFor = (scope, identity) => limits[scope][identity.kind === 'user' ? 'user' : 'anon']
  const quotaKey = (scope, identity) => `${scope}:${identity.key}`

  function sendError(res, err) {
    if (err instanceof GenerationError) {
      return res.status(err.status).json({ code: err.code, error: err.message })
    }
    logger.error?.('[ai] provider call failed:', err?.message || err)
    if (err?.status === 429 || err?.status === 529) {
      return res.status(503).json({ code: 'AI_BUSY', error: 'The AI is busy right now — please try again in a moment.' })
    }
    return res.status(502).json({ code: 'AI_ERROR', error: 'The AI request failed. Please try again.' })
  }

  async function withQuota(scope, identity, work) {
    const claimed = await quota.consume(quotaKey(scope, identity), limitFor(scope, identity))
    if (!claimed.allowed) return { blocked: claimed }
    try {
      return { value: await work(), quota: claimed }
    } catch (err) {
      await quota.release(quotaKey(scope, identity))
      throw err
    }
  }

  function quotaExceeded(res, q, identity) {
    return res.status(429).json({
      code: 'QUOTA_EXCEEDED',
      error:
        identity.kind === 'user'
          ? "You've used all of today's AI requests. They reset at midnight UTC."
          : "You've used today's free AI requests. Sign in for a higher daily limit, or come back after midnight UTC.",
      quota: publicQuota(q),
      signedIn: identity.kind === 'user',
    })
  }

  // --- routes ---------------------------------------------------------------

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, ai: Boolean(generator), model: generator?.model ?? null, quota: quota.kind })
  })

  app.get('/api/quota', async (req, res) => {
    const identity = await resolveIdentity(req)
    const [generate, chat] = await Promise.all([
      quota.peek(quotaKey('generate', identity), limitFor('generate', identity)),
      quota.peek(quotaKey('chat', identity), limitFor('chat', identity)),
    ])
    res.json({ signedIn: identity.kind === 'user', generate: publicQuota(generate), chat: publicQuota(chat) })
  })

  app.post('/api/generate', async (req, res) => {
    const body = req.body || {}
    const query = typeof body.query === 'string' ? body.query.trim() : ''
    if (!query) return res.status(400).json({ code: 'BAD_REQUEST', error: 'A non-empty "query" string is required.' })
    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({ code: 'BAD_REQUEST', error: `Please keep your question under ${MAX_QUERY_LENGTH} characters.` })
    }
    const level = LEVELS.includes(body.level) ? body.level : 'Beginner'
    const focus = FOCUSES.includes(body.focus) ? body.focus : 'lesson'

    if (!generator) {
      return res.status(503).json({ code: 'AI_NOT_CONFIGURED', error: 'The AI backend has no provider key configured.' })
    }
    if (burst.limited(req.ip)) {
      return res.status(429).json({ code: 'RATE_LIMITED', error: 'Too many requests — please wait a moment.' })
    }

    const identity = await resolveIdentity(req)
    const key = cacheKeyFor({ query, level, focus })

    // A cached lesson costs nothing, so it never touches the quota.
    const hit = cache.get(key)
    if (hit) {
      const current = await quota.peek(quotaKey('generate', identity), limitFor('generate', identity))
      return res.json({ lesson: hit, cached: true, quota: publicQuota(current) })
    }

    try {
      const outcome = await withQuota('generate', identity, () => generator.generateLesson({ query, level, focus }))
      if (outcome.blocked) return quotaExceeded(res, outcome.blocked, identity)
      cache.set(key, outcome.value)
      return res.json({ lesson: outcome.value, cached: false, quota: publicQuota(outcome.quota) })
    } catch (err) {
      return sendError(res, err)
    }
  })

  app.post('/api/followup', async (req, res) => {
    const body = req.body || {}
    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 200) : ''
    const question = typeof body.question === 'string' ? body.question.trim() : ''
    if (!topic || !question) {
      return res.status(400).json({ code: 'BAD_REQUEST', error: '"topic" and "question" are required.' })
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ code: 'BAD_REQUEST', error: `Please keep your question under ${MAX_QUESTION_LENGTH} characters.` })
    }
    const level = LEVELS.includes(body.level) ? body.level : 'Beginner'
    const summary = typeof body.summary === 'string' ? body.summary : ''
    const history = (Array.isArray(body.history) ? body.history : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'ai') && typeof m.text === 'string')
      .slice(-6)

    if (!generator) {
      return res.status(503).json({ code: 'AI_NOT_CONFIGURED', error: 'The AI backend has no provider key configured.' })
    }
    if (burst.limited(req.ip)) {
      return res.status(429).json({ code: 'RATE_LIMITED', error: 'Too many requests — please wait a moment.' })
    }

    const identity = await resolveIdentity(req)
    try {
      const outcome = await withQuota('chat', identity, () =>
        generator.answerFollowUp({ topic, summary, level, question, history })
      )
      if (outcome.blocked) return quotaExceeded(res, outcome.blocked, identity)
      return res.json({ answer: outcome.value, quota: publicQuota(outcome.quota) })
    } catch (err) {
      return sendError(res, err)
    }
  })

  // --- error handling ---------------------------------------------------------
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ code: 'BAD_REQUEST', error: 'Request body must be valid JSON.' })
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ code: 'BAD_REQUEST', error: 'Request body is too large.' })
    }
    logger.error?.('[server] unhandled error:', err)
    res.status(500).json({ code: 'SERVER_ERROR', error: 'Something went wrong.' })
  })

  return app
}
