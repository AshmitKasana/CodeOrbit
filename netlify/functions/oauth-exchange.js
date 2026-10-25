// Netlify Function: exchanges an OAuth authorization code for the user's
// profile. Secrets are read from Netlify environment variables (GITHUB_CLIENT_SECRET,
// GOOGLE_CLIENT_SECRET, VITE_GITHUB_CLIENT_ID, VITE_GOOGLE_CLIENT_ID) and never reach the browser.

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Request body must be valid JSON.' })
  }

  const { provider = 'google', code, clientId, redirectUri } = body
  if (!code) return json(400, { error: 'Missing authorization code.' })

  try {
    if (provider === 'github') {
      const id = process.env.VITE_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID
      const secret = process.env.GITHUB_CLIENT_SECRET
      if (!id || !secret) return json(400, { error: 'GitHub OAuth credentials are not configured on the server.' })

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: id, client_secret: secret, code, redirect_uri: redirectUri }),
      })
      const token = await tokenRes.json()
      if (!token.access_token) return json(400, { error: token.error_description || 'GitHub rejected the authorization code.' })

      const profileRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json' },
      })
      const profile = await profileRes.json()
      return json(200, {
        user: {
          id: String(profile.id),
          email: profile.email || `${profile.login}@users.noreply.github.com`,
          name: profile.name || profile.login,
          username: profile.login,
          avatar_url: profile.avatar_url || null,
          provider: 'github',
        },
      })
    }

    if (provider === 'google') {
      const id = clientId || process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      const secret = process.env.GOOGLE_CLIENT_SECRET
      if (!id || !secret) return json(400, { error: 'Google OAuth credentials are not configured on the server.' })

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: id,
          client_secret: secret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })
      const token = await tokenRes.json()
      if (!token.access_token) return json(400, { error: token.error_description || 'Google rejected the authorization code.' })

      const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
      const profile = await profileRes.json()
      return json(200, {
        user: {
          id: profile.sub,
          email: profile.email,
          name: profile.name || profile.given_name || profile.email?.split('@')[0],
          avatar_url: profile.picture || null,
          provider: 'google',
        },
      })
    }

    return json(400, { error: `Unsupported provider: ${provider}` })
  } catch (err) {
    return json(502, { error: err?.message || 'OAuth exchange failed.' })
  }
}
