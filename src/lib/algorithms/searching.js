// Step generators for the search visualiser (linear and binary search).
//
// A step looks like:
//   {
//     array:       number[]
//     checking:    number | null   index being examined
//     lo, hi:      number | null   current search window (binary search)
//     eliminated:  number[]        indices that can no longer contain the target
//     found:       number | null   index of the target once found
//     comparisons: number
//     done:        boolean         true on the final step
//     message:     string
//   }

const range = (from, to) => (to < from ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i))
const outside = (lo, hi, n) => [...range(0, lo - 1), ...range(hi + 1, n - 1)]

export function linearSearchSteps(array, target) {
  const steps = []
  let comparisons = 0
  const base = { array, lo: null, hi: null, found: null, done: false }

  steps.push({ ...base, checking: null, eliminated: [], comparisons, message: `Look for ${target} by checking every value from the left.` })
  for (let i = 0; i < array.length; i++) {
    comparisons += 1
    if (array[i] === target) {
      steps.push({ ...base, checking: i, eliminated: range(0, i - 1), found: i, done: true, comparisons, message: `${array[i]} equals ${target} — found at index ${i}.` })
      return steps
    }
    steps.push({ ...base, checking: i, eliminated: range(0, i), comparisons, message: `${array[i]} is not ${target}. Move on to the next value.` })
  }
  steps.push({ ...base, checking: null, eliminated: range(0, array.length - 1), done: true, comparisons, message: `${target} is not in the array.` })
  return steps
}

/** `array` must be sorted ascending. */
export function binarySearchSteps(array, target) {
  const steps = []
  const n = array.length
  let comparisons = 0
  let lo = 0
  let hi = n - 1
  const base = { array, found: null, done: false }

  steps.push({ ...base, checking: null, lo, hi, eliminated: [], comparisons, message: `Look for ${target}. The array is sorted, so we can halve the search window each step.` })

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    comparisons += 1
    if (array[mid] === target) {
      steps.push({ ...base, checking: mid, lo, hi, eliminated: outside(lo, hi, n), found: mid, done: true, comparisons, message: `The middle value ${array[mid]} equals ${target} — found at index ${mid}.` })
      return steps
    }
    steps.push({ ...base, checking: mid, lo, hi, eliminated: outside(lo, hi, n), comparisons, message: `Check the middle value ${array[mid]} (index ${mid}).` })
    if (array[mid] < target) {
      // Keep only the right half [mid + 1, hi]; everything else is eliminated.
      steps.push({ ...base, checking: mid, lo, hi, eliminated: outside(mid + 1, hi, n), comparisons, message: `${array[mid]} < ${target}, so ${target} must be to the right. Discard the left half.` })
      lo = mid + 1
    } else {
      // Keep only the left half [lo, mid - 1].
      steps.push({ ...base, checking: mid, lo, hi, eliminated: outside(lo, mid - 1, n), comparisons, message: `${array[mid]} > ${target}, so ${target} must be to the left. Discard the right half.` })
      hi = mid - 1
    }
  }
  steps.push({ ...base, checking: null, lo, hi, eliminated: range(0, n - 1), done: true, comparisons, message: `The window is empty — ${target} is not in the array.` })
  return steps
}

/** How many comparisons each algorithm needed, for the side-by-side summary. */
export function compareSearchCosts(sortedArray, target) {
  const last = (steps) => steps[steps.length - 1]
  const linear = last(linearSearchSteps(sortedArray, target))
  const binary = last(binarySearchSteps(sortedArray, target))
  return { linear: linear.comparisons, binary: binary.comparisons, found: linear.found !== null }
}
