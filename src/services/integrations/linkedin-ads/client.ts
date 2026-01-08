// =============================================================================
// LINKEDIN ADS API CLIENT - Core request execution with retry logic
// =============================================================================

import { formatDate, toISO } from '@/lib/dates'
import { linkedinAdsClient } from '../shared/base-client'
import { executeIntegrationRequest } from '../shared/execute-integration-request'

export { DEFAULT_RETRY_CONFIG } from '../shared/retry'

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function buildTimeRange(timeframeDays: number): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1))
  
  return {
    start: toISO(start).split('T')[0],
    end: toISO(now).split('T')[0],
  }
}

export function normalizeCurrency(value: unknown): number {
  if (value === null || value === undefined) return 0
  
  if (typeof value === 'object' && value !== null) {
    const currencyObj = value as { amount?: unknown; currencyCode?: string }
    if (currencyObj.amount !== undefined) {
      const amount = typeof currencyObj.amount === 'string' 
        ? parseFloat(currencyObj.amount) 
        : Number(currencyObj.amount)
      return Number.isFinite(amount) ? amount : 0
    }
  }
  
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  
  return 0
}

export function coerceNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

// =============================================================================
// EXECUTE LINKEDIN API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions {
  url: string
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

export async function executeLinkedInApiRequest<T>(
  options: ExecuteRequestOptions
): Promise<{ response: Response; payload: T }> {
  return executeIntegrationRequest<T>(linkedinAdsClient, options)
}

// Re-export formatDate for metrics module
export { formatDate }
