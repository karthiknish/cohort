'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useAction } from 'convex/react'

import { getPreviewAnalyticsMetrics, getPreviewAnalyticsInsights } from '@/lib/preview-data'
import { onDashboardRefresh } from '@/lib/refresh-bus'
import { adsMetricsApi, analyticsInsightsApi } from '@/lib/convex-api'
import type { MetricRecord, ProviderInsight, AlgorithmicInsight } from './types'

export interface UseAnalyticsDataReturn {
  metricsData: MetricRecord[]
  metricsNextCursor: string | null
  metricsLoadingMore: boolean
  loadMoreMetrics: () => Promise<void>
  metricsError: Error | undefined
  metricsLoading: boolean
  metricsRefreshing: boolean
  mutateMetrics: () => Promise<unknown>
  insights: ProviderInsight[]
  algorithmic: AlgorithmicInsight[]
  insightsError: Error | undefined
  insightsLoading: boolean
  insightsRefreshing: boolean
  mutateInsights: () => Promise<unknown>
}

export function useAnalyticsData(
  token: string | null, 
  periodDays: number, 
  clientId: string | null, 
  isPreviewMode: boolean,
  workspaceId?: string | null
): UseAnalyticsDataReturn {
  // State for insights from Convex action
  const [insights, setInsights] = useState<ProviderInsight[]>([])
  const [algorithmic, setAlgorithmic] = useState<AlgorithmicInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsRefreshing, setInsightsRefreshing] = useState(false)
  const [insightsError, setInsightsError] = useState<Error | undefined>(undefined)

  // If in preview mode, return preview data immediately
  const previewMetrics = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsMetrics() as MetricRecord[]
  }, [isPreviewMode, clientId])
  
  const previewInsights = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsInsights()
  }, [isPreviewMode])

  // Metrics are now fetched directly from Convex
  const metricsRealtime = useQuery(
    adsMetricsApi.listMetricsWithSummary,
    isPreviewMode || !workspaceId
      ? 'skip'
      : {
          workspaceId,
          clientId: clientId ?? null,
          limit: 500,
        }
  ) as { metrics: MetricRecord[] } | undefined

  const [metricsLoadingMore, setMetricsLoadingMore] = useState(false)

  // Convex action for generating insights
  const generateInsights = useAction(analyticsInsightsApi.generateInsights)

  // Function to fetch insights
  const fetchInsights = useCallback(async () => {
    if (isPreviewMode || !workspaceId) return

    const isInitialLoad = insights.length === 0 && algorithmic.length === 0
    if (isInitialLoad) {
      setInsightsLoading(true)
    } else {
      setInsightsRefreshing(true)
    }
    setInsightsError(undefined)

    try {
      const result = await generateInsights({
        workspaceId,
        clientId: clientId ?? undefined,
        periodDays,
      })
      setInsights(result.insights as ProviderInsight[])
      setAlgorithmic(result.algorithmic as AlgorithmicInsight[])
    } catch (error) {
      console.error('[useAnalyticsData] Failed to generate insights:', error)
      setInsightsError(error instanceof Error ? error : new Error('Failed to generate insights'))
    } finally {
      setInsightsLoading(false)
      setInsightsRefreshing(false)
    }
  }, [isPreviewMode, workspaceId, clientId, periodDays, generateInsights, insights.length, algorithmic.length])

  // Fetch insights on mount and when dependencies change
  useEffect(() => {
    if (!isPreviewMode && workspaceId) {
      fetchInsights()
    }
  }, [isPreviewMode, workspaceId, clientId, periodDays]) // Don't include fetchInsights to avoid infinite loop

  // Global refresh integration: when the dashboard refresh button is used, or when
  // tasks/projects mutate elsewhere, revalidate Analytics data automatically.
  useEffect(() => {
    if (isPreviewMode) return
    const unsubscribe = onDashboardRefresh(() => {
      // Convex queries auto-refresh, but insights need to be refetched
      void fetchInsights()
    })
    return unsubscribe
  }, [isPreviewMode, fetchInsights])

  // Pagination is no longer needed since Convex returns all metrics up to limit
  // The loadMoreMetrics function is kept for API compatibility but is now a no-op
  const loadMoreMetrics = useCallback(async () => {
    // Pagination is not supported in the Convex query
    // Data is fetched in full up to the limit
  }, [])

  // Mutate insights function
  const mutateInsights = useCallback(async () => {
    await fetchInsights()
  }, [fetchInsights])

  // Return preview data if in preview mode
  if (isPreviewMode && previewMetrics && previewInsights) {
    return {
      metricsData: previewMetrics,
      metricsNextCursor: null,
      metricsLoadingMore: false,
      loadMoreMetrics: async () => {},
      metricsError: undefined,
      metricsLoading: false,
      metricsRefreshing: false,
      mutateMetrics: async () => undefined,
      insights: previewInsights.insights as ProviderInsight[],
      algorithmic: previewInsights.algorithmic as AlgorithmicInsight[],
      insightsError: undefined,
      insightsLoading: false,
      insightsRefreshing: false,
      mutateInsights: async () => undefined,
    }
  }

  const metricsLoading = metricsRealtime === undefined && !isPreviewMode && !!workspaceId

  return {
    metricsData: metricsRealtime?.metrics ?? [],
    metricsNextCursor: null, // Convex doesn't use cursor pagination
    metricsLoadingMore,
    loadMoreMetrics,
    metricsError: undefined, // Convex errors are handled differently
    metricsLoading,
    metricsRefreshing: false, // Convex handles this automatically
    mutateMetrics: async () => undefined, // Convex auto-refreshes
    insights,
    algorithmic,
    insightsError,
    insightsLoading,
    insightsRefreshing,
    mutateInsights,
  }
}
