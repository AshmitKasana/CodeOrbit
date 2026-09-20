import { afterEach, describe, expect, it, vi } from 'vitest'

// The real client would read Supabase config from .env; keep tests hermetic.
vi.mock('../lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }))

import { AIServiceError, askFollowUp, generateExplanation, refreshQuota, validateSchema } from './aiService'
import { getQuotaState, resetQuotaState } from './quotaStore'

const QUOTA = { used: 1, limit: 5, remaining: 4, resetsAt: '2026-09-21T00:00:00.000Z' }
const LESSON = { title: 'Heaps', summary: 's', overview: {}, coreConcept: {}, syntax: {} }

const reply = (status, body) => ({ ok: status < 400, status, json: async () => body })

function useBackend(fetchImpl) {
  vi.stubEnv('VITE_USE_REAL_AI', 'true')
  const fetchMock = vi.fn(fetchImpl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  resetQuotaState()
})

// The local generator simulates thinking time with timers.
async function settle(promise) {
  await vi.runAllTimersAsync()
  return promise
}

describe('validateSchema', () => {
  it('requires title, overview and coreConcept', () => {
    expect(validateSchema(LESSON).ok).toBe(true)
    expect(validateSchema({ title: 'x', overview: {} })).toEqual({ ok: false, missing: 'coreConcept' })
    expect(validateSchema(null).ok).toBe(false)
    expect(validateSchema('nope').ok).toBe(false)
  })
})

describe('generateExplanation — local generator', () => {
  it('rejects an empty question', async () => {
    await expect(generateExplanation('   ')).rejects.toMatchObject({ code: 'EMPTY_INPUT' })
  })

  it('uses built-in content when the AI backend is switched off, and labels it as local', async () => {
    vi.stubEnv('VITE_USE_REAL_AI', 'false')
    vi.useFakeTimers()
    const stages = []
    const result = await settle(generateExplanation('explain pointers in java', 'Beginner', (i) => stages.push(i)))

    expect(result.source).toBe('local')
    expect(result.title).toBe('Pointers & References')
    expect(result.language).toBe('Java')
    expect(stages).toEqual([0, 1, 2, 3, 4])
  })
})

describe('generateExplanation — AI backend', () => {
  it('posts the query, level and focus, and labels the result as AI-generated', async () => {
    const fetchMock = useBackend(async () => reply(200, { lesson: LESSON, cached: false, quota: QUOTA }))

    const result = await generateExplanation('heaps', 'Advanced', () => {}, { focus: 'practice' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/generate')
    expect(JSON.parse(init.body)).toEqual({ query: 'heaps', level: 'Advanced', focus: 'practice' })
    expect(result).toMatchObject({ source: 'ai', title: 'Heaps', slug: 'heaps', difficulty: 'Advanced', rawQuery: 'heaps' })
  })

  it('publishes the server-reported quota for the UI badge', async () => {
    useBackend(async () => reply(200, { lesson: LESSON, quota: QUOTA }))
    await generateExplanation('heaps')
    expect(getQuotaState().generate).toMatchObject({ used: 1, limit: 5, remaining: 4 })
  })

  it('honours VITE_API_URL for a separately hosted backend', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/')
    const fetchMock = useBackend(async () => reply(200, { lesson: LESSON }))
    await generateExplanation('heaps')
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/api/generate')
  })

  it('surfaces a quota error with the quota details (no silent fallback)', async () => {
    useBackend(async () => reply(429, { code: 'QUOTA_EXCEEDED', error: 'used up', quota: { ...QUOTA, remaining: 0 }, signedIn: false }))

    const error = await generateExplanation('heaps').catch((e) => e)

    expect(error).toBeInstanceOf(AIServiceError)
    expect(error).toMatchObject({ code: 'QUOTA_EXCEEDED', message: 'used up', signedIn: false })
    expect(error.quota.remaining).toBe(0)
  })

  it.each(['OFF_TOPIC', 'REFUSED', 'BAD_REQUEST'])('surfaces %s errors to the learner', async (code) => {
    useBackend(async () => reply(422, { code, error: `problem: ${code}` }))
    await expect(generateExplanation('best pizza')).rejects.toMatchObject({ code, message: `problem: ${code}` })
  })

  it('falls back to built-in content when the backend has no AI key configured', async () => {
    useBackend(async () => reply(503, { code: 'AI_NOT_CONFIGURED', error: 'no key' }))
    vi.useFakeTimers()
    const result = await settle(generateExplanation('explain arrays'))
    expect(result.source).toBe('local')
  })

  it('falls back to built-in content when the network fails', async () => {
    useBackend(async () => {
      throw new TypeError('Failed to fetch')
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()
    const result = await settle(generateExplanation('explain arrays'))
    expect(result.source).toBe('local')
  })

  it('falls back when the backend returns a malformed lesson', async () => {
    useBackend(async () => reply(200, { lesson: { title: 'only a title' } }))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()
    const result = await settle(generateExplanation('explain arrays'))
    expect(result.source).toBe('local')
  })
})

describe('askFollowUp', () => {
  const topic = { title: 'Heaps', summary: 'A tree.', difficulty: 'Beginner', coreConcept: { beginner: 'Core idea.' } }

  it('rejects an empty question', async () => {
    await expect(askFollowUp(topic, '  ')).rejects.toMatchObject({ code: 'EMPTY_INPUT' })
  })

  it('returns the backend answer and sends the conversation history', async () => {
    const fetchMock = useBackend(async () => reply(200, { answer: 'Because of sift-down.', quota: { ...QUOTA, limit: 10 } }))

    const answer = await askFollowUp(topic, 'Why log n?', [{ role: 'user', text: 'hi', id: 1 }])

    expect(answer).toBe('Because of sift-down.')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/followup')
    expect(JSON.parse(init.body)).toEqual({
      topic: 'Heaps',
      summary: 'A tree.',
      level: 'Beginner',
      question: 'Why log n?',
      history: [{ role: 'user', text: 'hi' }],
    })
    expect(getQuotaState().chat.limit).toBe(10)
  })

  it('surfaces a chat quota error', async () => {
    useBackend(async () => reply(429, { code: 'QUOTA_EXCEEDED', error: 'chat limit', quota: QUOTA }))
    await expect(askFollowUp(topic, 'Why?')).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' })
  })

  it('answers offline with a canned reply when the backend is unavailable', async () => {
    vi.stubEnv('VITE_USE_REAL_AI', 'false')
    vi.useFakeTimers()
    const answer = await settle(askFollowUp(topic, 'give me a real-world analogy'))
    expect(answer).toContain('Heaps')
  })

  it('regression: a general question (no keyword match) no longer throws', async () => {
    // The generic branch used to reference an undefined `level` variable.
    vi.stubEnv('VITE_USE_REAL_AI', 'false')
    vi.useFakeTimers()
    const answer = await settle(askFollowUp(topic, 'tell me more'))
    expect(answer).toContain('Building on **Heaps**')
    expect(answer).toContain('Core idea.')
  })
})

describe('refreshQuota', () => {
  it('does nothing when the AI backend is off', async () => {
    vi.stubEnv('VITE_USE_REAL_AI', 'false')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await refreshQuota()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads the current quota into the store', async () => {
    const fetchMock = useBackend(async () => reply(200, { signedIn: true, generate: { ...QUOTA, limit: 25 }, chat: { ...QUOTA, limit: 50 } }))
    await refreshQuota()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/quota')
    expect(getQuotaState()).toMatchObject({ signedIn: true, generate: { limit: 25 }, chat: { limit: 50 } })
  })

  it('fails quietly when the backend is unreachable', async () => {
    useBackend(async () => {
      throw new Error('offline')
    })
    expect(await refreshQuota()).toBeNull()
  })
})
