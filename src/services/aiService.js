import { parseQuery, slugify } from '../utils/helpers'
import { findEntry, buildGenericPractice } from './knowledgeBase'
import { LANGUAGES } from '../utils/constants'

// ---------------------------------------------------------------------------
// aiService.js — the ONLY place the rest of the app talks to "AI".
//
// Contract: generateExplanation(query, level, onStage) resolves to an object
// matching the schema below. Swapping the mock generator for a real backend
// call is a one-function change (see USE_REAL_AI branch) — no component ever
// needs to change.
//
// Schema:
// {
//   title, slug, summary, difficulty, topic, language, languagesAvailable[],
//   overview, coreConcept,              // markdown strings, already level-adapted
//   syntax: [{ language, snippet }],
//   howItWorks, memoryConcept,          // markdown strings
//   examples: [{ title, language, code, explanation }],
//   visual: { type, data },
//   complexity: { best, average, worst, space, explanation },
//   languageComparison: { columns[], rows: [{ concept, values[] }] },
//   commonMistakes: [{ mistake, explanation }],
//   interviewQuestions: [{ question, shortAnswer, detailedAnswer, tip }],
//   practiceProblems: { easy[], medium[], hard[] },
//   relatedTopics: [string],
// }
// ---------------------------------------------------------------------------

const USE_REAL_AI = import.meta.env.VITE_USE_REAL_AI === 'true'

