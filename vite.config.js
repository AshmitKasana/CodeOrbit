import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handler as oauthExchange } from './netlify/functions/oauth-exchange.js'

// Dev-only: serves POST /api/auth/oauth/exchange straight from the Vite dev
// server (same code as the Netlify Function), so GitHub/Google sign-in works
// with just `npm run dev` — no separate backend needed. Secrets are read from
// .env here on the server side and never reach the browser.
function oauthExchangeDevPlugin() {
  return {
    name: 'code-orbit-oauth-exchange',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      for (const key of ['VITE_GITHUB_CLIENT_ID', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'VITE_GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }
      server.middlewares.use('/api/auth/oauth/exchange', (req, res) => {
        let raw = ''
        req.on('data', (chunk) => (raw += chunk))
        req.on('end', async () => {
          const result = await oauthExchange({ httpMethod: req.method, body: raw })
          res.statusCode = result.statusCode
          for (const [k, v] of Object.entries(result.headers || {})) res.setHeader(k, v)
          res.end(result.body)
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), oauthExchangeDevPlugin()],
  // Unit tests (npm test). Frontend tests run in jsdom (for localStorage);
  // server tests opt out with a `// @vitest-environment node` docblock.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}', 'server/**/*.test.js'],
    restoreMocks: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
    // This project lives under OneDrive, whose sync client can make chokidar's
    // filesystem polling noticeably slower. Explicit ignores (node_modules is
    // already excluded by Vite by default, but dist/.git are not) keep the
    // dev-server file watcher from doing extra work on folders that never
    // need HMR.
    watch: {
      ignored: ['**/dist/**', '**/.git/**'],
    },
  },
  // Heavy dependencies that are only ever imported inside a lazy-loaded route
  // (Monaco in the code playground, Supabase in the auth pages) would
  // otherwise only get discovered — and pre-bundled — the first time someone
  // actually navigates there, which triggers a "new dependency optimized,
  // reloading" full-page reload mid-session. Listing them here makes Vite
  // bundle everything up front at server start instead, so that stall never
  // happens later.
  optimizeDeps: {
    include: [
      '@monaco-editor/react',
      '@supabase/supabase-js',
      'react-markdown',
      'remark-gfm',
      'react-syntax-highlighter',
      'react-syntax-highlighter/dist/esm/styles/prism',
      'framer-motion',
    ],
  },
})
