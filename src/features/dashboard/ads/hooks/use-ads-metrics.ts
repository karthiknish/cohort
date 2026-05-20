'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { endOfDay, startOfDay, subDays } from 'date-fns'

import { api } from '/_generated/api'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { asErrorMessage, extractErrorCode, logError } from '@/lib/convex-errors'
import { getPreviewAdsMetrics } from '@/lib/preview-data'

import { DEFAULT_DATE_RANGE_DAYS, ERROR_MESSAGES } from '../components/constants'
import type { DateRange } from '../components/date-range-picker'
import type { MetricRecord, MetricsSummary, ProviderSummary, AdsInsightsSummary } from '../components/types'
import { exportMetricsToCsv, METRICS_PAGE_SIZE } from '../components/utils'

import {
  buildProviderSummariesFromServer,
  dedupeAndFilterMetrics,
  hasAdsMetricActivity,
  isAdsProviderId,
  mapRealtimeMetricRow,
  metricsSummaryFromV2Insights,
  type RealtimeMetricRow,
} from './use-ads-metrics.helpers'

function isAuthError(error: unknown): boolean {
  const code = extractErrorCode(error)
  return code === 'UNAUTHORIZED' || code === 'FORBIDDEN'
}

// =============================================================================
// TYPES
// =============================================================================

export interface UseAdsMetricsOptions {
  /** External trigger to refresh data (increment to trigger) */
  refreshTick?: number
}

export interface UseAdsMetricsReturn {
  // Data
  metrics: MetricRecord[]
  processedMetrics: MetricRecord[]
  providerSummaries: Record<string, ProviderSummary>
  serverSideSummary: MetricsSummary | null
  /** V1 summary merged with V2 insights when legacy summary is absent. */
  effectiveServerSummary: MetricsSummary | null
  /** V2 currency-aware insights summary. Use this for financial display. */
  adsInsightsSummary: AdsInsightsSummary | null
  hasMetricData: boolean
  /** Full filtered metric rows for charts (not the paged table slice). */
  chartMetrics: MetricRecord[]
  
  // Loading states
  metricsLoading: boolean
  initialMetricsLoading: boolean
  loadingMore: boolean
  
  // Error states
  metricError: string | null
  loadMoreError: string | null
  
  // Pagination
  nextCursor: string | null
  
  // Filters
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  
  // Actions
  handleManualRefresh: () => void
  handleLoadMore: () => Promise<void>
  handleExport: () => void
  
  // Trigger for external refresh
  triggerRefresh: () => void
}

// =============================================================================
// HOOK
// =============================================================================

