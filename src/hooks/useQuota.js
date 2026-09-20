import { useSyncExternalStore } from 'react'
import { getQuotaState, subscribeQuota } from '../services/quotaStore'

/** Latest server-reported AI quota: { generate, chat, signedIn } (each may be null). */
export function useQuota() {
  return useSyncExternalStore(subscribeQuota, getQuotaState, getQuotaState)
}
