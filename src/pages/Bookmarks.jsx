import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Trash2 } from 'lucide-react'
import { getBookmarks, toggleBookmark } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'

export default function Bookmarks() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => setBookmarks(getBookmarks(user?.id)), [user?.id])

  function remove(b) {
    const next = toggleBookmark(b, user?.id)
    setBookmarks(next)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Bookmarks</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
          Topics you've saved for later, tied to your account on this browser.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Bookmark size={28} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">No bookmarks yet. Open a topic and click "Bookmark" to save it here.</p>
          <button onClick={() => navigate('/topics')} className="btn-primary mt-4">
            Browse Topics
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((b) => (
            <div key={b.slug} className="card flex items-center justify-between px-4 py-3">
              <button onClick={() => navigate(`/learn/${b.slug}`, { state: { rawQuery: b.title } })} className="text-left font-medium text-slate-800 hover:text-slate-950 dark:text-slate-100 dark:hover:text-white">
                {b.title}
                {b.language && <span className="ml-2 text-xs font-normal text-slate-400">({b.language})</span>}
              </button>
              <button onClick={() => remove(b)} aria-label="Remove bookmark" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
