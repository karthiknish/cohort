'use client'

import { useEffect, useMemo, useState } from 'react'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { MotionCard } from '@/shared/ui/motion-primitives'
import type { PerformanceAnalysis } from '@/lib/ad-algorithms'

import {
  getProviderDisplayName,
  pickDefaultInsightsTab,
  resolveChartProviderKey,
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
  loading?: boolean
  hasConnections?: boolean
}

export function InsightsChartsCard({
  analysis,
  currency = 'USD',
  loading = false,
  hasConnections = false,
}: InsightsChartsCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<InsightsTabId>('comparison')

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

  useEffect(() => {
    if (!analysis) return
    setActiveTab(pickDefaultInsightsTab(analysis.chartData))
  }, [analysis])

  if (loading) {
    return <InsightsChartsLoadingState />
  }

  if (!analysis || analysis.summaries.length === 0) {
    return <InsightsChartsEmptyState hasConnections={hasConnections} />
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
            currency={currency}
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
            currency={currency}
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
