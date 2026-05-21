'use client'

import { useAction, useConvexAuth, useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { analyticsInsightsApi, analyticsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewAnalyticsMetrics, getPreviewAnalyticsInsights } from '@/lib/preview-data'
import { buildProviderIdsKey, normalizeProviderIds } from '../lib/insight-utils'
import type { AlgorithmicInsight, MetricRecord, ProviderInsight } from './types'

export type AnalyticsBreakdownRow = {
  propertyId: string
  date: string
  dimension: 'channel' | 'source' | 'device'
  dimensionValue: string
  users: number
  sessions: number
  conversions: number
  revenue: number | null
}

export interface UseAnalyticsDataReturn {
  metricsData: MetricRecord[]
  breakdowns: AnalyticsBreakdownRow[]
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

function isGoogleAnalyticsOnly(providerIds: string[]) {
  return providerIds.length === 1 && providerIds[0] === 'google-analytics'
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
  const providerIds = useMemo(
    () => normalizeProviderIds(providerIdsKey ? providerIdsKey.split('|') : undefined) ?? [],
    [providerIdsKey],
  )
  const gaOnly = isGoogleAnalyticsOnly(providerIds)

  const [insights, setInsights] = useState<ProviderInsight[]>([])
  const [algorithmic, setAlgorithmic] = useState<AlgorithmicInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsRefreshing, setInsightsRefreshing] = useState(false)
  const [insightsError, setInsightsError] = useState<Error | undefined>(undefined)
  const hasFetchedInsightsRef = useRef(false)

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

  const gaMetricsRealtime = useQuery(
    analyticsIntegrationsApi.listAnalyticsMetrics,
    gaOnly && !isPreviewMode && workspaceId && canQueryConvex
      ? {
          workspaceId,
          clientId: clientId ?? null,
          limit: 500,
        }
      : 'skip'
  )

  const generateInsights = useAction(analyticsInsightsApi.generateInsights)

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

  useEffect(() => {
    if (!isPreviewMode && workspaceId && includeInsights) {
      void fetchInsights()
    }
  }, [fetchInsights, includeInsights, isPreviewMode, workspaceId])

  const loadMoreMetrics = useCallback(async () => {
    // Pagination is not supported in the Convex query
  }, [])

  const mutateInsights = useCallback(async () => {
    await fetchInsights()
  }, [fetchInsights])

  const mappedMetrics = useMemo(() => {
    if (isPreviewMode) {
      return (previewMetrics ?? []).map((row) => {
        const record = row as unknown as Record<string, unknown>
        return {
          ...(row as MetricRecord),
          currency: typeof record.currency === 'string' ? record.currency : null,
        } satisfies MetricRecord
      })
    }

    const rows = gaMetricsRealtime?.metrics ?? []
    return rows.map((row: (typeof rows)[number]) => ({
      id: row.id,
      providerId: row.providerId,
      date: row.date,
      currency: row.currency,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
    })) satisfies MetricRecord[]
  }, [gaMetricsRealtime?.metrics, isPreviewMode, previewMetrics])

  const breakdowns = useMemo((): AnalyticsBreakdownRow[] => {
    if (isPreviewMode || !gaMetricsRealtime?.breakdowns) return []
    return gaMetricsRealtime.breakdowns.map((row: (typeof gaMetricsRealtime.breakdowns)[number]) => ({
      ...row,
      revenue: row.revenue ?? null,
    }))
  }, [gaMetricsRealtime?.breakdowns, isPreviewMode])

  if (isPreviewMode && previewMetrics && previewInsights) {
    return {
      metricsData: mappedMetrics,
      breakdowns: [],
      metricsNextCursor: null,
      metricsLoadingMore: false,
      loadMoreMetrics: async () => {},
      metricsError: undefined,
      metricsLoading: false,
      metricsRefreshing: false,
      mutateMetrics: async () => undefined,
      insights: (previewInsights.insights as ProviderInsight[]).filter((entry) => matchesProvider(entry.providerId, providerIds)),
      algorithmic: (previewInsights.algorithmic as AlgorithmicInsight[]).filter(
        (entry) => matchesProvider(entry.providerId, providerIds) || entry.providerId === 'global'
      ),
      insightsError: undefined,
      insightsLoading: false,
      insightsRefreshing: false,
      mutateInsights: async () => undefined,
    }
  }

  const metricsLoading = gaMetricsRealtime === undefined && !isPreviewMode && !!workspaceId && canQueryConvex && gaOnly

  return {
    metricsData: mappedMetrics,
    breakdowns,
    metricsNextCursor: null,
    metricsLoadingMore: false,
    loadMoreMetrics,
    metricsError: undefined,
    metricsLoading,
    metricsRefreshing: false,
    mutateMetrics: async () => undefined,
    insights,
    algorithmic,
    insightsError,
    insightsLoading,
    insightsRefreshing,
    mutateInsights,
  }
}
