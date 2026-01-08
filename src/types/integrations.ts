import type { Timestamp as ClientTimestamp } from 'firebase/firestore'
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'

export type AnyFirestoreTimestamp = ClientTimestamp | AdminTimestamp

export type SyncJobStatus = 'queued' | 'running' | 'success' | 'error'
export type SyncJobType = 'initial-backfill' | 'scheduled-sync' | 'manual-sync'

export interface SyncJob {
  id: string
  providerId: string
  /** Optional client scope for this job (selected client in dashboard). */
  clientId?: string | null
  jobType: SyncJobType
  timeframeDays: number
  status: SyncJobStatus
  createdAt?: AnyFirestoreTimestamp | null
  startedAt?: AnyFirestoreTimestamp | null
  processedAt?: AnyFirestoreTimestamp | null
  errorMessage?: string | null
}

export interface AdIntegration {
  id: string
  providerId: string
  accessToken: string | null
  idToken?: string | null
  refreshToken?: string | null
  scopes: string[]
  accountId?: string | null
  developerToken?: string | null
  loginCustomerId?: string | null
  lastSyncStatus?: 'never' | 'pending' | 'success' | 'error'
  lastSyncMessage?: string | null
  lastSyncedAt?: AnyFirestoreTimestamp | null
  lastSyncRequestedAt?: AnyFirestoreTimestamp | null
  linkedAt?: AnyFirestoreTimestamp | null
  managerCustomerId?: string | null
  accessTokenExpiresAt?: AnyFirestoreTimestamp | null
  refreshTokenExpiresAt?: AnyFirestoreTimestamp | null
  autoSyncEnabled?: boolean | null
  syncFrequencyMinutes?: number | null
  scheduledTimeframeDays?: number | null
}

export interface NormalizedMetric {
  providerId: string
  /** Optional client scope for this metric record. */
  clientId?: string | null
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  campaignId?: string
  campaignName?: string
  creatives?: Array<{
    id: string
    name: string
    type: string
    url?: string
    spend?: number
    impressions?: number
    clicks?: number
    conversions?: number
    revenue?: number
  }>
  rawPayload?: unknown
}
