'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'

type SyncGoogleAnalyticsParams = {
  periodDays: number
  clientId?: string | null
}

type SyncGoogleAnalyticsResponse = {
  written: number
  propertyName?: string
  error?: string
}

/** GA import can be slow; still cap client wait so UI never spins forever. */
export const GOOGLE_ANALYTICS_SYNC_CLIENT_TIMEOUT_MS = 180_000

export async function syncGoogleAnalytics(params: SyncGoogleAnalyticsParams): Promise<SyncGoogleAnalyticsResponse> {
  const searchParams = new URLSearchParams({ days: String(params.periodDays) })
  if (params.clientId) {
    searchParams.set('clientId', params.clientId)
  }
  
  const url = `/api/analytics/google-analytics/sync?${searchParams.toString()}`

  return await apiFetch<SyncGoogleAnalyticsResponse>(url, {
    method: 'POST',
    credentials: 'same-origin',
    body: JSON.stringify({}),
    timeoutMs: GOOGLE_ANALYTICS_SYNC_CLIENT_TIMEOUT_MS,
  })
}

/**
 * Hook for syncing Google Analytics data using TanStack Query mutation
 * Automatically invalidates analytics queries on success
 */
export function useGoogleAnalyticsSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: syncGoogleAnalytics,
    onSuccess: () => {
      // Invalidate analytics-related queries to refresh data
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      void queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}
