import { describe, expect, it } from 'vitest'
import { CURVES, DATA_STRUCTURE_TABLE, curvePoints, factorial, formatOps, humanTime, opsAt } from './complexity'

describe('opsAt', () => {
  it('evaluates each growth curve', () => {
    expect(opsAt('constant', 1000)).toBe(1)
    expect(opsAt('log', 1024)).toBe(10)
    expect(opsAt('linear', 50)).toBe(50)
    expect(opsAt('nlogn', 8)).toBe(24)
    expect(opsAt('quadratic', 12)).toBe(144)
    expect(opsAt('exponential', 10)).toBe(1024)
    expect(opsAt('factorial', 5)).toBe(120)
  })

  it('rejects unknown curves', () => {
    expect(() => opsAt('cubic', 3)).toThrow(/Unknown curve/)
  })

  it('orders the curves correctly for a mid-sized input', () => {
    const at = (id) => opsAt(id, 20)
    const order = ['constant', 'log', 'linear', 'nlogn', 'quadratic', 'exponential', 'factorial']
    for (let i = 1; i < order.length; i++) expect(at(order[i])).toBeGreaterThan(at(order[i - 1]))
  })

  it('gives every curve a label and colour for the chart', () => {
    for (const curve of CURVES) {
      expect(curve.label).toMatch(/^O\(/)
      expect(curve.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('factorial', () => {
  it('computes small factorials and overflows to Infinity for huge n', () => {
    expect(factorial(0)).toBe(1)
    expect(factorial(10)).toBe(3_628_800)
    expect(factorial(200)).toBe(Infinity)
  })
})

describe('formatOps', () => {
  it('formats small, thousand and million-scale values', () => {
    expect(formatOps(7)).toBe('7')
    expect(formatOps(12.5)).toBe('12.5')
    expect(formatOps(1024)).toBe('1,024')
    expect(formatOps(3_500_000)).toBe('3.5 million')
    expect(formatOps(2e9)).toBe('2 billion')
  })

  it('uses scientific notation for astronomically large values and ∞ for overflow', () => {
    expect(formatOps(1.27e30)).toBe('1.3e30')
    expect(formatOps(Infinity)).toBe('∞')
  })
})

describe('humanTime', () => {
  it('picks a sensible unit', () => {
    expect(humanTime(1)).toBe('1 ns')
    expect(humanTime(1000)).toBe('1 µs')
    expect(humanTime(5e6)).toBe('5 ms')
    expect(humanTime(1e9)).toBe('1 s')
    expect(humanTime(1e9 * 60 * 90)).toBe('1.5 hours')
    expect(humanTime(1e9 * 86_400 * 3)).toBe('3 days')
  })

  it('reports years, and the age of the universe for hopeless runtimes', () => {
    expect(humanTime(1e9 * 31_557_600 * 12)).toBe('12 years')
    expect(humanTime(2 ** 100)).toBe('longer than the age of the universe')
    expect(humanTime(Infinity)).toBe('longer than the age of the universe')
  })

  it('honours a custom speed', () => {
    expect(humanTime(1e6, 1e6)).toBe('1 s')
  })
})

describe('curvePoints', () => {
  it('returns one point per n on a log scale', () => {
    const points = curvePoints('linear', 100)
    expect(points).toHaveLength(100)
    expect(points[9]).toMatchObject({ n: 10, ops: 10 })
    expect(points[9].y).toBeCloseTo(1, 5)
  })

  it('clips values above yMax on a linear scale', () => {
    const points = curvePoints('quadratic', 50, { log: false, yMax: 500 })
    expect(Math.max(...points.map((p) => p.y))).toBe(500)
    expect(points[9].y).toBe(100)
  })

  it('stops before values overflow to Infinity', () => {
    const points = curvePoints('factorial', 500)
    expect(points.length).toBeLessThan(500)
    expect(points.every((p) => Number.isFinite(p.ops))).toBe(true)
  })
})

describe('DATA_STRUCTURE_TABLE', () => {
  it('has a complete row for every structure', () => {
    expect(DATA_STRUCTURE_TABLE.length).toBeGreaterThanOrEqual(6)
    for (const row of DATA_STRUCTURE_TABLE) {
      for (const key of ['name', 'access', 'search', 'insert', 'remove', 'space']) expect(row[key]).toBeTruthy()
    }
  })

  it('records the classic array-vs-hash-table trade-off', () => {
    const byName = Object.fromEntries(DATA_STRUCTURE_TABLE.map((r) => [r.name, r]))
    expect(byName['Array'].search).toBe('O(n)')
    expect(byName['Hash Table'].search).toBe('O(1)')
  })
})
