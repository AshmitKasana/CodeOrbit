import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatResetIn, getQuotaState, resetQuotaState, setQuota, subscribeQuota } from './quotaStore'

afterEach(() => resetQuotaState())

describe('quota store', () => {
  it('starts empty', () => {
    expect(getQuotaState()).toEqual({ generate: null, chat: null, signedIn: null })
  })

  it('stores quota per scope and merges extra fields', () => {
    setQuota('generate', { used: 1, limit: 5, remaining: 4, resetsAt: 'x' }, { signedIn: false })
    setQuota('chat', { used: 0, limit: 10, remaining: 10, resetsAt: 'x' })
    expect(getQuotaState()).toMatchObject({
      generate: { used: 1, limit: 5, remaining: 4 },
      chat: { limit: 10 },
      signedIn: false,
    })
  })

  it('does not share references with the caller', () => {
    const quota = { used: 1, limit: 5, remaining: 4, resetsAt: 'x' }
    setQuota('generate', quota)
    quota.used = 99
    expect(getQuotaState().generate.used).toBe(1)
  })

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeQuota(listener)
    setQuota('generate', { used: 1, limit: 5, remaining: 4, resetsAt: 'x' })
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    setQuota('generate', { used: 2, limit: 5, remaining: 3, resetsAt: 'x' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('creates a new state object on each change (needed by useSyncExternalStore)', () => {
    const before = getQuotaState()
    setQuota('generate', { used: 1, limit: 5, remaining: 4, resetsAt: 'x' })
    expect(getQuotaState()).not.toBe(before)
  })
})

describe('formatResetIn', () => {
  const now = Date.parse('2026-09-20T18:48:00Z')

  it('shows hours and minutes until the reset', () => {
    expect(formatResetIn('2026-09-21T00:00:00Z', now)).toBe('5h 12m')
  })

  it('shows only minutes when under an hour', () => {
    expect(formatResetIn('2026-09-20T19:15:00Z', now)).toBe('27m')
  })

  it('handles a reset that has already passed and bad input', () => {
    expect(formatResetIn('2026-09-20T18:00:00Z', now)).toBe('now')
    expect(formatResetIn('not a date', now)).toBe('')
  })
})
