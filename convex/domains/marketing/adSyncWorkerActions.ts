'use node'

import { action, internalAction, type ActionCtx } from '../../_generated/server'
import { internal } from '/_generated/api'
import { v } from 'convex/values'

import type { NormalizedMetric } from '@/types/integrations'
import { Errors, asErrorMessage, isAppError, withErrorHandling } from '../../errors'
import { resolveMetricCurrency } from '@/domain/ads/money'
import { normalizeSurfaceId } from '@/domain/ads/provider'
import type { CanonicalAdsProviderId } from '@/domain/ads/provider'
import { resolveTikTokAccessToken } from '../../lib/tiktokAdsAccess'
import { normalizeClientId } from '@/lib/normalizeClientId'
import { isTokenExpiringSoon } from '../../lib/isTokenExpiringSoon'

function firstEnvValue(keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = process.env[key]
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }
  return null
}

/**
 * Refresh a Google Analytics access token directly against Google's token
 * endpoint. Used inside the Convex action runtime where the admin
 * ConvexHttpClient (and thus `refreshGoogleAccessToken` from
 * `@/lib/integration-token-refresh-google`) is unavailable.
 */
async function refreshGoogleAnalyticsAccessTokenInline(options: {
  refreshToken: string
}): Promise<string> {
  const clientId = firstEnvValue(['GOOGLE_ANALYTICS_CLIENT_ID', 'GOOGLE_CLIENT_ID'])
  const clientSecret = firstEnvValue([
    'GOOGLE_ANALYTICS_CLIENT_SECRET',
    'GOOGLE_CLIENT_SECRET',
  ])
  if (!clientId || !clientSecret) {
    throw Errors.integration.notConfigured(
      'Google Analytics',
      'Google Analytics client credentials are not configured.',
    )
  }
  const tokenEndpoint =
    process.env.GOOGLE_TOKEN_ENDPOINT ?? 'https://oauth2.googleapis.com/token'
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: options.refreshToken,
  })
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!response.ok) {
    const errorPayload = await response.text().catch(() => '')
    throw Errors.integration.error(
      'Google Analytics',
      `Failed to refresh access token (${response.status}): ${errorPayload}`,
    )
  }
  const payload = (await response.json()) as { access_token?: string }
  if (!payload.access_token) {
    throw Errors.integration.error(
      'Google Analytics',
      'Token refresh response missing access_token.',
    )
  }
  return payload.access_token
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

type JobStatusUpdate = {
  workspaceId: string
  providerId: string
  clientId: string | null
  status: 'pending' | 'success' | 'error'
  message: string | null
}

