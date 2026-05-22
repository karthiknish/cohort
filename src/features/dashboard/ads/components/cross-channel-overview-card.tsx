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
import {
  resolveAdsMetricsDisplayState,
  type AdsMetricsDisplayState,
} from './ads-metrics-display-state'
import { parseMetricDate } from '../hooks/use-ads-metrics.helpers'

const EMPTY_CONNECTED_PROVIDER_IDS: string[] = []

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
  /** At least one linked platform has completed a successful sync. */
  hasSuccessfulSync?: boolean
}

export function CrossChannelOverviewCard({
  processedMetrics,
  serverSideSummary,
  currency,
  connectedProviderIds = EMPTY_CONNECTED_PROVIDER_IDS,
  hasMetricData,
  initialMetricsLoading,
  metricsLoading,
  dateRange,
  onDateRangeChange,
  onExport,
  showDateAndExport = true,
  hasConnectedAds = false,
  hasSuccessfulSync = false,
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
    const fromMetrics = scopedMetrics.flatMap((metric) =>
      metric.providerId ? [metric.providerId] : [],
    )
    return [...new Set(fromMetrics)].toSorted()
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

  const displayState = useMemo<AdsMetricsDisplayState>(
    () =>
      resolveAdsMetricsDisplayState({
        metricsLoading: initialMetricsLoading || metricsLoading,
        connectedAccountCount: hasConnectedAds ? 1 : 0,
        hasSuccessfulSync,
        hasMetricData,
      }),
    [hasConnectedAds, hasMetricData, hasSuccessfulSync, initialMetricsLoading, metricsLoading],
  )

  const { cards: summaryCards, chartCurrency } = useMemo(
    () => buildCrossChannelSummaryCards(overviewMetrics, displayState),
    [displayState, overviewMetrics],
  )

  const displayCurrency = chartCurrency ?? currency

  const chartMetrics = useMemo(() => {
    const dailyRows = filteredMetrics.filter(
      (metric) => metric.date !== 'summary' && parseMetricDate(metric.date) !== null,
    )
    if (dailyRows.length > 0) {
      return dailyRows
    }

    return overviewMetrics.filter(
      (metric) => metric.date !== 'summary' && parseMetricDate(metric.date) !== null,
    )
  }, [filteredMetrics, overviewMetrics])

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
        <CrossChannelOverviewEmptyState displayState="needs_connection" />
      ) : (
        <CrossChannelOverviewContent
          currency={displayCurrency}
          chartMetrics={chartMetrics}
          metricsLoading={metricsLoading}
          summaryCards={summaryCards}
          hasAggregateChartFallback={hasAggregateChartFallback}
          hasConnectedAds={hasConnectedAds}
          displayState={displayState}
        />
      )}
    </MotionCard>
  )
}
