import { beforeEach, describe, expect, it } from 'vitest'
import {
  BADGES,
  XP_PER_LEVEL,
  computeStats,
  computeStreak,
  dayKey,
  daysBetween,
  evaluateBadges,
  getActivity,
  recentDays,
  recordActivity,
} from './progress'

beforeEach(() => localStorage.clear())

describe('dayKey / daysBetween', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(dayKey(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31')
  })

  it('counts whole days across month, year and DST boundaries', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1)
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2)
    expect(daysBetween('2026-11-01', '2026-11-02')).toBe(1) // DST change in many zones
    expect(daysBetween('2026-05-10', '2026-05-03')).toBe(-7)
  })
})

describe('computeStreak', () => {
  const today = '2026-09-20'

  it('is zero with no activity', () => {
    expect(computeStreak([], today)).toEqual({ current: 0, longest: 0 })
  })

  it('counts a single active day today', () => {
    expect(computeStreak([today], today)).toEqual({ current: 1, longest: 1 })
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-09-18', '2026-09-19', '2026-09-20'], today)).toEqual({ current: 3, longest: 3 })
  })

  it('keeps the streak alive if today has no activity yet but yesterday did', () => {
    expect(computeStreak(['2026-09-18', '2026-09-19'], today).current).toBe(2)
  })

  it('breaks the current streak after a missed day but remembers the longest', () => {
    const result = computeStreak(['2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-18'], today)
    expect(result).toEqual({ current: 0, longest: 4 })
  })

  it('only counts the most recent run as current', () => {
    const result = computeStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-19', '2026-09-20'], today)
    expect(result).toEqual({ current: 2, longest: 3 })
  })

  it('ignores duplicates and unsorted input', () => {
    expect(computeStreak(['2026-09-20', '2026-09-19', '2026-09-20', '2026-09-19'], today).current).toBe(2)
  })

  it('ignores activity dated in the future', () => {
    expect(computeStreak(['2026-09-25'], today).current).toBe(0)
  })
})

describe('recordActivity / getActivity', () => {
  const now = new Date(2026, 8, 20, 10)

  it('starts empty', () => {
    expect(getActivity()).toEqual({ days: {}, lessons: [] })
  })

  it('counts actions per day and type', () => {
    recordActivity(null, 'lesson', { slug: 'heaps' }, now)
    recordActivity(null, 'lesson', { slug: 'graphs' }, now)
    const activity = recordActivity(null, 'visualizer', {}, now)
    expect(activity.days['2026-09-20']).toEqual({ lesson: 2, visualizer: 1 })
  })

  it('tracks each lesson slug once', () => {
    recordActivity(null, 'lesson', { slug: 'heaps' }, now)
    recordActivity(null, 'lesson', { slug: 'heaps' }, now)
    expect(getActivity().lessons).toEqual(['heaps'])
  })

  it('persists across reads and keeps users separate', () => {
    recordActivity('user-a', 'lesson', { slug: 'a' }, now)
    recordActivity('user-b', 'lesson', { slug: 'b' }, now)
    expect(getActivity('user-a').lessons).toEqual(['a'])
    expect(getActivity('user-b').lessons).toEqual(['b'])
    expect(getActivity(null).lessons).toEqual([])
  })

  it('recovers from corrupt stored data', () => {
    localStorage.setItem('dsa-ai:activity', '{not json')
    expect(getActivity()).toEqual({ days: {}, lessons: [] })
  })
})

describe('computeStats', () => {
  const today = '2026-09-20'
  const activity = {
    days: {
      '2026-09-19': { lesson: 2, visualizer: 1 },
      '2026-09-20': { lesson: 1, complexity: 1 },
    },
    lessons: ['a', 'b', 'c'],
  }

  it('totals actions, streaks and unique lessons', () => {
    const stats = computeStats(activity, {}, today)
    expect(stats).toMatchObject({ lesson: 3, visualizer: 1, complexity: 1, uniqueLessons: 3, activeDays: 2, currentStreak: 2 })
  })

  it('computes XP and level, including roadmap completions', () => {
    const stats = computeStats(activity, { a: 'Completed', b: 'Learning', c: 'Completed' }, today)
    // 3 lessons*10 + 1 visualizer*5 + 1 complexity*3 + 2 roadmap*25 = 88
    expect(stats.xp).toBe(88)
    expect(stats.level).toBe(1)
    expect(stats.roadmapCompleted).toBe(2)
  })

  it('rolls over to the next level every 100 XP', () => {
    const many = { days: { [today]: { lesson: 15 } }, lessons: [] }
    const stats = computeStats(many, {}, today)
    expect(stats.xp).toBe(150)
    expect(stats.level).toBe(2)
    expect(stats.xpIntoLevel).toBe(150 - XP_PER_LEVEL)
  })
})

describe('badges', () => {
  it('awards nothing to a brand-new learner', () => {
    const stats = computeStats({ days: {}, lessons: [] }, {}, '2026-09-20')
    expect(evaluateBadges(stats, 14).every((b) => !b.earned)).toBe(true)
  })

  it('awards the right badges as milestones are reached', () => {
    const activity = {
      days: { '2026-09-18': { lesson: 1 }, '2026-09-19': { visualizer: 1 }, '2026-09-20': { complexity: 1 } },
      lessons: ['a', 'b', 'c', 'd', 'e'],
    }
    const stats = computeStats(activity, {}, '2026-09-20')
    const earned = Object.fromEntries(evaluateBadges(stats, 14).map((b) => [b.id, b.earned]))
    expect(earned).toMatchObject({
      'first-lesson': true,
      'five-lessons': true,
      'ten-lessons': false,
      visualizer: true,
      complexity: true,
      'streak-3': true,
      'streak-7': false,
    })
  })

  it('awards the roadmap badge at the halfway point', () => {
    const progress = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`s${i}`, 'Completed']))
    const stats = computeStats({ days: {}, lessons: [] }, progress, '2026-09-20')
    expect(evaluateBadges(stats, 14).find((b) => b.id === 'roadmap-half').earned).toBe(true)
    expect(evaluateBadges(stats, 15).find((b) => b.id === 'roadmap-half').earned).toBe(false)
  })

  it('has unique ids and descriptions', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length)
    expect(BADGES.every((b) => b.label && b.description)).toBe(true)
  })
})

describe('recentDays', () => {
  it('returns the last N days ending today with activity flags', () => {
    const activity = { days: { '2026-09-18': { lesson: 1 }, '2026-09-20': { lesson: 2, visualizer: 1 } }, lessons: [] }
    const days = recentDays(activity, 7, '2026-09-20')
    expect(days).toHaveLength(7)
    expect(days[0].day).toBe('2026-09-14')
    expect(days[6]).toMatchObject({ day: '2026-09-20', active: true, total: 3 })
    expect(days.find((d) => d.day === '2026-09-19').active).toBe(false)
    expect(days.find((d) => d.day === '2026-09-18').active).toBe(true)
  })
})
