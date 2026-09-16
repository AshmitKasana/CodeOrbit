# Code Orbit

**Explore. Learn. Master.** An AI-powered Data Structures & Algorithms learning platform. Type any
programming/DSA question in plain English and get a full, structured, textbook-style breakdown:
overview, syntax, memory model, runnable code examples, complexity analysis, cross-language
comparisons, common mistakes, interview questions, and practice problems.

🔗 **Live:** [codeorbit21.netlify.app](https://codeorbit21.netlify.app)

---

### Created & engineered by [Ashmit Kasana](https://github.com/AshmitKasana)

Code Orbit is a solo-built, end-to-end product — design system, AI-generation pipeline, auth,
and every pixel of UI — by **Ashmit Kasana** ([@AshmitKasana](https://github.com/AshmitKasana) on
GitHub). See [`humans.txt`](public/humans.txt) and the structured data in [`index.html`](index.html)
for the machine-readable credit, and [About](https://codeorbit21.netlify.app/about) for the full
"Owner & Creator" card in the app itself.

---

**Created by Ashmit Kasana**

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. No API key is required — the app runs fully offline using a local mock
"AI" generator (see [Architecture](#architecture) below) so every feature works out of the box.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run server` | Start the optional Express backend at `server/index.js` |

## Architecture

- **`src/services/aiService.js`** — the single abstraction every component talks to. It exposes
  `generateExplanation(query, level, onStage)` and `askFollowUp(topic, question)`. By default it uses
  a local mock generator (`src/services/knowledgeBase.js` + heuristic templates) so the app is fully
  functional without any backend or API key.
- **`server/index.js`** — a minimal Express server showing where a *real* AI provider key belongs.
  It exposes `POST /api/generate`; the key is read from `ANTHROPIC_API_KEY` in a server-side `.env`
  file and is never bundled into frontend code.
- To switch the frontend to call the real backend, set `VITE_USE_REAL_AI=true` in a `.env` file (copy
  `.env.example`), implement `callProvider()` in `server/index.js`, and run `npm run server` alongside
  `npm run dev` (the Vite dev server proxies `/api/*` to it — see `vite.config.js`).
- If the real backend call fails for any reason, `aiService.js` automatically falls back to the local
  mock generator so the demo never hard-fails.

## Project structure

```
src/
├── components/       Reusable UI (CodeBlock, Diagram, PracticeCard, Spotlight, Magnetic, SplashScreen, ...)
│   └── glass/        The "Liquid Glass" surface system — navbar, modals, tooltips, dropdowns
├── pages/            Route-level pages (Home, Learn, Topics, Roadmap, Practice, Interview, Bookmarks,
│                     About, Login/Signup/ForgotPassword/ResetPassword, Dashboard, Profile, Settings, NotFound)
├── services/         aiService.js (API abstraction), knowledgeBase.js (mock content), authService.js
├── context/          AuthContext.jsx — the live Supabase session
├── hooks/            useTopic (generation lifecycle), useAuth, useLocalStorage
├── lib/               supabase.js — the Supabase client (guards against missing env vars)
├── utils/            constants.js, helpers.js (localStorage, query parsing, slugs)
public/               _redirects, robots.txt, sitemap.xml, humans.txt
server/               Optional Express backend stub for a real AI provider
```

Every route in `src/App.jsx` except `/` is lazy-loaded (`React.lazy` + `Suspense`) — the initial
bundle only pays for the homepage; Monaco, the syntax highlighter, and Supabase load on demand when
you actually navigate to a page that needs them.

## Notes on the mock AI layer

The mock generator never fabricates language features it can't verify — e.g. asking about "pointers in
Java" correctly explains Java's managed references instead of inventing `int *ptr;`-style syntax. A
handful of core topics (pointers, arrays, linked lists) have rich, hand-authored content; any other
query falls back to a heuristic template that stays generic and technically safe rather than guessing
specifics, while still returning the full schema so every section of the UI renders correctly.

## Deployment

Code Orbit deploys as a static site — no server required unless you wire up `server/index.js` for a
real AI backend.

1. **Build:** `npm run build` → static output in `dist/`.
2. **Netlify (current host):** [`netlify.toml`](netlify.toml) sets the build command, publish
   directory, Node version, SPA fallback (so `/learn/:topic` etc. work on a hard refresh), and basic
   security headers. [`public/_redirects`](public/_redirects) is a second, simpler copy of the same
   SPA fallback rule — either alone is enough.
3. **Environment variables** (set in your host's dashboard, never committed):
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — required for Login/Signup/OAuth to actually
     work. Without them the app runs fine but every auth action shows a clear "not configured"
     message instead of crashing — see [`AUTH_SETUP.md`](AUTH_SETUP.md).
   - `VITE_USE_REAL_AI` — optional, see [Architecture](#architecture) above.
4. **SEO/crawlability:** [`public/robots.txt`](public/robots.txt) points to
   [`public/sitemap.xml`](public/sitemap.xml); `index.html` carries Open Graph/Twitter card tags, a
   `<noscript>` fallback, and JSON-LD structured data naming the site and its creator. If you deploy
   to your own domain, update the hardcoded `https://codeorbit21.netlify.app` URLs in those three
   files plus the `og:url`/`canonical` tags in `index.html`.

## Code execution in the playground

The interactive code playground (on every `/learn/:topic` page) only truly *executes* JavaScript/
TypeScript, sandboxed to the viewer's own browser tab via `Function(...)` — never sent to a server.
Other languages show a message explaining that real execution requires a secure backend sandbox
(e.g. a containerized code-runner service), which is intentionally not implemented here to avoid
running arbitrary user code on a shared server.

## Design language

Restrained, monochrome, and dark-first — the same "less but better" instinct behind Apple's and
Microsoft's product sites — with exactly **one** reserved accent color (`signal`, a muted blue) for
the handful of moments that should feel special: the creator card, the command palette, focus rings.
A few deliberate, premium-feeling touches on top of that foundation:

- **Liquid Glass surfaces** (`src/components/glass/`) — translucent, blurred navbar/modals/dropdowns,
  reserved for floating chrome, never for reading content (code blocks, tables stay solid/high-contrast).
- **Spotlight** (`src/components/Spotlight.jsx`) — a soft, cursor-following glow behind the hero,
  the same instinct behind Razer/NVIDIA product pages, done in the app's own restrained palette.
- **Magnetic** (`src/components/Magnetic.jsx`) — the primary search CTA subtly pulls toward the
  cursor within a small radius, Apple/Awwwards-style.
- **Bento-grid features** on the homepage — one feature takes visual priority instead of a uniform
  card grid.
- A **command palette** (⌘K/Ctrl+K, `src/components/CommandPalette.jsx`) — jump anywhere or ask a
  question from any page, not just the homepage search box.
- A one-time, session-scoped **splash screen** (`src/components/SplashScreen.jsx`) and a distinct,
  on-brand **404** page (`src/pages/NotFound.jsx`) — the small details most side projects skip.
- Every animation respects `prefers-reduced-motion` (see `src/main.jsx` and `src/index.css`).

## Credits

Code Orbit — concept, design system, AI-generation pipeline, and full implementation — is the work
of **Ashmit Kasana**. If you use, fork, or learn from this project, a credit/link back is appreciated
but not required. Say hi or check out other work: [github.com/AshmitKasana](https://github.com/AshmitKasana).
