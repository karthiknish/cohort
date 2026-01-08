import type { AdIntegration, AnyFirestoreTimestamp, NormalizedMetric, SyncJob } from '@/types/integrations'
import { coerceStringArray } from '@/lib/utils'

export type TimestampInput = Date | string | number | unknown | null | undefined

export type TimestampHelpers<TTimestamp> = {
  toTimestamp: (value: TimestampInput) => TTimestamp | null
  serverTimestamp: () => unknown
}

export type TimestampFactory<TTimestamp> = {
  isTimestamp: (value: unknown) => value is TTimestamp
  fromDate: (date: Date) => TTimestamp
  fromMillis: (millis: number) => TTimestamp
}

export function createToTimestamp<TTimestamp>(options: {
  factory: TimestampFactory<TTimestamp>
  parseString: (value: string) => Date | null
}): (value: TimestampInput) => TTimestamp | null {
  const { factory, parseString } = options

  return (value: TimestampInput): TTimestamp | null => {
    if (value === null || value === undefined) {
      return null
    }

    if (factory.isTimestamp(value)) {
      return value
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : factory.fromDate(value)
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return null
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : factory.fromDate(date)
    }

    if (typeof value === 'string') {
      const date = parseString(value)
      return date ? factory.fromDate(date) : null
    }

    return null
  }
}

type PersistTokensOptions = {
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
}

type UpdateCredentialsOptions = {
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: TimestampInput
  refreshTokenExpiresAt?: TimestampInput
  developerToken?: string | null
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  accountId?: string | null
}

type SyncJobOptions = {
  providerId: string
  clientId?: string | null
  jobType?: SyncJob['jobType']
  timeframeDays?: number
}

export function buildIntegrationPersistPayload<TTimestamp>(
  options: PersistTokensOptions,
  helpers: TimestampHelpers<TTimestamp>
) {
  const {
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

  return {
    accessToken,
    idToken: idToken ?? null,
    refreshToken,
    scopes,
    linkedAt: helpers.serverTimestamp(),
    lastSyncStatus: status,
    lastSyncRequestedAt: helpers.serverTimestamp(),
    accountId,
    developerToken,
    loginCustomerId,
    managerCustomerId,
    accessTokenExpiresAt: helpers.toTimestamp(accessTokenExpiresAt),
    refreshTokenExpiresAt: helpers.toTimestamp(refreshTokenExpiresAt),
  }
}

export function buildIntegrationUpdatePayload<TTimestamp>(
  options: UpdateCredentialsOptions,
  helpers: TimestampHelpers<TTimestamp>
) {
  const {
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

  const updatePayload: Record<string, unknown> = {
    lastSyncRequestedAt: helpers.serverTimestamp(),
  }

  if (accessToken !== undefined) updatePayload.accessToken = accessToken
  if (refreshToken !== undefined) updatePayload.refreshToken = refreshToken
  if (idToken !== undefined) updatePayload.idToken = idToken
  if (developerToken !== undefined) updatePayload.developerToken = developerToken
  if (loginCustomerId !== undefined) updatePayload.loginCustomerId = loginCustomerId
  if (managerCustomerId !== undefined) updatePayload.managerCustomerId = managerCustomerId
  if (accountId !== undefined) updatePayload.accountId = accountId
  if (accessTokenExpiresAt !== undefined) {
    updatePayload.accessTokenExpiresAt = helpers.toTimestamp(accessTokenExpiresAt)
  }
  if (refreshTokenExpiresAt !== undefined) {
    updatePayload.refreshTokenExpiresAt = helpers.toTimestamp(refreshTokenExpiresAt)
  }

  return updatePayload
}

export function buildSyncJobPayload<TTimestamp>(
  options: SyncJobOptions,
  helpers: TimestampHelpers<TTimestamp>
) {
  const { providerId, clientId = null, jobType = 'initial-backfill', timeframeDays = 90 } = options
  return {
    providerId,
    clientId,
    jobType,
    status: 'queued' as const,
    timeframeDays,
    createdAt: helpers.serverTimestamp(),
    startedAt: null,
    processedAt: null,
    errorMessage: null,
  }
}

export function mapIntegrationSnapshot<TTimestamp extends { toDate?: () => Date }>(
  providerId: string,
  snapshotId: string,
  data: Record<string, unknown>
): AdIntegration {
  return {
    id: snapshotId,
    providerId,
    accessToken: (data.accessToken as string | null) ?? null,
    idToken: (data.idToken as string | null) ?? null,
    refreshToken: (data.refreshToken as string | null) ?? null,
    scopes: coerceStringArray(data.scopes),
    accountId: (data.accountId as string | undefined) ?? null,
    developerToken: (data.developerToken as string | undefined) ?? null,
    loginCustomerId: (data.loginCustomerId as string | undefined) ?? null,
    managerCustomerId: (data.managerCustomerId as string | undefined) ?? null,
    accessTokenExpiresAt: (data.accessTokenExpiresAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    refreshTokenExpiresAt: (data.refreshTokenExpiresAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    lastSyncStatus: (data.lastSyncStatus as AdIntegration['lastSyncStatus']) ?? 'never',
    lastSyncMessage: (data.lastSyncMessage as string | undefined) ?? null,
    lastSyncedAt: (data.lastSyncedAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    lastSyncRequestedAt: (data.lastSyncRequestedAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    linkedAt: (data.linkedAt as AnyFirestoreTimestamp | null | undefined) ?? null,
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

export function mapSyncJobSnapshot<TTimestamp>(
  docId: string,
  data: Record<string, unknown>
): SyncJob {
  return {
    id: docId,
    providerId: (data.providerId as string | undefined) ?? docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    jobType: (data.jobType as SyncJob['jobType']) ?? 'initial-backfill',
    timeframeDays: (data.timeframeDays as number | undefined) ?? 90,
    status: (data.status as SyncJob['status']) ?? 'queued',
    createdAt: (data.createdAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    startedAt: (data.startedAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    processedAt: (data.processedAt as AnyFirestoreTimestamp | null | undefined) ?? null,
    errorMessage: (data.errorMessage as string | undefined) ?? null,
  }
}

export function buildSyncJobClaimUpdate(helpers: TimestampHelpers<unknown>) {
  return {
    status: 'running' as const,
    startedAt: helpers.serverTimestamp(),
    errorMessage: null,
  }
}

export function buildSyncJobCompleteUpdate(helpers: TimestampHelpers<unknown>) {
  return {
    status: 'success' as const,
    processedAt: helpers.serverTimestamp(),
  }
}

export function buildSyncJobFailUpdate(
  message: string,
  helpers: TimestampHelpers<unknown>
) {
  return {
    status: 'error' as const,
    processedAt: helpers.serverTimestamp(),
    errorMessage: message,
  }
}

export function buildIntegrationStatusUpdate(
  options: { status: 'pending' | 'success' | 'error'; message?: string | null },
  helpers: TimestampHelpers<unknown>
) {
  const { status, message = null } = options
  return {
    lastSyncStatus: status,
    lastSyncMessage: message,
    lastSyncedAt: status === 'success' ? helpers.serverTimestamp() : null,
  }
}

export function prepareMetricsBatch<TTimestamp>(
  metrics: NormalizedMetric[],
  helpers: TimestampHelpers<TTimestamp>
) {
  return metrics.map((metric) => ({
    ...metric,
    createdAt: helpers.serverTimestamp(),
  }))
}
