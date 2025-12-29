import { differenceInMinutes } from 'date-fns'

import { adminDb } from '@/lib/firebase-admin'
import {
  enqueueSyncJob,
  getAdIntegration,
  hasPendingSyncJob,
  markIntegrationSyncRequested,
} from '@/lib/firestore-integrations-admin'

const DEFAULT_SYNC_FREQUENCY_MINUTES = 6 * 60 // every 6 hours
const DEFAULT_TIMEFRAME_DAYS = 90

function minutesSince(date: Date | null | undefined): number | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null
  
  const now = new Date()
  // Prevent future dates from bypassing rate limits
  if (date.getTime() > now.getTime()) return 0
  
  return differenceInMinutes(now, date)
}

function resolveTimestamp(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate()
    } catch (error) {
      console.warn('[integration-auto-sync] failed to convert timestamp via toDate', error)
      return null
    }
  }

  if (typeof value === 'object' && value !== null && 'toMillis' in value && typeof (value as { toMillis: () => number }).toMillis === 'function') {
    try {
      const millis = (value as { toMillis: () => number }).toMillis()
      return Number.isFinite(millis) ? new Date(millis) : null
    } catch (error) {
      console.warn('[integration-auto-sync] failed to convert timestamp via toMillis', error)
      return null
    }
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : new Date(parsed)
  }

  return null
}

export async function scheduleIntegrationSync(options: {
  userId: string
  providerId: string
  force?: boolean
  timeframeDays?: number
}): Promise<boolean> {
  const { userId, providerId, force = false, timeframeDays } = options

  const integration = await getAdIntegration({ userId, providerId })
  if (!integration) {
    console.warn('[integration-auto-sync] integration not found', { userId, providerId })
    return false
  }

  if (integration.autoSyncEnabled === false && !force) {
    return false
  }

  const frequencyMinutes = integration.syncFrequencyMinutes ?? DEFAULT_SYNC_FREQUENCY_MINUTES
  const resolvedTimeframeDays = typeof timeframeDays === 'number' && Number.isFinite(timeframeDays)
    ? Math.max(1, Math.floor(timeframeDays))
    : integration.scheduledTimeframeDays ?? DEFAULT_TIMEFRAME_DAYS

  const lastSyncedAt = resolveTimestamp(integration.lastSyncedAt)
  const lastRequestedAt = resolveTimestamp(integration.lastSyncRequestedAt)

  const sinceLastSync = minutesSince(lastSyncedAt)
  const sinceLastRequest = minutesSince(lastRequestedAt)

  if (!force) {
    if (sinceLastRequest !== null && sinceLastRequest < frequencyMinutes / 2) {
      return false
    }

    if (sinceLastSync !== null && sinceLastSync < frequencyMinutes) {
      return false
    }

    const pending = await hasPendingSyncJob({ userId, providerId })
    if (pending) {
      return false
    }
  }

  await enqueueSyncJob({
    userId,
    providerId,
    jobType: force ? 'manual-sync' : 'scheduled-sync',
    timeframeDays: resolvedTimeframeDays,
  })

  await markIntegrationSyncRequested({ userId, providerId })
  return true
}

export async function scheduleSyncsForUser(options: {
  userId: string
  providerIds?: string[]
  force?: boolean
  timeframeDays?: number
}): Promise<{ scheduled: string[]; skipped: string[] }> {
  const { userId, providerIds, force = false, timeframeDays } = options

  if (providerIds && providerIds.length > 0) {
    const results = await Promise.all(
      providerIds.map(async (providerId) => {
        const scheduled = await scheduleIntegrationSync({ userId, providerId, force, timeframeDays })
        return { providerId, scheduled }
      })
    )

    return {
      scheduled: results.filter((result) => result.scheduled).map((result) => result.providerId),
      skipped: results.filter((result) => !result.scheduled).map((result) => result.providerId),
    }
  }

  const integrationsSnapshot = await getUserIntegrationIds(userId)
  if (!integrationsSnapshot.length) {
    return { scheduled: [], skipped: [] }
  }

  const results = await Promise.all(
    integrationsSnapshot.map(async (providerId) => {
      const scheduled = await scheduleIntegrationSync({ userId, providerId, force, timeframeDays })
      return { providerId, scheduled }
    })
  )

  return {
    scheduled: results.filter((result) => result.scheduled).map((result) => result.providerId),
    skipped: results.filter((result) => !result.scheduled).map((result) => result.providerId),
  }
}

async function getUserIntegrationIds(userId: string): Promise<string[]> {
  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('adIntegrations')
    .get()

  return snapshot.docs.map((doc) => doc.id)
}

export async function scheduleSyncsForAllUsers(options: {
  force?: boolean
  providerIds?: string[]
  maxUsers?: number
  timeframeDays?: number
} = {}): Promise<{
  scheduled: Array<{ userId: string; providerIds: string[] }>
  skipped: Array<{ userId: string; providerIds: string[] }>
}> {
  const { force = false, providerIds, maxUsers, timeframeDays } = options

  const query = adminDb.collection('users')
  const usersSnapshot = await (typeof maxUsers === 'number' && Number.isFinite(maxUsers) && maxUsers > 0
    ? query.limit(Math.max(1, Math.floor(maxUsers)))
    : query
  ).select().get()
  const scheduled: Array<{ userId: string; providerIds: string[] }> = []
  const skipped: Array<{ userId: string; providerIds: string[] }> = []

  await Promise.all(
    usersSnapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id
      const result = await scheduleSyncsForUser({ userId, providerIds, force, timeframeDays })
      if (result.scheduled.length > 0) {
        scheduled.push({ userId, providerIds: result.scheduled })
      }
      if (result.skipped.length > 0) {
        skipped.push({ userId, providerIds: result.skipped })
      }
    })
  )

  return { scheduled, skipped }
}
