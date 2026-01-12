import { action } from './_generated/server'
import { v } from 'convex/values'

import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'
import { fetchTikTokAdsMetrics } from '@/services/integrations/tiktok-ads'
import { Errors, asErrorMessage } from './errors'

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
      throw Errors.internal('INTEGRATIONS_CRON_SECRET is not configured')
    }

    if (args.cronKey !== cronSecret) {
      throw Errors.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration || !integration.accessToken) {
      throw Errors.integrationNotFound(args.providerId)
    }

    let metrics: any[] = []

    try {
      switch (args.providerId) {
        case 'google': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw Errors.integrationNotConfigured('Google', 'Account not configured')
          }

          // Token refreshing in Convex is not migrated yet; for now, fail if expired.
          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integrationExpired('Google')
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
            throw Errors.integrationNotConfigured('Meta', 'Account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integrationExpired('Meta')
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
            throw Errors.integrationNotConfigured('LinkedIn', 'Account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integrationExpired('LinkedIn')
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
            throw Errors.integrationNotConfigured('TikTok', 'Account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integrationExpired('TikTok')
          }

          metrics = await fetchTikTokAdsMetrics({
            accessToken: integration.accessToken,
            advertiserId,
            timeframeDays: args.timeframeDays,
          })
          break
        }
        default:
          throw Errors.invalidInput(`Unsupported provider: ${args.providerId}`)
      }
    } catch (err) {
      throw Errors.internal(asErrorMessage(err))
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
