import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import {
  claimNextSyncJob,
  completeSyncJob,
  failSyncJob,
  getAdIntegration,
  updateIntegrationStatus,
  writeMetricsBatch,
} from '@/lib/ads-admin'
import { createApiHandler } from '@/lib/api-handler'
import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'
import { fetchTikTokAdsMetrics } from '@/services/integrations/tiktok-ads'
import { NormalizedMetric, SyncJob } from '@/types/integrations'
import {
  IntegrationTokenError,
  isTokenExpiringSoon,
  refreshGoogleAccessToken,
  refreshMetaAccessToken,
  refreshTikTokAccessToken,
  refreshLinkedInAccessToken,
} from '@/lib/integration-token-refresh'
import { ValidationError, NotFoundError, ApiError } from '@/lib/api-errors'
import { processWorkspaceAlerts } from '@/lib/alerts'
import { logger } from '@/lib/logger'

// Convex client for user lookup
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

const processSchema = z.object({
  userId: z.string().optional(),
})

const processQuerySchema = z.object({
  userId: z.string().optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: processSchema,
    querySchema: processQuerySchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body, query }) => {
    let resolvedUserId: string | null = null
    let activeJob: SyncJob | null = null
    let jobFailed = false

    try {
      let targetUserId = body.userId || query.userId || null

      if (!auth.isCron) {
        targetUserId = auth.uid ?? null
      }

      if (!targetUserId) {
        throw new ValidationError('Missing userId')
      }

      resolvedUserId = targetUserId

      const job = await claimNextSyncJob({ userId: targetUserId })

      if (!job) {
        throw new NotFoundError('No queued jobs available')
      }

      activeJob = job

      const clientId = typeof job.clientId === 'string' && job.clientId.trim().length > 0
        ? job.clientId.trim()
        : null

      const integration = await getAdIntegration({ userId: targetUserId, providerId: job.providerId, clientId })

      if (!integration || !integration.accessToken) {
        await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'Integration or access token not found' })
        // If the integration document was deleted (disconnect), avoid throwing from a status update.
        if (integration) {
          await updateIntegrationStatus({
            userId: targetUserId,
            providerId: job.providerId,
            clientId,
            status: 'error',
            message: 'Missing credentials',
          })
        }
        throw new ValidationError('Integration credentials missing')
      }

      let metrics: NormalizedMetric[] = []

      switch (job.providerId) {
        case 'google': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'Google Ads account not configured. Please reconnect your Google Ads integration.' })
            await updateIntegrationStatus({
              userId: targetUserId,
              providerId: job.providerId,
              clientId,
              status: 'error',
              message: 'Account ID missing. Please reconnect integration.',
            })
            return { jobId: job.id, providerId: job.providerId, metricsCount: 0, skipped: true, reason: 'missing_account_id' }
          }

          const loginCustomerId = typeof integration.loginCustomerId === 'string' && integration.loginCustomerId.length > 0
            ? integration.loginCustomerId
            : null
          const managerCustomerId = typeof integration.managerCustomerId === 'string' && integration.managerCustomerId.length > 0
            ? integration.managerCustomerId
            : null

          let googleAccessToken = integration.accessToken
          if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
            googleAccessToken = await refreshGoogleAccessToken({ userId: targetUserId, clientId })
          }

          metrics = await fetchGoogleAdsMetrics({
            accessToken: googleAccessToken,
            developerToken: integration.developerToken,
            customerId: accountId,
            loginCustomerId,
            managerCustomerId,
            timeframeDays: job.timeframeDays,
            refreshAccessToken: async () => {
              const refreshed = await refreshGoogleAccessToken({ userId: targetUserId, clientId })
              googleAccessToken = refreshed
              return refreshed
            },
          })
          break
        }
        case 'facebook': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            // Missing accountId - fail job gracefully and mark integration for reconfiguration
            await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'Meta Ads account not configured. Please reconnect your Meta Ads integration and select an ad account.' })
            await updateIntegrationStatus({
              userId: targetUserId,
              providerId: job.providerId,
              clientId,
              status: 'error',
              message: 'Account ID missing. Please reconnect integration.',
            })
            return { jobId: job.id, providerId: job.providerId, metricsCount: 0, skipped: true, reason: 'missing_account_id' }
          }

          let metaAccessToken = integration.accessToken
          if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
            metaAccessToken = await refreshMetaAccessToken({ userId: targetUserId, clientId })
          }

          metrics = await fetchMetaAdsMetrics({
            accessToken: metaAccessToken,
            adAccountId: accountId,
            timeframeDays: job.timeframeDays,
            refreshAccessToken: async () => {
              const refreshed = await refreshMetaAccessToken({ userId: targetUserId, clientId })
              metaAccessToken = refreshed
              return refreshed
            },
          })
          break
        }
        case 'linkedin': {
          const accountId = integration.accountId
          if (typeof accountId !== 'string' || accountId.trim().length === 0) {
            await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'LinkedIn Ads account not configured. Please reconnect your LinkedIn Ads integration.' })
            await updateIntegrationStatus({
              userId: targetUserId,
              providerId: job.providerId,
              clientId,
              status: 'error',
              message: 'Account ID missing. Please reconnect integration.',
            })
            return { jobId: job.id, providerId: job.providerId, metricsCount: 0, skipped: true, reason: 'missing_account_id' }
          }

          // LinkedIn tokens expire after 60 days but support refresh tokens
          // Use a 1-day buffer for pre-emptive refresh to avoid sync failures
          const LINKEDIN_REFRESH_BUFFER_MS = 24 * 60 * 60 * 1000 // 1 day
          let linkedInAccessToken = integration.accessToken

          if (isTokenExpiringSoon(integration.accessTokenExpiresAt, LINKEDIN_REFRESH_BUFFER_MS)) {
            linkedInAccessToken = await refreshLinkedInAccessToken({ userId: targetUserId, clientId })
          }

          metrics = await fetchLinkedInAdsMetrics({
            accessToken: linkedInAccessToken,
            accountId,
            timeframeDays: job.timeframeDays,
            maxRetries: 3,
            refreshAccessToken: async () => {
              const refreshed = await refreshLinkedInAccessToken({ userId: targetUserId, clientId })
              linkedInAccessToken = refreshed
              return refreshed
            },
          })
          break
        }
        case 'tiktok': {
          const advertiserId = integration.accountId
          if (typeof advertiserId !== 'string' || advertiserId.trim().length === 0) {
            await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'TikTok Ads account not configured. Please reconnect your TikTok Ads integration.' })
            await updateIntegrationStatus({
              userId: targetUserId,
              providerId: job.providerId,
              clientId,
              status: 'error',
              message: 'Account ID missing. Please reconnect integration.',
            })
            return { jobId: job.id, providerId: job.providerId, metricsCount: 0, skipped: true, reason: 'missing_account_id' }
          }

          let tiktokAccessToken = integration.accessToken
          if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
            tiktokAccessToken = await refreshTikTokAccessToken({ userId: targetUserId, clientId })
          }

          metrics = await fetchTikTokAdsMetrics({
            accessToken: tiktokAccessToken,
            advertiserId,
            timeframeDays: job.timeframeDays,
            refreshAccessToken: async () => {
              const refreshed = await refreshTikTokAccessToken({ userId: targetUserId, clientId })
              tiktokAccessToken = refreshed
              return refreshed
            },
          })

          break
        }
        default: {
          await failSyncJob({ userId: targetUserId, jobId: job.id, message: `Unsupported provider: ${job.providerId}` })
          throw new ValidationError(`Unsupported provider ${job.providerId}`)
        }
      }

      await writeMetricsBatch({ userId: targetUserId, clientId, metrics })
      await completeSyncJob({ userId: targetUserId, jobId: job.id })
      await updateIntegrationStatus({ userId: targetUserId, providerId: job.providerId, clientId, status: 'success', message: null })

      // Trigger alert evaluation after successful sync if it's for a specific client/workspace
      if (clientId) {
        try {
          const convex = getConvexClient()
          let recipientEmail: string | null = null

          if (convex) {
            try {
              const userResult = await convex.query(api.users.getByLegacyId, { legacyId: targetUserId })
              recipientEmail = userResult?.email ?? null
            } catch (queryError) {
              logger.error('[integrations/process] failed to fetch recipient email', queryError, {
                userId: targetUserId,
                requestId: req.headers.get('x-request-id'),
              })
            }
          }

          if (recipientEmail) {
            await processWorkspaceAlerts({
              userId: targetUserId,
              workspaceId: clientId,
              recipientEmail,
            })
          }
        } catch (alertError) {
          logger.error('[integrations/process] alert evaluation background failed', alertError, {
            userId: targetUserId,
            requestId: req.headers.get('x-request-id'),
          })
        }
      }

      return { jobId: job.id, providerId: job.providerId, metricsCount: metrics.length }
    } catch (error: unknown) {
      logger.error('[integrations/process] error', error, {
        requestId: req.headers.get('x-request-id'),
        userId: resolvedUserId,
        jobId: activeJob?.id,
      })

      if (error instanceof IntegrationTokenError) {
        const { userId, providerId, message } = error
        if (resolvedUserId && activeJob && !jobFailed) {
          await failSyncJob({ userId: resolvedUserId, jobId: activeJob.id, message: message ?? 'Token refresh failed' })
          jobFailed = true
        }
        if (userId && providerId) {
          await updateIntegrationStatus({ userId, providerId, clientId: activeJob?.clientId ?? null, status: 'error', message: message ?? 'Token refresh failed' })
        }
        throw new ValidationError(message ?? 'Token refresh failed')
      }

      const { userId, jobId, providerId, message } = extractSyncErrorDetails(error)

      if (userId && jobId) {
        await failSyncJob({ userId, jobId, message: message ?? 'Unknown error' })
        jobFailed = true
      }

      if (userId && providerId) {
        await updateIntegrationStatus({ userId, providerId, clientId: activeJob?.clientId ?? null, status: 'error', message: message ?? 'Sync failed' })
      }

      if (resolvedUserId && activeJob && !jobFailed) {
        await failSyncJob({ userId: resolvedUserId, jobId: activeJob.id, message: message ?? 'Unknown error' })
        jobFailed = true
        await updateIntegrationStatus({ userId: resolvedUserId, providerId: activeJob.providerId, clientId: activeJob.clientId ?? null, status: 'error', message: message ?? 'Sync failed' })
      }

      throw new ApiError(message ?? 'Failed to process sync job', 500)
    }
  })

interface SyncJobErrorLike {
  message?: string
  userId?: string
  jobId?: string
  providerId?: string
}

function extractSyncErrorDetails(error: unknown): SyncJobErrorLike {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as SyncJobErrorLike
    return {
      message: typeof candidate.message === 'string' ? candidate.message : undefined,
      userId: typeof candidate.userId === 'string' ? candidate.userId : undefined,
      jobId: typeof candidate.jobId === 'string' ? candidate.jobId : undefined,
      providerId: typeof candidate.providerId === 'string' ? candidate.providerId : undefined,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return {}
}
