import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'
import { FieldValue, Timestamp, WriteBatch } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'
import {
  AdIntegration,
  NormalizedMetric,
  SyncJob,
} from '@/types/integrations'
import { coerceStringArray } from '@/lib/utils'

type TimestampInput = Date | string | number | Timestamp | null | undefined

function toTimestamp(value: TimestampInput): AdminTimestamp | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Timestamp) {
    return value as AdminTimestamp
  }

  if (value instanceof Date) {
    return Timestamp.fromDate(value) as AdminTimestamp
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return Timestamp.fromMillis(parsed) as AdminTimestamp
    }
    return null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Timestamp.fromMillis(value) as AdminTimestamp
  }

  return null
}

function serverTimestamp() {
  return FieldValue.serverTimestamp()
}

async function getWorkspaceRef(userId: string) {
  const workspaceId = await resolveWorkspaceIdForUser(userId)
  return adminDb.collection('workspaces').doc(workspaceId)
}

export async function persistIntegrationTokens(options: {
  userId: string
  providerId: string
  accessToken: string | null
  idToken?: string | null
  scopes?: string[]
  status?: 'pending' | 'success' | 'error' | 'never'
  refreshToken?: string | null
  accountId?: string | null
  developerToken?: string | null
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
}): Promise<void> {
  const {
    userId,
    providerId,
    accessToken,
    idToken,
    scopes = [],
    status = 'pending',
    refreshToken = null,
    accountId = null,
    developerToken = null,
    loginCustomerId = null,
    managerCustomerId = null,
    accessTokenExpiresAt = null,
    refreshTokenExpiresAt = null,
  } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const integrationRef = workspaceRef
    .collection('adIntegrations')
    .doc(providerId)

  const payload: Record<string, unknown> = {
    accessToken,
    idToken: idToken ?? null,
    refreshToken,
    scopes,
    linkedAt: serverTimestamp(),
    lastSyncStatus: status,
    lastSyncRequestedAt: serverTimestamp(),
    accountId,
    developerToken,
    loginCustomerId,
    managerCustomerId,
  }

  payload.accessTokenExpiresAt = toTimestamp(accessTokenExpiresAt)
  payload.refreshTokenExpiresAt = toTimestamp(refreshTokenExpiresAt)

  await integrationRef.set(payload, { merge: true })
}

export async function updateIntegrationCredentials(options: {
  userId: string
  providerId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
  developerToken?: string | null
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  accountId?: string | null
}): Promise<void> {
  const {
    userId,
    providerId,
    accessToken,
    refreshToken,
    idToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    developerToken,
    loginCustomerId,
    managerCustomerId,
    accountId,
  } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const integrationRef = workspaceRef
    .collection('adIntegrations')
    .doc(providerId)

  const updatePayload: Record<string, unknown> = {
    lastSyncRequestedAt: serverTimestamp(),
  }

  if (accessToken !== undefined) updatePayload.accessToken = accessToken
  if (refreshToken !== undefined) updatePayload.refreshToken = refreshToken
  if (idToken !== undefined) updatePayload.idToken = idToken
  if (developerToken !== undefined) updatePayload.developerToken = developerToken
  if (loginCustomerId !== undefined) updatePayload.loginCustomerId = loginCustomerId
  if (managerCustomerId !== undefined) updatePayload.managerCustomerId = managerCustomerId
  if (accountId !== undefined) updatePayload.accountId = accountId
  if (accessTokenExpiresAt !== undefined) updatePayload.accessTokenExpiresAt = toTimestamp(accessTokenExpiresAt)
  if (refreshTokenExpiresAt !== undefined) updatePayload.refreshTokenExpiresAt = toTimestamp(refreshTokenExpiresAt)

  await integrationRef.set(updatePayload, { merge: true })
}

export async function enqueueSyncJob(options: {
  userId: string
  providerId: string
  jobType?: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays?: number
}): Promise<void> {
  const { userId, providerId, jobType = 'initial-backfill', timeframeDays = 90 } = options

  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('syncJobs')
    .add({
      providerId,
      jobType,
      status: 'queued',
      timeframeDays,
      createdAt: serverTimestamp(),
      startedAt: null,
      processedAt: null,
      errorMessage: null,
    })
}

export async function getAdIntegration(options: {
  userId: string
  providerId: string
}): Promise<AdIntegration | null> {
  const { userId, providerId } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const snapshot = await workspaceRef
    .collection('adIntegrations')
    .doc(providerId)
    .get()

  if (!snapshot.exists) {
    return null
  }

  const data = snapshot.data() as Record<string, unknown>

  return {
    id: snapshot.id,
    providerId,
    accessToken: (data.accessToken as string | null) ?? null,
    idToken: (data.idToken as string | null) ?? null,
    refreshToken: (data.refreshToken as string | null) ?? null,
    scopes: coerceStringArray(data.scopes),
    accountId: (data.accountId as string | undefined) ?? null,
    developerToken: (data.developerToken as string | undefined) ?? null,
    loginCustomerId: (data.loginCustomerId as string | undefined) ?? null,
    managerCustomerId: (data.managerCustomerId as string | undefined) ?? null,
    accessTokenExpiresAt: (data.accessTokenExpiresAt as AdminTimestamp | null | undefined) ?? null,
    refreshTokenExpiresAt: (data.refreshTokenExpiresAt as AdminTimestamp | null | undefined) ?? null,
    lastSyncStatus: (data.lastSyncStatus as AdIntegration['lastSyncStatus']) ?? 'never',
    lastSyncMessage: (data.lastSyncMessage as string | undefined) ?? null,
    lastSyncedAt: (data.lastSyncedAt as Timestamp | null | undefined) ?? null,
    lastSyncRequestedAt: (data.lastSyncRequestedAt as Timestamp | null | undefined) ?? null,
    linkedAt: (data.linkedAt as Timestamp | null | undefined) ?? null,
    autoSyncEnabled: typeof data.autoSyncEnabled === 'boolean' ? data.autoSyncEnabled : null,
    syncFrequencyMinutes:
      typeof data.syncFrequencyMinutes === 'number' && Number.isFinite(data.syncFrequencyMinutes)
        ? data.syncFrequencyMinutes
        : null,
    scheduledTimeframeDays:
      typeof data.scheduledTimeframeDays === 'number' && Number.isFinite(data.scheduledTimeframeDays)
        ? data.scheduledTimeframeDays
        : null,
  }
}

