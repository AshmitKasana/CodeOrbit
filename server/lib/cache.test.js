// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { cacheKeyFor, createTtlCache } from './cache.js'

describe('createTtlCache', () => {
  it('returns stored values and undefined for misses', () => {
    const cache = createTtlCache()
    cache.set('a', { n: 1 })
    expect(cache.get('a')).toEqual({ n: 1 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('expires entries after the TTL', () => {
    let now = 1_000
    const cache = createTtlCache({ ttlMs: 500, now: () => now })
    cache.set('a', 'v')

    now = 1_499
    expect(cache.get('a')).toBe('v')

    now = 1_500
    expect(cache.get('a')).toBeUndefined()
    expect(cache.size).toBe(0)
  })

  it('evicts the least recently used entry when full', () => {
    const cache = createTtlCache({ max: 2 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a') // touch a -> b is now the oldest
    cache.set('c', 3)

    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe(1)
    expect(cache.get('c')).toBe(3)
    expect(cache.size).toBe(2)
  })

  it('overwriting a key refreshes it instead of growing the cache', () => {
    const cache = createTtlCache({ max: 2 })
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.size).toBe(1)
    expect(cache.get('a')).toBe(2)
  })
})

describe('cacheKeyFor', () => {
  it('ignores case and extra whitespace', () => {
    const a = cacheKeyFor({ query: '  Binary   Search ', level: 'Beginner', focus: 'lesson' })
    const b = cacheKeyFor({ query: 'binary search', level: 'Beginner', focus: 'lesson' })
    expect(a).toBe(b)
  })

  it('separates different levels and focuses', () => {
    const base = { query: 'heaps', level: 'Beginner', focus: 'lesson' }
    expect(cacheKeyFor(base)).not.toBe(cacheKeyFor({ ...base, level: 'Advanced' }))
    expect(cacheKeyFor(base)).not.toBe(cacheKeyFor({ ...base, focus: 'practice' }))
  })
})
