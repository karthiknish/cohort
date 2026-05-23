'use client'

import { useMemo } from 'react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import type { UseFormulaEditorReturn } from '@/features/dashboard/ads/hooks/use-formula-editor'
import type { AlgorithmicInsight } from '@/lib/ad-algorithms'
import { type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { FormulaBuilderCard } from '@/features/dashboard/ads/components/formula-builder-card'
import { Button } from '@/shared/ui/button'
import { CardContent } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'

import { CampaignHeader } from './campaign-header'
import { AlgorithmicInsightsSection } from './algorithmic-insights-section'
import { AudienceControlSection } from './audience-control-section'
import { BudgetControlSection } from './budget-control-section'
import { CampaignAdsSection } from './campaign-ads-section'
import { CampaignMetaToolsSection } from './campaign-meta-tools-section'
import { CampaignInsightsError } from './campaign-insights-error'
import { CampaignPageLayout, CampaignSection } from './campaign-page-shell'
import { InsightsChartsSection } from './insights-charts-section'
import { MetricCardsSection } from './metric-cards-section'
import { useCampaignInsightsPage, type UseCampaignInsightsPageReturn } from './use-campaign-insights-page'
import type { Campaign, CampaignInsightsResponse } from './campaign-insights-page-types'

export type { Campaign, CampaignInsightsResponse } from './campaign-insights-page-types'

export function CampaignInsightsErrorBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <MotionCard className="overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/5 ring-1 ring-destructive/15">
      <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm text-destructive">
        <span className="font-medium">{message}</span>
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </MotionCard>
  )
}

export function CampaignInsightsPerformanceSection({
  calculatedMetrics,
  insightsLoading,
  displayCurrency,
  efficiencyScore,
  insightsError,
  chartMetrics,
  engagementChartData,
  conversionsChartData,
  reachChartData,
  algorithmicInsightsList,
  onRetryInsights,
}: {
  calculatedMetrics: UseCampaignInsightsPageReturn['calculatedMetrics']
  insightsLoading: boolean
  displayCurrency: string
  efficiencyScore: number | null
  insightsError: string | null
  chartMetrics: Array<{ date: string; spend: number; revenue: number }>
  engagementChartData: Array<{
    date: string
    dateFormatted: string
    clicks: number
    impressions: number
    ctr: number
  }>
  conversionsChartData: Array<{
    date: string
    dateFormatted: string
    conversions: number
    revenue: number
    cpc: number
    cpa: number
  }>
  reachChartData?: Array<{
    date: string
    dateFormatted: string
    reach: number
    impressions: number
  }>
  algorithmicInsightsList: AlgorithmicInsight[]
  onRetryInsights: () => void
}) {
  return (
    <>
      <CampaignSection
        eyebrow="Snapshot"
        title="Key metrics"
        description="Totals for the selected date range. Expand for reach, efficiency, and cost breakdowns."
      >
        <MetricCardsSection
          metrics={calculatedMetrics}
          loading={insightsLoading}
          currency={displayCurrency}
          efficiencyScore={efficiencyScore}
        />
      </CampaignSection>

      <CampaignSection
        eyebrow="Charts"
        title="Trends"
        description="Spend, engagement, conversions, and reach over time."
      >
        {insightsError ? (
          <CampaignInsightsError
            message={insightsError}
            onRetry={onRetryInsights}
            retrying={insightsLoading}
          />
        ) : (
          <InsightsChartsSection
            chartMetrics={chartMetrics}
            engagementChartData={engagementChartData}
            conversionsChartData={conversionsChartData}
            reachChartData={reachChartData}
            insightsLoading={insightsLoading}
            currency={displayCurrency}
          />
        )}
      </CampaignSection>

      {!insightsLoading && !insightsError ? (
        <AlgorithmicInsightsSection
          insights={algorithmicInsightsList}
          loading={insightsLoading}
          efficiencyScore={efficiencyScore ?? 0}
        />
      ) : null}
    </>
  )
}

export function CampaignInsightsControlsSection({
  providerId,
  campaignId,
  selectedClientId,
  isPreviewMode,
  displayCurrency,
  campaign,
  onReloadCampaign,
}: {
  providerId: string
  campaignId: string
  selectedClientId: string | null
  isPreviewMode: boolean
  displayCurrency: string
  campaign: Campaign | null
  onReloadCampaign: () => void
}) {
  return (
    <>
      <BudgetControlSection
        key={`budget-${providerId}-${campaignId}-${campaign?.budgetType ?? 'none'}-${campaign?.budget ?? 'none'}`}
        providerId={providerId}
        campaignId={campaignId}
        clientId={selectedClientId}
        isPreviewMode={isPreviewMode}
        currency={displayCurrency}
        budget={campaign?.budget}
        budgetType={campaign?.budgetType}
        onReloadCampaign={onReloadCampaign}
      />
      <AudienceControlSection
        providerId={providerId}
        campaignId={campaignId}
        clientId={selectedClientId}
        isPreviewMode={isPreviewMode}
        campaignObjective={campaign?.objective}
      />
    </>
  )
}

