import { describe, expect, it } from 'vitest'
import { playbackRate } from './usePlayback'

describe('playbackRate', () => {
  it('is slow and one-step-at-a-time at the lowest speed', () => {
    expect(playbackRate(1)).toEqual({ intervalMs: 600, stepsPerTick: 1 })
  })

  it('never ticks faster than ~60fps and batches steps at high speeds', () => {
    const fastest = playbackRate(10)
    expect(fastest.intervalMs).toBe(16)
    expect(fastest.stepsPerTick).toBeGreaterThan(1)
  })

  it('gets monotonically faster as the speed setting rises', () => {
    let previous = playbackRate(1)
    for (let speed = 2; speed <= 10; speed++) {
      const current = playbackRate(speed)
      expect(current.intervalMs).toBeLessThanOrEqual(previous.intervalMs)
      expect(current.stepsPerTick).toBeGreaterThanOrEqual(previous.stepsPerTick)
      previous = current
    }
  })

  it('clamps out-of-range and fractional values', () => {
    expect(playbackRate(-5)).toEqual(playbackRate(1))
    expect(playbackRate(99)).toEqual(playbackRate(10))
    expect(playbackRate(3.4)).toEqual(playbackRate(3))
  })
})
