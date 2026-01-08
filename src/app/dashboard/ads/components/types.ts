import type { LucideIcon } from 'lucide-react'

export interface IntegrationStatus {
  providerId: string
  status: string
  lastSyncedAt?: string | null
  lastSyncRequestedAt?: string | null
  message?: string | null
  linkedAt?: string | null
  accountId?: string | null
  accountName?: string | null
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
  summary?: any
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

// =============================================================================
// API ERROR HANDLING
// =============================================================================

/**
 * Standard shape of error responses from API endpoints.
 */
export interface ApiErrorResponse {
  error?: string
  message?: string
}

/**
 * Type guard to parse error messages from unknown API response payloads.
 * Returns the error message string or null if not found.
 */
export function parseApiError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  
  const obj = payload as Record<string, unknown>
  
  if (typeof obj.error === 'string' && obj.error.length > 0) {
    return obj.error
  }
  
  if (typeof obj.message === 'string' && obj.message.length > 0) {
    return obj.message
  }
  
  return null
}

/**
 * Extracts error message from a fetch response or error object.
 * Provides consistent error messages across the codebase.
 */
export async function extractApiError(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const payload = await response.json()
    return parseApiError(payload) ?? fallback
  } catch {
    return fallback
  }
}