async function updateJobIntegrationStatus(ctx: ActionCtx, args: JobStatusUpdate) {
  if (args.providerId === 'google-analytics') {
    await ctx.runMutation(internal.analyticsIntegrations.updateGoogleAnalyticsStatusInternal, {
      workspaceId: args.workspaceId,
      clientId: args.clientId,
      status: args.status,
      message: args.message,
    })
    return
  }

  await ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
    workspaceId: args.workspaceId,
    providerId: args.providerId,
    clientId: args.clientId,
    status: args.status,
    message: args.message,
  })
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

      if (args.providerId === 'google-analytics') {
        // NOTE: We intentionally do NOT call `syncGoogleAnalyticsMetrics` here.
        // That helper re-fetches the integration via an admin ConvexHttpClient
        // (src/lib/analytics-admin.ts), which requires CONVEX_DEPLOY_KEY env
        // vars that are NOT available inside a Convex action runtime. Doing so
        // produced "Google Analytics is not connected" even when the OAuth
        // connection was valid. Instead, mirror every other provider: use the
        // integration already fetched via ctx.runQuery and write through
        // internal mutations on ctx.
        const gaIntegration = await ctx.runQuery(
          internal.analyticsIntegrations.getGoogleAnalyticsIntegrationInternal,
          { workspaceId: args.workspaceId, clientId },
        )

        if (!gaIntegration?.accessToken) {
          throw Errors.integration.notFound('Google Analytics')
        }

        const propertyId =
          typeof gaIntegration.accountId === 'string' && gaIntegration.accountId.length > 0
            ? gaIntegration.accountId
            : null
        if (!propertyId) {
          throw Errors.integration.notConfigured(
            'Google Analytics',
            'Google Analytics property not configured. Select a property in Analytics setup before syncing.',
          )
        }

        // Refresh the access token inline if it is expiring soon, persisting
        // the new token directly via the internal mutation.
        let accessToken = gaIntegration.accessToken
        if (
          gaIntegration.refreshToken &&
          isTokenExpiringSoon(gaIntegration.accessTokenExpiresAtMs)
        ) {
          accessToken = await refreshGoogleAnalyticsAccessTokenInline({
            refreshToken: gaIntegration.refreshToken,
          })
          await ctx.runMutation(
            internal.analyticsIntegrations.updateGoogleAnalyticsCredentialsInternal,
            {
              workspaceId: args.workspaceId,
              clientId,
              accessToken,
              accessTokenExpiresAtMs: Date.now() + 60 * 60 * 1000,
            },
          )
        }

        // Resolve reporting currency, fetching from the Admin API and
        // persisting it when not already stored on the integration.
        let reportingCurrency =
          typeof gaIntegration.currency === 'string' && gaIntegration.currency.trim().length > 0
            ? gaIntegration.currency.trim().toUpperCase()
            : null
        if (!reportingCurrency) {
          const { fetchGoogleAnalyticsPropertyCurrency } = await import(
            '@/services/integrations/google-analytics/properties'
          )
          reportingCurrency = await fetchGoogleAnalyticsPropertyCurrency({ accessToken, propertyId })
          if (reportingCurrency) {
            await ctx.runMutation(
              internal.analyticsIntegrations.updateGoogleAnalyticsCredentialsInternal,
              {
                workspaceId: args.workspaceId,
                clientId,
                currency: reportingCurrency,
              },
            )
          }
        }

        const [{ runGaReport }, { fetchGoogleAnalyticsBreakdowns }] = await Promise.all([
          import('@/services/integrations/google-analytics/sync'),
          import('@/services/integrations/google-analytics/breakdown'),
        ])
        const [reportRows, breakdownRows] = await Promise.all([
          runGaReport({ accessToken, propertyId, days: args.timeframeDays }),
          fetchGoogleAnalyticsBreakdowns({ accessToken, propertyId, days: args.timeframeDays }),
        ])

        const metrics: NormalizedMetric[] = reportRows.map((row) => ({
          providerId: 'google-analytics',
          clientId,
          accountId: propertyId,
          date: row.date,
          spend: 0,
          impressions: row.totalUsers,
          clicks: row.sessions,
          conversions: row.conversions,
          revenue: row.totalRevenue,
          currency: reportingCurrency,
          currencySource: reportingCurrency ? 'integration' : 'unknown',
        }))

        await Promise.all([
          ctx.runMutation(internal.adsIntegrations.writeMetricsBatchInternal, {
            workspaceId: args.workspaceId,
            metrics: metrics.map((metric) => ({
              providerId: metric.providerId,
              clientId,
              accountId: metric.accountId ?? null,
              currency: metric.currency ?? null,
              currencySource: (reportingCurrency ? 'integration' : 'unknown') as
                | 'metric'
                | 'integration'
                | 'unknown',
              date: metric.date,
              spend: metric.spend,
              impressions: metric.impressions,
              clicks: metric.clicks,
              conversions: metric.conversions,
              revenue: metric.revenue ?? null,
            })),
          }),
          ctx.runMutation(internal.analyticsIntegrations.writeAnalyticsMetricsBatchInternal, {
            workspaceId: args.workspaceId,
            clientId,
            propertyId,
            currency: reportingCurrency ?? null,
            daily: reportRows.map((row) => ({
              propertyId,
              date: row.date,
              users: row.totalUsers,
              sessions: row.sessions,
              conversions: row.conversions,
              revenue: row.totalRevenue,
              currency: reportingCurrency ?? null,
            })),
            breakdowns: breakdownRows.map((row) => ({
              propertyId,
              date: row.date,
              dimension: row.dimension,
              dimensionValue: row.dimensionValue,
              users: row.users,
              sessions: row.sessions,
              conversions: row.conversions,
              revenue: row.revenue,
            })),
          }),
        ])

        return { metricsInserted: reportRows.length }
      }

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
          const { refreshGoogleAccessToken } = await import('@/lib/integration-token-refresh-google')
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw Errors.integration.notConfigured('Google', 'Account not configured')
          }

          // Requires GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET (or GOOGLE_CLIENT_*) on Convex.
          let googleAccessToken = integration.accessToken
          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            googleAccessToken = await refreshGoogleAccessToken({
              userId: args.workspaceId,
              clientId,
              providerId: 'google',
            })
          }

          const { fetchGoogleAdsMetrics } = await import('@/services/integrations/google-ads')
          metrics = await fetchGoogleAdsMetrics({
            accessToken: googleAccessToken,
            developerToken: integration.developerToken,
            customerId: accountId,
            loginCustomerId: integration.loginCustomerId,
            managerCustomerId: integration.managerCustomerId,
            timeframeDays: args.timeframeDays,
            refreshAccessToken: async () => {
              const refreshed = await refreshGoogleAccessToken({
                userId: args.workspaceId,
                clientId,
                providerId: 'google',
              })
              googleAccessToken = refreshed
              return refreshed
            },
          })
          break
        }
        case 'facebook': {
          const { refreshMetaAccessToken } = await import('@/lib/integration-token-refresh-meta')
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw Errors.integration.notConfigured('Meta', 'Account not configured')
          }

          let metaAccessToken = integration.accessToken
          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            metaAccessToken = await refreshMetaAccessToken({
              userId: args.workspaceId,
              clientId,
            })
          }

          const { fetchMetaAdsMetrics } = await import('@/services/integrations/meta-ads')
          metrics = await fetchMetaAdsMetrics({
            accessToken: metaAccessToken,
            adAccountId: accountId,
            timeframeDays: args.timeframeDays,
            useAsyncInsights: integration.metaUseAsyncInsights === true,
          })
          break
        }
        case 'linkedin': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            throw Errors.integration.notConfigured('LinkedIn', 'Account not configured')
          }

          const { refreshLinkedInAccessToken } = await import('@/lib/integration-token-refresh-linkedin')
          let linkedInAccessToken = integration.accessToken
          if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
            linkedInAccessToken = await refreshLinkedInAccessToken({
              userId: args.workspaceId,
              clientId,
            })
          }

          const { fetchLinkedInAdsMetrics } = await import('@/services/integrations/linkedin-ads')
          metrics = await fetchLinkedInAdsMetrics({
            accessToken: linkedInAccessToken,
            accountId,
            timeframeDays: args.timeframeDays,
            refreshAccessToken: async () => {
              const refreshed = await refreshLinkedInAccessToken({
                userId: args.workspaceId,
                clientId,
              })
              linkedInAccessToken = refreshed
              return refreshed
            },
          })
          break
        }
        case 'tiktok': {
          const advertiserId = integration.accountId
          if (typeof advertiserId !== 'string' || advertiserId.trim().length === 0) {
            throw Errors.integration.notConfigured('TikTok', 'Account not configured')
          }

          const { fetchTikTokAdsMetrics } = await import('@/services/integrations/tiktok-ads')
          const { refreshTikTokAccessToken } = await import('@/lib/integration-token-refresh')

          let tiktokAccessToken = await resolveTikTokAccessToken(args.workspaceId, integration, clientId)
          metrics = await fetchTikTokAdsMetrics({
            accessToken: tiktokAccessToken,
            advertiserId,
            timeframeDays: args.timeframeDays,
            refreshAccessToken: async () => {
              const refreshed = await refreshTikTokAccessToken({ userId: args.workspaceId, clientId })
              tiktokAccessToken = refreshed
              return refreshed
            },
          })
          break
        }
        default:
          throw Errors.validation.invalidInput(`Unsupported provider: ${args.providerId}`)
      }

      const insertResult = await ctx.runMutation(internal.adsIntegrations.writeMetricsBatchInternal, {
        workspaceId: args.workspaceId,
        metrics: metrics.map((metric) => {
          const providerId = metric.providerId as CanonicalAdsProviderId
          const resolved = resolveMetricCurrency({
            metricCurrency: metric.currency ?? null,
            integrationCurrency: integration.currency ?? null,
            providerDefaultCurrency: integration.currency ?? null,
          })

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

    const processWorkspaceJobs = async (workspaceId: string) => {
      const processNextJob = async (jobsProcessed: number): Promise<void> => {
        if (jobsProcessed >= MAX_JOBS_PER_WORKSPACE) return

        const job = await ctx.runMutation(internal.adsIntegrations.claimNextSyncJobInternal, {
          workspaceId,
        })
        if (!job) return

        const clientId = normalizeClientId(job.clientId)

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
            updateJobIntegrationStatus(ctx, {
              workspaceId,
              providerId: job.providerId,
              clientId,
              status: 'success',
              message: null,
            }),
          ])

          processed++
        } catch (err: unknown) {
          const message = asErrorMessage(err)

          await Promise.all([
            ctx.runMutation(internal.adsIntegrations.failSyncJobInternal, {
              jobId: job.id,
              message,
            }),
            updateJobIntegrationStatus(ctx, {
              workspaceId,
              providerId: job.providerId,
              clientId,
              status: 'error',
              message,
            }),
          ])

          failed++
        }

        await processNextJob(jobsProcessed + 1)
      }

      await processNextJob(0)
    }

    let workspaceChain: Promise<void> = Promise.resolve()
    for (const workspaceId of workspaceIds) {
      workspaceChain = workspaceChain.then(() => processWorkspaceJobs(workspaceId))
    }
    await workspaceChain

    return { processed, failed }
  },
})

