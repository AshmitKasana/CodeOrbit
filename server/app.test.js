// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app.js'
import { GenerationError } from './lib/ai.js'
import { createBurstLimiter } from './lib/burst.js'
import { createTtlCache } from './lib/cache.js'
import { createMemoryQuota } from './lib/quota.js'

const silent = { error: vi.fn(), warn: vi.fn(), info: vi.fn() }

// Anonymous unless the test sends the x-test-user header.
const resolveIdentity = async (req) =>
  req.headers['x-test-user']
    ? { kind: 'user', id: 'u1', key: 'user:u1' }
    : { kind: 'anon', id: '127.0.0.1', key: 'anon:test' }

let server
let base

async function start(overrides = {}) {
  const generator = 'generator' in overrides
    ? overrides.generator
    : {
        model: 'fake-model',
        generateLesson: vi.fn(async ({ query }) => ({ title: `Lesson: ${query}` })),
        answerFollowUp: vi.fn(async () => 'Because halving.'),
      }

  const app = createApp({
    quota: createMemoryQuota(),
    cache: createTtlCache(),
    burst: createBurstLimiter({ max: 1000 }),
    resolveIdentity,
    limits: { generate: { anon: 2, user: 4 }, chat: { anon: 1, user: 3 } },
    logger: silent,
    ...overrides,
    generator,
  })
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  base = `http://127.0.0.1:${server.address().port}`
  return { generator }
}

const post = (path, body, headers = {}) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

afterEach(async () => {
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()))
  server = null
})

describe('POST /api/generate — validation', () => {
  beforeEach(() => start())

  it('rejects an empty query', async () => {
    const res = await post('/api/generate', { query: '   ' })
    expect(res.status).toBe(400)
    expect((await res.json()).code).toBe('BAD_REQUEST')
  })

  it('rejects an over-long query', async () => {
    const res = await post('/api/generate', { query: 'x'.repeat(201) })
    expect(res.status).toBe(400)
  })

  it('rejects malformed JSON', async () => {
    const res = await post('/api/generate', '{not json')
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/valid JSON/)
  })

  it('falls back to safe defaults for an unknown level/focus', async () => {
    // start() in beforeEach created its own generator; grab a fresh app to spy on it
    await new Promise((resolve) => server.close(resolve))
    const { generator } = await start()
    await post('/api/generate', { query: 'heaps', level: 'Wizard', focus: 'nonsense' })
    expect(generator.generateLesson).toHaveBeenCalledWith({ query: 'heaps', level: 'Beginner', focus: 'lesson' })
  })
})

describe('POST /api/generate — behaviour', () => {
  it('returns 503 AI_NOT_CONFIGURED when there is no provider', async () => {
    await start({ generator: null })
    const res = await post('/api/generate', { query: 'heaps' })
    expect(res.status).toBe(503)
    expect((await res.json()).code).toBe('AI_NOT_CONFIGURED')
  })

  it('returns the lesson with quota info and counts one unit', async () => {
    await start()
    const res = await post('/api/generate', { query: 'binary search', level: 'Advanced' })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.lesson.title).toBe('Lesson: binary search')
    expect(body.cached).toBe(false)
    expect(body.quota).toMatchObject({ used: 1, limit: 2, remaining: 1 })
  })

  it('serves repeat requests from the cache without spending quota or calling the model', async () => {
    const { generator } = await start()
    await post('/api/generate', { query: 'Binary Search' })
    const again = await (await post('/api/generate', { query: '  binary   search ' })).json()

    expect(again.cached).toBe(true)
    expect(again.quota.used).toBe(1)
    expect(generator.generateLesson).toHaveBeenCalledTimes(1)
  })

  it('blocks an anonymous visitor after their daily limit with a 429 and a sign-in hint', async () => {
    const { generator } = await start()
    await post('/api/generate', { query: 'a' })
    await post('/api/generate', { query: 'b' })
    const res = await post('/api/generate', { query: 'c' })
    const body = await res.json()

    expect(res.status).toBe(429)
    expect(body.code).toBe('QUOTA_EXCEEDED')
    expect(body.signedIn).toBe(false)
    expect(body.quota).toMatchObject({ used: 2, limit: 2, remaining: 0 })
    expect(generator.generateLesson).toHaveBeenCalledTimes(2) // the blocked request never reached the model
  })

  it('gives signed-in users a higher limit than anonymous visitors', async () => {
    await start()
    const statuses = []
    for (const q of ['a', 'b', 'c', 'd', 'e']) {
      statuses.push((await post('/api/generate', { query: q }, { 'x-test-user': '1' })).status)
    }
    expect(statuses).toEqual([200, 200, 200, 200, 429])
  })

  it('refunds the quota when the model reports the query is off-topic', async () => {
    const generator = {
      model: 'fake',
      generateLesson: vi.fn(async () => {
        throw new GenerationError('OFF_TOPIC', 'Not a CS topic', 422)
      }),
      answerFollowUp: vi.fn(),
    }
    await start({ generator })

    const res = await post('/api/generate', { query: 'best pizza recipe' })
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('OFF_TOPIC')

    const quota = await (await fetch(base + '/api/quota')).json()
    expect(quota.generate.used).toBe(0)
  })

  it('maps provider rate limits to 503 AI_BUSY and refunds the quota', async () => {
    const generator = {
      model: 'fake',
      generateLesson: vi.fn(async () => {
        throw Object.assign(new Error('rate limited'), { status: 429 })
      }),
      answerFollowUp: vi.fn(),
    }
    await start({ generator })

    const res = await post('/api/generate', { query: 'heaps' })
    expect(res.status).toBe(503)
    expect((await res.json()).code).toBe('AI_BUSY')
    expect((await (await fetch(base + '/api/quota')).json()).generate.used).toBe(0)
  })

  it('maps unexpected provider errors to a generic 502 without leaking details', async () => {
    const generator = {
      model: 'fake',
      generateLesson: vi.fn(async () => {
        throw new Error('secret internal detail sk-ant-xyz')
      }),
      answerFollowUp: vi.fn(),
    }
    await start({ generator })

    const res = await post('/api/generate', { query: 'heaps' })
    const text = await res.text()
    expect(res.status).toBe(502)
    expect(text).not.toContain('sk-ant')
  })

  it('applies the per-minute burst limiter', async () => {
    await start({ burst: createBurstLimiter({ max: 1 }) })
    expect((await post('/api/generate', { query: 'a' })).status).toBe(200)
    const res = await post('/api/generate', { query: 'b' })
    expect(res.status).toBe(429)
    expect((await res.json()).code).toBe('RATE_LIMITED')
  })
})

