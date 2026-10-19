import { describe, expect, it } from 'vitest'
import { GUIDES, GUIDE_COUNT } from '../data/topicGuides'
import { GUIDE_ENTRIES, guideToLesson } from './guideLessons'
import { findEntry, hasBuiltInGuide } from './knowledgeBase'
import { validateSchema } from './aiService'

describe('built-in pattern guides', () => {
  it('converts every guide into a valid lesson matching the AI schema', () => {
    expect(GUIDE_COUNT).toBeGreaterThan(10)
    expect(GUIDE_ENTRIES).toHaveLength(GUIDE_COUNT)

    for (const guide of GUIDES) {
      const lesson = guideToLesson(guide)
      expect(validateSchema(lesson).ok).toBe(true)
      expect(lesson.title).toBe(guide.title)
      expect(lesson.examples.length).toBeGreaterThanOrEqual(2)
      expect(lesson.interviewQuestions.length).toBeGreaterThan(0)
      expect(lesson.commonMistakes.length).toBeGreaterThan(0)
      expect(lesson.languageNote('Rust')).toContain('Rust')
      expect(lesson.languageNote('Python')).toBeNull()
    }
  })

  it('resolves pattern queries without colliding with unrelated topics', () => {
    expect(hasBuiltInGuide('Two Pointers')).toBe(true)
    expect(hasBuiltInGuide('Sliding Window')).toBe(true)
    expect(hasBuiltInGuide('Monotonic Stack')).toBe(true)
    expect(findEntry('Explain two pointers in Python').guide.id).toBe('two-pointers')
    expect(findEntry('Explain pointers in C').title).toBeUndefined() // raw pointers entry, not two-pointers guide
    expect(findEntry('Explain pointers in C').build('C').title).toBe('Pointers & References')
  })
})
