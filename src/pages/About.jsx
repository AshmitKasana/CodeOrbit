import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Code2, GitCompareArrows, Layers, ListChecks, Route, Terminal } from 'lucide-react'
import OrbitMark from '../components/OrbitMark'
import CreatorCard from '../components/CreatorCard'
import Reveal, { revealItem } from '../components/Reveal'

const STATS = [
  { value: '65+', label: 'DSA & CS Topic Guides' },
  { value: '180+', label: 'Practice Problems' },
  { value: '120+', label: 'Interview Questions' },
  { value: '11', label: 'Programming Languages' },
]

const PILLARS = [
  {
    icon: Layers,
    title: 'Multi-Depth Concept Engine',
    description:
      'Switch any lesson between Beginner, Intermediate, Advanced, and Interview depth — complete with analogies, step-by-step walkthroughs, and animated diagrams.',
  },
  {
    icon: Terminal,
    title: 'Interactive Code Examples',
    description:
      'Read, copy, and run code examples across Python, Java, C++, JavaScript, TypeScript, Go, Rust, C, C#, Kotlin, and Swift.',
  },
  {
    icon: GitCompareArrows,
    title: 'Built for Language Accuracy',
    description:
      'Compare real language semantics, memory behavior, and Big-O complexity side by side without fabricated syntax.',
  },
  {
    icon: ListChecks,
    title: 'Role & Company Interview Prep',
    description:
      'Filter 120+ curated interview questions and 180+ practice problems by company, role, pattern, and difficulty with Flashcard Quiz Mode.',
  },
]

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-700 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-200">
          <OrbitMark size={22} spin />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          About Code Orbit
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
          Code Orbit is an interactive learning platform for Data Structures, Algorithms, and Programming Languages.
          Search any topic in plain English to get a structured breakdown: intuition, syntax, memory behavior, runnable
          code examples, Big-O complexity, cross-language comparisons, interview questions, and practice problems.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link to="/topics" className="btn-primary text-xs">
            <BookOpen size={14} /> Explore Topics
          </Link>
          <Link to="/roadmap" className="btn-secondary text-xs">
            <Route size={14} /> DSA Roadmap
          </Link>
          <Link to="/practice" className="btn-secondary text-xs">
            <Code2 size={14} /> Practice Problems
          </Link>
        </div>
      </Reveal>

      <Reveal stagger={0.04} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <motion.div key={s.label} variants={revealItem} className="card flex h-full flex-col justify-center p-5 text-center">
            <p className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </Reveal>

      <Reveal stagger={0.04} className="mt-6 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <motion.div key={p.title} variants={revealItem} className="card card-hover flex h-full flex-col p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600 dark:border-surface-border dark:bg-white/[0.03] dark:text-slate-300">
              <p.icon size={18} />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">{p.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.description}</p>
          </motion.div>
        ))}
      </Reveal>

      <Reveal className="mt-12 text-center">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Created &amp; Engineered By</h2>
        <CreatorCard className="mx-auto max-w-md text-left" />
      </Reveal>
    </div>
  )
}
