'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import { useParams } from 'next/navigation'

import { type DateRange } from '@/app/dashboard/ads/components/date-range-picker'
import { Card, CardContent } from '@/components/ui/card'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { useAuth } from '@/contexts/auth-context'
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
import { FormulaBuilderCard } from '@/app/dashboard/ads/components/formula-builder-card'
import { useFormulaEditor } from '@/app/dashboard/ads/hooks/use-formula-editor'

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

  const [dateRangeTouched, setDateRangeTouched] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // 1. PRIORITIZE campaign start/stop times if available (show full campaign duration by default)
    if (campaignStartFromUrl || campaignStopFromUrl) {
      const now = new Date()
      // If campaign has ended, use the stop date; otherwise use today
      const end = campaignStopFromUrl && campaignStopFromUrl <= now ? campaignStopFromUrl : now
      // Always prefer campaign start if available
      const start = campaignStartFromUrl ?? new Date(new Date(end).setDate(end.getDate() - 30))
      return clampDateRange({ start, end })
    }

    // 2. Fall back to explicit startDate/endDate from URL if no campaign times
    if (initialStart || initialEnd) {
      const end = initialEnd ?? (initialStart ? new Date(new Date(initialStart).setDate(initialStart.getDate() + 6)) : new Date())
      const start = initialStart ?? new Date(new Date(end).setDate(end.getDate() - 6))
      return clampDateRange({ start, end })
    }

    // 3. Default to last 30 days from "now"
    const end = new Date()
    const start = new Date(new Date(end).setDate(end.getDate() - 30))
    return { start, end }
  })

  const handleDateRangeChange = useCallback((next: DateRange) => {
    setDateRangeTouched(true)
    setDateRange(next)
  }, [])

  const [campaignLoading, setCampaignLoading] = useState(false)
  const [campaignError, setCampaignError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(() => {
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
  })

  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [insights, setInsights] = useState<CampaignInsightsResponse | null>(null)

  const formulaEditor = useFormulaEditor()

  useEffect(() => {
    // Only update if user hasn't manually changed the date range
    if (dateRangeTouched) return

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
      setDateRange(clampDateRange({ start, end }))
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [campaign?.startTime, campaign?.stopTime, dateRangeTouched])

  const loadCampaign = useCallback(async () => {
    setCampaignLoading(true)
    setCampaignError(null)

    // Use preview data when in preview mode
    if (isPreviewMode) {
      const previewCampaigns = getPreviewCampaigns(providerId)
      const match = previewCampaigns.find((c) => c.id === campaignId) ?? previewCampaigns[0] ?? null

      if (!match) {
        setCampaignError('Campaign not found')
        setCampaignLoading(false)
        return
      }

      setCampaign(match as Campaign)
      setCampaignLoading(false)
      return
    }

    if (!workspaceId) {
      setCampaignLoading(false)
      return
    }

    if (!isProviderId(providerId)) {
      setCampaignError('Unsupported provider')
      setCampaignLoading(false)
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

        setCampaign(match)
      })
      .catch((err) => {
        logError(err, 'CampaignInsights:loadCampaign')
        setCampaignError(asErrorMessage(err))
      })
      .finally(() => {
        setCampaignLoading(false)
      })
  }, [campaignId, isPreviewMode, listCampaigns, providerId, selectedClientId, workspaceId])

  const loadInsights = useCallback(async () => {
    // In preview mode, allow all providers to show preview data
    if (!isPreviewMode && providerId !== 'facebook') {
      setInsightsError('Detailed insights are currently only supported for Meta (facebook).')
      setInsights(null)
      return
    }

    setInsightsLoading(true)
    setInsightsError(null)

    const startDate = toIsoDateOnly(dateRange.start)
    const endDate = toIsoDateOnly(dateRange.end)

    // Use preview data when in preview mode
    if (isPreviewMode) {
      const previewInsights = getPreviewCampaignInsights(providerId, campaignId, startDate, endDate)
      setInsights(previewInsights as CampaignInsightsResponse)
      setInsightsLoading(false)
      return
    }

    if (!workspaceId) {
      setInsightsLoading(false)
      return
    }

    if (!isProviderId(providerId)) {
      setInsightsError('Unsupported provider')
      setInsightsLoading(false)
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
        setInsights(data)

        // Update campaign currency if we have it and it's missing or defaulting to USD
        if (data.currency && (!campaign?.currency || campaign.currency === 'USD')) {
          setCampaign((prev) => (prev ? { ...prev, currency: data.currency } : null))
        }
      })
      .catch((err) => {
        logError(err, 'CampaignInsights:loadInsights')
        setInsightsError(asErrorMessage(err))
        setInsights(null)
      })
      .finally(() => {
        setInsightsLoading(false)
      })
  }, [campaign, campaignId, dateRange, getCampaignInsights, isPreviewMode, providerId, selectedClientId, workspaceId])

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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 p-6 pb-20">
      {/* 1. Header & Controls */}
      <CampaignHeader
        campaign={campaign}
        loading={campaignLoading}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={loadInsights}
        refreshing={insightsLoading}
      />

      {campaignError && !isPreviewMode && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="flex items-center gap-3 p-4 text-sm font-bold text-red-600">
            <span>{campaignError}</span>
            <button onClick={() => void loadCampaign()} className="underline">Retry</button>
          </CardContent>
        </Card>
      )}

      {/* 2. Key Metrics Grid */}
      <MetricCardsSection
        metrics={calculatedMetrics}
        loading={insightsLoading}
        currency={insights?.currency || campaign?.currency}
        efficiencyScore={efficiencyScore}
      />

      {/* 3. Budget Control */}
      <BudgetControlSection
        key={`budget-${providerId}-${campaignId}-${campaign?.budgetType ?? 'none'}-${campaign?.budget ?? 'none'}`}
        providerId={providerId}
        campaignId={campaignId}
        clientId={selectedClientId}
        isPreviewMode={isPreviewMode}
        currency={insights?.currency || campaign?.currency}
        budget={campaign?.budget}
        budgetType={campaign?.budgetType}
        onReloadCampaign={loadCampaign}
      />

      {/* 4. Audience Control */}
      <AudienceControlSection
        providerId={providerId}
        campaignId={campaignId}
        clientId={selectedClientId}
        isPreviewMode={isPreviewMode}
      />

      {/* 5. Visualization Charts */}
      {insightsError ? (
        <Card className="border-muted/40 bg-muted/5 p-10 text-center">
          <p className="text-sm font-bold text-muted-foreground">{insightsError}</p>
        </Card>
      ) : (
        <InsightsChartsSection
          chartMetrics={chartMetrics}
          engagementChartData={engagementChartData}
          conversionsChartData={conversionsChartData}
          reachChartData={reachChartData}
          insightsLoading={insightsLoading}
          currency={insights?.currency || campaign?.currency}
        />
      )}

      {/* 6. Ads used in this campaign */}
      <CampaignAdsSection
        providerId={providerId}
        campaignId={campaignId}
        clientId={selectedClientId}
        isPreviewMode={isPreviewMode}
      />

      {/* 7. Formula Builder */}
      <div className="grid grid-cols-1 gap-6">
        <FormulaBuilderCard
          formulaEditor={formulaEditor}
          metricTotals={calculatedMetrics ?? undefined}
          loading={insightsLoading}
        />
      </div>

      {/* 8. Algorithmic Insights */}
      {!insightsLoading && !insightsError && (
        <AlgorithmicInsightsSection
          insights={algorithmicInsightsList}
          loading={insightsLoading}
          efficiencyScore={efficiencyScore ?? 0}
        />
      )}
    </div>
  )
}

export default function CampaignInsightsPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] rounded-xl border border-muted/50 bg-muted/20" aria-busy="true" />}>
      <CampaignInsightsPageContent />
    </Suspense>
  )
}
