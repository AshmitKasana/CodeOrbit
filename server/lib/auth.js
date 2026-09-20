import { createHash } from 'node:crypto'

// Works out WHO a request is from, for quota purposes:
//   - a signed-in Supabase user (verified by asking Supabase to validate the
//     bearer token — the token is never trusted on its own), or
//   - an anonymous visitor, identified by a salted hash of their IP so raw
//     addresses are never stored in the quota table.

export function hashId(value, salt = '') {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32)
}

export function createIdentityResolver({ supabaseAdmin = null, salt = '' } = {}) {
  return async function resolveIdentity(req) {
    const header = req.headers?.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

    if (token && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.auth.getUser(token)
        if (!error && data?.user?.id) {
          return { kind: 'user', id: data.user.id, key: `user:${data.user.id}` }
        }
      } catch {
        /* invalid/expired token or Supabase unreachable — treat as anonymous */
      }
    }

    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    return { kind: 'anon', id: ip, key: `anon:${hashId(ip, salt)}` }
  }
}
