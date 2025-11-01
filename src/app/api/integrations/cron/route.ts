import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import {
  scheduleIntegrationSync,
  scheduleSyncsForAllUsers,
  scheduleSyncsForUser,
} from '@/lib/integration-auto-sync'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { recordSchedulerEvent } from '@/lib/scheduler-monitor'

export async function POST(request: NextRequest) {
  try {
    const startedAt = Date.now()
    // Verify this is an authorized cron request
    const auth = await authenticateRequest(request)
    if (!auth.isCron) {
      throw new AuthenticationError('Cron authentication required', 401)
    }

    const body = await request.json().catch(() => ({}))
    const operation = (body.operation as string | undefined) ?? 'schedule_all_users'
    const maxUsers = Math.min(body.maxUsers ?? 50, 500)
    const timeframeDays = body.timeframeDays
    const force = Boolean(body.force)
    const providerIds = Array.isArray(body.providerIds)
      ? body.providerIds.filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
      : undefined
    const providerId = typeof body.providerId === 'string' && body.providerId.trim().length > 0 ? body.providerId : undefined

    const resolvedProviderIds = providerIds ?? (providerId ? [providerId] : undefined)
    const resolvedUserId = typeof body.userId === 'string' && body.userId.trim().length > 0 ? body.userId : undefined

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

        const usersSnapshot = await adminDb
          .collection('users')
          .limit(maxUsers)
          .get()

        for (const userDoc of usersSnapshot.docs) {
          try {
            const oldJobsSnapshot = await adminDb
              .collection('users')
              .doc(userDoc.id)
              .collection('syncJobs')
              .where('status', 'in', ['success', 'error'])
              .where('processedAt', '<', cutoffDate)
              .limit(50)
              .get()

            const batch = adminDb.batch()
            let batchCount = 0

            oldJobsSnapshot.docs.forEach((jobDoc) => {
              batch.delete(jobDoc.ref)
              batchCount++
            })

            if (batchCount > 0) {
              await batch.commit()
              enqueuedJobs += batchCount
            }

            processedCount++
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            errors.push(`User ${userDoc.id}: ${message}`)
          }
        }
        break
      }

      case 'reset_stale_jobs': {
        // Reset jobs that have been running for too long (over 30 minutes)
        const staleThreshold = new Date()
        staleThreshold.setMinutes(staleThreshold.getMinutes() - 30)

        const usersSnapshot = await adminDb
          .collection('users')
          .limit(maxUsers)
          .get()

        for (const userDoc of usersSnapshot.docs) {
          try {
            const staleJobsSnapshot = await adminDb
              .collection('users')
              .doc(userDoc.id)
              .collection('syncJobs')
              .where('status', '==', 'running')
              .where('startedAt', '<', staleThreshold)
              .limit(10)
              .get()

            const batch = adminDb.batch()
            let batchCount = 0

            staleJobsSnapshot.docs.forEach((jobDoc) => {
              batch.update(jobDoc.ref, {
                status: 'queued',
                startedAt: null,
                errorMessage: 'Reset due to stale execution',
                updatedAt: FieldValue.serverTimestamp()
              })
              batchCount++
            })

            if (batchCount > 0) {
              await batch.commit()
              enqueuedJobs += batchCount
            }

            processedCount++
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            errors.push(`User ${userDoc.id}: ${message}`)
          }
        }
        break
      }

      case 'schedule_user': {
        if (!resolvedUserId) {
          return NextResponse.json({ error: 'userId is required for schedule_user' }, { status: 400 })
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
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 })
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

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[integrations/cron] Operation failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}