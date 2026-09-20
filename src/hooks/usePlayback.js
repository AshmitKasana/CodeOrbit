import { useCallback, useEffect, useState } from 'react'

/**
 * Maps a 1–10 speed setting to a timer interval and how many steps to advance
 * per tick. Slow speeds tick every few hundred ms; the fastest ones cap the
 * timer at ~60fps and advance several steps per tick so big arrays stay watchable.
 */
export function playbackRate(speed) {
  const s = Math.min(10, Math.max(1, Math.round(speed)))
  const idealMs = 600 * 0.6 ** (s - 1) // 600ms at speed 1 → ~13ms at speed 10
  const intervalMs = Math.max(16, Math.round(idealMs))
  const stepsPerTick = Math.max(1, Math.round(16 / idealMs))
  return { intervalMs, stepsPerTick }
}

/**
 * Timeline playback over `length` steps. `resetKey` restarts from step 0
 * (pass something that changes when the steps are regenerated).
 */
export function usePlayback(length, { speed = 5, resetKey } = {}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = Math.max(0, length - 1)
  const { intervalMs, stepsPerTick } = playbackRate(speed)

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [resetKey])

  useEffect(() => {
    if (!playing) return undefined
    const id = setInterval(() => {
      setIndex((i) => {
        const next = Math.min(last, i + stepsPerTick)
        if (next >= last) setPlaying(false)
        return next
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [playing, last, intervalMs, stepsPerTick])

  const play = useCallback(() => {
    setIndex((i) => (i >= last ? 0 : i))
    setPlaying(true)
  }, [last])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause])
  const next = useCallback(() => {
    setPlaying(false)
    setIndex((i) => Math.min(last, i + 1))
  }, [last])
  const prev = useCallback(() => {
    setPlaying(false)
    setIndex((i) => Math.max(0, i - 1))
  }, [])
  const restart = useCallback(() => {
    setPlaying(false)
    setIndex(0)
  }, [])
  const seek = useCallback(
    (i) => {
      setPlaying(false)
      setIndex(Math.min(last, Math.max(0, i)))
    },
    [last]
  )

  return { index: Math.min(index, last), playing, atEnd: index >= last, play, pause, toggle, next, prev, restart, seek }
}
