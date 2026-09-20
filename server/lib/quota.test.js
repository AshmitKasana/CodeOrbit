// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { createMemoryQuota, createSupabaseQuota, nextResetIso, utcDay } from './quota.js'

const at = (iso) => () => Date.parse(iso)

describe('day helpers', () => {
  it('formats the UTC day and the next reset at midnight UTC', () => {
    const t = Date.parse('2026-09-20T23:59:30Z')
    expect(utcDay(t)).toBe('2026-09-20')
    expect(nextResetIso(t)).toBe('2026-09-21T00:00:00.000Z')
  })

  it('rolls the reset over month and year boundaries', () => {
    expect(nextResetIso(Date.parse('2026-12-31T10:00:00Z'))).toBe('2027-01-01T00:00:00.000Z')
    expect(nextResetIso(Date.parse('2026-02-28T10:00:00Z'))).toBe('2026-03-01T00:00:00.000Z')
  })
})

describe('createMemoryQuota', () => {
  it('allows requests up to the limit, then blocks', async () => {
    const q = createMemoryQuota({ now: at('2026-09-20T10:00:00Z') })
    const results = []
    for (let i = 0; i < 4; i++) results.push(await q.consume('gen:anon:a', 3))

    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false])
    expect(results.map((r) => r.used)).toEqual([1, 2, 3, 3])
    expect(results[2].remaining).toBe(0)
    expect(results[3].resetsAt).toBe('2026-09-21T00:00:00.000Z')
  })

  it('tracks each key independently', async () => {
    const q = createMemoryQuota()
    await q.consume('a', 1)
    expect((await q.consume('a', 1)).allowed).toBe(false)
    expect((await q.consume('b', 1)).allowed).toBe(true)
  })

  it('release() gives a unit back and never goes below zero', async () => {
    const q = createMemoryQuota()
    await q.consume('a', 2)
    await q.consume('a', 2)
    await q.release('a')
    expect((await q.peek('a', 2)).used).toBe(1)
    await q.release('a')
    await q.release('a')
    expect((await q.peek('a', 2)).used).toBe(0)
  })

  it('peek() reports usage without consuming it', async () => {
    const q = createMemoryQuota()
    await q.consume('a', 5)
    const before = await q.peek('a', 5)
    const after = await q.peek('a', 5)
    expect(before.used).toBe(1)
    expect(after.used).toBe(1)
    expect(before.remaining).toBe(4)
  })

  it('resets when the UTC day changes', async () => {
    let now = Date.parse('2026-09-20T23:59:00Z')
    const q = createMemoryQuota({ now: () => now })
    await q.consume('a', 1)
    expect((await q.consume('a', 1)).allowed).toBe(false)

    now = Date.parse('2026-09-21T00:00:01Z')
    const next = await q.consume('a', 1)
    expect(next.allowed).toBe(true)
    expect(next.used).toBe(1)
  })
})

describe('createSupabaseQuota', () => {
  it('maps the consume_ai_usage RPC result', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: [{ allowed: true, used: 2 }], error: null }) }
    const q = createSupabaseQuota({ client, now: at('2026-09-20T10:00:00Z') })

    const result = await q.consume('gen:user:1', 5)

    expect(client.rpc).toHaveBeenCalledWith('consume_ai_usage', { p_key: 'gen:user:1', p_day: '2026-09-20', p_limit: 5 })
    expect(result).toMatchObject({ allowed: true, used: 2, limit: 5, remaining: 3 })
  })

  it('reports a blocked request when the RPC says allowed=false', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: [{ allowed: false, used: 5 }], error: null }) }
    const result = await createSupabaseQuota({ client }).consume('k', 5)
    expect(result).toMatchObject({ allowed: false, remaining: 0 })
  })

  it('calls release_ai_usage on release()', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) }
    await createSupabaseQuota({ client, now: at('2026-09-20T10:00:00Z') }).release('k')
    expect(client.rpc).toHaveBeenCalledWith('release_ai_usage', { p_key: 'k', p_day: '2026-09-20' })
  })

  it('falls back to in-memory counters (and warns once) when the SQL is not installed', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('function does not exist') }) }
    const logger = { warn: vi.fn() }
    const q = createSupabaseQuota({ client, logger })

    const first = await q.consume('k', 1)
    const second = await q.consume('k', 1)

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(false) // still enforced — never silently unlimited
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })

  it('peek() reads the current count from the table', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { hits: 3 }, error: null })
    const eq2 = vi.fn().mockReturnValue({ maybeSingle })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    const client = { from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eq1 }) }) }

    const result = await createSupabaseQuota({ client, now: at('2026-09-20T10:00:00Z') }).peek('k', 5)

    expect(client.from).toHaveBeenCalledWith('ai_usage')
    expect(result).toMatchObject({ used: 3, remaining: 2, allowed: true })
  })
})
