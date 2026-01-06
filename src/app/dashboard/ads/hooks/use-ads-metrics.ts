'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { subDays, startOfDay, endOfDay } from 'date-fns'

import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { getPreviewAdsMetrics } from '@/lib/preview-data'

import type { MetricRecord, ProviderSummary } from '../components/types'
import type { DateRange } from '../components/date-range-picker'
import {
  METRICS_PAGE_SIZE,
  fetchMetrics,
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
  serverSideSummary: any
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
  
  const { user, getIdToken } = useAuth()
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
  
  const [serverSideSummary, setServerSideSummary] = useState<any>(null)
  
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
      const key = `${m.providerId}|${m.date}`
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

  // Load metrics data
  useEffect(() => {
    // In preview mode, use preview data
    if (isPreviewMode) {
      const previewMetrics = getPreviewAdsMetrics()
      setMetrics(previewMetrics as MetricRecord[])
      setMetricsLoading(false)
      setMetricError(null)
      setNextCursor(null)
      setServerSideSummary(null)
      return
    }

    if (!user?.id) {
      setMetrics([])
      setMetricsLoading(false)
      setNextCursor(null)
      setLoadMoreError(null)
      setServerSideSummary(null)
      return
    }

    let isSubscribed = true

    const loadData = async () => {
      if (isSubscribed) {
        setMetricsLoading(true)
        setMetricError(null)
        setLoadMoreError(null)
        setNextCursor(null)
      }
      try {
        const token = await getIdToken()
        const metricResponse = await fetchMetrics(token, { 
          userId: user.id, 
          pageSize: METRICS_PAGE_SIZE,
          startDate: dateRange.start.toISOString().split('T')[0],
          endDate: dateRange.end.toISOString().split('T')[0],
          aggregate: true,
        })
        if (isSubscribed) {
          setMetrics(metricResponse.metrics)
          setNextCursor(metricResponse.nextCursor)
          setServerSideSummary(metricResponse.summary || null)
          setLoadMoreError(null)
        }
      } catch (error: unknown) {
        if (isSubscribed) {
          setMetricError(getErrorMessage(error, ERROR_MESSAGES.LOAD_METRICS_FAILED))
          setNextCursor(null)
          setMetrics([])
          setServerSideSummary(null)
        }
      } finally {
        if (isSubscribed) setMetricsLoading(false)
      }
    }

    void loadData()
    return () => { isSubscribed = false }
  }, [user?.id, refreshTick, getIdToken, isPreviewMode, dateRange.start.toISOString(), dateRange.end.toISOString()])

  // Handlers
  const handleManualRefresh = useCallback(() => {
    if (metricsLoading) return
    setMetrics([])
    setNextCursor(null)
    setLoadMoreError(null)
    setMetricError(null)
    setServerSideSummary(null)
    setInternalRefreshTick((tick) => tick + 1)
  }, [metricsLoading])

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || metricsLoading || !user?.id) return
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const token = await getIdToken()
      const response = await fetchMetrics(token, { 
        userId: user.id, 
        cursor: nextCursor, 
        pageSize: METRICS_PAGE_SIZE,
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
      })
      setMetrics((prev) => [...prev, ...response.metrics])
      setNextCursor(response.nextCursor)
    } catch (error: unknown) {
      setLoadMoreError(getErrorMessage(error, ERROR_MESSAGES.LOAD_MORE_FAILED))
    } finally {
      setLoadingMore(false)
    }
  }, [getIdToken, loadingMore, metricsLoading, nextCursor, user?.id, dateRange.start, dateRange.end])

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