export function CampaignInsightsCreativesSection({
  providerId,
  campaignId,
  selectedClientId,
  isPreviewMode,
  displayCurrency,
  campaign,
}: {
  providerId: string
  campaignId: string
  selectedClientId: string | null
  isPreviewMode: boolean
  displayCurrency: string
  campaign: Campaign | null
}) {
  return (
    <CampaignAdsSection
      providerId={providerId}
      campaignId={campaignId}
      campaignObjective={campaign?.objective}
      clientId={selectedClientId}
      isPreviewMode={isPreviewMode}
      currency={displayCurrency}
    />
  )
}

export function CampaignInsightsAdvancedSection({
  providerId,
  selectedClientId,
  isPreviewMode,
  campaign,
  formulaEditor,
  calculatedMetrics,
  insightsLoading,
}: {
  providerId: string
  selectedClientId: string | null
  isPreviewMode: boolean
  campaign: Campaign | null
  formulaEditor: UseFormulaEditorReturn
  calculatedMetrics: UseCampaignInsightsPageReturn['calculatedMetrics']
  insightsLoading: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <FormulaBuilderCard
        formulaEditor={formulaEditor}
        metricTotals={calculatedMetrics ?? undefined}
        loading={insightsLoading}
      />
      {providerId === 'facebook' ? (
        <CampaignMetaToolsSection
          clientId={selectedClientId}
          isPreviewMode={isPreviewMode}
          campaignObjective={campaign?.objective}
        />
      ) : null}
    </div>
  )
}

export function CampaignInsightsPageBody({
  page,
}: {
  page: UseCampaignInsightsPageReturn
}) {
  const performanceSection = useMemo(
    () => (
      <CampaignInsightsPerformanceSection
        calculatedMetrics={page.calculatedMetrics}
        insightsLoading={page.insightsLoading}
        displayCurrency={page.displayCurrency}
        efficiencyScore={page.efficiencyScore}
        insightsError={page.insightsError}
        chartMetrics={page.chartMetrics}
        engagementChartData={page.engagementChartData}
        conversionsChartData={page.conversionsChartData}
        reachChartData={page.reachChartData}
        algorithmicInsightsList={page.algorithmicInsightsList}
        onRetryInsights={page.handleRetryInsights}
      />
    ),
    [page],
  )

  const controlsSection = useMemo(
    () => (
      <CampaignInsightsControlsSection
        providerId={page.providerId}
        campaignId={page.campaignId}
        selectedClientId={page.selectedClientId}
        isPreviewMode={page.isPreviewMode}
        displayCurrency={page.displayCurrency}
        campaign={page.campaign}
        onReloadCampaign={page.loadCampaign}
      />
    ),
    [page],
  )

  const creativesSection = useMemo(
    () => (
      <CampaignInsightsCreativesSection
        providerId={page.providerId}
        campaignId={page.campaignId}
        selectedClientId={page.selectedClientId}
        isPreviewMode={page.isPreviewMode}
        displayCurrency={page.displayCurrency}
        campaign={page.campaign}
      />
    ),
    [page],
  )

  const advancedSection = useMemo(
    () => (
      <CampaignInsightsAdvancedSection
        providerId={page.providerId}
        selectedClientId={page.selectedClientId}
        isPreviewMode={page.isPreviewMode}
        campaign={page.campaign}
        formulaEditor={page.formulaEditor}
        calculatedMetrics={page.calculatedMetrics}
        insightsLoading={page.insightsLoading}
      />
    ),
    [page],
  )

  return (
    <CampaignPageLayout
      performance={performanceSection}
      controls={controlsSection}
      creatives={creativesSection}
      advanced={advancedSection}
    />
  )
}

export { ADS_PAGE_THEME }

export function CampaignInsightsPageContent() {
  const page = useCampaignInsightsPage()

  return (
    <div className={ADS_PAGE_THEME.innerContainer}>
      <CampaignHeader
        campaign={page.campaign}
        loading={page.campaignLoading}
        dateRange={page.dateRange}
        onDateRangeChange={page.handleDateRangeChange}
        onRefresh={page.loadInsights}
        refreshing={page.insightsLoading}
        onCampaignUpdated={page.loadCampaign}
      />

      {page.campaignError && !page.isPreviewMode ? (
        <CampaignInsightsErrorBanner
          message={page.campaignError}
          onRetry={page.handleRetryCampaign}
        />
      ) : null}

      <CampaignInsightsPageBody page={page} />
    </div>
  )
}
