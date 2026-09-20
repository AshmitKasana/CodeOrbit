import { describe, expect, it } from 'vitest'
import { binarySearchSteps, compareSearchCosts, linearSearchSteps } from './searching'

const sorted = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]
const last = (steps) => steps[steps.length - 1]

describe('linearSearchSteps', () => {
  it('finds a value and reports its index', () => {
    const end = last(linearSearchSteps(sorted, 16))
    expect(end.found).toBe(4)
    expect(end.done).toBe(true)
    expect(end.comparisons).toBe(5) // checked 2, 5, 8, 12, 16
  })

  it('checks every element when the value is missing', () => {
    const end = last(linearSearchSteps(sorted, 99))
    expect(end.found).toBeNull()
    expect(end.done).toBe(true)
    expect(end.comparisons).toBe(sorted.length)
    expect(end.message).toMatch(/not in the array/)
  })

  it('handles an empty array', () => {
    const steps = linearSearchSteps([], 1)
    expect(last(steps).found).toBeNull()
    expect(last(steps).comparisons).toBe(0)
  })

  it('eliminates values already checked', () => {
    const steps = linearSearchSteps(sorted, 12)
    const atThird = steps.find((s) => s.checking === 2)
    expect(atThird.eliminated).toEqual([0, 1, 2])
  })
})

describe('binarySearchSteps', () => {
  it('finds every element of a sorted array within log2(n)+1 comparisons', () => {
    const bound = Math.floor(Math.log2(sorted.length)) + 1
    sorted.forEach((value, index) => {
      const end = last(binarySearchSteps(sorted, value))
      expect(end.found).toBe(index)
      expect(end.comparisons).toBeLessThanOrEqual(bound)
    })
  })

  it('reports a miss for values that are not present', () => {
    for (const target of [1, 10, 50, 100]) {
      const end = last(binarySearchSteps(sorted, target))
      expect(end.found).toBeNull()
      expect(end.done).toBe(true)
    }
  })

  it('handles empty and single-element arrays', () => {
    expect(last(binarySearchSteps([], 5)).found).toBeNull()
    expect(last(binarySearchSteps([5], 5)).found).toBe(0)
    expect(last(binarySearchSteps([5], 6)).found).toBeNull()
  })

  it('halves the window: eliminated indices only ever grow', () => {
    const steps = binarySearchSteps(sorted, 91)
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].eliminated.length).toBeGreaterThanOrEqual(steps[i - 1].eliminated.length)
    }
  })

  it('never eliminates the index that holds the target', () => {
    const index = sorted.indexOf(38)
    for (const step of binarySearchSteps(sorted, 38)) expect(step.eliminated).not.toContain(index)
  })
})

describe('compareSearchCosts', () => {
  it('shows binary search needing far fewer comparisons than linear search', () => {
    const big = Array.from({ length: 1000 }, (_, i) => i * 2)
    const cost = compareSearchCosts(big, 1998)
    expect(cost.found).toBe(true)
    expect(cost.linear).toBe(1000)
    expect(cost.binary).toBeLessThanOrEqual(10)
  })

  it('reports found=false for a missing target', () => {
    expect(compareSearchCosts(sorted, 7).found).toBe(false)
  })
})
