// Comprehensive, real-world verified Practice Problem Bank across all DSA topics.
// Every topic and pattern guide receives complete Easy, Medium, and Hard practice
// problems with real LeetCode references, constraints, examples, hints, runnable
// Python solutions, and time/space complexity analysis.

export const PRACTICE_CATEGORIES = [
  {
    id: 'linear',
    label: 'Arrays, Strings & Linear',
    topics: [
      'Arrays',
      'Strings',
      'Linked List',
      'Stack',
      'Queue',
      'Deque',
      'Two Pointers',
      'Sliding Window',
      'Prefix Sum',
      'Monotonic Stack',
    ],
  },
  {
    id: 'trees-graphs',
    label: 'Trees, BSTs & Graphs',
    topics: [
      'Binary Tree',
      'Binary Tree Traversals',
      'Lowest Common Ancestor',
      'Binary Search Tree',
      'AVL Tree',
      'BFS',
      'DFS',
      'Graphs',
      'Topological Sort',
      'Union-Find',
    ],
  },
  {
    id: 'hashing-heaps-range',
    label: 'Hashing, Heaps, Tries & Range',
    topics: [
      'Hash Table',
      'Heap',
      'Trie',
      'Segment Tree',
      'Fenwick Tree',
      'LRU Cache',
      'Bloom Filter',
      'B+ Tree',
    ],
  },
  {
    id: 'sorting-searching-math',
    label: 'Sorting, Searching & Bitwise',
    topics: [
      'Binary Search',
      'Sorting',
      'Merge Sort',
      'Quick Sort',
      'Heap Sort',
      'Counting Sort',
      'Cyclic Sort',
      'Bit Manipulation',
      'Big O Notation',
      'Pointers',
    ],
  },
  {
    id: 'recursion-greedy-backtracking',
    label: 'Recursion, Backtracking & Greedy',
    topics: [
      'Recursion',
      'Divide and Conquer',
      'Backtracking',
      'Greedy',
      'Merge Intervals',
      "Kadane's Algorithm",
      'Quickselect',
      'Programming Basics',
    ],
  },
  {
    id: 'dp-advanced',
    label: 'Dynamic Programming & Advanced',
    topics: [
      'Dynamic Programming',
      'Knapsack Problem',
      'Longest Common Subsequence',
      'Longest Increasing Subsequence',
      'Edit Distance',
      'Coin Change',
      "Dijkstra's Algorithm",
      'Bellman-Ford',
      'Minimum Spanning Tree',
      'KMP Algorithm',
      "Tarjan's Algorithm",
    ],
  },
]

