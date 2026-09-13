# DSA AI

An AI-powered Data Structures & Algorithms learning platform. Type any programming/DSA question in
plain English and get a full, structured, textbook-style breakdown: overview, syntax, memory model,
runnable code examples, complexity analysis, cross-language comparisons, common mistakes, interview
questions, and practice problems.

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
├── components/       Reusable UI building blocks (CodeBlock, Diagram, PracticeCard, ...)
├── pages/            Route-level pages (Home, Learn, Topics, Roadmap, Practice, Interview, Bookmarks, About)
├── services/         aiService.js (API abstraction) + knowledgeBase.js (mock content)
├── hooks/            useTopic (generation lifecycle), useLocalStorage
├── utils/            constants.js, helpers.js (localStorage, query parsing, slugs)
server/               Optional Express backend stub for a real AI provider
```

## Notes on the mock AI layer

The mock generator never fabricates language features it can't verify — e.g. asking about "pointers in
Java" correctly explains Java's managed references instead of inventing `int *ptr;`-style syntax. A
handful of core topics (pointers, arrays, linked lists) have rich, hand-authored content; any other
query falls back to a heuristic template that stays generic and technically safe rather than guessing
specifics, while still returning the full schema so every section of the UI renders correctly.

## Code execution in the playground

The interactive code playground (on every `/learn/:topic` page) only truly *executes* JavaScript/
TypeScript, sandboxed to the viewer's own browser tab via `Function(...)` — never sent to a server.
Other languages show a message explaining that real execution requires a secure backend sandbox
(e.g. a containerized code-runner service), which is intentionally not implemented here to avoid
running arbitrary user code on a shared server.
