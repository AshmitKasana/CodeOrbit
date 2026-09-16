export const LANGUAGES = [
  'Java',
  'C',
  'C++',
  'Python',
  'JavaScript',
  'TypeScript',
  'C#',
  'Go',
  'Rust',
  'Kotlin',
  'Swift',
]

export const LANGUAGE_ALIASES = {
  java: 'Java',
  c: 'C',
  'c++': 'C++',
  cpp: 'C++',
  'c plus plus': 'C++',
  python: 'Python',
  py: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  'c#': 'C#',
  csharp: 'C#',
  'c sharp': 'C#',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  swift: 'Swift',
}

export const EXPLANATION_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Interview']

export const SIDEBAR_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'core-concept', label: 'Core Concept' },
  { id: 'syntax', label: 'Syntax' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'memory', label: 'Memory / Internal Working' },
  { id: 'examples', label: 'Examples' },
  { id: 'visual', label: 'Visual Explanation' },
  { id: 'complexity', label: 'Complexity' },
  { id: 'comparison', label: 'Language Comparison' },
  { id: 'mistakes', label: 'Common Mistakes' },
  { id: 'interview', label: 'Interview Questions' },
  { id: 'practice', label: 'Practice Problems' },
  { id: 'related', label: 'Related Topics' },
]

export const TOPIC_CATALOG = {
  'Data Structures': [
    'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Deque', 'Hash Table',
    'Trees', 'Binary Tree', 'Binary Search Tree', 'Heap', 'Trie', 'Graphs',
    'Disjoint Set', 'Segment Tree', 'Fenwick Tree',
  ],
  'Algorithms': [
    'Searching', 'Sorting', 'Recursion', 'Backtracking', 'Greedy',
    'Divide and Conquer', 'Dynamic Programming', 'Graph Algorithms', 'String Algorithms',
  ],
  'Advanced': [
    "Dijkstra's Algorithm", 'Bellman-Ford', 'Floyd-Warshall', "Kruskal's Algorithm",
    "Prim's Algorithm", 'KMP Algorithm', 'Rabin-Karp', 'Topological Sort',
    "Tarjan's Algorithm", 'Segment Trees', 'Bit Manipulation',
  ],
}

export const ROADMAP = [
  { id: 'basics', label: 'Programming Basics', topic: 'Programming Basics' },
  { id: 'complexity', label: 'Complexity Analysis', topic: 'Big O Notation' },
  { id: 'arrays-strings', label: 'Arrays & Strings', topic: 'Arrays' },
  { id: 'linked-lists', label: 'Linked Lists', topic: 'Linked List' },
  { id: 'stacks-queues', label: 'Stacks & Queues', topic: 'Stack' },
  { id: 'hashing', label: 'Hashing', topic: 'Hash Table' },
  { id: 'recursion', label: 'Recursion', topic: 'Recursion' },
  { id: 'trees', label: 'Trees', topic: 'Binary Tree' },
  { id: 'heaps', label: 'Heaps', topic: 'Heap' },
  { id: 'graphs', label: 'Graphs', topic: 'Graphs' },
  { id: 'greedy', label: 'Greedy', topic: 'Greedy' },
  { id: 'backtracking', label: 'Backtracking', topic: 'Backtracking' },
  { id: 'dp', label: 'Dynamic Programming', topic: 'Dynamic Programming' },
  { id: 'advanced', label: 'Advanced Algorithms', topic: "Dijkstra's Algorithm" },
]

export const EXAMPLE_QUERIES = [
  'Explain pointers in Java',
  'Binary tree traversal in C++',
  "Dijkstra's algorithm in Python",
  'HashMap vs Hashtable in Java',
  'Explain dynamic programming',
  'Quick sort with example',
  'Graphs in JavaScript',
]
