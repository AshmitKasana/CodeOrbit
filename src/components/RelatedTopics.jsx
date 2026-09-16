import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { slugify } from '../utils/helpers'

export default function RelatedTopics({ topics = [] }) {
  const navigate = useNavigate()
  if (!topics.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((t) => (
        <motion.button
          key={t}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/learn/${slugify(t)}`)}
          className="group chip flex items-center gap-1.5"
        >
          {t}
          <ArrowUpRight size={13} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:group-hover:text-white" />
        </motion.button>
      ))}
    </div>
  )
}