// Supplemental & complete practice problem sets keyed by guide ID / topic key.
// Merged with each guide's existing problems so every topic has rich Easy, Medium, and Hard sets.
export const EXTRA_PRACTICE_BY_ID = {
  // =========================================================================
  // 1. ARRAYS
  // =========================================================================
  arrays: [
    {
      difficulty: 'Easy',
      title: 'Two Sum (LC #1)',
      pattern: 'Hash Map Complement',
      leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
      companies: ['Amazon', 'Google', 'Meta', 'Apple', 'Microsoft'],
      statement: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.',
      input: 'nums: list[int], target: int',
      output: 'list[int] — two 0-based indices [i, j]',
      constraints: '2 <= nums.length <= 10^4, -10^9 <= nums[i], target <= 10^9',
      example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
      hint: 'Store each visited number and its index in a dictionary; before inserting x, check if target - x is already in the dictionary.',
      solution: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`,
      explanation: 'A single pass with O(1) hash-map lookups replaces the O(n²) brute-force pair scan.',
      complexity: 'O(n) time, O(n) space',
    },
    {
      difficulty: 'Easy',
      title: 'Best Time to Buy and Sell Stock (LC #121)',
      pattern: 'Running Minimum',
      leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
      companies: ['Amazon', 'Meta', 'Goldman Sachs', 'Microsoft'],
      statement: 'Given an array prices where prices[i] is the price of a stock on day i, maximize your profit by choosing a single day to buy and a later day to sell.',
      input: 'prices: list[int]',
      output: 'int — maximum profit (0 if no profit is possible)',
      constraints: '1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4',
      example: 'Input: prices = [7,1,5,3,6,4]\nOutput: 5 (buy at 1, sell at 6)',
      hint: 'Track the lowest price seen so far as you scan left to right, and test selling today against that lowest buy price.',
      solution: `def max_profit(prices: list[int]) -> int:
    min_price = float('inf')
    best = 0
    for p in prices:
        min_price = min(min_price, p)
        best = max(best, p - min_price)
    return best`,
      explanation: 'At each day i, the best single transaction ending on day i must have bought on the cheapest day in 0..i.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Easy',
      title: 'Move Zeroes (LC #283)',
      pattern: 'Read / Write Two Pointers',
      leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/',
      companies: ['Meta', 'Apple', 'Bloomberg'],
      statement: 'Given an integer array nums, move all 0s to the end of it in-place while maintaining the relative order of the non-zero elements.',
      input: 'nums: list[int]',
      output: 'nums mutated in-place',
      constraints: '1 <= nums.length <= 10^4',
      example: 'Input: nums = [0,1,0,3,12]\nOutput: [1,3,12,0,0]',
      hint: 'Maintain a `write` pointer for the next non-zero slot and swap whenever `nums[read] != 0`.',
      solution: `def move_zeroes(nums: list[int]) -> None:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1`,
      explanation: 'Every non-zero element is swapped forward into the next compacted index in a single pass.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Product of Array Except Self (LC #238)',
      pattern: 'Prefix & Suffix Products',
      leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
      companies: ['Amazon', 'Meta', 'Apple', 'Uber'],
      statement: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i], without using division and in O(n) time.',
      input: 'nums: list[int]',
      output: 'list[int]',
      constraints: '2 <= nums.length <= 10^5, -30 <= nums[i] <= 30',
      example: 'Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]',
      hint: 'First pass: write the product of all elements to the left of i into res[i]. Second pass: multiply by a running product from the right.',
      solution: `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]
    return res`,
      explanation: 'Each index i receives (nums[0]*...*nums[i-1]) * (nums[i+1]*...*nums[n-1]) using only two O(n) passes.',
      complexity: 'O(n) time, O(1) auxiliary space',
    },
    {
      difficulty: 'Medium',
      title: 'Rotate Array In-Place (LC #189)',
      pattern: 'Three-Step Reversal',
      leetcodeUrl: 'https://leetcode.com/problems/rotate-array/',
      companies: ['Microsoft', 'Amazon', 'Apple'],
      statement: 'Given an integer array nums, rotate the array to the right by k steps in-place using O(1) extra memory.',
      input: 'nums: list[int], k: int',
      output: 'nums rotated right by k steps',
      constraints: '1 <= nums.length <= 10^5, 0 <= k <= 10^5',
      example: 'Input: nums = [1,2,3,4,5,6,7], k = 3\nOutput: [5,6,7,1,2,3,4]',
      hint: 'Set k %= len(nums), reverse the entire array, reverse the first k elements, then reverse the remaining n - k elements.',
      solution: `def rotate(nums: list[int], k: int) -> None:
    n = len(nums)
    k %= n
    def rev(l: int, r: int) -> None:
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1; r -= 1
    rev(0, n - 1)
    rev(0, k - 1)
    rev(k, n - 1)`,
      explanation: 'Reversing the whole array brings the last k elements to the front in reverse order; reversing both slices restores their internal order.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Next Permutation (LC #31)',
      pattern: 'Rightmost Ascent Pivot',
      leetcodeUrl: 'https://leetcode.com/problems/next-permutation/',
      companies: ['Meta', 'Google', 'Adobe'],
      statement: 'Rearrange numbers into the lexicographically next greater permutation of numbers in-place. If such arrangement is not possible, rearrange it as the lowest possible order.',
      input: 'nums: list[int]',
      output: 'nums mutated in-place',
      constraints: '1 <= nums.length <= 100',
      example: 'Input: [1,2,3] → [1,3,2] | [3,2,1] → [1,2,3]',
      hint: '1) Find rightmost i with nums[i] < nums[i+1]. 2) Swap nums[i] with the smallest element > nums[i] to its right. 3) Reverse suffix i+1..n-1.',
      solution: `def next_permutation(nums: list[int]) -> None:
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    l, r = i + 1, len(nums) - 1
    while l < r:
        nums[l], nums[r] = nums[r], nums[l]
        l += 1; r -= 1`,
      explanation: 'The suffix after i is non-increasing, so reversing it after swapping the next larger pivot gives the smallest lexicographical increment.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Trapping Rain Water (LC #42)',
      pattern: 'Two Pointers Running Max',
      leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      companies: ['Amazon', 'Goldman Sachs', 'Google', 'Meta'],
      statement: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
      input: 'height: list[int]',
      output: 'int — total units of trapped water',
      constraints: '1 <= height.length <= 2 * 10^4',
      example: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6',
      hint: 'Water at index i is min(max_left, max_right) - height[i]. Advance whichever pointer has the smaller running max.',
      solution: `def trap(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    l_max = r_max = water = 0
    while l < r:
        if height[l] < height[r]:
            l_max = max(l_max, height[l])
            water += l_max - height[l]
            l += 1
        else:
            r_max = max(r_max, height[r])
            water += r_max - height[r]
            r -= 1
    return water`,
      explanation: 'The side with the smaller boundary is the bottleneck, so its trapped water can be finalized immediately in O(1) space.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'First Missing Positive (LC #41)',
      pattern: 'In-Place Cyclic Index Placement',
      leetcodeUrl: 'https://leetcode.com/problems/first-missing-positive/',
      companies: ['Amazon', 'Microsoft', 'PayPal'],
      statement: 'Given an unsorted integer array nums, return the smallest positive integer that is not present in nums. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.',
      input: 'nums: list[int]',
      output: 'int — smallest missing positive integer >= 1',
      constraints: '1 <= nums.length <= 10^5, -2^31 <= nums[i] <= 2^31 - 1',
      example: 'Input: nums = [3,4,-1,1]\nOutput: 2',
      hint: 'Place every value x in 1..n into index x - 1 by swapping; then the first index i where nums[i] != i + 1 gives the answer i + 1.',
      solution: `def first_missing_positive(nums: list[int]) -> int:
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            home = nums[i] - 1
            nums[i], nums[home] = nums[home], nums[i]
    for i, x in enumerate(nums):
        if x != i + 1:
            return i + 1
    return n + 1`,
      explanation: 'Each swap puts at least one number into its permanent home slot, so the inner while loop runs at most n times in total.',
      complexity: 'O(n) time, O(1) space',
    },
  ],

  // =========================================================================
  // 2. LINKED LIST
  // =========================================================================
  'linked-list': [
    {
      difficulty: 'Easy',
      title: 'Reverse Linked List (LC #206)',
      pattern: 'In-Place Three-Pointer Reversal',
      leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
      companies: ['Amazon', 'Microsoft', 'Apple', 'Meta'],
      statement: 'Given the head of a singly linked list, reverse the list in-place and return the reversed head.',
      input: 'head: Optional[ListNode]',
      output: 'Optional[ListNode]',
      constraints: '0 <= nodes <= 5000',
      example: 'Input: 1 -> 2 -> 3 -> 4 -> 5\nOutput: 5 -> 4 -> 3 -> 2 -> 1',
      hint: 'Keep `prev = None` and `curr = head`. Save `nxt = curr.next`, point `curr.next = prev`, then advance both.',
      solution: `def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      explanation: 'Each node’s next pointer is flipped once in O(1) space.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Easy',
      title: 'Linked List Cycle (LC #141)',
      pattern: "Floyd's Tortoise and Hare",
      leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/',
      companies: ['Amazon', 'Spotify', 'Microsoft'],
      statement: 'Given head, the head of a linked list, determine if the linked list has a cycle in it using O(1) memory.',
      input: 'head: Optional[ListNode]',
      output: 'bool',
      constraints: '0 <= nodes <= 10^4',
      example: 'Input: head = [3,2,0,-4], pos = 1\nOutput: true',
      hint: 'Move slow by 1 step and fast by 2 steps; if they ever point to the same node, a cycle exists.',
      solution: `def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
      explanation: 'Inside a cycle, the fast pointer closes the gap to the slow pointer by 1 node per step.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Easy',
      title: 'Merge Two Sorted Lists (LC #21)',
      pattern: 'Dummy Head Zipper Merge',
      leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
      companies: ['Amazon', 'Apple', 'Microsoft'],
      statement: 'Merge two sorted linked lists list1 and list2 into one sorted list by splicing together their nodes.',
      input: 'list1: Optional[ListNode], list2: Optional[ListNode]',
      output: 'Optional[ListNode]',
      constraints: '0 <= nodes <= 50',
      example: 'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]',
      hint: 'Create a dummy sentinel node and attach whichever front node is smaller each step.',
      solution: `def merge_two_lists(l1, l2):
    dummy = tail = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
      explanation: 'A dummy head avoids special-casing the first node; the leftover tail attaches in O(1).',
      complexity: 'O(m + n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Remove Nth Node From End of List (LC #19)',
      pattern: 'Constant-Gap Two Pointers',
      leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
      companies: ['Meta', 'Amazon', 'Google'],
      statement: 'Given the head of a linked list, remove the n-th node from the end of the list and return its head in one pass.',
      input: 'head: ListNode, n: int',
      output: 'Optional[ListNode]',
      constraints: '1 <= sz <= 30, 1 <= n <= sz',
      example: 'Input: head = [1,2,3,4,5], n = 2\nOutput: [1,2,3,5]',
      hint: 'Advance `fast` n steps ahead of `slow` (starting from a dummy node), then move both until `fast.next` is None.',
      solution: `def remove_nth_from_end(head, n: int):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next`,
      explanation: 'Keeping a gap of n nodes puts `slow` right before the node to delete when `fast` hits the tail.',
      complexity: 'O(L) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Reorder List (LC #143)',
      pattern: 'Middle + Reverse + Interleave',
      leetcodeUrl: 'https://leetcode.com/problems/reorder-list/',
      companies: ['Meta', 'Amazon', 'Microsoft'],
      statement: 'Given L0 → L1 → … → Ln-1 → Ln, reorder it in-place to L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …',
      input: 'head: ListNode',
      output: 'head reordered in-place',
      constraints: '1 <= nodes <= 5 * 10^4',
      example: 'Input: [1,2,3,4,5]\nOutput: [1,5,2,4,3]',
      hint: '1) Find the middle with slow/fast pointers. 2) Reverse the second half. 3) Zipper-merge the two halves.',
      solution: `def reorder_list(head) -> None:
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev, curr = None, slow.next
    slow.next = None
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    first, second = head, prev
    while second:
        t1, t2 = first.next, second.next
        first.next = second
        second.next = t1
        first, second = t1, t2`,
      explanation: 'Combines the three classic linked-list primitives (middle, reverse, merge) in O(n) time and O(1) space.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Reverse Nodes in k-Group (LC #25)',
      pattern: 'Group Splicing & Reversal',
      leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/',
      companies: ['Amazon', 'Microsoft', 'ByteDance', 'Google'],
      statement: 'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list. Nodes left over at the end (< k) remain as-is.',
      input: 'head: ListNode, k: int',
      output: 'ListNode',
      constraints: '1 <= k <= n <= 5000',
      example: 'Input: head = [1,2,3,4,5], k = 2\nOutput: [2,1,4,3,5]',
      hint: 'Check if k nodes remain ahead; if so, reverse those k nodes in-place and connect the previous group tail to the new group head.',
      solution: `def reverse_k_group(head, k: int):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, curr = group_next, group_prev.next
        while curr is not group_next:
            nxt = curr.next
            curr.next = prev
            prev, curr = curr, nxt
        tail = group_prev.next
        group_prev.next = kth
        group_prev = tail`,
      explanation: 'Pointing the reversed group’s initial `prev` directly to `group_next` stitches the suffix automatically.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Merge k Sorted Lists (LC #23)',
      pattern: 'Min-Heap Frontier / Divide & Conquer',
      leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
      companies: ['Amazon', 'Meta', 'Google', 'Uber'],
      statement: 'You are given an array of k linked-lists lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list.',
      input: 'lists: list[Optional[ListNode]]',
      output: 'Optional[ListNode]',
      constraints: '0 <= k <= 10^4, total nodes N <= 10^4',
      example: 'Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]',
      hint: 'Push the head of each non-empty list into a min-heap as `(node.val, idx, node)`.',
      solution: `import heapq

def merge_k_lists(lists):
    pq = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(pq, (node.val, i, node))
    dummy = tail = ListNode(0)
    while pq:
        _, i, node = heapq.heappop(pq)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(pq, (node.next.val, i, node.next))
    return dummy.next`,
      explanation: 'The heap holds at most k nodes at any time, extracting each of the N total nodes in O(log k) time.',
      complexity: 'O(N log k) time, O(k) space',
    },
  ],

  // =========================================================================
  // 3. POINTERS & REFERENCES
  // =========================================================================
  pointers: [
    {
      difficulty: 'Easy',
      title: 'In-Place Array Reverse via Two Index Pointers',
      pattern: 'Converging Pointers',
      statement: 'Given a mutable character list s, reverse it in-place with O(1) extra memory by swapping through left and right references.',
      input: 's: list[str]',
      output: 's reversed in-place',
      constraints: '1 <= len(s) <= 10^5',
      example: 'Input: ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
      hint: 'Swap s[left] and s[right] while left < right.',
      solution: `def reverse_string(s: list[str]) -> None:
    l, r = 0, len(s) - 1
    while l < r:
        s[l], s[r] = s[r], s[l]
        l += 1
        r -= 1`,
      explanation: 'Mutating the list indices modifies the underlying heap object directly without allocating a new array.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Easy',
      title: 'Delete Node in a Singly Linked List Given Only a Node Reference (LC #237)',
      pattern: 'Value Copy + Reference Bypass',
      leetcodeUrl: 'https://leetcode.com/problems/delete-node-in-a-linked-list/',
      companies: ['Apple', 'Microsoft', 'Amazon'],
      statement: 'You are given a reference to a `node` to be deleted in a singly linked list (not the tail), without access to `head`. Delete the node in O(1) time.',
      input: 'node: ListNode',
      output: 'List mutated in-place',
      constraints: '2 <= nodes <= 1000, node is not the tail',
      example: 'Input: head = [4,5,1,9], node = 5\nOutput: [4,1,9]',
      hint: 'Since you cannot reach the previous node, copy `node.next.val` into `node.val` and bypass `node.next`.',
      solution: `def delete_node(node) -> None:
    node.val = node.next.val
    node.next = node.next.next`,
      explanation: 'Demonstrates the difference between rebinding a local variable vs mutating the fields of a referenced heap object.',
      complexity: 'O(1) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Copy List with Random Pointer (LC #138)',
      pattern: 'Interleaved Node Aliasing / Hash Map',
      leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
      companies: ['Amazon', 'Meta', 'Bloomberg', 'Microsoft'],
      statement: 'Construct a deep copy of a linked list where each node has a `next` pointer and a `random` pointer that can point to any node in the list or null.',
      input: 'head: Optional[Node]',
      output: 'Optional[Node] — independent deep clone',
      constraints: '0 <= n <= 1000',
      example: 'Input: [[7,null],[13,0],[11,4],[10,2],[1,0]]\nOutput: Deep copy with identical topology',
      hint: 'Interleave cloned nodes right after each original node (`orig -> clone -> next`), wire `clone.random = orig.random.next`, then unzip.',
      solution: `def copy_random_list(head):
    if not head:
        return None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = Node(cur.val, nxt, None)
        cur = nxt
    cur = head
    while cur:
        if cur.random:
            cur.next.random = cur.random.next
        cur = cur.next.next
    dummy = tail = Node(0)
    cur = head
    while cur:
        clone = cur.next
        cur.next = clone.next
        tail.next = clone
        tail = clone
        cur = cur.next
    return dummy.next`,
      explanation: 'Placing each clone at `orig.next` gives an O(1) pointer path from any original node to its clone without a hash map.',
      complexity: 'O(n) time, O(1) auxiliary space',
    },
    {
      difficulty: 'Hard',
      title: 'Find the Duplicate Number via Pointer Cycle Detection (LC #287)',
      pattern: "Floyd's Cycle Detection on Implicit Pointer Graph",
      leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/',
      companies: ['Amazon', 'Google', 'Meta'],
      statement: 'Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n], return the repeated number without modifying the array and using only O(1) extra space.',
      input: 'nums: list[int]',
      output: 'int — the duplicate value',
      constraints: '1 <= n <= 10^5, nums.length == n + 1',
      example: 'Input: nums = [1,3,4,2,2]\nOutput: 2',
      hint: 'Treat `i -> nums[i]` as a next-pointer in a linked list; a duplicate value means two indices point to the same target, creating a cycle.',
      solution: `def find_duplicate(nums: list[int]) -> int:
    slow = nums[0]
    fast = nums[nums[0]]
    while slow != fast:
        slow = nums[slow]
        fast = nums[nums[fast]]
    slow = 0
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,
      explanation: 'Phase 1 finds the meeting point inside the cycle; Phase 2 resets one pointer to 0 and advances both at 1x speed to meet at the cycle entrance (the duplicate).',
      complexity: 'O(n) time, O(1) space',
    },
  ],

  // =========================================================================
  // 4. SUPPLEMENTS FOR BUILT-IN PATTERN & ENCYCLOPEDIA GUIDES
  // =========================================================================
  'two-pointers': [
    {
      difficulty: 'Easy',
      title: 'Two Sum II - Input Array Is Sorted (LC #167)',
      pattern: 'Opposite-End Pointers',
      leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
      companies: ['Amazon', 'Apple', 'Google'],
      statement: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers that add up to target using O(1) extra space.',
      example: 'Input: numbers = [2,7,11,15], target = 9\nOutput: [1,2]',
      hint: 'Start `l = 0, r = n - 1`; if sum < target increment l, if sum > target decrement r.',
      solution: `def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1
    return []`,
      explanation: 'Sorted order guarantees moving left increases the sum and moving right decreases it.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: '3Sum (LC #15)',
      pattern: 'Sort + Two Pointers with Deduplication',
      leetcodeUrl: 'https://leetcode.com/problems/3sum/',
      companies: ['Meta', 'Amazon', 'Google', 'Apple'],
      statement: 'Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0.',
      example: 'Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]',
      hint: 'Sort the array, fix `nums[i]`, and run Two Pointers on `i+1..n-1`, skipping duplicate values.',
      solution: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1; r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return res`,
      explanation: 'Sorting allows both O(n) two-pointer inner search and O(1) adjacent duplicate skipping.',
      complexity: 'O(n²) time, O(1) auxiliary space',
    },
    {
      difficulty: 'Hard',
      title: 'Trapping Rain Water (LC #42)',
      pattern: 'Converging Height Boundaries',
      leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      companies: ['Amazon', 'Goldman Sachs', 'Google'],
      statement: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
      example: 'Input: [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6',
      hint: 'Maintain `l_max` and `r_max`; always advance the side with the smaller boundary.',
      solution: `def trap(height: list[int]) -> int:
    l, r = 0, len(height) - 1
    l_max = r_max = water = 0
    while l < r:
        if height[l] < height[r]:
            l_max = max(l_max, height[l])
            water += l_max - height[l]
            l += 1
        else:
            r_max = max(r_max, height[r])
            water += r_max - height[r]
            r -= 1
    return water`,
      explanation: 'Two pointers compute trapped water in a single pass without prefix/suffix arrays.',
      complexity: 'O(n) time, O(1) space',
    },
  ],

  'sliding-window': [
    {
      difficulty: 'Easy',
      title: 'Contains Duplicate II — Within Window k (LC #219)',
      pattern: 'Fixed-Size Sliding Hash Set',
      leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate-ii/',
      companies: ['Meta', 'Google', 'Palantir'],
      statement: 'Given an integer array nums and an integer k, return true if there are two distinct indices i and j such that nums[i] == nums[j] and abs(i - j) <= k.',
      example: 'Input: nums = [1,2,3,1], k = 3\nOutput: true',
      hint: 'Maintain a set of at most k recent elements; remove `nums[i - k]` as the window slides.',
      solution: `def contains_nearby_duplicate(nums: list[int], k: int) -> bool:
    window = set()
    for i, x in enumerate(nums):
        if x in window:
            return True
        window.add(x)
        if len(window) > k:
            window.remove(nums[i - k])
    return False`,
      explanation: 'The set holds only the last k elements, checking duplicates in O(1) average time.',
      complexity: 'O(n) time, O(min(n, k)) space',
    },
    {
      difficulty: 'Medium',
      title: 'Longest Repeating Character Replacement (LC #424)',
      pattern: 'Variable Window with Max-Frequency Count',
      leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
      companies: ['Google', 'Amazon', 'Uber'],
      statement: 'Given a string s and an integer k, you can replace at most k characters in a substring so all characters in it become identical. Return the maximum valid substring length.',
      example: 'Input: s = "AABABBA", k = 1\nOutput: 4',
      hint: 'A window is valid when `(right - left + 1) - max_freq <= k`.',
      solution: `def character_replacement(s: str, k: int) -> int:
    count = {}
    left = max_f = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        max_f = max(max_f, count[ch])
        if (right - left + 1) - max_f > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      explanation: 'Replacements needed equals window length minus the frequency of the majority character.',
      complexity: 'O(n) time, O(26) = O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Minimum Window Substring (LC #76)',
      pattern: 'Expand-to-Satisfy, Shrink-to-Minimize Window',
      leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/',
      companies: ['Meta', 'Airbnb', 'LinkedIn', 'Amazon'],
      statement: 'Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window, or "" if none exists.',
      example: 'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"',
      hint: 'Track how many distinct required characters have met their target frequency (`have == need`), then shrink from the left.',
      solution: `from collections import Counter

def min_window(s: str, t: str) -> str:
    if not t or not s:
        return ""
    need = Counter(t)
    window = {}
    have, required = 0, len(need)
    best = (float("inf"), 0, 0)
    l = 0
    for r, ch in enumerate(s):
        window[ch] = window.get(ch, 0) + 1
        if ch in need and window[ch] == need[ch]:
            have += 1
        while have == required:
            if r - l + 1 < best[0]:
                best = (r - l + 1, l, r)
            out = s[l]
            window[out] -= 1
            if out in need and window[out] < need[out]:
                have -= 1
            l += 1
    return "" if best[0] == float("inf") else s[best[1]:best[2] + 1]`,
      explanation: 'Both pointers move forward at most n times while `have` tracks satisfied character counts in O(1).',
      complexity: 'O(|s| + |t|) time, O(|s| + |t|) space',
    },
  ],

  'prefix-sum': [
    {
      difficulty: 'Easy',
      title: 'Find Pivot Index (LC #724)',
      pattern: 'Total Sum Minus Running Prefix',
      leetcodeUrl: 'https://leetcode.com/problems/find-pivot-index/',
      companies: ['Amazon', 'Apple', 'Goldman Sachs'],
      statement: 'Given an array of integers nums, return the leftmost pivot index where the sum of all numbers strictly to the left equals the sum of all numbers strictly to the right.',
      example: 'Input: nums = [1,7,3,6,5,6]\nOutput: 3 (1+7+3 = 11 == 5+6)',
      hint: 'Right sum is `total - left_sum - nums[i]`.',
      solution: `def pivot_index(nums: list[int]) -> int:
    total = sum(nums)
    left = 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1`,
      explanation: 'Knowing the total sum lets you compute the right sum in O(1) at every index.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Contiguous Array — Equal 0s and 1s (LC #525)',
      pattern: 'Prefix Balance + First-Seen Index Map',
      leetcodeUrl: 'https://leetcode.com/problems/contiguous-array/',
      companies: ['Meta', 'Google', 'Amazon'],
      statement: 'Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1.',
      example: 'Input: nums = [0,1,0]\nOutput: 2',
      hint: 'Treat 0 as -1 and 1 as +1; two indices with the same running prefix sum bound a zero-sum subarray.',
      solution: `def find_max_length(nums: list[int]) -> int:
    first = {0: -1}
    bal = best = 0
    for i, x in enumerate(nums):
        bal += 1 if x == 1 else -1
        if bal in first:
            best = max(best, i - first[bal])
        else:
            first[bal] = i
    return best`,
      explanation: 'Storing only the earliest index for each balance maximizes the span `i - first[bal]`.',
      complexity: 'O(n) time, O(n) space',
    },
    {
      difficulty: 'Hard',
      title: 'Number of Submatrices That Sum to Target (LC #1074)',
      pattern: '2D Prefix Compression + 1D Subarray Sum K',
      leetcodeUrl: 'https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/',
      companies: ['Google', 'DoorDash', 'ByteDance'],
      statement: 'Given a matrix and a target, return the number of non-empty submatrices that sum to target.',
      example: 'Input: matrix = [[0,1,0],[1,1,1],[0,1,0]], target = 0\nOutput: 4',
      hint: 'Fix the top and bottom rows `r1..r2`, collapse column sums into a 1D array, and count subarrays summing to target via a prefix hash map.',
      solution: `from collections import defaultdict

def num_submatrix_sum_target(matrix: list[list[int]], target: int) -> int:
    R, C = len(matrix), len(matrix[0])
    ans = 0
    for r1 in range(R):
        col = [0] * C
        for r2 in range(r1, R):
            seen = defaultdict(int, {0: 1})
            cur = 0
            for c in range(C):
                col[c] += matrix[r2][c]
                cur += col[c]
                ans += seen[cur - target]
                seen[cur] += 1
    return ans`,
      explanation: 'Reduces O(R²·C²) rectangle enumeration to O(R²·C) by applying 1D prefix-sum hashing across columns.',
      complexity: 'O(R² · C) time, O(C) space',
    },
  ],

  'binary-search': [
    {
      difficulty: 'Easy',
      title: 'First Bad Version (LC #278)',
      pattern: 'Monotonic Boundary Binary Search',
      leetcodeUrl: 'https://leetcode.com/problems/first-bad-version/',
      companies: ['Meta', 'Google', 'Microsoft'],
      statement: 'Suppose you have n versions [1..n] and an API `isBadVersion(version)` where all versions after a bad version are also bad. Find the first bad version minimizing API calls.',
      example: 'Input: n = 5, bad = 4\nOutput: 4',
      hint: 'Maintain `[lo, hi]` where `hi` is always known-bad; if `isBadVersion(mid)` is true, set `hi = mid`, else `lo = mid + 1`.',
      solution: `def first_bad_version(n: int, is_bad_version) -> int:
    lo, hi = 1, n
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if is_bad_version(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      explanation: 'Finds the exact false-to-true transition boundary in log₂(n) queries.',
      complexity: 'O(log n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'Search in Rotated Sorted Array (LC #33)',
      pattern: 'Sorted-Half Identification',
      leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
      companies: ['Meta', 'Amazon', 'Microsoft', 'LinkedIn'],
      statement: 'Given a sorted array of distinct integers rotated at an unknown pivot and a target value, return its index in O(log n) time, or -1 if absent.',
      example: 'Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4',
      hint: 'At least one of the two halves `[lo..mid]` or `[mid..hi]` is strictly sorted; check if target lies inside the sorted half.',
      solution: `def search_rotated(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      explanation: 'Comparing `nums[lo] <= nums[mid]` tells us which half has no rotation pivot, allowing a clean range check.',
      complexity: 'O(log n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Split Array Largest Sum (LC #410)',
      pattern: 'Binary Search on Answer + Greedy Feasibility',
      leetcodeUrl: 'https://leetcode.com/problems/split-array-largest-sum/',
      companies: ['Google', 'Amazon', 'ByteDance'],
      statement: 'Given an integer array nums and an integer k, split nums into k non-empty contiguous subarrays such that the largest sum among these k subarrays is minimized.',
      example: 'Input: nums = [7,2,5,10,8], k = 2\nOutput: 18 (split [7,2,5] and [10,8])',
      hint: 'Binary search the maximum allowed subarray sum in `[max(nums), sum(nums)]`.',
      solution: `def split_array(nums: list[int], k: int) -> int:
    def can_split(limit: int) -> bool:
        parts, cur = 1, 0
        for x in nums:
            if cur + x > limit:
                parts += 1
                cur = x
            else:
                cur += x
        return parts <= k

    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_split(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      explanation: 'If a cap `limit` is feasible with ≤ k splits, any larger cap is also feasible — monotonic for binary search.',
      complexity: 'O(n log(sum(nums))) time, O(1) space',
    },
  ],

  bfs: [
    {
      difficulty: 'Hard',
      title: 'Word Ladder (LC #127)',
      pattern: 'Unweighted State-Space Shortest Path BFS',
      leetcodeUrl: 'https://leetcode.com/problems/word-ladder/',
      companies: ['Amazon', 'Meta', 'Google', 'LinkedIn'],
      statement: 'Given beginWord, endWord, and a wordList, return the number of words in the shortest transformation sequence changing one letter at a time, or 0 if impossible.',
      example: 'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5 ("hit" -> "hot" -> "dot" -> "dog" -> "cog")',
      hint: 'Run BFS from beginWord; generate 26 single-letter neighbors at each position and remove matched words from the set.',
      solution: `from collections import deque

def ladder_length(begin: str, end: str, word_list: list[str]) -> int:
    words = set(word_list)
    if end not in words:
        return 0
    q = deque([(begin, 1)])
    while q:
        w, steps = q.popleft()
        if w == end:
            return steps
        for i in range(len(w)):
            for c in "abcdefghijklmnopqrstuvwxyz":
                nw = w[:i] + c + w[i + 1:]
                if nw in words:
                    words.remove(nw)
                    q.append((nw, steps + 1))
    return 0`,
      explanation: 'Every word transition has weight 1, so the first time BFS reaches endWord is guaranteed to be the shortest sequence.',
      complexity: 'O(N · L · 26) time, O(N · L) space',
    },
  ],

  dfs: [
    {
      difficulty: 'Easy',
      title: 'Flood Fill (LC #733)',
      pattern: '4-Directional Grid DFS',
      leetcodeUrl: 'https://leetcode.com/problems/flood-fill/',
      companies: ['Amazon', 'Microsoft', 'Palantir'],
      statement: 'Starting from pixel (sr, sc), recolor all 4-directionally connected pixels of the same original color to `color`.',
      example: 'Input: image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]',
      hint: 'Return early if `image[sr][sc] == color` so you never recurse infinitely.',
      solution: `def flood_fill(image: list[list[int]], sr: int, sc: int, color: int):
    orig = image[sr][sc]
    if orig == color:
        return image
    R, C = len(image), len(image[0])
    def dfs(r: int, c: int):
        if 0 <= r < R and 0 <= c < C and image[r][c] == orig:
            image[r][c] = color
            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                dfs(r + dr, c + dc)
    dfs(sr, sc)
    return image`,
      explanation: 'Changing the pixel color to `color` immediately marks it visited.',
      complexity: 'O(R · C) time, O(R · C) space',
    },
    {
      difficulty: 'Hard',
      title: 'Longest Increasing Path in a Matrix (LC #329)',
      pattern: 'DAG DFS + Memoization',
      leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/',
      companies: ['Google', 'DoorDash', 'Meta'],
      statement: 'Given an m x n integers matrix, return the length of the longest strictly increasing 4-directional path.',
      example: 'Input: [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4 (path 1 -> 2 -> 6 -> 9)',
      hint: 'Strictly increasing edges cannot form cycles (it is a DAG), so DFS + memoization computes each cell once.',
      solution: `def longest_increasing_path(matrix: list[list[int]]) -> int:
    R, C = len(matrix), len(matrix[0])
    memo = [[0] * C for _ in range(R)]
    def dfs(r: int, c: int) -> int:
        if memo[r][c]:
            return memo[r][c]
        best = 1
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[r][c] = best
        return best
    return max(dfs(r, c) for r in range(R) for c in range(C))`,
      explanation: 'Each cell’s longest path is computed once and cached, visiting every grid cell and edge O(1) times.',
      complexity: 'O(R · C) time, O(R · C) space',
    },
  ],

  'union-find': [
    {
      difficulty: 'Easy',
      title: 'Find if Path Exists in Graph (LC #1971)',
      pattern: 'Disjoint Set Connectivity Check',
      leetcodeUrl: 'https://leetcode.com/problems/find-if-path-exists-in-graph/',
      companies: ['Amazon', 'Microsoft', 'Google'],
      statement: 'Given n vertices, an edge list, a source, and a destination, return true if there is a valid path from source to destination.',
      example: 'Input: n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2\nOutput: true',
      hint: 'Union the endpoints of every edge, then check `find(source) == find(destination)`.',
      solution: `def valid_path(n: int, edges: list[list[int]], source: int, destination: int) -> bool:
    parent = list(range(n))
    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for u, v in edges:
        parent[find(u)] = find(v)
    return find(source) == find(destination)`,
      explanation: 'Two vertices have a path between them in an undirected graph iff they belong to the same connected component.',
      complexity: 'O((V + E) · α(V)) time, O(V) space',
    },
    {
      difficulty: 'Hard',
      title: 'Making A Large Island (LC #827)',
      pattern: 'Component Size Labeling + Neighbor Union',
      leetcodeUrl: 'https://leetcode.com/problems/making-a-large-island/',
      companies: ['Meta', 'Google', 'Amazon'],
      statement: 'You are given an n x n binary matrix grid. You are allowed to change at most one 0 to be 1. Return the size of the largest island in grid after applying this operation.',
      example: 'Input: grid = [[1,0],[0,1]]\nOutput: 3',
      hint: 'Label each existing island with a unique ID (>= 2) and record its area; then for each 0 cell, sum the areas of its distinct neighboring island IDs.',
      solution: `def largest_island(grid: list[list[int]]) -> int:
    n = len(grid)
    area = {0: 0}
    uid = 2
    def dfs(r: int, c: int, i: int) -> int:
        if not (0 <= r < n and 0 <= c < n) or grid[r][c] != 1:
            return 0
        grid[r][c] = i
        return 1 + dfs(r+1,c,i) + dfs(r-1,c,i) + dfs(r,c+1,i) + dfs(r,c-1,i)
    for r in range(n):
        for c in range(n):
            if grid[r][c] == 1:
                area[uid] = dfs(r, c, uid)
                uid += 1
    best = max(area.values())
    for r in range(n):
        for c in range(n):
            if grid[r][c] == 0:
                seen = {grid[nr][nc] for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)) if 0 <= nr < n and 0 <= nc < n}
                best = max(best, 1 + sum(area[i] for i in seen))
    return best`,
      explanation: 'Precomputing component IDs lets each candidate 0-flip merge up to 4 neighboring components in O(1) time.',
      complexity: 'O(n²) time, O(n²) space',
    },
  ],

  'topological-sort': [
    {
      difficulty: 'Easy',
      title: 'Verify Prerequisite Chain (DAG In-Degree Check)',
      pattern: 'Zero In-Degree Entry Point',
      statement: 'Given n tasks (0..n-1) and directed dependencies [u, v] (u before v), return all tasks that have zero prerequisites and can be started immediately.',
      example: 'Input: n = 4, edges = [[0,1],[0,2],[1,3]]\nOutput: [0]',
      hint: 'Count in-degrees for each vertex and return all vertices with `indegree[v] == 0`.',
      solution: `def starter_tasks(n: int, edges: list[list[int]]) -> list[int]:
    indeg = [0] * n
    for u, v in edges:
        indeg[v] += 1
    return [i for i in range(n) if indeg[i] == 0]`,
      explanation: 'Finding all in-degree-0 vertices is the initialization step of Kahn’s topological sort algorithm.',
      complexity: 'O(V + E) time, O(V) space',
    },
    {
      difficulty: 'Hard',
      title: 'Alien Dictionary (LC #269)',
      pattern: 'Adjacent Word Diff + Topological Sort',
      leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/',
      companies: ['Meta', 'Airbnb', 'Google', 'Amazon'],
      statement: 'Given a list of words sorted lexicographically in an unknown alien language, derive the order of letters in that alphabet, or return "" if the ordering is invalid.',
      example: 'Input: ["wrt","wrf","er","ett","rftt"]\nOutput: "wertf"',
      hint: 'Compare each adjacent pair of words to find their first differing character `c1 != c2`, add directed edge `c1 -> c2`, and run Kahn’s algorithm.',
      solution: `from collections import deque

def alien_order(words: list[str]) -> str:
    adj = {c: set() for w in words for c in w}
    indeg = {c: 0 for c in adj}
    for w1, w2 in zip(words, words[1:]):
        if len(w1) > len(w2) and w1.startswith(w2):
            return ""
        for c1, c2 in zip(w1, w2):
            if c1 != c2:
                if c2 not in adj[c1]:
                    adj[c1].add(c2)
                    indeg[c2] += 1
                break
    q = deque(c for c, d in indeg.items() if d == 0)
    res = []
    while q:
        u = q.popleft()
        res.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return "".join(res) if len(res) == len(indeg) else ""`,
      explanation: 'Remember the invalid prefix edge case (`["abc", "ab"]`) and cycle check (`len(res) < len(indeg)`).',
      complexity: 'O(total characters) time, O(U) space',
    },
  ],

  heap: [
    {
      difficulty: 'Hard',
      title: 'Find Median from Data Stream (LC #295)',
      pattern: 'Two Heaps (Max-Heap Left + Min-Heap Right)',
      leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/',
      companies: ['Amazon', 'Google', 'Meta', 'Apple'],
      statement: 'Design a data structure that supports `addNum(num)` from a data stream and `findMedian()` of all elements seen so far.',
      example: 'addNum(1), addNum(2), findMedian() → 1.5, addNum(3), findMedian() → 2.0',
      hint: 'Keep the smaller half in a Max-Heap `small` and the larger half in a Min-Heap `large`, balanced within 1 element.',
      solution: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap (negated)
        self.large = []  # min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2.0`,
      explanation: 'Routing each new number through both heaps maintains both order (`max(small) <= min(large)`) and size balance in O(log n).',
      complexity: 'O(log n) addNum, O(1) findMedian',
    },
  ],

  trie: [
    {
      difficulty: 'Hard',
      title: 'Word Search II (LC #212)',
      pattern: 'Trie + Grid Backtracking with Pruning',
      leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/',
      companies: ['Amazon', 'Uber', 'Microsoft', 'Cisco'],
      statement: 'Given an m x n board of characters and a list of strings words, return all words from the list that can be formed by sequentially adjacent cells on the board.',
      example: 'Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]\nOutput: ["eat","oath"]',
      hint: 'Insert all words into a Trie and walk the board and Trie simultaneously so dead prefixes are pruned immediately.',
      solution: `def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    trie = {}
    for w in words:
        node = trie
        for ch in w:
            node = node.setdefault(ch, {})
        node["#"] = w
    R, C = len(board), len(board[0])
    res = []
    def dfs(r: int, c: int, parent: dict):
        ch = board[r][c]
        node = parent[ch]
        if "#" in node:
            res.append(node.pop("#"))
        board[r][c] = "*"
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] in node:
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)
    for r in range(R):
        for c in range(C):
            if board[r][c] in trie:
                dfs(r, c, trie)
    return res`,
      explanation: 'Sharing prefixes in the Trie and pruning empty leaf branches (`parent.pop(ch)`) avoids re-searching words.',
      complexity: 'O(R · C · 4 · 3^(L-1)) time, O(total word chars) space',
    },
  ],

  backtracking: [
    {
      difficulty: 'Easy',
      title: 'Binary Watch / Generate Binary Strings of Length N',
      pattern: 'Choice / Undo Recursion Tree',
      statement: 'Given an integer n, generate all binary strings of length n that do not contain two consecutive "1"s.',
      example: 'Input: n = 3\nOutput: ["000","001","010","100","101"]',
      hint: 'Always allow appending "0"; only allow appending "1" if the previous character was not "1".',
      solution: `def valid_binary_strings(n: int) -> list[str]:
    res, path = [], []
    def backtrack():
        if len(path) == n:
            res.append("".join(path))
            return
        path.append("0")
        backtrack()
        path.pop()
        if not path or path[-1] != "1":
            path.append("1")
            backtrack()
            path.pop()
    backtrack()
    return res`,
      explanation: 'Pruning invalid "11" branches before recursing visits only valid prefixes.',
      complexity: 'O(n · Fib(n)) time, O(n) stack space',
    },
  ],

  'dynamic-programming': [
    {
      difficulty: 'Easy',
      title: 'Min Cost Climbing Stairs (LC #746)',
      pattern: '1D Rolling-State DP',
      leetcodeUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/',
      companies: ['Amazon', 'Bloomberg', 'Apple'],
      statement: 'Given cost[i] on step i, you can start at index 0 or 1 and climb 1 or 2 steps after paying cost[i]. Return the minimum cost to reach the top (index n).',
      example: 'Input: cost = [10,15,20]\nOutput: 15',
      hint: 'dp[i] = cost[i] + min(dp[i-1], dp[i-2]).',
      solution: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    a, b = cost[0], cost[1]
    for c in cost[2:]:
        a, b = b, c + min(a, b)
    return min(a, b)`,
      explanation: 'Only the previous two step costs are needed at any step.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Medium',
      title: 'House Robber (LC #198)',
      pattern: 'Skip-or-Take Recurrence',
      leetcodeUrl: 'https://leetcode.com/problems/house-robber/',
      companies: ['Amazon', 'Google', 'Cisco'],
      statement: 'Given money in each house along a street, you cannot rob two adjacent houses. Return the maximum amount you can rob tonight.',
      example: 'Input: nums = [2,7,9,3,1]\nOutput: 12 (2 + 9 + 1)',
      hint: 'At house x, transition `(prev2, prev1) -> (prev1, max(prev1, prev2 + x))`.',
      solution: `def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
      explanation: 'Either skip house i (`prev1`) or rob house i and add it to the best answer up to i - 2 (`prev2 + x`).',
      complexity: 'O(n) time, O(1) space',
    },
  ],

  'bit-manipulation': [
    {
      difficulty: 'Hard',
      title: 'Maximum XOR of Two Numbers in an Array (LC #421)',
      pattern: 'Bitwise Prefix Mask / Binary Trie',
      leetcodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/',
      companies: ['Google', 'Amazon', 'ByteDance'],
      statement: 'Given an integer array nums, return the maximum result of `nums[i] XOR nums[j]`, where 0 <= i <= j < n.',
      example: 'Input: nums = [3,10,5,25,2,8]\nOutput: 28 (5 XOR 25)',
      hint: 'Build the answer from most-significant bit (30) down to 0, using a hash set of prefixes and the identity `a ^ b = target <=> a = target ^ b`.',
      solution: `def find_maximum_xor(nums: list[int]) -> int:
    ans = mask = 0
    for bit in range(30, -1, -1):
        mask |= 1 << bit
        prefixes = {x & mask for x in nums}
        candidate = ans | (1 << bit)
        if any((candidate ^ p) in prefixes for p in prefixes):
            ans = candidate
    return ans`,
      explanation: 'Greedily tries to set each bit from MSB to LSB in O(n) per bit using Two-Sum XOR lookup.',
      complexity: 'O(31 · n) = O(n) time, O(n) space',
    },
  ],

  'monotonic-stack': [
    {
      difficulty: 'Easy',
      title: 'Next Greater Element I (LC #496)',
      pattern: 'Decreasing Stack + Hash Map',
      leetcodeUrl: 'https://leetcode.com/problems/next-greater-element-i/',
      companies: ['Amazon', 'Bloomberg', 'Google'],
      statement: 'For each element in nums1 (a subset of nums2), find the first greater element to its right in nums2, or -1 if none exists.',
      example: 'Input: nums1 = [4,1,2], nums2 = [1,3,4,2]\nOutput: [-1,3,-1]',
      hint: 'Run a monotonic decreasing stack over nums2 and store `next_greater[popped] = x` in a dictionary.',
      solution: `def next_greater_element(nums1: list[int], nums2: list[int]) -> list[int]:
    nxt = {}
    stack = []
    for x in nums2:
        while stack and x > stack[-1]:
            nxt[stack.pop()] = x
        stack.append(x)
    return [nxt.get(x, -1) for x in nums1]`,
      explanation: 'Precomputes the next greater value for every element in nums2 in a single O(n) pass.',
      complexity: 'O(n + m) time, O(n) space',
    },
  ],

  'hash-table': [
    {
      difficulty: 'Hard',
      title: 'First Missing Positive / Substring with Concatenation of All Words (LC #30)',
      pattern: 'Word-Frequency Sliding Hash Map',
      leetcodeUrl: 'https://leetcode.com/problems/substring-with-concatenation-of-all-words/',
      companies: ['Amazon', 'Google', 'Apple'],
      statement: 'Given a string s and an array of equal-length words, return all starting indices of substrings in s that are a concatenation of every word in words exactly once.',
      example: 'Input: s = "barfoothefoobarman", words = ["foo","bar"]\nOutput: [0,9]',
      hint: 'Slide a window in steps of `w = len(words[0])` for each offset `0..w-1` using a word-frequency Counter.',
      solution: `from collections import Counter

def find_substring(s: str, words: list[str]) -> list[int]:
    if not s or not words:
        return []
    w, k = len(words[0]), len(words)
    need = Counter(words)
    res = []
    for offset in range(w):
        left = offset
        seen = Counter()
        count = 0
        for right in range(offset, len(s) - w + 1, w):
            word = s[right:right + w]
            if word in need:
                seen[word] += 1
                count += 1
                while seen[word] > need[word]:
                    left_word = s[left:left + w]
                    seen[left_word] -= 1
                    count -= 1
                    left += w
                if count == k:
                    res.append(left)
            else:
                seen.clear()
                count = 0
                left = right + w
    return res`,
      explanation: 'Grouping by modulo offset `0..w-1` turns fixed-length word matching into w linear sliding-window scans.',
      complexity: 'O(|s| · w) time, O(k · w) space',
    },
  ],

  'programming-basics': [
    {
      difficulty: 'Hard',
      title: 'Deep Clone an Arbitrary Object Graph with Cycles',
      pattern: 'Memoized Reference Identity Map (`id(obj)`)',
      statement: 'Implement a deep-copy function for nested lists and dictionaries that may contain self-references (cycles) without raising RecursionError.',
      example: 'a = [1, 2]; a.append(a); copy = deep_clone(a) -> copy[2] is copy and copy is not a',
      hint: 'Keep a `memo` dictionary mapping `id(orig)` to the newly allocated container *before* recursing on its elements.',
      solution: `def deep_clone(obj, memo=None):
    if memo is None:
        memo = {}
    oid = id(obj)
    if oid in memo:
        return memo[oid]
    if isinstance(obj, list):
        clone = []
        memo[oid] = clone
        for item in obj:
            clone.append(deep_clone(item, memo))
        return clone
    if isinstance(obj, dict):
        clone = {}
        memo[oid] = clone
        for k, v in obj.items():
            clone[deep_clone(k, memo)] = deep_clone(v, memo)
        return clone
    return obj`,
      explanation: 'This is the exact mechanism Python’s `copy.deepcopy` uses to preserve reference identity and break reference cycles.',
      complexity: 'O(N) time and space across all reachable objects',
    },
  ],

  'big-o-notation': [
    {
      difficulty: 'Hard',
      title: 'Count of Smaller Numbers After Self in O(n log n) Instead of O(n²) (LC #315)',
      pattern: 'Divide-and-Conquer Merge Sort Counting',
      leetcodeUrl: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/',
      companies: ['Google', 'Amazon', 'Apple'],
      statement: 'Given an integer array nums, return an integer array counts where counts[i] is the number of smaller elements to the right of nums[i] in O(n log n) time.',
      example: 'Input: nums = [5,2,6,1]\nOutput: [2,1,1,0]',
      hint: 'During Merge Sort on `(index, value)` pairs, count how many elements from the right half jump ahead of each left-half element.',
      solution: `def count_smaller(nums: list[int]) -> list[int]:
    counts = [0] * len(nums)
    enum = list(enumerate(nums))
    def sort(arr):
        half = len(arr) // 2
        if half:
            left, right = sort(arr[:half]), sort(arr[half:])
            for i in range(len(arr) - 1, -1, -1):
                if not right or (left and left[-1][1] > right[-1][1]):
                    counts[left[-1][0]] += len(right)
                    arr[i] = left.pop()
                else:
                    arr[i] = right.pop()
        return arr
    sort(enum)
    return counts`,
      explanation: 'Replaces an O(n²) nested loop with the T(n) = 2T(n/2) + O(n) = O(n log n) Master Theorem recurrence.',
      complexity: 'O(n log n) time, O(n) space',
    },
  ],

  strings: [
    {
      difficulty: 'Hard',
      title: 'Encode and Decode Strings (LC #271)',
      pattern: 'Length-Prefixed Framing (`len#str`)',
      leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/',
      companies: ['Google', 'Meta', 'Square'],
      statement: 'Design an algorithm to encode a list of strings (which may contain any ASCII character including "#" and digits) into a single string and decode it back losslessly.',
      example: 'Input: ["neet","code","love","you"]\nEncoded: "4#neet4#code4#love3#you"',
      hint: 'Prefix every string with its character length followed by `#`, then read exactly `length` characters after `#`.',
      solution: `def encode(strs: list[str]) -> str:
    return "".join(f"{len(s)}#{s}" for s in strs)

def decode(s: str) -> list[str]:
    res, i = [], 0
    while i < len(s):
        j = s.find("#", i)
        length = int(s[i:j])
        res.append(s[j + 1 : j + 1 + length])
        i = j + 1 + length
    return res`,
      explanation: 'Length-prefixed framing never collides with characters inside the payload, even if the string itself contains `#` or numbers.',
      complexity: 'O(total characters) time and space',
    },
  ],

  stack: [
    {
      difficulty: 'Medium',
      title: 'Min Stack — O(1) getMin (LC #155)',
      pattern: 'Paired Value + Running-Minimum Stack',
      leetcodeUrl: 'https://leetcode.com/problems/min-stack/',
      companies: ['Amazon', 'Bloomberg', 'Microsoft'],
      statement: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant O(1) time.',
      example: 'push(-2), push(0), push(-3), getMin() → -3, pop(), top() → 0, getMin() → -2',
      hint: 'Push `(val, min(val, current_min))` onto the stack.',
      solution: `class MinStack:
    def __init__(self):
        self.stk = []

    def push(self, val: int) -> None:
        cur_min = val if not self.stk else min(val, self.stk[-1][1])
        self.stk.append((val, cur_min))

    def pop(self) -> None:
        self.stk.pop()

    def top(self) -> int:
        return self.stk[-1][0]

    def getMin(self) -> int:
        return self.stk[-1][1]`,
      explanation: 'Because a stack only adds and removes at the top, the minimum of the prefix below each element never changes.',
      complexity: 'O(1) time per operation, O(n) space',
    },
    {
      difficulty: 'Hard',
      title: 'Basic Calculator (LC #224)',
      pattern: 'Sign & Parenthesis Frame Stack',
      leetcodeUrl: 'https://leetcode.com/problems/basic-calculator/',
      companies: ['Google', 'Meta', 'Uber', 'Roblox'],
      statement: 'Given a string s representing a valid expression with "+", "-", "(", ")", and spaces, implement a basic calculator to evaluate it.',
      example: 'Input: s = "(1+(4+5+2)-3)+(6+8)"\nOutput: 23',
      hint: 'Maintain `res`, `num`, and `sign` (+1/-1). On `(`, push `res` and `sign` onto the stack; on `)`, pop and combine.',
      solution: `def calculate(s: str) -> int:
    stack = []
    res, num, sign = 0, 0, 1
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-":
            res += sign * num
            num = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            stack.append(res)
            stack.append(sign)
            res, sign = 0, 1
        elif ch == ")":
            res += sign * num
            num = 0
            res *= stack.pop()
            res += stack.pop()
    return res + sign * num`,
      explanation: 'Each `(` saves the outer running total and sign on the stack so the inner subexpression starts clean.',
      complexity: 'O(n) time, O(n) space',
    },
  ],

  'queue-deque': [
    {
      difficulty: 'Easy',
      title: 'Number of Recent Calls — Sliding Time Queue (LC #933)',
      pattern: 'FIFO Timestamp Expiration Queue',
      leetcodeUrl: 'https://leetcode.com/problems/number-of-recent-calls/',
      companies: ['Amazon', 'Apple', 'Cloudflare'],
      statement: 'Implement `RecentCounter.ping(t)` that adds a request at time `t` (ms) and returns the number of requests that have happened in the inclusive range `[t - 3000, t]`.',
      example: 'ping(1) → 1, ping(100) → 2, ping(3001) → 3, ping(3002) → 3',
      hint: 'Append `t` to a deque and pop from the left while `q[0] < t - 3000`.',
      solution: `from collections import deque

class RecentCounter:
    def __init__(self):
        self.q = deque()

    def ping(self, t: int) -> int:
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)`,
      explanation: 'Since timestamps arrive in strictly increasing order, expired timestamps are always at the front of the queue.',
      complexity: 'O(1) amortized per ping, O(W) space',
    },
  ],

  'binary-tree': [
    {
      difficulty: 'Hard',
      title: 'Binary Tree Maximum Path Sum (LC #124)',
      pattern: 'Postorder Arch vs Single-Branch Return',
      leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
      companies: ['Meta', 'Amazon', 'Google', 'DoorDash'],
      statement: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. Return the maximum path sum of any non-empty path.',
      example: 'Input: [-10,9,20,null,null,15,7]\nOutput: 42 (15 + 20 + 7)',
      hint: 'Clamp negative child gains to 0 (`max(0, dfs(child))`), update `best` with `node.val + left + right`, and return `node.val + max(left, right)` upward.',
      solution: `def max_path_sum(root) -> int:
    best = float('-inf')
    def gain(node) -> int:
        nonlocal best
        if not node:
            return 0
        l = max(0, gain(node.left))
        r = max(0, gain(node.right))
        best = max(best, node.val + l + r)
        return node.val + max(l, r)
    gain(root)
    return best`,
      explanation: 'Separates the highest-curving path rooted at `node` from the straight downward branch extendable by `node`’s parent.',
      complexity: 'O(n) time, O(h) space',
    },
    {
      difficulty: 'Hard',
      title: 'Serialize and Deserialize Binary Tree (LC #297)',
      pattern: 'Preorder Stream with Null Markers',
      leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
      companies: ['Meta', 'Amazon', 'LinkedIn', 'Uber'],
      statement: 'Design an algorithm to serialize a binary tree into a string and deserialize that string back to the original tree structure.',
      example: 'Input: [1,2,3,null,null,4,5] -> "1,2,#,#,3,4,#,#,5,#,#"',
      hint: 'Record `#` for null pointers in a preorder traversal so the deserializer knows exactly when each subtree ends.',
      solution: `class Codec:
    def serialize(self, root) -> str:
        out = []
        def dfs(n):
            if not n:
                out.append("#")
                return
            out.append(str(n.val))
            dfs(n.left)
            dfs(n.right)
        dfs(root)
        return ",".join(out)

    def deserialize(self, data: str):
        it = iter(data.split(","))
        def dfs():
            v = next(it)
            if v == "#":
                return None
            node = TreeNode(int(v))
            node.left = dfs()
            node.right = dfs()
            return node
        return dfs()`,
      explanation: 'Preorder with explicit null sentinels uniquely determines the tree without needing an inorder sequence.',
      complexity: 'O(n) time, O(n) space',
    },
  ],

  'binary-search-tree': [
    {
      difficulty: 'Easy',
      title: 'Lowest Common Ancestor of a BST (LC #235)',
      pattern: 'BST Split-Point Walk',
      leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
      companies: ['Amazon', 'Meta', 'LinkedIn'],
      statement: 'Given a Binary Search Tree (BST), find the lowest common ancestor (LCA) node of two given nodes p and q in O(h) time and O(1) space.',
      example: 'Input: root = [6,2,8,0,4,7,9], p = 2, q = 8\nOutput: 6',
      hint: 'If both p and q are smaller than cur, go left; if both are larger, go right; otherwise cur is the split point (LCA).',
      solution: `def lowest_common_ancestor_bst(root, p, q):
    cur = root
    while cur:
        if p.val < cur.val and q.val < cur.val:
            cur = cur.left
        elif p.val > cur.val and q.val > cur.val:
            cur = cur.right
        else:
            return cur`,
      explanation: 'Exploits the BST ordering invariant so only one root-to-LCA path is walked.',
      complexity: 'O(h) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Recover Binary Search Tree — Two Swapped Nodes (LC #99)',
      pattern: 'Inorder Inversion Detection',
      leetcodeUrl: 'https://leetcode.com/problems/recover-binary-search-tree/',
      companies: ['Amazon', 'Google', 'Microsoft'],
      statement: 'The values of exactly two nodes in a BST were swapped by mistake. Recover the tree without changing its structure.',
      example: 'Input: [3,1,4,null,null,2]\nOutput: [2,1,4,null,null,3]',
      hint: 'In an inorder traversal, a swapped pair creates 1 or 2 inversions (`prev.val > cur.val`); record the first `prev` and the last `cur`, then swap their values.',
      solution: `def recover_tree(root) -> None:
    first = second = prev = None
    def inorder(node):
        nonlocal first, second, prev
        if not node:
            return
        inorder(node.left)
        if prev and prev.val > node.val:
            if not first:
                first = prev
            second = node
        prev = node
        inorder(node.right)
    inorder(root)
    first.val, second.val = second.val, first.val`,
      explanation: 'Inorder traversal of a valid BST is strictly increasing, so any drop `prev.val > node.val` pinpoints the misplaced nodes.',
      complexity: 'O(n) time, O(h) space',
    },
  ],

  'graphs-core': [
    {
      difficulty: 'Easy',
      title: 'Find the Town Judge — Directed Degree Count (LC #997)',
      pattern: 'In-Degree Minus Out-Degree',
      leetcodeUrl: 'https://leetcode.com/problems/find-the-town-judge/',
      companies: ['Amazon', 'Google', 'Microsoft'],
      statement: 'In a town of n people (1..n), the judge trusts nobody (`out = 0`) and everybody else trusts the judge (`in = n - 1`). Return the judge label or -1.',
      example: 'Input: n = 3, trust = [[1,3],[2,3]]\nOutput: 3',
      hint: 'Track `score[b] += 1` and `score[a] -= 1`; the judge must have `score == n - 1`.',
      solution: `def find_judge(n: int, trust: list[list[int]]) -> int:
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    for i in range(1, n + 1):
        if score[i] == n - 1:
            return i
    return -1`,
      explanation: 'A vertex can reach `in - out == n - 1` if and only if `in == n - 1` and `out == 0`.',
      complexity: 'O(V + E) time, O(V) space',
    },
    {
      difficulty: 'Hard',
      title: 'Shortest Path Visiting All Nodes (LC #847)',
      pattern: 'Bitmask State-Space BFS `(node, visited_mask)`',
      leetcodeUrl: 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/',
      companies: ['Google', 'Uber', 'Amazon'],
      statement: 'Given an undirected, connected graph of n nodes (n <= 12), return the length of the shortest path that visits every node (nodes and edges may be revisited).',
      example: 'Input: graph = [[1,2,3],[0],[0],[0]]\nOutput: 4',
      hint: 'Run multi-source BFS starting from all `(i, 1 << i)` simultaneously until any state reaches mask `(1 << n) - 1`.',
      solution: `from collections import deque

def shortest_path_length(graph: list[list[int]]) -> int:
    n = len(graph)
    full = (1 << n) - 1
    q = deque((i, 1 << i, 0) for i in range(n))
    seen = {(i, 1 << i) for i in range(n)}
    while q:
        u, mask, steps = q.popleft()
        if mask == full:
            return steps
        for v in graph[u]:
            nmask = mask | (1 << v)
            if (v, nmask) not in seen:
                seen.add((v, nmask))
                q.append((v, nmask, steps + 1))
    return 0`,
      explanation: 'Adding the bitmask of visited nodes to the BFS state prevents infinite loops while still allowing necessary node revisits.',
      complexity: 'O(n² · 2ⁿ) time, O(n · 2ⁿ) space',
    },
  ],

  'shortest-paths': [
    {
      difficulty: 'Easy',
      title: 'Shortest Path in Binary Matrix — 8-Directional BFS (LC #1091)',
      pattern: 'Unweighted Grid Shortest Path',
      leetcodeUrl: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
      companies: ['Meta', 'Amazon', 'Google'],
      statement: 'Given an n x n binary matrix grid, return the length of the shortest 8-directionally connected clear path (0s) from (0, 0) to (n-1, n-1), or -1.',
      example: 'Input: grid = [[0,1],[1,0]]\nOutput: 2',
      hint: 'When all edge weights are 1, standard BFS finds the shortest path in O(n²) without needing a heap.',
      solution: `from collections import deque

def shortest_path_binary_matrix(grid: list[list[int]]) -> int:
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    q = deque([(0, 0, 1)])
    grid[0][0] = 1
    dirs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    while q:
        r, c, d = q.popleft()
        if r == n - 1 and c == n - 1:
            return d
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                grid[nr][nc] = 1
                q.append((nr, nc, d + 1))
    return -1`,
      explanation: 'Demonstrates when to pick O(V + E) BFS over O(E log V) Dijkstra.',
      complexity: 'O(n²) time, O(n²) space',
    },
    {
      difficulty: 'Hard',
      title: 'Swim in Rising Water — Minimax Dijkstra (LC #778)',
      pattern: 'Minimax Bottleneck Dijkstra',
      leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/',
      companies: ['Google', 'Meta', 'DoorDash'],
      statement: 'On an n x n grid where grid[r][c] is the elevation, find the minimum time t such that you can swim from (0,0) to (n-1,n-1) stepping only on cells with elevation <= t.',
      example: 'Input: [[0,2],[1,3]]\nOutput: 3',
      hint: 'Run Dijkstra where path cost is `max(path_cost_so_far, grid[nr][nc])` instead of `sum`.',
      solution: `import heapq

def swim_in_water(grid: list[list[int]]) -> int:
    n = len(grid)
    pq = [(grid[0][0], 0, 0)]
    seen = {(0, 0)}
    while pq:
        t, r, c = heapq.heappop(pq)
        if r == n - 1 and c == n - 1:
            return t
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(pq, (max(t, grid[nr][nc]), nr, nc))
    return -1`,
      explanation: 'Because `max(t, weight)` is monotonically non-decreasing, Dijkstra’s greedy settlement invariant holds.',
      complexity: 'O(n² log n) time, O(n²) space',
    },
  ],

  'minimum-spanning-tree': [
    {
      difficulty: 'Easy',
      title: 'Check if Graph Can Form a Spanning Tree',
      pattern: 'Connected Component Count == 1',
      statement: 'Given n vertices and undirected edges, return true if the graph is connected (so a spanning tree of n - 1 edges exists).',
      example: 'Input: n = 4, edges = [[0,1],[1,2],[2,3]]\nOutput: true',
      hint: 'A spanning tree exists iff len(edges) >= n - 1 and Union-Find reduces the number of components to 1.',
      solution: `def has_spanning_tree(n: int, edges: list[list[int]]) -> bool:
    if len(edges) < n - 1:
        return False
    p = list(range(n))
    def find(x):
        while p[x] != x:
            p[x] = p[p[x]]; x = p[x]
        return x
    comps = n
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            p[ru] = rv
            comps -= 1
    return comps == 1`,
      explanation: 'Every spanning tree on n vertices has exactly n - 1 edges and 1 connected component.',
      complexity: 'O((V + E) · α(V)) time, O(V) space',
    },
    {
      difficulty: 'Hard',
      title: 'Optimize Water Distribution in a Village (LC #1168)',
      pattern: 'Virtual Source Node + Kruskal MST',
      leetcodeUrl: 'https://leetcode.com/problems/optimize-water-distribution-in-a-village/',
      companies: ['Google', 'Amazon', 'Meta'],
      statement: 'There are n houses (1..n). You can either build a well inside house i for `wells[i - 1]` cost, or lay a pipe between houses `[u, v, cost]`. Return the minimum total cost to supply water to all houses.',
      example: 'Input: n = 3, wells = [1,2,2], pipes = [[1,2,1],[2,3,1]]\nOutput: 3',
      hint: 'Create a virtual node `0` (the reservoir) and add an edge `(0, i, wells[i-1])` for each well; then find the MST of all `n + 1` nodes.',
      solution: `def min_cost_to_supply_water(n: int, wells: list[int], pipes: list[list[int]]) -> int:
    edges = [(w, 0, i + 1) for i, w in enumerate(wells)]
    for u, v, w in pipes:
        edges.append((w, u, v))
    edges.sort()
    parent = list(range(n + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    total = taken = 0
    for w, u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            taken += 1
            if taken == n:
                break
    return total`,
      explanation: 'Turning node costs (wells) into edges from a virtual super-source reduces the problem to standard Kruskal MST.',
      complexity: 'O((V + E) log(V + E)) time, O(V + E) space',
    },
  ],

  'segment-fenwick-tree': [
    {
      difficulty: 'Easy',
      title: 'Fenwick Tree LSB Range Responsibility (`i & -i`)',
      pattern: 'Lowest Set Bit Span',
      statement: 'Given a 1-based index i in a Fenwick Tree, return `[start, end]` — the 1-based inclusive range of original elements that `bit[i]` aggregates.',
      example: 'Input: i = 6 (binary 0110) → [5, 6]\nInput: i = 8 (binary 1000) → [1, 8]',
      hint: 'The span length is `i & -i`, so the range is `[i - (i & -i) + 1, i]`.',
      solution: `def fenwick_span(i: int) -> list[int]:
    length = i & -i
    return [i - length + 1, i]`,
      explanation: 'Understanding `i & -i` makes Fenwick Tree prefix queries and point updates intuitive.',
      complexity: 'O(1) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Reverse Pairs — Coordinate-Compressed Fenwick Tree (LC #493)',
      pattern: 'Rank Compression + Binary Indexed Tree',
      leetcodeUrl: 'https://leetcode.com/problems/reverse-pairs/',
      companies: ['Google', 'Amazon', 'ByteDance'],
      statement: 'Given an integer array nums, return the number of reverse pairs `(i, j)` where `0 <= i < j < nums.length` and `nums[i] > 2 * nums[j]`.',
      example: 'Input: nums = [1,3,2,3,1]\nOutput: 2',
      hint: 'Use Merge Sort or a Fenwick Tree over sorted unique values and `2 * x` values.',
      solution: `def reverse_pairs(nums: list[int]) -> int:
    def sort_count(lo: int, hi: int) -> int:
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        count = sort_count(lo, mid) + sort_count(mid, hi)
        j = mid
        for i in range(lo, mid):
            while j < hi and nums[i] > 2 * nums[j]:
                j += 1
            count += j - mid
        nums[lo:hi] = sorted(nums[lo:hi])
        return count
    return sort_count(0, len(nums))`,
      explanation: 'Counts cross-boundary pairs in O(n) per level before merging the sorted halves.',
      complexity: 'O(n log n) time, O(n) space',
    },
  ],

  'sorting-algorithms': [
    {
      difficulty: 'Easy',
      title: 'Squares of a Sorted Array (LC #977)',
      pattern: 'Two-Pointer Merge from Ends',
      leetcodeUrl: 'https://leetcode.com/problems/squares-of-a-sorted-array/',
      companies: ['Meta', 'Amazon', 'Apple'],
      statement: 'Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order in O(n) time.',
      example: 'Input: nums = [-4,-1,0,3,10]\nOutput: [0,1,9,16,100]',
      hint: 'The largest squares sit at the two extreme ends (`nums[0]` and `nums[-1]`); fill the output array from back to front.',
      solution: `def sorted_squares(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [0] * n
    l, r = 0, n - 1
    for pos in range(n - 1, -1, -1):
        if abs(nums[l]) > abs(nums[r]):
            res[pos] = nums[l] * nums[l]
            l += 1
        else:
            res[pos] = nums[r] * nums[r]
            r -= 1
    return res`,
      explanation: 'Exploits the V-shaped square curve on a sorted input to sort in O(n) instead of O(n log n).',
      complexity: 'O(n) time, O(n) space',
    },
    {
      difficulty: 'Medium',
      title: 'Sort List — O(n log n) Linked List Merge Sort (LC #148)',
      pattern: 'Bottom-Up / Top-Down Linked List Merge Sort',
      leetcodeUrl: 'https://leetcode.com/problems/sort-list/',
      companies: ['Amazon', 'Microsoft', 'Meta'],
      statement: 'Given the head of a linked list, return the list after sorting it in ascending order in O(n log n) time.',
      example: 'Input: head = [4,2,1,3]\nOutput: [1,2,3,4]',
      hint: 'Split the list at the middle using slow/fast pointers, recursively sort both halves, and merge.',
      solution: `def sort_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    mid = slow.next
    slow.next = None
    l, r = sort_list(head), sort_list(mid)
    dummy = tail = ListNode(0)
    while l and r:
        if l.val <= r.val:
            tail.next, l = l, l.next
        else:
            tail.next, r = r, r.next
        tail = tail.next
    tail.next = l or r
    return dummy.next`,
      explanation: 'Merge Sort on linked lists requires no extra array allocation during the merge step.',
      complexity: 'O(n log n) time, O(log n) stack space',
    },
  ],

  'recursion-divide-conquer': [
    {
      difficulty: 'Easy',
      title: 'Convert Sorted Array to Height-Balanced BST (LC #108)',
      pattern: 'Midpoint Divide and Conquer',
      leetcodeUrl: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/',
      companies: ['Amazon', 'Microsoft', 'Apple'],
      statement: 'Given an integer array nums sorted in ascending order, convert it to a height-balanced binary search tree.',
      example: 'Input: nums = [-10,-3,0,5,9]\nOutput: [0,-3,9,-10,null,5]',
      hint: 'Pick `mid = (lo + hi) // 2` as the root so left and right subtrees get equal halves.',
      solution: `def sorted_array_to_bst(nums: list[int]):
    def build(lo: int, hi: int):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        node = TreeNode(nums[mid])
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(nums) - 1)`,
      explanation: 'Choosing the median at every recursive level guarantees subtree sizes differ by at most 1.',
      complexity: 'O(n) time, O(log n) recursion stack',
    },
    {
      difficulty: 'Hard',
      title: 'Median of Two Sorted Arrays (LC #4)',
      pattern: 'Binary Partition Divide & Conquer',
      leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
      companies: ['Google', 'Amazon', 'Goldman Sachs', 'Meta'],
      statement: 'Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays in O(log(min(m, n))) time.',
      example: 'Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.0',
      hint: 'Binary search the cut index `i` in the smaller array and set `j = (m + n + 1) // 2 - i`.',
      solution: `def find_median_sorted_arrays(A: list[int], B: list[int]) -> float:
    if len(A) > len(B):
        A, B = B, A
    m, n = len(A), len(B)
    lo, hi = 0, m
    half = (m + n + 1) // 2
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        al = A[i - 1] if i > 0 else float('-inf')
        ar = A[i] if i < m else float('inf')
        bl = B[j - 1] if j > 0 else float('-inf')
        br = B[j] if j < n else float('inf')
        if al <= br and bl <= ar:
            if (m + n) % 2:
                return float(max(al, bl))
            return (max(al, bl) + min(ar, br)) / 2.0
        if al > br:
            hi = i - 1
        else:
            lo = i + 1
    return 0.0`,
      explanation: 'Halves the search range in the smaller array at every step until `max(left) <= min(right)`.',
      complexity: 'O(log(min(m, n))) time, O(1) space',
    },
  ],

  'greedy-intervals-kadane': [
    {
      difficulty: 'Easy',
      title: 'Majority Element — Boyer-Moore Voting (LC #169)',
      pattern: 'Boyer-Moore Pair Cancellation',
      leetcodeUrl: 'https://leetcode.com/problems/majority-element/',
      companies: ['Amazon', 'Google', 'Microsoft'],
      statement: 'Given an array nums of size n, return the majority element (the element that appears more than ⌊n / 2⌋ times) in O(n) time and O(1) space.',
      example: 'Input: nums = [2,2,1,1,1,2,2]\nOutput: 2',
      hint: 'Keep a `candidate` and `count`; increment on match, decrement on mismatch, and switch candidate when count hits 0.',
      solution: `def majority_element(nums: list[int]) -> int:
    cand = None
    count = 0
    for x in nums:
        if count == 0:
            cand = x
        count += 1 if x == cand else -1
    return cand`,
      explanation: 'Canceling each majority element against a non-majority element still leaves the majority element in the lead.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Candy — Two-Pass Greedy Neighbor Constraints (LC #135)',
      pattern: 'Left-to-Right + Right-to-Left Greedy Pass',
      leetcodeUrl: 'https://leetcode.com/problems/candy/',
      companies: ['Amazon', 'Apple', 'Uber'],
      statement: 'There are n children standing in a line with ratings. Each child must have at least 1 candy, and children with a higher rating than an adjacent neighbor must get more candies than that neighbor. Return the minimum total candies.',
      example: 'Input: ratings = [1,0,2]\nOutput: 5 (candies [2,1,2])',
      hint: 'Pass 1 (left to right) satisfies left-neighbor rules; Pass 2 (right to left) satisfies right-neighbor rules using `max`.',
      solution: `def candy(ratings: list[int]) -> int:
    n = len(ratings)
    candies = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    return sum(candies)`,
      explanation: 'Splitting a two-sided local constraint into two directional passes solves it cleanly in linear time.',
      complexity: 'O(n) time, O(n) space',
    },
  ],

  'classic-dp-models': [
    {
      difficulty: 'Easy',
      title: 'Nth Tribonacci / Fibonacci Number (LC #1137)',
      pattern: 'Constant-Space 1D Recurrence',
      leetcodeUrl: 'https://leetcode.com/problems/n-th-tribonacci-number/',
      companies: ['Amazon', 'Apple'],
      statement: 'Given T0 = 0, T1 = 1, T2 = 1, and Tn+3 = Tn + Tn+1 + Tn+2, return Tn.',
      example: 'Input: n = 4 → 4 | n = 25 → 1389537',
      hint: 'Keep only the last three values `a, b, c`.',
      solution: `def tribonacci(n: int) -> int:
    if n < 2:
        return n
    a, b, c = 0, 1, 1
    for _ in range(n - 2):
        a, b, c = b, c, a + b + c
    return c`,
      explanation: 'Compresses an O(n) DP table down to 3 registers.',
      complexity: 'O(n) time, O(1) space',
    },
    {
      difficulty: 'Hard',
      title: 'Burst Balloons — Interval DP (LC #312)',
      pattern: 'Last-Operation Interval DP (`dp[l][r]`)',
      leetcodeUrl: 'https://leetcode.com/problems/burst-balloons/',
      companies: ['Google', 'Amazon', 'ByteDance'],
      statement: 'Given n balloons with numbers nums[i], bursting balloon i gives `nums[left] * nums[i] * nums[right]` coins. Return the maximum coins you can collect by bursting all balloons.',
      example: 'Input: nums = [3,1,5,8]\nOutput: 167',
      hint: 'Pad with `[1, ...nums..., 1]` and think backwards: pick which balloon `k` in `(l, r)` is burst *last*, so its neighbors are fixed as `nums[l]` and `nums[r]`.',
      solution: `def max_coins(nums: list[int]) -> int:
    vals = [1] + [x for x in nums if x > 0] + [1]
    n = len(vals)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for l in range(0, n - length):
            r = l + length
            for k in range(l + 1, r):
                dp[l][r] = max(
                    dp[l][r],
                    dp[l][k] + vals[l] * vals[k] * vals[r] + dp[k][r]
                )
    return dp[0][n - 1]`,
      explanation: 'Choosing the *last* balloon to burst in `(l, r)` makes the left `(l, k)` and right `(k, r)` subproblems completely independent.',
      complexity: 'O(n³) time, O(n²) space',
    },
  ],

  'advanced-string-graph-algorithms': [
    {
      difficulty: 'Easy',
      title: 'Repeated Substring Pattern via KMP LPS (LC #459)',
      pattern: 'KMP Prefix-Suffix Periodicity',
      leetcodeUrl: 'https://leetcode.com/problems/repeated-substring-pattern/',
      companies: ['Amazon', 'Google'],
      statement: 'Given a string s, check if it can be constructed by taking a substring of it and appending multiple copies of the substring together.',
      example: 'Input: s = "abab" → true | s = "aba" → false',
      hint: 'In KMP, the minimal period length is `p = n - lps[-1]`; s is periodic iff `lps[-1] > 0` and `n % p == 0`.',
      solution: `def repeated_substring_pattern(s: str) -> bool:
    n = len(s)
    lps = [0] * n
    j = 0
    for i in range(1, n):
        while j > 0 and s[i] != s[j]:
            j = lps[j - 1]
        if s[i] == s[j]:
            j += 1
            lps[i] = j
    return lps[-1] > 0 and n % (n - lps[-1]) == 0`,
      explanation: 'The KMP LPS table reveals the exact smallest repeating unit of any string in O(n) time.',
      complexity: 'O(n) time, O(n) space',
    },
    {
      difficulty: 'Medium',
      title: 'Find the Index of the First Occurrence in a String — KMP (LC #28)',
      pattern: 'Knuth-Morris-Pratt Substring Match',
      leetcodeUrl: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
      companies: ['Amazon', 'Microsoft', 'Apple'],
      statement: 'Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack, in worst-case O(n + m) time.',
      example: 'Input: haystack = "sadbutsad", needle = "sad"\nOutput: 0',
      hint: 'Build the `lps` fallback array on `needle` and scan `haystack` without ever moving the text index backward.',
      solution: `def str_str_kmp(haystack: str, needle: str) -> int:
    if not needle:
        return 0
    lps = [0] * len(needle)
    j = 0
    for i in range(1, len(needle)):
        while j > 0 and needle[i] != needle[j]:
            j = lps[j - 1]
        if needle[i] == needle[j]:
            j += 1
            lps[i] = j
    j = 0
    for i, ch in enumerate(haystack):
        while j > 0 and ch != needle[j]:
            j = lps[j - 1]
        if ch == needle[j]:
            j += 1
            if j == len(needle):
                return i - j + 1
    return -1`,
      explanation: 'Avoids the O(n·m) worst case on adversarial strings like `haystack = "aaaa...ab"` and `needle = "aaab"`.',
      complexity: 'O(n + m) time, O(m) space',
    },
  ],

  'system-dsa-structures': [
    {
      difficulty: 'Easy',
      title: 'Design HashSet — Bucket Chaining (LC #705)',
      pattern: 'Modulo Bucket Array',
      leetcodeUrl: 'https://leetcode.com/problems/design-hashset/',
      companies: ['Amazon', 'Microsoft', 'Apple'],
      statement: 'Design a HashSet without using any built-in hash table libraries, supporting `add(key)`, `contains(key)`, and `remove(key)`.',
      example: 'add(1), add(2), contains(1) → true, remove(2), contains(2) → false',
      hint: 'Use a prime bucket count (e.g. 1009) and store a short list per bucket.',
      solution: `class MyHashSet:
    def __init__(self):
        self.cap = 1009
        self.buckets = [[] for _ in range(self.cap)]

    def add(self, key: int) -> None:
        b = self.buckets[key % self.cap]
        if key not in b:
            b.append(key)

    def remove(self, key: int) -> None:
        b = self.buckets[key % self.cap]
        if key in b:
            b.remove(key)

    def contains(self, key: int) -> bool:
        return key in self.buckets[key % self.cap]`,
      explanation: 'A prime bucket modulus distributes integer keys across buckets for O(1) average lookup.',
      complexity: 'O(1) average time, O(n) space',
    },
    {
      difficulty: 'Hard',
      title: 'LFU Cache — Least Frequently Used in O(1) (LC #460)',
      pattern: 'HashMap + Frequency-Bucket Doubly Linked Lists',
      leetcodeUrl: 'https://leetcode.com/problems/lfu-cache/',
      companies: ['Amazon', 'Google', 'Uber', 'Microsoft'],
      statement: 'Design and implement a data structure for a Least Frequently Used (LFU) cache where `get(key)` and `put(key, value)` both run in O(1) average time, breaking frequency ties by Least Recently Used.',
      example: 'LFUCache(2): put(1,1), put(2,2), get(1) → 1, put(3,3) evicts 2 (freq 1 < freq 2)',
      hint: 'Keep `key -> (val, freq)`, `freq -> OrderedDict of keys`, and an integer `min_freq` tracking the lowest active frequency.',
      solution: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.key_freq = {}
        self.freq_keys = defaultdict(OrderedDict)
        self.min_freq = 0

    def _touch(self, key: int, val: int) -> None:
        _, f = self.key_freq[key]
        del self.freq_keys[f][key]
        if not self.freq_keys[f] and self.min_freq == f:
            self.min_freq += 1
        self.key_freq[key] = (val, f + 1)
        self.freq_keys[f + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.key_freq:
            return -1
        val, _ = self.key_freq[key]
        self._touch(key, val)
        return val

    def put(self, key: int, value: int) -> None:
        if self.cap <= 0:
            return
        if key in self.key_freq:
            self._touch(key, value)
            return
        if len(self.key_freq) >= self.cap:
            evict_k, _ = self.freq_keys[self.min_freq].popitem(last=False)
            del self.key_freq[evict_k]
        self.key_freq[key] = (value, 1)
        self.freq_keys[1][key] = None
        self.min_freq = 1`,
      explanation: 'Maintaining a separate LRU OrderedDict per frequency count lets `min_freq` only ever reset to 1 or increment by +1 in O(1).',
      complexity: 'O(1) time for get & put, O(capacity) space',
    },
  ],
}
