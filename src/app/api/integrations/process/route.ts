import { NextRequest, NextResponse } from 'next/server'

import {
  claimNextSyncJob,
  completeSyncJob,
  failSyncJob,
  getAdIntegration,
  updateIntegrationStatus,
  writeMetricsBatch,
} from '@/lib/firestore-integrations-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
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
} from '@/lib/integration-token-refresh'

function ensureString(value: unknown, message: string): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(message)
}

export async function POST(request: NextRequest) {
  let resolvedUserId: string | null = null
  let activeJob: SyncJob | null = null
  let jobFailed = false

  try {
    const authResult = await authenticateRequest(request)

    const contentType = request.headers.get('content-type')
    let body: { userId?: string } = {}

    if (contentType?.includes('application/json')) {
      body = await request.json()
    }

    let targetUserId = body.userId || request.nextUrl.searchParams.get('userId') || null

    if (!authResult.isCron) {
      targetUserId = authResult.uid
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    resolvedUserId = targetUserId

    const job = await claimNextSyncJob({ userId: targetUserId })

    if (!job) {
      return NextResponse.json({ message: 'No queued jobs available' }, { status: 204 })
    }

    activeJob = job

    const integration = await getAdIntegration({ userId: targetUserId, providerId: job.providerId })

    if (!integration || !integration.accessToken) {
      await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'Integration or access token not found' })
      await updateIntegrationStatus({ userId: targetUserId, providerId: job.providerId, status: 'error', message: 'Missing credentials' })
      return NextResponse.json({ error: 'Integration credentials missing' }, { status: 400 })
    }

    let metrics: NormalizedMetric[] = []

    switch (job.providerId) {
      case 'google': {
        const accountId = ensureString(
          integration.accountId,
          'Google Ads accountId must be stored on the integration'
        )
        const loginCustomerId = typeof integration.loginCustomerId === 'string' && integration.loginCustomerId.length > 0
          ? integration.loginCustomerId
          : null
        const managerCustomerId = typeof integration.managerCustomerId === 'string' && integration.managerCustomerId.length > 0
          ? integration.managerCustomerId
          : null

        let googleAccessToken = integration.accessToken
        if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
          googleAccessToken = await refreshGoogleAccessToken({ userId: targetUserId })
        }

        metrics = await fetchGoogleAdsMetrics({
          accessToken: googleAccessToken,
          developerToken: integration.developerToken,
          customerId: accountId,
          loginCustomerId,
          managerCustomerId,
          timeframeDays: job.timeframeDays,
          refreshAccessToken: async () => {
            const refreshed = await refreshGoogleAccessToken({ userId: targetUserId })
            googleAccessToken = refreshed
            return refreshed
          },
        })
        break
      }
      case 'facebook': {
        const accountId = ensureString(integration.accountId, 'Meta Ads accountId must be stored on the integration')

        let metaAccessToken = integration.accessToken
        if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
          metaAccessToken = await refreshMetaAccessToken({ userId: targetUserId })
        }

        metrics = await fetchMetaAdsMetrics({
          accessToken: metaAccessToken,
          adAccountId: accountId,
          timeframeDays: job.timeframeDays,
          refreshAccessToken: async () => {
            const refreshed = await refreshMetaAccessToken({ userId: targetUserId })
            metaAccessToken = refreshed
            return refreshed
          },
        })
        break
      }
      case 'linkedin': {
        const accountId = ensureString(integration.accountId, 'LinkedIn Ads accountId must be stored on the integration')
        metrics = await fetchLinkedInAdsMetrics({
          accessToken: integration.accessToken,
          accountId,
          timeframeDays: job.timeframeDays,
        })
        break
      }
      case 'tiktok': {
        const advertiserId = ensureString(
          integration.accountId,
          'TikTok Ads advertiserId must be stored on the integration',
        )

        let tiktokAccessToken = integration.accessToken
        if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
          tiktokAccessToken = await refreshTikTokAccessToken({ userId: targetUserId })
        }

        metrics = await fetchTikTokAdsMetrics({
          accessToken: tiktokAccessToken,
          advertiserId,
          timeframeDays: job.timeframeDays,
          refreshAccessToken: async () => {
            const refreshed = await refreshTikTokAccessToken({ userId: targetUserId })
            tiktokAccessToken = refreshed
            return refreshed
          },
        })

        break
      }
      default: {
        await failSyncJob({ userId: targetUserId, jobId: job.id, message: `Unsupported provider: ${job.providerId}` })
        return NextResponse.json({ error: `Unsupported provider ${job.providerId}` }, { status: 400 })
      }
    }

    await writeMetricsBatch({ userId: targetUserId, metrics })
    await completeSyncJob({ userId: targetUserId, jobId: job.id })
    await updateIntegrationStatus({ userId: targetUserId, providerId: job.providerId, status: 'success', message: null })

    return NextResponse.json({ jobId: job.id, providerId: job.providerId, metricsCount: metrics.length })
  } catch (error: unknown) {
    console.error('[integrations/process] error', error)

    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof IntegrationTokenError) {
      const { userId, providerId, message } = error
      if (resolvedUserId && activeJob && !jobFailed) {
        await failSyncJob({ userId: resolvedUserId, jobId: activeJob.id, message: message ?? 'Token refresh failed' })
        jobFailed = true
      }
      if (userId && providerId) {
        await updateIntegrationStatus({ userId, providerId, status: 'error', message: message ?? 'Token refresh failed' })
      }
      return NextResponse.json({ error: message ?? 'Token refresh failed' }, { status: 400 })
    }

    const { userId, jobId, providerId, message } = extractSyncErrorDetails(error)

    if (userId && jobId) {
      await failSyncJob({ userId, jobId, message: message ?? 'Unknown error' })
      jobFailed = true
    }

    if (userId && providerId) {
      await updateIntegrationStatus({ userId, providerId, status: 'error', message: message ?? 'Sync failed' })
    }

    if (resolvedUserId && activeJob && !jobFailed) {
      await failSyncJob({ userId: resolvedUserId, jobId: activeJob.id, message: message ?? 'Unknown error' })
      jobFailed = true
      await updateIntegrationStatus({ userId: resolvedUserId, providerId: activeJob.providerId, status: 'error', message: message ?? 'Sync failed' })
    }

    return NextResponse.json({ error: message ?? 'Failed to process sync job' }, { status: 500 })
  }
}

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
