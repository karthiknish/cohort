import type { Timestamp } from 'firebase/firestore'

export type SyncJobStatus = 'queued' | 'running' | 'success' | 'error'
export type SyncJobType = 'initial-backfill' | 'scheduled-sync' | 'manual-sync'

export interface SyncJob {
  id: string
  providerId: string
  jobType: SyncJobType
  timeframeDays: number
  status: SyncJobStatus
  createdAt?: Timestamp | null
  startedAt?: Timestamp | null
  processedAt?: Timestamp | null
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
  lastSyncedAt?: Timestamp | null
  linkedAt?: Timestamp | null
}

export interface NormalizedMetric {
  providerId: string
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
