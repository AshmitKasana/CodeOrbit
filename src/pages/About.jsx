import { Code2, Github, ShieldCheck, Sparkles } from 'lucide-react'
import OrbitMark from '../components/OrbitMark'
import CreatorCard from '../components/CreatorCard'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 dark:border-surface-border dark:text-slate-200">
        <OrbitMark size={22} />
      </div>
      <h1 className="mt-5 font-display text-3xl font-bold text-slate-900 dark:text-white">About Code Orbit</h1>
      <p className="prose-dsa mt-4 text-base">
        Code Orbit is an AI-powered learning platform for Data Structures, Algorithms, and programming languages. Type a
        question in plain English and get a structured, textbook-quality breakdown: overview, syntax, memory behavior,
        runnable examples, complexity analysis, cross-language comparisons, common mistakes, interview questions, and
        practice problems — all generated from a single query.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card icon={Sparkles} title="How generation works">
          Queries are parsed for a topic and (optional) language, then sent through <code>src/services/aiService.js</code> —
          a clean abstraction that can call a real backend AI route or fall back to a local generator so the app is fully
          functional without an API key.
        </Card>
        <Card icon={ShieldCheck} title="No exposed API keys">
          The frontend never holds a provider API key. Real AI calls go through a backend route (see{' '}
          <code>server/index.js</code>) that reads the key from environment variables server-side.
        </Card>
        <Card icon={Code2} title="Built for accuracy">
          Content is written to avoid fabricating language features — for example, Java's lack of raw pointers is
          explained via references rather than invented pointer syntax.
        </Card>
        <Card icon={Github} title="Tech stack">
          React, Vite, Tailwind CSS, React Router, Framer Motion, Monaco Editor, react-syntax-highlighter, and
          react-markdown.
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Credits</h2>
        <CreatorCard />
      </div>
    </div>
  )
}

function Card({ icon: Icon, title, children }) {
  return (
    <div className="card card-hover p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-surface-border dark:text-slate-300">
        <Icon size={18} />
      </span>
      <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="prose-dsa mt-1 text-sm">{children}</p>
    </div>
  )
}
