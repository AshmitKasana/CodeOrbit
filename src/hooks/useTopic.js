import { useCallback, useEffect, useRef, useState } from 'react'
import { generateExplanation, askFollowUp as askFollowUpService, LOADING_STAGES } from '../services/aiService'
import { addToHistory } from '../utils/helpers'
import { recordActivity } from '../lib/progress'
import { useAuth } from './useAuth'

/**
 * Drives the AI generation lifecycle for a single learning query: staged
 * loading state, result caching per (query, level), error handling with
 * retry, and a follow-up conversation thread scoped to the current topic.
 *
 * status: idle | loading | success | error | limit
 * `limit` is set when the server reports the daily AI quota is used up.
 */
export function useTopic(rawQuery, level) {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle')
  const [stageIndex, setStageIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [limit, setLimit] = useState(null)
  const [conversation, setConversation] = useState([])
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const cache = useRef(new Map())

  const run = useCallback(async () => {
    if (!rawQuery) return
    const cacheKey = `${rawQuery}::${level}`
    // A topic already generated this session is free to re-view.
    if (cache.current.has(cacheKey)) {
      setResult(cache.current.get(cacheKey))
      setStatus('success')
      return
    }
    setStatus('loading')
    setStageIndex(0)
    setError(null)
    setLimit(null)
    try {
      const data = await generateExplanation(rawQuery, level, setStageIndex)
      cache.current.set(cacheKey, data)
      setResult(data)
      setStatus('success')
      addToHistory({ slug: data.slug, title: data.title, query: rawQuery, language: data.language }, user?.id)
      recordActivity(user?.id, 'lesson', { slug: data.slug })
    } catch (err) {
      if (err?.code === 'QUOTA_EXCEEDED') {
        setLimit({ quota: err.quota, signedIn: err.signedIn })
        setStatus('limit')
        return
      }
      setError(err)
      setStatus('error')
    }
  }, [rawQuery, level, user?.id])

  useEffect(() => {
    run()
    setConversation([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuery, level])

  const retry = useCallback(() => {
    if (rawQuery) {
      const cacheKey = `${rawQuery}::${level}`
      cache.current.delete(cacheKey)
    }
    run()
  }, [run, rawQuery, level])

  const askFollowUp = useCallback(
    async (question) => {
      if (!result) return
      setFollowUpLoading(true)
      const userMsg = { role: 'user', text: question, id: Date.now() }
      setConversation((prev) => [...prev, userMsg])
      try {
        const answer = await askFollowUpService(result, question, conversation)
        setConversation((prev) => [...prev, { role: 'ai', text: answer, id: Date.now() + 1 }])
      } catch (err) {
        const message = err?.code === 'QUOTA_EXCEEDED' || err?.code === 'OFF_TOPIC' || err?.code === 'REFUSED'
          ? err.message
          : 'Sorry, something went wrong answering that. Please try again.'
        setConversation((prev) => [...prev, { role: 'ai', text: message, id: Date.now() + 1, isError: true }])
      } finally {
        setFollowUpLoading(false)
      }
    },
    [result, conversation]
  )

  return {
    status,
    stageIndex,
    stageLabel: LOADING_STAGES[stageIndex] || LOADING_STAGES[0],
    result,
    error,
    limit,
    retry,
    conversation,
    askFollowUp,
    followUpLoading,
  }
}
