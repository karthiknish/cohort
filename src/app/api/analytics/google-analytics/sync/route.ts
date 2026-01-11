import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'

import { createApiHandler } from '@/lib/api-handler'
import { ValidationError } from '@/lib/api-errors'
import { IntegrationTokenError } from '@/lib/integration-token-refresh'
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/ads-admin'
import { logger } from '@/lib/logger'

// NOTE: We reuse the existing ad integrations storage for GA tokens.
// providerId is namespaced as 'google-analytics'.

const querySchema = z.object({
  clientId: z.string().optional(),
  days: z
    .string()
    .transform((v) => parseInt(v, 10))
    .optional(),
})

const bodySchema = z.object({}).strict()

function formatGaDate(raw: string): string {
  // GA4 date dimension is YYYYMMDD
  if (!raw || raw.length !== 8) return raw
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

function getConvexClient(): ConvexHttpClient | null {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY

  if (!url || !deployKey) {
    return null
  }

  const client = new ConvexHttpClient(url)
  ;(client as any).setAdminAuth(deployKey, {
    issuer: 'system',
    subject: 'ga-sync',
  })

  return client
}

async function ensureGoogleAnalyticsAccessToken(options: {
  userId: string
  clientId?: string | null
}): Promise<string> {
  // Localized helper to avoid touching the existing Ads token refresh paths.
  const { userId, clientId } = options
  const integration = await getAdIntegration({ userId, providerId: 'google-analytics', clientId })

  if (!integration?.accessToken) {
    throw new IntegrationTokenError('Google Analytics is not connected', 'google-analytics', userId)
  }

  // If we have a refresh token, prefer server-side refresh when access token is missing/expired.
  // For now, we optimistically use the stored access token; the Data API will error if expired.
  // If this becomes noisy, we can promote a shared refresh helper in integration-token-refresh.
  return integration.accessToken
}

async function fetchAccountSummaries(accessToken: string): Promise<
  Array<{ property: string; displayName: string }> 
> {
  const url = new URL('https://analyticsadmin.googleapis.com/v1beta/accountSummaries')
  url.searchParams.set('pageSize', '200')

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to list Google Analytics properties (${response.status}): ${text}`)
  }

  const payload = (await response.json()) as {
    accountSummaries?: Array<{
      propertySummaries?: Array<{ property?: string; displayName?: string }>
    }>
  }

  const summaries = payload.accountSummaries ?? []
  const properties: Array<{ property: string; displayName: string }> = []

  summaries.forEach((account) => {
    ;(account.propertySummaries ?? []).forEach((p) => {
      if (typeof p.property === 'string' && p.property.length > 0) {
        properties.push({
          property: p.property,
          displayName: typeof p.displayName === 'string' ? p.displayName : p.property,
        })
      }
    })
  })

  return properties
}

async function runGaReport(options: {
  accessToken: string
  propertyId: string
  days: number
}): Promise<
  Array<{ date: string; totalUsers: number; sessions: number; conversions: number; totalRevenue: number }>
> {
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
      const metrics = row.metricValues ?? []
      const totalUsers = Number(metrics[0]?.value ?? 0)
      const sessions = Number(metrics[1]?.value ?? 0)
      const conversions = Number(metrics[2]?.value ?? 0)
      const totalRevenue = Number(metrics[3]?.value ?? 0)
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

export const POST = createApiHandler(
  {
    workspace: 'required',
    querySchema,
    bodySchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, query }) => {
    if (!auth.uid) {
      throw new ValidationError('User context is required')
    }
    if (!workspace) {
      throw new Error('Workspace context missing')
    }

    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null
    const days = Number.isFinite(query.days) && (query.days as number) > 0 ? (query.days as number) : 30

    const accessToken = await ensureGoogleAnalyticsAccessToken({ userId: auth.uid, clientId })

    const integration = await getAdIntegration({ userId: auth.uid, providerId: 'google-analytics', clientId })
    if (!integration) {
      throw new ValidationError('Google Analytics integration not found')
    }

    let propertyId: string | null = typeof integration.accountId === 'string' && integration.accountId.length > 0
      ? integration.accountId
      : null
    let propertyName: string | null = typeof integration.accountName === 'string' && integration.accountName.length > 0
      ? integration.accountName
      : null

    if (!propertyId) {
      const properties = await fetchAccountSummaries(accessToken)
      const selected = properties[0]
      if (!selected) {
        throw new ValidationError('No Google Analytics properties found for this Google account')
      }

      // Property string is like "properties/123456789".
      const parts = selected.property.split('/')
      const extracted = parts.length === 2 ? parts[1] : selected.property

      propertyId = extracted
      propertyName = selected.displayName

      await updateIntegrationCredentials({
        userId: auth.uid,
        providerId: 'google-analytics',
        clientId,
        accountId: propertyId,
        accountName: propertyName,
      })
    }

    const reportRows = await runGaReport({ accessToken, propertyId, days })

    // Write metrics to Convex
    const convex = getConvexClient()
    if (!convex) {
      throw new Error('Convex client not configured')
    }

    const metrics = reportRows.map((row) => ({
      providerId: 'google-analytics',
      clientId: clientId ?? null,
      accountId: propertyId,
      date: row.date,
      // Map GA metrics into the existing unified metrics schema.
      spend: 0,
      impressions: row.totalUsers,
      clicks: row.sessions,
      conversions: row.conversions,
      revenue: row.totalRevenue,
    }))

    // Write in chunks to avoid oversized payloads
    const chunkSize = 100
    let written = 0

    for (let i = 0; i < metrics.length; i += chunkSize) {
      const chunk = metrics.slice(i, i + chunkSize)
      await convex.mutation('adsIntegrations:writeMetricsBatch' as any, {
        workspaceId: workspace.workspaceId,
        metrics: chunk,
      })
      written += chunk.length
    }

    logger.info('[Google Analytics Sync] Completed', {
      userId: auth.uid,
      clientId,
      propertyId,
      written,
    })

    return {
      providerId: 'google-analytics',
      propertyId,
      propertyName,
      syncedDays: days,
      written,
    }
  }
)
