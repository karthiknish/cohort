import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

import {
  scheduleIntegrationSync,
  scheduleSyncsForAllUsers,
  scheduleSyncsForUser,
} from '@/lib/integration-auto-sync'
import { createApiHandler } from '@/lib/api-handler'
import { recordSchedulerEvent } from '@/lib/scheduler-monitor'
import { UnauthorizedError, ValidationError } from '@/lib/api-errors'

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('CONVEX_URL is not configured')
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

const cronSchema = z.object({
  operation: z.string().optional(),
  maxUsers: z.number().optional(),
  timeframeDays: z.number().optional(),
  force: z.boolean().optional(),
  providerIds: z.array(z.string()).optional(),
  providerId: z.string().optional(),
  userId: z.string().optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: cronSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    const startedAt = Date.now()
    // Verify this is an authorized cron request
    if (!auth.isCron) {
      throw new UnauthorizedError('Cron authentication required')
    }

    const operation = body.operation ?? 'schedule_all_users'
    const maxUsers = Math.min(body.maxUsers ?? 50, 500)
    const timeframeDays = body.timeframeDays
    const force = Boolean(body.force)
    const resolvedProviderIds = body.providerIds ?? (body.providerId ? [body.providerId] : undefined)
    const resolvedUserId = body.userId

  let processedCount = 0
  let enqueuedJobs = 0
  let errors: string[] = []

  switch (operation) {
    case 'schedule_all_users':
    case 'process_all_users': {
      const { scheduled, skipped } = await scheduleSyncsForAllUsers({
        force,
        providerIds: resolvedProviderIds,
        maxUsers,
        timeframeDays,
      })

      processedCount = scheduled.length
      enqueuedJobs = scheduled.reduce((total, entry) => total + entry.providerIds.length, 0)

      if (skipped.length > 0) {
        errors = skipped
          .map((entry) => `User ${entry.userId} skipped providers: ${entry.providerIds.join(', ')}`)
          .slice(0, 10)
      }
      break
    }

    case 'cleanup_old_jobs': {
      // Clean up old completed/failed sync jobs (older than 7 days)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 7)
      const cutoffMs = cutoffDate.getTime()

      const convex = getConvexClient()
      const cronKey = process.env.INTEGRATIONS_CRON_SECRET

      try {
        const result = await convex.mutation(api.adsIntegrations.cleanupOldJobsServer, {
          cutoffMs,
          cronKey,
        })
        enqueuedJobs = result.deleted
        processedCount = 1
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Cleanup failed: ${message}`)
      }
      break
    }

    case 'reset_stale_jobs': {
      // Reset jobs that have been running for too long (over 30 minutes)
      const staleThreshold = new Date()
      staleThreshold.setMinutes(staleThreshold.getMinutes() - 30)
      const startedBeforeMs = staleThreshold.getTime()

      const convex = getConvexClient()
      const cronKey = process.env.INTEGRATIONS_CRON_SECRET

      try {
        const result = await convex.mutation(api.adsIntegrations.resetStaleJobsServer, {
          startedBeforeMs,
          cronKey,
        })
        enqueuedJobs = result.reset
        processedCount = 1
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Reset stale jobs failed: ${message}`)
      }
      break
    }

    case 'schedule_user': {
      if (!resolvedUserId) {
        throw new ValidationError('userId is required for schedule_user')
      }

      if (resolvedProviderIds && resolvedProviderIds.length === 1) {
        const scheduled = await scheduleIntegrationSync({
          userId: resolvedUserId,
          providerId: resolvedProviderIds[0],
          force,
          timeframeDays,
        })
        processedCount = scheduled ? 1 : 0
        enqueuedJobs = scheduled ? 1 : 0
      } else {
        const result = await scheduleSyncsForUser({
          userId: resolvedUserId,
          providerIds: resolvedProviderIds,
          force,
          timeframeDays,
        })
        processedCount = result.scheduled.length
        enqueuedJobs = result.scheduled.length
        if (result.skipped.length > 0) {
          errors = result.skipped.map((providerId) => `Skipped provider ${providerId}`)
        }
      }
      break
    }

    default:
      throw new ValidationError(`Unknown operation: ${operation}`)
  }

  const result = {
    operation,
    processedCount,
    enqueuedJobs,
    errors: errors.length > 0 ? errors.slice(0, 10) : [], // Limit error responses
    timestamp: new Date().toISOString()
  }

  console.log('[integrations/cron] Completed operation:', result)

  await recordSchedulerEvent({
    source: 'cron',
    operation,
    processedJobs: processedCount,
    successfulJobs: enqueuedJobs,
    failedJobs: errors.length,
    durationMs: Date.now() - startedAt,
    errors,
    failureThresholdOverride: errors.length,
    notes:
      operation === 'schedule_all_users' && processedCount === 0
        ? 'No users processed during schedule run'
        : undefined,
  })

  return result
})