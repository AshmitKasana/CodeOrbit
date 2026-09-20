// Short-window burst limiter (requests per minute per client). This is a
// separate concern from the daily quota: the quota caps total spend, this
// stops someone hammering the endpoint in a tight loop. Expired entries are
// pruned so the map can't grow without bound.

export function createBurstLimiter({ windowMs = 60_000, max = 20, now = () => Date.now() } = {}) {
  const hits = new Map()

  function prune(t) {
    for (const [id, entry] of hits) if (t > entry.resetAt) hits.delete(id)
  }

  return {
    /** Returns true if this request should be rejected. */
    limited(id) {
      const t = now()
      if (hits.size > 5000) prune(t)
      let entry = hits.get(id)
      if (!entry || t > entry.resetAt) {
        entry = { count: 0, resetAt: t + windowMs }
        hits.set(id, entry)
      }
      entry.count += 1
      return entry.count > max
    },
  }
}
