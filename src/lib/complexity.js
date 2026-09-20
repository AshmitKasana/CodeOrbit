// Data and maths behind the Big-O Explorer.

export const CURVES = [
  { id: 'constant', label: 'O(1)', name: 'Constant', fn: () => 1, color: '#10b981', example: 'Array index, hash-table lookup' },
  { id: 'log', label: 'O(log n)', name: 'Logarithmic', fn: (n) => Math.log2(Math.max(n, 1)), color: '#14b8a6', example: 'Binary search, balanced BST lookup' },
  { id: 'linear', label: 'O(n)', name: 'Linear', fn: (n) => n, color: '#5b7fff', example: 'Linear search, one pass over an array' },
  { id: 'nlogn', label: 'O(n log n)', name: 'Linearithmic', fn: (n) => n * Math.log2(Math.max(n, 1)), color: '#a78bfa', example: 'Merge sort, heap sort, quick sort (average)' },
  { id: 'quadratic', label: 'O(n²)', name: 'Quadratic', fn: (n) => n * n, color: '#f59e0b', example: 'Bubble, selection and insertion sort' },
  { id: 'exponential', label: 'O(2ⁿ)', name: 'Exponential', fn: (n) => 2 ** n, color: '#ef4444', example: 'Naive Fibonacci, enumerating every subset' },
  { id: 'factorial', label: 'O(n!)', name: 'Factorial', fn: (n) => factorial(n), color: '#be185d', example: 'Brute-force permutations (travelling salesman)' },
]

export function factorial(n) {
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

export const getCurve = (id) => CURVES.find((c) => c.id === id)

/** Number of basic operations the given curve performs on an input of size n. */
export function opsAt(curveId, n) {
  const curve = getCurve(curveId)
  if (!curve) throw new Error(`Unknown curve: ${curveId}`)
  return curve.fn(n)
}

const SUFFIXES = [
  [1e15, 'quadrillion'],
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
]

/** "1,024", "3.2 million", "1.3e+30", "∞". */
export function formatOps(value) {
  if (!Number.isFinite(value)) return '∞'
  if (value >= 1e18) return value.toExponential(1).replace('e+', 'e')
  for (const [size, name] of SUFFIXES) {
    if (value >= size) return `${trim(value / size)} ${name}`
  }
  if (value >= 1000) return Math.round(value).toLocaleString('en-US')
  return trim(value)
}

const trim = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(x < 10 ? 2 : 1).replace(/\.?0+$/, ''))

const SECONDS_PER = { minute: 60, hour: 3600, day: 86_400, year: 31_557_600 }
const AGE_OF_UNIVERSE_SECONDS = 4.35e17

/** Human-readable run time for `ops` operations at `opsPerSecond` (default: 1 billion/s). */
export function humanTime(ops, opsPerSecond = 1e9) {
  if (!Number.isFinite(ops)) return 'longer than the age of the universe'
  const seconds = ops / opsPerSecond
  if (seconds >= AGE_OF_UNIVERSE_SECONDS) return 'longer than the age of the universe'
  if (seconds < 1e-6) return `${trim(seconds * 1e9)} ns`
  if (seconds < 1e-3) return `${trim(seconds * 1e6)} µs`
  if (seconds < 1) return `${trim(seconds * 1e3)} ms`
  if (seconds < SECONDS_PER.minute) return `${trim(seconds)} s`
  if (seconds < SECONDS_PER.hour) return `${trim(seconds / SECONDS_PER.minute)} min`
  if (seconds < SECONDS_PER.day) return `${trim(seconds / SECONDS_PER.hour)} hours`
  if (seconds < SECONDS_PER.year) return `${trim(seconds / SECONDS_PER.day)} days`
  const years = seconds / SECONDS_PER.year
  return years >= 1e6 ? `${formatOps(years)} years` : `${trim(years)} years`
}

/**
 * Chart points for one curve over n = 1..maxN. With `log` on, values are
 * plotted as log10(ops) so all curves fit; otherwise they are clipped to yMax.
 */
export function curvePoints(curveId, maxN, { log = true, yMax = Infinity } = {}) {
  const points = []
  for (let n = 1; n <= maxN; n++) {
    const ops = opsAt(curveId, n)
    if (!Number.isFinite(ops)) break
    const y = log ? Math.log10(Math.max(ops, 1)) : ops
    points.push({ n, ops, y: Math.min(y, yMax) })
  }
  return points
}

export const DATA_STRUCTURE_TABLE = [
  { name: 'Array', access: 'O(1)', search: 'O(n)', insert: 'O(n)', remove: 'O(n)', space: 'O(n)' },
  { name: 'Dynamic Array', access: 'O(1)', search: 'O(n)', insert: 'O(1)*', remove: 'O(n)', space: 'O(n)' },
  { name: 'Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)†', remove: 'O(1)†', space: 'O(n)' },
  { name: 'Stack / Queue', access: 'O(n)', search: 'O(n)', insert: 'O(1)', remove: 'O(1)', space: 'O(n)' },
  { name: 'Hash Table', access: 'O(1)', search: 'O(1)', insert: 'O(1)', remove: 'O(1)', space: 'O(n)' },
  { name: 'Binary Search Tree (balanced)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', remove: 'O(log n)', space: 'O(n)' },
  { name: 'Binary Heap', access: 'O(1) peek', search: 'O(n)', insert: 'O(log n)', remove: 'O(log n)', space: 'O(n)' },
]

export const DATA_STRUCTURE_NOTES = [
  '* Amortised: an occasional resize costs O(n), but averaged over many appends each one is O(1).',
  '† Once you already hold a reference to the node. Finding it first is O(n).',
  'Hash table figures are averages; a badly behaved hash function can degrade every operation to O(n). An unbalanced BST degrades to O(n).',
]
