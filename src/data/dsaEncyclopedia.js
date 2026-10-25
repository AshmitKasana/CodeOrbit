// Comprehensive, real-world verified DSA Encyclopedia guides covering all
// remaining core data structures, algorithms, patterns, and system-design DSA
// topics so any search across the website returns accurate, runnable,
// interview-grade content.

export const ENCYCLOPEDIA_GUIDES = [
  // ------------------------------------------------------- programming basics
  {
    id: 'programming-basics',
    keys: ['programming basics', 'basics', 'stack vs heap', 'pass by value', 'pass by reference', 'variables', 'control flow', 'functions', 'memory management'],
    title: 'Programming Basics & Memory Model',
    summary: 'Variables, control flow, functions, stack vs heap allocation, and how values vs references are passed across function calls.',
    analogy: 'Think of the Call Stack as a neat stack of scratchpads on your desk (thrown away the moment a task finishes) and the Heap as a warehouse where large objects live until no one holds a claim ticket anymore.',
    keyIdea:
      'Every running program divides memory into a fast, LIFO Call Stack (for local primitives, pointers, and function frames) and a larger Heap (for dynamically allocated objects, arrays, and nodes). Primitives are copied by value; objects are accessed through references (addresses stored on the stack pointing to the heap).',
    whenToUse: [
      'Reasoning about whether a function mutates the caller’s data',
      'Debugging StackOverflowError vs OutOfMemoryError',
      'Choosing between value types (structs/primitives) and reference types (classes/objects)',
      'Understanding shallow copy vs deep copy',
    ],
    steps:
      '1) When a function is called, a new stack frame is pushed holding its parameters and local variables. 2) Large or dynamic structures are allocated on the heap, and their memory address is stored in a stack variable. 3) Passing an object passes a copy of that reference (aliasing the same heap object). 4) When the function returns, its stack frame is popped in O(1) time.',
    memory: 'Stack allocation/deallocation is a single CPU stack-pointer bump (O(1)). Heap allocation requires an allocator and either manual free/RAII (C/C++/Rust) or Garbage Collection (Java/Python/JS/Go).',
    complexity: {
      best: 'O(1) stack push/pop',
      average: 'O(1) variable access',
      worst: 'O(n) deep copy',
      space: 'O(depth) call stack + O(n) heap',
      explanation: 'Local variable lookup and stack frame allocation are O(1). Copying a reference is O(1), while deep-copying an n-element structure costs O(n).',
    },
    visual: { type: 'pointer-diagram' },
    templates: {
      Python: `
def mutate_list(items):
    # items references the SAME list on the heap (aliasing)
    items.append(4)

def reassign_list(items):
    # Rebinds local name only; caller's list is unchanged
    items = [99, 100]

data = [1, 2, 3]
mutate_list(data)      # data is now [1, 2, 3, 4]
reassign_list(data)    # data is still [1, 2, 3, 4]
shallow_copy = data[:] # new list on the heap`,
      JavaScript: `
function mutateObject(box) {
  box.count += 1; // mutates shared heap object
}

function reassignObject(box) {
  box = { count: 999 }; // only rebinds local parameter
}

const state = { count: 1 };
mutateObject(state);   // state.count === 2
reassignObject(state); // state.count === 2
const clone = structuredClone(state); // deep copy`,
    },
    mistakes: [
      { mistake: 'Confusing reference mutation with parameter reassignment', explanation: 'Mutating a property or element (`arr.push(x)`) affects the caller, but reassigning the parameter (`arr = []`) only changes the local variable.' },
      { mistake: 'Using shallow copy on nested arrays/Matrices', explanation: '`grid[:]` or `[...grid]` copies only the outer array; inner rows are still shared references.' },
      { mistake: 'Unbounded recursion blowing the call stack', explanation: 'Each recursive call consumes a stack frame; without a reachable base case, the stack overflows.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'In-Place Array Swap vs Copy',
        statement: 'Given an array of integers, swap the first and last elements in-place without allocating a new array.',
        example: 'Input: [10, 20, 30, 40]\nOutput: [40, 20, 30, 10]',
        hint: 'Index directly into index 0 and index len(arr) - 1.',
        solution: `
def swap_ends(arr):
    if len(arr) >= 2:
        arr[0], arr[-1] = arr[-1], arr[0]
    return arr`,
        explanation: 'Mutating indices in place modifies the existing heap array in O(1) time and O(1) space.',
        complexity: 'O(1) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Deep Copy a 2D Matrix',
        statement: 'Given an m×n 2D grid, create an independent deep copy so mutating the copy never alters the original grid.',
        example: 'Input: [[1,2],[3,4]]\nOutput: [[1,2],[3,4]] (independent rows)',
        hint: 'Copy each inner row individually rather than only copying the outer list.',
        solution: `
def deep_copy_grid(grid):
    return [row[:] for row in grid]`,
        explanation: 'Creating a new slice `row[:]` for every row allocates fresh row lists on the heap.',
        complexity: 'O(m·n) time, O(m·n) space',
      },
    ],
    questionCategory: 'complexity',
    related: ['Big O Notation', 'Arrays', 'Recursion', 'Pointers'],
  },

  // ----------------------------------------------------------- big o notation
  {
    id: 'big-o-notation',
    keys: ['big o', 'big-o', 'big o notation', 'time complexity', 'space complexity', 'asymptotic analysis', 'amortized', 'master theorem'],
    title: 'Big O Notation & Complexity Analysis',
    summary: 'Big-O measures how an algorithm’s runtime and memory scale as the input size n grows toward infinity, dropping constants and lower-order terms.',
    analogy: 'Think of shipping goods across the country: walking takes O(n) hours with distance, while sending a digital file takes O(1) regardless of distance.',
    keyIdea:
      'Big-O (upper bound), Big-Ω (lower bound), and Big-Θ (tight bound) classify growth rates: O(1) < O(log n) < O(√n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). Sequential steps add; nested loops multiply; halving the search space each step gives O(log n); dividing into two halves and merging in O(n) gives O(n log n).',
    whenToUse: [
      'Predicting whether an algorithm will pass within the 1-second (~10⁸ ops) interview limit',
      'Comparing trade-offs between time and auxiliary space (e.g. O(n²) brute force vs O(n) hash map)',
      'Analyzing recursive call trees using recurrence relations or the Master Theorem',
      'Explaining amortized O(1) operations like dynamic array append or two-stack queue',
    ],
    steps:
      '1) Identify the input variables (n, m, V, E). 2) Count how many times the innermost operation executes as a function of n. 3) For recursion, multiply the number of tree nodes by work per node (or apply the Master Theorem). 4) Drop constant multipliers and lower-order terms. 5) Count extra allocations plus maximum recursion stack depth for Space Complexity.',
    memory: 'Auxiliary space measures memory allocated beyond the input itself. Always include recursive call-stack frames O(recursion depth).',
    complexity: {
      best: 'O(1) constant',
      average: 'O(log n) to O(n log n)',
      worst: 'O(2ⁿ) or O(n!) exponential',
      space: 'O(1) in-place to O(n)',
      explanation: 'Input constraints dictate target Big-O: n ≤ 20 → O(2ⁿ); n ≤ 5,000 → O(n²); n ≤ 10⁵ → O(n log n); n ≤ 10⁶ → O(n); n ≥ 10⁹ → O(log n) or O(1).',
    },
    visual: { type: 'array', values: [1, 2, 4, 8, 16, 32, 64] },
    templates: {
      Python: `
# O(1) — Constant time
def get_first(nums):
    return nums[0] if nums else None

# O(log n) — Logarithmic time (halves each step)
def count_halvings(n):
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps

# O(n log n) — Harmonic / Log-linear loop
def log_linear_pairs(n):
    ops = 0
    i = 1
    while i <= n:
        for _ in range(n):
            ops += 1
        i *= 2
    return ops`,
      JavaScript: `
// O(1) — Constant
const getFirst = (nums) => nums[0] ?? null;

// O(log n) — Logarithmic
function countHalvings(n) {
  let steps = 0;
  while (n > 1) { n = Math.floor(n / 2); steps++; }
  return steps;
}

// O(n) — Linear single pass
function arraySum(nums) {
  let total = 0;
  for (const x of nums) total += x;
  return total;
}`,
    },
    mistakes: [
      { mistake: 'Assuming every nested loop is O(n²)', explanation: 'In Sliding Window, Monotonic Stack, and Two Pointers, the inner `while` loop advances a pointer that never moves backward, so total work across the whole run is O(n).' },
      { mistake: 'Forgetting hidden O(n) operations inside loops', explanation: 'String concatenation (`s += ch` in some languages), `list.pop(0)`, `in list`, or slicing `arr[:]` inside a loop silently adds an O(n) factor.' },
      { mistake: 'Ignoring recursion stack space', explanation: 'A recursive DFS with no arrays still uses O(h) call-stack memory.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Eliminate an O(n²) Duplicate Check',
        statement: 'Given an array of n integers, determine if any value appears at least twice in O(n) time instead of O(n²) nested loops.',
        example: 'Input: [1, 2, 3, 1]\nOutput: true',
        hint: 'Trade O(n) space for O(1) hash-set lookups.',
        solution: `
def has_duplicate(nums):
    return len(set(nums)) < len(nums)`,
        explanation: 'Inserting n elements into a hash set costs O(1) average per element, reducing O(n²) to O(n) time and O(n) space.',
        complexity: 'O(n) time, O(n) space',
      },
      {
        difficulty: 'Medium',
        title: 'Range Sum Queries in O(1) Instead of O(n)',
        statement: 'Preprocess an array of n integers in O(n) time so that any subarray sum query `sum(l, r)` runs in O(1) time.',
        example: 'nums = [2, 4, 6, 8], sum(1, 3) → 18',
        hint: 'Store cumulative prefix sums.',
        solution: `
def build_prefix(nums):
    pref = [0]
    for x in nums:
        pref.append(pref[-1] + x)
    return pref
# Query sum(l, r) = pref[r + 1] - pref[l] in O(1)`,
        explanation: 'O(n) preprocessing avoids scanning O(n) elements per query when Q queries are asked.',
        complexity: 'O(n) preprocessing, O(1) per query',
      },
    ],
    questionCategory: 'complexity',
    related: ['Arrays', 'Binary Search', 'Recursion', 'Sorting', 'Hash Table'],
  },

  // ------------------------------------------------------------------ strings
  {
    id: 'strings',
    keys: ['string', 'strings', 'string algorithms', 'palindrome', 'anagram', 'character array', 'ascii', 'unicode'],
    title: 'Strings & String Manipulation',
    summary: 'A string is a sequence of characters stored contiguously; mastering immutability, frequency counting, two pointers, and rolling hashes solves most string problems in O(n).',
    analogy: 'Think of an immutable string like words carved into a stone tablet: to change one letter you must carve a brand-new tablet, unless you first lay out movable Scrabble tiles (a character list/builder) and join them at the end.',
    keyIdea:
      'In Python, Java, JavaScript, C#, and Go, strings are immutable: concatenating in a loop (`s += ch`) copies the string repeatedly unless you accumulate in a list/StringBuilder and `join` in O(n). Most string interview problems reduce to (1) a 26-slot frequency array for anagrams/windows, (2) two pointers for palindromes/reversals, or (3) KMP / Rabin-Karp for substring search.',
    whenToUse: [
      'Anagram, permutation, and character-frequency window problems',
      'Palindrome validation and longest palindromic substring (expand around center)',
      'Parsing, tokenization, and run-length encoding/decoding',
      'Pattern matching and prefix/suffix queries',
    ],
    steps:
      '1) Clarify the character set (lowercase ASCII a–z vs full ASCII vs Unicode) and case sensitivity. 2) Use a list of characters + `"".join()` when building strings incrementally. 3) For substrings, use a Sliding Window with a frequency map. 4) For palindromes, expand outward from each of the 2n − 1 centers.',
    memory: 'An n-character string takes O(n) memory. Building a string via `"".join(parts)` allocates only once (O(n)) instead of O(n²) intermediate copies.',
    complexity: {
      best: 'O(1) index access',
      average: 'O(n) scan / join / hash',
      worst: 'O(n²) naive concatenation in a loop',
      space: 'O(n) for new string or builder',
      explanation: 'Indexing a character is O(1); comparing, hashing, or slicing a string of length n costs O(n).',
    },
    visual: { type: 'array', values: ['o', 'r', 'b', 'i', 't'] },
    templates: {
      Python: `
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for a, b in zip(s, t):
        counts[ord(a) - 97] += 1
        counts[ord(b) - 97] -= 1
    return all(c == 0 for c in counts)

def longest_palindrome(s: str) -> str:
    best = (0, 0)
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l > best[1] - best[0]:
                    best = (l, r)
                l -= 1; r += 1
    return s[best[0]:best[1] + 1]`,
      JavaScript: `
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    counts[s.charCodeAt(i) - 97]++;
    counts[t.charCodeAt(i) - 97]--;
  }
  return counts.every((c) => c === 0);
}

function reverseWords(s) {
  return s.trim().split(/\\s+/).reverse().join(" ");
}`,
    },
    mistakes: [
      { mistake: 'Repeated `s = s + char` inside a loop', explanation: 'In Java and C#, repeated string concatenation allocates a new string every iteration (O(n²)). Collect pieces in an array/StringBuilder and join once.' },
      { mistake: 'Forgetting even-length palindromes when expanding around center', explanation: 'Always check both single-character centers `(i, i)` and between-character centers `(i, i + 1)`.' },
      { mistake: 'Assuming `s.slice()` is O(1)', explanation: 'Slicing a string copies the characters in the slice, costing O(k) time and space.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Valid Anagram',
        statement: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
        example: 'Input: s = "anagram", t = "nagaram"\nOutput: true',
        hint: 'Count character frequencies in a 26-element array.',
        solution: `
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    cnt = [0] * 26
    for a, b in zip(s, t):
        cnt[ord(a) - 97] += 1
        cnt[ord(b) - 97] -= 1
    return all(x == 0 for x in cnt)`,
        explanation: 'Incrementing for s and decrementing for t leaves all zeros if and only if both strings have identical character counts.',
        complexity: 'O(n) time, O(1) space (26 slots)',
      },
      {
        difficulty: 'Medium',
        title: 'Longest Palindromic Substring',
        statement: 'Given a string s, return the longest palindromic substring in s.',
        example: 'Input: s = "babad"\nOutput: "bab" (or "aba")',
        hint: 'Expand outward from every index i for both odd (i, i) and even (i, i+1) palindromes.',
        solution: `
def longest_palindrome(s):
    res = ""
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l + 1 > len(res):
                    res = s[l:r + 1]
                l -= 1
                r += 1
    return res`,
        explanation: 'There are 2n − 1 possible centers, and expanding from each takes at most O(n) steps.',
        complexity: 'O(n²) time, O(1) auxiliary space',
      },
    ],
    questionCategory: 'arrays',
    related: ['Arrays', 'Sliding Window', 'Two Pointers', 'Trie', 'KMP Algorithm'],
  },

  // -------------------------------------------------------------------- stack
  {
    id: 'stack',
    keys: ['stack', 'stacks', 'lifo', 'call stack', 'min stack', 'valid parentheses'],
    exclude: ['monotonic'],
    title: 'Stack (LIFO)',
    summary: 'A stack is a Last-In, First-Out (LIFO) structure where elements are pushed and popped from the top in O(1) time.',
    analogy: 'Think of a spring-loaded stack of cafeteria trays: you always place a clean tray on top and take the top tray off first.',
    keyIdea:
      'Because the most recently added item is always the first to be removed, stacks naturally model nested structures: matching parentheses, HTML/XML tags, expression evaluation (Reverse Polish Notation), browser back-history, undo/redo stacks, and iterative DFS.',
    whenToUse: [
      'Matching nested brackets, parentheses, or delimiters',
      'Evaluating arithmetic expressions (Infix / Postfix / Basic Calculator)',
      'Tracking state history (Undo/Redo, Browser Back button)',
      'Converting recursive tree/graph DFS into an iterative loop',
    ],
    steps:
      'Use a dynamic array (`list` in Python, `Array` in JS, `ArrayDeque` in Java). `push(x)` appends to the end in O(1) amortized time; `pop()` removes from the end in O(1); `peek()` reads `stack[-1]` in O(1). Always guard `if stack:` before popping or peeking.',
    memory: 'Backed by a contiguous dynamic array or singly linked list using O(n) space for n pushed elements.',
    complexity: {
      best: 'O(1) push / pop / peek',
      average: 'O(1) push / pop / peek',
      worst: 'O(1) amortized',
      space: 'O(n)',
      explanation: 'All stack operations touch only the top end of the backing array, so every operation is O(1).',
    },
    visual: { type: 'stack' },
    templates: {
      Python: `
def is_valid_parentheses(s: str) -> bool:
    stack = []
    match = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in match:
            if not stack or stack.pop() != match[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
      JavaScript: `
function isValidParentheses(s) {
  const stack = [];
  const match = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch in match) {
      if (!stack.length || stack.pop() !== match[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
    },
    mistakes: [
      { mistake: 'Popping from an empty stack', explanation: 'In bracket matching, a closing bracket when the stack is empty must immediately return false instead of throwing an IndexError.' },
      { mistake: 'Forgetting to check if the stack is empty at the end', explanation: 'An input like `"((("` never fails a pop check, so you must verify `len(stack) == 0` after the loop.' },
      { mistake: 'Using Java’s legacy `java.util.Stack`', explanation: 'Java’s `Stack` extends `Vector` and synchronizes every method call; prefer `ArrayDeque` in interviews.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Valid Parentheses',
        statement: 'Given a string s containing just "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
        example: 'Input: s = "()[]{}" → true\nInput: s = "(]" → false',
        hint: 'Push opening brackets onto a stack and match each closing bracket against the stack top.',
        solution: `
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
        explanation: 'The most recently opened bracket must be closed first — the exact LIFO property of a stack.',
        complexity: 'O(n) time, O(n) space',
      },
      {
        difficulty: 'Medium',
        title: 'Evaluate Reverse Polish Notation',
        statement: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation (postfix) with +, -, *, and / (truncating toward zero).',
        example: 'Input: ["2","1","+","3","*"]\nOutput: 9   ((2 + 1) * 3)',
        hint: 'Push numbers onto a stack; on an operator, pop the top two operands, apply the operator, and push the result.',
        solution: `
def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in {"+", "-", "*", "/"}:
            b, a = stack.pop(), stack.pop()
            if t == "+": stack.append(a + b)
            elif t == "-": stack.append(a - b)
            elif t == "*": stack.append(a * b)
            else: stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack[0]`,
        explanation: 'Note operand order on pop: the first popped value is the right operand `b`, and the second is the left operand `a`.',
        complexity: 'O(n) time, O(n) space',
      },
    ],
    questionCategory: 'stacks-queues',
    related: ['Queue', 'Deque', 'Monotonic Stack', 'Recursion', 'DFS'],
  },

  // ------------------------------------------------------------ queue & deque
  {
    id: 'queue-deque',
    keys: ['queue', 'queues', 'deque', 'deques', 'double ended queue', 'fifo', 'circular queue', 'sliding window maximum', 'monotonic deque'],
    title: 'Queue & Deque (FIFO / Double-Ended)',
    summary: 'A queue processes items First-In, First-Out (FIFO); a deque (double-ended queue) supports O(1) push and pop at both ends.',
    analogy: 'A queue is a line at a coffee shop (first in line gets served first); a deque is a train car with doors at both ends.',
    keyIdea:
      'Queues drive Breadth-First Search (BFS), level-order tree traversal, rate limiters, and task buffers. A Deque (`collections.deque` in Python, `ArrayDeque` in Java) also powers the Monotonic Deque pattern — maintaining the maximum or minimum of a sliding window in O(n) time.',
    whenToUse: [
      'BFS shortest path and level-by-level tree traversal',
      'Sliding Window Maximum / Minimum (monotonic decreasing/increasing deque)',
      '0-1 BFS on graphs where edge weights are only 0 or 1',
      'Rate limiting (sliding log window) and producer-consumer task buffers',
    ],
    steps:
      'Always use a doubly linked list or circular ring buffer (`collections.deque`), never `list.pop(0)`. For Sliding Window Maximum of size k: pop smaller elements from the right of the deque, append current index `i`, pop front if `dq[0] <= i - k`, and read `nums[dq[0]]` as the window max.',
    memory: 'O(n) for standard queues, or O(k) for a sliding-window deque of window size k.',
    complexity: {
      best: 'O(1) enqueue / dequeue',
      average: 'O(1) both ends',
      worst: 'O(1)',
      space: 'O(n)',
      explanation: 'A circular array or doubly-linked block deque performs push/pop at both front and back in O(1) time.',
    },
    visual: { type: 'queue' },
    templates: {
      Python: `
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      JavaScript: `
function maxSlidingWindow(nums, k) {
  const dq = []; // stores indices
  let head = 0;
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}`,
    },
    mistakes: [
      { mistake: 'Using `list.pop(0)` or `Array.shift()` in a loop', explanation: 'Shifting an array moves all remaining elements in O(n), turning an O(n) BFS into O(n²).' },
      { mistake: 'Storing values instead of indices in a Monotonic Deque', explanation: 'Storing indices lets you check whether the front element has fallen out of the window (`dq[0] <= i - k`).' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Implement Queue using Stacks',
        statement: 'Implement a FIFO queue using only two LIFO stacks so push, pop, peek, and empty run in amortized O(1) time.',
        example: 'push(1), push(2), peek() → 1, pop() → 1',
        hint: 'Push to `in_stack`; only pour `in_stack` into `out_stack` when `out_stack` is empty.',
        solution: `
class MyQueue:
    def __init__(self):
        self.in_stk, self.out_stk = [], []

    def push(self, x):
        self.in_stk.append(x)

    def peek(self):
        if not self.out_stk:
            while self.in_stk:
                self.out_stk.append(self.in_stk.pop())
        return self.out_stk[-1]

    def pop(self):
        self.peek()
        return self.out_stk.pop()`,
        explanation: 'Every element is pushed and popped at most twice (once in `in_stack`, once in `out_stack`), giving amortized O(1).',
        complexity: 'O(1) amortized time, O(n) space',
      },
      {
        difficulty: 'Hard',
        title: 'Sliding Window Maximum',
        statement: 'Given an array nums and window size k, return the maximum value in each sliding window of size k as it moves left to right.',
        example: 'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]',
        hint: 'Keep a monotonic decreasing deque of indices.',
        solution: `
from collections import deque

def max_sliding_window(nums, k):
    dq, res = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res`,
        explanation: 'Each index enters and leaves the deque at most once, so the entire scan is O(n).',
        complexity: 'O(n) time, O(k) space',
      },
    ],
    questionCategory: 'stacks-queues',
    related: ['Stack', 'BFS', 'Sliding Window', 'Monotonic Stack'],
  },

  // -------------------------------------------------- trees & binary trees
  {
    id: 'binary-tree',
    keys: ['tree', 'trees', 'binary tree', 'binary trees', 'binary tree traversals', 'inorder', 'preorder', 'postorder', 'level order', 'lowest common ancestor', 'lca'],
    exclude: ['search tree', 'bst', 'avl', 'red-black', 'segment', 'fenwick', 'spanning'],
    title: 'Trees & Binary Tree Traversals',
    summary: 'A binary tree is a hierarchical structure where each node has at most two children (`left` and `right`), traversed via DFS (preorder, inorder, postorder) or BFS (level-order).',
    analogy: 'Think of a family tree or a folder hierarchy on your computer: every folder starts from a single root and branches into subfolders down to the leaf files.',
    keyIdea:
      'Most binary tree problems are solved recursively by asking: "If I know the answer for `node.left` and `node.right`, how do I combine them at `node`?" Preorder (Node-Left-Right) is for cloning/serialization; Inorder (Left-Node-Right) yields sorted order on a BST; Postorder (Left-Right-Node) computes bottom-up heights, diameters, path sums, and Lowest Common Ancestor.',
    whenToUse: [
      'Computing tree height, diameter, balance, or maximum path sum (bottom-up postorder)',
      'Level-by-level views: right-side view, zigzag order, average of levels (BFS queue)',
      'Finding the Lowest Common Ancestor (LCA) of two nodes',
      'Serializing and deserializing hierarchical data (DOM, JSON, ASTs)',
    ],
    steps:
      '1) Base case: `if not node: return 0` (or `None`). 2) Recurse on `node.left` and `node.right`. 3) Combine child results at `node`. For path-sum/diameter problems, update a global best with the arch `left + right + node` while returning only the single best downward branch `node + max(left, right)` to the parent.',
    memory: 'Visiting n nodes takes O(n) time. Recursion stack depth is O(h), where height h is O(log n) for a balanced tree and O(n) for a skewed chain.',
    complexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(h) stack (O(log n) balanced, O(n) skewed)',
      explanation: 'Every traversal visits each of the n nodes a constant number of times.',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
def inorder_traversal(root):
    res, stack, cur = [], [], root
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        res.append(cur.val)
        cur = cur.right
    return res

def lowest_common_ancestor(root, p, q):
    if not root or root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    return root if (left and right) else (left or right)`,
      JavaScript: `
function inorderTraversal(root) {
  const res = [], stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    res.push(cur.val);
    cur = cur.right;
  }
  return res;
}

function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  return left && right ? root : left || right;
}`,
    },
    mistakes: [
      { mistake: 'Confusing node count with edge count in height/diameter', explanation: 'Diameter is usually defined as the number of edges (`left_height + right_height`), whereas depth is often the number of nodes.' },
      { mistake: 'Returning a bent path upward in Maximum Path Sum', explanation: 'A path can arch through the current node (`left + node + right`), but the value returned to the parent must choose only one side (`node + max(left, right)`).' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Invert Binary Tree',
        statement: 'Given the root of a binary tree, invert the tree (mirror its left and right subtrees at every node) and return its root.',
        example: 'Input: [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]',
        hint: 'Swap `node.left` and `node.right`, then recursively invert both children.',
        solution: `
def invert_tree(root):
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
        explanation: 'Every node swaps its two child pointers recursively in O(n) time.',
        complexity: 'O(n) time, O(h) stack space',
      },
      {
        difficulty: 'Medium',
        title: 'Diameter of Binary Tree',
        statement: 'Return the length of the longest path (in edges) between any two nodes in a binary tree.',
        example: 'Input: [1,2,3,4,5]\nOutput: 3 (path 4-2-1-3 or 5-2-1-3)',
        hint: 'At each node, the longest path through it is `left_height + right_height`.',
        solution: `
def diameter_of_binary_tree(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    height(root)
    return best`,
        explanation: 'Postorder DFS computes heights bottom-up while updating the maximum `l + r` span.',
        complexity: 'O(n) time, O(h) space',
      },
    ],
    questionCategory: 'trees',
    related: ['Binary Search Tree', 'AVL Tree', 'BFS', 'DFS', 'Heap'],
  },

  // ------------------------------------------------ binary search tree & balanced BSTs
  {
    id: 'binary-search-tree',
    keys: ['binary search tree', 'bst', 'avl tree', 'avl', 'red-black tree', 'red black tree', 'balanced bst', 'self-balancing tree'],
    title: 'Binary Search Tree (BST), AVL & Red-Black Trees',
    summary: 'A BST keeps every left descendant smaller and every right descendant larger than its parent, enabling O(log n) search, insert, delete, floor, and ceiling when balanced.',
    analogy: 'Think of a dictionary thumb-index: at every decision point, everything alphabetically smaller is to the left and everything larger is to the right.',
    keyIdea:
      'The BST invariant (`all(left) < node.val < all(right)`) means an inorder traversal visits keys in sorted order. A plain BST can degenerate into an O(n) linked list if sorted keys are inserted; self-balancing BSTs — **AVL Trees** (strict height balance ≤ 1 via rotations) and **Red-Black Trees** (color invariants ensuring longest path ≤ 2× shortest path) — guarantee O(log n) height.',
    whenToUse: [
      'Ordered key lookup, range queries `[lo, hi]`, floor/ceiling, and rank queries (`k-th smallest`)',
      'Maintaining a dynamically sorted stream where hash tables cannot answer predecessor/successor queries',
      'Understanding C++ `std::map`/`std::set` and Java `TreeMap`/`TreeSet` (backed by Red-Black Trees)',
    ],
    steps:
      'Search/Insert: compare `target` with `node.val`; go left if smaller, right if larger. Validate BST: pass down `(low, high)` bounds from ancestors. Delete: if the node has 2 children, replace its value with its inorder successor (the leftmost node of its right subtree) and delete that successor.',
    memory: 'O(n) nodes; balanced AVL/Red-Black trees bound recursion stack depth strictly to O(log n).',
    complexity: {
      best: 'O(log n)',
      average: 'O(log n) search / insert / delete',
      worst: 'O(log n) AVL/Red-Black, O(n) unbalanced BST',
      space: 'O(n)',
      explanation: 'AVL trees do slightly more rotations on insert/delete for faster lookups; Red-Black trees do at most 2–3 rotations per insert/delete, making them the standard library default.',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
def is_valid_bst(root, lo=float('-inf'), hi=float('inf')):
    if not root:
        return True
    if not (lo < root.val < hi):
        return False
    return is_valid_bst(root.left, lo, root.val) and is_valid_bst(root.right, root.val, hi)

def kth_smallest_bst(root, k):
    stack, cur = [], root
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val
        cur = cur.right`,
      JavaScript: `
function isValidBST(root, lo = -Infinity, hi = Infinity) {
  if (!root) return true;
  if (!(lo < root.val && root.val < hi)) return false;
  return isValidBST(root.left, lo, root.val) && isValidBST(root.right, root.val, hi);
}

function searchBST(root, val) {
  while (root && root.val !== val) {
    root = val < root.val ? root.left : root.right;
  }
  return root;
}`,
    },
    mistakes: [
      { mistake: 'Validating a BST by only checking `node.left.val < node.val < node.right.val`', explanation: 'Every node in the left subtree must be smaller than *all* ancestors to its right — you must pass `(lo, hi)` bounds down.' },
      { mistake: 'Forgetting that unbalanced BSTs degrade to O(n)', explanation: 'Inserting `[1, 2, 3, 4, 5]` into an unbalanced BST creates a skewed chain of height n.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Validate Binary Search Tree',
        statement: 'Given the root of a binary tree, determine if it is a valid Binary Search Tree.',
        example: 'Input: [2,1,3] → true\nInput: [5,1,4,null,null,3,6] → false (3 < 5 in right subtree)',
        hint: 'Propagate `(min_bound, max_bound)` down each recursive call.',
        solution: `
def is_valid_bst(root, lo=float('-inf'), hi=float('inf')):
    if not root:
        return True
    if not (lo < root.val < hi):
        return False
    return is_valid_bst(root.left, lo, root.val) and is_valid_bst(root.right, root.val, hi)`,
        explanation: 'Passing ancestor bounds catches nodes deep in a subtree that violate an ancestor’s inequality.',
        complexity: 'O(n) time, O(h) space',
      },
      {
        difficulty: 'Medium',
        title: 'Delete Node in a BST',
        statement: 'Given a root node reference of a BST and a key, delete the node with the given key and return the new root.',
        example: 'Input: root = [5,3,6,2,4,null,7], key = 3\nOutput: [5,4,6,2,null,null,7]',
        hint: 'If the target node has two children, replace its value with the minimum value in its right subtree.',
        solution: `
def delete_node(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        if not root.left: return root.right
        if not root.right: return root.left
        succ = root.right
        while succ.left:
            succ = succ.left
        root.val = succ.val
        root.right = delete_node(root.right, succ.val)
    return root`,
        explanation: 'The inorder successor is the smallest key greater than `root.val`, so promoting it preserves the BST property.',
        complexity: 'O(h) time, O(h) space',
      },
    ],
    questionCategory: 'trees',
    related: ['Binary Tree', 'Binary Search', 'Heap', 'Segment Tree'],
  },

  // ------------------------------------------------ graphs & graph algorithms
  {
    id: 'graphs-core',
    keys: ['graph', 'graphs', 'graph algorithms', 'bipartite graph', 'bipartite', 'cycle detection', 'connected components', 'adjacency list', 'adjacency matrix'],
    exclude: ['bfs', 'dfs', 'dijkstra', 'topological', 'union-find', 'kruskal', 'prim', 'bellman', 'floyd', 'tarjan'],
    title: 'Graphs, Cycle Detection & Bipartite Coloring',
    summary: 'A graph models relationships as vertices (V) connected by edges (E), represented via an Adjacency List O(V + E) for sparse graphs or an Adjacency Matrix O(V²) for dense graphs.',
    analogy: 'Think of a flight map: cities are vertices, flight routes are edges (directed if one-way, weighted by ticket price or flight duration).',
    keyIdea:
      'Almost every graph problem starts by building an adjacency list (`adj[u].append(v)`), then running BFS (shortest unweighted path), 3-state DFS (cycle detection & topological sort), 2-coloring (bipartite check), Union-Find (dynamic connectivity & MST), or Dijkstra (weighted shortest path).',
    whenToUse: [
      'Modeling networks, prerequisites, social connections, or grid mazes',
      'Checking if a graph can be split into two independent teams (2-Coloring / Bipartite Check)',
      'Detecting circular dependencies in directed graphs (3-color DFS) or undirected graphs (Union-Find)',
      'Cloning graphs or finding connected components',
    ],
    steps:
      '1) Clarify directed vs undirected, weighted vs unweighted, cyclic vs DAG, and connected vs disconnected. 2) Build an adjacency list of size V. 3) Loop `for u in range(V)` to handle disconnected components. 4) For Bipartite Check, color nodes `1` and `-1` alternately; if a neighbor already has the same color, an odd-length cycle exists.',
    memory: 'Adjacency list uses O(V + E) space; visited / color / state arrays use O(V) space.',
    complexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V + E)',
      explanation: 'Traversing an adjacency list visits every vertex and inspects every edge a constant number of times.',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
from collections import deque

def is_bipartite(graph: list[list[int]]) -> bool:
    color = [0] * len(graph)  # 0 = uncolored, 1 = red, -1 = blue
    for start in range(len(graph)):
        if color[start] != 0:
            continue
        color[start] = 1
        q = deque([start])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == color[u]:
                    return False
                if color[v] == 0:
                    color[v] = -color[u]
                    q.append(v)
    return True`,
      JavaScript: `
function isBipartite(graph) {
  const color = new Array(graph.length).fill(0);
  for (let i = 0; i < graph.length; i++) {
    if (color[i] !== 0) continue;
    color[i] = 1;
    const q = [i];
    for (let head = 0; head < q.length; head++) {
      const u = q[head];
      for (const v of graph[u]) {
        if (color[v] === color[u]) return false;
        if (color[v] === 0) { color[v] = -color[u]; q.push(v); }
      }
    }
  }
  return true;
}`,
    },
    mistakes: [
      { mistake: 'Starting BFS/DFS from node 0 only on a disconnected graph', explanation: 'Always wrap your traversal in a loop over all vertices `0..V-1` so isolated components are not missed.' },
      { mistake: 'Using a 2-state visited check for directed cycle detection', explanation: 'A diamond DAG (`1→2→4` and `1→3→4`) visits node 4 twice without a cycle; directed cycle detection requires 3 states (`unvisited`, `on_path`, `done`).' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Is Graph Bipartite?',
        statement: 'Given an undirected graph, return true if and only if its nodes can be partitioned into two independent sets A and B such that every edge connects a node in A to one in B.',
        example: 'Input: [[1,3],[0,2],[1,3],[0,2]]\nOutput: true',
        hint: 'Try 2-coloring each component with BFS or DFS.',
        solution: `
from collections import deque

def is_bipartite(graph):
    color = [0] * len(graph)
    for i in range(len(graph)):
        if color[i]:
            continue
        color[i] = 1
        q = deque([i])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == color[u]:
                    return False
                if not color[v]:
                    color[v] = -color[u]
                    q.append(v)
    return True`,
        explanation: 'A graph is bipartite if and only if it has no odd-length cycle, which 2-coloring detects in O(V + E).',
        complexity: 'O(V + E) time, O(V) space',
      },
      {
        difficulty: 'Medium',
        title: 'Clone Graph',
        statement: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.',
        example: 'Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: deep clone of all nodes and edges',
        hint: 'Map each original node to its clone in a dictionary before recursing on its neighbors.',
        solution: `
def clone_graph(node):
    if not node:
        return None
    clones = {}
    def dfs(u):
        if u in clones:
            return clones[u]
        copy = Node(u.val)
        clones[u] = copy
        for v in u.neighbors:
            copy.neighbors.append(dfs(v))
        return copy
    return dfs(node)`,
        explanation: 'Registering `clones[u] = copy` before recursing prevents infinite loops on cycles.',
        complexity: 'O(V + E) time, O(V) space',
      },
    ],
    questionCategory: 'graphs',
    related: ['BFS', 'DFS', 'Topological Sort', 'Union-Find', "Dijkstra's Algorithm"],
  },

  // -------------------------------------- dijkstra, bellman-ford, floyd-warshall
  {
    id: 'shortest-paths',
    keys: ["dijkstra's algorithm", 'dijkstra', 'dijkstras algorithm', 'shortest path algorithms', 'shortest path', 'bellman-ford', 'bellman ford', 'floyd-warshall', 'floyd warshall', 'a* search', 'a star'],
    title: 'Shortest Path Algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall)',
    summary: 'Find minimum-cost paths in weighted graphs: Dijkstra for non-negative weights O((V + E) log V), Bellman-Ford for negative weights/cycles O(V·E), and Floyd-Warshall for all-pairs O(V³).',
    analogy: 'Think of GPS navigation: BFS counts the number of intersections, whereas Dijkstra weighs each road by actual travel time and always expands the fastest known route next.',
    keyIdea:
      'All shortest-path algorithms rely on **edge relaxation**: if `dist[u] + weight(u, v) < dist[v]`, update `dist[v]`. **Dijkstra** uses a Min-Heap to greedily settle the closest unsettled vertex (requires `w ≥ 0`). **Bellman-Ford** relaxes all E edges V − 1 times (handles negative weights; a change on the V-th pass proves a negative cycle). **Floyd-Warshall** uses 3 nested loops `dp[k][i][j]` for all-pairs shortest paths on small graphs (`V ≤ 400`).',
    whenToUse: [
      'Weighted network routing, flight costs, or grid cells with varying traversal costs (Dijkstra)',
      'Graphs with negative edge weights, currency arbitrage, or at-most-K stops (Bellman-Ford)',
      'All-pairs shortest paths or transitive closure when V ≤ 400 (Floyd-Warshall)',
      '0-1 weighted grids where a deque (0-1 BFS) runs in O(V + E)',
    ],
    steps:
      'Dijkstra: 1) Set `dist[src] = 0`, all others `∞`, and push `(0, src)` into a min-heap. 2) Pop `(d, u)`; if `d > dist[u]` skip this stale entry. 3) For each edge `(u, v, w)`, if `d + w < dist[v]`, set `dist[v] = d + w` and push `(dist[v], v)`.',
    memory: 'Dijkstra stores `dist[V]` and the priority queue O(V + E). Floyd-Warshall stores a V×V matrix O(V²).',
    complexity: {
      best: 'O(E + V log V) Dijkstra',
      average: 'O((V + E) log V) Dijkstra · O(V·E) Bellman-Ford',
      worst: 'O(V³) Floyd-Warshall',
      space: 'O(V + E) Dijkstra · O(V²) Floyd-Warshall',
      explanation: 'Pick BFS for unweighted, 0-1 BFS for {0,1} weights, Dijkstra for non-negative weights, Bellman-Ford for negative weights, and Floyd-Warshall for all pairs.',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
import heapq

def dijkstra(n: int, edges: list[tuple[int, int, int]], src: int) -> list[float]:
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # skip stale heap entry
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
      JavaScript: `
function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return dist;
}`,
    },
    mistakes: [
      { mistake: 'Using Dijkstra with negative edge weights', explanation: 'Dijkstra assumes that once a vertex is popped with minimum distance, no future path can lower it — a negative edge later can violate that invariant.' },
      { mistake: 'Forgetting `if d > dist[u]: continue` in Dijkstra', explanation: 'Without skipping stale heap entries, dense graphs can re-relax the same vertex many times.' },
      { mistake: 'Putting the intermediate vertex `k` as the inner loop in Floyd-Warshall', explanation: '`k` MUST be the outermost loop (`for k -> for i -> for j`) or dynamic programming states are read before they are computed.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Network Delay Time',
        statement: 'Given directed weighted times `(u, v, w)` for n nodes and a starting node k, return the time it takes for all n nodes to receive the signal, or -1 if impossible.',
        example: 'Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2',
        hint: 'Run Dijkstra from k and return the maximum distance among all n nodes.',
        solution: `
import heapq

def network_delay_time(times, n, k):
    adj = [[] for _ in range(n + 1)]
    for u, v, w in times:
        adj[u].append((v, w))
    dist = {k: 0}
    pq = [(0, k)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue
        for v, w in adj[u]:
            if d + w < dist.get(v, float('inf')):
                dist[v] = d + w
                heapq.heappush(pq, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1`,
        explanation: 'The signal reaches the last node at `max(dist)`; if fewer than n nodes are reached, the graph is disconnected.',
        complexity: 'O((V + E) log V) time, O(V + E) space',
      },
      {
        difficulty: 'Medium',
        title: 'Cheapest Flights Within K Stops',
        statement: 'Find the cheapest price from src to dst with at most k stops (k + 1 flights).',
        example: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1 → 700',
        hint: 'Run Bellman-Ford for k + 1 rounds, copying the distance array before each round.',
        solution: `
def find_cheapest_price(n, flights, src, dst, k):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(k + 1):
        nxt = dist[:]
        for u, v, w in flights:
            if dist[u] + w < nxt[v]:
                nxt[v] = dist[u] + w
        dist = nxt
    return -1 if dist[dst] == float('inf') else dist[dst]`,
        explanation: 'Using a copy `nxt = dist[:]` ensures each round uses paths of at most one additional edge.',
        complexity: 'O(k · E) time, O(V) space',
      },
    ],
    questionCategory: 'graphs',
    related: ['BFS', 'Heap', 'Graphs', 'Minimum Spanning Tree'],
  },

  // ------------------------------------------------ MST: Kruskal & Prim
  {
    id: 'minimum-spanning-tree',
    keys: ['minimum spanning tree', 'mst', "kruskal's algorithm", 'kruskal', 'kruskals algorithm', "prim's algorithm", 'prim', 'prims algorithm'],
    title: "Minimum Spanning Tree (Kruskal's & Prim's Algorithms)",
    summary: 'A Minimum Spanning Tree (MST) connects all V vertices of an undirected weighted graph using V − 1 edges with the minimum possible total weight and no cycles.',
    analogy: 'Imagine laying fiber-optic cable between cities: you want every city connected to the network while paying for the shortest total length of cable.',
    keyIdea:
      '**Kruskal’s Algorithm** sorts all edges by weight ascending and greedily adds each edge that connects two different components (checked via Union-Find) — ideal for sparse graphs O(E log E). **Prim’s Algorithm** grows a single tree outward from a start vertex using a Min-Heap of crossing edges — ideal for dense graphs O(E log V).',
    whenToUse: [
      'Minimum cost to connect all points, cities, or servers without cycles',
      'Clustering into k groups (run Kruskal and stop at V − k components)',
      'Minimax path problems (minimum bottleneck spanning tree)',
    ],
    steps:
      'Kruskal: 1) Sort edges by weight. 2) Initialize Union-Find with V components. 3) For each `(w, u, v)`, if `uf.union(u, v)` succeeds, add `w` to total cost and stop once V − 1 edges are chosen.',
    memory: 'O(V + E) to store edges and Union-Find / Min-Heap.',
    complexity: {
      best: 'O(E log V)',
      average: 'O(E log E) Kruskal · O(E log V) Prim',
      worst: 'O(E log E)',
      space: 'O(V + E)',
      explanation: 'Sorting E edges dominates Kruskal; heap operations dominate Prim.',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
def kruskal_mst(n: int, edges: list[tuple[int, int, int]]) -> int:
    # edges: (u, v, weight)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = taken = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            taken += 1
            if taken == n - 1:
                break
    return total if taken == n - 1 else -1`,
      JavaScript: `
function kruskalMST(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  edges.sort((a, b) => a[2] - b[2]);
  let total = 0, taken = 0;
  for (const [u, v, w] of edges) {
    const ru = find(u), rv = find(v);
    if (ru !== rv) {
      parent[ru] = rv;
      total += w;
      if (++taken === n - 1) break;
    }
  }
  return taken === n - 1 ? total : -1;
}`,
    },
    mistakes: [
      { mistake: 'Confusing MST with Shortest Path (Dijkstra)', explanation: 'MST minimizes the total weight of the whole network; Dijkstra minimizes the path distance from one specific source to each node.' },
      { mistake: 'Not checking if the graph was disconnected (`taken < n - 1`)', explanation: 'If fewer than V − 1 edges are added after scanning all edges, no spanning tree exists.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Min Cost to Connect All Points',
        statement: 'Given n 2D points `(xi, yi)`, the cost of connecting two points is their Manhattan distance `|xi - xj| + |yi - yj|`. Return the minimum cost to make all points connected.',
        example: 'Input: [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20',
        hint: 'Use Prim’s algorithm tracking the minimum distance from the current MST to each unvisited point in O(n²) time.',
        solution: `
def min_cost_connect_points(pts):
    n = len(pts)
    in_mst = [False] * n
    min_d = [float('inf')] * n
    min_d[0] = 0
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_mst[i]), key=lambda i: min_d[i])
        in_mst[u] = True
        total += min_d[u]
        for v in range(n):
            if not in_mst[v]:
                d = abs(pts[u][0] - pts[v][0]) + abs(pts[u][1] - pts[v][1])
                if d < min_d[v]:
                    min_d[v] = d
    return total`,
        explanation: 'On a complete graph with n² edges, dense Prim without a heap runs in optimal O(n²) time and O(n) space.',
        complexity: 'O(n²) time, O(n) space',
      },
    ],
    questionCategory: 'graphs',
    related: ['Union-Find', 'Heap', "Dijkstra's Algorithm", 'Greedy'],
  },

  // -------------------------------------- segment tree & fenwick tree
  {
    id: 'segment-fenwick-tree',
    keys: ['segment tree', 'segment trees', 'fenwick tree', 'fenwick', 'binary indexed tree', 'bit tree', 'range query'],
    title: 'Segment Tree & Fenwick Tree (Binary Indexed Tree)',
    summary: 'Answer dynamic range queries (sum, min, max, GCD) and point/range updates in O(log n) time instead of O(n) per update or query.',
    analogy: 'Think of a company org chart where every manager caches the total sales of their department: when one salesperson closes a deal, only the log₂(n) managers directly above them need to update their totals.',
    keyIdea:
      'A Prefix Sum array answers range sums in O(1), but updating one element requires O(n) work to rebuild prefixes. A **Fenwick Tree (Binary Indexed Tree)** uses `i & -i` (lowest set bit) to do both point updates and prefix sums in O(log n) with a single 1-indexed array. A **Segment Tree** stores hierarchical intervals in a 2n or 4n array and supports arbitrary associative operations (min, max, sum) plus Lazy Propagation for O(log n) range updates.',
    whenToUse: [
      'Interleaved point updates (`arr[i] = val`) and range queries (`sum(l, r)` or `min(l, r)`)',
      'Counting inversions or elements smaller than x to the right (coordinate-compressed Fenwick Tree)',
      'Range updates (`add v to all elements in [l, r]`) via Lazy Segment Tree',
    ],
    steps:
      'Fenwick Tree (1-indexed): `add(i, delta)` loops `while i <= n: bit[i] += delta; i += i & -i`. `prefix_sum(i)` loops `while i > 0: s += bit[i]; i -= i & -i`. Range sum `[l, r]` is `prefix_sum(r) - prefix_sum(l - 1)`.',
    memory: 'Fenwick Tree uses exactly `n + 1` integers; iterative Segment Tree uses `2n` integers (recursive uses `4n`).',
    complexity: {
      best: 'O(log n) query / update',
      average: 'O(log n) query / update, O(n) build',
      worst: 'O(log n)',
      space: 'O(n)',
      explanation: 'Both structures have height log₂(n), so any point update or range query touches at most O(log n) nodes.',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
class FenwickTree:
    def __init__(self, n: int):
        self.bit = [0] * (n + 1)

    def add(self, i: int, delta: int) -> None:
        i += 1  # convert 0-indexed to 1-indexed
        while i < len(self.bit):
            self.bit[i] += delta
            i += i & -i

    def prefix_sum(self, i: int) -> int:
        i += 1
        s = 0
        while i > 0:
            s += self.bit[i]
            i -= i & -i
        return s

    def range_sum(self, l: int, r: int) -> int:
        return self.prefix_sum(r) - (self.prefix_sum(l - 1) if l > 0 else 0)`,
      JavaScript: `
class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(2 * this.n).fill(0);
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = nums[i];
    for (let i = this.n - 1; i > 0; i--) {
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
    }
  }
  update(i, val) {
    for (this.tree[(i += this.n)] = val; i > 1; i >>= 1) {
      this.tree[i >> 1] = this.tree[i] + this.tree[i ^ 1];
    }
  }
  sumRange(l, r) {
    let res = 0;
    for (l += this.n, r += this.n + 1; l < r; l >>= 1, r >>= 1) {
      if (l & 1) res += this.tree[l++];
      if (r & 1) res += this.tree[--r];
    }
    return res;
  }
}`,
    },
    mistakes: [
      { mistake: 'Using 0-based indexing inside a Fenwick Tree loop', explanation: '`0 & -0` is `0`, causing `while i < n: i += i & -i` to loop forever at index 0. Always shift to 1-based indices internally.' },
      { mistake: 'Allocating only `2n` for a recursive Segment Tree', explanation: 'A recursive segment tree on a non-power-of-two array needs `4n` slots; the bottom-up iterative version needs only `2n`.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Range Sum Query - Mutable',
        statement: 'Design a data structure that supports updating an index `update(i, val)` and querying `sumRange(left, right)` in O(log n) time.',
        example: 'nums = [1, 3, 5], sumRange(0, 2) → 9, update(1, 2), sumRange(0, 2) → 8',
        hint: 'Use a Fenwick Tree or iterative Segment Tree.',
        solution: `
class NumArray:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (2 * self.n)
        self.tree[self.n:] = nums
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, i, val):
        i += self.n
        self.tree[i] = val
        while i > 1:
            i //= 2
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def sumRange(self, l, r):
        l += self.n; r += self.n + 1
        s = 0
        while l < r:
            if l & 1: s += self.tree[l]; l += 1
            if r & 1: r -= 1; s += self.tree[r]
            l //= 2; r //= 2
        return s`,
        explanation: 'The iterative Segment Tree builds in O(n) time and updates/queries in O(log n) time using `2n` space.',
        complexity: 'O(n) build, O(log n) update & query',
      },
    ],
    questionCategory: 'trees',
    related: ['Prefix Sum', 'Binary Tree', 'Bit Manipulation', 'Divide and Conquer'],
  },

  // ------------------------------------------------ sorting & searching
  {
    id: 'sorting-algorithms',
    keys: ['sorting', 'sort', 'quick sort', 'quicksort', 'merge sort', 'mergesort', 'heap sort', 'heapsort', 'insertion sort', 'bubble sort', 'selection sort', 'counting sort', 'radix sort', 'timsort', 'introsort', 'dutch national flag', 'cyclic sort'],
    title: 'Sorting Algorithms (Quick, Merge, Heap, Counting & Cyclic Sort)',
    summary: 'Sorting arranges elements in order in O(n log n) comparison time (Merge Sort, Quick Sort, Heap Sort) or O(n + k) non-comparison time (Counting, Radix, Cyclic Sort).',
    analogy: 'Insertion sort is sliding each new playing card into your hand; Merge sort is splitting a giant stack of papers between coworkers and merging their sorted stacks; Quicksort is picking a divider card and tossing smaller cards left and larger cards right.',
    keyIdea:
      'Comparison sorts cannot beat Ω(n log n) in the general case. **Merge Sort** guarantees O(n log n) and is **stable** (great for linked lists), using O(n) space. **Quick Sort** sorts in-place with O(log n) stack space and superior cache locality (O(n log n) average, mitigated with random/median-of-3 pivots or 3-way Dutch National Flag partitioning). **Heap Sort** is O(n log n) worst-case with O(1) extra space. When values lie in `1..n`, **Cyclic Sort** places each `x` at index `x - 1` in O(n) time and O(1) space.',
    whenToUse: [
      'Unlocking O(log n) Binary Search or O(n) Two Pointers / Greedy Interval Merging',
      'Dutch National Flag 3-way partitioning (Sort Colors / duplicate pivots)',
      'Cyclic Sort: finding missing or duplicate numbers in an array of `1..n` in O(n) time and O(1) space',
      'Counting inversions using Merge Sort',
    ],
    steps:
      'Merge Sort: recursively sort left and right halves, then merge with two pointers. Quick Sort: pick a random pivot, partition `< pivot` left and `> pivot` right, recurse. Cyclic Sort: while `nums[i]` is in `1..n` and `nums[i] != nums[nums[i] - 1]`, swap `nums[i]` into its home index `nums[i] - 1`.',
    memory: 'Merge Sort uses O(n) auxiliary buffer; Quick Sort uses O(log n) recursion stack; Heap Sort and Cyclic Sort use O(1) space.',
    complexity: {
      best: 'O(n) Insertion (sorted) / Cyclic Sort',
      average: 'O(n log n) Merge / Quick / Heap',
      worst: 'O(n log n) Merge / Heap · O(n²) naive Quick',
      space: 'O(1) Heap/Cyclic · O(log n) Quick · O(n) Merge',
      explanation: 'Python and Java Object[] use Timsort (stable Merge + Insertion); C++ std::sort uses Introsort (Quick + Heap + Insertion).',
    },
    visual: { type: 'array', values: [3, 9, 1, 7, 4, 8, 2, 6] },
    templates: {
      Python: `
def merge_sort(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    L, R = merge_sort(arr[:mid]), merge_sort(arr[mid:])
    i = j = 0
    out = []
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:  # <= preserves stability!
            out.append(L[i]); i += 1
        else:
            out.append(R[j]); j += 1
    out.extend(L[i:]); out.extend(R[j:])
    return out

def cyclic_sort_missing(nums: list[int]) -> list[int]:
    i = 0
    while i < len(nums):
        home = nums[i] - 1
        if 1 <= nums[i] <= len(nums) and nums[i] != nums[home]:
            nums[i], nums[home] = nums[home], nums[i]
        else:
            i += 1
    return [i + 1 for i, x in enumerate(nums) if x != i + 1]`,
      JavaScript: `
function sortColors(nums) {
  // Dutch National Flag 3-way partition (0s, 1s, 2s) in O(n) time, O(1) space
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
  return nums;
}`,
    },
    mistakes: [
      { mistake: 'Incrementing `mid` after swapping with `high` in Dutch National Flag', explanation: 'The element swapped from `high` into `mid` has not been inspected yet, so only decrement `high`.' },
      { mistake: 'Using `<` instead of `<=` in Merge Sort’s merge step', explanation: 'Picking from the left half on ties (`L[i] <= R[j]`) is what makes Merge Sort stable.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Sort Colors (Dutch National Flag)',
        statement: 'Given an array nums with n objects colored red (0), white (1), or blue (2), sort them in-place in a single pass with O(1) space.',
        example: 'Input: [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]',
        hint: 'Maintain three pointers: `low` (next 0), `mid` (current), and `high` (next 2).',
        solution: `
def sort_colors(nums):
    lo, mid, hi = 0, 0, len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1; mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1`,
        explanation: 'Invariants: `[0..lo-1]` are 0s, `[lo..mid-1]` are 1s, `[hi+1..n-1]` are 2s.',
        complexity: 'O(n) time, O(1) space',
      },
      {
        difficulty: 'Hard',
        title: 'First Missing Positive (Cyclic Sort)',
        statement: 'Given an unsorted integer array nums, return the smallest missing positive integer in O(n) time and O(1) auxiliary space.',
        example: 'Input: [3,4,-1,1]\nOutput: 2',
        hint: 'Place every number `x` in `1..n` into its home index `x - 1`.',
        solution: `
def first_missing_positive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            home = nums[i] - 1
            nums[i], nums[home] = nums[home], nums[i]
    for i, x in enumerate(nums):
        if x != i + 1:
            return i + 1
    return n + 1`,
        explanation: 'Each swap places at least one value into its final home index, so at most n swaps occur across the whole loop.',
        complexity: 'O(n) time, O(1) space',
      },
    ],
    questionCategory: 'sorting-searching',
    related: ['Binary Search', 'Two Pointers', 'Divide and Conquer', 'Heap'],
  },

  // ---------------------------------------- recursion & divide and conquer
  {
    id: 'recursion-divide-conquer',
    keys: ['recursion', 'recursive', 'divide and conquer', 'divide & conquer', 'master theorem', 'quickselect'],
    title: 'Recursion & Divide and Conquer',
    summary: 'Recursion solves a problem by reducing it to smaller instances of itself until hitting a base case; Divide and Conquer splits into independent subproblems, solves them, and combines the results.',
    analogy: 'Imagine counting a stadium crowd: instead of one person counting 50,000 seats, each section leader counts their rows and reports up to the concourse manager, who sums the totals.',
    keyIdea:
      'Every recursive function needs (1) a **base case** that returns immediately and (2) a **recursive step** that shrinks the input toward the base case. When subproblems are *independent* (Merge Sort, Binary Search, Quickselect, Fast Power `x^n`), it is **Divide and Conquer**. When subproblems *overlap* (Fibonacci, Knapsack), add memoization for **Dynamic Programming**.',
    whenToUse: [
      'Tree and graph traversals where structure is naturally recursive',
      'Divide and Conquer: Merge Sort, Quickselect, Karatsuba, Fast Exponentiation `pow(x, n)` in O(log n)',
      'Constructing balanced trees from sorted arrays or traversal orders',
    ],
    steps:
      '1) Define precisely what `solve(input)` returns. 2) Handle the smallest inputs (`n == 0` or `n == 1`) first. 3) Trust the recursive leap of faith for `solve(smaller_input)` and combine the sub-answers.',
    memory: 'Each active call adds a stack frame; maximum memory is O(recursion depth).',
    complexity: {
      best: 'O(log n) Binary Search / Fast Pow',
      average: 'O(n) Quickselect · O(n log n) Merge Sort',
      worst: 'O(2ⁿ) unmemoized branching',
      space: 'O(depth) call stack',
      explanation: 'Fast Exponentiation computes xⁿ in O(log n) multiplications by squaring `x^(n//2)`.',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
def fast_pow(x: float, n: int) -> float:
    if n < 0:
        x, n = 1 / x, -n
    res = 1.0
    while n:
        if n & 1:
            res *= x
        x *= x
        n >>= 1
    return res

def sorted_array_to_bst(nums: list[int]):
    def build(lo: int, hi: int):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        node = TreeNode(nums[mid])
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(nums) - 1)`,
      JavaScript: `
function fastPow(x, n) {
  let exp = BigInt(n);
  if (exp < 0n) { x = 1 / x; exp = -exp; }
  let res = 1;
  while (exp > 0n) {
    if (exp & 1n) res *= x;
    x *= x;
    exp >>= 1n;
  }
  return res;
}`,
    },
    mistakes: [
      { mistake: 'Recomputing the same recursive call twice (`fast_pow(x, n//2) * fast_pow(x, n//2)`)', explanation: 'Calling the function twice branches into 2^(log n) = O(n) calls instead of O(log n). Compute it once and square the variable!' },
      { mistake: 'Slicing arrays (`nums[:mid]`) in recursive calls when indices `(lo, hi)` suffice', explanation: 'Passing `(lo, hi)` index bounds avoids O(n) array copies at each level.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Pow(x, n) — Binary Exponentiation',
        statement: 'Implement pow(x, n), which calculates x raised to the power n in O(log n) time.',
        example: 'Input: x = 2.0, n = 10 → 1024.0\nInput: x = 2.0, n = -2 → 0.25',
        hint: 'x^n = (x²)^(n // 2), multiplying an extra x when n is odd.',
        solution: `
def my_pow(x, n):
    if n < 0:
        x, n = 1 / x, -n
    ans = 1.0
    while n:
        if n & 1:
            ans *= x
        x *= x
        n >>= 1
    return ans`,
        explanation: 'Halving the exponent each step finishes in at most 32 iterations for any 32-bit integer n.',
        complexity: 'O(log |n|) time, O(1) space',
      },
    ],
    questionCategory: 'recursion',
    related: ['Backtracking', 'Dynamic Programming', 'Binary Tree', 'Sorting'],
  },

  // ------------------------------------------------ greedy & merge intervals & kadane
  {
    id: 'greedy-intervals-kadane',
    keys: ['greedy', 'greedy algorithms', 'merge intervals', 'intervals', "kadane's algorithm", 'kadanes algorithm', 'kadane', 'maximum subarray', 'boyer-moore'],
    title: "Greedy Algorithms, Merge Intervals & Kadane's Pattern",
    summary: 'Greedy algorithms make the locally optimal choice at each step — powering Merge Intervals O(n log n), Jump Game O(n), and Kadane’s Maximum Subarray O(n).',
    analogy: 'When packing a calendar with as many meetings as possible, always pick the meeting that finishes earliest so your afternoon stays open as early as possible.',
    keyIdea:
      'Greedy works when the **greedy-choice property** holds (a locally optimal choice never blocks the global optimum). Classic templates: (1) **Merge Intervals**: sort by `start`, extend `merged[-1][1] = max(..., end)` on overlap. (2) **Activity Selection / Non-Overlapping Intervals**: sort by `end` and keep intervals with `start >= last_end`. (3) **Kadane’s Algorithm**: track `cur = max(x, cur + x)` to reset whenever the running sum turns negative.',
    whenToUse: [
      'Interval merging, calendar conflicts, and minimum meeting rooms',
      'Maximum contiguous subarray sum (Kadane’s Algorithm) or Best Time to Buy and Sell Stock',
      'Reachability & minimum jumps (Jump Game I & II, Gas Station)',
      'Majority Element > n/2 occurrences (Boyer-Moore Voting in O(n) time, O(1) space)',
    ],
    steps:
      'For intervals: decide whether to sort by `start` (merging / inserting) or `end` (maximizing non-overlapping count). For Kadane: initialize `cur = best = nums[0]` and iterate `nums[1:]`.',
    memory: 'O(1) for Kadane, Jump Game, and Boyer-Moore; O(n) for storing merged intervals.',
    complexity: {
      best: 'O(n) Kadane / Jump Game',
      average: 'O(n log n) Interval Sorting',
      worst: 'O(n log n)',
      space: 'O(1) to O(n)',
      explanation: 'Linear greedy scans run in O(n) time and O(1) space; interval problems take O(n log n) due to sorting.',
    },
    visual: { type: 'array', values: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    templates: {
      Python: `
def kadane_max_subarray(nums: list[int]) -> int:
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged`,
      JavaScript: `
function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}

function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    const last = merged[merged.length - 1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return merged;
}`,
    },
    mistakes: [
      { mistake: 'Initializing `best = 0` in Kadane’s Algorithm', explanation: 'If all numbers in the array are negative (e.g. `[-5, -2, -9]`), initializing `best = 0` wrongly returns `0` instead of `-2`. Initialize `cur = best = nums[0]`.' },
      { mistake: 'Applying Greedy where Dynamic Programming is required', explanation: 'Always test a quick counterexample (like Coin Change with `{1, 3, 4}` for `6`).' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: "Maximum Subarray (Kadane's Algorithm)",
        statement: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        example: 'Input: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6 (subarray [4,-1,2,1])',
        hint: 'If the running sum drops below 0, discard it and start fresh at the current element.',
        solution: `
def max_sub_array(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
        explanation: 'A negative prefix sum can only reduce the sum of any subarray that follows it.',
        complexity: 'O(n) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Non-overlapping Intervals',
        statement: 'Given an array of intervals, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.',
        example: 'Input: [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1 (remove [1,3])',
        hint: 'Sort by end time ascending and greedily keep every interval that starts at or after the previous kept end time.',
        solution: `
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])
    end = float('-inf')
    removed = 0
    for s, e in intervals:
        if s >= end:
            end = e
        else:
            removed += 1
    return removed`,
        explanation: 'Picking the interval that ends earliest leaves the maximum room for remaining intervals.',
        complexity: 'O(n log n) time, O(1) space',
      },
    ],
    questionCategory: 'greedy-bits',
    related: ['Dynamic Programming', 'Sorting', 'Heap', 'Arrays'],
  },

  // ------------------------------------------------ classic DP models
  {
    id: 'classic-dp-models',
    keys: ['knapsack problem', 'knapsack', '0/1 knapsack', 'longest common subsequence', 'lcs', 'longest increasing subsequence', 'lis', 'edit distance', 'coin change', 'matrix chain multiplication', 'climbing stairs', 'memoization vs tabulation'],
    title: 'Classic Dynamic Programming Models (Knapsack, LCS, LIS, Edit Distance)',
    summary: 'Master the five canonical DP families that cover 90% of DP interviews: 1D Fibonacci/Robber, 0/1 & Unbounded Knapsack, 2D String Grid (LCS / Edit Distance), O(n log n) LIS, and Interval DP (Matrix Chain / Burst Balloons).',
    analogy: 'Instead of solving every new DP problem from scratch, recognize which of the 5 blueprints it wears in disguise.',
    keyIdea:
      '1) **1D Linear DP** (Climbing Stairs, House Robber): `dp[i]` depends on `dp[i-1], dp[i-2]` → O(n) time, O(1) space. 2) **Knapsack DP**: **0/1 Knapsack** iterates capacity *downward* (`for w in range(W, wt-1, -1)`) so each item is used once; **Unbounded Knapsack** (Coin Change) iterates capacity *upward* so items can repeat. 3) **2D Sequence DP** (LCS, Edit Distance): `dp[i][j]` over prefixes `s1[:i]` and `s2[:j]`. 4) **Longest Increasing Subsequence (LIS)**: Patience Sorting + Binary Search on `tails` in O(n log n). 5) **Interval DP** (Matrix Chain Multiplication): iterate by subarray length `len = 2..n` and split point `k` in O(n³).',
    whenToUse: [
      'Subset sum / partition / target sum / coin change (Knapsack family)',
      'Two strings compared for alignment, diffing, or transformations (LCS / Edit Distance)',
      'Longest chain of increasing elements or nested envelopes (LIS)',
      'Optimal parenthesization, burst balloons, or palindrome partitioning (Interval / Matrix Chain DP)',
    ],
    steps:
      'Identify the blueprint → write the 1D or 2D recurrence → check loop direction (backward for 0/1 single-use, forward for unbounded reuse, increasing length for interval DP).',
    memory: '1D Knapsack uses O(W); 2D String DP reduces from O(m·n) to O(min(m, n)) using a rolling row; LIS uses O(n).',
    complexity: {
      best: 'O(n) 1D DP',
      average: 'O(n log n) LIS · O(m·n) LCS/Edit · O(n·W) Knapsack',
      worst: 'O(n³) Matrix Chain / Interval DP',
      space: 'O(1) to O(n²)',
      explanation: 'Recognizing the canonical family immediately tells you the state dimensions and target complexity.',
    },
    visual: { type: 'array', values: [2, 5, 3, 7, 11, 8, 10, 13] },
    templates: {
      Python: `
from bisect import bisect_left

# 1. Longest Increasing Subsequence in O(n log n)
def length_of_lis(nums: list[int]) -> int:
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails): tails.append(x)
        else: tails[i] = x
    return len(tails)

# 2. 0/1 Subset Sum (Partition Equal Subset Sum)
def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 == 1:
        return False
    target = total // 2
    dp = {0}
    for x in nums:
        dp |= {s + x for s in dp if s + x <= target}
    return target in dp`,
      JavaScript: `
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}`,
    },
    mistakes: [
      { mistake: 'Iterating capacity forward in 0/1 Knapsack', explanation: 'Forward iteration lets the same item be picked multiple times in the same row (turning 0/1 Knapsack into Unbounded Knapsack).' },
      { mistake: 'Returning `tails` as the actual Longest Increasing Subsequence', explanation: '`tails` only maintains the smallest end-values for each length; its *length* is the exact LIS length, but its contents may not be a valid subsequence.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Longest Increasing Subsequence',
        statement: 'Given an integer array nums, return the length of the longest strictly increasing subsequence in O(n log n) time.',
        example: 'Input: [10,9,2,5,3,7,101,18]\nOutput: 4 ([2,3,7,101])',
        hint: 'Maintain a sorted list `tails` and binary-search the position of each number.',
        solution: `
