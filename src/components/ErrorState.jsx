import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RotateCcw, Search } from 'lucide-react'

const MESSAGES = {
  EMPTY_INPUT: 'Please enter a topic to learn about.',
  RATE_LIMIT: "You've hit the rate limit — please wait a moment before trying again.",
  TIMEOUT: 'The request took too long to respond.',
  INVALID_RESPONSE: 'Code Orbit returned a malformed response.',
  API_ERROR: 'The AI backend returned an error.',
}

export default function ErrorState({ error, onRetry }) {
  const navigate = useNavigate()
  const message = MESSAGES[error?.code] || 'Something went wrong while generating your explanation.'

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 dark:border-surface-border dark:text-slate-500">
        <AlertTriangle size={24} />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{message}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        This can happen due to a network hiccup, a temporary rate limit, or an unusual query. Try again, or head back to search.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={onRetry} className="btn-primary">
          <RotateCcw size={15} /> Try Again
        </button>
        <button onClick={() => navigate('/')} className="btn-secondary">
          <Search size={15} /> Back to Search
        </button>
      </div>
    </div>
  )
}
