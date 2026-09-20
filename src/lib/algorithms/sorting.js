// Step generators for the Algorithm Visualizer.
//
// Each algorithm runs to completion on a copy of the input and records a
// snapshot after every meaningful operation. The UI simply plays the snapshots
// back, so the visualisation can never disagree with the algorithm — and the
// generators are plain functions that are unit-tested against Array#sort.
//
// A step looks like:
//   {
//     array:       number[]        the array at this moment
//     compare:     [i, j] | null   indices being compared
//     swap:        [i, j] | null   indices just swapped
//     writes:      [k] | null      index just overwritten (merge sort)
//     pivot:       number | null   pivot / current-minimum index
//     range:       [lo, hi] | null the region the algorithm is working on
//     sorted:      number[]        indices already in their final position
//     comparisons: number          running total
//     swaps:       number          running total of swaps / writes
//     message:     string          plain-English description of this step
//   }

function createRecorder(input) {
  const arr = input.slice()
  const steps = []
  const sorted = new Set()
  let comparisons = 0
  let swaps = 0

  function snap(extra = {}) {
    steps.push({
      array: arr.slice(),
      compare: null,
      swap: null,
      writes: null,
      pivot: null,
      range: null,
      sorted: [...sorted],
      comparisons,
      swaps,
      message: '',
      ...extra,
    })
  }

  return {
    arr,
    sorted,
    snap,
    countComparison() {
      comparisons += 1
    },
    compare(i, j, message, extra = {}) {
      comparisons += 1
      snap({ compare: [i, j], message, ...extra })
    },
    swap(i, j, message, extra = {}) {
      const tmp = arr[i]
      arr[i] = arr[j]
      arr[j] = tmp
      swaps += 1
      snap({ swap: [i, j], message, ...extra })
    },
    write(k, value, message, extra = {}) {
      arr[k] = value
      swaps += 1
      snap({ writes: [k], message, ...extra })
    },
    finish() {
      for (let i = 0; i < arr.length; i++) sorted.add(i)
      snap({ message: 'Sorted!' })
      return steps
    },
  }
}

function bubbleSort(input) {
  const r = createRecorder(input)
  const a = r.arr
  const n = a.length
  r.snap({ message: 'Unsorted array. Bubble sort repeatedly swaps neighbours that are out of order.' })
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false
    for (let j = 0; j < n - 1 - pass; j++) {
      r.compare(j, j + 1, `Compare ${a[j]} and ${a[j + 1]}`)
      if (a[j] > a[j + 1]) {
        r.swap(j, j + 1, `${a[j]} > ${a[j + 1]}, so swap them`)
        swapped = true
      }
    }
    r.sorted.add(n - 1 - pass)
    if (!swapped) break
  }
  return r.finish()
}

function selectionSort(input) {
  const r = createRecorder(input)
  const a = r.arr
  const n = a.length
  r.snap({ message: 'Unsorted array. Selection sort finds the smallest remaining value and puts it in place.' })
  for (let i = 0; i < n - 1; i++) {
    let min = i
    for (let j = i + 1; j < n; j++) {
      r.compare(min, j, `Is ${a[j]} smaller than the current minimum ${a[min]}?`, { pivot: min, range: [i, n - 1] })
      if (a[j] < a[min]) min = j
    }
    if (min !== i) r.swap(i, min, `Move the minimum ${a[min]} to position ${i}`, { range: [i, n - 1] })
    r.sorted.add(i)
  }
  return r.finish()
}

function insertionSort(input) {
  const r = createRecorder(input)
  const a = r.arr
  const n = a.length
  r.snap({ message: 'Unsorted array. Insertion sort grows a sorted prefix, inserting one value at a time.' })
  for (let i = 1; i < n; i++) {
    const range = [0, i]
    for (let j = i; j > 0; j--) {
      r.compare(j - 1, j, `Compare ${a[j - 1]} and ${a[j]}`, { range })
      if (a[j - 1] > a[j]) r.swap(j - 1, j, `${a[j - 1]} > ${a[j]}, so shift ${a[j]} left`, { range })
      else break
    }
  }
  return r.finish()
}

