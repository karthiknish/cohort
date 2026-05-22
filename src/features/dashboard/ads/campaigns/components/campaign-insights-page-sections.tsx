'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAction } from 'convex/react'
import { useParams } from 'next/navigation'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { FormulaBuilderCard } from '@/features/dashboard/ads/components/formula-builder-card'
import { useFormulaEditor } from '@/features/dashboard/ads/hooks/use-formula-editor'
import { normalizeCurrencyCode } from '@/constants/currencies'
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms'
import { adsCampaignInsightsApi, adsCampaignsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewCampaigns, getPreviewCampaignInsights } from '@/lib/preview-data'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/ui/button'
import { CardContent } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'

import { CampaignHeader } from './campaign-header'
import { AlgorithmicInsightsSection } from './algorithmic-insights-section'
import { AudienceControlSection } from './audience-control-section'
import { BudgetControlSection } from './budget-control-section'
import { CampaignAdsSection } from './campaign-ads-section'
import { CampaignInsightsError } from './campaign-insights-error'
import { CampaignPageLayout, CampaignSection } from './campaign-page-shell'
import { InsightsChartsSection } from './insights-charts-section'
import { MetricCardsSection } from './metric-cards-section'

export type Campaign = {
  id: string
  name: string
  providerId: string
  status: string
  budget?: number
  budgetType?: string
  currency?: string
  objective?: string
  startTime?: string
  stopTime?: string
  accountName?: string
  accountLogoUrl?: string
}

type ProviderId = 'google' | 'tiktok' | 'linkedin' | 'facebook'

export type CampaignInsightsResponse = {
  providerId: string
  campaignId: string
  startDate: string
  endDate: string
  totals: {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    reach: number | null
  }
  series: Array<{
    date: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    reach: number | null
  }>
  insights: {
    providerId: string
    calculatedMetrics: Record<string, number | null>
    insights: Array<{
      type: string
      level: 'success' | 'info' | 'warning' | 'error'
      metric: string
      value?: number | null
      benchmark?: number | null
      message: string
      recommendation?: string
    }>
    calculatedAt: string
  }
  currency?: string
}

type CampaignInsightsPageState = {
  dateRange: DateRange
  campaignLoading: boolean
  campaignError: string | null
  campaign: Campaign | null
  insightsLoading: boolean
  insightsError: string | null
  insights: CampaignInsightsResponse | null
}

type CampaignInsightsPageAction =
  | { type: 'setDateRange'; value: DateRange }
  | { type: 'setCampaignLoading'; value: boolean }
  | { type: 'setCampaignError'; value: string | null }
  | { type: 'setCampaign'; value: Campaign | null }
  | { type: 'patchCampaign'; updater: (prev: Campaign | null) => Campaign | null }
  | { type: 'setInsightsLoading'; value: boolean }
  | { type: 'setInsightsError'; value: string | null }
  | { type: 'setInsights'; value: CampaignInsightsResponse | null }

