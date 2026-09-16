import { useCallback, useEffect, useRef, useState } from 'react'
import { generateExplanation, askFollowUp as askFollowUpService, LOADING_STAGES } from '../services/aiService'
import { addToHistory } from '../utils/helpers'
import { useAuth } from './useAuth'

/**
 * Drives the AI generation lifecycle for a single learning query: staged
 * loading state, result caching per (query, level), error handling with
 * retry, and a follow-up conversation thread scoped to the current topic.
 */
export function useTopic(rawQuery, level) {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [stageIndex, setStageIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [conversation, setConversation] = useState([])
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const cache = useRef(new Map())

  const run = useCallback(async () => {
    if (!rawQuery) return
    const cacheKey = `${rawQuery}::${level}`
    if (cache.current.has(cacheKey)) {
      setResult(cache.current.get(cacheKey))
      setStatus('success')
      return
    }
    setStatus('loading')
    setStageIndex(0)
    setError(null)
    try {
      const data = await generateExplanation(rawQuery, level, setStageIndex)
      cache.current.set(cacheKey, data)
      setResult(data)
      setStatus('success')
      addToHistory({ slug: data.slug, title: data.title, query: rawQuery, language: data.language }, user?.id)
    } catch (err) {
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
        setConversation((prev) => [...prev, { role: 'ai', text: 'Sorry, something went wrong answering that. Please try again.', id: Date.now() + 1, isError: true }])
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
    retry,
    conversation,
    askFollowUp,
    followUpLoading,
  }
}
