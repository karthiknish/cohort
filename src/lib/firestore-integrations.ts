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
  AdIntegration,
  NormalizedMetric,
  SyncJob,
} from '@/types/integrations'
import { coerceStringArray } from '@/lib/utils'

type StoredIntegration = {
  accessToken?: string | null
  idToken?: string | null
  refreshToken?: string | null
  scopes?: unknown
  accountId?: string | null
  developerToken?: string | null
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  accessTokenExpiresAt?: Timestamp | null
  refreshTokenExpiresAt?: Timestamp | null
  lastSyncStatus?: AdIntegration['lastSyncStatus']
  lastSyncMessage?: string | null
  lastSyncedAt?: Timestamp | null
  linkedAt?: Timestamp | null
  lastSyncRequestedAt?: Timestamp | null
}

type StoredSyncJob = {
  providerId?: string
  jobType?: SyncJob['jobType']
  timeframeDays?: number
  status?: SyncJob['status']
  createdAt?: Timestamp | null
  startedAt?: Timestamp | null
  processedAt?: Timestamp | null
  errorMessage?: string | null
}

type TimestampInput = Timestamp | Date | string | number | null | undefined

function toTimestamp(value: TimestampInput): Timestamp | null {
  if (!value && value !== 0) {
    return null
  }

  if (value instanceof Timestamp) {
    return value
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : Timestamp.fromDate(value)
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date)
  }

  if (typeof value === 'string') {
    const date = parseDate(value)
    return date ? Timestamp.fromDate(date) : null
  }

  return null
}

export async function persistIntegrationTokens(options: {
  workspaceId: string
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
    workspaceId,
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
  const integrationRef = doc(db, 'workspaces', workspaceId, 'adIntegrations', providerId)

  await setDoc(
    integrationRef,
    {
      accessToken,
      idToken: idToken ?? null,
      refreshToken,
      scopes,
      linkedAt: serverTimestamp(),
      lastSyncStatus: status,
      lastSyncRequestedAt: serverTimestamp(),
      accountId: accountId ?? null,
      developerToken,
      loginCustomerId,
      managerCustomerId,
      accessTokenExpiresAt: toTimestamp(accessTokenExpiresAt),
      refreshTokenExpiresAt: toTimestamp(refreshTokenExpiresAt),
    },
    { merge: true }
  )
}

export async function updateIntegrationCredentials(options: {
  workspaceId: string
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
    workspaceId,
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

  const integrationRef = doc(db, 'workspaces', workspaceId, 'adIntegrations', providerId)

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

  await setDoc(integrationRef, updatePayload, { merge: true })
}

export async function enqueueSyncJob(options: {
  workspaceId: string
  providerId: string
  jobType?: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays?: number
}): Promise<void> {
  const { workspaceId, providerId, jobType = 'initial-backfill', timeframeDays = 90 } = options
  await addDoc(collection(db, 'workspaces', workspaceId, 'syncJobs'), {
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
  workspaceId: string
  providerId: string
}): Promise<AdIntegration | null> {
  const { workspaceId, providerId } = options
  const ref = doc(db, 'workspaces', workspaceId, 'adIntegrations', providerId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data() as StoredIntegration
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
    accessTokenExpiresAt: data.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt ?? null,
    lastSyncStatus: data.lastSyncStatus ?? 'never',
    lastSyncMessage: (data.lastSyncMessage as string | undefined) ?? null,
    lastSyncedAt: data.lastSyncedAt ?? null,
    linkedAt: data.linkedAt ?? null,
  }
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
  await updateDoc(jobDoc.ref, {
    status: 'running',
    startedAt: serverTimestamp(),
    errorMessage: null,
  })

  const data = jobDoc.data() as StoredSyncJob
  return {
    id: jobDoc.id,
    providerId: data.providerId ?? jobDoc.id,
    jobType: (data.jobType as SyncJob['jobType']) ?? 'initial-backfill',
    timeframeDays: (data.timeframeDays as number | undefined) ?? 90,
    status: 'running',
    createdAt: data.createdAt ?? null,
    startedAt: data.startedAt ?? null,
    processedAt: data.processedAt ?? null,
    errorMessage: data.errorMessage ?? null,
  }
}

export async function completeSyncJob(options: {
  workspaceId: string
  jobId: string
}): Promise<void> {
  const { workspaceId, jobId } = options
  const jobRef = doc(db, 'workspaces', workspaceId, 'syncJobs', jobId)
  await updateDoc(jobRef, {
    status: 'success',
    processedAt: serverTimestamp(),
  })
}

export async function failSyncJob(options: {
  workspaceId: string
  jobId: string
  message: string
}): Promise<void> {
  const { workspaceId, jobId, message } = options
  const jobRef = doc(db, 'workspaces', workspaceId, 'syncJobs', jobId)
  await updateDoc(jobRef, {
    status: 'error',
    processedAt: serverTimestamp(),
    errorMessage: message,
  })
}

export async function updateIntegrationStatus(options: {
  workspaceId: string
  providerId: string
  status: 'pending' | 'success' | 'error'
  message?: string | null
}): Promise<void> {
  const { workspaceId, providerId, status, message = null } = options
  const integrationRef = doc(db, 'workspaces', workspaceId, 'adIntegrations', providerId)
  await updateDoc(integrationRef, {
    lastSyncStatus: status,
    lastSyncMessage: message,
    lastSyncedAt: status === 'success' ? serverTimestamp() : null,
  })
}

export async function writeMetricsBatch(options: {
  workspaceId: string
  metrics: NormalizedMetric[]
}): Promise<void> {
  const { workspaceId, metrics } = options
  if (!metrics.length) return

  const batch = writeBatch(db)
  const metricsCollection = collection(db, 'workspaces', workspaceId, 'adMetrics')

  metrics.forEach((metric) => {
    const metricRef = doc(metricsCollection)
    batch.set(metricRef, {
      ...metric,
      createdAt: serverTimestamp(),
    })
  })

  await batch.commit()
}
