// Real-world interview metadata for the curated question bank:
// - Official LeetCode problem numbers & slugs (where applicable)
// - Companies frequently asking the question in live coding / conceptual rounds
// - Exact optimal Time & Space complexity expected by interviewers
// - Core algorithmic pattern name
// - Real follow-up questions interviewers ask once you finish the initial solution
// - Concise, production-grade reference code for whiteboard / live coding rounds

export const INTERVIEW_ENRICHMENT = {
  // ---------------------------------------------------------------- complexity
  'complexity-1': {
    pattern: 'Asymptotic Analysis',
    complexity: { time: 'O(1) – O(2ⁿ)', space: 'O(1)' },
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    topic: 'Big O Notation',
    followUp: 'What is the difference between Big-O (upper bound), Big-Ω (lower bound), and Big-Θ (tight bound)? In interviews, people say Big-O when they really mean Big-Θ (tight worst-case bound).',
    code: `// Drop constants & lower-order terms:
// 3n² + 100n + 50  -->  O(n²)
// Hierarchy from fastest to slowest growth:
// O(1) < O(log n) < O(√n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)`,
  },
  'complexity-2': {
    pattern: 'Logarithmic Halving',
    complexity: { time: 'O(log n) vs O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Apple', 'Microsoft'],
    topic: 'Binary Search',
    followUp: 'Why doesn’t the base of the logarithm matter in Big-O? Because log_a(n) = log_b(n) / log_b(a), and 1 / log_b(a) is just a constant factor.',
    code: `// O(log n): halving n = 1,000,000 takes at most 20 steps (2²⁰ ≈ 1.05 × 10⁶)
for (int step = n; step > 0; step /= 2) {
    // runs floor(log2(n)) + 1 times
}`,
  },
  'complexity-3': {
    pattern: 'Amortized Analysis',
    complexity: { time: 'O(1) amortized', space: 'O(n)' },
    companies: ['Google', 'Meta', 'Bloomberg'],
    topic: 'Arrays',
    followUp: 'Why does Java ArrayList grow by 1.5× while C++ std::vector typically grows by 2×? Smaller growth factors (1.5×) waste less memory and allow previously freed memory blocks to be reused.',
    code: `// Cost of n appends with 2x doubling at powers of 2:
// Total copies = 1 + 2 + 4 + 8 + ... + n/2 < n
// Total work = n (writes) + n (copies) = 2n  =>  2n / n = O(1) per append`,
  },
  'complexity-4': {
    pattern: 'Master Theorem & Recurrences',
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    companies: ['Google', 'Amazon', 'Adobe'],
    topic: 'Recursion',
    followUp: 'What is the time complexity of `for (int i = 1; i <= n; i++) for (int j = i; j <= n; j += i)`? It is the harmonic series n(1 + 1/2 + 1/3 + ... + 1/n) = O(n log n), NOT O(n²).',
    code: `// Common recurrences to memorize for interviews:
// T(n) = T(n/2) + O(1)    => O(log n)     (Binary Search)
// T(n) = 2T(n/2) + O(n)   => O(n log n)   (Merge Sort)
// T(n) = 2T(n/2) + O(1)   => O(n)         (Tree DFS)
// T(n) = 2T(n - 1) + O(1) => O(2ⁿ)        (Naive Fibonacci / Subsets)`,
  },
  'complexity-5': {
    pattern: 'Auxiliary vs Stack Space',
    complexity: { time: 'O(n)', space: 'O(h) stack' },
    companies: ['Meta', 'Microsoft', 'Amazon'],
    topic: 'Recursion',
    followUp: 'Can you traverse a binary tree in O(n) time and O(1) auxiliary space without recursion or a stack? Yes — Morris Traversal temporarily threads null right pointers back to ancestors.',
    code: `int maxDepth(TreeNode root) {
    if (root == null) return 0;
    // Uses O(h) call-stack frames: O(log n) balanced, O(n) skewed
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
  },
  'complexity-6': {
    pattern: 'Divide & Conquer / Introsort',
    complexity: { time: 'O(n log n) avg', space: 'O(log n) stack' },
    companies: ['Google', 'Apple', 'Bloomberg', 'Nvidia'],
    topic: 'Sorting',
    followUp: 'How do you prevent O(n²) when the array has many duplicate elements (e.g., all 1s)? Use 3-way Dutch National Flag partitioning (< pivot, == pivot, > pivot).',
    code: `// C++ std::sort uses Introsort:
// 1. Start with QuickSort (median-of-3 pivot) for cache speed
// 2. If recursion depth > 2 * log2(n), switch to HeapSort (guarantees O(n log n))
// 3. For partitions <= 16 elements, finish with Insertion Sort`,
  },
  'complexity-7': {
    pattern: 'Multi-Variable Big-O',
    complexity: { time: 'O(n + m)', space: 'O(1)' },
    companies: ['Meta', 'Google', 'PayPal'],
    topic: 'Big O Notation',
    followUp: 'What is the complexity of sorting an array of N strings each of maximum length K? It is O(N · K log N) because each string comparison costs O(K), plus O(N · K) to sort each string internally if needed.',
    code: `// Two independent inputs A (length n) and B (length m):
// Sequential loops -> O(n + m)
// Nested loops     -> O(n * m)`,
  },

  // -------------------------------------------------------------------- arrays
  'arrays-1': {
    pattern: 'Two Pointers (Opposite Ends)',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Microsoft', 'Apple'],
    leetcode: { id: 344, title: 'Reverse String', slug: 'reverse-string' },
    topic: 'Two Pointers',
    followUp: 'How do you rotate an array right by k steps in O(1) extra space (LC #189)? Reverse the whole array, reverse the first k elements, then reverse the remaining n − k elements.',
    code: `def reverse_in_place(nums: list[int]) -> None:
    left, right = 0, len(nums) - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1`,
  },
  'arrays-2': {
    pattern: 'One-Pass Hash Map',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Amazon', 'Google', 'Meta', 'Apple', 'Microsoft', 'Bloomberg'],
    leetcode: { id: 1, title: 'Two Sum', slug: 'two-sum' },
    topic: 'Hash Table',
    followUp: 'What if the input array is already sorted (LC #167)? Use converging Two Pointers for O(n) time and O(1) space. What if you need all unique triplets summing to 0 (3Sum, LC #15)? Sort + fix one element + Two Pointers in O(n²).',
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`,
  },
  'arrays-3': {
    pattern: "Kadane's Algorithm (1D DP)",
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'LinkedIn', 'Microsoft', 'Google', 'Apple'],
    leetcode: { id: 53, title: 'Maximum Subarray', slug: 'maximum-subarray' },
    topic: "Kadane's Algorithm",
    followUp: 'How do you also return the start and end indices of the maximum subarray? Track `tempStart = i` whenever `cur < 0` and reset `cur = nums[i]`; update `bestStart = tempStart` and `bestEnd = i` whenever `cur > best`.',
    code: `def max_subarray(nums: list[int]) -> int:
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
  },
  'arrays-4': {
    pattern: 'Variable Sliding Window',
    complexity: { time: 'O(n)', space: 'O(min(n, Σ))' },
    companies: ['Amazon', 'Meta', 'Bloomberg', 'Microsoft', 'Google', 'Uber'],
    leetcode: { id: 3, title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters' },
    topic: 'Sliding Window',
    followUp: 'What if you are allowed at most k character replacements to make all characters in the window identical (LC #424)? Track `maxFreq` in the window and shrink `left` when `(right - left + 1) - maxFreq > k`.',
    code: `def length_of_longest_substring(s: str) -> int:
    last_seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best`,
  },
  'arrays-5': {
    pattern: 'Reverse Two Pointers',
    complexity: { time: 'O(m + n)', space: 'O(1)' },
    companies: ['Meta', 'Amazon', 'Microsoft', 'Bloomberg'],
    leetcode: { id: 88, title: 'Merge Sorted Array', slug: 'merge-sorted-array' },
    topic: 'Two Pointers',
    followUp: 'Why does the loop only need `while j >= 0` and not `while i >= 0`? Because once `nums2` is exhausted (`j < 0`), the remaining elements in `nums1[0..i]` are already in their final sorted positions.',
    code: `def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[write] = nums1[i]
            i -= 1
        else:
            nums1[write] = nums2[j]
            j -= 1
        write -= 1`,
  },
  'arrays-6': {
    pattern: 'Binary Search on Partition',
    complexity: { time: 'O(log(min(m, n)))', space: 'O(1)' },
    companies: ['Google', 'Amazon', 'Goldman Sachs', 'Meta', 'Apple'],
    leetcode: { id: 4, title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays' },
    topic: 'Binary Search',
    followUp: 'How do you generalize this to find the k-th smallest element of two sorted arrays in O(log k)? Compare `A[k/2 - 1]` and `B[k/2 - 1]` and discard the smaller half of size `k/2` each step.',
    code: `def find_median_sorted_arrays(A: list[int], B: list[int]) -> float:
    if len(A) > len(B):
        A, B = B, A
    m, n = len(A), len(B)
    lo, hi, half = 0, m, (m + n + 1) // 2
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = A[i - 1] if i > 0 else float('-inf')
        a_right = A[i] if i < m else float('inf')
        b_left = B[j - 1] if j > 0 else float('-inf')
        b_right = B[j] if j < n else float('inf')
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2 == 1:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2.0
        elif a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1`,
  },
  'arrays-7': {
    pattern: 'Converging Two Pointers',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Goldman Sachs', 'Google', 'Meta', 'Bloomberg'],
    leetcode: { id: 42, title: 'Trapping Rain Water', slug: 'trapping-rain-water' },
    topic: 'Two Pointers',
    followUp: 'What if the terrain is a 2D grid (Trapping Rain Water II, LC #407)? Push all boundary cells into a Min-Heap and expand inward like Dijkstra, tracking the minimum boundary height.',
    code: `def trap(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        if height[l] < height[r]:
            left_max = max(left_max, height[l])
            water += left_max - height[l]
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]
            r -= 1
    return water`,
  },

  // -------------------------------------------------------------- linked lists
  'linked-lists-1': {
    pattern: 'In-Place Pointer Reversal',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Microsoft', 'Apple', 'Bloomberg', 'Meta'],
    leetcode: { id: 206, title: 'Reverse Linked List', slug: 'reverse-linked-list' },
    topic: 'Linked List',
    followUp: 'What if you need to reverse nodes in groups of k (Reverse Nodes in k-Group, LC #25)? Count k nodes ahead; if fewer than k remain, leave them; otherwise reverse those k nodes and link the tail to the next group.',
    code: `def reverse_list(head: ListNode | None) -> ListNode | None:
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
  },
  'linked-lists-2': {
    pattern: "Floyd's Fast & Slow Pointers",
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Microsoft', 'Spotify', 'Oracle'],
    leetcode: { id: 142, title: 'Linked List Cycle II', slug: 'linked-list-cycle-ii' },
    topic: 'Fast & Slow Pointers',
    followUp: 'Why does resetting one pointer to `head` and moving both 1 step at a time guarantee they meet at the cycle entrance? Because `L = k·C - d`, where `L` is distance to cycle start and `d` is offset inside the cycle.',
    code: `def detect_cycle(head: ListNode | None) -> ListNode | None:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None`,
  },
  'linked-lists-3': {
    pattern: 'Fast & Slow Pointers',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Google', 'Adobe'],
    leetcode: { id: 876, title: 'Middle of the Linked List', slug: 'middle-of-the-linked-list' },
    topic: 'Fast & Slow Pointers',
    followUp: 'When splitting a list for Merge Sort (LC #148), why should `fast` start at `head.next` instead of `head`? Starting `fast = head.next` stops `slow` at the first middle of an even-length list so you can sever `slow.next = None` cleanly.',
    code: `def middle_node(head: ListNode) -> ListNode:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
  },
  'linked-lists-4': {
    pattern: 'Dummy Head Two Pointers',
    complexity: { time: 'O(m + n)', space: 'O(1)' },
    companies: ['Amazon', 'Microsoft', 'Apple', 'Meta'],
    leetcode: { id: 21, title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists' },
    topic: 'Linked List',
    followUp: 'How do you sort an arbitrary singly linked list in O(n log n) time and O(1) space (LC #148)? Use bottom-up Merge Sort with doubling sublist sizes (1, 2, 4, 8...) and this exact O(1)-space merge helper.',
    code: `def merge_two_lists(l1: ListNode | None, l2: ListNode | None) -> ListNode | None:
    dummy = tail = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
  },
  'linked-lists-5': {
    pattern: 'Fixed-Gap Two Pointers',
    complexity: { time: 'O(L)', space: 'O(1)' },
    companies: ['Meta', 'Amazon', 'Google', 'Bloomberg'],
    leetcode: { id: 19, title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list' },
    topic: 'Two Pointers',
    followUp: 'What if n equals the length of the list (i.e. removing the head node)? Attaching a `dummy` node before `head` and starting `slow = fast = dummy` handles head removal without any `if` branches.',
    code: `def remove_nth_from_end(head: ListNode, n: int) -> ListNode | None:
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next`,
  },
  'linked-lists-6': {
    pattern: 'Midpoint + In-Place Reversal',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Meta', 'Microsoft', 'Apple'],
    leetcode: { id: 234, title: 'Palindrome Linked List', slug: 'palindrome-linked-list' },
    topic: 'Linked List',
    followUp: 'How do you solve Reorder List (`L0 → Ln → L1 → Ln-1`, LC #143)? It uses the exact same 3 steps: find middle with slow/fast, reverse the second half in place, then interleave the two halves.',
    code: `def is_palindrome(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:
        slow.next, prev, slow = prev, slow, slow.next
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left, right = left.next, right.next
    return True`,
  },
  'linked-lists-7': {
    pattern: 'HashMap + Doubly Linked List',
    complexity: { time: 'O(1) get & put', space: 'O(capacity)' },
    companies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Bloomberg', 'PayPal', 'Uber'],
    leetcode: { id: 146, title: 'LRU Cache', slug: 'lru-cache' },
    topic: 'Linked List',
    followUp: 'How do you design an LFU (Least Frequently Used) Cache in O(1) time (LC #460)? Keep `key -> (val, freq)`, `freq -> DoublyLinkedList`, and track `minFreq` (resetting to 1 on new insert, incrementing when the `minFreq` list becomes empty).',
    code: `class LRUCache:
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
  },

  // ----------------------------------------------------------- stacks & queues
  'stacks-queues-1': {
    pattern: 'LIFO vs FIFO Adapters',
    complexity: { time: 'O(1) push/pop', space: 'O(n)' },
    companies: ['Amazon', 'Microsoft', 'Oracle'],
    topic: 'Stack',
    followUp: 'Why should you avoid `list.pop(0)` in Python or `Array.shift()` in JavaScript for a queue? Because shifting an array costs O(n) per dequeue — use `collections.deque` or a circular ring buffer for true O(1).',
    code: `from collections import deque
stack = []          # append() / pop() -> O(1) LIFO
queue = deque()     # append() / popleft() -> O(1) FIFO`,
  },
  'stacks-queues-2': {
    pattern: 'Matching Delimiter Stack',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Amazon', 'Bloomberg', 'Meta', 'Google', 'Microsoft'],
    leetcode: { id: 20, title: 'Valid Parentheses', slug: 'valid-parentheses' },
    topic: 'Stack',
    followUp: 'What if the string only has one bracket type `(` and `)`? You can drop the stack and use an integer balance counter in O(1) space. Why does that fail for multiple bracket types like `([)]`? Because counts alone lose interleaving order.',
    code: `def is_valid(s: str) -> bool:
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
  },
  'stacks-queues-3': {
    pattern: 'Two-Stack Lazy Transfer',
    complexity: { time: 'O(1) amortized', space: 'O(n)' },
    companies: ['Microsoft', 'Amazon', 'Bloomberg', 'Apple'],
    leetcode: { id: 232, title: 'Implement Queue using Stacks', slug: 'implement-queue-using-stacks' },
    topic: 'Queue',
    followUp: 'How do you extend this two-stack queue so that `getMin()` is also O(1)? Make both the `in_stack` and `out_stack` store `(val, current_stack_min)` pairs; the queue minimum is `min(in_stack[-1][1], out_stack[-1][1])`.',
    code: `class MyQueue:
    def __init__(self):
        self.in_stk, self.out_stk = [], []

    def push(self, x: int) -> None:
        self.in_stk.append(x)

    def peek(self) -> int:
        if not self.out_stk:
            while self.in_stk:
                self.out_stk.append(self.in_stk.pop())
        return self.out_stk[-1]

    def pop(self) -> int:
        self.peek()
        return self.out_stk.pop()`,
  },
  'stacks-queues-4': {
    pattern: 'Augmented Min-Stack',
    complexity: { time: 'O(1) all ops', space: 'O(n)' },
    companies: ['Amazon', 'Bloomberg', 'Google', 'Microsoft'],
    leetcode: { id: 155, title: 'Min Stack', slug: 'min-stack' },
    topic: 'Stack',
    followUp: 'What if the interviewer asks for a MaxStack that also supports `popMax()` in O(log n) (LC #716)? Combine a Doubly Linked List with a TreeMap / Balanced BST (or lazy-deletion Heap) mapping values to list nodes.',
    code: `class MinStack:
    def __init__(self):
        self.stk = []  # stores (val, min_so_far)

    def push(self, val: int) -> None:
        cur_min = val if not self.stk else min(val, self.stk[-1][1])
        self.stk.append((val, cur_min))

    def pop(self) -> None:
        self.stk.pop()

    def top(self) -> int:
        return self.stk[-1][0]

    def getMin(self) -> int:
        return self.stk[-1][1]`,
  },
  'stacks-queues-5': {
    pattern: 'Monotonic Decreasing Stack',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Amazon', 'Meta', 'Google', 'Uber', 'TikTok'],
    leetcode: { id: 739, title: 'Daily Temperatures', slug: 'daily-temperatures' },
    topic: 'Monotonic Stack',
    followUp: 'What if the array is circular (Next Greater Element II, LC #503)? Loop `i` from `0` to `2n - 1` using `nums[i % n]` and only push indices during the first pass (`i < n`).',
    code: `def daily_temperatures(temps: list[int]) -> list[int]:
    ans = [0] * len(temps)
    stack = []  # indices with monotonically decreasing temperatures
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            prev = stack.pop()
            ans[prev] = i - prev
        stack.append(i)
    return ans`,
  },
  'stacks-queues-6': {
    pattern: 'Monotonic Increasing Stack',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Google', 'Amazon', 'Meta', 'Adobe', 'Citadel'],
    leetcode: { id: 84, title: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram' },
    topic: 'Monotonic Stack',
    followUp: 'How do you find the largest rectangle of 1s in a 2D binary matrix (Maximal Rectangle, LC #85)? Maintain a running column-height histogram row by row and run this exact O(C) algorithm on each row for O(R · C) total time.',
    code: `def largest_rectangle_area(heights: list[int]) -> int:
    stack = [-1]
    best = 0
    for i, h in enumerate(heights + [0]):
        while stack[-1] != -1 and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            width = i - stack[-1] - 1
            best = max(best, height * width)
        stack.append(i)
    return best`,
  },
  'stacks-queues-7': {
    pattern: 'Monotonic Decreasing Deque',
    complexity: { time: 'O(n)', space: 'O(k)' },
    companies: ['Amazon', 'Google', 'Meta', 'Uber', 'Citadel'],
    leetcode: { id: 239, title: 'Sliding Window Maximum', slug: 'sliding-window-maximum' },
    topic: 'Deque',
    followUp: 'Why store indices in the deque instead of raw values? Because you need to know when the front element slides outside the window (`dq[0] <= i - k`).',
    code: `from collections import deque

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
  },

  // --------------------------------------------------------------- hash tables
  'hashing-1': {
    pattern: 'Hash Function & Bucketing',
    complexity: { time: 'O(1) avg, O(n) worst', space: 'O(n)' },
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    topic: 'Hash Table',
    followUp: 'Why must mutable objects (like a Python `list`) never be used as hash keys? Mutating a key changes its hash code, making it impossible to find in its original bucket.',
    code: `// Hash table lookup pipeline:
// 1. h = hash(key)
// 2. bucket = h & (capacity - 1)   // fast modulo when capacity is a power of 2
// 3. Scan bucket chain/probe sequence using equals(key)`,
  },
  'hashing-2': {
    pattern: 'Fixed-Array Frequency Map',
    complexity: { time: 'O(n)', space: 'O(1) (26 slots)' },
    companies: ['Amazon', 'Meta', 'Microsoft'],
    leetcode: { id: 242, title: 'Valid Anagram', slug: 'valid-anagram' },
    topic: 'Hash Table',
    followUp: 'What if the input contains arbitrary Unicode characters (emojis, CJK) instead of lowercase ASCII `a-z`? Switch from a fixed 26-slot array to a general `HashMap` / `Counter`.',
    code: `def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for a, b in zip(s, t):
        counts[ord(a) - 97] += 1
        counts[ord(b) - 97] -= 1
    return all(c == 0 for c in counts)`,
  },
  'hashing-3': {
    pattern: 'Chaining vs Open Addressing',
    complexity: { time: 'O(1) avg', space: 'O(n)' },
    companies: ['Google', 'Apple', 'Nvidia', 'Bloomberg'],
    topic: 'Hash Table',
    followUp: 'Why can’t you simply clear a slot to `EMPTY` when deleting from an open-addressed hash table? It would break the probe chain for keys inserted later — you must mark it with a `TOMBSTONE` sentinel.',
    code: `// Java 8+ HashMap:
// - Uses Separate Chaining
// - When a bucket chain reaches length >= 8 (TREEIFY_THRESHOLD) and table >= 64,
//   converts the linked list into a Red-Black Tree -> worst-case O(log n) instead of O(n)`,
  },
  'hashing-4': {
    pattern: 'Canonical Frequency-Tuple Key',
    complexity: { time: 'O(n · k)', space: 'O(n · k)' },
    companies: ['Amazon', 'Meta', 'Google', 'Bloomberg', 'Uber'],
    leetcode: { id: 49, title: 'Group Anagrams', slug: 'group-anagrams' },
    topic: 'Hash Table',
    followUp: 'When is sorting each string (`O(n · k log k)`) faster in practice than building a 26-count tuple (`O(n · k)`)? When strings are very short (`k <= 5`), sorting in C/CPU registers beats allocating a 26-int tuple.',
    code: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for w in strs:
        key = [0] * 26
        for ch in w:
            key[ord(ch) - 97] += 1
        groups[tuple(key)].append(w)
    return list(groups.values())`,
  },
  'hashing-5': {
    pattern: 'Sequence-Start Set Filtering',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Google', 'Amazon', 'Meta', 'Spotify', 'Bloomberg'],
    leetcode: { id: 128, title: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence' },
    topic: 'Hash Table',
    followUp: 'Why iterate over `num_set` instead of the original `nums` list in the outer loop? If `nums` has many duplicates, iterating over `num_set` skips redundant checks immediately.',
    code: `def longest_consecutive(nums: list[int]) -> int:
    num_set = set(nums)
    best = 0
    for x in num_set:
        if x - 1 not in num_set:  # only start at the beginning of a run
            length = 1
            while x + length in num_set:
                length += 1
            best = max(best, length)
    return best`,
  },
  'hashing-6': {
    pattern: 'Prefix Sum + Frequency Map',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Meta', 'Amazon', 'Google', 'Bloomberg', 'TikTok'],
    leetcode: { id: 560, title: 'Subarray Sum Equals K', slug: 'subarray-sum-equals-k' },
    topic: 'Prefix Sum',
    followUp: 'What if you want to check whether a subarray of length ≥ 2 sums to a multiple of k (Continuous Subarray Sum, LC #523)? Store `(prefix_sum % k) -> earliest_index` in the map and check `i - seen[rem] >= 2`.',
    code: `def subarray_sum(nums: list[int], k: int) -> int:
    counts = {0: 1}
    prefix = ans = 0
    for x in nums:
        prefix += x
        ans += counts.get(prefix - k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return ans`,
  },
  'hashing-7': {
    pattern: 'Dynamic Bucket Array + Rehash',
    complexity: { time: 'O(1) avg', space: 'O(n)' },
    companies: ['Apple', 'Goldman Sachs', 'Microsoft', 'LinkedIn'],
    leetcode: { id: 706, title: 'Design HashMap', slug: 'design-hashmap' },
    topic: 'Hash Table',
    followUp: 'How does `ConcurrentHashMap` in Java achieve high concurrency without locking the entire table? It uses lock striping / CAS on individual bucket heads so reads are lock-free and writes only lock one bucket.',
    code: `class MyHashMap:
    def __init__(self):
        self.cap = 1009
        self.buckets = [[] for _ in range(self.cap)]

    def put(self, key: int, val: int) -> None:
        b = self.buckets[key % self.cap]
        for i, (k, _) in enumerate(b):
            if k == key:
                b[i] = (key, val)
                return
        b.append((key, val))`,
  },

  // -------------------------------------------------------------------- trees
  'trees-1': {
    pattern: 'DFS Tree Traversals',
    complexity: { time: 'O(n)', space: 'O(h)' },
    companies: ['Amazon', 'Microsoft', 'Google'],
    leetcode: { id: 94, title: 'Binary Tree Inorder Traversal', slug: 'binary-tree-inorder-traversal' },
    topic: 'Binary Tree',
    followUp: 'How do you find the Kth Smallest Element in a BST (LC #230)? Run an iterative inorder traversal using an explicit stack and stop as soon as you pop the k-th node — O(H + k) time.',
    code: `def inorder_iterative(root: TreeNode | None) -> list[int]:
    res, stack, cur = [], [], root
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        res.append(cur.val)
        cur = cur.right
    return res`,
  },
  'trees-2': {
    pattern: 'Bottom-Up Postorder DFS',
    complexity: { time: 'O(n)', space: 'O(h)' },
    companies: ['Amazon', 'LinkedIn', 'Apple', 'Microsoft'],
    leetcode: { id: 104, title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree' },
    topic: 'Binary Tree',
    followUp: 'How do you check if a binary tree is height-balanced in O(n) time (LC #110)? Have the DFS return `-1` as soon as `abs(leftHeight - rightHeight) > 1` instead of recomputing height from scratch at every node.',
    code: `def max_depth(root: TreeNode | None) -> int:
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
  },
  'trees-3': {
    pattern: 'Top-Down Range Propagation',
    complexity: { time: 'O(n)', space: 'O(h)' },
    companies: ['Amazon', 'Bloomberg', 'Meta', 'Microsoft'],
    leetcode: { id: 98, title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree' },
    topic: 'Binary Search Tree',
    followUp: 'What if exactly two nodes in a BST were accidentally swapped (Recover Binary Search Tree, LC #99)? During an inorder traversal, find the one or two places where `prev.val > cur.val` and swap their values back.',
    code: `def is_valid_bst(root: TreeNode | None, lo=float('-inf'), hi=float('inf')) -> bool:
    if not root:
        return True
    if not (lo < root.val < hi):
        return False
    return is_valid_bst(root.left, lo, root.val) and is_valid_bst(root.right, root.val, hi)`,
  },
  'trees-4': {
    pattern: 'Postorder LCA Propagation',
    complexity: { time: 'O(n)', space: 'O(h)' },
    companies: ['Meta', 'Amazon', 'LinkedIn', 'Google', 'Microsoft'],
    leetcode: { id: 236, title: 'Lowest Common Ancestor of a Binary Tree', slug: 'lowest-common-ancestor-of-a-binary-tree' },
    topic: 'Binary Tree',
    followUp: 'What if each node has a `.parent` pointer instead of `.root` (LC #1650)? Treat the paths to the root like two intersecting linked lists: `a = a.parent if a else q`, `b = b.parent if b else p` — O(h) time, O(1) space!',
    code: `def lowest_common_ancestor(root: TreeNode | None, p: TreeNode, q: TreeNode) -> TreeNode | None:
    if not root or root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    return root if (left and right) else (left or right)`,
  },
  'trees-5': {
    pattern: 'Level-by-Level BFS Queue',
    complexity: { time: 'O(n)', space: 'O(w)' },
    companies: ['Meta', 'Amazon', 'Bloomberg', 'Microsoft'],
    leetcode: { id: 102, title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal' },
    topic: 'BFS',
    followUp: 'How do you modify this for Binary Tree Right Side View (LC #199)? Simply record the last node (`i == level_size - 1`) of each BFS level.',
    code: `from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    if not root:
        return []
    q, out = deque([root]), []
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out`,
  },
  'trees-6': {
    pattern: 'Preorder with Sentinel Tokens',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Meta', 'Amazon', 'Google', 'Uber', 'LinkedIn'],
    leetcode: { id: 297, title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree' },
    topic: 'Binary Tree',
    followUp: 'If the tree is a Binary Search Tree (LC #449), can you serialize it without `#` null markers? Yes — preorder values alone suffice because you can reconstruct subtrees using `(lower, upper)` value bounds.',
    code: `class Codec:
    def serialize(self, root: TreeNode | None) -> str:
        out = []
        def dfs(n):
            if not n:
                out.append('#')
                return
            out.append(str(n.val))
            dfs(n.left)
            dfs(n.right)
        dfs(root)
        return ','.join(out)

    def deserialize(self, data: str) -> TreeNode | None:
        it = iter(data.split(','))
        def dfs():
            val = next(it)
            if val == '#':
                return None
            node = TreeNode(int(val))
            node.left, node.right = dfs(), dfs()
            return node
        return dfs()`,
  },
  'trees-7': {
    pattern: 'Postorder Global Max + Gain',
    complexity: { time: 'O(n)', space: 'O(h)' },
    companies: ['Meta', 'Amazon', 'Google', 'DoorDash', 'Microsoft'],
    leetcode: { id: 124, title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum' },
    topic: 'Binary Tree',
    followUp: 'Why can’t `dfs(node)` return `node.val + left_gain + right_gain` to its parent? Because a valid path cannot branch in two directions at a child and also continue up to the parent.',
    code: `def max_path_sum(root: TreeNode) -> int:
    best = float('-inf')
    def gain(node: TreeNode | None) -> int:
        nonlocal best
        if not node:
            return 0
        left = max(0, gain(node.left))
        right = max(0, gain(node.right))
        best = max(best, node.val + left + right)  # arch through node
        return node.val + max(left, right)         # single branch upward
    gain(root)
    return best`,
  },

  // ------------------------------------------------------------- heaps & tries
  'heaps-tries-1': {
    pattern: 'Array-Backed Binary Heap',
    complexity: { time: 'O(log n) push/pop, O(n) build', space: 'O(n)' },
    companies: ['Amazon', 'Google', 'Microsoft'],
    topic: 'Heap',
    followUp: 'Why is Floyd’s bottom-up `heapify` O(n) instead of O(n log n)? Because half the nodes are leaves (0 swaps), a quarter are at height 1 (≤ 1 swap), etc., and ∑ (n / 2^(h+1)) · h converges to ≤ 2n.',
    code: `import heapq
nums = [5, 1, 8, 3]
heapq.heapify(nums)       # O(n) bottom-up min-heap in-place
smallest = nums[0]        # O(1) peek
heapq.heappush(nums, 2)   # O(log n) push`,
  },
  'heaps-tries-2': {
    pattern: 'Size-K Min-Heap',
    complexity: { time: 'O(n log k)', space: 'O(k)' },
    companies: ['Meta', 'Amazon', 'LinkedIn', 'Google', 'Apple'],
    leetcode: { id: 215, title: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array' },
    topic: 'Heap',
    followUp: 'When would you choose the O(n log k) Min-Heap over O(n) average Quickselect? When elements arrive as a live stream (LC #703), when you cannot mutate the input array, or when k is very small (`k << n`).',
    code: `import heapq

def find_kth_largest(nums: list[int], k: int) -> int:
    heap = nums[:k]
    heapq.heapify(heap)
    for x in nums[k:]:
        if x > heap[0]:
            heapq.heapreplace(heap, x)
    return heap[0]`,
  },
  'heaps-tries-3': {
    pattern: 'Frequency Bucket Sort / Heap',
    complexity: { time: 'O(n)', space: 'O(n)' },
    companies: ['Meta', 'Amazon', 'Google', 'Uber', 'Bloomberg'],
    leetcode: { id: 347, title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements' },
    topic: 'Top K Elements',
    followUp: 'Why is the bucket array size `len(nums) + 1` guaranteed to be enough? Because no element can appear more than `n = len(nums)` times.',
    code: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in Counter(nums).items():
        buckets[freq].append(num)
    out = []
    for freq in range(len(buckets) - 1, 0, -1):
        for num in buckets[freq]:
            out.append(num)
            if len(out) == k:
                return out
    return out`,
  },
  'heaps-tries-4': {
    pattern: 'K-Way Merge with Min-Heap',
    complexity: { time: 'O(N log k)', space: 'O(k)' },
    companies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Uber'],
    leetcode: { id: 23, title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists' },
    topic: 'Heap',
    followUp: 'How do you find the Smallest Range Covering Elements from K Lists (LC #632)? Use the same k-size Min-Heap, also track the `current_max` among the k elements in the heap, and update the best `[heap[0], current_max]` range on every pop.',
    code: `import heapq

def merge_k_lists(lists: list[ListNode | None]) -> ListNode | None:
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(heap)
    dummy = tail = ListNode(0)
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
  },
  'heaps-tries-5': {
    pattern: 'Two Heaps (Max-Heap + Min-Heap)',
    complexity: { time: 'O(log n) add, O(1) median', space: 'O(n)' },
    companies: ['Amazon', 'Google', 'Meta', 'Apple', 'Netflix', 'Citadel'],
    leetcode: { id: 295, title: 'Find Median from Data Stream', slug: 'find-median-from-data-stream' },
    topic: 'Heap',
    followUp: 'What if 99% of numbers in the stream are integers in `[0, 100]`? Replace the heaps with an array `count[0..100]` plus two counters (`lessThan0`, `greaterThan100`) to get O(1) time and O(1) space!',
    code: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo, self.hi = [], []  # max-heap (negated), min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self) -> float:
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2.0`,
  },
  'heaps-tries-6': {
    pattern: 'Prefix Tree (Trie)',
    complexity: { time: 'O(L) insert/search', space: 'O(Σ · N · L)' },
    companies: ['Google', 'Amazon', 'Twitter', 'Microsoft'],
    leetcode: { id: 208, title: 'Implement Trie (Prefix Tree)', slug: 'implement-trie-prefix-tree' },
    topic: 'Trie',
    followUp: 'How do you support wildcard search like `.a.` (Design Add and Search Words, LC #211)? On normal characters follow `node.children[ch]`; on `.` recursively branch across all values in `node.children`.',
    code: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['$'] = True

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node:
                return False
            node = node[ch]
        return True`,
  },
  'heaps-tries-7': {
    pattern: 'Trie + Grid Backtracking',
    complexity: { time: 'O(R · C · 4 · 3^(L-1))', space: 'O(total word chars)' },
    companies: ['Uber', 'Amazon', 'Google', 'Meta', 'Ciscol'],
    leetcode: { id: 212, title: 'Word Search II', slug: 'word-search-ii' },
    topic: 'Trie',
    followUp: 'What single optimization speeds up LeetCode 212 by 10×? After finding a word or finishing a child Trie node that has become empty (`not next_node`), delete that leaf key from the parent Trie node so later DFS paths never revisit it.',
    code: `# Key pruning step inside DFS(r, c, parent_trie_node):
node = parent[ch]
if '$' in node:
    found.append(node.pop('$'))  # deduplicate & avoid re-recording
# ... recurse 4 neighbors ...
if not node:
    parent.pop(ch)               # prune exhausted Trie branch!`,
  },

  // -------------------------------------------------------------------- graphs
  'graphs-1': {
    pattern: 'Graph Representation',
    complexity: { time: 'O(deg(u)) vs O(1)', space: 'O(V + E) vs O(V²)' },
    companies: ['Google', 'Amazon', 'Microsoft'],
    topic: 'Graphs',
    followUp: 'With V = 100,000 nodes and E = 200,000 edges, why does an adjacency matrix crash? Because `10⁵ × 10⁵` requires 10 billion entries (~40 GB of RAM), whereas an adjacency list takes only a few megabytes.',
    code: `from collections import defaultdict
adj = defaultdict(list)
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)  # omit for directed graphs`,
  },
  'graphs-2': {
    pattern: 'BFS Layer Frontier vs DFS Stack',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    companies: ['Amazon', 'Meta', 'Google', 'Microsoft'],
    leetcode: { id: 994, title: 'Rotting Oranges', slug: 'rotting-oranges' },
    topic: 'BFS',
    followUp: 'Why must you mark a node `visited` at the moment you *enqueue* it in BFS rather than when you *pop* it? Waiting until pop allows the same node to be pushed into the queue multiple times by different neighbors, blowing up time and memory.',
    code: `from collections import deque

def shortest_path_bfs(adj, start, target):
    q, visited = deque([(start, 0)]), {start}
    while q:
        u, dist = q.popleft()
        if u == target:
            return dist
        for v in adj[u]:
            if v not in visited:
                visited.add(v)  # mark on enqueue!
                q.append((v, dist + 1))
    return -1`,
  },
  'graphs-3': {
    pattern: 'Grid Flood-Fill DFS / BFS',
    complexity: { time: 'O(R · C)', space: 'O(R · C)' },
    companies: ['Amazon', 'Bloomberg', 'Google', 'Meta', 'Microsoft'],
    leetcode: { id: 200, title: 'Number of Islands', slug: 'number-of-islands' },
    topic: 'DFS',
    followUp: 'What if land cells are added dynamically one by one (Number of Islands II, LC #305)? DFS from scratch per query would be O(Q · R · C); instead use Union-Find to union each new land cell with its 4 neighbors in O(Q · α(R·C)).',
    code: `def num_islands(grid: list[list[str]]) -> int:
    R, C, count = len(grid), len(grid[0]), 0
    def sink(r: int, c: int):
        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
    for r in range(R):
        for c in range(C):
            if grid[r][c] == '1':
                count += 1
                sink(r, c)
    return count`,
  },
  'graphs-4': {
    pattern: '3-Color DFS / Union-Find',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    leetcode: { id: 207, title: 'Course Schedule', slug: 'course-schedule' },
    topic: 'Cycle Detection',
    followUp: 'Why doesn’t a simple boolean `visited` set detect cycles in a directed graph? Because two paths `A -> B -> D` and `A -> C -> D` both reach `D` (a diamond DAG) without forming a cycle — you need 3 states (`0=unvisited, 1=visiting, 2=done`).',
    code: `def has_directed_cycle(n: int, adj: dict[int, list[int]]) -> bool:
    state = [0] * n  # 0 = unvisited, 1 = visiting (on stack), 2 = done
    def dfs(u: int) -> bool:
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1 or (state[v] == 0 and dfs(v)):
                return True
        state[u] = 2
        return False
    return any(state[i] == 0 and dfs(i) for i in range(n))`,
  },
  'graphs-5': {
    pattern: "Kahn's Indegree BFS (Topological Sort)",
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
    companies: ['Amazon', 'Google', 'Meta', 'TikTok', 'Uber'],
    leetcode: { id: 210, title: 'Course Schedule II', slug: 'course-schedule-ii' },
    topic: 'Topological Sort',
    followUp: 'How do you solve Alien Dictionary (LC #269)? Compare adjacent words to extract directed character edges `c1 -> c2` at the first differing character, then run Kahn’s topological sort on the character graph.',
    code: `from collections import deque

def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    adj = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for dest, src in prerequisites:
        adj[src].append(dest)
        indeg[dest] += 1
    q = deque(i for i, d in enumerate(indeg) if d == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == num_courses else []`,
  },
  'graphs-6': {
    pattern: 'Greedy Priority-Queue Relaxation',
    complexity: { time: 'O((V + E) log V)', space: 'O(V + E)' },
    companies: ['Google', 'Amazon', 'Uber', 'Airbnb', 'Meta'],
    leetcode: { id: 743, title: 'Network Delay Time', slug: 'network-delay-time' },
    topic: "Dijkstra's Algorithm",
    followUp: 'What if edge weights are only `0` or `1` (Minimum Cost to Make Valid Path, LC #1368)? Use 0-1 BFS with a `deque`: push weight-0 edges to the front and weight-1 edges to the back for O(V + E) time without a heap!',
    code: `import heapq

def dijkstra(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
  },
  'graphs-7': {
    pattern: 'Disjoint Set Union (Path Compression + Rank)',
    complexity: { time: 'O(α(n)) ≈ O(1)', space: 'O(n)' },
    companies: ['Google', 'Amazon', 'Meta', 'Databricks'],
    leetcode: { id: 684, title: 'Redundant Connection', slug: 'redundant-connection' },
    topic: 'Union-Find',
    followUp: 'Why is Union-Find good for adding edges dynamically, but cannot directly support *deleting* edges? Because path compression flattens the tree structure irreversibly.',
    code: `class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True`,
  },

  // -------------------------------------------------------- sorting & searching
  'sorting-searching-1': {
    pattern: 'Elementary Comparison Sorts',
    complexity: { time: 'O(n²) worst, O(n) best (Insertion)', space: 'O(1)' },
    companies: ['Microsoft', 'Amazon', 'Adobe'],
    topic: 'Sorting',
    followUp: 'Why do production sorting libraries (Timsort, Introsort) switch to Insertion Sort when a partition has ≤ 16–32 elements? Because Insertion Sort has tiny constant overhead, zero recursion calls, and sequential cache access.',
    code: `def insertion_sort(a: list[int]) -> None:
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key`,
  },
  'sorting-searching-2': {
    pattern: 'Lower-Bound Binary Search',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    leetcode: { id: 704, title: 'Binary Search', slug: 'binary-search' },
    topic: 'Binary Search',
    followUp: 'How do you find the first and last position of a target in a sorted array with duplicates (LC #34)? Run `lower_bound(target)` for the first index and `lower_bound(target + 1) - 1` for the last index.',
    code: `def lower_bound(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums)  # half-open [lo, hi)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
  },
  'sorting-searching-3': {
    pattern: 'Divide & Conquer Sorting',
    complexity: { time: 'O(n log n)', space: 'O(n) Merge / O(log n) Quick' },
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    leetcode: { id: 912, title: 'Sort an Array', slug: 'sort-an-array' },
    topic: 'Sorting',
    followUp: 'How can Merge Sort be used to count inversions in an array (`i < j` and `a[i] > a[j]`, LC #315)? Whenever an element from the right half is placed before `remaining` elements of the left half during merge, add `remaining` to the inversion count.',
    code: `// Standard Library Sorting Algorithms:
// - Python list.sort() / Java Object[]: TimSort (Merge + Insertion, Stable, O(n log n), O(n) space)
// - Java int[] (primitives): Dual-Pivot QuickSort (Unstable, O(log n) space, cache-fast)
// - C++ std::sort: IntroSort (Quick + Heap + Insertion, Unstable, O(n log n) worst-case)`,
  },
  'sorting-searching-4': {
    pattern: 'Sort Stability',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    companies: ['Google', 'Microsoft', 'Apple'],
    topic: 'Sorting',
    followUp: 'Why does Java use Dual-Pivot Quicksort for primitive `int[]` but Timsort (stable) for `Object[]`? Because two primitive `5`s are indistinguishable, so stability only matters for objects with secondary fields.',
    code: `# Stable sort preserves relative order of ties:
users.sort(key=lambda u: u.name)       # 1. sort alphabetically
users.sort(key=lambda u: u.role_rank)  # 2. stable sort by role keeps names alphabetical within each role`,
  },
  'sorting-searching-5': {
    pattern: 'Sorted-Half Binary Search',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    companies: ['Meta', 'Amazon', 'Microsoft', 'Bloomberg', 'LinkedIn'],
    leetcode: { id: 33, title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array' },
    topic: 'Binary Search',
    followUp: 'What if the rotated array contains duplicates (LC #81)? When `nums[lo] == nums[mid] == nums[hi]`, you cannot tell which side is sorted, so increment `lo += 1` and `hi -= 1` (worst-case O(n)).',
    code: `def search_rotated(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:  # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                      # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
  },
  'sorting-searching-6': {
    pattern: 'Quickselect Partitioning',
    complexity: { time: 'O(n) avg, O(n²) worst', space: 'O(1)' },
    companies: ['Meta', 'Amazon', 'Google', 'Spotify'],
    leetcode: { id: 973, title: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin' },
    topic: 'Top K Elements',
    followUp: 'Why is Quickselect O(n) on average while Quicksort is O(n log n)? Quicksort recurses on *both* halves (`n + 2(n/2) + 4(n/4) = n log n`), whereas Quickselect recurses on only *one* half (`n + n/2 + n/4 + ... = 2n`).',
    code: `# Average work of Quickselect:
# n + n/2 + n/4 + n/8 + ... <= 2n = O(n)
# Ideal when you need top K elements in any order in O(n) time.`,
  },
  'sorting-searching-7': {
    pattern: 'Binary Search on Answer Space',
    complexity: { time: 'O(n log(max(piles)))', space: 'O(1)' },
    companies: ['Google', 'Amazon', 'Meta', 'DoorDash', 'Airbnb'],
    leetcode: { id: 875, title: 'Koko Eating Bananas', slug: 'koko-eating-bananas' },
    topic: 'Binary Search on Answer',
    followUp: 'How do you recognize a "Binary Search on Answer" problem in an interview? Look for "minimize the maximum" or "maximize the minimum" where checking a candidate answer `X` is an easy O(n) greedy scan.',
    code: `def min_eating_speed(piles: list[int], h: int) -> int:
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        hours = sum((p + mid - 1) // mid for p in piles)
        if hours <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
  },

  // ------------------------------------------------------------------ recursion
  'recursion-1': {
    pattern: 'Base Case & Call-Stack Frames',
    complexity: { time: 'O(n)', space: 'O(n) stack' },
    companies: ['Amazon', 'Microsoft'],
    topic: 'Recursion',
    followUp: 'What information is stored inside each call-stack frame? The function parameters, local variables, and the return instruction address.',
    code: `def factorial(n: int) -> int:
    if n <= 1:          # base case prevents StackOverflowError
        return 1
    return n * factorial(n - 1)`,
  },
  'recursion-2': {
    pattern: 'Explicit Stack vs Call Stack',
    complexity: { time: 'O(n)', space: 'O(h)' },
    companies: ['Google', 'Amazon', 'Microsoft'],
    topic: 'Recursion',
    followUp: 'In a production backend, why might you rewrite recursive DFS as an iterative loop with an explicit heap-allocated stack? Because thread call stacks have a small fixed limit (e.g., 1 MB in Java/C++ or 1000 frames in Python), whereas heap memory can scale to gigabytes.',
    code: `# Converting recursive DFS to an explicit stack:
stack = [root]
while stack:
    node = stack.pop()
    # process node and push children`,
  },
  'recursion-3': {
    pattern: 'Overlapping Subproblems',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Microsoft', 'Apple'],
    leetcode: { id: 509, title: 'Fibonacci Number', slug: 'fibonacci-number' },
    topic: 'Dynamic Programming',
    followUp: 'How do you compute the n-th Fibonacci number in O(log n) time? Use binary exponentiation on the 2×2 transformation matrix `[[1, 1], [1, 0]]^n`.',
    code: `def fib(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
  },
  'recursion-4': {
    pattern: 'Include / Exclude Backtracking',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(n) stack' },
    companies: ['Meta', 'Amazon', 'Bloomberg', 'Google'],
    leetcode: { id: 78, title: 'Subsets', slug: 'subsets' },
    topic: 'Backtracking',
    followUp: 'How do you handle duplicate numbers in the input (Subsets II, LC #90)? Sort `nums` first, and inside the loop skip `if j > i and nums[j] == nums[j - 1]: continue`.',
    code: `def subsets(nums: list[int]) -> list[list[int]]:
    res, path = [], []
    def dfs(i: int):
        res.append(path[:])
        for j in range(i, len(nums)):
            path.append(nums[j])
            dfs(j + 1)
            path.pop()
    dfs(0)
    return res`,
  },
  'recursion-5': {
    pattern: 'Swap-In-Place Backtracking',
    complexity: { time: 'O(n · n!)', space: 'O(n) stack' },
    companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Meta'],
    leetcode: { id: 46, title: 'Permutations', slug: 'permutations' },
    topic: 'Backtracking',
    followUp: 'What if the interviewer asks for the *next lexicographical permutation* in O(n) time and O(1) space (LC #31)? Find the rightmost ascent `nums[i] < nums[i+1]`, swap `nums[i]` with the smallest larger element to its right, then reverse `nums[i+1:]`.',
    code: `def permute(nums: list[int]) -> list[list[int]]:
    res = []
    def dfs(start: int):
        if start == len(nums):
            res.append(nums[:])
            return
        for i in range(start, len(nums)):
            nums[start], nums[i] = nums[i], nums[start]
            dfs(start + 1)
            nums[start], nums[i] = nums[i], nums[start]
    dfs(0)
    return res`,
  },
  'recursion-6': {
    pattern: 'Constraint-Pruned Backtracking',
    complexity: { time: 'O(n!)', space: 'O(n)' },
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
    leetcode: { id: 51, title: 'N-Queens', slug: 'n-queens' },
    topic: 'Backtracking',
    followUp: 'How can you replace the `cols`, `diag1`, and `diag2` hash sets with O(1) bitwise operations? Use three integer bitmasks (`cols`, `(ld | bit) << 1`, `(rd | bit) >> 1`) — this is the fastest N-Queens implementation.',
    code: `def total_n_queens(n: int) -> int:
    cols, d1, d2 = set(), set(), set()
    def dfs(r: int) -> int:
        if r == n:
            return 1
        count = 0
        for c in range(n):
            if c not in cols and (r - c) not in d1 and (r + c) not in d2:
                cols.add(c); d1.add(r - c); d2.add(r + c)
                count += dfs(r + 1)
                cols.remove(c); d1.remove(r - c); d2.remove(r + c)
        return count
    return dfs(0)`,
  },
  'recursion-7': {
    pattern: 'Pruned Backtracking / Memoized DFS',
    complexity: { time: 'O(n^(T/M)) / O(n²)', space: 'O(T/M)' },
    companies: ['Amazon', 'Meta', 'Google', 'Airbnb'],
    leetcode: { id: 39, title: 'Combination Sum', slug: 'combination-sum' },
    topic: 'Backtracking',
    followUp: 'Why does Combination Sum pass `dfs(j, rem - c)` without memoization, while Word Break (LC #139) uses memoization? Because Combination Sum must enumerate *all* paths, whereas Word Break asks a boolean decision on suffix index `i`.',
    code: `def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    candidates.sort()
    res, path = [], []
    def dfs(start: int, rem: int):
        if rem == 0:
            res.append(path[:]); return
        for i in range(start, len(candidates)):
            if candidates[i] > rem:
                break  # pruned because candidates is sorted!
            path.append(candidates[i])
            dfs(i, rem - candidates[i])
            path.pop()
    dfs(0, target)
    return res`,
  },

  // ---------------------------------------------------------------------- DP
  'dp-1': {
    pattern: 'State + Transition + Base Cases',
    complexity: { time: 'O(states × transitions)', space: 'O(states)' },
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    topic: 'Dynamic Programming',
    followUp: 'When is Top-Down Memoization better than Bottom-Up Tabulation? When the state space is sparse and many states are never reached from the initial query. Bottom-Up wins when you want to optimize space (rolling rows) and avoid recursion overhead.',
    code: `// 4-Step DP Framework for Interviews:
// 1. Define state clearly (e.g. dp[i] = min cost to reach index i)
// 2. Write transition recurrence (dp[i] = min(dp[i-1] + c1, dp[i-2] + c2))
// 3. Identify base cases (dp[0] = 0)
// 4. Optimize space if dp[i] only depends on a fixed window of previous states`,
  },
  'dp-2': {
    pattern: 'Rolling-Variable 1D DP',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Google', 'Cisco', 'Microsoft', 'Apple'],
    leetcode: { id: 198, title: 'House Robber', slug: 'house-robber' },
    topic: 'Dynamic Programming',
    followUp: 'What if the houses are arranged in a circle so the first and last houses are adjacent (House Robber II, LC #213)? Run the linear House Robber helper twice: `max(rob(nums[:-1]), rob(nums[1:]))`.',
    code: `def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
  },
  'dp-3': {
    pattern: 'Unbounded Knapsack DP',
    complexity: { time: 'O(amount × coins)', space: 'O(amount)' },
    companies: ['Amazon', 'Bloomberg', 'Google', 'Uber', 'Microsoft'],
    leetcode: { id: 322, title: 'Coin Change', slug: 'coin-change' },
    topic: 'Coin Change',
    followUp: 'In Coin Change II (number of *combinations* to make `amount`, LC #518), why must the outer loop iterate over `coins` and the inner loop over `amount`? Reversing the loops counts *permutations* (`1+2` and `2+1` separately) instead of combinations!',
    code: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if a >= c:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] <= amount else -1`,
  },
  'dp-4': {
    pattern: 'Two-String 2D Grid DP',
    complexity: { time: 'O(m · n)', space: 'O(min(m, n))' },
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'DoorDash'],
    leetcode: { id: 1143, title: 'Longest Common Subsequence', slug: 'longest-common-subsequence' },
    topic: 'Longest Common Subsequence',
    followUp: 'How do you find the Longest Palindromic Subsequence of a string `s` (LC #516)? It is simply `LCS(s, reversed(s))`!',
    code: `def longest_common_subsequence(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        s1, s2 = s2, s1
    dp = [0] * (len(s2) + 1)
    for c1 in s1:
        prev_diag = 0
        for j, c2 in enumerate(s2, 1):
            temp = dp[j]
            dp[j] = prev_diag + 1 if c1 == c2 else max(dp[j], dp[j - 1])
            prev_diag = temp
    return dp[-1]`,
  },
  'dp-5': {
    pattern: '0/1 Knapsack (Reverse Capacity Loop)',
    complexity: { time: 'O(n · W)', space: 'O(W)' },
    companies: ['Amazon', 'Meta', 'Google', 'Adobe'],
    leetcode: { id: 416, title: 'Partition Equal Subset Sum', slug: 'partition-equal-subset-sum' },
    topic: 'Knapsack Problem',
    followUp: 'How does Partition Equal Subset Sum (LC #416) reduce to 0/1 Knapsack? Check if total sum `S` is even, then run 0/1 subset-sum DP to see if a subset sums to `S // 2`.',
    code: `def knapsack_01(weights: list[int], values: list[int], W: int) -> int:
    dp = [0] * (W + 1)
    for w, v in zip(weights, values):
        for cap in range(W, w - 1, -1):  # reverse so each item is used at most once
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[W]`,
  },
  'dp-6': {
    pattern: 'Patience Sorting + Binary Search',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Atlassian'],
    leetcode: { id: 300, title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence' },
    topic: 'Longest Increasing Subsequence',
    followUp: 'How do you solve Russian Doll Envelopes (2D LIS, LC #354)? Sort envelopes by `width` ascending and `height` *descending* on ties, then run 1D `O(n log n)` LIS on the heights! Sorting height descending prevents using two envelopes of the same width.',
    code: `from bisect import bisect_left

def length_of_lis(nums: list[int]) -> int:
    tails = []
    for x in nums:
        idx = bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x
    return len(tails)`,
  },
  'dp-7': {
    pattern: 'Levenshtein Distance 2D DP',
    complexity: { time: 'O(m · n)', space: 'O(min(m, n))' },
    companies: ['Google', 'Amazon', 'LinkedIn', 'Microsoft', 'Rubrik'],
    leetcode: { id: 72, title: 'Edit Distance', slug: 'edit-distance' },
    topic: 'Edit Distance',
    followUp: 'What if you just need to check whether two strings are *at most 1 edit apart* (One Edit Distance, LC #161)? Don’t allocate an O(m·n) DP table — scan once with two pointers and compare the suffixes after the first mismatch in O(n) time and O(1) space.',
    code: `def min_distance(w1: str, w2: str) -> int:
    m, n = len(w1), len(w2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev_diag, dp[0] = dp[0], i
        for j in range(1, n + 1):
            temp = dp[j]
            if w1[i - 1] == w2[j - 1]:
                dp[j] = prev_diag
            else:
                dp[j] = 1 + min(dp[j - 1], dp[j], prev_diag)
            prev_diag = temp
    return dp[n]`,
  },

  // ----------------------------------------------------------- greedy & bits
  'greedy-bits-1': {
    pattern: 'Greedy Exchange Argument',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    companies: ['Google', 'Amazon', 'Meta'],
    topic: 'Greedy',
    followUp: 'How do you quickly tell in an interview if Greedy might fail and you need DP instead? Test a small counterexample where a slightly smaller immediate gain unlocks a much larger future reward.',
    code: `// Greedy vs DP quick test:
// - Fractional Knapsack (can take fractions of items): Sort by value/weight -> Greedy O(n log n)
// - 0/1 Knapsack (all-or-nothing items): Greedy fails -> DP O(n * W)`,
  },
  'greedy-bits-2': {
    pattern: 'Interval Sorting & Merging',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    companies: ['Meta', 'Amazon', 'Google', 'Bloomberg', 'Salesforce', 'Uber'],
    leetcode: { id: 56, title: 'Merge Intervals', slug: 'merge-intervals' },
    topic: 'Merge Intervals',
    followUp: 'Why do you sort by *start time* when merging intervals (LC #56), but sort by *end time* when finding the minimum intervals to remove to eliminate overlaps (Non-overlapping Intervals, LC #435)? Finishing earliest leaves the maximum room for future intervals.',
    code: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
  },
  'greedy-bits-3': {
    pattern: 'Farthest-Reach Greedy Frontier',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Google', 'Meta', 'DoorDash'],
    leetcode: { id: 55, title: 'Jump Game', slug: 'jump-game' },
    topic: 'Greedy',
    followUp: 'How do you find the *minimum number of jumps* to reach the last index in O(n) time and O(1) space (Jump Game II, LC #45)? Track `cur_end` (end of current jump layer) and `farthest`; each time `i == cur_end`, increment `jumps += 1` and set `cur_end = farthest`.',
    code: `def can_jump(nums: list[int]) -> bool:
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False
        farthest = max(farthest, i + jump)
    return True`,
  },
  'greedy-bits-4': {
    pattern: 'Sweep-Line / Min-Heap of End Times',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    companies: ['Google', 'Meta', 'Amazon', 'Bloomberg', 'Uber', 'Microsoft'],
    leetcode: { id: 253, title: 'Meeting Rooms II', slug: 'meeting-rooms-ii' },
    topic: 'Merge Intervals',
    followUp: 'Can you solve Meeting Rooms II without a heap? Yes — use a chronological Sweep-Line: put all `start` times and `end` times into two sorted arrays (or `+1 / -1` event deltas) and track the maximum concurrent active meetings.',
    code: `import heapq

def min_meeting_rooms(intervals: list[list[int]]) -> int:
    intervals.sort(key=lambda x: x[0])
    free_rooms = []  # min-heap of end times
    for start, end in intervals:
        if free_rooms and free_rooms[0] <= start:
            heapq.heapreplace(free_rooms, end)
        else:
            heapq.heappush(free_rooms, end)
    return len(free_rooms)`,
  },
  'greedy-bits-5': {
    pattern: 'Brian Kernighan Bit Tricks',
    complexity: { time: 'O(set bits)', space: 'O(1)' },
    companies: ['Apple', 'Qualcomm', 'Nvidia', 'Amazon'],
    leetcode: { id: 191, title: 'Number of 1 Bits', slug: 'number-of-1-bits' },
    topic: 'Bit Manipulation',
    followUp: 'How do you compute the number of set bits for *every* number from `0` to `n` in O(n) total time (Counting Bits, LC #338)? Use the recurrence `dp[i] = dp[i & (i - 1)] + 1` (or `dp[i >> 1] + (i & 1)`).',
    code: `def hamming_weight(n: int) -> int:
    count = 0
    while n:
        n &= n - 1  # clears the lowest set 1-bit
        count += 1
    return count`,
  },
  'greedy-bits-6': {
    pattern: 'XOR Cancellation Property',
    complexity: { time: 'O(n)', space: 'O(1)' },
    companies: ['Amazon', 'Apple', 'Google', 'Microsoft'],
    leetcode: { id: 136, title: 'Single Number', slug: 'single-number' },
    topic: 'Bit Manipulation',
    followUp: 'What if every element appears *three* times except for one (Single Number II, LC #137)? Maintain two bit-state accumulators (`ones` and `twos`): `ones = (ones ^ x) & ~twos`, `twos = (twos ^ x) & ~ones` for O(n) time and O(1) space.',
    code: `def single_number(nums: list[int]) -> int:
    ans = 0
    for x in nums:
        ans ^= x
    return ans`,
  },
  'greedy-bits-7': {
    pattern: 'Bitwise Power-of-2 & Hamming Distance',
    complexity: { time: 'O(1)', space: 'O(1)' },
    companies: ['Apple', 'Nvidia', 'Google', 'Amazon'],
    leetcode: { id: 231, title: 'Power of Two', slug: 'power-of-two' },
    topic: 'Bit Manipulation',
    followUp: 'How do you isolate *only* the lowest set bit of `n` (used in Fenwick / Binary Indexed Trees)? Compute `n & -n` in two’s complement arithmetic.',
    code: `def is_power_of_two(n: int) -> bool:
    return n > 0 and (n & (n - 1)) == 0`,
  },
}

export const JOB_ROLES = [
  {
    id: 'sde1',
    label: 'Intern / SDE-1 (New Grad)',
    shortLabel: 'Intern / SDE-1',
    keywords: ['intern', 'internship', 'sde1', 'sde-1', 'sde 1', 'fresher', 'new grad', 'graduate', 'junior', 'entry', 'associate', 'campus'],
    focus: 'Core data structures, bug-free implementation, two pointers, hash maps, linked lists, binary search, trees, and BFS/DFS fundamentals.',
    mustKnow: ['Arrays & Hash Maps', 'Two Pointers & Sliding Window', 'Linked Lists', 'Binary Trees & BFS/DFS', 'Basic 1D DP'],
    targetMix: '60% Easy · 40% Medium',
  },
  {
    id: 'backend',
    label: 'Backend & Distributed Systems',
    shortLabel: 'Backend SWE',
    keywords: ['backend', 'back-end', 'server', 'distributed', 'microservices', 'api', 'golang', 'java', 'spring', 'node', 'database', 'platform'],
    focus: 'High-concurrency lookups, caching (LRU/LFU), hash table internals, rate-limiting queues, dependency graphs (topological sort, Dijkstra), and k-way stream merging.',
    mustKnow: ['Hash Tables & LRU Cache', 'Heaps & Priority Queues', 'Graphs (Topological Sort, Dijkstra)', 'Tries (Routing & Prefix)', 'Intervals & Rate Windows'],
    targetMix: '30% Easy · 50% Medium · 20% Hard',
  },
  {
    id: 'frontend',
    label: 'Frontend & Full-Stack SWE',
    shortLabel: 'Frontend / Full-Stack',
    keywords: ['frontend', 'front-end', 'ui', 'web', 'react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'dom', 'full-stack', 'fullstack', 'full stack'],
    focus: 'DOM-like tree traversal & diffing (DFS/BFS, LCA, serialization), string/HTML parsing, debounced sliding windows, undo/redo stacks, and state tree recursion.',
    mustKnow: ['N-ary & Binary Trees (DOM)', 'Stacks & Queues (History / Event Loop)', 'Strings & Sliding Window', 'Hash Maps (Memoization)', 'Recursion & Backtracking'],
    targetMix: '40% Easy · 50% Medium · 10% Hard',
  },
  {
    id: 'mobile',
    label: 'Mobile Engineer (iOS / Android)',
    shortLabel: 'Mobile (iOS/Android)',
    keywords: ['mobile', 'android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'app'],
    focus: 'Memory-constrained caching (LRU image/disk cache), navigation back-stacks, view-hierarchy tree traversals, binary-search pagination, and offline sync graphs.',
    mustKnow: ['LRU Cache & Hash Maps', 'Stacks & Linked Lists (Navigation)', 'Trees (View Hierarchy)', 'Binary Search (Pagination)', 'BFS/DFS (Offline Sync)'],
    targetMix: '35% Easy · 55% Medium · 10% Hard',
  },
  {
    id: 'data-ml',
    label: 'Data & ML / AI Engineer',
    shortLabel: 'Data / ML / AI',
    keywords: ['data', 'ml', 'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'nlp', 'llm', 'etl', 'spark', 'pipeline', 'analytics', 'scientist'],
    focus: 'Stream processing, k-way merge on sorted partitions, priority queues (beam search / Top-K), matrix/graph traversals, token tries, and dynamic programming.',
    mustKnow: ['Heaps (K-Way Merge, Top-K, Beam Search)', 'Hash Maps & Joins', 'Arrays, Matrices & Sliding Windows', 'Tries (Tokenization)', 'Dynamic Programming'],
    targetMix: '30% Easy · 50% Medium · 20% Hard',
  },
  {
    id: 'devops-sre',
    label: 'SRE / DevOps / Cloud & Security',
    shortLabel: 'SRE / DevOps / Sec',
    keywords: ['sre', 'devops', 'cloud', 'infra', 'infrastructure', 'kubernetes', 'k8s', 'aws', 'docker', 'reliability', 'security', 'cyber', 'network', 'linux', 'sysadmin'],
    focus: 'Network topology & dependency graphs (cycle detection, shortest path, Union-Find), log-stream sliding windows, interval scheduling, and bitwise IP/ACL masks.',
    mustKnow: ['Graphs (Cycle Detection, Dijkstra, Union-Find)', 'Sliding Windows & Queues (Log/Rate Streams)', 'Intervals (Maintenance Windows)', 'Hash Maps (Metric Aggregation)', 'Bit Manipulation (CIDR / ACL Masks)'],
    targetMix: '40% Easy · 50% Medium · 10% Hard',
  },
  {
    id: 'embedded-quant',
    label: 'Quant / Embedded / Low-Latency',
    shortLabel: 'Quant / Embedded',
    keywords: ['quant', 'quantitative', 'hft', 'trading', 'finance', 'citadel', 'jane street', 'embedded', 'firmware', 'c++', 'rust', 'systems', 'kernel', 'os', 'hardware', 'iot', 'game', 'graphics'],
    focus: 'In-place O(1)-space algorithms, bit manipulation, cache-friendly contiguous arrays, order-book heaps, Quickselect, and hard dynamic programming.',
    mustKnow: ['Bit Manipulation & Two’s Complement', 'Two Heaps & Order-Book Streams', 'In-Place Pointers & Ring Buffers', 'Cache Locality & Introsort', 'Hard Dynamic Programming'],
    targetMix: '25% Medium · 75% Hard',
  },
  {
    id: 'senior',
    label: 'Senior / Staff SWE (SDE-2+)',
    shortLabel: 'Senior (SDE-2+)',
    keywords: ['senior', 'staff', 'principal', 'lead', 'architect', 'sde2', 'sde-2', 'sde 2', 'sde3', 'sde-3', 'sde 3', 'l5', 'l6', 'e5', 'e6'],
    focus: 'Hard multi-pattern optimizations, monotonic stacks/deques, binary search on answer, concurrency/scale follow-ups, custom data structure design, and 2D DP.',
    mustKnow: ['Custom Data Structures (LRU/LFU, Trie)', 'Monotonic Stack & Deque', 'Binary Search on Answer', 'Advanced Graph & Tree DP', 'Concurrency & External-Memory Follow-Ups'],
    targetMix: '45% Medium · 55% Hard',
  },
]

const ROLE_QUESTIONS = {
  sde1: [
    'complexity-1', 'complexity-2', 'complexity-4', 'complexity-5',
    'arrays-1', 'arrays-2', 'arrays-3', 'arrays-4', 'arrays-5',
    'linked-lists-1', 'linked-lists-2', 'linked-lists-3', 'linked-lists-4', 'linked-lists-5', 'linked-lists-6',
    'stacks-queues-1', 'stacks-queues-2', 'stacks-queues-3', 'stacks-queues-4',
    'hashing-1', 'hashing-2', 'hashing-4', 'hashing-5',
    'trees-1', 'trees-2', 'trees-3', 'trees-4', 'trees-5',
    'heaps-tries-1', 'heaps-tries-2', 'heaps-tries-3',
    'graphs-1', 'graphs-2', 'graphs-3',
    'sorting-searching-1', 'sorting-searching-2', 'sorting-searching-4', 'sorting-searching-5',
    'recursion-1', 'recursion-2', 'recursion-3', 'recursion-4', 'recursion-5',
    'dp-1', 'dp-2', 'dp-3',
    'greedy-bits-1', 'greedy-bits-2', 'greedy-bits-3', 'greedy-bits-5', 'greedy-bits-6', 'greedy-bits-7',
  ],
  backend: [
    'complexity-1', 'complexity-3', 'complexity-6', 'complexity-7',
    'arrays-2', 'arrays-4', 'arrays-5',
    'linked-lists-2', 'linked-lists-4', 'linked-lists-7',
    'stacks-queues-1', 'stacks-queues-3', 'stacks-queues-4', 'stacks-queues-7',
    'hashing-1', 'hashing-3', 'hashing-4', 'hashing-5', 'hashing-6', 'hashing-7',
    'trees-3', 'trees-5', 'trees-6',
    'heaps-tries-1', 'heaps-tries-2', 'heaps-tries-3', 'heaps-tries-4', 'heaps-tries-5', 'heaps-tries-6',
    'graphs-1', 'graphs-2', 'graphs-3', 'graphs-4', 'graphs-5', 'graphs-6', 'graphs-7',
    'sorting-searching-2', 'sorting-searching-3', 'sorting-searching-5', 'sorting-searching-7',
    'recursion-2',
    'dp-3', 'dp-5',
    'greedy-bits-2', 'greedy-bits-4',
  ],
  frontend: [
    'complexity-1', 'complexity-2', 'complexity-5',
    'arrays-1', 'arrays-2', 'arrays-3', 'arrays-4', 'arrays-5',
    'linked-lists-1', 'linked-lists-3', 'linked-lists-6',
    'stacks-queues-1', 'stacks-queues-2', 'stacks-queues-3', 'stacks-queues-5',
    'hashing-1', 'hashing-2', 'hashing-4',
    'trees-1', 'trees-2', 'trees-3', 'trees-4', 'trees-5', 'trees-6',
    'heaps-tries-3', 'heaps-tries-6',
    'graphs-2', 'graphs-3', 'graphs-5',
    'sorting-searching-1', 'sorting-searching-2', 'sorting-searching-4',
    'recursion-1', 'recursion-2', 'recursion-3', 'recursion-4', 'recursion-5', 'recursion-7',
    'dp-1', 'dp-2', 'dp-4', 'dp-7',
    'greedy-bits-2',
  ],
  mobile: [
    'complexity-1', 'complexity-3', 'complexity-5',
    'arrays-1', 'arrays-2', 'arrays-4', 'arrays-5',
    'linked-lists-1', 'linked-lists-2', 'linked-lists-3', 'linked-lists-4', 'linked-lists-6', 'linked-lists-7',
    'stacks-queues-1', 'stacks-queues-2', 'stacks-queues-3', 'stacks-queues-4',
    'hashing-1', 'hashing-2', 'hashing-4', 'hashing-7',
    'trees-1', 'trees-2', 'trees-4', 'trees-5', 'trees-6',
    'heaps-tries-2', 'heaps-tries-6',
    'graphs-2', 'graphs-3', 'graphs-5',
    'sorting-searching-2', 'sorting-searching-4', 'sorting-searching-5',
    'recursion-1', 'recursion-2', 'recursion-4',
    'dp-2', 'dp-3',
    'greedy-bits-2', 'greedy-bits-4',
  ],
  'data-ml': [
    'complexity-1', 'complexity-3', 'complexity-4', 'complexity-7',
    'arrays-2', 'arrays-3', 'arrays-4', 'arrays-5', 'arrays-6',
    'linked-lists-4',
    'stacks-queues-7',
    'hashing-1', 'hashing-4', 'hashing-5', 'hashing-6',
    'trees-5', 'trees-6',
    'heaps-tries-1', 'heaps-tries-2', 'heaps-tries-3', 'heaps-tries-4', 'heaps-tries-5', 'heaps-tries-6', 'heaps-tries-7',
    'graphs-1', 'graphs-2', 'graphs-3', 'graphs-5', 'graphs-6', 'graphs-7',
    'sorting-searching-2', 'sorting-searching-3', 'sorting-searching-6', 'sorting-searching-7',
    'recursion-3', 'recursion-7',
    'dp-1', 'dp-2', 'dp-3', 'dp-4', 'dp-5', 'dp-6', 'dp-7',
    'greedy-bits-2', 'greedy-bits-4',
  ],
  'devops-sre': [
    'complexity-1', 'complexity-2', 'complexity-3', 'complexity-7',
    'arrays-2', 'arrays-4', 'arrays-5',
    'linked-lists-2', 'linked-lists-7',
    'stacks-queues-1', 'stacks-queues-2', 'stacks-queues-3', 'stacks-queues-7',
    'hashing-1', 'hashing-3', 'hashing-5', 'hashing-6', 'hashing-7',
    'trees-5', 'trees-6',
    'heaps-tries-2', 'heaps-tries-3', 'heaps-tries-4', 'heaps-tries-6',
    'graphs-1', 'graphs-2', 'graphs-3', 'graphs-4', 'graphs-5', 'graphs-6', 'graphs-7',
    'sorting-searching-2', 'sorting-searching-5', 'sorting-searching-7',
    'recursion-2',
    'greedy-bits-2', 'greedy-bits-4', 'greedy-bits-5', 'greedy-bits-6', 'greedy-bits-7',
  ],
  'embedded-quant': [
    'complexity-3', 'complexity-4', 'complexity-5', 'complexity-6',
    'arrays-1', 'arrays-3', 'arrays-5', 'arrays-6', 'arrays-7',
    'linked-lists-1', 'linked-lists-2', 'linked-lists-6', 'linked-lists-7',
    'stacks-queues-1', 'stacks-queues-5', 'stacks-queues-6', 'stacks-queues-7',
    'hashing-3', 'hashing-6', 'hashing-7',
    'heaps-tries-1', 'heaps-tries-2', 'heaps-tries-4', 'heaps-tries-5',
    'graphs-6', 'graphs-7',
    'sorting-searching-1', 'sorting-searching-2', 'sorting-searching-3', 'sorting-searching-5', 'sorting-searching-6', 'sorting-searching-7',
    'recursion-2', 'recursion-3', 'recursion-6',
    'dp-1', 'dp-2', 'dp-3', 'dp-5', 'dp-6', 'dp-7',
    'greedy-bits-1', 'greedy-bits-3', 'greedy-bits-5', 'greedy-bits-6', 'greedy-bits-7',
  ],
  senior: [
    'complexity-3', 'complexity-6', 'complexity-7',
    'arrays-4', 'arrays-6', 'arrays-7',
    'linked-lists-6', 'linked-lists-7',
    'stacks-queues-5', 'stacks-queues-6', 'stacks-queues-7',
    'hashing-3', 'hashing-5', 'hashing-6', 'hashing-7',
    'trees-4', 'trees-6', 'trees-7',
    'heaps-tries-4', 'heaps-tries-5', 'heaps-tries-6', 'heaps-tries-7',
    'graphs-4', 'graphs-5', 'graphs-6', 'graphs-7',
    'sorting-searching-3', 'sorting-searching-5', 'sorting-searching-6', 'sorting-searching-7',
    'recursion-6', 'recursion-7',
    'dp-3', 'dp-4', 'dp-5', 'dp-6', 'dp-7',
    'greedy-bits-2', 'greedy-bits-4',
  ],
}

for (const [roleId, ids] of Object.entries(ROLE_QUESTIONS)) {
  for (const id of ids) {
    if (INTERVIEW_ENRICHMENT[id]) {
      INTERVIEW_ENRICHMENT[id].roles = INTERVIEW_ENRICHMENT[id].roles || []
      if (!INTERVIEW_ENRICHMENT[id].roles.includes(roleId)) {
        INTERVIEW_ENRICHMENT[id].roles.push(roleId)
      }
    }
  }
}

/**
 * Resolves any user-typed job role string (e.g. "Android Developer", "SRE", "Quant", "Full Stack")
 * to the closest JOB_ROLES profile, or returns a synthesized profile for custom roles.
 */
export function resolveJobRole(input) {
  if (!input || input === 'all') return null
  const q = input.trim().toLowerCase()
  if (!q) return null

  // Exact ID or label match
  const exact = JOB_ROLES.find(
    (r) => r.id === q || r.label.toLowerCase() === q || r.shortLabel.toLowerCase() === q
  )
  if (exact) return exact

  // Keyword match
  const byKeyword = JOB_ROLES.find((r) =>
    r.keywords.some((kw) => q.includes(kw) || kw.includes(q)) ||
    r.label.toLowerCase().includes(q)
  )
  if (byKeyword) {
    return {
      ...byKeyword,
      customTitle: input.trim(),
    }
  }

  // Fallback for any other custom typed role (e.g. "QA Automation Engineer", "Blockchain Engineer")
  return {
    id: 'sde1',
    customTitle: input.trim(),
    label: input.trim(),
    shortLabel: input.trim(),
    focus: `Core algorithmic problem-solving for ${input.trim()}: arrays, hashing, trees, graphs, and clean time/space trade-offs.`,
    mustKnow: ['Arrays & Hash Maps', 'Two Pointers & Sliding Window', 'Trees & Graphs (BFS/DFS)', 'Heaps & Queues', 'Dynamic Programming'],
    targetMix: 'Core Easy, Medium & Hard Patterns',
  }
}

