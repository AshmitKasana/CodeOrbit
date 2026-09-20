// Small in-memory LRU cache with a TTL. Generating a lesson is the expensive
// part of the app, and many visitors ask for the same popular topics
// ("binary search", "dynamic programming"), so identical requests are served
// from here — they cost nothing and don't count against anyone's quota.

export function createTtlCache({ max = 500, ttlMs = 24 * 60 * 60 * 1000, now = () => Date.now() } = {}) {
  const map = new Map() // insertion order doubles as recency order

  return {
    get(key) {
      const entry = map.get(key)
      if (!entry) return undefined
      if (entry.expires <= now()) {
        map.delete(key)
        return undefined
      }
      // Re-insert so this key becomes the most recently used.
      map.delete(key)
      map.set(key, entry)
      return entry.value
    },
    set(key, value) {
      map.delete(key)
      map.set(key, { value, expires: now() + ttlMs })
      while (map.size > max) map.delete(map.keys().next().value)
    },
    clear() {
      map.clear()
    },
    get size() {
      return map.size
    },
  }
}

/** Normalises a request into a stable cache key (case/whitespace-insensitive). */
export function cacheKeyFor({ query, level, focus }) {
  return [focus, level, query.trim().toLowerCase().replace(/\s+/g, ' ')].join('::')
}
