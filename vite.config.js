import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
