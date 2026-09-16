import { LANGUAGE_ALIASES } from './constants'

export function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function unslugify(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const STOPWORDS = new Set([
  'explain', 'teach', 'me', 'about', 'in', 'with', 'an', 'a', 'the', 'to',
  'show', 'how', 'does', 'do', 'what', 'is', 'are', 'give', 'please', 'can',
  'you', 'example', 'examples', 'of', 'for', 'and', 'using', 'implement',
  'write', 'code', 'help', 'understand',
])

/**
 * Very small natural-language query parser used by the mock AI layer.
 * A real backend would replace this with an LLM call, but the shape of
 * the returned object (topic / language / rawQuery) is the contract the
 * rest of the app relies on.
 */
export function parseQuery(rawQuery) {
  const query = rawQuery.trim()
  const lower = query.toLowerCase()

  let language = null
  for (const [alias, canonical] of Object.entries(LANGUAGE_ALIASES)) {
    const re = new RegExp(`(^|[^a-z+#])${alias.replace(/[+#]/g, '\\$&')}([^a-z+#]|$)`, 'i')
    if (re.test(lower)) {
      language = canonical
      break
    }
  }

  const words = lower
    .replace(/[?.!]/g, '')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))

  // remove language token(s) from the topic words
  const languageWords = language
    ? Object.keys(LANGUAGE_ALIASES).filter((k) => LANGUAGE_ALIASES[k] === language)
    : []

  const topicWords = words.filter((w) => !languageWords.includes(w))
  const topic = (topicWords.length ? topicWords : words).join(' ').trim() || query

  return {
    rawQuery: query,
    topic: titleCase(topic),
    language,
  }
}

export function titleCase(str) {
  return str
    .split(' ')
    .map((w) => (w.length <= 3 && w === w.toLowerCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

// ---------- localStorage helpers ----------

function readList(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* storage unavailable — ignore */
  }
}

const HISTORY_KEY = 'dsa-ai:history'
const BOOKMARKS_KEY = 'dsa-ai:bookmarks'
const PROGRESS_KEY = 'dsa-ai:roadmap-progress'
const THEME_KEY = 'dsa-ai:theme'

/**
 * All of history/bookmarks/roadmap-progress are namespaced per signed-in
 * user (via their Supabase id) so accounts don't share data on a shared
 * device, while a signed-out visitor keeps using the original unscoped key
 * — no behavior change for existing guest usage, and no backend required
 * (per the spec: "use localStorage with a clean abstraction" when a real
 * database table isn't configured).
 */
function scopedKey(base, userId) {
  return userId ? `${base}:${userId}` : base
}

export function getHistory(userId) {
  return readList(scopedKey(HISTORY_KEY, userId))
}

export function addToHistory(entry, userId) {
  const key = scopedKey(HISTORY_KEY, userId)
  const list = readList(key).filter((e) => e.slug !== entry.slug)
  list.unshift({ ...entry, timestamp: Date.now() })
  writeList(key, list.slice(0, 20))
  return list
}

export function clearHistory(userId) {
  writeList(scopedKey(HISTORY_KEY, userId), [])
}

export function getBookmarks(userId) {
  return readList(scopedKey(BOOKMARKS_KEY, userId))
}

export function isBookmarked(slug, userId) {
  return getBookmarks(userId).some((b) => b.slug === slug)
}

export function toggleBookmark(entry, userId) {
  const key = scopedKey(BOOKMARKS_KEY, userId)
  const list = readList(key)
  const exists = list.some((b) => b.slug === entry.slug)
  const next = exists ? list.filter((b) => b.slug !== entry.slug) : [{ ...entry, timestamp: Date.now() }, ...list]
  writeList(key, next)
  return next
}

export function getRoadmapProgress(userId) {
  try {
    const raw = localStorage.getItem(scopedKey(PROGRESS_KEY, userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setRoadmapStatus(id, status, userId) {
  const progress = getRoadmapProgress(userId)
  progress[id] = status
  try {
    localStorage.setItem(scopedKey(PROGRESS_KEY, userId), JSON.stringify(progress))
  } catch {
    /* ignore */
  }
  return progress
}

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}
