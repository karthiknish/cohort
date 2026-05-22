import { googleAdsSearch, normalizeCost } from './client'
import { calculateGoogleAdsInsights } from './insights'
import type { GoogleAdsRawMetrics } from './insights'
import type { PlatformInsightResult } from '../shared/insights-types'

export type GoogleCampaignInsightsSeriesRow = {
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  reach: number | null
}

export type GoogleCampaignInsightsResult = {
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
  series: GoogleCampaignInsightsSeriesRow[]
  insights: PlatformInsightResult
  currency: string
}

export function buildGoogleCampaignInsightsGaql(options: {
  campaignId: string
  startDate: string
  endDate: string
}): string {
  const campaignId = options.campaignId.replace(/[^0-9]/g, '')
  return `
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${options.startDate}' AND '${options.endDate}'
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mapSearchRowToSeriesRow(row: {
  segments?: { date?: string }
  metrics?: Record<string, unknown>
}): GoogleCampaignInsightsSeriesRow | null {
  const date = row.segments?.date
  if (typeof date !== 'string' || date.length === 0) return null

  const metricsBlock = row.metrics ?? {}
  const costMicros = metricsBlock.costMicros ?? metricsBlock.cost_micros
  const spend = normalizeCost(costMicros as string | number | null | undefined)
  const impressions = Number(metricsBlock.impressions) || 0
  const clicks = Number(metricsBlock.clicks) || 0
  const conversions = Number(metricsBlock.conversions) || 0
  const convValue = metricsBlock.conversionsValue ?? metricsBlock.conversions_value
  const revenue = typeof convValue === 'number' ? convValue : parseFloat(String(convValue)) || 0

  return {
    date,
    spend,
    impressions,
    clicks,
    conversions,
    revenue: revenue > 0 ? revenue : 0,
    reach: null,
  }
}

export async function fetchGoogleCampaignInsights(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  startDate: string
  endDate: string
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  currency?: string | null
  refreshAccessToken?: () => Promise<string>
}): Promise<GoogleCampaignInsightsResult> {
  const effectiveLoginCustomerId = options.loginCustomerId ?? options.managerCustomerId ?? null
  const query = buildGoogleCampaignInsightsGaql({
    campaignId: options.campaignId,
    startDate: options.startDate,
    endDate: options.endDate,
  })

  let activeAccessToken = options.accessToken
  let tokenRefreshAttempted = false

  const rows = await googleAdsSearch({
    accessToken: activeAccessToken,
    developerToken: options.developerToken,
    customerId: options.customerId,
    loginCustomerId: effectiveLoginCustomerId,
    query,
    pageSize: 1000,
    maxPages: 10,
    onAuthError: async () => {
      if (options.refreshAccessToken && !tokenRefreshAttempted) {
        tokenRefreshAttempted = true
        activeAccessToken = await options.refreshAccessToken()
        return { retry: true, newToken: activeAccessToken }
      }
      return { retry: false }
    },
  })

  const series = rows
    .flatMap((row) => { const value = mapSearchRowToSeriesRow(row); return value ? [value] : [] })
    .sort((a, b) => a.date.localeCompare(b.date))

  const totals = series.reduce(
    (acc, row) => {
      acc.spend += row.spend
      acc.impressions += row.impressions
      acc.clicks += row.clicks
      acc.conversions += row.conversions
      acc.revenue += row.revenue
      return acc
    },
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, reach: null as number | null },
  )

  const rawMetrics: GoogleAdsRawMetrics = {
    impressions: totals.impressions,
    clicks: totals.clicks,
    spend: totals.spend,
    conversions: totals.conversions,
    revenue: totals.revenue,
  }

  return {
    campaignId: options.campaignId,
    startDate: options.startDate,
    endDate: options.endDate,
    totals,
    series,
    insights: calculateGoogleAdsInsights(rawMetrics),
    currency: options.currency?.trim() || 'USD',
  }
}