from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        idx = bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x
    return len(tails)`,
        explanation: 'Replacing the first element ≥ x keeps each length’s tail as small as possible to welcome future numbers.',
        complexity: 'O(n log n) time, O(n) space',
      },
      {
        difficulty: 'Medium',
        title: 'Partition Equal Subset Sum (0/1 Knapsack)',
        statement: 'Given an integer array nums, return true if you can partition the array into two subsets such that the sum of elements in both subsets is equal.',
        example: 'Input: [1,5,11,5]\nOutput: true ([1,5,5] and [11])',
        hint: 'Check if any subset sums to `sum(nums) // 2` using 0/1 Knapsack DP.',
        solution: `
def can_partition(nums):
    s = sum(nums)
    if s % 2:
        return False
    target = s // 2
    dp = [True] + [False] * target
    for x in nums:
        for w in range(target, x - 1, -1):
            dp[w] = dp[w] or dp[w - x]
    return dp[target]`,
        explanation: 'Iterating `w` downward from `target` to `x` ensures each element `x` is used at most once.',
        complexity: 'O(n · sum) time, O(sum) space',
      },
    ],
    questionCategory: 'dp',
    related: ['Dynamic Programming', 'Binary Search', 'Recursion', 'Greedy'],
  },

  // ------------------------------------------------ KMP, Rabin-Karp, Tarjan
  {
    id: 'advanced-string-graph-algorithms',
    keys: ['kmp algorithm', 'kmp', 'knuth-morris-pratt', 'rabin-karp', 'rabin karp', 'rolling hash', "tarjan's algorithm", 'tarjan', 'tarjans algorithm', 'strongly connected components', 'bridges', 'articulation points'],
    title: "KMP, Rabin-Karp & Tarjan's Algorithms",
    summary: 'Linear-time string matching via KMP prefix tables O(n + m) and Rabin-Karp rolling hashes, plus Tarjan’s single-pass DFS for Strongly Connected Components and Bridges O(V + E).',
    analogy: 'When a word match fails on the last letter, KMP remembers how much of the prefix you already matched so you never back up the text cursor.',
    keyIdea:
      '**KMP (Knuth-Morris-Pratt)** precomputes `lps[i]` (the longest proper prefix of `pattern[0..i]` that is also a suffix) in O(m) so text pointer `i` never moves backward — guaranteeing worst-case O(n + m). **Rabin-Karp** maintains a polynomial rolling hash `H = (H * base + ch) % mod` to compare substrings in O(1). **Tarjan’s Algorithm** tracks `disc[u]` (discovery time) and `low[u]` (lowest reachable ancestor) in one DFS pass to find Bridges (`low[v] > disc[u]`) and Strongly Connected Components.',
    whenToUse: [
      'Exact substring matching without O(n·m) worst-case fallback (KMP)',
      'Finding Longest Happy Prefix or repeated substring patterns (`lps[-1]`)',
      'Multi-pattern search, plagiarism detection, orLongest Duplicate Substring (Rabin-Karp)',
      'Finding single-point-of-failure network links (Critical Connections / Bridges via Tarjan)',
    ],
    steps:
      'KMP: 1) Build `lps` array of length m for `pattern`. 2) Scan `text` with `i` and `pattern` with `j`; on mismatch set `j = lps[j - 1]` instead of resetting `i`. Tarjan Bridges: on edge `(u, v)`, after DFS on `v`, update `low[u] = min(low[u], low[v])`; if `low[v] > disc[u]`, edge `(u, v)` is a bridge.',
    memory: 'O(m) for KMP’s LPS table; O(V) for Tarjan’s `disc` and `low` arrays.',
    complexity: {
      best: 'O(n + m) KMP / Rabin-Karp',
      average: 'O(n + m) String · O(V + E) Tarjan',
      worst: 'O(n + m) KMP · O(V + E) Tarjan',
      space: 'O(m) KMP · O(V) Tarjan',
      explanation: 'Both KMP pointers only advance or fall back along amortized steps, bounding total comparisons by 2(n + m).',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
def kmp_search(text: str, pattern: str) -> int:
    if not pattern:
        return 0
    lps = [0] * len(pattern)
    j = 0
    for i in range(1, len(pattern)):
        while j > 0 and pattern[i] != pattern[j]:
            j = lps[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
            lps[i] = j
    j = 0
    for i, ch in enumerate(text):
        while j > 0 and ch != pattern[j]:
            j = lps[j - 1]
        if ch == pattern[j]:
            j += 1
            if j == len(pattern):
                return i - j + 1
    return -1`,
      JavaScript: `
function criticalConnections(n, connections) {
  // Tarjan's Bridge-Finding Algorithm — O(V + E)
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of connections) { adj[u].push(v); adj[v].push(u); }
  const disc = new Array(n).fill(-1), low = new Array(n).fill(-1), bridges = [];
  let time = 0;
  function dfs(u, parent) {
    disc[u] = low[u] = time++;
    for (const v of adj[u]) {
      if (v === parent) continue;
      if (disc[v] === -1) {
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > disc[u]) bridges.push([u, v]);
      } else {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }
  dfs(0, -1);
  return bridges;
}`,
    },
    mistakes: [
      { mistake: 'Using `if` instead of `while` when falling back `j = lps[j - 1]` in KMP', explanation: 'Multiple fallback steps may be needed until a shorter prefix matches or `j` reaches 0.' },
      { mistake: 'Ignoring hash collisions in Rabin-Karp', explanation: 'Use a large prime modulus (like `10^9 + 7` or double hashing) and verify candidate matches when needed.' },
    ],
    problems: [
      {
        difficulty: 'Hard',
        title: 'Critical Connections in a Network (Tarjan Bridges)',
        statement: 'Given n servers and undirected connections, return all critical connections (edges whose removal disconnects the network).',
        example: 'Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]\nOutput: [[1,3]]',
        hint: 'An edge (u, v) is a bridge if and only if `low[v] > disc[u]` in Tarjan’s DFS.',
        solution: `
def critical_connections(n, connections):
    adj = [[] for _ in range(n)]
    for u, v in connections:
        adj[u].append(v); adj[v].append(u)
    disc, low, bridges = [-1] * n, [-1] * n, []
    timer = 0
    def dfs(u, p):
        nonlocal timer
        disc[u] = low[u] = timer; timer += 1
        for v in adj[u]:
            if v == p: continue
            if disc[v] == -1:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append([u, v])
            else:
                low[u] = min(low[u], disc[v])
    dfs(0, -1)
    return bridges`,
        explanation: 'If `low[v] > disc[u]`, no back-edge from `v`’s subtree reaches `u` or an ancestor of `u`.',
        complexity: 'O(V + E) time, O(V + E) space',
      },
    ],
    questionCategory: 'graphs',
    related: ['Strings', 'DFS', 'Graphs', 'Trie'],
  },

  // ------------------------------------------------ System DSA (LRU, Bloom Filter, B-Tree, Consistent Hashing)
  {
    id: 'system-dsa-structures',
    keys: ['lru cache', 'lfu cache', 'bloom filter', 'consistent hashing', 'b-tree', 'b+ tree', 'btree', 'skip list'],
    title: 'System & Production Data Structures (LRU Cache, Bloom Filter, B+ Tree, Skip List)',
    summary: 'How core DSA powers real-world databases, caches, and distributed systems: LRU Cache, Bloom Filters, B+ Trees, Skip Lists, and Consistent Hashing.',
    analogy: 'An LRU Cache is your desk: keep the books you used today within arm’s reach, and when the desk is full, shelve whichever book has gathered dust the longest.',
    keyIdea:
      '1) **LRU Cache**: `HashMap` + `Doubly Linked List` gives O(1) `get` and `put` by moving accessed nodes to the head and evicting the tail. 2) **Bloom Filter**: a bit array with k hash functions that answers "definitely not present" or "probably present" in O(k) time with tiny memory (used in RocksDB/Cassandra to skip disk reads). 3) **B+ Tree**: high-fanout balanced tree where all values live in linked leaf pages — minimizes disk I/O in PostgreSQL/MySQL. 4) **Skip List**: multi-layer probabilistic linked list giving O(log n) search without global rebalancing (used in Redis `ZSET`). 5) **Consistent Hashing**: maps servers and keys onto a 0..2³²−1 ring (searched with Binary Search / `TreeMap`) so adding/removing a server moves only `1/N` keys.',
    whenToUse: [
      'Designing an in-memory cache with O(1) lookup and eviction (LRU / LFU Cache)',
      'Explaining why relational databases use B+ Trees for indexes while LSM-Trees use MemTables (Skip Lists) + SSTables + Bloom Filters',
      'Routing keys across distributed cache nodes with minimal rebalancing (Consistent Hashing)',
    ],
    steps:
      'LRU Cache: create dummy `head` and `tail` sentinel nodes. `_remove(node)` unlinks `node.prev` and `node.next` in O(1); `_insert_front(node)` splices `node` right after `head` in O(1). Store `key -> node` in a dictionary.',
    memory: 'LRU Cache uses O(capacity) nodes; Bloom Filter uses ~10 bits per key for a 1% false-positive rate regardless of key size.',
    complexity: {
      best: 'O(1) LRU Cache / Bloom Filter',
      average: 'O(1) LRU · O(log n) B+ Tree / Skip List / Consistent Hash Ring',
      worst: 'O(log n)',
      space: 'O(n)',
      explanation: 'Combining two basic data structures (like HashMap + Doubly Linked List) achieves the best complexity of both.',
    },
    visual: { type: 'linked-list', values: [1, 2, 3] },
    templates: {
      Python: `
class Node:
    def __init__(self, k=0, v=0):
        self.k, self.v = k, v
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, n: Node):
        n.prev.next, n.next.prev = n.next, n.prev

    def _add_front(self, n: Node):
        n.next, n.prev = self.head.next, self.head
        self.head.next.prev = self.head.next = n

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node); self._add_front(node)
        return node.v

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.k]`,
      JavaScript: `
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); // JS Map preserves insertion order!
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.cap) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}`,
    },
    mistakes: [
      { mistake: 'Forgetting to store `key` inside the Doubly Linked List node in LRU Cache', explanation: 'When evicting `tail.prev`, you need `lru.key` so you can delete that entry from the HashMap in O(1).' },
      { mistake: 'Attempting to delete an element from a standard Bloom Filter', explanation: 'Clearing a bit could erase another key that hashed to the same bit; use a Counting Bloom Filter if deletions are required.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'LRU Cache',
        statement: 'Design a data structure that follows the Least Recently Used (LRU) cache constraint with O(1) `get(key)` and `put(key, value)`.',
        example: 'LRUCache(2): put(1,1), put(2,2), get(1) → 1, put(3,3) evicts 2, get(2) → -1',
        hint: 'Combine a HashMap from key to node with a Doubly Linked List ordered by recency.',
        solution: `
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)`,
        explanation: 'Both `OrderedDict` and a custom Doubly Linked List + dict provide O(1) recency updates and eviction.',
        complexity: 'O(1) time for get & put, O(capacity) space',
      },
    ],
    questionCategory: 'linked-lists',
    related: ['Linked List', 'Hash Table', 'Binary Search Tree', 'Bit Manipulation'],
  },
]
