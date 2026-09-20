// Daily usage quotas for the AI endpoints.
//
// The quota lives on the SERVER, keyed by a verified identity (a Supabase
// user id, or a hashed IP for anonymous visitors), so it can't be reset by
// clearing localStorage the way a browser-side counter can.
//
// Two interchangeable stores share one interface:
//   consume(key, limit) -> { allowed, used, limit, remaining, resetsAt }
//   release(key)        -> undo one consume() (used when the AI call fails)
//   peek(key, limit)    -> same shape as consume(), without counting
//
// - createMemoryQuota:   per-process Map. Zero setup; resets on restart and
//                        isn't shared between instances (fine for one server).
// - createSupabaseQuota: durable + shared, backed by the SQL in
//                        supabase/ai_usage.sql. Falls back to the memory store
//                        if the table/functions aren't installed yet, so the
//                        server never silently becomes "unlimited".

export function utcDay(nowMs = Date.now()) {
  return new Date(nowMs).toISOString().slice(0, 10)
}

export function nextResetIso(nowMs = Date.now()) {
  const d = new Date(nowMs)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)).toISOString()
}

function shape(allowed, used, limit, nowMs) {
  return {
    allowed,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetsAt: nextResetIso(nowMs),
  }
}

export function createMemoryQuota({ now = () => Date.now() } = {}) {
  let currentDay = utcDay(now())
  let counts = new Map()

  // Counters only matter for "today" — dropping the map at midnight UTC keeps
  // memory bounded without a background timer.
  function rollover() {
    const day = utcDay(now())
    if (day !== currentDay) {
      currentDay = day
      counts = new Map()
    }
  }

  return {
    kind: 'memory',
    async consume(key, limit) {
      rollover()
      const used = counts.get(key) ?? 0
      if (used >= limit) return shape(false, used, limit, now())
      counts.set(key, used + 1)
      return shape(true, used + 1, limit, now())
    },
    async release(key) {
      rollover()
      const used = counts.get(key) ?? 0
      if (used > 0) counts.set(key, used - 1)
    },
    async peek(key, limit) {
      rollover()
      const used = counts.get(key) ?? 0
      return shape(used < limit, used, limit, now())
    },
  }
}

export function createSupabaseQuota({
  client,
  now = () => Date.now(),
  fallback = createMemoryQuota({ now }),
  logger = console,
}) {
  let warned = false
  function degrade(err) {
    if (!warned) {
      warned = true
      logger.warn?.(`[quota] Supabase quota unavailable (${err?.message || err}) — using in-memory counters. Run supabase/ai_usage.sql to enable durable quotas.`)
    }
  }

  async function rpc(fn, args) {
    const { data, error } = await client.rpc(fn, args)
    if (error) throw error
    return Array.isArray(data) ? data[0] : data
  }

  return {
    kind: 'supabase',
    async consume(key, limit) {
      try {
        const row = await rpc('consume_ai_usage', { p_key: key, p_day: utcDay(now()), p_limit: limit })
        return shape(Boolean(row.allowed), row.used, limit, now())
      } catch (err) {
        degrade(err)
        return fallback.consume(key, limit)
      }
    },
    async release(key) {
      try {
        await rpc('release_ai_usage', { p_key: key, p_day: utcDay(now()) })
      } catch (err) {
        degrade(err)
        await fallback.release(key)
      }
    },
    async peek(key, limit) {
      try {
        const { data, error } = await client
          .from('ai_usage')
          .select('hits')
          .eq('key', key)
          .eq('day', utcDay(now()))
          .maybeSingle()
        if (error) throw error
        const used = data?.hits ?? 0
        return shape(used < limit, used, limit, now())
      } catch (err) {
        degrade(err)
        return fallback.peek(key, limit)
      }
    },
  }
}
