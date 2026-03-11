'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { normalizeProviderId } from '@/lib/themes'

import type { MetricRecord, MetricsSummary, SummaryCard, Totals } from './types'
import type { DateRange } from './date-range-picker'

import {
  CrossChannelOverviewContent,
  CrossChannelOverviewEmptyState,
  CrossChannelOverviewHeader,
  CrossChannelOverviewLoadingState,
} from './cross-channel-overview-card-sections'

interface CrossChannelOverviewCardProps {
  processedMetrics: MetricRecord[]
  serverSideSummary?: MetricsSummary | null
  currency?: string
  hasMetricData: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onExport: () => void
}

export function CrossChannelOverviewCard({
  processedMetrics,
  serverSideSummary,
  currency = 'USD',
  hasMetricData,
  initialMetricsLoading,
  metricsLoading,
  dateRange,
  onDateRangeChange,
  onExport,
}: CrossChannelOverviewCardProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const summaryProviders = useMemo(() => {
    if (!serverSideSummary?.providers) return []
    return Object.keys(serverSideSummary.providers)
      .map((providerId) => normalizeProviderId(providerId))
      .sort()
  }, [serverSideSummary])

  // Get unique providers from the data
  const availableProviders = useMemo(() => {
    const providers = new Set<string>([
      ...processedMetrics.map((m) => normalizeProviderId(m.providerId)),
      ...summaryProviders,
    ])
    return Array.from(providers).sort()
  }, [processedMetrics, summaryProviders])

  // Filter metrics by selected providers
  const filteredMetrics = useMemo(() => {
    if (selectedProviders.length === 0) return processedMetrics
    return processedMetrics.filter((m) => selectedProviders.includes(normalizeProviderId(m.providerId)))
  }, [processedMetrics, selectedProviders])

  const normalizedServerProviders = useMemo(() => {
    if (!serverSideSummary?.providers) return {}
    return Object.entries(serverSideSummary.providers).reduce<Record<string, Totals>>((acc, [providerId, totals]) => {
      const normalized = normalizeProviderId(providerId)
      const current = acc[normalized] ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      current.spend += Number(totals.spend ?? 0)
      current.impressions += Number(totals.impressions ?? 0)
      current.clicks += Number(totals.clicks ?? 0)
      current.conversions += Number(totals.conversions ?? 0)
      current.revenue += Number(totals.revenue ?? 0)
      acc[normalized] = current
      return acc
    }, {})
  }, [serverSideSummary?.providers])

  const filteredTotals: Totals = useMemo(() => {
    if (serverSideSummary?.totals && serverSideSummary.providers) {
      if (selectedProviders.length === 0) {
        return serverSideSummary.totals
      }

      return selectedProviders.reduce<Totals>(
        (acc, providerId) => {
          const p = normalizedServerProviders[normalizeProviderId(providerId)]
          if (!p) return acc
          acc.spend += p.spend
          acc.impressions += p.impressions
          acc.clicks += p.clicks
          acc.conversions += p.conversions
          acc.revenue += p.revenue
          return acc
        },
        { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      )
    }

    return filteredMetrics.reduce<Totals>(
      (acc, m) => {
        acc.spend += m.spend
        acc.impressions += m.impressions
        acc.clicks += m.clicks
        acc.conversions += m.conversions
        acc.revenue += m.revenue ?? 0
        return acc
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    )
  }, [filteredMetrics, normalizedServerProviders, selectedProviders, serverSideSummary])

  // Calculate summary cards from filtered metrics
  const summaryCards: SummaryCard[] = useMemo(() => {
    const hasData = filteredMetrics.length > 0 || filteredTotals.spend > 0 || filteredTotals.impressions > 0
    const averageCpc = filteredTotals.clicks > 0 ? filteredTotals.spend / filteredTotals.clicks : 0
    const roas = filteredTotals.spend > 0 ? filteredTotals.revenue / filteredTotals.spend : 0
    const ctr = filteredTotals.impressions > 0 ? filteredTotals.clicks / filteredTotals.impressions : 0
    const conversionRate = filteredTotals.clicks > 0 ? filteredTotals.conversions / filteredTotals.clicks : 0
    const cpa = filteredTotals.conversions > 0 ? filteredTotals.spend / filteredTotals.conversions : 0

    return [
      {
        id: 'spend',
        label: 'Total Spend',
        value: formatCurrency(filteredTotals.spend, currency),
        helper: hasData ? 'All selected platforms combined' : 'Connect a platform to populate',
      },
      {
        id: 'impressions',
        label: 'Impressions',
        value: filteredTotals.impressions > 0 ? filteredTotals.impressions.toLocaleString() : '—',
        helper: hasData ? 'Total times ads were served' : 'Awaiting your first sync',
      },
      {
        id: 'ctr',
        label: 'CTR',
        value: ctr > 0 ? `${(ctr * 100).toFixed(2)}%` : '—',
        helper: ctr > 0 ? 'Clicks ÷ impressions' : 'Needs impressions and clicks data',
      },
      {
        id: 'avg-cpc',
        label: 'Avg CPC',
        value: filteredTotals.clicks > 0 ? formatCurrency(averageCpc, currency) : '—',
        helper: filteredTotals.clicks > 0 ? 'What each click cost on average' : 'Need click data to calculate',
      },
      {
        id: 'cpa',
        label: 'CPA',
        value: cpa > 0 ? formatCurrency(cpa, currency) : '—',
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
  }, [currency, filteredMetrics.length, filteredTotals])

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((p) => p !== providerId)
        : [...prev, providerId]
    )
  }

  const hasProviderFilter = selectedProviders.length > 0

  return (
    <Card className="shadow-sm">
      <CrossChannelOverviewHeader availableProviders={availableProviders} dateRange={dateRange} hasMetricData={hasMetricData} hasProviderFilter={hasProviderFilter} onDateRangeChange={onDateRangeChange} onExport={onExport} onToggleProvider={toggleProvider} selectedProviders={selectedProviders} serverAggregated={Boolean(serverSideSummary)} />
      {initialMetricsLoading ? <CrossChannelOverviewLoadingState /> : !hasMetricData ? <CrossChannelOverviewEmptyState /> : <CrossChannelOverviewContent currency={currency} metrics={filteredMetrics} metricsLoading={metricsLoading} summaryCards={summaryCards} />}
    </Card>
  )
}
