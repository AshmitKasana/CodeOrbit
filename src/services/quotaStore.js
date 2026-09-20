// Tiny external store holding the most recent AI quota reported by the backend
// (`{ used, limit, remaining, resetsAt }` per scope). Components read it with
// useQuota(); aiService writes to it after every backend response. It is
// purely informational — the real limit is enforced on the server.

let state = { generate: null, chat: null, signedIn: null }
const listeners = new Set()

export function getQuotaState() {
  return state
}

export function setQuota(scope, quota, extra = {}) {
  state = { ...state, ...extra, [scope]: quota ? { ...quota } : null }
  listeners.forEach((listener) => listener())
}

export function resetQuotaState() {
  state = { generate: null, chat: null, signedIn: null }
  listeners.forEach((listener) => listener())
}

export function subscribeQuota(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** "5h 12m" / "12m" until the quota resets. Returns '' if the date is invalid. */
export function formatResetIn(resetsAt, now = Date.now()) {
  const ms = Date.parse(resetsAt) - now
  if (!Number.isFinite(ms)) return ''
  if (ms <= 0) return 'now'
  const totalMinutes = Math.ceil(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
