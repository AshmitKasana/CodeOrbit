// Hand-written pattern guides for the built-in (offline) knowledge base.
// services/guideLessons.js turns each guide into a full lesson in the same shape
// the AI backend returns, so the Learn page renders both identically.
//
// Guide fields:
//   keys / exclude    words that route a query here (whole-word match) / words that veto it
//   title, summary, analogy, keyIdea, whenToUse[], steps, memory
//   complexity        { best, average, worst, space, explanation }
//   visual            { type: 'array' | 'tree' | 'graph' | 'stack' ..., values? }
//   templates         { Python, JavaScript } reusable code
//   mistakes[]        { mistake, explanation }
//   problems[]        { difficulty, title, statement, example, hint, solution (Python), explanation, complexity }
//   questionCategory  which interview-question category to show (see interviewQuestions.js)
//   related[]         next topics

import { ENCYCLOPEDIA_GUIDES } from './dsaEncyclopedia'

export const GUIDES = [
  // ------------------------------------------------------------------ two pointers
  {
    id: 'two-pointers',
    keys: ['two pointers', 'two pointer', 'two-pointer', 'fast and slow pointers', 'fast & slow pointers', 'slow and fast pointers', 'tortoise and hare'],
    title: 'Two Pointers',
    summary: 'Two pointers walk through a sequence together — usually from both ends, or at different speeds — to replace a nested loop with a single pass.',
    analogy: 'Imagine two people searching a long bookshelf, one starting at each end and walking toward each other: together they cover the shelf in half the steps.',
    keyIdea:
      'On sorted data, moving the left pointer up increases the sum and moving the right pointer down decreases it, so each comparison lets you discard one candidate for good. That turns O(n²) pair-checking into O(n). A variant uses a slow and a fast pointer moving at different speeds (finding the middle of a list, detecting a cycle).',
    whenToUse: [
      'The input is sorted, or sorting it first is acceptable',
      'You need a pair or triplet that meets a condition (sum, difference)',
      'You are reversing, partitioning or de-duplicating in place',
      'A palindrome check, or any "compare from both ends" idea',
    ],
    steps:
      'Place left at index 0 and right at the last index. Compare the current pair with the goal: if the sum is too small move left forward, if it is too large move right backward, and stop when they meet. For in-place edits use a "read" pointer and a "write" pointer that move in the same direction.',
    memory: 'Only two integer indices are stored, so extra memory is O(1); scanning one contiguous array keeps the access pattern cache-friendly.',
    complexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
      explanation: 'Each pointer only moves in one direction and never revisits an index, so the loop runs at most n steps. Sorting first, if needed, adds O(n log n).',
    },
    visual: { type: 'array', values: [1, 3, 4, 6, 8, 11] },
    templates: {
      Python: `
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        if s < target:
            left += 1
        else:
            right -= 1
    return []`,
      JavaScript: `
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
    },
    mistakes: [
      { mistake: 'Using it on unsorted data', explanation: 'The "move the pointer that fixes the sum" logic only works on ordered data. Sort first (remember indices change) or use a hash map instead.' },
      { mistake: 'Off-by-one in the loop condition', explanation: 'Use left < right for pairs so an element is never paired with itself; use left <= right only when a single element can be a valid answer.' },
      { mistake: 'Forgetting to skip duplicates', explanation: 'In 3Sum-style problems, skip repeated values after moving a pointer or you will return duplicate answers.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Valid Palindrome',
        statement: 'Given a string s, return true if it reads the same forwards and backwards after removing non-alphanumeric characters and ignoring case.',
        example: 'Input: "A man, a plan, a canal: Panama"\nOutput: true',
        hint: 'Compare characters from both ends, skipping anything that is not a letter or digit.',
        solution: `
def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
        explanation: 'Two pointers move inward, skipping punctuation; any mismatch ends the check.',
        complexity: 'O(n) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Container With Most Water',
        statement: 'Given heights h[0..n-1], choose two lines that, together with the x-axis, hold the most water. Return the maximum area.',
        example: 'Input: [1,8,6,2,5,4,8,3,7]\nOutput: 49',
        hint: 'Start with the widest container. The shorter line limits the height, so moving the taller line can never help.',
        solution: `
def max_area(h):
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(h[l], h[r]))
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    return best`,
        explanation: 'Moving the taller pointer only shrinks the width without raising the limiting height, so always move the shorter side.',
        complexity: 'O(n) time, O(1) space',
      },
    ],
    questionCategory: 'arrays',
    related: ['Sliding Window', 'Binary Search', 'Hash Table', 'Sorting', 'Arrays'],
  },

  // ---------------------------------------------------------------- sliding window
  {
    id: 'sliding-window',
    keys: ['sliding window', 'sliding-window'],
    title: 'Sliding Window',
    summary: 'A sliding window keeps a contiguous range of an array or string and moves its edges forward, updating the answer incrementally instead of recomputing it from scratch.',
    analogy: 'Think of a magnifying glass sliding along a line of text: you only look at what is inside the glass, and when it moves one step you add the new letter on the right and drop the old one on the left.',
    keyIdea:
      'Maintain a window [left, right] and some state about its contents (a sum, counts, the distinct characters). Expand right to include new elements; while the window violates the condition, shrink it from the left. Every index enters and leaves the window at most once, so the work is linear.',
    whenToUse: [
      'Longest or shortest subarray/substring satisfying a condition',
      'Fixed-size window questions (best sum of k consecutive elements)',
      'The condition can be maintained by updating counts as elements enter and leave',
      'Sums of non-negative numbers (negative numbers usually need prefix sums instead)',
    ],
    steps:
      'Fixed size k: compute the first window, then for each step add the incoming element and subtract the outgoing one. Variable size: advance right one step at a time and update the state; while the window is invalid advance left (updating the state) until it is valid again; record the best window after each step.',
    memory: 'The window itself is just two indices; the state adds O(1) for a running sum or O(alphabet size) for character counts.',
    complexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1) to O(k)',
      explanation: 'left and right each advance at most n times, so total steps are at most 2n. Space depends on the state you track — O(1) for a running sum, O(alphabet) for character counts.',
    },
    visual: { type: 'array', values: [2, 3, 1, 2, 4, 3] },
    templates: {
      Python: `
def longest_unique_substring(s):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best`,
      JavaScript: `
function longestUniqueSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    },
    mistakes: [
      { mistake: 'Recomputing the window every step', explanation: 'Calling sum(window) each time makes the solution O(n·k). Update the state by adding the new element and removing the old one.' },
      { mistake: 'Shrinking with "if" instead of "while"', explanation: 'One removal may not make the window valid again; keep shrinking in a while loop until the condition holds.' },
      { mistake: 'Using it with negative numbers for sums', explanation: 'Shrinking assumes that removing elements lowers the sum. With negatives use prefix sums plus a hash map.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Maximum Average Subarray I',
        statement: 'Given an integer array nums and an integer k, find the contiguous subarray of length k with the maximum average and return that average.',
        example: 'Input: nums = [1,12,-5,-6,50,3], k = 4\nOutput: 12.75',
        hint: 'Keep a running sum: add the new element and subtract the one that just left the window.',
        solution: `
def find_max_average(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best / k`,
        explanation: 'Each step slides the window by one, adjusting the sum in O(1) instead of re-adding k numbers.',
        complexity: 'O(n) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Minimum Size Subarray Sum',
        statement: 'Given positive integers nums and a target, return the minimal length of a contiguous subarray whose sum is at least target, or 0 if none exists.',
        example: 'Input: target = 7, nums = [2,3,1,2,4,3]\nOutput: 2   (the subarray [4,3])',
        hint: 'Grow the window until its sum reaches the target, then shrink it from the left while it still does.',
        solution: `
def min_sub_array_len(target, nums):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best`,
        explanation: 'Because every number is positive, shrinking always reduces the sum, so the two pointers only move forward.',
        complexity: 'O(n) time, O(1) space',
      },
    ],
    questionCategory: 'arrays',
    related: ['Two Pointers', 'Prefix Sum', 'Hash Table', 'Arrays', 'Strings'],
  },

  // -------------------------------------------------------------------- prefix sum
  {
    id: 'prefix-sum',
    keys: ['prefix sum', 'prefix sums', 'prefix-sum', 'cumulative sum'],
    title: 'Prefix Sum',
    summary: 'A prefix-sum array stores running totals so the sum of any subarray can be answered in O(1) after one O(n) preprocessing pass.',
    analogy: 'It is like the odometer on a road trip: to know how far you drove between two towns, subtract the odometer reading at the first town from the reading at the second.',
    keyIdea:
      'Let prefix[i] be the sum of the first i elements. Then sum(l..r) = prefix[r + 1] − prefix[l]. The same idea combined with a hash map of earlier prefix values finds subarrays with a target sum in one pass, even when numbers are negative.',
    whenToUse: [
      'Many range-sum queries on a fixed array',
      'Counting or finding subarrays with a given sum',
      'Equal-sum or balanced-split questions (pivot index)',
      'Two-dimensional grids where you need rectangle sums',
    ],
    steps:
      'Build prefix with prefix[0] = 0 and prefix[i + 1] = prefix[i] + nums[i]. Answer range queries by subtraction. For "subarray sum equals k", scan once while keeping the running sum and a map of how often each prefix value has appeared; at each index add map[sum − k] to the answer.',
    memory: 'The prefix array is one extra integer per element (O(n)). The map-based counting variant stores at most one entry per distinct prefix value.',
    complexity: {
      best: 'O(1) per query',
      average: 'O(1) per query',
      worst: 'O(1) per query',
      space: 'O(n)',
      explanation: 'Preprocessing is one O(n) pass and every query is a single subtraction. The hash-map counting variant is O(n) time and O(n) space.',
    },
    visual: { type: 'array', values: [3, 5, 2, 7, 1] },
    templates: {
      Python: `
class RangeSum:
    def __init__(self, nums):
        self.prefix = [0]
        for x in nums:
            self.prefix.append(self.prefix[-1] + x)

    def sum_range(self, left, right):
        return self.prefix[right + 1] - self.prefix[left]`,
      JavaScript: `
class RangeSum {
  constructor(nums) {
    this.prefix = [0];
    for (const x of nums) this.prefix.push(this.prefix[this.prefix.length - 1] + x);
  }
  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}`,
    },
    mistakes: [
      { mistake: 'Off-by-one indices', explanation: 'A leading 0 in the prefix array (prefix[0] = 0) avoids special-casing left = 0.' },
      { mistake: 'Forgetting the {0: 1} seed', explanation: 'When counting subarrays with a hash map, start with a prefix of 0 seen once, so subarrays that begin at index 0 are counted.' },
      { mistake: 'Integer overflow', explanation: 'Sums of large arrays can exceed 32 bits in Java or C++; use a 64-bit type.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Range Sum Query - Immutable',
        statement: 'Design a class that is given an integer array and answers many queries sumRange(left, right): the sum of the elements between the two indices, inclusive.',
        example: 'nums = [-2,0,3,-5,2,-1]\nsumRange(0,2) → 1\nsumRange(2,5) → -1',
        hint: 'Precompute the running totals once, then each query is a subtraction.',
        solution: `
class NumArray:
    def __init__(self, nums):
        self.prefix = [0]
        for x in nums:
            self.prefix.append(self.prefix[-1] + x)

    def sumRange(self, left, right):
        return self.prefix[right + 1] - self.prefix[left]`,
        explanation: 'prefix[right + 1] − prefix[left] is exactly the sum of nums[left..right].',
        complexity: 'O(n) to build, O(1) per query',
      },
      {
        difficulty: 'Medium',
        title: 'Subarray Sum Equals K',
        statement: 'Given an integer array nums (it may contain negative numbers) and an integer k, return the number of contiguous subarrays whose sum equals k.',
        example: 'Input: nums = [1,2,3], k = 3\nOutput: 2   ([1,2] and [3])',
        hint: 'If prefix[j] − prefix[i] = k, then an earlier prefix equals prefix[j] − k. Count those with a hash map.',
        solution: `
from collections import defaultdict

def subarray_sum(nums, k):
    seen = defaultdict(int)
    seen[0] = 1
    total = count = 0
    for x in nums:
        total += x
        count += seen[total - k]
        seen[total] += 1
    return count`,
        explanation: 'For each position, every earlier prefix equal to total − k marks the start of a subarray ending here with sum k.',
        complexity: 'O(n) time, O(n) space',
      },
    ],
    questionCategory: 'hashing',
    related: ['Sliding Window', 'Hash Table', 'Arrays', 'Dynamic Programming'],
  },

  // ------------------------------------------------------------------ binary search
  {
    id: 'binary-search',
    keys: ['binary search', 'binary-search', 'bisect', 'binary search on answer'],
    exclude: ['tree', 'trees'],
    title: 'Binary Search',
    summary: 'Binary search finds a target — or the boundary where a condition flips from false to true — in a sorted or monotonic space by halving the range each step.',
    analogy: 'It is the "guess my number between 1 and 100" game: each guess at the middle lets you throw away half of the remaining possibilities.',
    keyIdea:
      'Keep lo and hi around the answer and test the middle. If the middle fails the condition, discard the half that cannot contain the answer. It works on any monotonic yes/no question — not only "is this value in the array" — which lets you binary search the answer itself (minimum speed, smallest capacity, and so on).',
    whenToUse: [
      'A sorted array, or a rotated sorted array',
      'Finding the first or last position of a value, or an insertion point',
      'A feasibility check that is monotonic in a numeric parameter ("smallest x such that ok(x)")',
      'The input is large enough that O(n) is too slow',
    ],
    steps:
      'Choose an invariant (for example: the answer is always inside [lo, hi]). Compute mid = lo + (hi − lo) / 2. If mid satisfies the condition move hi to mid (or mid − 1); otherwise move lo to mid + 1. Stop when lo meets hi (boundary search) or lo > hi (exact search).',
    memory: 'The iterative version keeps just three integers (lo, mid, hi). A recursive version would use O(log n) call-stack space.',
    complexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
      explanation: 'Each step halves the range, so at most log₂ n + 1 comparisons are needed — about 20 for a million elements.',
    },
    visual: { type: 'array', values: [2, 5, 8, 12, 16, 23, 38] },
    templates: {
      Python: `
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      JavaScript: `
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    },
    mistakes: [
      { mistake: 'Integer overflow in (lo + hi) / 2', explanation: 'In languages with fixed-width integers, compute lo + (hi − lo) / 2 instead.' },
      { mistake: 'Infinite loops from off-by-one updates', explanation: 'If you set lo = mid inside "while lo < hi" you must round mid up. Pick one invariant and stay consistent.' },
      { mistake: 'Applying it to unsorted data', explanation: 'Binary search needs a sorted, or otherwise monotonic, search space.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Search Insert Position',
        statement: 'Given a sorted array of distinct integers and a target, return the index if the target is found; otherwise return the index where it would be inserted to keep the array sorted.',
        example: 'Input: nums = [1,3,5,6], target = 5 → 2\nInput: nums = [1,3,5,6], target = 2 → 1',
        hint: 'Search for the first index whose value is greater than or equal to the target.',
        solution: `
def search_insert(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
        explanation: 'This is a boundary search: hi only ever moves to a position that could still be the first value ≥ target.',
        complexity: 'O(log n) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Koko Eating Bananas',
        statement: 'Koko has piles of bananas and h hours. Each hour she eats up to k bananas from a single pile. Return the minimum integer k that lets her finish all piles within h hours.',
        example: 'Input: piles = [3,6,7,11], h = 8\nOutput: 4',
        hint: 'The hours needed never increase as k grows, so binary search k between 1 and max(piles).',
        solution: `
def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        hours = sum((p + mid - 1) // mid for p in piles)
        if hours <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        explanation: 'Feasibility is monotonic in k, so the smallest feasible speed is found by binary searching the answer itself.',
        complexity: 'O(n log max(piles)) time, O(1) space',
      },
    ],
    questionCategory: 'sorting-searching',
    related: ['Two Pointers', 'Sorting', 'Arrays', 'Binary Search Tree', 'Divide and Conquer'],
  },

  // ------------------------------------------------------------------------- BFS
  {
    id: 'bfs',
    keys: ['bfs', 'breadth first search', 'breadth-first search', 'breadth first'],
    title: 'Breadth-First Search (BFS)',
    summary: 'BFS explores a graph or tree level by level, visiting every node at distance d before any node at distance d + 1.',
    analogy: 'It is like the ripple that spreads when you drop a stone in a pond: the wave reaches everything one step away first, then everything two steps away, and so on.',
    keyIdea:
      'Use a queue. Start with the source, mark it visited, then repeatedly dequeue a node and enqueue its unvisited neighbours. Because nodes leave the queue in order of distance, the first time BFS reaches a node it has found the shortest path in an unweighted graph.',
    whenToUse: [
      'Shortest path or fewest steps in an unweighted graph or grid',
      'Level-order traversal of a tree',
      'Multi-source spreading problems (rotting oranges, walls and gates)',
      'Word-ladder style state-space searches where each move costs 1',
    ],
    steps:
      'Push the start node into a queue and mark it visited. While the queue is not empty, pop the front node, process it, and push every neighbour that is not yet visited — marking it visited when you push it, not when you pop it. To track distance, process the queue one level at a time or store the distance next to each node.',
    memory: 'The queue can hold an entire frontier, and the visited set holds every discovered node, so memory is O(V).',
    complexity: {
      best: 'O(1)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)',
      explanation: 'Every vertex is enqueued once and every edge is examined once (twice in an undirected graph). If the goal is found immediately the search can stop early.',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
from collections import deque

def bfs_shortest_path(graph, start, goal):
    queue = deque([(start, 0)])
    visited = {start}
    while queue:
        node, dist = queue.popleft()
        if node == goal:
            return dist
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)
                queue.append((nxt, dist + 1))
    return -1`,
      JavaScript: `
function bfsShortestPath(graph, start, goal) {
  const queue = [[start, 0]];
  const visited = new Set([start]);
  for (let head = 0; head < queue.length; head++) {
    const [node, dist] = queue[head];
    if (node === goal) return dist;
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, dist + 1]);
      }
    }
  }
  return -1;
}`,
    },
    mistakes: [
      { mistake: 'Marking visited when popping instead of pushing', explanation: 'The same node can then be queued many times, blowing up time and memory.' },
      { mistake: 'Using BFS on a weighted graph', explanation: 'BFS only gives shortest paths when every edge costs the same. Use Dijkstra when edges have weights.' },
      { mistake: 'Using list.pop(0) as a queue in Python', explanation: 'It is O(n) per call; use collections.deque for O(1) pops from the front.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Binary Tree Level Order Traversal',
        statement: 'Given the root of a binary tree, return its values level by level, from left to right.',
        example: 'Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]',
        hint: 'Snapshot the queue length at the start of each level and process exactly that many nodes.',
        solution: `
from collections import deque

def level_order(root):
    if not root:
        return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
        explanation: 'Processing len(queue) nodes per round keeps each level separate.',
        complexity: 'O(n) time, O(w) space (w = widest level)',
      },
      {
        difficulty: 'Medium',
        title: 'Rotting Oranges',
        statement: 'In a grid, 0 is an empty cell, 1 a fresh orange and 2 a rotten orange. Each minute, every fresh orange next to a rotten one (up, down, left, right) becomes rotten. Return the minutes until no fresh orange remains, or -1 if that is impossible.',
        example: 'Input: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4',
        hint: 'Start the BFS from all rotten oranges at once (multi-source) and count the levels.',
        solution: `
from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue, fresh = deque(), 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes`,
        explanation: 'Each BFS level is one minute; if any fresh orange is left after the queue empties, it was unreachable.',
        complexity: 'O(R·C) time and space',
      },
    ],
    questionCategory: 'graphs',
    related: ['DFS', 'Graphs', 'Queue', 'Shortest Path Algorithms', 'Topological Sort'],
  },

  // ------------------------------------------------------------------------- DFS
  {
    id: 'dfs',
    keys: ['dfs', 'depth first search', 'depth-first search', 'depth first'],
    title: 'Depth-First Search (DFS)',
    summary: 'Depth-first search follows one path as far as it can before backing up and trying the next branch.',
    analogy: 'It is like exploring a maze by always taking the first unexplored corridor, and only turning back when you hit a dead end.',
    keyIdea:
      'Use recursion (or your own stack): visit a node, mark it visited, then recurse into each unvisited neighbour. DFS naturally explores whole components and produces entry and exit times, which power cycle detection, topological sorting and connected-component counting.',
    whenToUse: [
      'Counting or labelling connected components and islands',
      'Detecting cycles, or checking whether a path exists',
      'Tree problems: depth, paths, subtree properties',
      'Topological sort and backtracking-style exhaustive search',
    ],
    steps:
      'Mark the current node visited, do any pre-order work, recurse into each unvisited neighbour, then do any post-order work. On a grid the neighbours are the 4 (or 8) adjacent cells inside the bounds. To avoid deep recursion, use an explicit stack instead.',
    memory: 'The recursion stack can be as deep as the longest path, up to O(V); the visited set adds another O(V).',
    complexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)',
      explanation: 'Every vertex is visited once and every edge is checked once. The recursion stack can grow as deep as the longest path.',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
def count_islands(grid):
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != "1":
            return
        grid[r][c] = "0"  # mark visited
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            dfs(r + dr, c + dc)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                dfs(r, c)
    return islands`,
      JavaScript: `
function countIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; // mark visited
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  }
  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") { islands++; dfs(r, c); }
    }
  }
  return islands;
}`,
    },
    mistakes: [
      { mistake: 'Forgetting to mark nodes visited', explanation: 'On a graph with cycles the recursion never terminates.' },
      { mistake: 'Stack overflow on deep graphs', explanation: 'A long chain can exceed the recursion limit (about 1000 in Python). Switch to an explicit stack.' },
      { mistake: 'Confusing directed and undirected cycle checks', explanation: 'In a directed graph you need to know whether a neighbour is on the current path, not merely whether it was visited.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Maximum Depth of Binary Tree',
        statement: 'Given the root of a binary tree, return its maximum depth: the number of nodes on the longest path from the root down to a leaf.',
        example: 'Input: root = [3,9,20,null,null,15,7]\nOutput: 3',
        hint: 'The depth of a node is 1 plus the larger depth of its two children; an empty tree has depth 0.',
        solution: `
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
        explanation: 'A post-order DFS: each node combines the answers already computed for its children.',
        complexity: 'O(n) time, O(h) space',
      },
      {
        difficulty: 'Medium',
        title: 'Max Area of Island',
        statement: 'Given a binary grid, return the area (number of 1s) of the largest island of 4-directionally connected 1s, or 0 if there is none.',
        example: 'Input: grid = [[0,1,0],[1,1,0],[0,0,1]]\nOutput: 3',
        hint: 'Let each DFS call return the size of the island it just flooded.',
        solution: `
def max_area_of_island(grid):
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

    return max((dfs(r, c) for r in range(rows) for c in range(cols)), default=0)`,
        explanation: 'Sinking each visited cell prevents counting it twice, and the recursion sums the sizes of the four neighbouring flood fills.',
        complexity: 'O(R·C) time, O(R·C) recursion depth in the worst case',
      },
      {
        difficulty: 'Medium',
        title: 'Course Schedule',
        statement: 'There are numCourses courses labelled 0..n-1 and prerequisite pairs [a, b] meaning you must take b before a. Return true if you can finish all courses.',
        example: 'Input: numCourses = 2, prerequisites = [[1,0]] → true\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]] → false',
        hint: 'It is possible exactly when the graph has no cycle. Use DFS with three states: new, on the current path, finished.',
        solution: `
def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for course, pre in prerequisites:
        graph[pre].append(course)
    state = [0] * num_courses  # 0 = new, 1 = on current path, 2 = finished

    def has_cycle(node):
        if state[node] == 1:
            return True
        if state[node] == 2:
            return False
        state[node] = 1
        if any(has_cycle(nxt) for nxt in graph[node]):
            return True
        state[node] = 2
        return False

    return not any(has_cycle(n) for n in range(num_courses))`,
        explanation: 'Reaching a node that is still on the current path means we found a back edge, i.e. a cycle.',
        complexity: 'O(V + E) time and space',
      },
    ],
    questionCategory: 'graphs',
    related: ['BFS', 'Graphs', 'Recursion', 'Backtracking', 'Topological Sort'],
  },

  // ------------------------------------------------------------------- union-find
  {
    id: 'union-find',
    keys: ['union find', 'union-find', 'disjoint set', 'disjoint sets', 'disjoint set union', 'dsu'],
    title: 'Union-Find (Disjoint Set)',
    summary: 'Union-Find (disjoint set union) tracks which elements belong to the same group and merges groups efficiently.',
    analogy: 'Picture friend circles at a party: "find" asks whose circle you are in (who is the group leader), and "union" merges two circles when their members meet.',
    keyIdea:
      'Each set is a tree with a representative root. find(x) walks up to the root (flattening the path as it goes — path compression); union(a, b) links the two roots, attaching the smaller tree under the larger. Together these make each operation almost O(1) amortized.',
    whenToUse: [
      'Counting or merging connected components as edges arrive',
      'Detecting a cycle in an undirected graph (an edge whose endpoints are already connected)',
      "Kruskal's minimum spanning tree",
      'Grouping equivalent items (accounts merge, similar strings)',
    ],
    steps:
      'Start with parent[i] = i. find(x): while parent[x] != x, set parent[x] = parent[parent[x]] and move up. union(a, b): find both roots; if they are equal the elements are already connected, otherwise link the smaller root under the larger and update the sizes.',
    memory: 'Two integer arrays (parent and size) of length n, so O(n) memory — no explicit tree nodes are allocated.',
    complexity: {
      best: 'O(1)',
      average: 'O(α(n)) ≈ O(1)',
      worst: 'O(α(n)) amortized',
      space: 'O(n)',
      explanation: 'With path compression and union by size, m operations on n elements take O(m·α(n)) where α (the inverse Ackermann function) stays below 5 for any practical n. Without the optimisations a single find can degrade to O(n).',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path compression
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.components -= 1
        return True`,
      JavaScript: `
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.components = n;
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // path compression
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.components--;
    return true;
  }
}`,
    },
    mistakes: [
      { mistake: 'Comparing parents instead of roots', explanation: 'Always call find() on both elements; parent[x] is only the root after compression.' },
      { mistake: 'Skipping union by size', explanation: 'Without it, trees can degrade into long chains and finds become slow.' },
      { mistake: 'Forgetting to update the component count', explanation: 'Decrement only when a union actually merges two different sets.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Number of Provinces',
        statement: 'Given an n×n matrix isConnected where isConnected[i][j] = 1 means cities i and j are directly connected, return the number of provinces (groups of directly or indirectly connected cities).',
        example: 'Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2',
        hint: 'Union every connected pair; the answer is the number of components that remain.',
        solution: `
def find_circle_num(is_connected):
    n = len(is_connected)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j] and find(i) != find(j):
                parent[find(i)] = find(j)
                components -= 1
    return components`,
        explanation: 'Every successful merge reduces the number of groups by one.',
        complexity: 'O(n² · α(n)) time, O(n) space',
      },
      {
        difficulty: 'Medium',
        title: 'Redundant Connection',
        statement: 'A tree with n nodes had one extra edge added, creating exactly one cycle. Given the edges, return the extra edge that can be removed to leave a tree (the last such edge in the input if several qualify).',
        example: 'Input: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]',
        hint: 'The first edge whose endpoints are already connected is the one that closes the cycle.',
        solution: `
def find_redundant_connection(edges):
    parent = list(range(len(edges) + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        parent[ra] = rb
    return []`,
        explanation: 'Adding an edge inside an existing component is exactly what creates a cycle.',
        complexity: 'O(n · α(n)) time, O(n) space',
      },
    ],
    questionCategory: 'graphs',
    related: ['Graphs', 'DFS', 'Minimum Spanning Tree', 'Hash Table'],
  },

  // ------------------------------------------------------------ topological sort
  {
    id: 'topological-sort',
    keys: ['topological sort', 'topological sorting', 'topological order', 'topo sort', "kahn's algorithm", 'kahns algorithm'],
    title: 'Topological Sort',
    summary: 'Topological sorting lines up the vertices of a directed acyclic graph so that every edge points from an earlier vertex to a later one.',
    analogy: 'It is getting dressed: socks before shoes, shirt before jacket. Any order that respects every "must come before" rule is valid.',
    keyIdea:
      "Kahn's algorithm repeatedly removes vertices that have no remaining prerequisites (in-degree 0) and lowers the in-degree of their neighbours. If every vertex can be removed you have a valid order; if some remain, there is a cycle and no order exists. A DFS that appends each vertex after visiting its descendants (then reversing) gives the same result.",
    whenToUse: [
      'Task or build ordering with dependencies',
      'Course prerequisites ("can all courses be finished?")',
      'Detecting a cycle in a directed graph',
      'Longest path or DP on a DAG (process vertices in topological order)',
    ],
    steps:
      'Compute the in-degree of every vertex and put all in-degree-0 vertices in a queue. Repeatedly pop a vertex, append it to the order, and decrement the in-degree of each neighbour, queueing any that reach 0. If the order ends up with fewer than V vertices, the graph contains a cycle.',
    memory: 'An adjacency list plus an in-degree array and a queue: O(V + E) memory overall.',
    complexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V + E)',
      explanation: 'Each vertex is queued once and each edge is relaxed once.',
    },
    visual: { type: 'graph' },
    templates: {
      Python: `
from collections import deque

def topological_order(n, edges):
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v in edges:            # u must come before v
        graph[u].append(v)
        indegree[v] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []   # [] means a cycle exists`,
      JavaScript: `
function topologicalOrder(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [u, v] of edges) { // u must come before v
    graph[u].push(v);
    indegree[v]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  const order = [];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    order.push(node);
    for (const next of graph[node]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return order.length === n ? order : []; // [] means a cycle exists
}`,
    },
    mistakes: [
      { mistake: 'Assuming the order is unique', explanation: 'Many valid orders usually exist, so never compare against one expected list.' },
      { mistake: 'Ignoring cycles', explanation: 'If the result has fewer than V vertices there is a cycle. Report it rather than returning a partial order.' },
      { mistake: 'Reversing the edge direction', explanation: 'Decide what an edge means (u before v) and build the graph consistently.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Course Schedule II',
        statement: 'Given numCourses and prerequisite pairs [a, b] (take b before a), return any order in which you can finish all courses, or an empty list if it is impossible.',
        example: 'Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,1,2,3] (or [0,2,1,3])',
        hint: "Run Kahn's algorithm and check that every course was scheduled.",
        solution: `
from collections import deque

def find_order(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, pre in prerequisites:
        graph[pre].append(course)
        indegree[course] += 1
    queue = deque(i for i in range(num_courses) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == num_courses else []`,
        explanation: 'A course becomes available exactly when all of its prerequisites have been scheduled.',
        complexity: 'O(V + E) time and space',
      },
      {
        difficulty: 'Medium',
        title: 'Parallel Courses (Minimum Semesters)',
        statement: 'There are n courses labelled 1..n and relations [prev, next]. In each semester you may take any courses whose prerequisites are already done. Return the minimum number of semesters to finish all courses, or -1 if impossible.',
        example: 'Input: n = 3, relations = [[1,3],[2,3]]\nOutput: 2',
        hint: "Run Kahn's algorithm level by level: each level of the queue is one semester.",
        solution: `
from collections import deque

def minimum_semesters(n, relations):
    graph = [[] for _ in range(n + 1)]
    indegree = [0] * (n + 1)
    for prev, nxt in relations:
        graph[prev].append(nxt)
        indegree[nxt] += 1
    queue = deque(i for i in range(1, n + 1) if indegree[i] == 0)
    semesters = taken = 0
    while queue:
        semesters += 1
        for _ in range(len(queue)):
            node = queue.popleft()
            taken += 1
            for nxt in graph[node]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
    return semesters if taken == n else -1`,
        explanation: 'The number of BFS levels is the length of the longest dependency chain; leftover courses mean a cycle.',
        complexity: 'O(n + E) time and space',
      },
    ],
    questionCategory: 'graphs',
    related: ['DFS', 'BFS', 'Graphs', 'Dynamic Programming'],
  },

  // --------------------------------------------------------------------------- heap
  {
    id: 'heap',
    keys: ['heap', 'heaps', 'priority queue', 'priority queues', 'min heap', 'max heap', 'min-heap', 'max-heap', 'top k elements', 'top k', 'kth largest', 'k largest'],
    title: 'Heap / Priority Queue',
    summary: 'A heap is a tree-shaped structure stored in an array that always keeps the smallest (min-heap) or largest (max-heap) element at the root, giving fast access to the extreme value.',
    analogy: 'It is a hospital emergency room: patients are not seen in arrival order — whoever is most urgent goes next, and new arrivals slot in by urgency.',
    keyIdea:
      'Push adds an element at the end and sifts it up; pop swaps the root with the last element, removes it, and sifts the new root down. Both cost O(log n), while peeking at the extreme is O(1). Use a heap whenever you repeatedly need "the current best" of a changing collection — top-k, merging sorted streams, scheduling, Dijkstra.',
    whenToUse: [
      'The k-th largest or smallest element, or the top k elements',
      'Merging k sorted lists or streams',
      'Repeatedly picking the min or max while items change (Dijkstra, task scheduling)',
      'A running median (two heaps)',
    ],
    steps:
      'Array layout: the children of index i are 2i + 1 and 2i + 2, and the parent is (i − 1) // 2. Push: append, then swap upward while smaller than the parent. Pop: move the last element to the root, then swap downward with the smaller child while larger. In Python use heapq (a min-heap — negate values for a max-heap).',
    memory: 'A complete binary tree fits in a plain array with no node objects or pointers, so a heap of n items uses exactly n slots.',
    complexity: {
      best: 'O(1) peek',
      average: 'O(log n) push / pop',
      worst: 'O(log n) push / pop',
      space: 'O(n)',
      explanation: 'The tree height is log₂ n, so sifting takes at most that many swaps. Building a heap from n items with heapify is O(n), not O(n log n).',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
import heapq

def k_largest(nums, k):
    heap = []                      # min-heap holding the k largest values seen so far
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)    # drop the smallest
    return sorted(heap, reverse=True)`,
      JavaScript: `
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < a.length && a[l] < a[s]) s = l;
        if (r < a.length && a[r] < a[s]) s = r;
        if (s === i) break;
        [a[s], a[i]] = [a[i], a[s]];
        i = s;
      }
    }
    return top;
  }
}`,
    },
    mistakes: [
      { mistake: 'Expecting a max-heap from heapq', explanation: "Python's heapq is a min-heap. Push negated values to simulate a max-heap." },
      { mistake: 'Sorting when a heap suffices', explanation: 'Sorting everything is O(n log n); keeping a heap of size k is O(n log k).' },
      { mistake: 'Believing the underlying array is sorted', explanation: 'Only the root is guaranteed to be the extreme; the rest of the array is only partially ordered.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Last Stone Weight',
        statement: 'Given stone weights, repeatedly smash the two heaviest stones: if they are equal both vanish, otherwise the difference remains. Return the weight of the last remaining stone, or 0 if none remain.',
        example: 'Input: stones = [2,7,4,1,8,1]\nOutput: 1',
        hint: 'Use a max-heap (negate the values in Python).',
        solution: `
