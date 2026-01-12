'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

type SyncGoogleAnalyticsParams = {
  periodDays: number
  clientId?: string | null
}

type SyncGoogleAnalyticsResponse = {
  written: number
  propertyName?: string
  error?: string
}

async function syncGoogleAnalytics(params: SyncGoogleAnalyticsParams): Promise<SyncGoogleAnalyticsResponse> {
  const searchParams = new URLSearchParams({ days: String(params.periodDays) })
  if (params.clientId) {
    searchParams.set('clientId', params.clientId)
  }
  
  const url = `/api/analytics/google-analytics/sync?${searchParams.toString()}`
  
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
  })
  
  const payload = await response.json().catch(() => ({})) as SyncGoogleAnalyticsResponse
  
  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : 'Failed to sync Google Analytics'
    throw new Error(message)
  }
  
  return payload
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