function mergeSort(input) {
  const r = createRecorder(input)
  const a = r.arr
  r.snap({ message: 'Unsorted array. Merge sort splits in half, sorts each half, then merges them.' })

  function sort(lo, hi) {
    if (lo >= hi) return
    const mid = (lo + hi) >> 1
    sort(lo, mid)
    sort(mid + 1, hi)

    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    const range = [lo, hi]
    let i = 0
    let j = 0
    let k = lo
    while (i < left.length && j < right.length) {
      r.countComparison()
      if (left[i] <= right[j]) {
        r.write(k, left[i], `Merge: ${left[i]} (left) ≤ ${right[j]} (right), take ${left[i]}`, { range })
        i += 1
      } else {
        r.write(k, right[j], `Merge: ${right[j]} (right) < ${left[i]} (left), take ${right[j]}`, { range })
        j += 1
      }
      k += 1
    }
    while (i < left.length) {
      r.write(k, left[i], `Copy the remaining left value ${left[i]}`, { range })
      i += 1
      k += 1
    }
    while (j < right.length) {
      r.write(k, right[j], `Copy the remaining right value ${right[j]}`, { range })
      j += 1
      k += 1
    }
  }

  sort(0, a.length - 1)
  return r.finish()
}

function quickSort(input) {
  const r = createRecorder(input)
  const a = r.arr
  r.snap({ message: 'Unsorted array. Quick sort partitions around a pivot, then sorts each side.' })

  function sort(lo, hi) {
    if (lo > hi) return
    if (lo === hi) {
      r.sorted.add(lo)
      return
    }
    const range = [lo, hi]
    const pivotValue = a[hi]
    let boundary = lo
    r.snap({ pivot: hi, range, message: `Choose ${pivotValue} (the last value) as the pivot` })
    for (let j = lo; j < hi; j++) {
      r.compare(j, hi, `Is ${a[j]} smaller than the pivot ${pivotValue}?`, { pivot: hi, range })
      if (a[j] < pivotValue) {
        if (boundary !== j) r.swap(boundary, j, `Move ${a[j]} to the left side of the partition`, { pivot: hi, range })
        boundary += 1
      }
    }
    if (boundary !== hi) r.swap(boundary, hi, `Put the pivot ${pivotValue} in its final position`, { pivot: boundary, range })
    r.sorted.add(boundary)
    r.snap({ pivot: boundary, range, message: `${pivotValue} is now in its final position` })
    sort(lo, boundary - 1)
    sort(boundary + 1, hi)
  }

  sort(0, a.length - 1)
  return r.finish()
}

function heapSort(input) {
  const r = createRecorder(input)
  const a = r.arr
  const n = a.length
  r.snap({ message: 'Unsorted array. Heap sort builds a max-heap, then repeatedly moves the largest value to the end.' })

  function siftDown(start, size) {
    let root = start
    const range = [0, size - 1]
    while (true) {
      let child = 2 * root + 1
      if (child >= size) break
      if (child + 1 < size) {
        r.compare(child, child + 1, `Which child is larger: ${a[child]} or ${a[child + 1]}?`, { range })
        if (a[child + 1] > a[child]) child += 1
      }
      r.compare(root, child, `Compare parent ${a[root]} with its larger child ${a[child]}`, { range })
      if (a[root] < a[child]) {
        r.swap(root, child, `${a[root]} < ${a[child]}, so swap the parent down`, { range })
        root = child
      } else {
        break
      }
    }
  }

  for (let start = (n >> 1) - 1; start >= 0; start--) siftDown(start, n)
  for (let end = n - 1; end > 0; end--) {
    r.swap(0, end, `Move the largest value ${a[0]} to position ${end}`, { range: [0, end] })
    r.sorted.add(end)
    siftDown(0, end)
  }
  return r.finish()
}

