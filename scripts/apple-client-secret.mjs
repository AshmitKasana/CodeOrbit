// Generates the "Secret Key (for OAuth)" that Supabase asks for when you enable
// the Apple provider. Apple doesn't hand out a static client secret — you sign
// a short-lived JWT with the .p8 private key from your Apple Developer account.
//
// Runs entirely on your machine (Node built-ins only, no dependencies); the
// .p8 key is read from disk and never sent anywhere.
//
// Usage:
//   node scripts/apple-client-secret.mjs <path-to-AuthKey.p8> <TEAM_ID> <KEY_ID> <SERVICES_ID>
//
// Example:
//   node scripts/apple-client-secret.mjs "C:\Users\me\Downloads\AuthKey_ABC123DEFG.p8" TEAM1234AB ABC123DEFG com.codeorbit.web
//
// Keep the .p8 file OUTSIDE this repo (it is a private key). Apple caps the
// secret's lifetime at 6 months, so this issues 180 days — put a reminder in
// your calendar to re-run this and paste the new value into Supabase, or Apple
// sign-in will silently stop working when it expires.

import { createPrivateKey, sign } from 'node:crypto'
import { readFileSync } from 'node:fs'

const [, , p8Path, teamId, keyId, servicesId] = process.argv

if (!p8Path || !teamId || !keyId || !servicesId) {
  console.error('Usage: node scripts/apple-client-secret.mjs <AuthKey.p8> <TEAM_ID> <KEY_ID> <SERVICES_ID>')
  process.exit(1)
}

const b64url = (input) => Buffer.from(input).toString('base64url')

const now = Math.floor(Date.now() / 1000)
const lifetimeSeconds = 60 * 60 * 24 * 180 // 180 days; Apple's maximum is ~6 months (15,777,000s)

const header = { alg: 'ES256', kid: keyId }
const payload = {
  iss: teamId,
  iat: now,
  exp: now + lifetimeSeconds,
  aud: 'https://appleid.apple.com',
  sub: servicesId,
}

const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`

let privateKey
try {
  privateKey = createPrivateKey(readFileSync(p8Path))
} catch (err) {
  console.error(`Could not read a private key from "${p8Path}": ${err.message}`)
  process.exit(1)
}

// JWTs use the raw r||s signature format (ieee-p1363), not Node's default DER.
const signature = sign('sha256', Buffer.from(signingInput), { key: privateKey, dsaEncoding: 'ieee-p1363' })
const jwt = `${signingInput}.${b64url(signature)}`

console.log(jwt)
console.error(`\nExpires: ${new Date(payload.exp * 1000).toISOString().slice(0, 10)}  (regenerate before then)`)
