import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { parseDate } from '@/lib/dates'
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
  type TimestampInput,
} from '@/lib/firestore-integrations-shared'
import type { AdIntegration, NormalizedMetric, SyncJob } from '@/types/integrations'

const toTimestamp = createToTimestamp<Timestamp>({
  factory: {
    isTimestamp: (value: unknown): value is Timestamp => value instanceof Timestamp,
    fromDate: (date) => Timestamp.fromDate(date),
    fromMillis: (millis) => Timestamp.fromMillis(millis),
  },
  parseString: (value) => parseDate(value),
})

const timestampHelpers: TimestampHelpers<Timestamp> = {
  toTimestamp,
  serverTimestamp: () => serverTimestamp(),
}

function getIntegrationDocRef(workspaceId: string, providerId: string, clientId?: string | null) {
  const resolvedClientId = typeof clientId === 'string' && clientId.trim().length > 0
    ? clientId.trim()
    : null

  if (resolvedClientId) {
    return doc(db, 'workspaces', workspaceId, 'clients', resolvedClientId, 'adIntegrations', providerId)
  }

  return doc(db, 'workspaces', workspaceId, 'adIntegrations', providerId)
}

export async function persistIntegrationTokens(options: {
  workspaceId: string
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
    workspaceId,
    providerId,
    clientId,
    ...payloadOptions
  } = options
  const integrationRef = getIntegrationDocRef(workspaceId, providerId, clientId)

  const payload = buildIntegrationPersistPayload(payloadOptions, timestampHelpers)
  await setDoc(integrationRef, payload, { merge: true })
}

export async function updateIntegrationCredentials(options: {
  workspaceId: string
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
    workspaceId,
    providerId,
    clientId,
    ...payloadOptions
  } = options

  const integrationRef = getIntegrationDocRef(workspaceId, providerId, clientId)

  const updatePayload = buildIntegrationUpdatePayload(payloadOptions, timestampHelpers)
  await setDoc(integrationRef, updatePayload, { merge: true })
}

export async function enqueueSyncJob(options: {
  workspaceId: string
  providerId: string
  clientId?: string | null
  jobType?: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays?: number
}): Promise<void> {
  const { workspaceId, providerId, clientId = null, jobType = 'initial-backfill', timeframeDays = 90 } = options
  await addDoc(
    collection(db, 'workspaces', workspaceId, 'syncJobs'),
    buildSyncJobPayload({ providerId, clientId, jobType, timeframeDays }, timestampHelpers)
  )
}

export async function getAdIntegration(options: {
  workspaceId: string
  providerId: string
  clientId?: string | null
}): Promise<AdIntegration | null> {
  const { workspaceId, providerId, clientId } = options
  const ref = getIntegrationDocRef(workspaceId, providerId, clientId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    return null
  }

  return mapIntegrationSnapshot(providerId, snapshot.id, snapshot.data() as Record<string, unknown>)
}

export async function claimNextSyncJob(options: {
  workspaceId: string
}): Promise<SyncJob | null> {
  const { workspaceId } = options
  const jobsRef = collection(db, 'workspaces', workspaceId, 'syncJobs')
  const jobQuery = query(jobsRef, where('status', '==', 'queued'), orderBy('createdAt', 'asc'), limit(1))
  const snapshot = await getDocs(jobQuery)

  if (snapshot.empty) {
    return null
  }

  const jobDoc = snapshot.docs[0]
  await updateDoc(jobDoc.ref, buildSyncJobClaimUpdate(timestampHelpers))

  const data = jobDoc.data() as Record<string, unknown>
  return { ...mapSyncJobSnapshot(jobDoc.id, data), status: 'running' }
}

export async function completeSyncJob(options: {
  workspaceId: string
  jobId: string
}): Promise<void> {
  const { workspaceId, jobId } = options
  const jobRef = doc(db, 'workspaces', workspaceId, 'syncJobs', jobId)
  await updateDoc(jobRef, buildSyncJobCompleteUpdate(timestampHelpers))
}

export async function failSyncJob(options: {
  workspaceId: string
  jobId: string
  message: string
}): Promise<void> {
  const { workspaceId, jobId, message } = options
  const jobRef = doc(db, 'workspaces', workspaceId, 'syncJobs', jobId)
  await updateDoc(jobRef, buildSyncJobFailUpdate(message, timestampHelpers))
}

export async function updateIntegrationStatus(options: {
  workspaceId: string
  providerId: string
  clientId?: string | null
  status: 'pending' | 'success' | 'error'
  message?: string | null
}): Promise<void> {
  const { workspaceId, providerId, clientId } = options
  const integrationRef = getIntegrationDocRef(workspaceId, providerId, clientId)
  await updateDoc(integrationRef, buildIntegrationStatusUpdate(options, timestampHelpers))
}

export async function writeMetricsBatch(options: {
  workspaceId: string
  metrics: NormalizedMetric[]
}): Promise<void> {
  const { workspaceId, metrics } = options
  if (!metrics.length) return

  const batch = writeBatch(db)
  const metricsCollection = collection(db, 'workspaces', workspaceId, 'adMetrics')

  prepareMetricsBatch(metrics, timestampHelpers).forEach((metric) => {
    const metricRef = doc(metricsCollection)
    batch.set(metricRef, metric)
  })

  await batch.commit()
}
