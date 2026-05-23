'use client'

import type { MetricRecord } from './types'

export const ANALYTICS_METRICS_PAGE_SIZE = 100

export type AnalyticsMetricsPageCursor = {
  fieldValue: string
  legacyId: string
}

export type PaginatedAnalyticsMetricsResult = {
  metrics: MetricRecord[]
  breakdowns: Array<{
    propertyId: string
    date: string
    dimension: 'channel' | 'source' | 'device'
    dimensionValue: string
    users: number
    sessions: number
    conversions: number
    revenue: number | null
  }>
  nextCursor: AnalyticsMetricsPageCursor | null
}

export function mergeAnalyticsMetricPages(
  firstPage: MetricRecord[],
  olderPages: MetricRecord[],
): MetricRecord[] {
  const byId = new Map<string, MetricRecord>()
  for (const metric of firstPage) {
    byId.set(metric.id, metric)
  }
  for (const metric of olderPages) {
    if (!byId.has(metric.id)) {
      byId.set(metric.id, metric)
    }
  }
  return Array.from(byId.values()).sort((left, right) =>
    left.date < right.date ? 1 : left.date > right.date ? -1 : 0,
  )
}

export function parsePaginatedAnalyticsMetrics(value: unknown): PaginatedAnalyticsMetricsResult | null {
  if (!value || typeof value !== 'object') return null
  const metrics = (value as { metrics?: unknown }).metrics
  const breakdowns = (value as { breakdowns?: unknown }).breakdowns
  if (!Array.isArray(metrics)) return null

  const nextCursor = (value as { nextCursor?: unknown }).nextCursor
  const parsedCursor =
    nextCursor &&
    typeof nextCursor === 'object' &&
    typeof (nextCursor as AnalyticsMetricsPageCursor).fieldValue === 'string' &&
    typeof (nextCursor as AnalyticsMetricsPageCursor).legacyId === 'string'
      ? (nextCursor as AnalyticsMetricsPageCursor)
      : null

  return {
    metrics: metrics as MetricRecord[],
    breakdowns: Array.isArray(breakdowns)
      ? (breakdowns as PaginatedAnalyticsMetricsResult['breakdowns'])
      : [],
    nextCursor: parsedCursor,
  }
}
