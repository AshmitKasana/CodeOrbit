// Logic for the Interview Question Bank: filtering, stats, quiz picking and the
// per-learner "reviewed" set. The data itself lives in data/interviewQuestions.js.
// Everything here is pure or localStorage-backed, so it is unit tested without a browser.

import { JOB_ROLES, QUESTIONS, QUESTION_CATEGORIES, resolveJobRole } from '../data/interviewQuestions'
import { scopedKey } from '../utils/helpers'

export { JOB_ROLES, QUESTIONS, QUESTION_CATEGORIES, resolveJobRole }
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const REVIEWED_KEY = 'dsa-ai:reviewed-questions'
const categoryLabel = Object.fromEntries(QUESTION_CATEGORIES.map((c) => [c.id, c.label]))
const roleLabel = Object.fromEntries(JOB_ROLES.map((r) => [r.id, r.shortLabel]))

export const getCategoryLabel = (id) => categoryLabel[id] || id
export const getRoleLabel = (id) => roleLabel[id] || id

/**
 * Filters questions by category (DSA topic), custom typed DSA topic query,
 * job role (preset id or custom typed role), difficulty, company, free-text search and review state.
 */
export function filterQuestions(
  questions,
  {
    category = 'all',
    topicQuery = '',
    role = 'all',
    difficulty = 'all',
    company = 'all',
    query = '',
    unreviewedOnly = false,
    reviewed = [],
  } = {}
) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const topicTerms = topicQuery.toLowerCase().split(/\s+/).filter(Boolean)
  const resolvedRole = resolveJobRole(role)
  const done = new Set(reviewed)

  return questions.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (resolvedRole && !(item.roles || []).includes(resolvedRole.id)) return false
    if (difficulty !== 'all' && item.difficulty !== difficulty) return false
    if (company !== 'all' && !(item.companies || []).includes(company)) return false
    if (unreviewedOnly && done.has(item.id)) return false

    if (topicTerms.length > 0) {
      const topicHaystack = [
        item.topic,
        item.pattern,
        getCategoryLabel(item.category),
        item.question,
        item.shortAnswer,
        item.leetcode?.title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!topicTerms.every((t) => topicHaystack.includes(t))) return false
    }

    if (terms.length === 0) return true
    const haystack = [
      item.question,
      item.shortAnswer,
      item.detailedAnswer,
      item.tip,
      item.pattern,
      item.topic,
      item.followUp,
      item.leetcode ? `lc ${item.leetcode.id} ${item.leetcode.title}` : '',
      ...(item.companies || []),
      ...(item.roles || []).map(getRoleLabel),
      getCategoryLabel(item.category),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
}

/** Totals overall and per category / difficulty, counting only ids that still exist. */
export function questionStats(questions, reviewed = []) {
  const done = new Set(reviewed)
  const byCategory = {}
  const byDifficulty = {}
  let reviewedCount = 0

  for (const item of questions) {
    const isDone = done.has(item.id)
    if (isDone) reviewedCount += 1
    const cat = (byCategory[item.category] ||= { total: 0, reviewed: 0 })
    cat.total += 1
    if (isDone) cat.reviewed += 1
    const diff = (byDifficulty[item.difficulty] ||= { total: 0, reviewed: 0 })
    diff.total += 1
    if (isDone) diff.reviewed += 1
  }
  return { total: questions.length, reviewed: reviewedCount, byCategory, byDifficulty }
}

/** Picks one question at random, preferring ones not yet reviewed; `rng` is injectable for tests. */
export function pickQuizQuestion(questions, reviewed = [], { rng = Math.random, excludeId = null } = {}) {
  const done = new Set(reviewed)
  const candidates = questions.filter((item) => item.id !== excludeId)
  const fresh = candidates.filter((item) => !done.has(item.id))
  const pool = fresh.length > 0 ? fresh : candidates.length > 0 ? candidates : questions
  if (pool.length === 0) return null
  return pool[Math.floor(rng() * pool.length)]
}

/** Questions for a category, shaped for a lesson's "Interview Questions" section. */
export function questionsForCategory(categoryId, limit = 5) {
  return QUESTIONS.filter((item) => item.category === categoryId)
    .slice(0, limit)
    .map(({ question, shortAnswer, detailedAnswer, tip }) => ({ question, shortAnswer, detailedAnswer, tip }))
}

// --- review progress (localStorage, per signed-in user) ---------------------------

export function getReviewed(userId) {
  try {
    const raw = localStorage.getItem(scopedKey(REVIEWED_KEY, userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function saveReviewed(ids, userId) {
  try {
    localStorage.setItem(scopedKey(REVIEWED_KEY, userId), JSON.stringify(ids))
  } catch {
    /* storage unavailable — progress just won't persist */
  }
}

/** Marks/unmarks a question as reviewed; returns the new list. */
export function toggleReviewed(id, userId) {
  const current = getReviewed(userId)
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  saveReviewed(next, userId)
  return next
}

export function setReviewed(id, reviewed, userId) {
  const current = getReviewed(userId)
  const has = current.includes(id)
  if (reviewed === has) return current
  const next = reviewed ? [...current, id] : current.filter((x) => x !== id)
  saveReviewed(next, userId)
  return next
}

export function clearReviewed(userId) {
  saveReviewed([], userId)
  return []
}
