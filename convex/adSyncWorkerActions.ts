import { action } from './_generated/server'
import { v } from 'convex/values'

import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'
import { fetchTikTokAdsMetrics } from '@/services/integrations/tiktok-ads'

function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

export const processClaimedJob = action({
  //
  args: {
    workspaceId: v.string(),
    jobId: v.id('adSyncJobs'),
    providerId: v.string(),
    clientId: v.union(v.string(), v.null()),
    timeframeDays: v.number(),
    cronKey: v.string(),
  },
  handler: async (ctx, args) => {
    const cronSecret = process.env.INTEGRATIONS_CRON_SECRET
    if (!cronSecret) {
      throw new Error('INTEGRATIONS_CRON_SECRET is not configured')
    }

    if (args.cronKey !== cronSecret) {
      throw new Error('Unauthorized')
    }

    const clientId = normalizeClientId(args.clientId)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration || !integration.accessToken) {
      throw new Error('Integration or access token not found')
    }

    let metrics: any[] = []

    try {
      switch (args.providerId) {
        case 'google': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw new Error('Google Ads account not configured')
          }

          // Token refreshing in Convex is not migrated yet; for now, fail if expired.
          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw new Error('Google Ads token expired; reconnect integration')
          }

          metrics = await fetchGoogleAdsMetrics({
            accessToken: integration.accessToken,
            developerToken: integration.developerToken,
            customerId: accountId,
            loginCustomerId: integration.loginCustomerId,
            managerCustomerId: integration.managerCustomerId,
            timeframeDays: args.timeframeDays,
          })
          break
        }
        case 'facebook': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw new Error('Meta Ads account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw new Error('Meta token expired; reconnect integration')
          }

          metrics = await fetchMetaAdsMetrics({
            accessToken: integration.accessToken,
            adAccountId: accountId,
            timeframeDays: args.timeframeDays,
          })
          break
        }
        case 'linkedin': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw new Error('LinkedIn Ads account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw new Error('LinkedIn token expired; reconnect integration')
          }

          metrics = await fetchLinkedInAdsMetrics({
            accessToken: integration.accessToken,
            accountId,
            timeframeDays: args.timeframeDays,
          })
          break
        }
        case 'tiktok': {
          const advertiserId = integration.accountId
          if (typeof advertiserId !== 'string' || advertiserId.trim().length === 0) {
            throw new Error('TikTok Ads account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw new Error('TikTok token expired; reconnect integration')
          }

          metrics = await fetchTikTokAdsMetrics({
            accessToken: integration.accessToken,
            advertiserId,
            timeframeDays: args.timeframeDays,
          })
          break
        }
        default:
          throw new Error(`Unsupported provider: ${args.providerId}`)
      }
    } catch (err) {
      throw new Error(asErrorMessage(err))
    }

    const insertResult = await ctx.runMutation('adsIntegrations:writeMetricsBatch' as any, {
      workspaceId: args.workspaceId,
      cronKey: args.cronKey,
      metrics: metrics.map((metric: any) => ({
        providerId: metric.providerId,
        clientId,
        accountId: metric.accountId ?? null,
        date: metric.date,
        spend: metric.spend,
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
        revenue: metric.revenue ?? null,
        campaignId: metric.campaignId,
        campaignName: metric.campaignName,
        creatives: metric.creatives,
        rawPayload: metric.rawPayload,
      })),
    })

    return { metricsInserted: insertResult?.inserted ?? 0 }
  },
})