export const LOADING_STAGES = [
  'Understanding your question...',
  'Mapping the concept...',
  'Building the explanation...',
  'Preparing examples...',
  'Entering Code Orbit...',
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Main entry point used by useTopic(). `onStage(index)` is called as the
 * (simulated) generation pipeline progresses, driving the staged loading UI.
 */
export async function generateExplanation(rawQuery, level = 'Beginner', onStage = () => {}) {
  if (!rawQuery || !rawQuery.trim()) {
    throw new AIServiceError('EMPTY_INPUT', 'Please enter a topic to learn about.')
  }

  if (USE_REAL_AI) {
    try {
      return await callBackend(rawQuery, level, onStage)
    } catch (err) {
      console.error('Real AI backend failed, falling back to local generator:', err)
      // fall through to mock so the demo never hard-fails
    }
  }

  return mockGenerate(rawQuery, level, onStage)
}

export async function askFollowUp(topicResult, question, conversationHistory = []) {
  if (!question || !question.trim()) {
    throw new AIServiceError('EMPTY_INPUT', 'Please enter a follow-up question.')
  }
  await delay(600 + Math.random() * 500)

  const q = question.toLowerCase()
  const topic = topicResult?.title || 'this topic'

  if (q.includes('real-world') || q.includes('real world') || q.includes('analogy')) {
    return `Here's a real-world way to think about **${topic}**: ${topicResult?.overview?.beginner || topicResult?.summary || ''}\n\nThe same idea shows up any time you need to reach shared data quickly without copying it everywhere — think of a shared office document versus emailing separate copies to everyone.`
  }
  if (q.includes('why') && (q.includes("doesn't") || q.includes('does not') || q.includes("don't"))) {
    return `Good question. ${topicResult?.overview?.advanced || topicResult?.coreConcept?.advanced || 'This is usually a deliberate safety/design tradeoff made by the language designers rather than a limitation — see the "Core Concept" and "Common Mistakes" sections above for the specifics.'}`
  }
  if (q.includes('interview')) {
    const iq = topicResult?.interviewQuestions?.[0]
    return iq
      ? `Here's an interview-level angle:\n\n**Q: ${iq.question}**\n\n${iq.detailedAnswer}\n\n> Tip: ${iq.tip}`
      : `At interview level, focus on precise terminology, Big-O tradeoffs, and being able to compare ${topic} against the closest alternative data structure/algorithm.`
  }
  if (q.includes('memory') || q.includes('diagram')) {
    return topicResult?.memoryConcept || `${topic} interacts with memory the way most structures do: short-lived local data lives on the stack, and longer-lived or dynamically-sized data lives on the heap.`
  }
  if (q.includes('harder') || q.includes('difficult') || q.includes('challenge')) {
    const hard = topicResult?.practiceProblems?.hard?.[0]
    return hard
      ? `Try this harder problem:\n\n**${hard.title}**\n\n${hard.statement}\n\nConstraints: ${hard.constraints}\n\nHint: ${hard.hint}`
      : `Try combining ${topic} with a second data structure or algorithm to raise the difficulty — that combination is a common interview escalation.`
  }

  return `Building on **${topic}**: ${topicResult?.coreConcept?.[level?.toLowerCase()] || topicResult?.coreConcept?.beginner || topicResult?.summary}\n\nIf you'd like, ask me to go deeper on syntax, memory behavior, complexity, or an interview-style example.`
}

// ---------------------------------------------------------------------------
// Real backend call — never touches an API key directly. The key lives only
// in server/index.js (or whatever backend you deploy), read from env vars.
// ---------------------------------------------------------------------------
async function callBackend(rawQuery, level, onStage) {
  onStage(0)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: rawQuery, level }),
      signal: controller.signal,
    })
    onStage(2)
    if (!res.ok) {
      if (res.status === 429) throw new AIServiceError('RATE_LIMIT', 'Too many requests — please wait a moment and try again.')
      throw new AIServiceError('API_ERROR', `Backend returned status ${res.status}.`)
    }
    const data = await res.json()
    onStage(3)
    const validated = validateSchema(data)
    if (!validated.ok) throw new AIServiceError('INVALID_RESPONSE', 'The AI response was malformed.')
    return finalizeResult(data, rawQuery, level)
  } catch (err) {
    if (err.name === 'AbortError') throw new AIServiceError('TIMEOUT', 'The request took too long. Please try again.')
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export class AIServiceError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

export function validateSchema(data) {
  const requiredKeys = ['title', 'overview', 'coreConcept']
  if (!data || typeof data !== 'object') return { ok: false }
  for (const key of requiredKeys) {
    if (!(key in data)) return { ok: false, missing: key }
  }
  return { ok: true }
}

function finalizeResult(data, rawQuery, level) {
  return {
    ...data,
    slug: data.slug || slugify(data.title || rawQuery),
    difficulty: level,
    rawQuery,
  }
}

// ---------------------------------------------------------------------------
// Mock generator — builds structurally-consistent, technically-safe content
// so the whole app works fully offline / without an API key.
// ---------------------------------------------------------------------------
async function mockGenerate(rawQuery, level, onStage) {
  onStage(0)
  await delay(500 + Math.random() * 400)

  const { topic, language } = parseQuery(rawQuery)
  const entry = findEntry(topic)

  onStage(1)
  await delay(600 + Math.random() * 500)

  onStage(2)
  await delay(500 + Math.random() * 400)

  onStage(3)
  await delay(500 + Math.random() * 400)

  onStage(4)
  await delay(350 + Math.random() * 250)

  const base = entry ? entry.build(language) : buildGeneric(topic, language)
  const languageNote = base.languageNote ? base.languageNote(language) : null

  const result = {
    ...base,
    slug: slugify(rawQuery) || slugify(base.title),
    topic: base.title,
    language: language || base.defaultLanguage || null,
    languagesAvailable: Object.keys(base.syntax || {}).length ? Object.keys(base.syntax) : LANGUAGES.slice(0, 5),
    difficulty: level,
    rawQuery,
    languageNote,
  }
  delete result.languageNote_
  return result
}

// Heuristic generic template for any topic not in the hand-authored
// knowledge base — keeps claims generic/safe rather than fabricating
// language-specific behavior it cannot verify.
function buildGeneric(topic, language) {
  const lower = topic.toLowerCase()
  const isAlgorithm = /(sort|search|traversal|algorithm|dijkstra|bfs|dfs|backtrack|greedy|dynamic programming|recursion|kmp|rabin|tarjan|kruskal|prim|bellman|floyd)/.test(lower)
  const isGraph = /graph|dijkstra|bfs|dfs|topological|kruskal|prim|bellman|floyd|tarjan/.test(lower)
  const isTree = /tree|trie|heap|bst/.test(lower)
  const isHash = /hash/.test(lower)
  const isStackQueue = /stack|queue|deque/.test(lower)
  const isDP = /dynamic programming|\bdp\b/.test(lower)

  let visual = { type: 'none' }
  if (isGraph) visual = { type: 'graph' }
  else if (isTree) visual = { type: 'tree' }
  else if (isStackQueue) visual = { type: /queue|deque/.test(lower) ? 'queue' : 'stack' }
  else if (/array/.test(lower)) visual = { type: 'array', data: { values: [10, 20, 30, 40] } }
  else if (/linked list/.test(lower)) visual = { type: 'linked-list', data: { values: [10, 20, 30] } }

  const complexity = isDP
    ? { best: 'O(n)', average: 'O(n * m)', worst: 'O(n * m)', space: 'O(n * m) (often reducible to O(n) or O(1))', explanation: 'Dynamic programming trades extra memory (a memo table) for avoiding recomputation of overlapping subproblems, turning an exponential brute force into polynomial time.' }
    : isGraph
    ? { best: 'O(V + E)', average: 'O(V + E) to O((V + E) log V)', worst: 'O(V^2) with a dense graph and a naive priority queue', space: 'O(V + E)', explanation: 'Most graph traversal/shortest-path algorithms visit each vertex and edge a bounded number of times; using a priority queue (binary heap) for weighted variants adds a log factor.' }
    : isAlgorithm && /sort/.test(lower)
    ? { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2) for naive pivot choices (e.g. quicksort on sorted input)', space: 'O(log n) to O(n) depending on the algorithm', explanation: 'Comparison-based sorting has a proven lower bound of O(n log n); specific algorithms can degrade to O(n^2) in adversarial cases unless mitigated (e.g. randomized pivots).' }
    : isAlgorithm && /search/.test(lower)
    ? { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', explanation: 'Binary search halves the remaining search space each step, giving logarithmic time — but it requires the input to be sorted first.' }
    : isHash
    ? { best: 'O(1)', average: 'O(1)', worst: 'O(n) under heavy hash collisions', space: 'O(n)', explanation: 'A good hash function distributes keys evenly across buckets for O(1) average lookup; a poor hash function or adversarial input can degrade all keys into one bucket, causing O(n) lookups.' }
    : { best: 'O(1)', average: 'Depends on usage pattern', worst: 'Depends on usage pattern', space: 'O(n)', explanation: 'Complexity for this topic depends heavily on how it is used — see the examples and core concept above for the specific operations involved.' }

  const langs = language ? [language, ...LANGUAGES.filter((l) => l !== language)] : LANGUAGES
  const primaryLangs = langs.slice(0, 5)

  const syntax = {}
  primaryLangs.forEach((l) => {
    syntax[l] = [`// ${topic} — illustrative ${l} usage`, `// See the Examples section below for a fuller snippet.`]
  })

  const examples = primaryLangs.slice(0, 3).map((l) => ({
    title: `${topic} in ${l}`,
    language: l,
    code: genericCodeStub(topic, l),
    explanation: `A minimal, representative shape of how ${topic.toLowerCase()} is typically expressed in ${l}. Ask a follow-up for a more complete, runnable version.`,
  }))

  return {
    title: topic,
    summary: `${topic} is a ${isAlgorithm ? 'technique' : 'concept'} in computer science${language ? `, shown here in the context of ${language}` : ''}. This is a generated best-effort structure — ask a follow-up question for more depth on any section.`,
    overview: {
      beginner: `${topic} is a concept you'll run into often when working with data structures and algorithms${language ? ` in ${language}` : ''}. At a high level, it's about organizing or processing data in a specific way to solve a class of problems efficiently.`,
      intermediate: `${topic} refers to a well-defined approach with known time/space tradeoffs. Understanding when to reach for it — and its typical complexity — is usually more valuable than memorizing syntax.`,
      advanced: `${topic} should be understood in terms of its invariants, complexity guarantees, and how it composes with related structures/algorithms. Compare it against the closest alternatives to understand why it's chosen in a given context.`,
      interview: `Be ready to state ${topic}'s time/space complexity precisely, implement a core version from memory, and discuss at least one real tradeoff versus an alternative approach.`,
    },
    coreConcept: {
      beginner: `The core idea behind ${topic} is to solve a recurring type of problem in a structured, reusable way.`,
      intermediate: `${topic} exists because naive/brute-force approaches to its problem class are too slow or use too much memory at scale; it trades some complexity in implementation for better asymptotic behavior.`,
      advanced: `Look at ${topic} in terms of the invariant it maintains at every step, and prove to yourself why that invariant guarantees correctness and the stated complexity.`,
      interview: `Frame your answer around: definition → why it exists → complexity → a worked example → a common pitfall. That structure reads as senior-level even under time pressure.`,
    },
    syntax,
    howItWorks: `${topic} works by applying a consistent rule or procedure to the input, repeating or recursing until a base case/termination condition is reached. The specific mechanics depend on whether it's a data structure (defines how data is organized and accessed) or an algorithm (defines a sequence of steps operating on data).`,
    memoryConcept: `As with most DSA topics, short-lived local variables live on the **stack**, while larger or dynamically-sized data (arrays, objects, nodes) typically lives on the **heap**. ${isAlgorithm ? 'Recursive implementations also consume stack space proportional to recursion depth — deep recursion can cause a stack overflow.' : 'How this structure is stored determines its access patterns and cache behavior.'}`,
    examples,
    visual,
    complexity,
    languageComparison: {
      columns: primaryLangs,
      rows: [
        { concept: 'Built-in / standard library support', values: primaryLangs.map(() => 'Varies — check the standard library docs') },
        { concept: 'Typical idiomatic usage', values: primaryLangs.map((l) => `${l}-specific idioms apply`) },
      ],
    },
    commonMistakes: [
      { mistake: 'Skipping the brute-force baseline', explanation: 'Understand the naive O(n^2) or worse approach first — it makes the optimized version\'s trick obvious instead of memorized.' },
      { mistake: 'Ignoring edge cases', explanation: 'Empty input, single-element input, and duplicate values are the most commonly missed edge cases for this class of problem.' },
      { mistake: 'Misstating complexity', explanation: 'Double-check best/average/worst case separately — they are often different for this topic.' },
    ],
    interviewQuestions: [
      { question: `What is ${topic} and when would you use it?`, shortAnswer: `${topic} is used when its specific complexity/structure tradeoff fits the problem better than the alternatives.`, detailedAnswer: `Explain the definition, then justify the choice by comparing against at least one alternative approach and its complexity.`, tip: 'Always justify a data structure/algorithm choice by contrasting it with an alternative — that comparison is what interviewers are listening for.' },
      { question: `What is the time complexity of ${topic}, and why?`, shortAnswer: complexity.average, detailedAnswer: complexity.explanation, tip: 'State best, average, and worst case separately rather than a single number.' },
    ],
    practiceProblems: buildGenericPractice(topic),
    relatedTopics: deriveRelated(topic, isAlgorithm, isGraph, isTree, isHash, isStackQueue, isDP),
  }
}

function genericCodeStub(topic, language) {
  const comment = { Java: '//', 'C++': '//', C: '//', 'C#': '//', Go: '//', Rust: '//', Kotlin: '//', Swift: '//', JavaScript: '//', TypeScript: '//', Python: '#' }
  const c = comment[language] || '//'
  return `${c} ${topic} — illustrative ${language} sketch\n${c} Replace with a full implementation; ask a follow-up for one.`
}

function deriveRelated(topic, isAlgorithm, isGraph, isTree, isHash, isStackQueue, isDP) {
  if (isGraph) return ['BFS', 'DFS', "Dijkstra's Algorithm", 'Topological Sort', 'Union-Find', 'Adjacency List']
  if (isTree) return ['Binary Tree', 'Binary Search Tree', 'Heap', 'Trie', 'Recursion', 'Balanced Trees']
  if (isHash) return ['Hash Table', 'Collision Resolution', 'Load Factor', 'Sets', 'Maps']
  if (isStackQueue) return ['Stack', 'Queue', 'Deque', 'Recursion', 'Monotonic Stack']
  if (isDP) return ['Recursion', 'Memoization', 'Greedy', 'Divide and Conquer']
  if (isAlgorithm) return ['Big O Notation', 'Recursion', 'Divide and Conquer', 'Greedy', 'Sorting']
  return ['Arrays', 'Big O Notation', 'Recursion', topic]
}