function toIsoDateOnly(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function parseIsoDateOnly(value: string | null): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function parseIsoDateTime(value: string | null): Date | null {
  if (!value) return null

  let normalizedValue = value
  if (/[+-]\d{4}$/.test(value)) {
    normalizedValue = value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  }

  const d = new Date(normalizedValue)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function clampDateRange(range: { start: Date; end: Date }): { start: Date; end: Date } {
  const end = range.end
  const start = range.start.getTime() > end.getTime() ? end : range.start
  return { start, end }
}

function isProviderId(value: string): value is ProviderId {
  return value === 'google' || value === 'tiktok' || value === 'linkedin' || value === 'facebook'
}

function campaignInsightsPageReducer(
  state: CampaignInsightsPageState,
  action: CampaignInsightsPageAction,
): CampaignInsightsPageState {
  switch (action.type) {
    case 'setDateRange':
      return { ...state, dateRange: action.value }
    case 'setCampaignLoading':
      return { ...state, campaignLoading: action.value }
    case 'setCampaignError':
      return { ...state, campaignError: action.value }
    case 'setCampaign':
      return { ...state, campaign: action.value }
    case 'patchCampaign':
      return { ...state, campaign: action.updater(state.campaign) }
    case 'setInsightsLoading':
      return { ...state, insightsLoading: action.value }
    case 'setInsightsError':
      return { ...state, insightsError: action.value }
    case 'setInsights':
      return { ...state, insights: action.value }
    default:
      return state
  }
}

function createInitialDateRange(
  searchParams: URLSearchParams,
  campaignStartFromUrl: Date | null,
  campaignStopFromUrl: Date | null,
  initialStart: Date | null,
  initialEnd: Date | null,
): DateRange {
  if (campaignStartFromUrl || campaignStopFromUrl) {
    const now = new Date()
    const end = campaignStopFromUrl && campaignStopFromUrl <= now ? campaignStopFromUrl : now
    const start = campaignStartFromUrl ?? new Date(new Date(end).setDate(end.getDate() - 30))
    return clampDateRange({ start, end })
  }

  if (initialStart || initialEnd) {
    const end = initialEnd ?? (initialStart ? new Date(new Date(initialStart).setDate(initialStart.getDate() + 6)) : new Date())
    const start = initialStart ?? new Date(new Date(end).setDate(end.getDate() - 6))
    return clampDateRange({ start, end })
  }

  const end = new Date()
  const start = new Date(new Date(end).setDate(end.getDate() - 30))
  return { start, end }
}

function createInitialCampaign(
  searchParams: URLSearchParams,
  campaignId: string,
  providerId: string,
): Campaign | null {
  const name = searchParams.get('campaignName')
  if (!name) return null

  return {
    id: campaignId,
    providerId,
    name,
    status: 'UNKNOWN',
    startTime: searchParams.get('campaignStartTime') ?? undefined,
    stopTime: searchParams.get('campaignStopTime') ?? undefined,
  }
}

export function useCampaignInsightsPage() {
  const params = useParams<{ providerId: string; campaignId: string }>()
  const searchParams = useMemo(
    () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
    [],
  )
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const listCampaigns = useAction(adsCampaignsApi.listCampaigns)
  const getCampaignInsights = useAction(adsCampaignInsightsApi.getCampaignInsights)

  const providerId = params.providerId
  const campaignId = params.campaignId

  const initialStart = parseIsoDateOnly(searchParams.get('startDate'))
  const initialEnd = parseIsoDateOnly(searchParams.get('endDate'))

  const campaignStartFromUrl = parseIsoDateTime(searchParams.get('campaignStartTime'))
  const campaignStopFromUrl = parseIsoDateTime(searchParams.get('campaignStopTime'))

  const dateRangeTouchedRef = useRef(false)

  const [state, dispatch] = useReducer(campaignInsightsPageReducer, {
    dateRange: createInitialDateRange(
      searchParams,
      campaignStartFromUrl,
      campaignStopFromUrl,
      initialStart,
      initialEnd,
    ),
    campaignLoading: false,
    campaignError: null,
    campaign: createInitialCampaign(searchParams, campaignId, providerId),
    insightsLoading: false,
    insightsError: null,
    insights: null,
  })

  const {
    dateRange,
    campaignLoading,
    campaignError,
    campaign,
    insightsLoading,
    insightsError,
    insights,
  } = state

  const handleDateRangeChange = useCallback((next: DateRange) => {
    dateRangeTouchedRef.current = true
    dispatch({ type: 'setDateRange', value: next })
  }, [])

  const formulaEditor = useFormulaEditor({ isPreviewMode })

  useEffect(() => {
    if (dateRangeTouchedRef.current) return

    const campaignStart = parseIsoDateTime(campaign?.startTime ?? null)
    const campaignStop = parseIsoDateTime(campaign?.stopTime ?? null)

    if (!campaignStart && !campaignStop) return

    const now = new Date()
    const end = campaignStop && campaignStop <= now ? campaignStop : now
    const start = campaignStart ?? new Date(new Date(end).setDate(end.getDate() - 30))

    const frameId = requestAnimationFrame(() => {
      dispatch({ type: 'setDateRange', value: clampDateRange({ start, end }) })
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [campaign?.startTime, campaign?.stopTime])

  const loadCampaign = useCallback(async () => {
    dispatch({ type: 'setCampaignLoading', value: true })
    dispatch({ type: 'setCampaignError', value: null })

    if (isPreviewMode) {
      const previewCampaigns = getPreviewCampaigns(providerId)
      const match = previewCampaigns.find((c) => c.id === campaignId) ?? previewCampaigns[0] ?? null

      if (!match) {
        dispatch({ type: 'setCampaignError', value: 'Campaign not found' })
        dispatch({ type: 'setCampaignLoading', value: false })
        return
      }

      dispatch({ type: 'setCampaign', value: match as Campaign })
      dispatch({ type: 'setCampaignLoading', value: false })
      return
    }

    if (!workspaceId) {
      dispatch({ type: 'setCampaignLoading', value: false })
      return
    }

    if (!isProviderId(providerId)) {
      dispatch({ type: 'setCampaignError', value: 'Unsupported provider' })
      dispatch({ type: 'setCampaignLoading', value: false })
      return
    }

    await listCampaigns({
      workspaceId,
      providerId,
      clientId: selectedClientId ?? null,
    })
      .then((campaigns) => {
        const normalizedCampaigns = Array.isArray(campaigns) ? (campaigns as Campaign[]) : []
        const match = normalizedCampaigns.find((c) => c.id === campaignId) ?? null

        if (!match) {
          throw new Error('Campaign not found')
        }

        dispatch({ type: 'setCampaign', value: match })
      })
      .catch((err) => {
        logError(err, 'CampaignInsights:loadCampaign')
        dispatch({ type: 'setCampaignError', value: asErrorMessage(err) })
      })
      .finally(() => {
        dispatch({ type: 'setCampaignLoading', value: false })
      })
  }, [campaignId, isPreviewMode, listCampaigns, providerId, selectedClientId, workspaceId])

  const loadInsights = useCallback(async () => {
    if (!isPreviewMode && providerId !== 'facebook') {
      dispatch({
        type: 'setInsightsError',
        value: 'Detailed insights are currently only supported for Meta (facebook).',
      })
      dispatch({ type: 'setInsights', value: null })
      return
    }

    dispatch({ type: 'setInsightsLoading', value: true })
    dispatch({ type: 'setInsightsError', value: null })

    const startDate = toIsoDateOnly(dateRange.start)
    const endDate = toIsoDateOnly(dateRange.end)

    if (isPreviewMode) {
      const previewInsights = getPreviewCampaignInsights(providerId, campaignId, startDate, endDate)
      dispatch({ type: 'setInsights', value: previewInsights as CampaignInsightsResponse })
      dispatch({ type: 'setInsightsLoading', value: false })
      return
    }

    if (!workspaceId) {
      dispatch({ type: 'setInsightsLoading', value: false })
      return
    }

    if (!isProviderId(providerId)) {
      dispatch({ type: 'setInsightsError', value: 'Unsupported provider' })
      dispatch({ type: 'setInsightsLoading', value: false })
      return
    }

    await getCampaignInsights({
      workspaceId,
      providerId,
      campaignId,
      clientId: selectedClientId ?? null,
      startDate,
      endDate,
    })
      .then((rawData) => {
        const data = rawData as CampaignInsightsResponse
        dispatch({ type: 'setInsights', value: data })

        if (data.currency) {
          dispatch({
            type: 'patchCampaign',
            updater: (prev) => {
              if (!prev || (prev.currency && prev.currency !== 'USD')) {
                return prev
              }
              return { ...prev, currency: data.currency }
            },
          })
        }
      })
      .catch((err) => {
        logError(err, 'CampaignInsights:loadInsights')
        dispatch({ type: 'setInsightsError', value: asErrorMessage(err) })
        dispatch({ type: 'setInsights', value: null })
      })
      .finally(() => {
        dispatch({ type: 'setInsightsLoading', value: false })
      })
  }, [campaignId, dateRange, getCampaignInsights, isPreviewMode, providerId, selectedClientId, workspaceId])

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      void loadCampaign()
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [loadCampaign])

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      void loadInsights()
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [loadInsights])

  const chartMetrics = useMemo(() => {
    const series = insights?.series ?? []
    return series.map((row) => ({
      date: row.date,
      spend: row.spend,
      revenue: row.revenue,
    }))
  }, [insights?.series])

  const calculatedMetrics = useMemo(() => {
    const totals = insights?.totals
    if (!totals) return null

    const { spend, impressions, clicks, conversions, revenue } = totals

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spend / clicks : 0
    const cpa = conversions > 0 ? spend / conversions : 0
    const roas = spend > 0 ? revenue / spend : 0
    const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0

    return {
      spend,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr,
      cpc,
      cpa,
      roas,
      convRate,
      reach: insights?.totals?.reach ?? undefined,
      days: insights?.series.length || 0,
    }
  }, [insights?.totals, insights?.series])

  const engagementChartData = useMemo(() => {
    const series = insights?.series ?? []
    return series.map((row) => {
      const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0
      return {
        date: row.date,
        dateFormatted: new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        clicks: row.clicks,
        impressions: row.impressions,
        ctr,
      }
    })
  }, [insights?.series])

  const conversionsChartData = useMemo(() => {
    const series = insights?.series ?? []
    return series.map((row) => ({
      date: row.date,
      dateFormatted: new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      conversions: row.conversions,
      revenue: row.revenue,
      cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
      cpa: row.conversions > 0 ? row.spend / row.conversions : 0,
    }))
  }, [insights?.series])

  const reachChartData = useMemo(() => {
    const series = insights?.series ?? []
    const hasReach = series.some((row) => row.reach !== null && row.reach !== undefined)
    if (!hasReach) return undefined

    return series.map((row) => ({
      date: row.date,
      dateFormatted: new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      reach: row.reach || 0,
      impressions: row.impressions,
    }))
  }, [insights?.series])

  const efficiencyScore = useMemo(() => {
    if (!calculatedMetrics) return null
    const summary = {
      providerId: campaign?.providerId || 'unknown',
      totalSpend: calculatedMetrics.spend,
      totalRevenue: calculatedMetrics.revenue,
      totalClicks: calculatedMetrics.clicks,
      totalConversions: calculatedMetrics.conversions,
      totalImpressions: calculatedMetrics.impressions,
      averageRoaS: calculatedMetrics.roas,
      averageCpc: calculatedMetrics.cpc,
      averageCtr: calculatedMetrics.ctr || 0,
      averageConvRate:
        calculatedMetrics.convRate ||
        (calculatedMetrics.clicks > 0
          ? (calculatedMetrics.conversions / calculatedMetrics.clicks) * 100
          : 0),
      period: 'current',
      dayCount: insights?.series?.length || 0,
    }
    return calculateEfficiencyScore(summary)
  }, [calculatedMetrics, campaign?.providerId, insights?.series])

  const algorithmicInsightsList = useMemo(() => {
    if (!calculatedMetrics) return []
    const summary = {
      providerId: campaign?.providerId || 'unknown',
      totalSpend: calculatedMetrics.spend,
      totalRevenue: calculatedMetrics.revenue,
      totalClicks: calculatedMetrics.clicks,
      totalConversions: calculatedMetrics.conversions,
      totalImpressions: calculatedMetrics.impressions,
      averageRoaS: calculatedMetrics.roas,
      averageCpc: calculatedMetrics.cpc,
      averageCtr: calculatedMetrics.ctr || 0,
      averageConvRate:
        calculatedMetrics.convRate ||
        (calculatedMetrics.clicks > 0
          ? (calculatedMetrics.conversions / calculatedMetrics.clicks) * 100
          : 0),
      period: 'current',
      dayCount: insights?.series?.length || 0,
    }
    return calculateAlgorithmicInsights(summary)
  }, [calculatedMetrics, campaign?.providerId, insights?.series])

  const displayCurrency = useMemo(
    () => normalizeCurrencyCode(insights?.currency ?? campaign?.currency),
    [campaign?.currency, insights?.currency],
  )

  const handleRetryCampaign = useCallback(() => {
    void loadCampaign()
  }, [loadCampaign])

  const handleRetryInsights = useCallback(() => {
    void loadInsights()
  }, [loadInsights])

  return {
    providerId,
    campaignId,
    isPreviewMode,
    selectedClientId,
    dateRange,
    campaignLoading,
    campaignError,
    campaign,
    insightsLoading,
    insightsError,
    formulaEditor,
    calculatedMetrics,
    chartMetrics,
    engagementChartData,
    conversionsChartData,
    reachChartData,
    efficiencyScore,
    algorithmicInsightsList,
    displayCurrency,
    handleDateRangeChange,
    loadInsights,
    loadCampaign,
    handleRetryCampaign,
    handleRetryInsights,
  }
}

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
  calculatedMetrics: ReturnType<typeof useCampaignInsightsPage>['calculatedMetrics']
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
  algorithmicInsightsList: ReturnType<typeof calculateAlgorithmicInsights>
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
  formulaEditor,
  calculatedMetrics,
  insightsLoading,
}: {
  formulaEditor: ReturnType<typeof useFormulaEditor>
  calculatedMetrics: ReturnType<typeof useCampaignInsightsPage>['calculatedMetrics']
  insightsLoading: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <FormulaBuilderCard
        formulaEditor={formulaEditor}
        metricTotals={calculatedMetrics ?? undefined}
        loading={insightsLoading}
      />
    </div>
  )
}

export function CampaignInsightsPageBody({
  page,
}: {
  page: ReturnType<typeof useCampaignInsightsPage>
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
