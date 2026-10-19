// Turns the hand-written guides in data/topicGuides.js into full lessons in the
// exact shape the AI backend returns (see the schema at the top of aiService.js),
// so the Learn page renders built-in and AI-generated lessons identically.

import { GUIDES } from '../data/topicGuides'
import { questionsForCategory } from '../lib/questionBank'

const trimCode = (code) => code.replace(/^\n+/, '').replace(/\s+$/, '')
const firstSentence = (text) => {
  const match = text.match(/^.*?[.!?](\s|$)/)
  return (match ? match[0] : text).trim()
}
const bullets = (items) => items.map((item) => `- ${item}`).join('\n')

function groupProblems(problems) {
  const groups = { easy: [], medium: [], hard: [] }
  for (const p of problems) {
    const key = p.difficulty.toLowerCase()
    groups[key]?.push({
      title: p.title,
      statement: p.statement,
      constraints: p.constraints || '',
      example: p.example,
      hint: p.hint,
      solution: trimCode(p.solution),
      explanation: p.explanation,
      complexity: p.complexity,
    })
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
    practiceProblems: groupProblems(guide.problems),
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
