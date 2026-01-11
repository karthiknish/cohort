'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { subDays, startOfDay, endOfDay } from 'date-fns'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { getPreviewAdsMetrics } from '@/lib/preview-data'
import { adsMetricsApi } from '@/lib/convex-api'

import type { MetricRecord, ProviderSummary } from '../components/types'
import type { MetricsSummary } from '../components/types'
import type { DateRange } from '../components/date-range-picker'
import {
  METRICS_PAGE_SIZE,
  getErrorMessage,
  exportMetricsToCsv,
} from '../components/utils'
import { DEFAULT_DATE_RANGE_DAYS, ERROR_MESSAGES } from '../components/constants'

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
  hasMetricData: boolean
  
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
  const { toast } = useToast()

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
  
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: startOfDay(subDays(new Date(), DEFAULT_DATE_RANGE_DAYS - 1)),
    end: endOfDay(new Date()),
  }))

  // Derived state
  const hasMetricData = metrics.length > 0
  const initialMetricsLoading = metricsLoading && !hasMetricData

  // Combine internal and external refresh triggers
  const refreshTick = internalRefreshTick + externalRefreshTick

  // Process and filter metrics based on date range
  const processedMetrics = useMemo(() => {
    const uniqueMap = new Map<string, MetricRecord>()
    metrics.forEach((m) => {
      // Include accountId in the key to properly handle multiple accounts per provider
      const accountId = m.accountId ?? ''
      const key = `${m.providerId}|${accountId}|${m.date}`
      const existing = uniqueMap.get(key)
      if (!existing || (m.createdAt && existing.createdAt && m.createdAt > existing.createdAt)) {
        uniqueMap.set(key, m)
      } else if (!existing?.createdAt && m.createdAt) {
        uniqueMap.set(key, m)
      } else if (!existing && !m.createdAt) {
        uniqueMap.set(key, m)
      }
    })
    return Array.from(uniqueMap.values())
      .filter((m) => {
        const d = new Date(m.date)
        if (Number.isNaN(d.getTime())) return false
        return d >= dateRange.start && d <= dateRange.end
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [metrics, dateRange])

  // Calculate per-provider summaries
  // Use server-side summary as primary if available for the specific date range, 
  // otherwise fallback to client-side calculation from loaded metrics.
  const providerSummaries = useMemo(() => {
    if (serverSideSummary?.providers && metrics.length <= METRICS_PAGE_SIZE) {
      return serverSideSummary.providers as Record<string, ProviderSummary>
    }

    const summary: Record<string, ProviderSummary> = {}
    processedMetrics.forEach((metric) => {
      if (!summary[metric.providerId]) {
        summary[metric.providerId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }
      const s = summary[metric.providerId]
      s.spend += metric.spend
      s.impressions += metric.impressions
      s.clicks += metric.clicks
      s.conversions += metric.conversions
      s.revenue += metric.revenue ?? 0
    })
    return summary
  }, [processedMetrics, serverSideSummary, metrics.length])

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const metricsRealtime = useQuery(
    adsMetricsApi.listMetrics,
    isPreviewMode || !workspaceId || !user?.id
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
          startDate: dateRange.start.toISOString().split('T')[0],
          endDate: dateRange.end.toISOString().split('T')[0],
          limit: 1000,
        }
  ) as Array<any> | undefined

  // Compute the full metric list from Convex (or preview)
  const metricsSource = useMemo(() => {
    if (isPreviewMode) return getPreviewAdsMetrics() as MetricRecord[]
    if (!workspaceId || !user?.id) return [] as MetricRecord[]

    const rows = Array.isArray(metricsRealtime) ? metricsRealtime : []
    return rows.map((row: any) => ({
      id: `${String(row.providerId)}:${String(row.accountId ?? '')}:${String(row.date)}`,
      providerId: String(row.providerId),
      accountId: typeof row.accountId === 'string' ? row.accountId : null,
      date: String(row.date),
      spend: Number(row.spend ?? 0),
      impressions: Number(row.impressions ?? 0),
      clicks: Number(row.clicks ?? 0),
      conversions: Number(row.conversions ?? 0),
      revenue: row.revenue === null || row.revenue === undefined ? null : Number(row.revenue),
      createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
    }))
  }, [isPreviewMode, metricsRealtime, user?.id, workspaceId])

  // Keep local pagination state but page client-side.
  const isConvexLoading =
    !isPreviewMode && Boolean(workspaceId && user?.id) && metricsRealtime === undefined

  // Load/refresh local paged list from Convex/preview.
  // Important: avoid state updates during render.
  useEffect(() => {
    if (isConvexLoading) {
      setMetricsLoading(true)
      return
    }

    setMetricsLoading(false)

    // Reset pagination + derived state on any refresh trigger.
    setVisibleCount(METRICS_PAGE_SIZE)
    setMetricError(null)
    setLoadMoreError(null)
    setServerSideSummary(null)

    const firstPage = metricsSource.slice(0, METRICS_PAGE_SIZE)
    setMetrics(firstPage)
    setNextCursor(metricsSource.length > METRICS_PAGE_SIZE ? 'more' : null)
  }, [isConvexLoading, metricsSource, refreshTick])

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
      setLoadMoreError(getErrorMessage(error, ERROR_MESSAGES.LOAD_MORE_FAILED))
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
    hasMetricData,
    
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
