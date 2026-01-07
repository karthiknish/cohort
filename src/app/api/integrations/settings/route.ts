import { z } from 'zod'
import {
  getAdIntegration,
  updateIntegrationPreferences,
} from '@/lib/firestore/admin'
import { createApiHandler } from '@/lib/api-handler'
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'

const settingsSchema = z.object({
  providerId: z.string().min(1),
  userId: z.string().optional(),
  autoSyncEnabled: z.boolean().optional(),
  syncFrequencyMinutes: z.number().nullable().optional(),
  scheduledTimeframeDays: z.number().nullable().optional(),
})

const MIN_FREQUENCY_MINUTES = 30
const MAX_FREQUENCY_MINUTES = 24 * 60
const MIN_TIMEFRAME_DAYS = 1
const MAX_TIMEFRAME_DAYS = 90

function coerceFrequency(value: unknown): number | null | undefined {
  if (value === null) {
    return null
  }
  if (typeof value !== 'number') {
    return undefined
  }
  if (!Number.isFinite(value)) {
    throw new Error('syncFrequencyMinutes must be a finite number')
  }
  const normalized = Math.round(value)
  if (normalized < MIN_FREQUENCY_MINUTES || normalized > MAX_FREQUENCY_MINUTES) {
    throw new Error(`syncFrequencyMinutes must be between ${MIN_FREQUENCY_MINUTES} and ${MAX_FREQUENCY_MINUTES}`)
  }
  return normalized
}

function coerceTimeframe(value: unknown): number | null | undefined {
  if (value === null) {
    return null
  }
  if (typeof value !== 'number') {
    return undefined
  }
  if (!Number.isFinite(value)) {
    throw new Error('scheduledTimeframeDays must be a finite number')
  }
  const normalized = Math.round(value)
  if (normalized < MIN_TIMEFRAME_DAYS || normalized > MAX_TIMEFRAME_DAYS) {
    throw new Error(`scheduledTimeframeDays must be between ${MIN_TIMEFRAME_DAYS} and ${MAX_TIMEFRAME_DAYS}`)
  }
  return normalized
}

export const PATCH = createApiHandler(
  {
    bodySchema: settingsSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    const providerId = body.providerId.trim()
    if (!providerId) {
      throw new ValidationError('providerId is required')
    }

    let targetUserId: string | null = null

    if (auth.isCron) {
      targetUserId = body.userId?.trim() ?? null
      if (!targetUserId) {
        throw new ValidationError('Cron updates must include userId')
      }
    } else {
      if (body.userId && body.userId !== auth.uid) {
        const isAdmin = auth.claims?.role === 'admin' || (
          auth.email && (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).includes(auth.email.toLowerCase())
        )
        if (!isAdmin) {
          throw new ForbiddenError('Admin access required')
        }
        targetUserId = body.userId
      } else {
        targetUserId = auth.uid ?? null
      }
    }

  if (!targetUserId) {
    throw new UnauthorizedError('Unable to resolve target user')
  }

  const integration = await getAdIntegration({ userId: targetUserId, providerId })
  if (!integration) {
    throw new NotFoundError('Integration not found')
  }

  const updates: Record<string, unknown> = {}

  if (Object.prototype.hasOwnProperty.call(body, 'autoSyncEnabled')) {
    if (typeof body.autoSyncEnabled !== 'boolean') {
      throw new ValidationError('autoSyncEnabled must be a boolean')
    }
    updates.autoSyncEnabled = body.autoSyncEnabled
  }

  try {
    const normalizedFrequency = coerceFrequency(body.syncFrequencyMinutes)
    if (Object.prototype.hasOwnProperty.call(body, 'syncFrequencyMinutes')) {
      updates.syncFrequencyMinutes = normalizedFrequency === undefined ? undefined : normalizedFrequency
    }
  } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : 'Invalid syncFrequencyMinutes')
  }

  try {
    const normalizedTimeframe = coerceTimeframe(body.scheduledTimeframeDays)
    if (Object.prototype.hasOwnProperty.call(body, 'scheduledTimeframeDays')) {
      updates.scheduledTimeframeDays = normalizedTimeframe === undefined ? undefined : normalizedTimeframe
    }
  } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : 'Invalid scheduledTimeframeDays')
  }

  if (!Object.keys(updates).length) {
    throw new ValidationError('No settings supplied')
  }

  await updateIntegrationPreferences({
    userId: targetUserId,
    providerId,
    autoSyncEnabled: updates.autoSyncEnabled as boolean | undefined,
    syncFrequencyMinutes: Object.prototype.hasOwnProperty.call(updates, 'syncFrequencyMinutes')
      ? (updates.syncFrequencyMinutes as number | null)
      : undefined,
    scheduledTimeframeDays: Object.prototype.hasOwnProperty.call(updates, 'scheduledTimeframeDays')
      ? (updates.scheduledTimeframeDays as number | null)
      : undefined,
  })
  await logAuditAction({
    action: 'INTEGRATION_UPDATE',
    actorId: auth.uid ?? 'system',
    targetId: providerId,
    metadata: {
      providerId,
      targetUserId,
      updates,
    },
  })
  const refreshed = await getAdIntegration({ userId: targetUserId, providerId })
  if (!refreshed) {
    throw new ValidationError('Failed to load integration after update')
  }

  return {
    providerId,
    autoSyncEnabled: typeof refreshed.autoSyncEnabled === 'boolean' ? refreshed.autoSyncEnabled : null,
    syncFrequencyMinutes:
      typeof refreshed.syncFrequencyMinutes === 'number' && Number.isFinite(refreshed.syncFrequencyMinutes)
        ? refreshed.syncFrequencyMinutes
        : null,
    scheduledTimeframeDays:
      typeof refreshed.scheduledTimeframeDays === 'number' && Number.isFinite(refreshed.scheduledTimeframeDays)
        ? refreshed.scheduledTimeframeDays
        : null,
  }
})
