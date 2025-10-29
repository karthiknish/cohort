import { NextRequest, NextResponse } from 'next/server'

import {
  claimNextSyncJob,
  completeSyncJob,
  failSyncJob,
  getAdIntegration,
  updateIntegrationStatus,
  writeMetricsBatch,
} from '@/lib/firestore-integrations'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'

function ensureString(value: unknown, message: string): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(message)
}

export async function POST(request: NextRequest) {
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

    const job = await claimNextSyncJob({ userId: targetUserId })

    if (!job) {
      return NextResponse.json({ message: 'No queued jobs available' }, { status: 204 })
    }

    const integration = await getAdIntegration({ userId: targetUserId, providerId: job.providerId })

    if (!integration || !integration.accessToken) {
      await failSyncJob({ userId: targetUserId, jobId: job.id, message: 'Integration or access token not found' })
      await updateIntegrationStatus({ userId: targetUserId, providerId: job.providerId, status: 'error', message: 'Missing credentials' })
      return NextResponse.json({ error: 'Integration credentials missing' }, { status: 400 })
    }

    let metrics = []

    switch (job.providerId) {
      case 'google': {
        const loginCustomerId = ensureString(
          integration.loginCustomerId,
          'Google Ads loginCustomerId must be stored on the integration'
        )

        metrics = await fetchGoogleAdsMetrics({
          accessToken: integration.accessToken,
          developerToken: integration.developerToken,
          loginCustomerId,
          timeframeDays: job.timeframeDays,
        })
        break
      }
      case 'facebook': {
        const accountId = ensureString(integration.accountId, 'Meta Ads accountId must be stored on the integration')
        metrics = await fetchMetaAdsMetrics({
          accessToken: integration.accessToken,
          adAccountId: accountId,
          timeframeDays: job.timeframeDays,
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
      default: {
        await failSyncJob({ userId: targetUserId, jobId: job.id, message: `Unsupported provider: ${job.providerId}` })
        return NextResponse.json({ error: `Unsupported provider ${job.providerId}` }, { status: 400 })
      }
    }

    await writeMetricsBatch({ userId: targetUserId, metrics })
    await completeSyncJob({ userId: targetUserId, jobId: job.id })
    await updateIntegrationStatus({ userId: targetUserId, providerId: job.providerId, status: 'success', message: null })

    return NextResponse.json({ jobId: job.id, providerId: job.providerId, metricsCount: metrics.length })
  } catch (error: any) {
    console.error('[integrations/process] error', error)

    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    const userId = typeof error?.userId === 'string' ? error.userId : null
    const jobId = typeof error?.jobId === 'string' ? error.jobId : null
    const providerId = typeof error?.providerId === 'string' ? error.providerId : null

    if (userId && jobId) {
      await failSyncJob({ userId, jobId, message: error.message || 'Unknown error' })
    }

    if (userId && providerId) {
      await updateIntegrationStatus({ userId, providerId, status: 'error', message: error.message || 'Sync failed' })
    }

    return NextResponse.json({ error: error.message || 'Failed to process sync job' }, { status: 500 })
  }
}