export async function claimNextSyncJob(options: {
  userId: string
}): Promise<SyncJob | null> {
  const { userId } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const jobsRef = workspaceRef.collection('syncJobs')
  const snapshot = await jobsRef
    .where('status', '==', 'queued')
    .orderBy('createdAt', 'asc')
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const jobDoc = snapshot.docs[0]
  await jobDoc.ref.update({
    status: 'running',
    startedAt: serverTimestamp(),
    errorMessage: null,
  })

  const data = jobDoc.data() as Record<string, unknown>
  return {
    id: jobDoc.id,
    providerId: (data.providerId as string | undefined) ?? jobDoc.id,
    jobType: (data.jobType as SyncJob['jobType']) ?? 'initial-backfill',
    timeframeDays: (data.timeframeDays as number | undefined) ?? 90,
    status: 'running',
    createdAt: (data.createdAt as Timestamp | null | undefined) ?? null,
    startedAt: (data.startedAt as Timestamp | null | undefined) ?? null,
    processedAt: (data.processedAt as Timestamp | null | undefined) ?? null,
    errorMessage: (data.errorMessage as string | undefined) ?? null,
  }
}

export async function completeSyncJob(options: { userId: string; jobId: string }): Promise<void> {
  const { userId, jobId } = options
  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('syncJobs')
    .doc(jobId)
    .update({
      status: 'success',
      processedAt: serverTimestamp(),
    })
}

export async function failSyncJob(options: {
  userId: string
  jobId: string
  message: string
}): Promise<void> {
  const { userId, jobId, message } = options
  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('syncJobs')
    .doc(jobId)
    .update({
      status: 'error',
      processedAt: serverTimestamp(),
      errorMessage: message,
    })
}

export async function updateIntegrationStatus(options: {
  userId: string
  providerId: string
  status: 'pending' | 'success' | 'error'
  message?: string | null
}): Promise<void> {
  const { userId, providerId, status, message = null } = options

  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('adIntegrations')
    .doc(providerId)
    .update({
      lastSyncStatus: status,
      lastSyncMessage: message,
      lastSyncedAt: status === 'success' ? serverTimestamp() : null,
    })
}

export async function hasPendingSyncJob(options: {
  userId: string
  providerId: string
}): Promise<boolean> {
  const { userId, providerId } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const jobsRef = workspaceRef.collection('syncJobs')
  const snapshot = await jobsRef
    .where('providerId', '==', providerId)
    .where('status', 'in', ['queued', 'running'])
    .limit(1)
    .get()

  return !snapshot.empty
}

export async function markIntegrationSyncRequested(options: {
  userId: string
  providerId: string
  status?: 'pending' | 'never' | 'error' | 'success'
}): Promise<void> {
  const { userId, providerId, status = 'pending' } = options

  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('adIntegrations')
    .doc(providerId)
    .set(
      {
        lastSyncStatus: status,
        lastSyncMessage: null,
        lastSyncRequestedAt: serverTimestamp(),
      },
      { merge: true }
    )
}

type IntegrationPreferenceOptions = {
  userId: string
  providerId: string
  autoSyncEnabled?: boolean | null
  syncFrequencyMinutes?: number | null
  scheduledTimeframeDays?: number | null
}

export async function updateIntegrationPreferences(options: IntegrationPreferenceOptions): Promise<void> {
  const { userId, providerId } = options

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (Object.prototype.hasOwnProperty.call(options, 'autoSyncEnabled')) {
    payload.autoSyncEnabled = options.autoSyncEnabled ?? null
  }

  if (Object.prototype.hasOwnProperty.call(options, 'syncFrequencyMinutes')) {
    payload.syncFrequencyMinutes = options.syncFrequencyMinutes ?? null
  }

  if (Object.prototype.hasOwnProperty.call(options, 'scheduledTimeframeDays')) {
    payload.scheduledTimeframeDays = options.scheduledTimeframeDays ?? null
  }

  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('adIntegrations')
    .doc(providerId)
    .set(payload, { merge: true })
}

export async function writeMetricsBatch(options: {
  userId: string
  metrics: NormalizedMetric[]
}): Promise<void> {
  const { userId, metrics } = options
  if (!metrics.length) return

  const batch: WriteBatch = adminDb.batch()
  const workspaceRef = await getWorkspaceRef(userId)
  const metricsCollection = workspaceRef.collection('adMetrics')

  metrics.forEach((metric) => {
    const metricRef = metricsCollection.doc()
    batch.set(metricRef, {
      ...metric,
      createdAt: serverTimestamp(),
    })
  })

  await batch.commit()
}

export async function deleteAdIntegration(options: {
  userId: string
  providerId: string
}): Promise<void> {
  const { userId, providerId } = options

  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('adIntegrations')
    .doc(providerId)
    .delete()
}
