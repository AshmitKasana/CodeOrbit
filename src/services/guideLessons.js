// Turns the hand-written guides in data/topicGuides.js into full lessons in the
// exact shape the AI backend returns (see the schema at the top of aiService.js),
// so the Learn page renders built-in and AI-generated lessons identically.

import { GUIDES } from '../data/topicGuides'
import { EXTRA_PRACTICE_BY_ID } from '../data/practiceProblemsBank'
import { QUESTIONS, questionsForCategory } from '../lib/questionBank'

const trimCode = (code) => (code || '').replace(/^\n+/, '').replace(/\s+$/, '')
const firstSentence = (text) => {
  const match = text.match(/^.*?[.!?](\s|$)/)
  return (match ? match[0] : text).trim()
}
const bullets = (items) => items.map((item) => `- ${item}`).join('\n')

const normalizeTitle = (title) =>
  (title || '')
    .toLowerCase()
    .replace(/\s*\(lc\s*#\d+\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Converts an enriched interview question with code into a Practice Problem card. */
function questionToPracticeProblem(q) {
  const lcSuffix = q.leetcode ? ` (LC #${q.leetcode.id})` : ''
  const baseTitle = q.leetcode?.title || q.question.replace(/\?$/, '')
  return {
    id: `q-${q.id}`,
    difficulty: q.difficulty,
    title: `${baseTitle}${lcSuffix}`,
    pattern: q.pattern || q.topic || '',
    leetcodeUrl: q.leetcode?.url || '',
    companies: q.companies || [],
    statement: q.question,
    constraints: q.complexity ? `Target: ${q.complexity.time} time · ${q.complexity.space} space` : '',
    example: q.followUp ? `Follow-up: ${q.followUp}` : '',
    hint: `${q.shortAnswer}${q.tip ? ` — Tip: ${q.tip}` : ''}`,
    solution: trimCode(q.code?.code || ''),
    explanation: q.detailedAnswer,
    complexity: q.complexity ? `${q.complexity.time} time, ${q.complexity.space} space` : 'Optimal',
  }
}

/**
 * Merges guide-authored problems, EXTRA_PRACTICE_BY_ID[id], and matching
 * enriched QUESTIONS so every topic has Easy, Medium, and Hard problems.
 */
export function buildPracticeSet({ id, problems = [], questionCategory, keys = [] }) {
  const groups = { easy: [], medium: [], hard: [] }
  const seen = new Set()

  const addProblem = (p, idx) => {
    const key = (p.difficulty || 'Medium').toLowerCase()
    if (!groups[key]) return
    const norm = normalizeTitle(p.title)
    if (!norm || seen.has(norm)) return
    seen.add(norm)
    groups[key].push({
      id: p.id || `${id || 'topic'}-${key}-${idx}`,
      title: p.title,
      pattern: p.pattern || '',
      leetcodeUrl: p.leetcodeUrl || '',
      companies: p.companies || [],
      input: p.input || '',
      output: p.output || '',
      statement: p.statement,
      constraints: p.constraints || '',
      example: p.example || '',
      hint: p.hint,
      solution: trimCode(p.solution),
      explanation: p.explanation,
      complexity: p.complexity,
    })
  }

  const combined = [...problems, ...(EXTRA_PRACTICE_BY_ID[id] || [])]
  combined.forEach((p, idx) => addProblem(p, idx))

  // Also pull matching canonical LeetCode / coding questions from QUESTIONS
  const lowerKeys = keys.map((k) => k.toLowerCase())
  for (const q of QUESTIONS) {
    if (!q.code?.code) continue
    const topicMatch =
      (q.topic && lowerKeys.some((k) => q.topic.toLowerCase().includes(k) || k.includes(q.topic.toLowerCase()))) ||
      (q.pattern && lowerKeys.some((k) => q.pattern.toLowerCase().includes(k))) ||
      (questionCategory && q.category === questionCategory)
    if (topicMatch) {
      addProblem(questionToPracticeProblem(q), q.id)
    }
  }

  return groups
}

/** Builds the full lesson object for one guide. */
export function guideToLesson(guide) {
  const syntax = {}
  const examples = []
  for (const [language, code] of Object.entries(guide.templates)) {
    const clean = trimCode(code)
    syntax[language] = clean.split('\n')
    examples.push({
      title: `${guide.title} — ${language} template`,
      language,
      code: clean,
      explanation: `A reusable ${language} template for ${guide.title}. Adapt the condition and the state it tracks to the problem in front of you.`,
    })
  }

  const { complexity } = guide
  return {
    title: guide.title,
    summary: guide.summary,
    analogy: guide.analogy,
    keyTakeaways: [
      firstSentence(guide.keyIdea),
      ...(guide.whenToUse || []).slice(0, 2).map((item) => `Use when: ${item.charAt(0).toLowerCase() + item.slice(1)}.`),
      `Complexity: ${complexity.average} time, ${complexity.space} space.`,
    ],
    defaultLanguage: Object.keys(guide.templates)[0],
    overview: {
      beginner: `${guide.summary} ${guide.analogy}`,
      intermediate: guide.keyIdea,
      advanced: complexity.explanation,
      interview: `Expect to be asked to recognise this pattern from a problem statement, code it without bugs, and state its complexity. A classic slip: ${guide.mistakes[0].explanation}`,
    },
    coreConcept: {
      beginner: firstSentence(guide.keyIdea),
      intermediate: `**Reach for it when:**\n\n${bullets(guide.whenToUse)}`,
      advanced: `**Time:** ${complexity.average} on average, ${complexity.worst} in the worst case. **Space:** ${complexity.space}. ${guide.memory}`,
      interview: `Say it in three parts: (1) the core idea, (2) the complexity — ${complexity.average} time, ${complexity.space} space — and (3) one problem it solves. Then mention a pitfall, such as "${guide.mistakes[0].mistake.toLowerCase()}".`,
    },
    syntax,
    howItWorks: guide.steps,
    memoryConcept: guide.memory,
    examples,
    visual: {
      type: guide.visual.type,
      data: guide.visual.values ? { values: guide.visual.values } : {},
    },
    complexity: { ...complexity },
    languageComparison: { columns: [], rows: [] },
    commonMistakes: guide.mistakes.map((m) => ({ ...m })),
    interviewQuestions: questionsForCategory(guide.questionCategory, 5),
    practiceProblems: buildPracticeSet(guide),
    relatedTopics: [...guide.related],
    languageNote: (language) =>
      language && !guide.templates[language]
        ? `This guide shows ${Object.keys(guide.templates).join(' and ')} templates; the same logic carries over directly to ${language}.`
        : null,
  }
}

/** A knowledge-base entry: { keys, exclude, guide, build } */
export function guideToEntry(guide) {
  return { id: guide.id, keys: guide.keys, exclude: guide.exclude || [], guide, build: () => guideToLesson(guide) }
}

export const GUIDE_ENTRIES = GUIDES.map(guideToEntry)
