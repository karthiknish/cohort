import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'

const COLLECTION_PATH = ['admin', 'scheduler', 'alertPreferences'] as const
const CACHE_TTL_MS = 5 * 60 * 1000

type CachedPreference = {
  value: SchedulerAlertPreference
  expiresAt: number
}

const preferenceCache = new Map<string, CachedPreference>()

export type SchedulerAlertPreference = {
  failureThreshold: number | null
}

function getCollectionRef() {
  return adminDb.collection(COLLECTION_PATH[0]).doc(COLLECTION_PATH[1]).collection(COLLECTION_PATH[2])
}

function isValidThreshold(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export async function getSchedulerAlertPreference(providerId: string): Promise<SchedulerAlertPreference | null> {
  const cached = preferenceCache.get(providerId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const snapshot = await getCollectionRef().doc(providerId).get()
  if (!snapshot.exists) {
    preferenceCache.delete(providerId)
    return null
  }

  const data = snapshot.data() as Record<string, unknown>
  const failureThreshold = isValidThreshold(data.failureThreshold) ? data.failureThreshold : null
  const preference: SchedulerAlertPreference = { failureThreshold }

  preferenceCache.set(providerId, { value: preference, expiresAt: Date.now() + CACHE_TTL_MS })
  return preference
}

export async function listSchedulerAlertPreferences(): Promise<Record<string, SchedulerAlertPreference>> {
  const snapshot = await getCollectionRef().get()
  const result: Record<string, SchedulerAlertPreference> = {}

  snapshot.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>
    const failureThreshold = isValidThreshold(data.failureThreshold) ? data.failureThreshold : null
    result[doc.id] = { failureThreshold }
    preferenceCache.set(doc.id, { value: result[doc.id], expiresAt: Date.now() + CACHE_TTL_MS })
  })

  return result
}

export async function upsertSchedulerAlertPreference(providerId: string, preference: SchedulerAlertPreference): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (preference.failureThreshold === null) {
    payload.failureThreshold = null
  } else if (isValidThreshold(preference.failureThreshold)) {
    payload.failureThreshold = preference.failureThreshold
  } else {
    throw new Error('failureThreshold must be a non-negative number or null')
  }

  await getCollectionRef().doc(providerId).set(payload, { merge: true })
  preferenceCache.set(providerId, { value: { failureThreshold: preference.failureThreshold }, expiresAt: Date.now() + CACHE_TTL_MS })
}
