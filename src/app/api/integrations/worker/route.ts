import { z } from 'zod'
import { adminDb } from '@/lib/firebase-admin'
import { recordSchedulerEvent } from '@/lib/scheduler-monitor'
import { getSchedulerAlertPreference } from '@/lib/scheduler-alert-preferences'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError } from '@/lib/api-errors'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'

const workerSchema = z.object({
  maxJobs: z.number().optional(),
  maxUsers: z.number().optional(),
})

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
    const maxUsers = Math.min(body.maxUsers || 50, 100) // Check up to 100 users
    const origin = req.nextUrl.origin
    const cronSecret = process.env.INTEGRATIONS_CRON_SECRET

    if (!cronSecret) {
      throw new Error('INTEGRATIONS_CRON_SECRET is not configured')
    }
  
  let processedJobs = 0
  let successfulJobs = 0
  let failedJobs = 0
  let hadQueuedJobs = false
  let inspectedQueuedJobs = 0
  const jobResults: Array<{ userId: string; jobId: string; providerId: string; status: string; error?: string }> = []

    // Get users with queued sync jobs
    // Note: sync jobs are stored under workspaces/<workspaceId>/syncJobs.
    const usersSnapshot = await adminDb
      .collection('users')
      .limit(maxUsers)
      .get()

    for (const userDoc of usersSnapshot.docs) {
      if (processedJobs >= maxJobs) {
        break // Stop if we've hit the job limit
      }

      const userId = userDoc.id

      // Resolve workspaceId for this user (agency workspace support)
      const workspaceId = await resolveWorkspaceIdForUser(userId)

      // Check for queued jobs for this workspace
      const queuedJobsSnapshot = await adminDb
        .collection('workspaces')
        .doc(workspaceId)
        .collection('syncJobs')
        .where('status', '==', 'queued')
        .orderBy('createdAt', 'asc')
        .limit(Math.min(3, maxJobs - processedJobs)) // Max 3 jobs per workspace per run
        .get()

      if (!queuedJobsSnapshot.empty) {
        hadQueuedJobs = true
        inspectedQueuedJobs += queuedJobsSnapshot.size
      }

      for (const jobDoc of queuedJobsSnapshot.docs) {
        try {
          processedJobs++

          // Call the process endpoint; it will claim and process the next queued job in this workspace.
          const processResponse = await fetch(`${origin}/api/integrations/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-cron-key': cronSecret
            },
            body: JSON.stringify({ userId })
          })

          const result = await processResponse.json().catch(() => ({ error: 'Invalid response' }))

          if (processResponse.ok) {
            successfulJobs++
            jobResults.push({
              userId,
              jobId: result.jobId || jobDoc.id,
              providerId: result.providerId || 'unknown',
              status: 'success'
            })
          } else {
            failedJobs++
            jobResults.push({
              userId,
              jobId: jobDoc.id,
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
            userId,
            jobId: jobDoc.id,
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
    .map((job) => `${job.providerId ?? 'unknown'}@${job.userId}: ${job.error}`)

  const providerFailureCounts = jobResults.reduce<Record<string, number>>((acc, job) => {
    if (job.status === 'failed') {
      const key = job.providerId || 'unknown'
      acc[key] = (acc[key] ?? 0) + 1
    }
    return acc
  }, {})

  const providerFailureThresholds = await Promise.all(
    Object.entries(providerFailureCounts).map(async ([providerId, failedJobs]) => {
      try {
        const preference = await getSchedulerAlertPreference(providerId)
        return {
          providerId,
          failedJobs,
          threshold: preference?.failureThreshold ?? null,
        }
      } catch (error) {
        console.error('[integrations/worker] failed to load alert preference', providerId, error)
        return {
          providerId,
          failedJobs,
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
