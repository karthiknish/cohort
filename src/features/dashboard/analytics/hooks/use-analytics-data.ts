'use client'

import { useAction, useConvexAuth, useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { adsMetricsApi, analyticsInsightsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewAnalyticsMetrics, getPreviewAnalyticsInsights } from '@/lib/preview-data'
import { buildProviderIdsKey, normalizeProviderIds } from '../lib/insight-utils'
import type { AlgorithmicInsight, MetricRecord, ProviderInsight } from './types'

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

type UseAnalyticsDataOptions = {
  providerIds?: string[]
  includeInsights?: boolean
}

function matchesProvider(providerId: string, providerIds?: string[]) {
  if (!providerIds || providerIds.length === 0) return true
  return providerIds.includes(providerId)
}

export function useAnalyticsData(
  _token: string | null,
  periodDays: number,
  clientId: string | null,
  isPreviewMode: boolean,
  workspaceId?: string | null,
  options?: UseAnalyticsDataOptions
): UseAnalyticsDataReturn {
  const includeInsights = options?.includeInsights ?? true
  const providerIdsKey = buildProviderIdsKey(options?.providerIds)
  const providerIds = useMemo(() => normalizeProviderIds(providerIdsKey ? providerIdsKey.split('|') : undefined), [providerIdsKey])

  // State for insights from Convex action
  const [insights, setInsights] = useState<ProviderInsight[]>([])
  const [algorithmic, setAlgorithmic] = useState<AlgorithmicInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsRefreshing, setInsightsRefreshing] = useState(false)
  const [insightsError, setInsightsError] = useState<Error | undefined>(undefined)
  const hasFetchedInsightsRef = useRef(false)

  // If in preview mode, return preview data immediately
  const previewMetrics = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsMetrics() as MetricRecord[]
  }, [isPreviewMode])
  
  const previewInsights = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsInsights()
  }, [isPreviewMode])

  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const canQueryConvex = isConvexAuthenticated && !isConvexLoading

  // Metrics are now fetched directly from Convex
  const metricsRealtime = useQuery(
    adsMetricsApi.listMetricsWithSummary,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: clientId ?? null,
          providerIds,
          limit: 500,
        }
  ) as { metrics: MetricRecord[] } | undefined

  const metricsLoadingMore = false

  // Convex action for generating insights
  const generateInsights = useAction(analyticsInsightsApi.generateInsights)

  // Function to fetch insights
  const fetchInsights = useCallback(async () => {
    if (isPreviewMode || !workspaceId || !includeInsights) return

    const isInitialLoad = !hasFetchedInsightsRef.current
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
        providerIds,
      })
      setInsights(result.insights as ProviderInsight[])
      setAlgorithmic(result.algorithmic as AlgorithmicInsight[])
      hasFetchedInsightsRef.current = true
    } catch (error) {
      logError(error, 'useAnalyticsData:fetchInsights')
      setInsightsError(error instanceof Error ? error : new Error(asErrorMessage(error)))
    } finally {
      setInsightsLoading(false)
      setInsightsRefreshing(false)
    }
  }, [clientId, generateInsights, includeInsights, isPreviewMode, periodDays, providerIds, workspaceId])

  // Fetch insights on mount and when dependencies change
  useEffect(() => {
    if (!isPreviewMode && workspaceId && includeInsights) {
      void fetchInsights()
    }
  }, [fetchInsights, includeInsights, isPreviewMode, workspaceId])

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
      insights: (previewInsights.insights as ProviderInsight[]).filter((entry) => matchesProvider(entry.providerId, providerIds)),
      algorithmic: (previewInsights.algorithmic as AlgorithmicInsight[]).filter((entry) => matchesProvider(entry.providerId, providerIds) || entry.providerId === 'global'),
      insightsError: undefined,
      insightsLoading: false,
      insightsRefreshing: false,
      mutateInsights: async () => undefined,
    }
  }

  const metricsLoading = metricsRealtime === undefined && !isPreviewMode && !!workspaceId && canQueryConvex

  return {
    metricsData: metricsRealtime?.metrics ?? [],
    metricsNextCursor: null, // Convex doesn't use cursor pagination
    metricsLoadingMore,
    loadMoreMetrics,
    metricsError: undefined,
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
