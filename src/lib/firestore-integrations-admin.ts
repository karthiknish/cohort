import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'
import { FieldValue, Timestamp, WriteBatch } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'
import {
  buildIntegrationPersistPayload,
  buildIntegrationStatusUpdate,
  buildIntegrationUpdatePayload,
  buildSyncJobClaimUpdate,
  buildSyncJobCompleteUpdate,
  buildSyncJobFailUpdate,
  buildSyncJobPayload,
  createToTimestamp,
  mapIntegrationSnapshot,
  mapSyncJobSnapshot,
  prepareMetricsBatch,
  type TimestampHelpers,
} from '@/lib/firestore-integrations-shared'
import type { AdIntegration, NormalizedMetric, SyncJob } from '@/types/integrations'

type TimestampInput = Date | string | number | Timestamp | null | undefined

const toTimestamp = createToTimestamp<AdminTimestamp>({
  factory: {
    isTimestamp: (value: unknown): value is AdminTimestamp => value instanceof Timestamp,
    fromDate: (date) => Timestamp.fromDate(date) as AdminTimestamp,
    fromMillis: (millis) => Timestamp.fromMillis(millis) as AdminTimestamp,
  },
  parseString: (value) => {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : new Date(parsed)
  },
})

const timestampHelpers: TimestampHelpers<AdminTimestamp> = {
  toTimestamp,
  serverTimestamp: () => serverTimestamp(),
}

function serverTimestamp() {
  return FieldValue.serverTimestamp()
}

async function getWorkspaceRef(userId: string) {
  const workspaceId = await resolveWorkspaceIdForUser(userId)
  return adminDb.collection('workspaces').doc(workspaceId)
}

function getClientIntegrationsRef(
  workspaceRef: FirebaseFirestore.DocumentReference,
  clientId: string
): FirebaseFirestore.CollectionReference {
  return workspaceRef.collection('clients').doc(clientId).collection('adIntegrations')
}

async function getIntegrationsCollectionRef(options: {
  userId: string
  clientId?: string | null
}): Promise<FirebaseFirestore.CollectionReference> {
  const workspaceRef = await getWorkspaceRef(options.userId)
  const clientId = typeof options.clientId === 'string' && options.clientId.trim().length > 0
    ? options.clientId.trim()
    : null

  if (clientId) {
    return getClientIntegrationsRef(workspaceRef, clientId)
  }

  return workspaceRef.collection('adIntegrations')
}

export async function persistIntegrationTokens(options: {
  userId: string
  providerId: string
  clientId?: string | null
  accessToken: string | null
  idToken?: string | null
  scopes?: string[]
  status?: 'pending' | 'success' | 'error' | 'never'
  refreshToken?: string | null
  accountId?: string | null
  accountName?: string | null
  developerToken?: string | null
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
}): Promise<void> {
  const {
    userId,
    providerId,
    clientId,
    ...payloadOptions
  } = options

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId })
  const integrationRef = integrationsCollection.doc(providerId)

  const payload = buildIntegrationPersistPayload(payloadOptions, timestampHelpers)
  await integrationRef.set(payload, { merge: true })
}

export async function updateIntegrationCredentials(options: {
  userId: string
  providerId: string
  clientId?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
  developerToken?: string | null
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  accountId?: string | null
  accountName?: string | null
}): Promise<void> {
  const {
    userId,
    providerId,
    clientId,
    ...payloadOptions
  } = options

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId })
  const integrationRef = integrationsCollection.doc(providerId)

  const updatePayload = buildIntegrationUpdatePayload(payloadOptions, timestampHelpers)
  await integrationRef.set(updatePayload, { merge: true })
}

export async function enqueueSyncJob(options: {
  userId: string
  providerId: string
  clientId?: string | null
  jobType?: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays?: number
}): Promise<void> {
  const { userId, providerId, clientId = null, jobType = 'initial-backfill', timeframeDays = 90 } = options

  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('syncJobs')
    .add(buildSyncJobPayload({ providerId, clientId, jobType, timeframeDays }, timestampHelpers))
}

