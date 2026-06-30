import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { recordSchedulerEvent } from '@/lib/scheduler-monitor'
import { getSchedulerAlertPreference } from '@/lib/scheduler-alert-preferences'
import { ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import { fetchWithTimeout, isTimeoutError } from '@/lib/retry-utils'

const workerSchema = z.object({
  maxJobs: z.number().optional(),
  maxWorkspaces: z.number().optional(),
})

const CONVEX_WORKER_TIMEOUT_MS = 20000

function resolveConvexHttpUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_HTTP_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_HTTP_URL or NEXT_PUBLIC_CONVEX_SITE_URL is not configured')
  return url.replace(/\/$/, '')
}

const handlers = adaptApiHandler(
  { bodySchema: workerSchema, rateLimit: 'sensitive' },
  async (_req, { auth, body }) => {
    if (!auth.isCron) throw new UnauthorizedError('Worker authentication required')
    const startedAt = Date.now()
    const cronSecret = process.env.INTEGRATIONS_CRON_SECRET
    if (!cronSecret) throw new Error('INTEGRATIONS_CRON_SECRET is not configured')
    const convexHttpUrl = resolveConvexHttpUrl()

    let processResponse: Response
    try {
      processResponse = await fetchWithTimeout(`${convexHttpUrl}/cron/ad-sync-worker`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'x-cron-key': cronSecret },
        body: JSON.stringify({ mode: 'all', maxJobs: body.maxJobs }),
        timeoutMs: CONVEX_WORKER_TIMEOUT_MS,
        timeoutMessage: 'Timed out while delegating work to the Convex ad sync worker.',
      })
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new ServiceUnavailableError('Convex ad sync worker timed out')
      }
      throw error
    }
    const result = (await processResponse.json().catch(() => ({ error: 'Invalid response from Convex ad sync worker' }))) as {
      mode?: string; processedJobs?: number; successfulJobs?: number; failedJobs?: number; error?: string
    }
    const processedJobs = result.processedJobs ?? 0
    const successfulJobs = result.successfulJobs ?? processedJobs
    const failedJobs = result.failedJobs ?? 0
    const hadQueuedJobs = processedJobs > 0 || failedJobs > 0
    const summary = {
      processedJobs, successfulJobs, failedJobs,
      inspectedQueuedJobs: processedJobs + failedJobs, hadQueuedJobs,
      mode: result.mode ?? 'all', jobResults: [],
      timestamp: new Date().toISOString(),
    }

    if (!processResponse.ok) {
      console.error('[integrations/worker] Convex ad sync worker failed:', result)
      await recordSchedulerEvent({
        source: 'worker', processedJobs, successfulJobs, failedJobs: failedJobs + 1, hadQueuedJobs,
        inspectedQueuedJobs: summary.inspectedQueuedJobs, durationMs: Date.now() - startedAt,
        errors: [result.error ?? `Convex worker HTTP ${processResponse.status}`],
        notes: 'Convex /cron/ad-sync-worker returned an error',
      })
      throw new Error(result.error ?? `Convex ad sync worker failed (${processResponse.status})`)
    }

    console.log('[integrations/worker] Completed batch processing via Convex:', summary)
    const providerFailureThresholds = await Promise.all(
      (['google', 'facebook', 'google-analytics'] as const).map(async (providerId) => {
        try {
          const preference = await getSchedulerAlertPreference(providerId)
          return { providerId, failedJobs: 0, threshold: preference?.failureThreshold ?? null }
        } catch (error) {
          console.error('[integrations/worker] failed to load alert preference', providerId, error)
          return { providerId, failedJobs: 0, threshold: null }
        }
      }),
    )
    await recordSchedulerEvent({
      source: 'worker', processedJobs, successfulJobs, failedJobs, hadQueuedJobs,
      inspectedQueuedJobs: summary.inspectedQueuedJobs, durationMs: Date.now() - startedAt,
      errors: failedJobs > 0 ? [`${failedJobs} job(s) failed in Convex processor`] : [],
      providerFailureThresholds,
      notes: 'Delegated to Convex processAllQueuedJobs',
    })
    return summary
  },
)

export const Route = createFileRoute('/api/integrations/worker')({
  server: { handlers },
})
