import { action, internalAction, internalQuery } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'
import { fetchTikTokAdsMetrics } from '@/services/integrations/tiktok-ads'
import type { NormalizedMetric } from '@/types/integrations'
import { Errors, asErrorMessage, withErrorHandling } from './errors'

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

type SyncRawPayload =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Record<string, string>
  | Record<string, number>
  | Record<string, boolean>
  | null
  | undefined

function normalizeRawPayload(value: unknown): SyncRawPayload {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'string')) return value
    if (value.every((item) => typeof item === 'number')) return value
    if (value.every((item) => typeof item === 'boolean')) return value
    return undefined
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.every(([, item]) => typeof item === 'string')) {
      return Object.fromEntries(entries) as Record<string, string>
    }
    if (entries.every(([, item]) => typeof item === 'number')) {
      return Object.fromEntries(entries) as Record<string, number>
    }
    if (entries.every(([, item]) => typeof item === 'boolean')) {
      return Object.fromEntries(entries) as Record<string, boolean>
    }
  }

  return undefined
}

export const processClaimedJob = internalAction({
  //
  args: {
    workspaceId: v.string(),
    jobId: v.id('adSyncJobs'),
    providerId: v.string(),
    clientId: v.union(v.string(), v.null()),
    timeframeDays: v.number(),
  },
  handler: async (ctx, args): Promise<{ metricsInserted: number }> =>
    withErrorHandling(async () => {

      const clientId = normalizeClientId(args.clientId)

      const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
        workspaceId: args.workspaceId,
        providerId: args.providerId,
        clientId,
      })

      if (!integration || !integration.accessToken) {
        throw Errors.integration.notFound(args.providerId)
      }

      let metrics: NormalizedMetric[] = []

      switch (args.providerId) {
        case 'google': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw Errors.integration.notConfigured('Google', 'Account not configured')
          }

          // Token refreshing in Convex is not migrated yet; for now, fail if expired.
          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integration.expired('Google')
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
            throw Errors.integration.notConfigured('Meta', 'Account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integration.expired('Meta')
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
            throw Errors.integration.notConfigured('LinkedIn', 'Account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integration.expired('LinkedIn')
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
            throw Errors.integration.notConfigured('TikTok', 'Account not configured')
          }

          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            throw Errors.integration.expired('TikTok')
          }

          metrics = await fetchTikTokAdsMetrics({
            accessToken: integration.accessToken,
            advertiserId,
            timeframeDays: args.timeframeDays,
          })
          break
        }
        default:
          throw Errors.validation.invalidInput(`Unsupported provider: ${args.providerId}`)
      }

      const insertResult = await ctx.runMutation(internal.adsIntegrations.writeMetricsBatchInternal, {
        workspaceId: args.workspaceId,
        metrics: metrics.map((metric) => ({
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
          rawPayload: normalizeRawPayload(metric.rawPayload),
        })),
      })

      return { metricsInserted: insertResult?.inserted ?? 0 }
    }, 'adSyncWorkerActions:processClaimedJob'),
})
