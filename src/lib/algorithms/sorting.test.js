import { describe, expect, it } from 'vitest'
import { ARRAY_PRESETS, SORTING_ALGORITHMS, arrayPreset, generateSortingSteps, getSortingAlgorithm, isSorted, randomArray } from './sorting'

// Deterministic PRNG so failures are reproducible.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const ascending = (arr) => [...arr].sort((a, b) => a - b)
const inversions = (arr) => arr.reduce((count, v, i) => count + arr.slice(i + 1).filter((w) => w < v).length, 0)

const INPUTS = {
  empty: [],
  single: [7],
  two: [9, 3],
  random17: randomArray(17, { rng: seeded(1) }),
  random40: randomArray(40, { rng: seeded(2) }),
  alreadySorted: [1, 2, 3, 4, 5, 6, 7, 8],
  reversed: [9, 8, 7, 6, 5, 4, 3, 2, 1],
  allEqual: [4, 4, 4, 4, 4],
  duplicates: [5, 1, 5, 2, 1, 5, 2, 2],
}

describe.each(SORTING_ALGORITHMS)('$name', (algo) => {
  describe.each(Object.entries(INPUTS))('on %s input', (_label, input) => {
    it('produces a sorted final array', () => {
      const steps = algo.run(input)
      expect(steps[steps.length - 1].array).toEqual(ascending(input))
    })

    it('never mutates the input and starts from it', () => {
      const copy = [...input]
      const steps = algo.run(input)
      expect(input).toEqual(copy)
      expect(steps[0].array).toEqual(input)
    })

    // Swap-based algorithms only ever permute the array. Merge sort is the
    // exception: it overwrites positions from an auxiliary copy, so mid-merge
    // states legitimately contain a value twice (only the final array is a permutation).
    it.skipIf(algo.id === 'merge')('only permutes values at every step (nothing lost or invented)', () => {
      const expected = ascending(input)
      for (const step of algo.run(input)) expect(ascending(step.array)).toEqual(expected)
    })

    it('marks every index as sorted on the last step', () => {
      const steps = algo.run(input)
      expect([...steps[steps.length - 1].sorted].sort((a, b) => a - b)).toEqual(input.map((_, i) => i))
    })

    it('keeps running totals monotonic and indices in bounds', () => {
      const steps = algo.run(input)
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].comparisons).toBeGreaterThanOrEqual(steps[i - 1].comparisons)
        expect(steps[i].swaps).toBeGreaterThanOrEqual(steps[i - 1].swaps)
      }
      for (const step of steps) {
        for (const idx of [...(step.compare || []), ...(step.swap || []), ...(step.writes || []), ...step.sorted]) {
          expect(idx).toBeGreaterThanOrEqual(0)
          expect(idx).toBeLessThan(input.length)
        }
      }
    })
  })

  it('describes every step in words', () => {
    for (const step of algo.run(INPUTS.random17)) expect(step.message.length).toBeGreaterThan(0)
  })

  it('exposes complexity metadata and pseudocode for the UI', () => {
    expect(algo.best).toMatch(/^O\(/)
    expect(algo.worst).toMatch(/^O\(/)
    expect(algo.space).toMatch(/^O\(/)
    expect(algo.pseudocode.length).toBeGreaterThan(2)
  })
})

describe('algorithm-specific behaviour', () => {
  it('bubble sort exits early on sorted input: n-1 comparisons, no swaps', () => {
    const steps = generateSortingSteps('bubble', INPUTS.alreadySorted)
    const last = steps[steps.length - 1]
    expect(last.comparisons).toBe(INPUTS.alreadySorted.length - 1)
    expect(last.swaps).toBe(0)
  })

  it('bubble and insertion sort swap exactly once per inversion', () => {
    for (const id of ['bubble', 'insertion']) {
      const last = generateSortingSteps(id, INPUTS.random17).at(-1)
      expect(last.swaps).toBe(inversions(INPUTS.random17))
    }
  })

  it('selection sort makes at most n-1 swaps', () => {
    const last = generateSortingSteps('selection', INPUTS.random40).at(-1)
    expect(last.swaps).toBeLessThanOrEqual(INPUTS.random40.length - 1)
  })

  it('merge sort does far fewer comparisons than bubble sort on the same data', () => {
    const merge = generateSortingSteps('merge', INPUTS.random40).at(-1).comparisons
    const bubble = generateSortingSteps('bubble', INPUTS.random40).at(-1).comparisons
    expect(merge).toBeLessThan(bubble / 2)
  })

  it('merge sort reports overwritten indices via `writes`', () => {
    const steps = generateSortingSteps('merge', [3, 1, 2])
    expect(steps.some((s) => s.writes)).toBe(true)
  })
})

describe('helpers', () => {
  it('generateSortingSteps rejects unknown algorithms', () => {
    expect(() => generateSortingSteps('bogosort', [1])).toThrow(/Unknown sorting algorithm/)
  })

  it('getSortingAlgorithm finds by id', () => {
    expect(getSortingAlgorithm('quick').name).toBe('Quick Sort')
    expect(getSortingAlgorithm('nope')).toBeUndefined()
  })

  it('isSorted detects order', () => {
    expect(isSorted([])).toBe(true)
    expect(isSorted([1, 1, 2])).toBe(true)
    expect(isSorted([2, 1])).toBe(false)
  })

  it('arrayPreset builds the requested input shapes at the requested size', () => {
    for (const { id } of ARRAY_PRESETS) expect(arrayPreset(id, 30, { rng: seeded(5) })).toHaveLength(30)

    expect(arrayPreset('reversed', 25, { rng: seeded(3) })).toEqual(ascending(arrayPreset('reversed', 25, { rng: seeded(3) })).reverse())

    const few = arrayPreset('few', 40, { rng: seeded(4) })
    expect(new Set(few).size).toBeLessThanOrEqual(4)

    // "nearly sorted" is close to sorted: only a handful of inversions compared with a random array
    const nearly = arrayPreset('nearly', 40, { rng: seeded(6) })
    expect(inversions(nearly)).toBeLessThan(inversions(arrayPreset('random', 40, { rng: seeded(6) })) / 4)
  })

  it('randomArray respects size and bounds and is deterministic for a given rng', () => {
    const a = randomArray(30, { min: 10, max: 20, rng: seeded(9) })
    const b = randomArray(30, { min: 10, max: 20, rng: seeded(9) })
    expect(a).toHaveLength(30)
    expect(a).toEqual(b)
    expect(Math.min(...a)).toBeGreaterThanOrEqual(10)
    expect(Math.max(...a)).toBeLessThanOrEqual(20)
  })
})
