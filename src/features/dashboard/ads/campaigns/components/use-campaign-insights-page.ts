'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAction } from 'convex/react'
import { useParams } from 'next/navigation'

import { type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { useFormulaEditor } from '@/features/dashboard/ads/hooks/use-formula-editor'
import { normalizeCurrencyCode } from '@/constants/currencies'
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms'
import { adsCampaignInsightsApi, adsCampaignsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewCampaigns, getPreviewCampaignInsights } from '@/lib/preview-data'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useAuth } from '@/shared/contexts/auth-context'

import {
  campaignInsightsPageReducer,
  createInitialCampaign,
  createCampaignLifetimeDateRange,
  createInitialDateRange,
  isProviderId,
  parseIsoDateOnly,
  parseIsoDateTime,
  toIsoDateOnly,
} from './campaign-insights-page-state'
import type { Campaign, CampaignInsightsResponse } from './campaign-insights-page-types'

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
    const lifetimeRange = createCampaignLifetimeDateRange(campaignStart, campaignStop)

    if (!lifetimeRange) return

    const frameId = requestAnimationFrame(() => {
      dispatch({ type: 'setDateRange', value: lifetimeRange })
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