export function useAdsMetrics(options: UseAdsMetricsOptions = {}): UseAdsMetricsReturn {
  const { refreshTick: externalRefreshTick = 0 } = options
  
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  // State
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricError, setMetricError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [internalRefreshTick, setInternalRefreshTick] = useState(0)
  const [visibleCount, setVisibleCount] = useState(METRICS_PAGE_SIZE)
  
  const [serverSideSummary, setServerSideSummary] = useState<MetricsSummary | null>(null)
  const [adsInsightsSummary, setAdsInsightsSummary] = useState<AdsInsightsSummary | null>(null)
  
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: startOfDay(subDays(new Date(), DEFAULT_DATE_RANGE_DAYS - 1)),
    end: endOfDay(new Date()),
  }))

  // Combine internal and external refresh triggers
  const refreshTick = internalRefreshTick + externalRefreshTick

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id)

  // Note: `useQuery` will throw for hard errors (like Unauthorized).
  // Waiting for `useConvexAuth` readiness prevents most of these.
  useEffect(() => {
    if (isPreviewMode) return
    if (!workspaceId) return
    if (canQueryConvex) return

    // Keep initial auth boot silent, but if we previously surfaced an error,
    // swap it to a session-expired message.
    setMetricError((prev) => (prev ? ERROR_MESSAGES.SIGN_IN_REQUIRED : prev))
  }, [canQueryConvex, isPreviewMode, workspaceId])

  const metricsRealtime = useQuery(
    api.adsMetrics.listMetricsWithSummary,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
          startDate: dateRange.start.toISOString().split('T')[0],
          endDate: dateRange.end.toISOString().split('T')[0],
          limit: 1000,
          aggregate: true,
        }
  )

  const metricsRealtimeV2 = useQuery(
    api.adsMetrics.listMetricsWithSummaryV2,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
          startDate: dateRange.start.toISOString().split('T')[0],
          endDate: dateRange.end.toISOString().split('T')[0],
          limit: 1000,
          aggregate: true,
        }
  )

  // Compute the full metric list from Convex (or preview)
  const metricsSource = useMemo(() => {
    if (isPreviewMode) return getPreviewAdsMetrics() as MetricRecord[]
    if (!workspaceId || !canQueryConvex) return [] as MetricRecord[]

    // Prefer V2 rows (carry surfaceId, currencySource); fall back to V1 if V2 not yet available.
    const v2Rows = Array.isArray(metricsRealtimeV2?.metrics) ? metricsRealtimeV2.metrics : null
    const v1Rows = Array.isArray(metricsRealtime?.metrics) ? metricsRealtime.metrics : []
    const rows = (v2Rows ?? v1Rows) as RealtimeMetricRow[]
    return rows.filter((row: RealtimeMetricRow) => isAdsProviderId(row.providerId)).map((row: RealtimeMetricRow) => mapRealtimeMetricRow(row))
  }, [isPreviewMode, metricsRealtime, metricsRealtimeV2, canQueryConvex, workspaceId])

  const processedMetrics = useMemo(
    () => dedupeAndFilterMetrics(metricsSource, dateRange),
    [dateRange, metricsSource],
  )

  const effectiveServerSummary = useMemo(
    () => serverSideSummary ?? metricsSummaryFromV2Insights(adsInsightsSummary),
    [adsInsightsSummary, serverSideSummary],
  )

  const hasMetricData = useMemo(
    () => hasAdsMetricActivity(processedMetrics, effectiveServerSummary, adsInsightsSummary),
    [adsInsightsSummary, effectiveServerSummary, processedMetrics],
  )
  const initialMetricsLoading = metricsLoading && !hasMetricData

  const providerSummaries = useMemo(() => {
    if (effectiveServerSummary?.providers && metricsSource.length <= METRICS_PAGE_SIZE) {
      return buildProviderSummariesFromServer(effectiveServerSummary.providers)
    }

    const summary: Record<string, ProviderSummary> = {}
    processedMetrics.forEach((metric) => {
      const providerSummary = summary[metric.providerId] ?? {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      }
      providerSummary.spend += metric.spend
      providerSummary.impressions += metric.impressions
      providerSummary.clicks += metric.clicks
      providerSummary.conversions += metric.conversions
      providerSummary.revenue += metric.revenue ?? 0
      summary[metric.providerId] = providerSummary
    })
    return summary
  }, [effectiveServerSummary, metricsSource.length, processedMetrics])

  const isConvexLoading =
    !isPreviewMode && Boolean(workspaceId && canQueryConvex) && metricsRealtime === undefined

  useEffect(() => {
    const resetRequested = refreshTick > 0
    setVisibleCount(METRICS_PAGE_SIZE)
    if (resetRequested) {
      setMetricError(null)
      setLoadMoreError(null)
    }
  }, [refreshTick])

  // Load/refresh local paged list from Convex/preview.
  // Important: avoid state updates during render.
  useEffect(() => {
    // If auth isn't ready, don't show misleading loading/errors.
    if (!isPreviewMode && workspaceId && !canQueryConvex) {
      setMetricsLoading(false)
      setMetricError(null)
      setLoadMoreError(null)
      setMetrics([])
      setNextCursor(null)
      setServerSideSummary(null)
      setAdsInsightsSummary(null)
      return
    }

    if (isConvexLoading) {
      setMetricsLoading(true)
      return
    }

    setMetricsLoading(false)

    // Populate server-side aggregated summary when available.
    const summary = !isPreviewMode && metricsRealtime?.summary ? metricsRealtime.summary : null
    setServerSideSummary(summary)

    // Populate V2 currency-aware insights summary.
    const v2Summary = !isPreviewMode && metricsRealtimeV2?.summary ? metricsRealtimeV2.summary : null
    setAdsInsightsSummary(v2Summary as AdsInsightsSummary | null)

    const firstPage = metricsSource.slice(0, METRICS_PAGE_SIZE)
    setMetrics(firstPage)
    setNextCursor(metricsSource.length > METRICS_PAGE_SIZE ? 'more' : null)
  }, [canQueryConvex, isConvexLoading, isPreviewMode, metricsRealtime, metricsRealtimeV2, metricsSource, workspaceId])

  // Keep nextCursor in sync with current visible count.
  useEffect(() => {
    if (isConvexLoading) return
    setNextCursor(metricsSource.length > visibleCount ? 'more' : null)
  }, [isConvexLoading, metricsSource.length, visibleCount])

  // Handlers
  const handleManualRefresh = useCallback(() => {
    if (metricsLoading) return
    setInternalRefreshTick((tick) => tick + 1)
  }, [metricsLoading])

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || metricsLoading) return

    setLoadingMore(true)
    setLoadMoreError(null)

    try {
      const nextCount = visibleCount + METRICS_PAGE_SIZE
      setVisibleCount(nextCount)
      setMetrics(metricsSource.slice(0, nextCount))
    } catch (error: unknown) {
      logError(error, 'useAdsMetrics:handleLoadMore')
      const message = isAuthError(error)
        ? ERROR_MESSAGES.SIGN_IN_REQUIRED
        : asErrorMessage(error)
      setLoadMoreError(message)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, metricsLoading, metricsSource, nextCursor, visibleCount])

  const handleExport = useCallback(() => {
    exportMetricsToCsv(processedMetrics)
  }, [processedMetrics])

  const triggerRefresh = useCallback(() => {
    setInternalRefreshTick((tick) => tick + 1)
  }, [])

  return {
    // Data
    metrics,
    processedMetrics,
    providerSummaries,
    serverSideSummary,
    effectiveServerSummary,
    adsInsightsSummary,
    hasMetricData,
    chartMetrics: processedMetrics,
    
    // Loading states
    metricsLoading,
    initialMetricsLoading,
    loadingMore,
    
    // Error states
    metricError,
    loadMoreError,
    
    // Pagination
    nextCursor,
    
    // Filters
    dateRange,
    setDateRange,
    
    // Actions
    handleManualRefresh,
    handleLoadMore,
    handleExport,
    triggerRefresh,
  }
}
