import { NextRequest, NextResponse } from 'next/server'

import {
  getAdIntegration,
  updateIntegrationPreferences,
} from '@/lib/firestore-integrations-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

const MIN_FREQUENCY_MINUTES = 30
const MAX_FREQUENCY_MINUTES = 24 * 60
const MIN_TIMEFRAME_DAYS = 1
const MAX_TIMEFRAME_DAYS = 90

type SettingsPayload = {
  userId?: string
  providerId?: string
  autoSyncEnabled?: boolean
  syncFrequencyMinutes?: number | null
  scheduledTimeframeDays?: number | null
}

function ensureAdmin(auth: { email: string | null }) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!auth.email || !adminEmails.includes(auth.email.toLowerCase())) {
    throw new AuthenticationError('Admin access required', 403)
  }
}

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

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    let payload: SettingsPayload = {}
    if (request.headers.get('content-type')?.includes('application/json')) {
      payload = (await request.json()) as SettingsPayload
    }

    const providerId = typeof payload.providerId === 'string' && payload.providerId.trim().length > 0 ? payload.providerId.trim() : null
    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required' }, { status: 400 })
    }

    let targetUserId: string | null = null

    if (auth.isCron) {
      targetUserId = typeof payload.userId === 'string' && payload.userId.trim().length > 0 ? payload.userId.trim() : null
      if (!targetUserId) {
        return NextResponse.json({ error: 'Cron updates must include userId' }, { status: 400 })
      }
    } else {
      if (payload.userId && payload.userId !== auth.uid) {
        ensureAdmin(auth)
        targetUserId = payload.userId
      } else {
        targetUserId = auth.uid
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unable to resolve target user' }, { status: 401 })
    }

    const integration = await getAdIntegration({ userId: targetUserId, providerId })
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    const updates: SettingsPayload = {}

    if (Object.prototype.hasOwnProperty.call(payload, 'autoSyncEnabled')) {
      if (typeof payload.autoSyncEnabled !== 'boolean') {
        return NextResponse.json({ error: 'autoSyncEnabled must be a boolean' }, { status: 400 })
      }
      updates.autoSyncEnabled = payload.autoSyncEnabled
    }

    try {
      const normalizedFrequency = coerceFrequency(payload.syncFrequencyMinutes)
      if (Object.prototype.hasOwnProperty.call(payload, 'syncFrequencyMinutes')) {
        updates.syncFrequencyMinutes = normalizedFrequency === undefined ? undefined : normalizedFrequency
      }
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid syncFrequencyMinutes' }, { status: 400 })
    }

    try {
      const normalizedTimeframe = coerceTimeframe(payload.scheduledTimeframeDays)
      if (Object.prototype.hasOwnProperty.call(payload, 'scheduledTimeframeDays')) {
        updates.scheduledTimeframeDays = normalizedTimeframe === undefined ? undefined : normalizedTimeframe
      }
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid scheduledTimeframeDays' }, { status: 400 })
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No settings supplied' }, { status: 400 })
    }

    await updateIntegrationPreferences({
      userId: targetUserId,
      providerId,
      autoSyncEnabled: updates.autoSyncEnabled,
      syncFrequencyMinutes: Object.prototype.hasOwnProperty.call(updates, 'syncFrequencyMinutes')
        ? updates.syncFrequencyMinutes ?? null
        : undefined,
      scheduledTimeframeDays: Object.prototype.hasOwnProperty.call(updates, 'scheduledTimeframeDays')
        ? updates.scheduledTimeframeDays ?? null
        : undefined,
    })

    const refreshed = await getAdIntegration({ userId: targetUserId, providerId })
    if (!refreshed) {
      return NextResponse.json({ error: 'Failed to load integration after update' }, { status: 500 })
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[integrations/settings] update failed', error)
    return NextResponse.json({ error: 'Failed to update integration settings' }, { status: 500 })
  }
}