export const SORTING_ALGORITHMS = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    blurb: 'Repeatedly steps through the list, swapping adjacent values that are in the wrong order. After each pass the largest remaining value has "bubbled" to the end.',
    pseudocode: ['repeat until no swaps happen:', '  for j from 0 to n - 2:', '    if a[j] > a[j + 1]:', '      swap a[j], a[j + 1]'],
    run: bubbleSort,
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: false,
    blurb: 'Finds the smallest value in the unsorted part and swaps it into the next position of the sorted part. Makes very few swaps, but always does O(n²) comparisons.',
    pseudocode: ['for i from 0 to n - 2:', '  min = i', '  for j from i + 1 to n - 1:', '    if a[j] < a[min]: min = j', '  swap a[i], a[min]'],
    run: selectionSort,
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    blurb: 'Builds the sorted list one value at a time by sliding each new value left until it sits in the right place. Excellent on small or nearly sorted inputs.',
    pseudocode: ['for i from 1 to n - 1:', '  j = i', '  while j > 0 and a[j - 1] > a[j]:', '    swap a[j - 1], a[j]', '    j = j - 1'],
    run: insertionSort,
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    blurb: 'Divide and conquer: split the array in half, sort each half recursively, then merge the two sorted halves. Predictable O(n log n), at the cost of extra memory.',
    pseudocode: ['mergeSort(lo, hi):', '  if lo >= hi: return', '  mid = (lo + hi) / 2', '  mergeSort(lo, mid); mergeSort(mid + 1, hi)', '  merge the two sorted halves'],
    run: mergeSort,
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    stable: false,
    blurb: 'Picks a pivot, moves smaller values to its left and larger to its right, then sorts each side. Very fast in practice; a poor pivot on sorted input degrades it to O(n²).',
    pseudocode: ['quickSort(lo, hi):', '  pivot = a[hi]', '  partition so smaller values go left of pivot', '  put pivot in its final position p', '  quickSort(lo, p - 1); quickSort(p + 1, hi)'],
    run: quickSort,
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    stable: false,
    blurb: 'Turns the array into a max-heap, then repeatedly swaps the largest value (the root) to the end and repairs the heap. Guaranteed O(n log n) with O(1) extra space.',
    pseudocode: ['build a max-heap from the array', 'for end from n - 1 down to 1:', '  swap a[0], a[end]', '  sift a[0] down within a[0..end-1]'],
    run: heapSort,
  },
]

export function getSortingAlgorithm(id) {
  return SORTING_ALGORITHMS.find((algo) => algo.id === id)
}

export function generateSortingSteps(id, array) {
  const algo = getSortingAlgorithm(id)
  if (!algo) throw new Error(`Unknown sorting algorithm: ${id}`)
  return algo.run(array)
}

export function isSorted(array) {
  for (let i = 1; i < array.length; i++) if (array[i - 1] > array[i]) return false
  return true
}

/** A random array of `n` integers in [min, max]; `rng` is injectable for deterministic tests. */
export function randomArray(n, { min = 5, max = 100, rng = Math.random } = {}) {
  return Array.from({ length: n }, () => min + Math.floor(rng() * (max - min + 1)))
}

export const ARRAY_PRESETS = [
  { id: 'random', label: 'Random' },
  { id: 'nearly', label: 'Nearly sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'few', label: 'Few unique' },
]

/**
 * Input shapes that show how algorithms behave in their best and worst cases
 * (e.g. insertion sort flies on "nearly sorted", quick sort struggles on "reversed").
 */
export function arrayPreset(kind, n, { rng = Math.random } = {}) {
  const base = randomArray(n, { rng })
  switch (kind) {
    case 'nearly': {
      const arr = [...base].sort((a, b) => a - b)
      const swaps = Math.max(1, Math.floor(n / 10))
      for (let s = 0; s < swaps; s++) {
        const i = Math.floor(rng() * n)
        const j = Math.min(n - 1, i + 1 + Math.floor(rng() * 2))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }
    case 'reversed':
      return [...base].sort((a, b) => b - a)
    case 'few': {
      const values = [20, 45, 70, 95]
      return Array.from({ length: n }, () => values[Math.floor(rng() * values.length)])
    }
    default:
      return base
  }
}
