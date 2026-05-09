import { action, internalAction } from './_generated/server'
import { internal } from '/_generated/api'
import { v } from 'convex/values'

import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'
import { fetchTikTokAdsMetrics } from '@/services/integrations/tiktok-ads'
import type { NormalizedMetric } from '@/types/integrations'
import { Errors, withErrorHandling } from './errors'
import { resolveMetricCurrency } from '@/domain/ads/money'
import { normalizeSurfaceId } from '@/domain/ads/provider'
import type { CanonicalAdsProviderId } from '@/domain/ads/provider'

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
        metrics: metrics.map((metric) => {
          // Stamp currency at write time so read-time joins are not required.
          // Priority: currency on the metric row (e.g. account_currency from Meta Insights)
          // > integration-level account currency > unknown.
          const providerId = metric.providerId as CanonicalAdsProviderId
          const resolved = resolveMetricCurrency({
            metricCurrency: metric.currency ?? null,
            integrationCurrency: integration.currency ?? null,
            providerDefaultCurrency: integration.currency ?? null,
          })

          // Canonical surface id derived from publisherPlatform (primarily Meta breakdowns).
          const surfaceId = normalizeSurfaceId(providerId, metric.publisherPlatform ?? null)

          return {
            providerId: metric.providerId,
            clientId,
            accountId: metric.accountId ?? null,
            surfaceId,
            publisherPlatform: metric.publisherPlatform ?? null,
            currency: resolved.currency,
            currencySource: resolved.source,
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
          }
        }),
      })

      // Self-heal: if the integration has no currency stamped yet, derive it from
      // the first metric row that carries a per-row currency (e.g. Meta account_currency).
      // This ensures the read-time fallback in listMetricsWithSummaryV2 works for any
      // existing null-currency rows that haven't been re-synced yet.
      if (!integration.currency) {
        const derivedCurrency = metrics.find((m) => m.currency)?.currency ?? null
        if (derivedCurrency) {
          await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
            workspaceId: args.workspaceId,
            providerId: args.providerId,
            clientId,
            currency: derivedCurrency,
          })
        }
      }

      return { metricsInserted: insertResult?.inserted ?? 0 }
    }, 'adSyncWorkerActions:processClaimedJob'),
})

// =============================================================================
// CRON-DRIVEN PROCESSOR
// =============================================================================

/**
 * Processes all queued sync jobs across every workspace.
 * Registered as a Convex cron so the external HTTP worker is not required.
 */
export const processAllQueuedJobs = internalAction({
  handler: async (ctx): Promise<{ processed: number; failed: number }> => {
    const workspaceIds = await ctx.runQuery(
      internal.adsIntegrations.listWorkspacesWithQueuedJobsInternal
    )

    let processed = 0
    let failed = 0
    const MAX_JOBS_PER_WORKSPACE = 5

    for (const workspaceId of workspaceIds) {
      for (let i = 0; i < MAX_JOBS_PER_WORKSPACE; i++) {
        const job = await ctx.runMutation(
          internal.adsIntegrations.claimNextSyncJobInternal,
          { workspaceId }
        )
        if (!job) break

        try {
          await ctx.runAction(internal.adSyncWorkerActions.processClaimedJob, {
            workspaceId,
            jobId: job.id,
            providerId: job.providerId,
            clientId: job.clientId,
            timeframeDays: job.timeframeDays,
          })

          await Promise.all([
            ctx.runMutation(internal.adsIntegrations.completeSyncJobInternal, {
              jobId: job.id,
            }),
            ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
              workspaceId,
              providerId: job.providerId,
              clientId: job.clientId,
              status: 'success',
              message: null,
            }),
          ])

          processed++
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error'

          await Promise.all([
            ctx.runMutation(internal.adsIntegrations.failSyncJobInternal, {
              jobId: job.id,
              message,
            }),
            ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
              workspaceId,
              providerId: job.providerId,
              clientId: job.clientId,
              status: 'error',
              message,
            }),
          ])

          failed++
        }
      }
    }

    return { processed, failed }
  },
})

// =============================================================================
// MANUAL SYNC ACTION (UI-callable)
// =============================================================================

/**
 * Queues and immediately processes a manual sync for the given provider.
 * Called from the UI when a user triggers a manual refresh.
 */
export const runManualSync = action({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ synced: boolean }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Authentication required')
    }

    const clientId =
      typeof args.clientId === 'string' && args.clientId.trim().length > 0
        ? args.clientId.trim()
        : null

    // Queue a fresh manual-sync job.
    await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
      jobType: 'manual-sync',
      timeframeDays: 30,
    })

    // Claim and process the job immediately.
    const job = await ctx.runMutation(
      internal.adsIntegrations.claimNextSyncJobInternal,
      { workspaceId: args.workspaceId }
    )

    if (!job) {
      // Another worker claimed it; it will be processed by the cron.
      return { synced: false }
    }

    try {
      await ctx.runAction(internal.adSyncWorkerActions.processClaimedJob, {
        workspaceId: args.workspaceId,
        jobId: job.id,
        providerId: job.providerId,
        clientId: job.clientId,
        timeframeDays: job.timeframeDays,
      })

      await Promise.all([
        ctx.runMutation(internal.adsIntegrations.completeSyncJobInternal, {
          jobId: job.id,
        }),
        ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
          workspaceId: args.workspaceId,
          providerId: job.providerId,
          clientId: job.clientId,
          status: 'success',
          message: null,
        }),
      ])

      return { synced: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'

      await Promise.all([
        ctx.runMutation(internal.adsIntegrations.failSyncJobInternal, {
          jobId: job.id,
          message,
        }),
        ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
          workspaceId: args.workspaceId,
          providerId: job.providerId,
          clientId: job.clientId,
          status: 'error',
          message,
        }),
      ])

      throw err
    }
  },
})
