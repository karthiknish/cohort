'use client'

import useSWR from 'swr'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getPreviewAnalyticsMetrics, getPreviewAnalyticsInsights } from '@/lib/preview-data'
import type { MetricRecord, MetricsResponse, ProviderInsight, AlgorithmicInsight } from './types'

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to load analytics data')
  }
  return response.json()
}

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
  isPreviewMode: boolean
): UseAnalyticsDataReturn {
  // If in preview mode, return preview data immediately
  const previewMetrics = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsMetrics() as MetricRecord[]
  }, [isPreviewMode, clientId])
  
  const previewInsights = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsInsights()
  }, [isPreviewMode])

  const shouldFetch = Boolean(token) && !isPreviewMode
  const metricsUrl = clientId ? `/api/metrics?clientId=${encodeURIComponent(clientId)}` : '/api/metrics'
  const metricsKey: [string, string] | null = shouldFetch && token ? [metricsUrl, token] : null

  const [metricsList, setMetricsList] = useState<MetricRecord[]>([])
  const [metricsCursor, setMetricsCursor] = useState<string | null>(null)
  const [metricsLoadingMore, setMetricsLoadingMore] = useState(false)

  const insightsParams = new URLSearchParams({ periodDays: String(periodDays) })
  if (clientId) {
    insightsParams.set('clientId', clientId)
  }
  const insightsUrl = `/api/analytics/insights?${insightsParams.toString()}`
  const insightsKey: [string, string] | null = shouldFetch && token ? [insightsUrl, token] : null

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateMetrics,
  } = useSWR(metricsKey, ([url, jwt]) => fetcher(url, jwt))

  const {
    data: insightsData,
    error: insightsError,
    isLoading: insightsLoading,
    isValidating: insightsValidating,
    mutate: mutateInsights,
  } = useSWR(
    insightsKey,
    ([url, jwt]) => fetcher(url, jwt)
  )

  useEffect(() => {
    if (isPreviewMode) return
    setMetricsList([])
    setMetricsCursor(null)
  }, [metricsUrl, isPreviewMode])

  useEffect(() => {
    if (isPreviewMode) return
    if (!data) {
      return
    }

    const payload = data as MetricsResponse
    const entries = Array.isArray(payload.metrics) ? payload.metrics : []
    setMetricsList(entries)
    setMetricsCursor(typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null)
  }, [data, isPreviewMode])

  const loadMoreMetrics = useCallback(async () => {
    if (isPreviewMode || !token || !metricsCursor) {
      return
    }

    setMetricsLoadingMore(true)
    try {
      const separator = metricsUrl.includes('?') ? '&' : '?'
      const url = `${metricsUrl}${separator}after=${encodeURIComponent(metricsCursor)}`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        const message = payload?.error ?? 'Unable to load additional metrics'
        throw new Error(message)
      }

      const payload = (await response.json()) as MetricsResponse
      const entries = Array.isArray(payload.metrics) ? payload.metrics : []
      if (entries.length > 0) {
        setMetricsList((prev) => [...prev, ...entries])
      }
      setMetricsCursor(typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null)
    } finally {
      setMetricsLoadingMore(false)
    }
  }, [metricsCursor, metricsUrl, token, isPreviewMode])

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

  return {
    metricsData: metricsList,
    metricsNextCursor: metricsCursor,
    metricsLoadingMore,
    loadMoreMetrics,
    metricsError: error as Error | undefined,
    metricsLoading: isLoading,
    metricsRefreshing: isValidating,
    mutateMetrics: async () => mutateMetrics(),
    insights: (insightsData as { insights: ProviderInsight[] } | undefined)?.insights ?? [],
    algorithmic: (insightsData as { algorithmic: AlgorithmicInsight[] } | undefined)?.algorithmic ?? [],
    insightsError: insightsError as Error | undefined,
    insightsLoading,
    insightsRefreshing: insightsValidating,
    mutateInsights: async () => mutateInsights(),
  }
}
