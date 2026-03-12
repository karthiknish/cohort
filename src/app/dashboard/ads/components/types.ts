export interface IntegrationStatus {
  providerId: string
  status: string
  lastSyncedAt?: string | null
  lastSyncRequestedAt?: string | null
  message?: string | null
  linkedAt?: string | null
  accountId?: string | null
  accountName?: string | null
  currency?: string | null
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
  /** The ad account ID this metric belongs to (for multi-account support). */
  accountId?: string | null
  /** Native account currency for this metric row (native account currency). */
  currency?: string | null
  /** How the currency was determined ('metric' | 'integration' | 'unknown'). */
  currencySource?: string | null
  /** Canonical surface id (e.g. 'facebook', 'instagram', 'audience_network'). */
  surfaceId?: string | null
  /** Legacy: Meta publisher platform or equivalent reporting surface. */
  publisherPlatform?: string | null
  /** Campaign identifier used for dedup and drill-down. */
  campaignId?: string | null
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
  summary?: MetricsSummary | null
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

export type MetricsSummary = {
  totals: Totals
  providers: Record<string, Totals>
  count: number
}

// =============================================================================
// V2 CURRENCY-AWARE SUMMARY TYPES
// =============================================================================

export type FinancialComparability = 'single_currency' | 'mixed_currency' | 'unknown_currency'

export type DeliveryTotals = {
  impressions: number
  clicks: number
  conversions: number
}

/**
 * Currency-aware financial totals from the V2 read model.
 * Check `comparability` before displaying aggregate spend/revenue/ROAS/CPA.
 */
export type FinancialTotals = {
  comparability: FinancialComparability
  totalsByCurrency: Record<string, { spend: number; revenue: number }>
  /** Non-null only when comparability === 'single_currency'. */
  primaryCurrency: string | null
  /** Non-null only when comparability === 'single_currency'. */
  spend: number | null
  /** Non-null only when comparability === 'single_currency'. */
  revenue: number | null
}

export type ProviderInsightsSummary = {
  providerId: string
  accountIds: string[]
  currencies: string[]
  deliveryTotals: DeliveryTotals
  financialTotals: FinancialTotals
}

/**
 * V2 insights summary contract. Replaces the plain-numeric MetricsSummary for financial display.
 * DeliveryTotals are always valid; FinancialTotals require comparability === 'single_currency'.
 */
export type AdsInsightsSummary = {
  deliveryTotals: DeliveryTotals
  financialTotals: FinancialTotals
  providers: ProviderInsightsSummary[]
  warnings: string[]
  count: number
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
  icon: React.ComponentType<{ className?: string }>
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
