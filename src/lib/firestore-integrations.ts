import {
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
import {
  AdIntegration,
  NormalizedMetric,
  SyncJob,
} from '@/types/integrations'

export async function persistIntegrationTokens(options: {
  userId: string
  providerId: string
  accessToken: string | null
  idToken?: string | null
  scopes?: string[]
  status?: 'pending' | 'success' | 'error' | 'never'
  refreshToken?: string | null
  accountId?: string | null
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
  } = options
  const integrationRef = doc(db, 'users', userId, 'adIntegrations', providerId)

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
    },
    { merge: true }
  )
}

export async function enqueueSyncJob(options: {
  userId: string
  providerId: string
  jobType?: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays?: number
}): Promise<void> {
  const { userId, providerId, jobType = 'initial-backfill', timeframeDays = 90 } = options
  await addDoc(collection(db, 'users', userId, 'syncJobs'), {
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
  const ref = doc(db, 'users', userId, 'adIntegrations', providerId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data() as Record<string, any>
  return {
    id: snapshot.id,
    providerId,
    accessToken: (data.accessToken as string | null) ?? null,
    idToken: (data.idToken as string | null) ?? null,
    refreshToken: (data.refreshToken as string | null) ?? null,
    scopes: (data.scopes as string[] | undefined) ?? [],
    accountId: (data.accountId as string | undefined) ?? null,
    developerToken: (data.developerToken as string | undefined) ?? null,
    loginCustomerId: (data.loginCustomerId as string | undefined) ?? null,
    lastSyncStatus: (data.lastSyncStatus as any) ?? 'never',
    lastSyncMessage: (data.lastSyncMessage as string | undefined) ?? null,
    lastSyncedAt: data.lastSyncedAt ?? null,
    linkedAt: data.linkedAt ?? null,
  }
}

export async function claimNextSyncJob(options: {
  userId: string
}): Promise<SyncJob | null> {
  const { userId } = options
  const jobsRef = collection(db, 'users', userId, 'syncJobs')
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

  const data = jobDoc.data() as Record<string, any>
  return {
    id: jobDoc.id,
    providerId: data.providerId as string,
    jobType: (data.jobType as SyncJob['jobType']) ?? 'initial-backfill',
    timeframeDays: (data.timeframeDays as number | undefined) ?? 90,
    status: 'running',
    createdAt: data.createdAt ?? null,
    startedAt: null,
    processedAt: null,
    errorMessage: null,
  }
}

export async function completeSyncJob(options: {
  userId: string
  jobId: string
}): Promise<void> {
  const { userId, jobId } = options
  const jobRef = doc(db, 'users', userId, 'syncJobs', jobId)
  await updateDoc(jobRef, {
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
  const jobRef = doc(db, 'users', userId, 'syncJobs', jobId)
  await updateDoc(jobRef, {
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
  const integrationRef = doc(db, 'users', userId, 'adIntegrations', providerId)
  await updateDoc(integrationRef, {
    lastSyncStatus: status,
    lastSyncMessage: message,
    lastSyncedAt: status === 'success' ? serverTimestamp() : null,
  })
}

export async function writeMetricsBatch(options: {
  userId: string
  metrics: NormalizedMetric[]
}): Promise<void> {
  const { userId, metrics } = options
  if (!metrics.length) return

  const batch = writeBatch(db)
  const metricsCollection = collection(db, 'users', userId, 'adMetrics')

  metrics.forEach((metric) => {
    const metricRef = doc(metricsCollection)
    batch.set(metricRef, {
      ...metric,
      createdAt: serverTimestamp(),
    })
  })

  await batch.commit()
}
