import { action } from './_generated/server'
import { v } from 'convex/values'

import { runDerivedMetricsPipeline } from '@/lib/metrics'
import { Errors, withErrorHandling } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

export type NormalizedAdMetric = {
  providerId: string
  adId: string
  adGroupId?: string
  campaignId: string
  name?: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  ctr?: number
  cpc?: number
  roas?: number
  reach?: number
}

function normalizeGoogleMetrics(metrics: any[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'google',
      adId: m.adId,
      adGroupId: m.adGroupId,
      campaignId: m.campaignId,
      name: m.headline,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
    }
  })
}

function normalizeTikTokMetrics(metrics: any[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'tiktok',
      adId: m.adId,
      adGroupId: m.adGroupId,
      campaignId: m.campaignId,
      name: m.adName,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
    }
  })
}

function normalizeLinkedInMetrics(metrics: any[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'linkedin',
      adId: m.creativeId,
      adGroupId: m.campaignGroupId,
      campaignId: m.campaignId,
      name: undefined,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
    }
  })
}

function normalizeMetaMetrics(metrics: any[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'facebook',
      adId: m.adId,
      adGroupId: m.adSetId,
      campaignId: m.campaignId,
      name: m.adName,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
      reach: m.reach,
    }
  })
}

export const listAdMetrics = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.string()),
    adGroupId: v.optional(v.string()),
    level: v.optional(v.union(v.literal('ad'), v.literal('adGroup'), v.literal('creative'))),
    days: v.optional(v.string()),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timeframeDays = Number.parseInt(args.days ?? '7', 10) || 7
    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    let metrics: NormalizedAdMetric[] = []

    if (args.providerId === 'google') {
      const { fetchGoogleAdGroupMetrics, fetchGoogleAdMetrics } = await import('@/services/integrations/google-ads')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')
      }

      if (args.level === 'adGroup') {
        const googleMetrics = await fetchGoogleAdGroupMetrics({
          accessToken: integration.accessToken,
          developerToken,
          customerId,
          campaignId: args.campaignId,
          loginCustomerId,
          timeframeDays,
        })
        metrics = normalizeGoogleMetrics(googleMetrics)
      } else {
        const googleMetrics = await fetchGoogleAdMetrics({
          accessToken: integration.accessToken,
          developerToken,
          customerId,
          campaignId: args.campaignId,
          adGroupId: args.adGroupId,
          loginCustomerId,
          timeframeDays,
        })
        metrics = normalizeGoogleMetrics(googleMetrics)
      }
    } else if (args.providerId === 'tiktok') {
      const { fetchTikTokAdMetrics } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'TikTok credentials not configured')
      }

      const tiktokMetrics = await fetchTikTokAdMetrics({
        accessToken: integration.accessToken,
        advertiserId,
        campaignId: args.campaignId,
        timeframeDays,
      })

      metrics = normalizeTikTokMetrics(tiktokMetrics)
    } else if (args.providerId === 'linkedin') {
      const { fetchLinkedInCreativeMetrics } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId
      if (!accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn credentials not configured')
      }

      const linkedInMetrics = await fetchLinkedInCreativeMetrics({
        accessToken: integration.accessToken,
        accountId,
        campaignId: args.campaignId,
        timeframeDays,
      })

      metrics = normalizeLinkedInMetrics(linkedInMetrics)
    } else {
      const { fetchMetaAdMetrics } = await import('@/services/integrations/meta-ads')

      const adAccountId = integration.accountId
      if (!adAccountId) {
        throw Errors.integration.notConfigured('Meta', 'Meta credentials not configured')
      }

      const metaMetrics = await fetchMetaAdMetrics({
        accessToken: integration.accessToken,
        adAccountId,
        campaignId: args.campaignId,
        timeframeDays,
      })

      metrics = normalizeMetaMetrics(metaMetrics)
    }

    return {
      metrics,
      summary: {
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
        totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
        totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
        totalConversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
        totalRevenue: metrics.reduce((sum, m) => sum + m.revenue, 0),
      },
      derivedMetrics: runDerivedMetricsPipeline(metrics),
    }
  }, 'adsAdMetrics:listAdMetrics'),
})