import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0`,
        explanation: 'The heap always exposes the two heaviest stones in O(log n).',
        complexity: 'O(n log n) time, O(n) space',
      },
      {
        difficulty: 'Medium',
        title: 'Kth Largest Element in an Array',
        statement: 'Given an integer array nums and an integer k, return the k-th largest element (not the k-th distinct one).',
        example: 'Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5',
        hint: 'Keep a min-heap of size k; its root is the answer.',
        solution: `
import heapq

def find_kth_largest(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for x in nums[k:]:
        if x > heap[0]:
            heapq.heapreplace(heap, x)
    return heap[0]`,
        explanation: 'The heap holds the k largest values seen so far; its smallest element is the k-th largest overall.',
        complexity: 'O(n log k) time, O(k) space',
      },
      {
        difficulty: 'Medium',
        title: 'Merge K Sorted Arrays',
        statement: 'Given k sorted arrays, merge them into one sorted array.',
        example: 'Input: [[1,4,7],[2,5],[3,6,8]]\nOutput: [1,2,3,4,5,6,7,8]',
        hint: 'Keep one candidate per array in a min-heap as (value, array index, element index).',
        solution: `
import heapq

def merge_k_sorted(arrays):
    heap = [(arr[0], i, 0) for i, arr in enumerate(arrays) if arr]
    heapq.heapify(heap)
    merged = []
    while heap:
        value, i, j = heapq.heappop(heap)
        merged.append(value)
        if j + 1 < len(arrays[i]):
            heapq.heappush(heap, (arrays[i][j + 1], i, j + 1))
    return merged`,
        explanation: 'The smallest unmerged value is always at the front of one of the arrays, and the heap finds it in O(log k).',
        complexity: 'O(N log k) time, where N is the total number of elements',
      },
    ],
    questionCategory: 'heaps-tries',
    related: ['Sorting', 'Priority Queue', "Dijkstra's Algorithm", 'Greedy', 'Trie'],
  },

  // -------------------------------------------------------------------------- trie
  {
    id: 'trie',
    keys: ['trie', 'tries', 'prefix tree', 'prefix trees'],
    title: 'Trie (Prefix Tree)',
    summary: 'A trie stores words letter by letter along a path, so words that share a prefix share the same nodes.',
    analogy: "It works like a phone's autocomplete: as you type each letter you follow one more branch of a tree, and everything below your current spot is a word that starts with what you typed.",
    keyIdea:
      "Each node has children keyed by character and a flag marking the end of a word. Insert, search and prefix-check all cost O(L) for a word of length L — independent of how many words are stored — something a hash set cannot offer for prefix queries.",
    whenToUse: [
      'Autocomplete, spell-check, or "starts with" queries',
      'Many words sharing prefixes (a dictionary, IP routing tables)',
      'Searching a grid or text for many words at once (Word Search II)',
      'Longest common prefix of a set of strings',
    ],
    steps:
      'Start at the root. To insert a word, follow (or create) the child for each character and mark the last node as a word end. To search, follow the children; the word exists if you reach the end of it and the flag is set. For a prefix query only the path has to exist.',
    memory: 'Each node holds a child map or a 26-slot array. Shared prefixes are stored once, but sparse nodes waste space, so compressed (radix) tries are used for large dictionaries.',
    complexity: {
      best: 'O(L)',
      average: 'O(L)',
      worst: 'O(L)',
      space: 'O(total characters)',
      explanation: 'Each operation walks at most L nodes. Memory is proportional to the number of distinct prefix nodes; a dictionary of only the letters present uses less space than a fixed 26-slot array.',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True

    def _walk(self, text):
        node = self.root
        for ch in text:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def starts_with(self, prefix):
        return self._walk(prefix) is not None`,
      JavaScript: `
class Trie {
  constructor() { this.root = { children: new Map(), isWord: false }; }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), isWord: false });
      node = node.children.get(ch);
    }
    node.isWord = true;
  }
  walk(text) {
    let node = this.root;
    for (const ch of text) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
  search(word) { const n = this.walk(word); return n !== null && n.isWord; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
}`,
    },
    mistakes: [
      { mistake: 'Forgetting the end-of-word flag', explanation: 'Without it "app" looks present after inserting only "apple".' },
      { mistake: 'Using a trie where a hash set is enough', explanation: 'If you never query prefixes, a set is simpler and smaller.' },
      { mistake: 'Ignoring memory', explanation: 'Large alphabets with fixed-size child arrays waste space; use maps or a compressed trie.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Longest Common Prefix',
        statement: 'Return the longest common prefix of an array of strings, or an empty string if there is none.',
        example: 'Input: ["flower","flow","flight"]\nOutput: "fl"',
        hint: 'A trie works, but comparing the strings column by column is simpler.',
        solution: `
def longest_common_prefix(strs):
    if not strs:
        return ""
    for i, ch in enumerate(strs[0]):
        for s in strs[1:]:
            if i == len(s) or s[i] != ch:
                return strs[0][:i]
    return strs[0]`,
        explanation: 'Scan the first string character by character and stop at the first column where any string differs or ends.',
        complexity: 'O(total characters) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Implement Trie (Prefix Tree)',
        statement: 'Implement a Trie with insert(word), search(word) and startsWith(prefix).',
        example: 'insert("apple"); search("apple") → true; search("app") → false; startsWith("app") → true',
        hint: 'Each node needs a dictionary of children and an is_word flag.',
        solution: `
class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def _find(self, text):
        node = self.root
        for ch in text:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word):
        node = self._find(word)
        return node is not None and "$" in node

    def startsWith(self, prefix):
        return self._find(prefix) is not None`,
        explanation: 'Nested dictionaries form the tree; the special key "$" marks the end of a word.',
        complexity: 'O(L) per operation',
      },
      {
        difficulty: 'Medium',
        title: 'Design Add and Search Words',
        statement: 'Design a structure that supports addWord(word) and search(word), where search may contain "." which matches any single letter.',
        example: 'addWord("bad"); addWord("dad"); search("pad") → false; search(".ad") → true; search("b..") → true',
        hint: 'Search the trie recursively; when you meet ".", try every child.',
        solution: `
class WordDictionary:
    def __init__(self):
        self.root = {}

    def add_word(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":
                return any(dfs(child, i + 1) for key, child in node.items() if key != "$")
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)`,
        explanation: 'A wildcard branches into every child, so the worst case explores many paths; plain letters follow a single path.',
        complexity: 'O(L) to add; search is O(L) without wildcards and exponential in the number of wildcards in the worst case',
      },
    ],
    questionCategory: 'heaps-tries',
    related: ['Hash Table', 'Strings', 'DFS', 'Backtracking', 'Heap'],
  },

  // ---------------------------------------------------------------- backtracking
  {
    id: 'backtracking',
    keys: ['backtracking', 'back tracking', 'backtrack'],
    title: 'Backtracking',
    summary: 'Backtracking builds a solution one choice at a time and abandons a partial solution as soon as it cannot lead to a valid answer.',
    analogy: 'It is walking a maze with chalk: take a corridor, and if it turns out to be a dead end, walk back to the last junction, rub out your mark, and try another way.',
    keyIdea:
      'Recurse over a decision tree: choose an option, explore deeper, then undo the choice (backtrack) so the next option starts from a clean state. Prune early — skip options that already violate a constraint — because that is what separates backtracking from plain brute force.',
    whenToUse: [
      'Generating all subsets, permutations or combinations',
      'Constraint puzzles: N-Queens, Sudoku, word search',
      'Partition or split problems that need every valid arrangement',
      'The problem statement says "return all ..." solutions',
    ],
    steps:
      'Define the state (the current path and the choices left). If the path is a complete solution, record a copy of it. Otherwise loop over the available choices: apply one, recurse, then undo it. Put pruning checks before the recursive call (sorted input, remaining sum below zero, column already used).',
    memory: 'Beyond the output itself, memory is the recursion depth plus the current path — typically O(n).',
    complexity: {
      best: 'Depends on pruning',
      average: 'Exponential',
      worst: 'O(n · 2ⁿ) for subsets, O(n · n!) for permutations',
      space: 'O(n) recursion depth',
      explanation: 'The decision tree can have exponentially many nodes. Pruning cuts branches early but the worst case stays exponential; extra space is the recursion depth plus the output.',
    },
    visual: { type: 'tree' },
    templates: {
      Python: `
def subsets(nums):
    result, path = [], []

    def backtrack(start):
        result.append(path[:])          # record a copy of the current subset
        for i in range(start, len(nums)):
            path.append(nums[i])        # choose
            backtrack(i + 1)            # explore
            path.pop()                  # undo

    backtrack(0)
    return result`,
      JavaScript: `
function subsets(nums) {
  const result = [], path = [];
  function backtrack(start) {
    result.push([...path]);            // record a copy of the current subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);              // choose
      backtrack(i + 1);                // explore
      path.pop();                      // undo
    }
  }
  backtrack(0);
  return result;
}`,
    },
    mistakes: [
      { mistake: 'Storing the path itself instead of a copy', explanation: 'Later mutations change results you already saved. Append path[:] (or a spread copy).' },
      { mistake: 'Forgetting to undo the choice', explanation: 'State leaks into sibling branches and produces wrong answers.' },
      { mistake: 'No pruning', explanation: 'Without early exits it degrades to brute force and times out.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Permutations',
        statement: 'Given an array of distinct integers, return all possible permutations.',
        example: 'Input: [1,2,3]\nOutput: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
        hint: 'At each position try every number that has not been used yet.',
        solution: `
def permute(nums):
    result, path, used = [], [], [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(x)
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return result`,
        explanation: 'The used array is the "undo" state: it is set before the recursive call and cleared afterwards.',
        complexity: 'O(n · n!) time',
      },
      {
        difficulty: 'Medium',
        title: 'Combination Sum',
        statement: 'Given distinct positive integers candidates and a target, return all unique combinations that sum to target. The same number may be used any number of times.',
        example: 'Input: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]',
        hint: 'Recurse from the current index (which allows reuse) and stop when the remaining target goes negative.',
        solution: `
def combination_sum(candidates, target):
    result, path = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                continue
            path.append(candidates[i])
            backtrack(i, remaining - candidates[i])
            path.pop()

    backtrack(0, target)
    return result`,
        explanation: 'Starting each loop at index start (not 0) prevents the same combination from appearing in a different order.',
        complexity: 'Exponential in target / min(candidates)',
      },
      {
        difficulty: 'Hard',
        title: 'N-Queens (count solutions)',
        statement: 'Place n queens on an n×n board so that no two attack each other. Return the number of distinct solutions.',
        example: 'Input: n = 4\nOutput: 2',
        hint: 'Place one queen per row and track the used columns and both diagonals (row − col and row + col).',
        solution: `
def total_n_queens(n):
    cols, diag1, diag2 = set(), set(), set()

    def place(row):
        if row == n:
            return 1
        count = 0
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            count += place(row + 1)
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)
        return count

    return place(0)`,
        explanation: 'The three sets make each safety check O(1), and undoing them on return keeps sibling branches independent.',
        complexity: 'Roughly O(n!) in the worst case, far less with pruning',
      },
    ],
    questionCategory: 'recursion',
    related: ['Recursion', 'DFS', 'Dynamic Programming', 'Bit Manipulation'],
  },

  // -------------------------------------------------------- dynamic programming
  {
    id: 'dynamic-programming',
    keys: ['dynamic programming', 'dp', 'memoization', 'memoisation', 'tabulation'],
    title: 'Dynamic Programming',
    summary: 'Dynamic programming solves a big problem by combining the answers to smaller overlapping subproblems, computing each of them only once.',
    analogy: 'It is a notebook of solved sub-questions: before working something out, check the notebook; after working it out, write the answer down so you never redo it.',
    keyIdea:
      'Define the state (the information that identifies a subproblem), the transition (how a state is built from smaller ones) and the base cases. Then either recurse with a cache (top-down memoization) or fill a table in dependency order (bottom-up tabulation). It applies when the problem has overlapping subproblems and optimal substructure.',
    whenToUse: [
      '"Count the number of ways ..." or "minimum / maximum cost to ..."',
      'Choices at each step that affect future options (knapsack, house robber)',
      'Two sequences compared position by position (LCS, edit distance)',
      'A brute-force recursion that recomputes the same arguments many times',
    ],
    steps:
      '1) Write the brute-force recursion. 2) Identify the parameters that change between calls — they are the state. 3) Add memoization (a dictionary or array keyed by the state). 4) Optionally convert to a bottom-up table and shrink the space by keeping only the rows you still need.',
    memory: 'A table with one cell per state — often reducible: a 2-D table that only looks at the previous row needs just two rows, and a 1-D recurrence on the last two values needs O(1).',
    complexity: {
      best: 'O(states × work per state)',
      average: 'O(states × work per state)',
      worst: 'O(states × work per state)',
      space: 'O(states), often reducible',
      explanation: 'Each state is computed once, so total time is (number of states) × (work to compute one state). Fibonacci has n states with O(1) work each; LCS has m·n states.',
    },
    visual: { type: 'array', values: [0, 1, 1, 2, 3, 5, 8] },
    templates: {
      Python: `
def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount          # dp[a] = fewest coins that make amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1`,
      JavaScript: `
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // dp[a] = fewest coins that make amount a
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    },
    mistakes: [
      { mistake: 'A wrong or incomplete state', explanation: 'If two different situations share a state but need different answers, the state is missing a parameter.' },
      { mistake: 'Missing base cases or bad initial values', explanation: 'Use infinity for "unreachable" in minimisation problems and 0 for the empty case in counting problems.' },
      { mistake: 'Mixing up 0/1 and unbounded knapsack', explanation: 'Iterate the capacity downward for one use per item and upward when items can repeat.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Climbing Stairs',
        statement: 'You climb a staircase of n steps taking 1 or 2 steps at a time. In how many distinct ways can you reach the top?',
        example: 'Input: n = 3\nOutput: 3   (1+1+1, 1+2, 2+1)',
        hint: 'The ways to reach step i are the ways to reach i − 1 plus the ways to reach i − 2.',
        solution: `
def climb_stairs(n):
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
        explanation: 'This is Fibonacci; keeping only the last two values needs no array.',
        complexity: 'O(n) time, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Longest Common Subsequence',
        statement: 'Given two strings, return the length of their longest common subsequence (characters in order, not necessarily contiguous).',
        example: 'Input: "abcde", "ace"\nOutput: 3',
        hint: 'dp[i][j] extends dp[i-1][j-1] on a match; otherwise it is the better of dp[i-1][j] and dp[i][j-1].',
        solution: `
def longest_common_subsequence(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1]`,
        explanation: 'Each cell answers "what is the LCS of the first i characters of a and the first j of b?".',
        complexity: 'O(m·n) time and space',
      },
      {
        difficulty: 'Hard',
        title: 'Edit Distance',
        statement: 'Given two strings word1 and word2, return the minimum number of operations (insert, delete or replace a character) needed to convert word1 into word2.',
        example: 'Input: "horse", "ros"\nOutput: 3',
        hint: 'dp[i][j] is the edit distance between the first i characters of word1 and the first j of word2. Think about insert, delete and replace as three neighbouring cells.',
        solution: `
def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`,
        explanation: 'The first row and column handle converting to or from an empty string; every other cell picks the cheapest of the three operations.',
        complexity: 'O(m·n) time and space',
      },
    ],
    questionCategory: 'dp',
    related: ['Recursion', 'Greedy', 'Backtracking', 'Hash Table', 'Knapsack Problem'],
  },

  // ------------------------------------------------------------ bit manipulation
  {
    id: 'bit-manipulation',
    keys: ['bit manipulation', 'bitwise', 'bit tricks', 'bitmask', 'bit masks', 'bits'],
    title: 'Bit Manipulation',
    summary: 'Bit manipulation works directly on the binary digits of integers using AND, OR, XOR, NOT and shifts, giving fast, memory-light solutions.',
    analogy: 'Think of a row of light switches: each bit is one switch, and the bitwise operators flip, test or combine many switches at once.',
    keyIdea:
      'Key identities: x ^ x = 0 and x ^ 0 = x (XOR cancels pairs); x & (x − 1) clears the lowest set bit; x & −x isolates it; 1 << i builds a mask for bit i. Bitmasks also encode subsets: an n-bit integer says which of n items are chosen.',
    whenToUse: [
      '"Every element appears twice except one"',
      'Counting set bits, checking powers of two, swapping without a temporary',
      'Representing subsets or visited sets compactly (bitmask DP, up to about 20 items)',
      'Flags and permissions packed into one integer',
    ],
    steps:
      'Test bit i: (x >> i) & 1. Set it: x | (1 << i). Clear it: x & ~(1 << i). Toggle it: x ^ (1 << i). Count set bits: repeat x &= x − 1 until x is 0. Iterate over all subsets of n items with mask from 0 to (1 << n) − 1.',
    memory: 'A single machine word holds 32 or 64 flags, so a bitmask of visited items uses far less memory than a boolean array.',
    complexity: {
      best: 'O(1)',
      average: 'O(1) per operation',
      worst: 'O(w), w = word size',
      space: 'O(1)',
      explanation: "Bitwise operations run in constant time on a machine word. Looping over all bits is O(w) (32 or 64); Brian Kernighan's trick loops once per set bit instead.",
    },
    visual: { type: 'array', values: [1, 0, 1, 1, 0, 1, 0, 0] },
    templates: {
      Python: `
def count_set_bits(x):
    count = 0
    while x:
        x &= x - 1      # clears the lowest set bit
        count += 1
    return count

def is_power_of_two(x):
    return x > 0 and (x & (x - 1)) == 0

def single_number(nums):
    result = 0
    for x in nums:
        result ^= x     # equal pairs cancel out
    return result`,
      JavaScript: `
function countSetBits(x) {
  let count = 0;
  while (x) {
    x &= x - 1; // clears the lowest set bit
    count++;
  }
  return count;
}

function isPowerOfTwo(x) {
  return x > 0 && (x & (x - 1)) === 0;
}

function singleNumber(nums) {
  let result = 0;
  for (const x of nums) result ^= x; // equal pairs cancel out
  return result;
}`,
    },
    mistakes: [
      { mistake: 'Signed shifts and negative numbers', explanation: 'Right-shifting a negative number is arithmetic in many languages. Use the unsigned shift (>>> in Java and JavaScript) when you need a logical shift.' },
      { mistake: 'Operator precedence', explanation: 'Wrap bit tests in parentheses: (x & 1) == 0. In many languages == binds tighter than &.' },
      { mistake: 'JavaScript bitwise operators are 32-bit', explanation: 'They convert numbers to 32-bit integers; use BigInt for larger values.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Single Number',
        statement: 'Every element of a non-empty array appears exactly twice except for one. Find the single element using linear time and constant extra space.',
        example: 'Input: [4,1,2,1,2]\nOutput: 4',
        hint: 'XOR cancels equal pairs.',
        solution: `
def single_number(nums):
    result = 0
    for x in nums:
        result ^= x
    return result`,
        explanation: 'a ^ a = 0 and a ^ 0 = a, and XOR is commutative, so every pair cancels and only the single value remains.',
        complexity: 'O(n) time, O(1) space',
      },
      {
        difficulty: 'Easy',
        title: 'Number of 1 Bits',
        statement: 'Given a positive integer n, return the number of 1 bits in its binary representation.',
        example: 'Input: n = 11 (binary 1011)\nOutput: 3',
        hint: 'x & (x − 1) removes the lowest set bit.',
        solution: `
def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,
        explanation: 'Each loop iteration removes exactly one set bit, so the loop runs once per 1 bit.',
        complexity: 'O(k) time where k is the number of set bits, O(1) space',
      },
      {
        difficulty: 'Medium',
        title: 'Counting Bits',
        statement: 'Given an integer n, return an array ans of length n + 1 where ans[i] is the number of 1 bits in i.',
        example: 'Input: n = 5\nOutput: [0,1,1,2,1,2]',
        hint: 'ans[i] = ans[i >> 1] + (i & 1): drop the last bit and add it back.',
        solution: `
def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans`,
        explanation: 'i >> 1 is i without its last bit, whose count is already known; add 1 if the last bit was set.',
        complexity: 'O(n) time, O(n) space',
      },
    ],
    questionCategory: 'greedy-bits',
    related: ['Arrays', 'Dynamic Programming', 'Backtracking', 'Math'],
  },

  // -------------------------------------------------------------- monotonic stack
  {
    id: 'monotonic-stack',
    keys: ['monotonic stack', 'monotone stack', 'monotonic stacks', 'next greater element', 'next greater'],
    title: 'Monotonic Stack',
    summary: 'A monotonic stack keeps its elements in sorted order (always increasing or always decreasing) so that "next greater / smaller element" questions can be answered in one pass.',
    analogy: 'Imagine people queueing by height where a taller newcomer pushes out every shorter person in front of them — each of those people now knows who blocked their view.',
    keyIdea:
      'Scan left to right, keeping a stack of indices whose values are in order. When a new value breaks the order, pop the stack: each popped element has just found its next greater (or smaller) element. Every index is pushed and popped once, so the whole scan is O(n).',
    whenToUse: [
      'Next greater or next smaller element',
      'Daily temperatures, stock span, histogram areas',
      'Nearest larger value to the left or right',
      'Removing digits or characters to build the smallest or largest result',
    ],
    steps:
      'Keep a stack of indices with decreasing values. For each index i: while the stack is not empty and nums[i] is greater than the value at the top index, pop the top j and record i as the answer for j; then push i. Anything left on the stack has no next greater element.',
    memory: 'The stack holds indices, so it needs at most O(n) integers.',
    complexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(n)',
      explanation: 'Each element is pushed once and popped at most once, so the nested-looking while loop does O(n) total work.',
    },
    visual: { type: 'stack' },
    templates: {
      Python: `
def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []                                   # indices of days waiting for a warmer day
    for i, t in enumerate(temps):
        while stack and t > temps[stack[-1]]:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer`,
      JavaScript: `
function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = []; // indices of days waiting for a warmer day
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}`,
    },
    mistakes: [
      { mistake: 'Storing values instead of indices', explanation: 'Most answers need distances, so keep indices on the stack and look the values up.' },
      { mistake: 'The wrong comparison direction', explanation: 'Use > for "next greater" and < for "next smaller"; decide whether equal values pop (≥ versus >).' },
      { mistake: 'Believing the while loop makes it O(n²)', explanation: 'Each element is popped at most once, so the total work is linear.' },
    ],
    problems: [
      {
        difficulty: 'Medium',
        title: 'Daily Temperatures',
        statement: 'Given daily temperatures, return an array where answer[i] is the number of days you must wait after day i for a warmer temperature (0 if there is none).',
        example: 'Input: [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]',
        hint: 'Keep a stack of days that are still waiting for a warmer day.',
        solution: `
def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and t > temps[stack[-1]]:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer`,
        explanation: 'A warmer day resolves every colder day still on the stack, and those days can never be answered again.',
        complexity: 'O(n) time, O(n) space',
      },
      {
        difficulty: 'Hard',
        title: 'Largest Rectangle in Histogram',
        statement: 'Given bar heights of a histogram (each bar has width 1), return the area of the largest rectangle that fits inside it.',
        example: 'Input: [2,1,5,6,2,3]\nOutput: 10',
        hint: "A bar's rectangle extends until a shorter bar appears on each side; an increasing stack finds both boundaries.",
        solution: `
def largest_rectangle_area(heights):
    stack, best = [], 0                       # stack of indices with increasing heights
    for i, h in enumerate(heights + [0]):     # a sentinel 0 flushes the stack
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best`,
        explanation: 'When a shorter bar arrives, the popped bar can no longer extend right; its left boundary is the new stack top.',
        complexity: 'O(n) time, O(n) space',
      },
    ],
    questionCategory: 'stacks-queues',
    related: ['Stack', 'Sliding Window', 'Arrays', 'Two Pointers'],
  },

  // ------------------------------------------------------------------- hash table
  {
    id: 'hash-table',
    keys: ['hash table', 'hash tables', 'hash map', 'hashmap', 'hash set', 'hashset', 'hashing', 'hash maps', 'hashtable'],
    title: 'Hash Table',
    summary: 'A hash table stores key–value pairs and uses a hash function to jump straight to where a key lives, giving average O(1) insert, lookup and delete.',
    analogy: 'It is a coat-check: you hand over your coat, get a numbered ticket, and later the attendant goes directly to that numbered hook instead of searching every coat.',
    keyIdea:
      'The hash function turns a key into an array index. Different keys can land in the same slot (a collision), which is handled by chaining or probing. Resizing keeps the load factor low so operations stay O(1) on average. Most "have I seen this before?" and "count occurrences" problems collapse from O(n²) to O(n) with a hash map or set.',
    whenToUse: [
      'Fast lookup by key: two-sum, complements, membership tests',
      'Counting frequencies, or grouping items by a computed key (anagrams)',
      'Detecting duplicates or cycles with a "seen" set',
      'Caching or memoizing results',
    ],
    steps:
      'Compute index = hash(key) mod capacity. Insert or look up in that bucket, comparing keys with equality to resolve collisions. When size / capacity exceeds the load factor (about 0.75), double the array and re-insert every entry.',
    memory: 'An array of buckets plus the entries themselves: O(n) memory, with some overhead per entry and spare capacity kept for a low load factor.',
    complexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(n)',
      space: 'O(n)',
      explanation: 'A good hash function spreads keys evenly, so buckets stay short. If many keys collide, one bucket degenerates into a long chain and each operation becomes O(n).',
    },
    visual: { type: 'array', values: [17, 42, 8, 23] },
    templates: {
      Python: `
def two_sum(nums, target):
    seen = {}                        # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []

def first_unique_char(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1`,
      JavaScript: `
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

function firstUniqueChar(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
  for (let i = 0; i < s.length; i++) if (counts.get(s[i]) === 1) return i;
  return -1;
}`,
    },
    mistakes: [
      { mistake: 'Using mutable objects as keys', explanation: 'Changing a key after inserting it changes its hash. Use immutable keys such as strings and tuples.' },
      { mistake: 'Assuming iteration order', explanation: "Order is not guaranteed in many languages. Python 3.7+ dicts and JavaScript Maps keep insertion order, but Java's HashMap does not." },
      { mistake: 'Ignoring worst-case collisions', explanation: 'Adversarial keys can degrade performance to O(n); mention it when security matters.' },
    ],
    problems: [
      {
        difficulty: 'Easy',
        title: 'Contains Duplicate',
        statement: 'Given an integer array nums, return true if any value appears at least twice, and false if every element is distinct.',
        example: 'Input: [1,2,3,1]\nOutput: true',
        hint: 'A set remembers what you have already seen.',
        solution: `
def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
        explanation: 'Set membership is O(1) on average, so one pass suffices instead of comparing every pair.',
        complexity: 'O(n) time, O(n) space',
      },
      {
        difficulty: 'Medium',
        title: 'Group Anagrams',
        statement: 'Given an array of strings, group the anagrams together. You may return the groups in any order.',
        example: 'Input: ["eat","tea","tan","ate","nat","bat"]\nOutput: [["eat","tea","ate"],["tan","nat"],["bat"]]',
        hint: 'Words that are anagrams have the same sorted letters — use that as the dictionary key.',
        solution: `
from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        groups["".join(sorted(w))].append(w)
    return list(groups.values())`,
        explanation: 'The sorted string is a canonical form shared by all anagrams of a word.',
        complexity: 'O(n · k log k) time, where k is the longest word',
      },
      {
        difficulty: 'Medium',
        title: 'Longest Consecutive Sequence',
        statement: 'Given an unsorted integer array, return the length of the longest run of consecutive integers (in any order in the array) in O(n) time.',
        example: 'Input: [100,4,200,1,3,2]\nOutput: 4   (1,2,3,4)',
        hint: 'Only start counting from numbers whose predecessor is not in the set.',
        solution: `
def longest_consecutive(nums):
    values, best = set(nums), 0
    for x in values:
        if x - 1 not in values:          # x starts a run
            length = 1
            while x + length in values:
                length += 1
            best = max(best, length)
    return best`,
        explanation: 'Each run is only walked once, from its first element, so the total work is linear.',
        complexity: 'O(n) time, O(n) space',
      },
    ],
    questionCategory: 'hashing',
    related: ['Arrays', 'Strings', 'Prefix Sum', 'Sliding Window', 'Trie'],
  },
  ...ENCYCLOPEDIA_GUIDES,
]

export const GUIDE_COUNT = GUIDES.length
