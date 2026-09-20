import { beforeEach, describe, expect, it } from 'vitest'
import {
  addToHistory,
  clearHistory,
  getBookmarks,
  getHistory,
  getRoadmapProgress,
  getStoredTheme,
  isBookmarked,
  parseQuery,
  scopedKey,
  setRoadmapStatus,
  setStoredTheme,
  slugify,
  titleCase,
  toggleBookmark,
  unslugify,
} from './helpers'

beforeEach(() => localStorage.clear())

describe('slugify / unslugify', () => {
  it('turns text into a URL slug', () => {
    expect(slugify('Explain Pointers in Java!')).toBe('explain-pointers-in-java')
    expect(slugify('  C++ & C#  ')).toBe('c-c')
    expect(slugify("Dijkstra's Algorithm")).toBe('dijkstra-s-algorithm')
  })

  it('round-trips a simple slug into a title', () => {
    expect(unslugify('binary-search-tree')).toBe('Binary Search Tree')
  })
})

describe('parseQuery', () => {
  it('extracts the language and a clean topic', () => {
    expect(parseQuery('Explain pointers in Java')).toMatchObject({ language: 'Java', topic: 'Pointers' })
  })

  it('understands language aliases and symbols', () => {
    expect(parseQuery('binary tree traversal in C++').language).toBe('C++')
    expect(parseQuery('linked lists in js').language).toBe('JavaScript')
    expect(parseQuery('hash maps in golang').language).toBe('Go')
  })

  it('does not mistake letters inside other words for a language', () => {
    // "c" inside "cache" / "recursion" must not be read as the C language
    expect(parseQuery('cache and recursion').language).toBeNull()
  })

  it('leaves language null when none is named and keeps the raw query', () => {
    const parsed = parseQuery('quick sort with example')
    expect(parsed.language).toBeNull()
    expect(parsed.topic).toBe('Quick Sort')
    expect(parsed.rawQuery).toBe('quick sort with example')
  })

  it('falls back to the original text when everything is a stopword', () => {
    expect(parseQuery('what is').topic).toBeTruthy()
  })
})

describe('titleCase', () => {
  it('capitalises words but leaves short lowercase words alone', () => {
    expect(titleCase('binary search of trees')).toBe('Binary Search of Trees')
  })
})

describe('history', () => {
  it('stores most-recent-first and de-duplicates by slug', () => {
    addToHistory({ slug: 'a', title: 'A' })
    addToHistory({ slug: 'b', title: 'B' })
    addToHistory({ slug: 'a', title: 'A again' })
    expect(getHistory().map((h) => h.slug)).toEqual(['a', 'b'])
    expect(getHistory()[0].title).toBe('A again')
  })

  it('keeps at most 20 entries', () => {
    for (let i = 0; i < 25; i++) addToHistory({ slug: `s${i}`, title: `S${i}` })
    expect(getHistory()).toHaveLength(20)
    expect(getHistory()[0].slug).toBe('s24')
  })

  it('is scoped per user and can be cleared', () => {
    addToHistory({ slug: 'a', title: 'A' }, 'user-1')
    expect(getHistory('user-1')).toHaveLength(1)
    expect(getHistory('user-2')).toHaveLength(0)
    expect(getHistory()).toHaveLength(0)
    clearHistory('user-1')
    expect(getHistory('user-1')).toHaveLength(0)
  })

  it('survives corrupt storage', () => {
    localStorage.setItem('dsa-ai:history', 'not json')
    expect(getHistory()).toEqual([])
  })
})

describe('bookmarks', () => {
  it('toggles a bookmark on and off', () => {
    expect(isBookmarked('heaps')).toBe(false)
    toggleBookmark({ slug: 'heaps', title: 'Heaps' })
    expect(isBookmarked('heaps')).toBe(true)
    expect(getBookmarks()).toHaveLength(1)
    toggleBookmark({ slug: 'heaps', title: 'Heaps' })
    expect(isBookmarked('heaps')).toBe(false)
  })

  it('keeps bookmarks separate per account', () => {
    toggleBookmark({ slug: 'heaps', title: 'Heaps' }, 'u1')
    expect(isBookmarked('heaps', 'u1')).toBe(true)
    expect(isBookmarked('heaps', 'u2')).toBe(false)
  })
})

describe('roadmap progress and theme', () => {
  it('stores a status per roadmap step', () => {
    setRoadmapStatus('arrays', 'Learning')
    setRoadmapStatus('graphs', 'Completed')
    expect(getRoadmapProgress()).toEqual({ arrays: 'Learning', graphs: 'Completed' })
  })

  it('remembers the theme', () => {
    expect(getStoredTheme()).toBeNull()
    setStoredTheme('light')
    expect(getStoredTheme()).toBe('light')
  })
})

describe('scopedKey', () => {
  it('namespaces by user id only when there is one', () => {
    expect(scopedKey('base')).toBe('base')
    expect(scopedKey('base', 'u1')).toBe('base:u1')
  })
})
