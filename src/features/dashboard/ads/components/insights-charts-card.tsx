'use client'

import { useCallback, useMemo, useState } from 'react'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { MotionCard } from '@/shared/ui/motion-primitives'
import type { PerformanceAnalysis } from '@/lib/ad-algorithms'

import type { AdsMetricsDisplayState } from './ads-metrics-display-state'
import {
  getProviderDisplayName,
  pickDefaultInsightsTab,
  resolveChartProviderKey,
  resolveInsightsChartCurrency,
  tabHasChartData,
  type InsightsTabId,
} from './insights-chart-utils'
import { InsightsFunnelPanel } from './insights-funnel-panel'
import {
  BenchmarkComparisonChart,
  EfficiencyRadarChart,
  ProviderComparisonChart,
  SpendTrendChart,
} from './insights-themed-charts'
import {
  InsightsChartsEmptyState,
  InsightsChartsHeader,
  InsightsChartsLoadingState,
  InsightsChartPanel,
  InsightsChartsTabs,
} from './insights-charts-card-sections'

interface InsightsChartsCardProps {
  analysis: PerformanceAnalysis | null
  currency?: string
  providerCurrencies?: Record<string, string>
  loading?: boolean
  hasConnections?: boolean
  metricsDisplayState?: AdsMetricsDisplayState
}

export function InsightsChartsCard({
  analysis,
  currency,
  providerCurrencies,
  loading = false,
  hasConnections = false,
  metricsDisplayState,
}: InsightsChartsCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [tabSelection, setTabSelection] = useState<{ analysisKey: string; tab: InsightsTabId } | null>(null)

  const analysisKey = useMemo(() => {
    if (!analysis) return 'empty'
    return analysis.summaries.map((summary) => summary.providerId).join('|')
  }, [analysis])

  const defaultActiveTab = useMemo(
    () => (analysis ? pickDefaultInsightsTab(analysis.chartData) : 'comparison'),
    [analysis],
  )

  const activeTab = tabSelection?.analysisKey === analysisKey ? tabSelection.tab : defaultActiveTab

  const setActiveTab = useCallback(
    (tab: InsightsTabId) => {
      setTabSelection({ analysisKey, tab })
    },
    [analysisKey],
  )

  const providers = useMemo(() => {
    if (!analysis) return []
    return analysis.summaries.map((s) => ({
      id: s.providerId,
      name: getProviderDisplayName(s.providerId),
    }))
  }, [analysis])

  const funnelChartKeys = useMemo(
    () => (analysis ? Object.keys(analysis.chartData.funnelCharts) : []),
    [analysis],
  )

  const activeProvider = useMemo(
    () => resolveChartProviderKey(selectedProvider, funnelChartKeys),
    [funnelChartKeys, selectedProvider],
  )

  const chartCurrency = useMemo(
    () => resolveInsightsChartCurrency(selectedProvider, currency, providerCurrencies ?? {}),
    [currency, providerCurrencies, selectedProvider],
  )

  const providerLabel = getProviderDisplayName(activeProvider)

  const tabAvailability = useMemo(() => {
    if (!analysis) {
      return {
        comparison: false,
        efficiency: false,
        trends: false,
        funnel: false,
        benchmarks: false,
      } satisfies Record<InsightsTabId, boolean>
    }
    const chartData = analysis.chartData
    return {
      comparison: tabHasChartData('comparison', chartData, activeProvider),
      efficiency: tabHasChartData('efficiency', chartData, activeProvider),
      trends: tabHasChartData('trends', chartData, activeProvider),
      funnel: tabHasChartData('funnel', chartData, activeProvider),
      benchmarks: tabHasChartData('benchmarks', chartData, activeProvider),
    }
  }, [activeProvider, analysis])

  if (loading) {
    return <InsightsChartsLoadingState />
  }

  if (!analysis || analysis.summaries.length === 0) {
    return (
      <InsightsChartsEmptyState
        hasConnections={hasConnections}
        metricsDisplayState={metricsDisplayState}
      />
    )
  }

  const funnelStages = analysis.chartData.funnelCharts[activeProvider]
  const funnelAnalysis = analysis.funnels[activeProvider] ?? null

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <InsightsChartsHeader
        onSelectedProviderChange={setSelectedProvider}
        providers={providers}
        providersCount={providers.length}
        selectedProvider={selectedProvider}
      />
      <InsightsChartsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabAvailability={tabAvailability}
      >
        <InsightsChartPanel
          value="comparison"
          title="Spend vs Revenue by Platform"
          description="Compare financial performance across connected platforms"
        >
          <ProviderComparisonChart
            currency={chartCurrency}
            data={analysis.chartData.providerComparison}
          />
        </InsightsChartPanel>
        <InsightsChartPanel
          value="efficiency"
          title="Efficiency Breakdown"
          description="Multi-dimensional performance analysis"
        >
          <EfficiencyRadarChart
            data={analysis.chartData.efficiencyBreakdown}
            providerId={activeProvider}
            providerLabel={providerLabel}
          />
        </InsightsChartPanel>
        <InsightsChartPanel
          value="trends"
          title="Spend Trend Analysis"
          description="Historical spend with trend line"
        >
          <SpendTrendChart
            currency={chartCurrency}
            data={analysis.chartData.trendCharts}
            providerId={activeProvider}
            providerLabel={providerLabel}
          />
        </InsightsChartPanel>
        <InsightsChartPanel
          value="funnel"
          title="Conversion Funnel"
          description="Impressions → Clicks → Conversions drop-off analysis"
        >
          <InsightsFunnelPanel
            stages={funnelStages}
            analysis={funnelAnalysis}
            providerLabel={providerLabel}
          />
        </InsightsChartPanel>
        <InsightsChartPanel
          value="benchmarks"
          title="Industry Benchmarks"
          description="How you compare to industry averages"
        >
          <BenchmarkComparisonChart
            data={analysis.chartData.benchmarkCharts}
            providerId={activeProvider}
            providerLabel={providerLabel}
          />
        </InsightsChartPanel>
      </InsightsChartsTabs>
    </MotionCard>
  )
}
