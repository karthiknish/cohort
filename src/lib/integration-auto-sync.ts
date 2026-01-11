import { differenceInMinutes } from 'date-fns'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../convex/_generated/api'
import {
  enqueueSyncJob,
  getAdIntegration,
  hasPendingSyncJob,
  markIntegrationSyncRequested,
} from '@/lib/ads-admin'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'

const DEFAULT_SYNC_FREQUENCY_MINUTES = 6 * 60 // every 6 hours
const DEFAULT_TIMEFRAME_DAYS = 90

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

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

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value)
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
  const convex = getConvexClient()
  if (!convex) {
    console.warn('[integration-auto-sync] convex client not available')
    return []
  }

  const workspaceId = await resolveWorkspaceIdForUser(userId)
  const providerIds = await convex.query(api.adsIntegrations.listWorkspaceIntegrationIds, {
    workspaceId,
  })

  return providerIds
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

  const convex = getConvexClient()
  if (!convex) {
    console.warn('[integration-auto-sync] convex client not available')
    return { scheduled: [], skipped: [] }
  }

  // Get all workspaces with integrations
  const limit = typeof maxUsers === 'number' && Number.isFinite(maxUsers) && maxUsers > 0
    ? Math.max(1, Math.floor(maxUsers))
    : 1000

  const workspaceIds = await convex.query(api.adsIntegrations.listAllWorkspacesWithIntegrations, {
    limit,
  })

  const scheduled: Array<{ userId: string; providerIds: string[] }> = []
  const skipped: Array<{ userId: string; providerIds: string[] }> = []

  // Note: workspaceId is used as userId for scheduling since the workspace owns the integrations
  await Promise.all(
    workspaceIds.map(async (workspaceId) => {
      // Use workspaceId as the userId context for scheduling
      const result = await scheduleSyncsForUser({ userId: workspaceId, providerIds, force, timeframeDays })
      if (result.scheduled.length > 0) {
        scheduled.push({ userId: workspaceId, providerIds: result.scheduled })
      }
      if (result.skipped.length > 0) {
        skipped.push({ userId: workspaceId, providerIds: result.skipped })
      }
    })
  )

  return { scheduled, skipped }
}
