'use client'

import { useCallback, useMemo, useState } from 'react'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { MotionCard } from '@/shared/ui/motion-primitives'
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
  metricsForOverviewDisplay,
  totalsFromServerSummary,
  totalsHaveDeliveryActivity,
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
  /** At least one ad platform is linked (used for chart empty-state copy). */
  hasConnectedAds?: boolean
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
  hasConnectedAds = false,
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

  const overviewMetrics = useMemo(
    () =>
      metricsForOverviewDisplay(
        filteredMetrics,
        serverSideSummary,
        canonicalConnected,
        selectedProviders,
        currency,
      ),
    [canonicalConnected, currency, filteredMetrics, selectedProviders, serverSideSummary],
  )

  const { cards: summaryCards, chartCurrency } = useMemo(
    () => buildCrossChannelSummaryCards(overviewMetrics),
    [overviewMetrics],
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
    const totals = totalsFromServerSummary(serverSideSummary, canonicalConnected, selectedProviders)
    return totals !== null && totalsHaveDeliveryActivity(totals)
  }, [canonicalConnected, filteredMetrics.length, selectedProviders, serverSideSummary])

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CrossChannelOverviewHeader
        availableProviders={availableProviders}
        dateRange={dateRange}
        hasMetricData={hasMetricData}
        hasProviderFilter={hasProviderFilter}
        onDateRangeChange={onDateRangeChange}
        onExport={onExport}
        onToggleProvider={toggleProvider}
        selectedProviders={selectedProviders}
        showDateAndExport={showDateAndExport}
      />
      {initialMetricsLoading ? (
        <CrossChannelOverviewLoadingState />
      ) : !hasMetricData && !hasConnectedAds ? (
        <CrossChannelOverviewEmptyState />
      ) : (
        <CrossChannelOverviewContent
          currency={displayCurrency}
          metrics={filteredMetrics}
          metricsLoading={metricsLoading}
          summaryCards={summaryCards}
          hasAggregateChartFallback={hasAggregateChartFallback}
          hasConnectedAds={hasConnectedAds}
        />
      )}
    </MotionCard>
  )
}
