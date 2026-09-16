import { useAuth } from './useAuth'
import { useSubscription } from './useSubscription'
import { getUsageToday, incrementUsageToday } from '../utils/helpers'
import { FREE_DAILY_GENERATION_LIMIT } from '../utils/constants'

/**
 * The single gate every AI-generation call site (useTopic, Practice,
 * Interview) checks before calling aiService — so the free-tier daily limit
 * is enforced consistently everywhere generation happens, not just on the
 * main Learn page. Pro users always pass.
 */
export function useGenerationGate() {
  const { user } = useAuth()
  const { isPro, loading: subLoading } = useSubscription()

  const used = getUsageToday(user?.id)
  const remaining = isPro ? Infinity : Math.max(0, FREE_DAILY_GENERATION_LIMIT - used)

  function canGenerate() {
    return isPro || used < FREE_DAILY_GENERATION_LIMIT
  }

  function recordGeneration() {
    if (!isPro) incrementUsageToday(user?.id)
  }

  return {
    isPro,
    isSignedIn: Boolean(user),
    subLoading,
    canGenerate,
    recordGeneration,
    remaining,
    limit: FREE_DAILY_GENERATION_LIMIT,
  }
}
