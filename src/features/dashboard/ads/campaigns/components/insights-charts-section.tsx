'use client'

import { normalizeCurrencyCode } from '@/constants/currencies'

import { useInsightsChartsFormatters } from './use-insights-charts-formatters'
import type { InsightsChartsSectionProps } from './insights-charts-section-types'
import {
  ConversionsChartSection,
  CostEfficiencyChartSection,
  EngagementTrendsChartSection,
  PerformanceOverviewChartSection,
  ReachVsImpressionsChartSection,
} from './insights-charts-section-sections'

export type {
  ConversionChartPoint,
  EngagementChartPoint,
  InsightsChartsSectionProps,
  PerformanceMetricPoint,
  ReachChartPoint,
} from './insights-charts-section-types'

export function InsightsChartsSection({
  chartMetrics,
  engagementChartData,
  conversionsChartData,
  reachChartData,
  insightsLoading,
  currency = 'USD',
}: InsightsChartsSectionProps) {
  const displayCurrency = normalizeCurrencyCode(currency)
  const formatters = useInsightsChartsFormatters(displayCurrency)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PerformanceOverviewChartSection
        chartMetrics={chartMetrics}
        insightsLoading={insightsLoading}
        displayCurrency={displayCurrency}
      />
      <EngagementTrendsChartSection
        engagementChartData={engagementChartData}
        insightsLoading={insightsLoading}
        formatters={formatters}
      />
      <ConversionsChartSection
        conversionsChartData={conversionsChartData}
        insightsLoading={insightsLoading}
        formatters={formatters}
      />
      <CostEfficiencyChartSection
        conversionsChartData={conversionsChartData}
        insightsLoading={insightsLoading}
        formatters={formatters}
      />
      {reachChartData ? (
        <ReachVsImpressionsChartSection reachChartData={reachChartData} formatters={formatters} />
      ) : null}
    </div>
  )
}