async function processNextQueuedSyncJob(
  ctx: ActionCtx,
  workspaceId: string,
): Promise<{ synced: boolean }> {
  const job = await ctx.runMutation(internal.adsIntegrations.claimNextSyncJobInternal, {
    workspaceId,
  })

  if (!job) {
    return { synced: false }
  }

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
      updateJobIntegrationStatus(ctx, {
        workspaceId,
        providerId: job.providerId,
        clientId: normalizeClientId(job.clientId),
        status: 'success',
        message: null,
      }),
    ])

    return { synced: true }
  } catch (err: unknown) {
    // Use asErrorMessage to extract the user-friendly message from ConvexError
    // (which stores it in .data.message), rather than .message which may be
    // "[object Object]" or a JSON string for ConvexErrors constructed with
    // object data.
    const message = asErrorMessage(err)

    await Promise.all([
      ctx.runMutation(internal.adsIntegrations.failSyncJobInternal, {
        jobId: job.id,
        message,
      }),
      updateJobIntegrationStatus(ctx, {
        workspaceId,
        providerId: job.providerId,
        clientId: normalizeClientId(job.clientId),
        status: 'error',
        message,
      }),
    ])

    if (isAppError(err)) {
      throw err
    }
    throw Errors.base.internal(asErrorMessage(err))
  }
}

export const processNextQueuedSyncJobInternal = internalAction({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args): Promise<{ synced: boolean }> =>
    processNextQueuedSyncJob(ctx, args.workspaceId),
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
  handler: async (ctx, args): Promise<{ synced: boolean }> =>
    withErrorHandling(
      async () => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
          throw Errors.auth.unauthorized()
        }

        const clientId =
          typeof args.clientId === 'string' && args.clientId.trim().length > 0
            ? args.clientId.trim()
            : null

        await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
          workspaceId: args.workspaceId,
          providerId: args.providerId,
          clientId,
          jobType: 'manual-sync',
          timeframeDays: 30,
        })

        return await processNextQueuedSyncJob(ctx, args.workspaceId)
      },
      'adSyncWorkerActions:runManualSync',
    ),
})
