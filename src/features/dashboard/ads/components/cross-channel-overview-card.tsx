'use client'

import { useCallback, useMemo, useState } from 'react'
import { Card } from '@/shared/ui/card'
import { aggregateMetricFinancials } from '@/domain/ads/aggregate-financials'

import type { MetricRecord, MetricsSummary } from './types'
import type { DateRange } from './date-range-picker'

import {
  CrossChannelOverviewContent,
  CrossChannelOverviewEmptyState,
  CrossChannelOverviewHeader,
  CrossChannelOverviewLoadingState,
} from './cross-channel-overview-card-sections'
import {
  buildCanonicalConnectedIds,
  buildCrossChannelSummaryCards,
  filterMetricsByProviders,
  filterMetricsToConnected,
  metricRowsForAggregation,
} from './cross-channel-overview-card.utils'

interface CrossChannelOverviewCardProps {
  processedMetrics: MetricRecord[]
  serverSideSummary?: MetricsSummary | null
  currency?: string
  /** Canonical or alias ids for platforms currently linked in this workspace. */
  connectedProviderIds?: string[]
  hasMetricData: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onExport: () => void
  /** When false, date range and export live in the page header instead of this card. */
  showDateAndExport?: boolean
}

export function CrossChannelOverviewCard({
  processedMetrics,
  serverSideSummary,
  currency,
  connectedProviderIds = [],
  hasMetricData,
  initialMetricsLoading,
  metricsLoading,
  dateRange,
  onDateRangeChange,
  onExport,
  showDateAndExport = true,
}: CrossChannelOverviewCardProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const canonicalConnected = useMemo(
    () => buildCanonicalConnectedIds(connectedProviderIds),
    [connectedProviderIds],
  )

  const scopedMetrics = useMemo(
    () => filterMetricsToConnected(processedMetrics, canonicalConnected),
    [canonicalConnected, processedMetrics],
  )

  const availableProviders = useMemo(() => {
    if (canonicalConnected.length > 0) {
      return canonicalConnected
    }
    const fromMetrics = scopedMetrics
      .map((metric) => metric.providerId)
      .filter(Boolean)
    return [...new Set(fromMetrics)].sort()
  }, [canonicalConnected, scopedMetrics])

  const filteredMetrics = useMemo(
    () => filterMetricsByProviders(scopedMetrics, selectedProviders),
    [scopedMetrics, selectedProviders],
  )

  const { cards: summaryCards, chartCurrency } = useMemo(
    () => buildCrossChannelSummaryCards(filteredMetrics),
    [filteredMetrics],
  )

  const displayCurrency = chartCurrency ?? currency

  const toggleProvider = useCallback((providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((p) => p !== providerId)
        : [...prev, providerId],
    )
  }, [])

  const hasProviderFilter = selectedProviders.length > 0

  const hasAggregateChartFallback = useMemo(() => {
    if (filteredMetrics.length > 0) {
      return false
    }
    const aggregate = aggregateMetricFinancials(metricRowsForAggregation(filteredMetrics))
    const delivery = aggregate.deliveryTotals
    const financial = aggregate.financialTotals
    return (
      delivery.impressions > 0 ||
      delivery.clicks > 0 ||
      (financial.spend ?? 0) > 0
    )
  }, [filteredMetrics])

  return (
    <Card className="shadow-sm">
      <CrossChannelOverviewHeader
        availableProviders={availableProviders}
        dateRange={dateRange}
        hasMetricData={hasMetricData}
        hasProviderFilter={hasProviderFilter}
        onDateRangeChange={onDateRangeChange}
        onExport={onExport}
        onToggleProvider={toggleProvider}
        selectedProviders={selectedProviders}
        serverAggregated={Boolean(serverSideSummary)}
        showDateAndExport={showDateAndExport}
      />
      {initialMetricsLoading ? (
        <CrossChannelOverviewLoadingState />
      ) : !hasMetricData ? (
        <CrossChannelOverviewEmptyState />
      ) : (
        <CrossChannelOverviewContent
          currency={displayCurrency}
          metrics={filteredMetrics}
          metricsLoading={metricsLoading}
          summaryCards={summaryCards}
          hasAggregateChartFallback={hasAggregateChartFallback}
        />
      )}
    </Card>
  )
}
