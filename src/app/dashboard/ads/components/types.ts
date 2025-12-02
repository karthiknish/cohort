import type { LucideIcon } from 'lucide-react'

export interface IntegrationStatus {
  providerId: string
  status: string
  lastSyncedAt?: string | null
  lastSyncRequestedAt?: string | null
  message?: string | null
  linkedAt?: string | null
  accountId?: string | null
  autoSyncEnabled?: boolean | null
  syncFrequencyMinutes?: number | null
  scheduledTimeframeDays?: number | null
}

export interface IntegrationStatusResponse {
  statuses: IntegrationStatus[]
}

export interface MetricRecord {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  createdAt?: string | null
}

export interface MetricsResponse {
  metrics: MetricRecord[]
  nextCursor: string | null
}

export type ProviderSummary = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export type Totals = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export type ProviderAutomationFormState = {
  autoSyncEnabled: boolean
  syncFrequencyMinutes: number
  scheduledTimeframeDays: number
}

export interface AdPlatform {
  id: string
  name: string
  description: string
  icon: LucideIcon
  connect?: () => Promise<void>
  mode?: 'oauth'
}

export interface SummaryCard {
  id: string
  label: string
  value: string
  helper: string
}