export async function getAdIntegration(options: {
  userId: string
  providerId: string
  clientId?: string | null
}): Promise<AdIntegration | null> {
  const { userId, providerId, clientId } = options

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId })
  const snapshot = await integrationsCollection.doc(providerId).get()

  if (!snapshot.exists) {
    return null
  }

  return mapIntegrationSnapshot(providerId, snapshot.id, snapshot.data() as Record<string, unknown>)
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
  await jobDoc.ref.update(buildSyncJobClaimUpdate(timestampHelpers))

  const data = jobDoc.data() as Record<string, unknown>
  return { ...mapSyncJobSnapshot(jobDoc.id, data), status: 'running' }
}

export async function completeSyncJob(options: { userId: string; jobId: string }): Promise<void> {
  const { userId, jobId } = options
  const workspaceRef = await getWorkspaceRef(userId)
  await workspaceRef
    .collection('syncJobs')
    .doc(jobId)
    .update(buildSyncJobCompleteUpdate(timestampHelpers))
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
    .update(buildSyncJobFailUpdate(message, timestampHelpers))
}

export async function updateIntegrationStatus(options: {
  userId: string
  providerId: string
  clientId?: string | null
  status: 'pending' | 'success' | 'error'
  message?: string | null
}): Promise<void> {
  const { userId, providerId, clientId } = options

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId })
  await integrationsCollection
    .doc(providerId)
    .update(buildIntegrationStatusUpdate(options, timestampHelpers))
}

export async function hasPendingSyncJob(options: {
  userId: string
  providerId: string
  clientId?: string | null
}): Promise<boolean> {
  const { userId, providerId, clientId } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const jobsRef = workspaceRef.collection('syncJobs')
  let query = jobsRef
    .where('providerId', '==', providerId)
    .where('status', 'in', ['queued', 'running']) as FirebaseFirestore.Query

  if (typeof clientId === 'string' && clientId.trim().length > 0) {
    query = query.where('clientId', '==', clientId.trim())
  }

  const snapshot = await query.limit(1).get()

  return !snapshot.empty
}

export async function markIntegrationSyncRequested(options: {
  userId: string
  providerId: string
  clientId?: string | null
  status?: 'pending' | 'never' | 'error' | 'success'
}): Promise<void> {
  const { userId, providerId, clientId, status = 'pending' } = options

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId })
  await integrationsCollection
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
  clientId?: string | null
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

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId: options.clientId })
  await integrationsCollection
    .doc(providerId)
    .set(payload, { merge: true })
}

export async function writeMetricsBatch(options: {
  userId: string
  clientId?: string | null
  metrics: NormalizedMetric[]
}): Promise<void> {
  const { userId, metrics } = options
  if (!metrics.length) return

  const batch: WriteBatch = adminDb.batch()
  const workspaceRef = await getWorkspaceRef(userId)
  const metricsCollection = workspaceRef.collection('adMetrics')

  const resolvedClientId = typeof options.clientId === 'string' && options.clientId.trim().length > 0
    ? options.clientId.trim()
    : null

  prepareMetricsBatch(metrics, timestampHelpers).forEach((metric) => {
    const metricRef = metricsCollection.doc()
    batch.set(metricRef, {
      ...metric,
      clientId: resolvedClientId,
    })
  })

  await batch.commit()
}

export async function deleteAdIntegration(options: {
  userId: string
  providerId: string
  clientId?: string | null
}): Promise<void> {
  const { userId, providerId, clientId } = options

  const integrationsCollection = await getIntegrationsCollectionRef({ userId, clientId })
  await integrationsCollection.doc(providerId).delete()
}

export async function deleteSyncJobs(options: {
  userId: string
  providerId: string
  clientId?: string | null
}): Promise<void> {
  const { userId, providerId, clientId } = options

  const workspaceRef = await getWorkspaceRef(userId)
  const jobsRef = workspaceRef.collection('syncJobs')
  let query = jobsRef
    .where('providerId', '==', providerId)
    .where('status', 'in', ['queued', 'running', 'failed']) as FirebaseFirestore.Query

  if (typeof clientId === 'string' && clientId.trim().length > 0) {
    query = query.where('clientId', '==', clientId.trim())
  }

  const snapshot = await query.get()
  if (snapshot.empty) return

  const batch = adminDb.batch()
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })

  await batch.commit()
}
