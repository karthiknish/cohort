import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import { recordSchedulerEvent } from '@/lib/scheduler-monitor'
import { getSchedulerAlertPreference } from '@/lib/scheduler-alert-preferences'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError } from '@/lib/api-errors'

const workerSchema = z.object({
  maxJobs: z.number().optional(),
  maxWorkspaces: z.number().optional(),
})

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('CONVEX_URL is not configured')
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

/**
 * Background worker that processes sync jobs continuously.
 * Designed to be called by external schedulers (Cloud Scheduler, cron services).
 * Processes multiple jobs per invocation to maximize efficiency.
 */
export const POST = createApiHandler(
  {
    bodySchema: workerSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    // Verify this is an authorized cron/worker request
    if (!auth.isCron) {
      throw new UnauthorizedError('Worker authentication required')
    }

    const startedAt = Date.now()
    const maxJobs = Math.min(body.maxJobs || 10, 25) // Process up to 25 jobs per invocation
    const maxWorkspaces = Math.min(body.maxWorkspaces || 50, 100) // Check up to 100 workspaces
    const origin = req.nextUrl.origin
    const cronSecret = process.env.INTEGRATIONS_CRON_SECRET

    if (!cronSecret) {
      throw new Error('INTEGRATIONS_CRON_SECRET is not configured')
    }

    const convex = getConvexClient()
  
  let processedJobs = 0
  let successfulJobs = 0
  let failedJobs = 0
  let hadQueuedJobs = false
  let inspectedQueuedJobs = 0
  const jobResults: Array<{ workspaceId: string; jobId: string; providerId: string; status: string; error?: string }> = []

    // Get workspaces with queued sync jobs directly from Convex
    const workspaceIds = await convex.query(api.adsIntegrations.listWorkspacesWithQueuedJobs, {
      limit: maxWorkspaces,
    })

    for (const workspaceId of workspaceIds) {
      if (processedJobs >= maxJobs) {
        break // Stop if we've hit the job limit
      }

      // Count queued jobs for this workspace
      const { count: queuedCount, hasMore } = await convex.query(
        api.adsIntegrations.countQueuedJobsForWorkspace,
        { workspaceId, limit: Math.min(3, maxJobs - processedJobs) }
      )

      if (queuedCount > 0) {
        hadQueuedJobs = true
        inspectedQueuedJobs += queuedCount
      }

      // Process up to 3 jobs per workspace per run
      const jobsToProcess = Math.min(queuedCount, 3, maxJobs - processedJobs)
      
      for (let i = 0; i < jobsToProcess; i++) {
        try {
          processedJobs++

          // Call the process endpoint; it will claim and process the next queued job in this workspace.
          const processResponse = await fetch(`${origin}/api/integrations/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-cron-key': cronSecret
            },
            body: JSON.stringify({ workspaceId })
          })

          const result = await processResponse.json().catch(() => ({ error: 'Invalid response' }))

          if (processResponse.ok) {
            successfulJobs++
            jobResults.push({
              workspaceId,
              jobId: result.jobId || 'unknown',
              providerId: result.providerId || 'unknown',
              status: 'success'
            })
          } else {
            failedJobs++
            jobResults.push({
              workspaceId,
              jobId: 'unknown',
              providerId: 'unknown',
              status: 'failed',
              error: result.error || 'Unknown error'
            })
          }

          // Small delay between jobs to avoid overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          failedJobs++
          const message = error instanceof Error ? error.message : 'Unknown processing error'
          jobResults.push({
            workspaceId,
            jobId: 'unknown',
            providerId: 'unknown',
            status: 'failed',
            error: message
          })
        }
      }
    }

  const summary = {
    processedJobs,
    successfulJobs,
    failedJobs,
    inspectedQueuedJobs,
    hadQueuedJobs,
    jobResults: jobResults.slice(0, 20), // Limit response size
    timestamp: new Date().toISOString()
  }

  console.log('[integrations/worker] Completed batch processing:', summary)

  const errorSummaries = jobResults
    .filter((job) => job.status === 'failed' && typeof job.error === 'string')
    .map((job) => `${job.providerId ?? 'unknown'}@${job.workspaceId}: ${job.error}`)

  const providerFailureCounts = jobResults.reduce<Record<string, number>>((acc, job) => {
    if (job.status === 'failed') {
      const key = job.providerId || 'unknown'
      acc[key] = (acc[key] ?? 0) + 1
    }
    return acc
  }, {})

  const providerFailureThresholds = await Promise.all(
    Object.entries(providerFailureCounts).map(async ([providerId, failedJobCount]) => {
      try {
        const preference = await getSchedulerAlertPreference(providerId)
        return {
          providerId,
          failedJobs: failedJobCount,
          threshold: preference?.failureThreshold ?? null,
        }
      } catch (error) {
        console.error('[integrations/worker] failed to load alert preference', providerId, error)
        return {
          providerId,
          failedJobs: failedJobCount,
          threshold: null,
        }
      }
    })
  )

  await recordSchedulerEvent({
    source: 'worker',
    processedJobs,
    successfulJobs,
    failedJobs,
    hadQueuedJobs,
    inspectedQueuedJobs,
    durationMs: Date.now() - startedAt,
    errors: errorSummaries,
    providerFailureThresholds,
    notes: hadQueuedJobs && processedJobs === 0 ? 'Detected queued jobs without progress' : undefined,
  })

    return summary
})
