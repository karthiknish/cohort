// =============================================================================
// TIKTOK ADS API CLIENT - Core request execution (delegates retry/error/logging to base client)
// =============================================================================

import { TikTokApiErrorResponse } from './types'

import { tiktokAdsClient } from '../shared/base-client'
import { executeIntegrationRequest } from '../shared/execute-integration-request'

export { DEFAULT_RETRY_CONFIG } from '../shared/retry'

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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
// EXECUTE TIKTOK API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions {
  url: string
  method?: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

export async function executeTikTokApiRequest<T extends TikTokApiErrorResponse>(
  options: ExecuteRequestOptions
): Promise<{ response: Response; payload: T }> {
  return executeIntegrationRequest<T>(tiktokAdsClient, options, { defaultMethod: 'POST' })
}
