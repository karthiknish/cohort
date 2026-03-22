import { ConvexHttpClient } from 'convex/browser'

import { internal } from '/_generated/api'

const CACHE_TTL_MS = 5 * 60 * 1000

type CachedPreference = {
  value: SchedulerAlertPreference
  expiresAt: number
}

const preferenceCache = new Map<string, CachedPreference>()

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
type QueryReference = Parameters<ConvexHttpClient['query']>[0]
type MutationReference = Parameters<ConvexHttpClient['mutation']>[0]

function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

export type SchedulerAlertPreference = {
  failureThreshold: number | null
}

function isValidThreshold(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function toSchedulerAlertPreference(value: unknown): SchedulerAlertPreference | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const threshold = (value as Record<string, unknown>).failureThreshold
  if (threshold === null || isValidThreshold(threshold)) {
    return { failureThreshold: threshold }
  }
  return null
}

export async function getSchedulerAlertPreference(providerId: string): Promise<SchedulerAlertPreference | null> {
  const cached = preferenceCache.get(providerId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const convex = getConvexClient()
  if (!convex) {
    preferenceCache.delete(providerId)
    return null
  }

  const result = await convex.query(internal.schedulerAlertPreferences.get as unknown as QueryReference, { providerId })
  const preference = toSchedulerAlertPreference(result)
  if (!preference) {
    preferenceCache.delete(providerId)
    return null
  }

  preferenceCache.set(providerId, { value: preference, expiresAt: Date.now() + CACHE_TTL_MS })
  return preference
}

export async function listSchedulerAlertPreferences(): Promise<Record<string, SchedulerAlertPreference>> {
  const convex = getConvexClient()
  if (!convex) {
    return {}
  }

  const result = await convex.query(internal.schedulerAlertPreferences.list as unknown as QueryReference, {})
  const normalized: Record<string, SchedulerAlertPreference> = {}

  if (result && typeof result === 'object' && !Array.isArray(result)) {
    for (const [providerId, pref] of Object.entries(result as Record<string, unknown>)) {
      const preference = toSchedulerAlertPreference(pref)
      if (!preference) continue
      preferenceCache.set(providerId, { value: preference, expiresAt: Date.now() + CACHE_TTL_MS })
      normalized[providerId] = preference
    }
  }

  return normalized
}

export async function upsertSchedulerAlertPreference(providerId: string, preference: SchedulerAlertPreference): Promise<void> {
  if (preference.failureThreshold !== null && !isValidThreshold(preference.failureThreshold)) {
    throw new Error('failureThreshold must be a non-negative number or null')
  }

  const convex = getConvexClient()
  if (!convex) {
    throw new Error('Convex client not available')
  }

  await convex.mutation(internal.schedulerAlertPreferences.upsert as unknown as MutationReference, {
    providerId,
    failureThreshold: preference.failureThreshold,
  })

  preferenceCache.set(providerId, { value: { failureThreshold: preference.failureThreshold }, expiresAt: Date.now() + CACHE_TTL_MS })
}
