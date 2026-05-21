import {
  aggregateMetricFinancials,
  formatAggregatedMoney,
  type MetricFinancialRow,
} from '@/domain/ads/aggregate-financials'
import { normalizeAdsProviderId, type CanonicalAdsProviderId } from '@/domain/ads/provider'
import { formatCurrency } from '@/lib/utils'

import type { MetricRecord, SummaryCard } from './types'

export function buildCanonicalConnectedIds(rawIds: string[]): CanonicalAdsProviderId[] {
  const ids = rawIds
    .map((id) => normalizeAdsProviderId(id))
    .filter((id): id is CanonicalAdsProviderId => id !== null)
  return [...new Set(ids)].sort()
}

export function filterMetricsToConnected(
  metrics: MetricRecord[],
  connectedIds: CanonicalAdsProviderId[],
): MetricRecord[] {
  if (connectedIds.length === 0) {
    return metrics
  }
  const connected = new Set(connectedIds)
  return metrics.filter((metric) => {
    const canonical = normalizeAdsProviderId(metric.providerId)
    return canonical !== null && connected.has(canonical)
  })
}

export function filterMetricsByProviders(
  metrics: MetricRecord[],
  selectedProviderIds: string[],
): MetricRecord[] {
  if (selectedProviderIds.length === 0) {
    return metrics
  }
  const selected = new Set(
    selectedProviderIds.map((id) => normalizeAdsProviderId(id) ?? id),
  )
  return metrics.filter((metric) => {
    const canonical = normalizeAdsProviderId(metric.providerId) ?? metric.providerId
    return selected.has(canonical)
  })
}

export function metricRowsForAggregation(metrics: MetricRecord[]): MetricFinancialRow[] {
  return metrics.map((metric) => ({
    spend: metric.spend,
    revenue: metric.revenue,
    currency: metric.currency,
    impressions: metric.impressions,
    clicks: metric.clicks,
    conversions: metric.conversions,
  }))
}

export function computeCtrParts(clicks: number, impressions: number): {
  rate: number
  clicksExceedImpressions: boolean
} {
  if (impressions <= 0) {
    return { rate: 0, clicksExceedImpressions: false }
  }
  const raw = clicks / impressions
  return {
    rate: Math.min(raw, 1),
    clicksExceedImpressions: clicks > impressions,
  }
}

export function buildCrossChannelSummaryCards(
  metrics: MetricRecord[],
): { cards: SummaryCard[]; chartCurrency?: string } {
  const aggregate = aggregateMetricFinancials(metricRowsForAggregation(metrics))
  const delivery = aggregate.deliveryTotals
  const financial = aggregate.financialTotals

  const spend = financial.spend ?? 0
  const revenue = financial.revenue ?? 0
  const fmtMoney = (amount: number) => formatAggregatedMoney(amount, financial, formatCurrency)

  const hasData =
    metrics.length > 0 ||
    delivery.impressions > 0 ||
    delivery.clicks > 0 ||
    spend > 0

  const { rate: ctr, clicksExceedImpressions } = computeCtrParts(delivery.clicks, delivery.impressions)
  const averageCpc = delivery.clicks > 0 && spend > 0 ? spend / delivery.clicks : 0
  const roas = spend > 0 && revenue > 0 ? revenue / spend : 0
  const conversionRate = delivery.clicks > 0 ? delivery.conversions / delivery.clicks : 0
  const cpa = delivery.conversions > 0 && spend > 0 ? spend / delivery.conversions : 0

  const cards: SummaryCard[] = [
    {
      id: 'spend',
      label: 'Total Spend',
      value: spend > 0 ? fmtMoney(spend) : hasData ? fmtMoney(0) : '—',
      helper: hasData ? 'Connected platforms in this date range' : 'Connect a platform to populate',
    },
    {
      id: 'impressions',
      label: 'Impressions',
      value: delivery.impressions > 0 ? delivery.impressions.toLocaleString() : '—',
      helper: hasData ? 'Total times ads were served' : 'Awaiting your first sync',
    },
    {
      id: 'ctr',
      label: 'CTR',
      value: ctr > 0 ? `${(ctr * 100).toFixed(2)}%` : '—',
      helper: clicksExceedImpressions
        ? 'Clicks exceed impressions in synced data — CTR capped at 100%'
        : ctr > 0
          ? 'Clicks ÷ impressions'
          : 'Needs impressions and clicks data',
    },
    {
      id: 'avg-cpc',
      label: 'Avg CPC',
      value: delivery.clicks > 0 && spend > 0 ? fmtMoney(averageCpc) : '—',
      helper: delivery.clicks > 0 ? 'What each click cost on average' : 'Need click data to calculate',
    },
    {
      id: 'cpa',
      label: 'CPA',
      value: cpa > 0 ? fmtMoney(cpa) : '—',
      helper: cpa > 0 ? 'Spend ÷ conversions (lower is better)' : 'Needs spend and conversions data',
    },
    {
      id: 'conv-rate',
      label: 'Conv. Rate',
      value: conversionRate > 0 ? `${(conversionRate * 100).toFixed(2)}%` : '—',
      helper: conversionRate > 0 ? 'Conversions ÷ clicks' : 'Needs clicks and conversions data',
    },
    {
      id: 'roas',
      label: 'ROAS',
      value: roas > 0 ? `${roas.toFixed(2)}x` : '—',
      helper: roas > 0 ? 'Revenue ÷ spend (higher is better)' : 'Needs revenue and spend data',
    },
  ]

  const chartCurrency =
    financial.comparability === 'single_currency' && financial.primaryCurrency
      ? financial.primaryCurrency
      : undefined

  return { cards, chartCurrency }
}
