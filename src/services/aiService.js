import { parseQuery, slugify } from '../utils/helpers'
import { findEntry, buildGenericPractice } from './knowledgeBase'
import { LANGUAGES } from '../utils/constants'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { setQuota } from './quotaStore'

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

// Read at call time (not module load) so it can be toggled in tests.
const useRealAI = () => import.meta.env.VITE_USE_REAL_AI === 'true'
// Base URL of the backend. Empty = same origin (Vite proxies /api in dev).
const apiBase = () => (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Errors the learner needs to see (limit reached, off-topic, bad input).
// Anything else — backend down, not configured, timeout — silently falls back
// to the local generator so the app keeps working.
const SURFACED_ERROR_CODES = new Set(['QUOTA_EXCEEDED', 'OFF_TOPIC', 'REFUSED', 'BAD_REQUEST'])

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
 * Main entry point used by useTopic(), Practice and Interview.
 * `onStage(index)` drives the staged loading UI. `options.focus` is
 * 'lesson' (default) | 'practice' | 'interview' and tells the backend which
 * part of the lesson to emphasise.
 */
export async function generateExplanation(rawQuery, level = 'Beginner', onStage = () => {}, options = {}) {
  if (!rawQuery || !rawQuery.trim()) {
    throw new AIServiceError('EMPTY_INPUT', 'Please enter a topic to learn about.')
  }

  if (useRealAI()) {
    try {
      return await callBackend(rawQuery, level, onStage, options)
    } catch (err) {
      if (err instanceof AIServiceError && SURFACED_ERROR_CODES.has(err.code)) throw err
      console.warn('AI backend unavailable, using the local generator instead:', err?.message || err)
      // fall through to the local generator so the app never hard-fails
    }
  }

  return mockGenerate(rawQuery, level, onStage)
}

/** Asks the backend how much of today's quota is left (no quota is consumed). */
export async function refreshQuota() {
  if (!useRealAI()) return null
  try {
    const res = await fetch(`${apiBase()}/api/quota`, { headers: await authHeaders() })
    if (!res.ok) return null
    const body = await res.json()
    setQuota('generate', body.generate, { signedIn: body.signedIn })
    setQuota('chat', body.chat)
    return body
  } catch {
    return null
  }
}

export async function askFollowUp(topicResult, question, conversationHistory = []) {
  if (!question || !question.trim()) {
    throw new AIServiceError('EMPTY_INPUT', 'Please enter a follow-up question.')
  }

  if (useRealAI()) {
    try {
      return await followUpFromBackend(topicResult, question, conversationHistory)
    } catch (err) {
      if (err instanceof AIServiceError && SURFACED_ERROR_CODES.has(err.code)) throw err
      console.warn('AI backend unavailable, using a canned follow-up answer instead:', err?.message || err)
    }
  }

  return cannedFollowUp(topicResult, question)
}

// Offline follow-up answers (used when no AI backend is configured/reachable).
async function cannedFollowUp(topicResult, question) {
  const level = topicResult?.difficulty
  await delay(40)

  const q = question.toLowerCase()
  const topic = topicResult?.title || 'this topic'

  if (q.includes('real-world') || q.includes('real world') || q.includes('analogy')) {
    return `Here's a real-world way to think about **${topic}**: ${topicResult?.overview?.beginner || topicResult?.summary || ''}\n\nThe same idea shows up any time you need to reach shared data quickly without copying it everywhere — think of a shared office document versus emailing separate copies to everyone.`
  }
  if (q.includes('complexity') || q.includes('big-o') || q.includes('big o') || q.includes('time') || q.includes('space') || q.includes('fast')) {
    const c = topicResult?.complexity
    if (c) {
      return `**Time & Space Complexity for ${topic}:**\n\n- **Best Case:** \`${c.best}\`\n- **Average Case:** \`${c.average}\`\n- **Worst Case:** \`${c.worst}\`\n- **Space Complexity:** \`${c.space}\`\n\n${c.explanation || ''}`
    }
  }
  if (q.includes('mistake') || q.includes('edge case') || q.includes('pitfall') || q.includes('bug')) {
    const mistakes = topicResult?.commonMistakes || []
    if (mistakes.length > 0) {
      return `**Common Pitfalls & Edge Cases for ${topic}:**\n\n` + mistakes.map((m) => `- **${m.mistake}:** ${m.explanation}`).join('\n')
    }
  }
  if (q.includes('code') || q.includes('syntax') || q.includes('implement')) {
    const ex = topicResult?.examples?.[0]
    if (ex) {
      return `Here is a reference **${ex.language}** implementation for **${ex.title}**:\n\n\`\`\`${ex.language.toLowerCase()}\n${ex.code}\n\`\`\`\n\n${ex.explanation || ''}`
    }
  }
  if (q.includes('why') && (q.includes("doesn't") || q.includes('does not') || q.includes("don't"))) {
    return `Good question. ${topicResult?.overview?.advanced || topicResult?.coreConcept?.advanced || 'This is a deliberate safety and performance tradeoff made by the language designers — see the "The concept" and "Go deeper" sections above for the specifics.'}`
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

  return `Building on **${topic}**: ${topicResult?.coreConcept?.[level?.toLowerCase()] || topicResult?.coreConcept?.beginner || topicResult?.summary}\n\nAsk about time & space complexity, common edge cases, memory layout, or an interview-style example above.`
}

// ---------------------------------------------------------------------------
// Real backend call — never touches an API key directly. The key lives only
// in server/index.js (or whatever backend you deploy), read from env vars.
// ---------------------------------------------------------------------------
const REQUEST_TIMEOUT_MS = 120_000 // a full lesson can take a while to generate

/** Sends the signed-in user's Supabase token so the server can give them the higher quota. */
async function authHeaders() {
  if (!isSupabaseConfigured || !supabase) return {}
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function postJson(path, payload) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) throw errorFromResponse(res.status, body)
    return body
  } catch (err) {
    if (err?.name === 'AbortError') throw new AIServiceError('TIMEOUT', 'The request took too long. Please try again.')
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

function errorFromResponse(status, body) {
  const code = body?.code
  const message = body?.error
  if (code === 'QUOTA_EXCEEDED') {
    const error = new AIServiceError('QUOTA_EXCEEDED', message || "You've reached today's AI limit.")
    error.quota = body.quota
    error.signedIn = Boolean(body.signedIn)
    return error
  }
  if (code === 'OFF_TOPIC' || code === 'REFUSED' || code === 'BAD_REQUEST') return new AIServiceError(code, message)
  if (code === 'RATE_LIMITED' || status === 429) {
    return new AIServiceError('RATE_LIMIT', message || 'Too many requests — please wait a moment and try again.')
  }
  if (code === 'AI_NOT_CONFIGURED') return new AIServiceError('AI_NOT_CONFIGURED', message)
  return new AIServiceError('API_ERROR', message || `Backend returned status ${status}.`)
}

async function callBackend(rawQuery, level, onStage, { focus = 'lesson' } = {}) {
  onStage(0)
  const body = await postJson('/api/generate', { query: rawQuery, level, focus })
  onStage(2)
  const validated = validateSchema(body?.lesson)
  if (!validated.ok) throw new AIServiceError('INVALID_RESPONSE', 'The AI response was malformed.')
  onStage(3)
  if (body.quota) setQuota('generate', body.quota)
  return finalizeResult(body.lesson, rawQuery, level)
}

async function followUpFromBackend(topicResult, question, conversationHistory) {
  const body = await postJson('/api/followup', {
    topic: topicResult?.title || 'this topic',
    summary: topicResult?.summary || '',
    level: topicResult?.difficulty,
    question,
    history: conversationHistory.map((m) => ({ role: m.role, text: m.text })),
  })
  if (body.quota) setQuota('chat', body.quota)
  if (typeof body.answer !== 'string' || !body.answer) throw new AIServiceError('INVALID_RESPONSE', 'The AI answer was malformed.')
  return body.answer
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
    source: 'ai',
  }
}

// ---------------------------------------------------------------------------
// Mock generator — builds structurally-consistent, technically-safe content
// so the whole app works fully offline / without an API key.
// ---------------------------------------------------------------------------
async function mockGenerate(rawQuery, level, onStage) {
  onStage(0)
  await delay(10)

  const { topic, language } = parseQuery(rawQuery)
  const entry = findEntry(topic)

  onStage(1)
  await delay(10)

  onStage(2)
  await delay(10)

  onStage(3)
  await delay(10)

  onStage(4)
  await delay(10)

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
    source: 'local',
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
    syntax[l] = genericCodeStub(topic, l).split('\n')
  })

  const examples = primaryLangs.slice(0, 3).map((l) => ({
    title: `${topic} in ${l}`,
    language: l,
    code: genericCodeStub(topic, l),
    explanation: `Idiomatic ${l} implementation demonstrating ${topic.toLowerCase()} with sample input verification.`,
  }))

  return {
    title: topic,
    summary: `${topic} is a core ${isAlgorithm ? 'algorithmic technique' : 'computer science concept'}${language ? ` demonstrated here in ${language}` : ''} used to structure data and optimize asymptotic time and space complexity.`,
    overview: {
      beginner: `${topic} is a foundational concept in data structures and algorithms${language ? ` in ${language}` : ''}. At a high level, it organizes or processes data systematically so operations remain fast as input size grows.`,
      intermediate: `${topic} provides a well-defined approach with predictable time and space tradeoffs. Understanding when to apply it — and how its invariants hold — is essential for writing scalable code.`,
      advanced: `${topic} is defined by its structural invariants, amortized or worst-case complexity guarantees, and cache/memory behavior when composed with other data structures.`,
      interview: `Be ready to state ${topic}'s time and space complexity precisely, implement a clean working version, and contrast its tradeoffs against the closest alternative approach.`,
    },
    coreConcept: {
      beginner: `The core idea behind ${topic} is to eliminate redundant work by maintaining a clear invariant at each step.`,
      intermediate: `${topic} replaces naive brute-force scans with structured state updates, improving asymptotic performance on large inputs.`,
      advanced: `Analyze ${topic} through the invariant it maintains before and after every operation, which directly proves correctness and bounds worst-case complexity.`,
      interview: `Structure your interview explanation as: core invariant → time/space complexity → walkthrough on a small example → boundary edge cases.`,
    },
    syntax,
    howItWorks: `${topic} operates by maintaining a well-defined state across iterations or recursive frames until the termination condition is met. Each step preserves the structural invariant while advancing toward the result.`,
    memoryConcept: `Short-lived index variables and call frames live on the **stack**, while dynamically allocated nodes, buffers, and tables reside on the **heap**. ${isAlgorithm ? 'Recursive implementations allocate one stack frame per call level — consider iterative state or tail-call patterns when recursion depth can reach O(n).' : 'Contiguous array-backed layouts maximize CPU cache locality compared to pointer-chained nodes.'}`,
    examples,
    visual,
    complexity,
    languageComparison: {
      columns: primaryLangs,
      rows: [
        { concept: 'Standard library support', values: primaryLangs.map((l) => `Supported via ${l} core collections & algorithms`) },
        { concept: 'Memory model', values: primaryLangs.map((l) => (l === 'C++' || l === 'C' || l === 'Rust' ? 'Value & explicit pointer/ownership control' : 'Managed heap references with stack primitives')) },
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
  const fnName = 'solve'
  if (language === 'Python') {
    return `def ${fnName}(nums):\n    # ${topic} — reference implementation\n    if not nums:\n        return []\n    result = [x for x in nums]\n    return result\n\nsample = [10, 20, 30, 40]\nprint(${fnName}(sample))`
  }
  if (language === 'JavaScript' || language === 'TypeScript') {
    return `function ${fnName}(nums) {\n  // ${topic} — reference implementation\n  if (!nums || nums.length === 0) return [];\n  return nums.slice();\n}\n\nconst sample = [10, 20, 30, 40];\nconsole.log(JSON.stringify(${fnName}(sample)));`
  }
  if (language === 'Java') {
    return `import java.util.*;\n\npublic class Solution {\n    public static List<Integer> ${fnName}(int[] nums) {\n        List<Integer> res = new ArrayList<>();\n        for (int x : nums) res.add(x);\n        return res;\n    }\n\n    public static void main(String[] args) {\n        int[] sample = {10, 20, 30, 40};\n        System.out.println(Arrays.toString(sample));\n    }\n}`
  }
  if (language === 'C++') {
    return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> sample = {10, 20, 30, 40};\n    cout << "[10, 20, 30, 40]" << endl;\n    return 0;\n}`
  }
  if (language === 'Go') {
    return `package main\n\nimport "fmt"\n\nfunc main() {\n    sample := []int{10, 20, 30, 40}\n    fmt.Println(sample)\n}`
  }
  if (language === 'Rust') {
    return `fn main() {\n    let sample = vec![10, 20, 30, 40];\n    println!("{:?}", sample);\n}`
  }
  return `// ${topic} (${language})\nint result = 40;\nprintf("%d\\n", result);`
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
