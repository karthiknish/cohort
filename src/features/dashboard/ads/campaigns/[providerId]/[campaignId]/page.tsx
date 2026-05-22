'use client'

import { Suspense, createElement, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAction } from 'convex/react'
import { useParams } from 'next/navigation'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { normalizeCurrencyCode } from '@/constants/currencies'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useAuth } from '@/shared/contexts/auth-context'
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms'
import { getPreviewCampaigns, getPreviewCampaignInsights } from '@/lib/preview-data'
import { adsCampaignInsightsApi, adsCampaignsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'

// Modular Components
import { CampaignHeader } from '../../components/campaign-header'
import { MetricCardsSection } from '../../components/metric-cards-section'
import { InsightsChartsSection } from '../../components/insights-charts-section'
import { AlgorithmicInsightsSection } from '../../components/algorithmic-insights-section'
import { AudienceControlSection } from '../../components/audience-control-section'
import { BudgetControlSection } from '../../components/budget-control-section'
import { CampaignAdsSection } from '../../components/campaign-ads-section'
import { CampaignPageLayout, CampaignSection } from '../../components/campaign-page-shell'
import { CampaignInsightsError } from '../../components/campaign-insights-error'
import { FormulaBuilderCard } from '@/features/dashboard/ads/components/formula-builder-card'
import { useFormulaEditor } from '@/features/dashboard/ads/hooks/use-formula-editor'
import { DirectionalPageTransition, RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'

type Campaign = {
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

type CampaignInsightsResponse = {
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

const campaignInsightsSuspenseFallback = createElement('div', {
  className: 'min-h-[320px] rounded-xl border border-muted/50 bg-muted/20',
  'aria-busy': 'true',
})
const campaignInsightsRevealFallback = (
  <RevealTransitionFallback>{campaignInsightsSuspenseFallback}</RevealTransitionFallback>
)

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

  // Handle some common format variations (like missing colon in timezone offset +0530)
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
  _searchParams: URLSearchParams,
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

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
function CampaignInsightsPageContent() {
  const params = useParams<{ providerId: string; campaignId: string }>()
  const searchParams = useMemo(
    () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
    []
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
    // Only update if user hasn't manually changed the date range
    if (dateRangeTouchedRef.current) return

    const campaignStart = parseIsoDateTime(campaign?.startTime ?? null)
    const campaignStop = parseIsoDateTime(campaign?.stopTime ?? null)

    // If campaign has start/stop times, use them (this handles when campaign is loaded from API)
    if (!campaignStart && !campaignStop) return

    const now = new Date()
    // If campaign has ended, use stop date; otherwise use today
    const end = campaignStop && campaignStop <= now ? campaignStop : now
    // Always use campaign start if available
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

    // Use preview data when in preview mode
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
    // In preview mode, allow all providers to show preview data
    if (!isPreviewMode && providerId !== 'facebook') {
      dispatch({ type: 'setInsightsError', value: 'Detailed insights are currently only supported for Meta (facebook).' })
      dispatch({ type: 'setInsights', value: null })
      return
    }

    dispatch({ type: 'setInsightsLoading', value: true })
    dispatch({ type: 'setInsightsError', value: null })

    const startDate = toIsoDateOnly(dateRange.start)
    const endDate = toIsoDateOnly(dateRange.end)

    // Use preview data when in preview mode
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

        // Update campaign currency if we have it and it's missing or defaulting to USD
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
    // Only return data if reach is present in at least ONE row
    const hasReach = series.some(row => row.reach !== null && row.reach !== undefined)
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
    // Map to AdMetricsSummary expected by ad-algorithms.ts
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
      averageConvRate: calculatedMetrics.convRate || (calculatedMetrics.clicks > 0 ? (calculatedMetrics.conversions / calculatedMetrics.clicks) * 100 : 0),
      period: 'current',
      dayCount: insights?.series?.length || 0
    }
    return calculateEfficiencyScore(summary)
  }, [calculatedMetrics, campaign?.providerId, insights?.series])

  const algorithmicInsightsList = useMemo(() => {
    if (!calculatedMetrics) return []
    // Map to AdMetricsSummary expected by ad-algorithms.ts
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
      averageConvRate: calculatedMetrics.convRate || (calculatedMetrics.clicks > 0 ? (calculatedMetrics.conversions / calculatedMetrics.clicks) * 100 : 0),
      period: 'current',
      dayCount: insights?.series?.length || 0
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

  const renderPerformance = useCallback(
    () => (
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
              onRetry={handleRetryInsights}
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
    ),
    [
      calculatedMetrics,
      insightsLoading,
      displayCurrency,
      efficiencyScore,
      insightsError,
      handleRetryInsights,
      chartMetrics,
      engagementChartData,
      conversionsChartData,
      reachChartData,
      algorithmicInsightsList,
    ],
  )

  const renderControls = useCallback(
    () => (
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
          onReloadCampaign={loadCampaign}
        />
        <AudienceControlSection
          providerId={providerId}
          campaignId={campaignId}
          clientId={selectedClientId}
          isPreviewMode={isPreviewMode}
        />
      </>
    ),
    [
      providerId,
      campaignId,
      campaign?.budgetType,
      campaign?.budget,
      selectedClientId,
      isPreviewMode,
      displayCurrency,
      loadCampaign,
    ],
  )

  const renderCreatives = useCallback(
    () => (
      <CampaignAdsSection
        providerId={providerId}
        campaignId={campaignId}
        campaignObjective={campaign?.objective}
        clientId={selectedClientId}
        isPreviewMode={isPreviewMode}
        currency={displayCurrency}
      />
    ),
    [providerId, campaignId, campaign?.objective, selectedClientId, isPreviewMode, displayCurrency],
  )

  const renderAdvanced = useCallback(
    () => (
      <div className="grid grid-cols-1 gap-6">
        <FormulaBuilderCard
          formulaEditor={formulaEditor}
          metricTotals={calculatedMetrics ?? undefined}
          loading={insightsLoading}
        />
      </div>
    ),
    [formulaEditor, calculatedMetrics, insightsLoading],
  )

  return (
    <div className={ADS_PAGE_THEME.innerContainer}>
      <CampaignHeader
        campaign={campaign}
        loading={campaignLoading}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={loadInsights}
        refreshing={insightsLoading}
      />

      {campaignError && !isPreviewMode ? (
        <MotionCard className="overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/5 ring-1 ring-destructive/15">
          <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm text-destructive">
            <span className="font-medium">{campaignError}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleRetryCampaign}
            >
              Retry
            </Button>
          </CardContent>
        </MotionCard>
      ) : null}

      <CampaignPageLayout
        renderPerformance={renderPerformance}
        renderControls={renderControls}
        renderCreatives={renderCreatives}
        renderAdvanced={renderAdvanced}
      />
    </div>
  )
}

export default function CampaignInsightsPage() {
  return (
    <DirectionalPageTransition>
      <Suspense fallback={campaignInsightsRevealFallback}>
        <RevealTransition>
          <CampaignInsightsPageContent />
        </RevealTransition>
      </Suspense>
    </DirectionalPageTransition>
  )
}
