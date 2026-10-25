// Derives the "concept-first" parts of a lesson — a real-world analogy, a few
// key takeaways and a step-by-step walkthrough — from whatever a lesson
// already contains. Hand-written lessons can supply these fields directly
// (analogy, keyTakeaways, walkthrough); AI-generated or generic lessons fall
// back to sensible values pulled from their overview, howItWorks, complexity
// and commonMistakes, so every lesson gets the same clean structure.

const stripMarkdown = (text = '') =>
  String(text)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

/** Splits prose into sentences without breaking on "e.g." / "i.e." / decimals. */
export function splitSentences(text = '') {
  const clean = stripMarkdown(text)
    .replace(/\be\.g\./gi, 'e\u2024g\u2024')
    .replace(/\bi\.e\./gi, 'i\u2024e\u2024')
    .replace(/\bvs\./gi, 'vs\u2024')
  return (clean.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [])
    .map((s) => s.replace(/\u2024/g, '.').trim())
    .filter((s) => s.length > 2)
}

const ANALOGY_START = /^(imagine|think of|picture|it is like|it's like|it works like|like a|just like)/i

function deriveAnalogy(lesson) {
  if (lesson.analogy) return stripMarkdown(lesson.analogy)
  const beginner = lesson.overview?.beginner
  if (!beginner) return null
  const sentences = splitSentences(beginner)
  const start = sentences.findIndex((s) => ANALOGY_START.test(s))
  if (start === -1) return null
  return sentences.slice(start, start + 2).join(' ')
}

function deriveTakeaways(lesson) {
  if (Array.isArray(lesson.keyTakeaways) && lesson.keyTakeaways.length) return lesson.keyTakeaways.slice(0, 4)

  const takeaways = []
  const why = splitSentences(lesson.coreConcept?.beginner || lesson.summary || '')[0]
  if (why) takeaways.push(why)

  const c = lesson.complexity
  if (c?.average || c?.space) {
    const time = c.average ? `${stripMarkdown(c.average)} time` : null
    const space = c.space ? `${stripMarkdown(c.space)} extra space` : null
    takeaways.push(`Typical cost: ${[time, space].filter(Boolean).join(', ')}.`)
  }

  const mistake = lesson.commonMistakes?.[0]?.mistake
  if (mistake) takeaways.push(`Watch out for: ${stripMarkdown(mistake).replace(/\.$/, '').toLowerCase()}.`)

  return takeaways
}

function deriveWalkthrough(lesson) {
  if (Array.isArray(lesson.walkthrough) && lesson.walkthrough.length) {
    return lesson.walkthrough.map((step, i) =>
      typeof step === 'string' ? { title: `Step ${i + 1}`, text: step } : { title: step.title || `Step ${i + 1}`, text: step.text }
    )
  }
  const sentences = splitSentences(lesson.howItWorks || '')
  if (sentences.length < 2) return []
  return sentences.slice(0, 7).map((text, i) => ({ title: `Step ${i + 1}`, text }))
}

/** Returns { analogy, takeaways, walkthrough } for any lesson object. */
export function getLessonExtras(lesson) {
  if (!lesson) return { analogy: null, takeaways: [], walkthrough: [] }
  return {
    analogy: deriveAnalogy(lesson),
    takeaways: deriveTakeaways(lesson),
    walkthrough: deriveWalkthrough(lesson),
  }
}
