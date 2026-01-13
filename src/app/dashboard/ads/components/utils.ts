import { formatDistanceToNow } from 'date-fns'
import { Facebook, Linkedin, Music, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { MetricRecord } from './types'
import { asErrorMessage } from '@/lib/convex-errors'
import { ApiError, NetworkError, getRetryableErrorMessage } from './retry-fetch'

// Re-export from retry-fetch for convenience
export { ApiError, NetworkError, getRetryableErrorMessage } from './retry-fetch'
export type { RetryOptions } from './retry-fetch'

// Constants
export const METRICS_PAGE_SIZE = 100
export const DEFAULT_SYNC_FREQUENCY_MINUTES = 6 * 60
export const DEFAULT_TIMEFRAME_DAYS = 7

export const ADS_WORKFLOW_STEPS = [
  {
    title: 'Connect your ad accounts',
    description: 'Hook up Google, Meta, LinkedIn, or TikTok so Cohorts can pull spend and performance data.',
  },
  {
    title: 'Enable auto-sync',
    description: 'Turn on automatic syncs to keep campaign metrics and reports fresh without manual exports.',
  },
  {
    title: 'Review cross-channel insights',
    description: 'Use the overview cards and tables below to compare performance and spot optimisation wins.',
  },
] as const

export const FREQUENCY_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'Every 1 hour', value: 60 },
  { label: 'Every 3 hours', value: 180 },
  { label: 'Every 6 hours', value: 360 },
  { label: 'Every 12 hours', value: 720 },
  { label: 'Once per day', value: 1440 },
]

export const TIMEFRAME_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'Past day', value: 1 },
  { label: 'Past 3 days', value: 3 },
  { label: 'Past week', value: 7 },
  { label: 'Past 14 days', value: 14 },
  { label: 'Past 30 days', value: 30 },
  { label: 'Past 90 days', value: 90 },
]

export const PROVIDER_ICON_MAP: Record<string, LucideIcon> = {
  google: Search,
  facebook: Facebook,
  meta: Facebook,
  linkedin: Linkedin,
  tiktok: Music,
}

export const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

// Utility Functions
export function normalizeFrequency(value?: number | null): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.min(
      Math.max(Math.round(value), FREQUENCY_OPTIONS[0].value),
      FREQUENCY_OPTIONS.at(-1)?.value ?? 1440
    )
    return clamped
  }
  return DEFAULT_SYNC_FREQUENCY_MINUTES
}

export function normalizeTimeframe(value?: number | null): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.min(
      Math.max(Math.round(value), TIMEFRAME_OPTIONS[0].value),
      TIMEFRAME_OPTIONS.at(-1)?.value ?? DEFAULT_TIMEFRAME_DAYS
    )
    return clamped
  }
  return DEFAULT_TIMEFRAME_DAYS
}

export function getErrorMessage(error: unknown, fallback: string): string {
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

export function formatProviderName(providerId: string): string {
  const mapping: Record<string, string> = {
    google: 'Google Ads',
    facebook: 'Meta Ads Manager',
    meta: 'Meta Ads Manager',
    linkedin: 'LinkedIn Ads',
    tiktok: 'TikTok Ads',
  }

  if (mapping[providerId]) {
    return mapping[providerId]
  }

  if (providerId.length === 0) {
    return 'Unknown Provider'
  }

  return providerId.charAt(0).toUpperCase() + providerId.slice(1)
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
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return DISPLAY_DATE_FORMATTER.format(parsed)
}

export function exportMetricsToCsv(
  processedMetrics: MetricRecord[],
  formatProviderNameFn: (id: string) => string = formatProviderName
): void {
  const headers = ['Date', 'Provider', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'Revenue']
  const rows = processedMetrics.map((m) => [
    m.date,
    formatProviderNameFn(m.providerId),
    m.spend.toFixed(2),
    m.impressions,
    m.clicks,
    m.conversions,
    (m.revenue || 0).toFixed(2),
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ads-metrics-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
