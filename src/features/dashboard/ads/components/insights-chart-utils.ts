import { aggregateMetricFinancials } from '@/domain/ads/aggregate-financials'
import { normalizeAdsProviderId } from '@/domain/ads/provider'
import { normalizeCurrencyCode } from '@/constants/currencies'
import { normalizeProviderId } from '@/lib/themes'

import { metricRowsForAggregation } from './cross-channel-overview-card.utils'
import type { MetricRecord, ProviderSummary } from './types'

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  google: 'Google Ads',
  facebook: 'Meta Ads',
  meta: 'Meta Ads',
  linkedin: 'LinkedIn Ads',
  tiktok: 'TikTok Ads',
  all: 'All platforms',
}

export function getProviderDisplayName(providerId: string): string {
  const key = providerId.toLowerCase()
  return PROVIDER_DISPLAY_NAMES[key] ?? providerId.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Resolve display currency for insights charts from provider map and selection. */
export function resolveInsightsChartCurrency(
  selectedProvider: string,
  fallbackCurrency: string | undefined,
  providerCurrencyMap: Record<string, string>,
): string {
  if (selectedProvider !== 'all') {
    const key = normalizeAdsProviderId(selectedProvider) ?? selectedProvider
    const providerCurrency = providerCurrencyMap[key]
    return normalizeCurrencyCode(providerCurrency ?? fallbackCurrency)
  }

  const currencies = [...new Set(Object.values(providerCurrencyMap).filter(Boolean))]
  if (currencies.length === 1) {
    return normalizeCurrencyCode(currencies[0])
  }

  if (currencies.length > 1) {
    return normalizeCurrencyCode(fallbackCurrency)
  }

  return normalizeCurrencyCode(fallbackCurrency)
}

/** Per-provider currency from synced metric rows (same rules as cross-channel overview). */
export function buildProviderCurrencyMapFromMetrics(
  metrics: MetricRecord[],
): Record<string, string> {
  const rowsByProvider = new Map<string, MetricRecord[]>()

  for (const metric of metrics) {
    const key = normalizeAdsProviderId(metric.providerId) ?? metric.providerId
    const rows = rowsByProvider.get(key) ?? []
    rows.push(metric)
    rowsByProvider.set(key, rows)
  }

  const map: Record<string, string> = {}
  for (const [providerId, rows] of rowsByProvider) {
    const { financialTotals } = aggregateMetricFinancials(metricRowsForAggregation(rows))
    if (
      financialTotals.comparability === 'single_currency' &&
      financialTotals.primaryCurrency
    ) {
      map[providerId] = financialTotals.primaryCurrency
    }
  }

  return map
}

/** Global display currency from processed metric rows when V2 summary is incomplete. */
export function resolveCurrencyFromProcessedMetrics(
  metrics: MetricRecord[],
): string | null {
  const { financialTotals } = aggregateMetricFinancials(metricRowsForAggregation(metrics))
  return financialTotals.comparability === 'single_currency'
    ? financialTotals.primaryCurrency
    : null
}

/**
 * Resolve a display currency for ads KPI surfaces (custom insights, formula builder, etc.).
 * Returns undefined when currency cannot be determined — never invents USD.
 */
export function resolveAdsDisplayCurrency(
  fallbackCurrency: string | null | undefined,
  metrics: MetricRecord[],
  providerCurrencyMap: Record<string, string> = {},
): string | undefined {
  if (typeof fallbackCurrency === 'string' && fallbackCurrency.trim().length > 0) {
    return normalizeCurrencyCode(fallbackCurrency)
  }

  const fromMetrics = resolveCurrencyFromProcessedMetrics(metrics)
  if (fromMetrics) {
    return fromMetrics
  }

  const currencies = [...new Set(Object.values(providerCurrencyMap).filter(Boolean))]
  if (currencies.length === 1) {
    return normalizeCurrencyCode(currencies[0])
  }

  return undefined
}

/** Map UI selection to chart-data keys (handles meta/facebook aliases and "all"). */
export function resolveChartProviderKey(
  selected: string,
  chartKeys: string[],
): string {
  if (selected === 'all') {
    if (chartKeys.includes('all')) return 'all'
    return chartKeys[0] ?? 'all'
  }

  const normalized = normalizeProviderId(selected)
  if (chartKeys.includes(normalized)) return normalized

  for (const key of chartKeys) {
    if (normalizeProviderId(key) === normalized) return key
  }

  return chartKeys[0] ?? normalized
}

export function providerSummariesToSyntheticMetrics(
  summaries: Record<string, ProviderSummary>,
): MetricRecord[] {
  const today = new Date().toISOString().split('T')[0] ?? ''

  return Object.entries(summaries).flatMap(([providerId, totals], index) =>
    totals.impressions > 0 || totals.spend > 0 || totals.clicks > 0
      ? [{
          id: `summary-${providerId}-${index}`,
          providerId: normalizeProviderId(providerId),
          date: today,
          spend: totals.spend,
          impressions: totals.impressions,
          clicks: totals.clicks,
          conversions: totals.conversions,
          revenue: totals.revenue,
        }]
      : [],
  )
}

export type InsightsTabId = 'comparison' | 'efficiency' | 'trends' | 'funnel' | 'benchmarks'

type InsightsChartDataSlice = {
  providerComparison: { metrics: { spend: number; revenue: number } }[]
  funnelCharts: Record<string, { value: number }[]>
  trendCharts: Record<string, unknown[]>
  efficiencyBreakdown: Record<string, unknown[]>
  benchmarkCharts: Record<string, unknown[]>
}

export function pickDefaultInsightsTab(chartData: InsightsChartDataSlice | undefined): InsightsTabId {
  if (!chartData) return 'comparison'

  const hasComparison = chartData.providerComparison.some(
    (p) => p.metrics.spend > 0 || p.metrics.revenue > 0,
  )
  if (hasComparison) return 'comparison'

  const hasFunnel = Object.values(chartData.funnelCharts).some((stages) =>
    stages.some((s) => s.value > 0),
  )
  if (hasFunnel) return 'funnel'

  const hasTrends = Object.values(chartData.trendCharts).some((rows) => rows.length > 1)
  if (hasTrends) return 'trends'

  const hasEfficiency = Object.values(chartData.efficiencyBreakdown).some((rows) => rows.length > 0)
  if (hasEfficiency) return 'efficiency'

  const hasBenchmarks = Object.values(chartData.benchmarkCharts).some((rows) => rows.length > 0)
  if (hasBenchmarks) return 'benchmarks'

  return 'funnel'
}

export function tabHasChartData(
  tab: InsightsTabId,
  chartData: InsightsChartDataSlice,
  providerKey: string,
): boolean {
  switch (tab) {
    case 'comparison':
      return chartData.providerComparison.some(
        (p) => p.metrics.spend > 0 || p.metrics.revenue > 0,
      )
    case 'funnel': {
      const stages = chartData.funnelCharts[providerKey]
      return Boolean(stages?.some((s) => s.value > 0))
    }
    case 'trends':
      return (chartData.trendCharts[providerKey]?.length ?? 0) > 1
    case 'efficiency':
      return (chartData.efficiencyBreakdown[providerKey]?.length ?? 0) > 0
    case 'benchmarks':
      return (chartData.benchmarkCharts[providerKey]?.length ?? 0) > 0
    default:
      return false
  }
}
