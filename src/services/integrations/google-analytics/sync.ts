import { writeMetricsBatch } from '@/lib/ads-admin'
import { getGoogleAnalyticsIntegration } from '@/lib/analytics-admin'
import {
  IntegrationTokenError,
  isTokenExpiringSoon,
  refreshGoogleAccessToken,
} from '@/lib/integration-token-refresh'
import { logger } from '@/lib/logger'
import type { NormalizedMetric } from '@/types/integrations'
import { fetchGoogleAnalyticsProperties } from '@/services/integrations/google-analytics/properties'

function formatGaDate(raw: string): string {
  if (!raw || raw.length !== 8) return raw
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

async function runGaReport(options: {
  accessToken: string
  propertyId: string
  days: number
}): Promise<Array<{ date: string; totalUsers: number; sessions: number; conversions: number; totalRevenue: number }>> {
  const { accessToken, propertyId, days } = options

  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${Math.max(days, 1)}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      limit: 10000,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch Google Analytics report (${response.status}): ${text}`)
  }

  const payload = (await response.json()) as {
    rows?: Array<{
      dimensionValues?: Array<{ value?: string }>
      metricValues?: Array<{ value?: string }>
    }>
  }

  const rows = payload.rows ?? []
  return rows
    .map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? ''
      const metricValues = row.metricValues ?? []
      const totalUsers = Number(metricValues[0]?.value ?? 0)
      const sessions = Number(metricValues[1]?.value ?? 0)
      const conversions = Number(metricValues[2]?.value ?? 0)
      const totalRevenue = Number(metricValues[3]?.value ?? 0)
      return {
        date: formatGaDate(rawDate),
        totalUsers: Number.isFinite(totalUsers) ? totalUsers : 0,
        sessions: Number.isFinite(sessions) ? sessions : 0,
        conversions: Number.isFinite(conversions) ? conversions : 0,
        totalRevenue: Number.isFinite(totalRevenue) ? totalRevenue : 0,
      }
    })
    .filter((row) => typeof row.date === 'string' && row.date.length >= 8)
}

export async function syncGoogleAnalyticsMetrics(options: {
  userId: string
  clientId?: string | null
  days?: number
  requestId?: string | null
}): Promise<{
  providerId: 'google-analytics'
  propertyId: string
  propertyName: string | null
  syncedDays: number
  written: number
}> {
  const normalizedClientId = typeof options.clientId === 'string' && options.clientId.trim().length > 0
    ? options.clientId.trim()
    : null

  const days = Number.isFinite(options.days) && (options.days as number) > 0
    ? Math.max(1, Math.floor(options.days as number))
    : 30

  const integration = await getGoogleAnalyticsIntegration({
    userId: options.userId,
    clientId: normalizedClientId,
  })

  if (!integration?.accessToken) {
    throw new IntegrationTokenError('Google Analytics is not connected', 'google-analytics', options.userId)
  }

  let accessToken = integration.accessToken

  // Refresh proactively if possible to reduce mid-sync failures.
  if (integration.refreshToken && isTokenExpiringSoon(integration.accessTokenExpiresAt, 10 * 60 * 1000)) {
    accessToken = await refreshGoogleAccessToken({
      userId: options.userId,
      clientId: normalizedClientId,
      providerId: 'google-analytics',
    })
  }

  const propertyId = typeof integration.accountId === 'string' && integration.accountId.length > 0
    ? integration.accountId
    : null

  const propertyName = typeof integration.accountName === 'string' && integration.accountName.length > 0
    ? integration.accountName
    : null

  if (!propertyId) {
    const availableProperties = await fetchGoogleAnalyticsProperties({ accessToken })
    if (availableProperties.length === 0) {
      throw new IntegrationTokenError(
        'No Google Analytics properties found for this Google account',
        'google-analytics',
        options.userId
      )
    }

    throw new IntegrationTokenError(
      'Google Analytics property not configured. Select a property in Analytics setup before syncing.',
      'google-analytics',
      options.userId
    )
  }

  const reportRows = await runGaReport({
    accessToken,
    propertyId,
    days,
  })

  const metrics: NormalizedMetric[] = reportRows.map((row) => ({
    providerId: 'google-analytics',
    clientId: normalizedClientId,
    accountId: propertyId,
    date: row.date,
    spend: 0,
    impressions: row.totalUsers,
    clicks: row.sessions,
    conversions: row.conversions,
    revenue: row.totalRevenue,
  }))

  await writeMetricsBatch({
    userId: options.userId,
    clientId: normalizedClientId,
    metrics,
  })

  logger.info('[Google Analytics Sync] Completed', {
    userId: options.userId,
    clientId: normalizedClientId,
    propertyId,
    syncedDays: days,
    written: metrics.length,
    requestId: options.requestId ?? undefined,
  })

  return {
    providerId: 'google-analytics',
    propertyId,
    propertyName,
    syncedDays: days,
    written: metrics.length,
  }
}
