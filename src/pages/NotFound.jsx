import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Home } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import OrbitMark from '../components/OrbitMark'
import { slugify } from '../utils/helpers'

export default function NotFound() {
  const navigate = useNavigate()

  function handleSubmit(query) {
    navigate(`/learn/${slugify(query)}`, { state: { rawQuery: query } })
  }

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(50%_50%_at_50%_40%,black,transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 text-slate-400 dark:border-surface-border dark:text-slate-500"
      >
        <OrbitMark size={34} spin />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="font-display text-6xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-3 max-w-md text-slate-500 dark:text-slate-400"
      >
        This page has drifted out of orbit. It doesn't exist, moved, or never did — but you can still get where you're going.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 w-full max-w-lg">
        <SearchBar onSubmit={handleSubmit} size="sm" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-primary">
          <Home size={15} /> Back to Home
        </Link>
        <Link to="/topics" className="btn-secondary">
          <Compass size={15} /> Explore Topics
        </Link>
      </motion.div>
    </div>
  )
}