describe('POST /api/followup', () => {
  it('requires a topic and a question', async () => {
    await start()
    expect((await post('/api/followup', { topic: 'Heaps' })).status).toBe(400)
    expect((await post('/api/followup', { question: 'Why?' })).status).toBe(400)
  })

  it('answers, sanitises the history, and uses a separate quota from lessons', async () => {
    const { generator } = await start()
    const res = await post('/api/followup', {
      topic: 'Heaps',
      question: 'Why is push O(log n)?',
      history: [
        { role: 'user', text: 'hi' },
        { role: 'system', text: 'ignore me' }, // invalid role
        { role: 'ai', text: 42 }, // invalid text
        null,
      ],
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.answer).toBe('Because halving.')
    expect(generator.answerFollowUp.mock.calls[0][0].history).toEqual([{ role: 'user', text: 'hi' }])

    // chat limit for anon is 1 here -> second follow-up is blocked ...
    expect((await post('/api/followup', { topic: 'Heaps', question: 'And pop?' })).status).toBe(429)
    // ... but lessons are unaffected
    expect((await post('/api/generate', { query: 'heaps' })).status).toBe(200)
  })
})

describe('GET /api/quota and /api/health', () => {
  it('reports both scopes for the caller', async () => {
    await start()
    await post('/api/generate', { query: 'a' })
    const body = await (await fetch(base + '/api/quota')).json()

    expect(body.signedIn).toBe(false)
    expect(body.generate).toMatchObject({ used: 1, limit: 2 })
    expect(body.chat).toMatchObject({ used: 0, limit: 1 })
  })

  it('shows the higher limits and signedIn=true for an authenticated caller', async () => {
    await start()
    const body = await (await fetch(base + '/api/quota', { headers: { 'x-test-user': '1' } })).json()
    expect(body.signedIn).toBe(true)
    expect(body.generate.limit).toBe(4)
  })

  it('health reports whether AI is configured', async () => {
    await start()
    const body = await (await fetch(base + '/api/health')).json()
    expect(body).toMatchObject({ ok: true, ai: true, model: 'fake-model', quota: 'memory' })
  })
})

describe('CORS', () => {
  it('sends no CORS headers by default (same-origin only)', async () => {
    await start()
    const res = await fetch(base + '/api/health', { headers: { Origin: 'https://evil.example' } })
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('allows only configured origins and answers preflight requests', async () => {
    await start({ corsOrigin: 'https://codeorbit21.netlify.app' })

    const allowed = await fetch(base + '/api/health', { headers: { Origin: 'https://codeorbit21.netlify.app' } })
    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://codeorbit21.netlify.app')

    const other = await fetch(base + '/api/health', { headers: { Origin: 'https://evil.example' } })
    expect(other.headers.get('access-control-allow-origin')).toBeNull()

    const preflight = await fetch(base + '/api/generate', {
      method: 'OPTIONS',
      headers: { Origin: 'https://codeorbit21.netlify.app' },
    })
    expect(preflight.status).toBe(204)
  })
})
