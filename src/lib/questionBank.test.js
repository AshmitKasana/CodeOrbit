import { beforeEach, describe, expect, it } from 'vitest'
import {
  DIFFICULTIES,
  QUESTIONS,
  QUESTION_CATEGORIES,
  clearReviewed,
  filterQuestions,
  getCategoryLabel,
  getReviewed,
  pickQuizQuestion,
  questionStats,
  questionsForCategory,
  setReviewed,
  toggleReviewed,
} from './questionBank'

beforeEach(() => localStorage.clear())

describe('question bank dataset', () => {
  it('has questions in every declared category and difficulty', () => {
    expect(QUESTIONS.length).toBeGreaterThan(50)
    const ids = new Set(QUESTIONS.map((q) => q.id))
    expect(ids.size).toBe(QUESTIONS.length)

    for (const cat of QUESTION_CATEGORIES) {
      expect(QUESTIONS.some((q) => q.category === cat.id)).toBe(true)
      expect(getCategoryLabel(cat.id)).toBe(cat.label)
    }
    for (const diff of DIFFICULTIES) {
      expect(QUESTIONS.some((q) => q.difficulty === diff)).toBe(true)
    }
  })

  it('shapes category questions for lessons', () => {
    const items = questionsForCategory('arrays', 3)
    expect(items).toHaveLength(3)
    expect(items[0]).toEqual({
      question: expect.any(String),
      shortAnswer: expect.any(String),
      detailedAnswer: expect.any(String),
      tip: expect.any(String),
    })
  })
})

describe('filterQuestions', () => {
  it('filters by category, difficulty, search terms and review state', () => {
    const arraysEasy = filterQuestions(QUESTIONS, { category: 'arrays', difficulty: 'Easy' })
    expect(arraysEasy.length).toBeGreaterThan(0)
    expect(arraysEasy.every((q) => q.category === 'arrays' && q.difficulty === 'Easy')).toBe(true)

    const kadane = filterQuestions(QUESTIONS, { query: 'kadane subarray' })
    expect(kadane.length).toBeGreaterThan(0)
    expect(kadane[0].question.toLowerCase()).toContain('kadane')

    const firstId = arraysEasy[0].id
    const unreviewed = filterQuestions(arraysEasy, { unreviewedOnly: true, reviewed: [firstId] })
    expect(unreviewed).toHaveLength(arraysEasy.length - 1)
    expect(unreviewed.some((q) => q.id === firstId)).toBe(false)
  })
})

describe('questionStats & pickQuizQuestion', () => {
  it('tallies reviewed counts overall and per category/difficulty', () => {
    const first = QUESTIONS[0]
    const stats = questionStats(QUESTIONS, [first.id, 'non-existent-id'])
    expect(stats.total).toBe(QUESTIONS.length)
    expect(stats.reviewed).toBe(1)
    expect(stats.byCategory[first.category].reviewed).toBe(1)
    expect(stats.byDifficulty[first.difficulty].reviewed).toBe(1)
  })

  it('prefers unreviewed questions and respects excludeId', () => {
    const sample = QUESTIONS.slice(0, 3)
    const picked = pickQuizQuestion(sample, [sample[0].id, sample[1].id], { rng: () => 0 })
    expect(picked.id).toBe(sample[2].id)

    const next = pickQuizQuestion(sample, sample.map((q) => q.id), { rng: () => 0, excludeId: sample[0].id })
    expect(next.id).toBe(sample[1].id)
    expect(pickQuizQuestion([], [])).toBeNull()
  })
})

describe('reviewed persistence', () => {
  it('toggles, sets and clears reviewed IDs per user', () => {
    expect(getReviewed('u1')).toEqual([])
    expect(toggleReviewed('arrays-1', 'u1')).toEqual(['arrays-1'])
    expect(getReviewed('u1')).toEqual(['arrays-1'])
    expect(getReviewed('u2')).toEqual([])

    expect(setReviewed('arrays-1', true, 'u1')).toEqual(['arrays-1'])
    expect(setReviewed('arrays-2', true, 'u1')).toEqual(['arrays-1', 'arrays-2'])
    expect(toggleReviewed('arrays-1', 'u1')).toEqual(['arrays-2'])

    expect(clearReviewed('u1')).toEqual([])
    expect(getReviewed('u1')).toEqual([])
  })
})
