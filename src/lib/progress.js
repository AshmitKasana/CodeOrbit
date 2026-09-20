// Learning progress: daily activity, streaks, XP and badges.
//
// Everything is stored locally (namespaced per signed-in user, like history and
// bookmarks in utils/helpers.js) and derived from one small record:
//
//   { days: { 'YYYY-MM-DD': { lesson: 2, visualizer: 1, ... } },
//     lessons: ['binary-search', ...] }          // unique lesson slugs seen
//
// The functions that compute streaks/XP/badges are pure so they can be unit
// tested without a browser.

import { scopedKey } from '../utils/helpers'

const ACTIVITY_KEY = 'dsa-ai:activity'
const MAX_LESSONS = 500

export const XP_PER_ACTION = { lesson: 10, visualizer: 5, complexity: 3, roadmap: 25 }
export const XP_PER_LEVEL = 100

/** Local-calendar day string, e.g. "2026-09-20". */
export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const toUtcNoon = (day) => Date.parse(`${day}T12:00:00Z`)
const DAY_MS = 86_400_000

/** Whole days from `a` to `b` (both 'YYYY-MM-DD'); positive when b is later. */
export function daysBetween(a, b) {
  return Math.round((toUtcNoon(b) - toUtcNoon(a)) / DAY_MS)
}

/**
 * Current and longest streak from a list of active days.
 * The current streak is still alive if today has no activity yet but
 * yesterday did — you keep your streak until a full day is missed.
 */
export function computeStreak(activeDays, today = dayKey()) {
  const days = [...new Set(activeDays)].filter(Boolean).sort()
  if (days.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  const last = days[days.length - 1]
  const gap = daysBetween(last, today)
  if (gap < 0 || gap > 1) return { current: 0, longest } // last activity is stale (or in the future)

  let current = 1
  for (let i = days.length - 1; i > 0 && daysBetween(days[i - 1], days[i]) === 1; i--) current += 1
  return { current, longest: Math.max(longest, current) }
}

// --- storage ------------------------------------------------------------------

const empty = () => ({ days: {}, lessons: [] })

export function getActivity(userId) {
  try {
    const raw = localStorage.getItem(scopedKey(ACTIVITY_KEY, userId))
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? { days: parsed.days || {}, lessons: parsed.lessons || [] } : empty()
  } catch {
    return empty()
  }
}

/**
 * Records one learning action ('lesson' | 'visualizer' | 'complexity' | 'roadmap')
 * for today. `meta.slug` de-duplicates lessons for the "unique lessons" count.
 */
export function recordActivity(userId, type, meta = {}, now = new Date()) {
  const activity = getActivity(userId)
  const day = dayKey(now)
  const today = { ...(activity.days[day] || {}) }
  today[type] = (today[type] || 0) + 1
  activity.days[day] = today

  if (type === 'lesson' && meta.slug && !activity.lessons.includes(meta.slug)) {
    activity.lessons = [...activity.lessons, meta.slug].slice(-MAX_LESSONS)
  }

  try {
    localStorage.setItem(scopedKey(ACTIVITY_KEY, userId), JSON.stringify(activity))
  } catch {
    /* storage unavailable — progress just won't persist */
  }
  return activity
}

// --- derived stats --------------------------------------------------------------

export function computeStats(activity, roadmapProgress = {}, today = dayKey()) {
  const totals = { lesson: 0, visualizer: 0, complexity: 0, roadmap: 0 }
  for (const counts of Object.values(activity.days)) {
    for (const key of Object.keys(totals)) totals[key] += counts[key] || 0
  }
  const roadmapCompleted = Object.values(roadmapProgress).filter((s) => s === 'Completed').length
  const activeDays = Object.keys(activity.days)
  const { current, longest } = computeStreak(activeDays, today)

  const xp =
    totals.lesson * XP_PER_ACTION.lesson +
    totals.visualizer * XP_PER_ACTION.visualizer +
    totals.complexity * XP_PER_ACTION.complexity +
    roadmapCompleted * XP_PER_ACTION.roadmap

  return {
    ...totals,
    uniqueLessons: activity.lessons.length,
    roadmapCompleted,
    activeDays: activeDays.length,
    currentStreak: current,
    longestStreak: longest,
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xpIntoLevel: xp % XP_PER_LEVEL,
    xpForNext: XP_PER_LEVEL,
  }
}

export const BADGES = [
  { id: 'first-lesson', label: 'Lift-off', description: 'Open your first lesson', earned: (s) => s.uniqueLessons >= 1 },
  { id: 'five-lessons', label: 'Curious Mind', description: 'Explore 5 different topics', earned: (s) => s.uniqueLessons >= 5 },
  { id: 'ten-lessons', label: 'Deep Diver', description: 'Explore 10 different topics', earned: (s) => s.uniqueLessons >= 10 },
  { id: 'visualizer', label: 'Watch It Run', description: 'Finish an algorithm in the Visualizer', earned: (s) => s.visualizer >= 1 },
  { id: 'complexity', label: 'Big-O Thinker', description: 'Open the Big-O Explorer', earned: (s) => s.complexity >= 1 },
  { id: 'streak-3', label: 'On a Roll', description: 'Keep a 3-day streak', earned: (s) => s.longestStreak >= 3 },
  { id: 'streak-7', label: 'Week of Orbit', description: 'Keep a 7-day streak', earned: (s) => s.longestStreak >= 7 },
  { id: 'roadmap-half', label: 'Halfway There', description: 'Complete half of the roadmap', earned: (s, roadmapTotal) => roadmapTotal > 0 && s.roadmapCompleted >= Math.ceil(roadmapTotal / 2) },
]

export function evaluateBadges(stats, roadmapTotal = 0) {
  return BADGES.map((badge) => ({ ...badge, earned: Boolean(badge.earned(stats, roadmapTotal)) }))
}

/** The last `count` days ending today, each with whether there was activity. */
export function recentDays(activity, count = 7, today = dayKey()) {
  // Step back from UTC-noon of `today` so daylight-saving shifts can never skip or repeat a day.
  const end = toUtcNoon(today)
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(end - (count - 1 - i) * DAY_MS).toISOString().slice(0, 10)
    const counts = activity.days[day]
    return { day, active: Boolean(counts), total: counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0 }
  })
}
