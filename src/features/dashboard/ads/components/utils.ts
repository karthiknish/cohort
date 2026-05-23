import { formatDistanceToNow } from 'date-fns'

import type { MetricRecord } from './types'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { formatProviderName } from '@/lib/themes'
import { UnifiedError } from '@/lib/errors/unified-error'

// Re-export from retry-fetch for convenience
export { getRetryableErrorMessage } from './retry-fetch'
export type { RetryOptions } from './retry-fetch'

// Re-export UnifiedError as the standard error class
export { UnifiedError as ApiError }
export { UnifiedError as NetworkError }

// Re-export theme-related functions from centralized theme
export {
  formatProviderName,
  getProviderTheme,
  getProviderColor,
  getProviderInfo,
  PROVIDER_IDS,
  type ProviderId,
} from '@/lib/themes'

export type AdsConvexProviderId = 'google' | 'facebook' | 'linkedin' | 'tiktok'

const ADS_CONVEX_PROVIDER_IDS = new Set<string>(['google', 'facebook', 'linkedin', 'tiktok', 'meta'])

export function toAdsProviderId(providerId: string): AdsConvexProviderId {
  if (providerId === 'meta') {
    return 'facebook'
  }

  if (ADS_CONVEX_PROVIDER_IDS.has(providerId)) {
    return providerId as AdsConvexProviderId
  }

  throw new Error(`Unsupported ads provider: ${providerId}`)
}
import {
  ADS_WORKFLOW_STEPS,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  DISPLAY_DATE_FORMATTER,
  FREQUENCY_OPTIONS,
  METRICS_PAGE_SIZE,
  PROVIDER_ICON_MAP,
  getProviderIcon,
  TIMEFRAME_OPTIONS,
} from '@/features/dashboard/ads/constants'

export {
  ADS_WORKFLOW_STEPS,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  DISPLAY_DATE_FORMATTER,
  FREQUENCY_OPTIONS,
  METRICS_PAGE_SIZE,
  PROVIDER_ICON_MAP,
  getProviderIcon,
  TIMEFRAME_OPTIONS,
}

// Utility Functions
export function normalizeFrequency(value?: number | null): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.min(
      Math.max(Math.round(value), FREQUENCY_OPTIONS[0]!.value),
      FREQUENCY_OPTIONS.at(-1)?.value ?? 1440
    )
    return clamped
  }
  return DEFAULT_SYNC_FREQUENCY_MINUTES
}

export function normalizeTimeframe(value?: number | null): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.min(
      Math.max(Math.round(value), TIMEFRAME_OPTIONS[0]!.value),
      TIMEFRAME_OPTIONS.at(-1)?.value ?? DEFAULT_TIMEFRAME_DAYS
    )
    return clamped
  }
  return DEFAULT_TIMEFRAME_DAYS
}

export function getErrorMessage(error: unknown, fallback: string, context?: string): string {
  if (context) {
    logError(error, context)
  }
  const message = asErrorMessage(error)
  if (message && message !== 'An unexpected error occurred' && message !== 'An error occurred') {
    return message
  }
  return fallback
}

export function formatRelativeTimestamp(iso?: string | null): string {
  if (!iso) {
    return 'Never synced'
  }
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }
  return `${formatDistanceToNow(parsed, { addSuffix: true })}`
}

export function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'success':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'error':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'success':
      return 'Healthy'
    case 'pending':
      return 'In progress'
    case 'error':
      return 'Failed'
    case 'never':
      return 'Not run yet'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function describeFrequency(minutes: number): string {
  const match = FREQUENCY_OPTIONS.find((option) => option.value === minutes)
  if (match) {
    return match.label
  }

  if (minutes % 1440 === 0) {
    const days = minutes / 1440
    return days === 1 ? 'Once per day' : `Every ${days} days`
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? 'Every hour' : `Every ${hours} hours`
  }

  return `Every ${minutes} minutes`
}

export function describeTimeframe(days: number): string {
  const match = TIMEFRAME_OPTIONS.find((option) => option.value === days)
  if (match) {
    return match.label.replace('Past', 'Last')
  }

  if (days === 1) {
    return 'Last day'
  }

  if (days === 7) {
    return 'Last 7 days'
  }

  return `Last ${days} days`
}


export function formatDisplayDate(value: string): string {
  if (value === 'summary') {
    return 'Period total'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return DISPLAY_DATE_FORMATTER.format(parsed)
}
