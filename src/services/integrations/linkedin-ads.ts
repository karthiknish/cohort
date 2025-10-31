import { NormalizedMetric } from '@/types/integrations'

interface LinkedInAdsOptions {
  accessToken: string
  accountId: string
  timeframeDays: number
}

export type LinkedInAdAccount = {
  id: string
  name: string
  status?: string
  currency?: string
}

type LinkedInAnalyticsRow = {
  timeRange?: {
    start?: string
    end?: string
  }
  costInLocalCurrency?: unknown
  impressions?: unknown
  clicks?: unknown
  conversions?: unknown
  [key: string]: unknown
}

function buildTimeRange(timeframeDays: number) {
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - Math.max(timeframeDays - 1, 0))

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function normalizeCurrency(value: unknown): number {
  if (!value) return 0
  if (typeof value === 'object' && 'amount' in value) {
    const amount = (value as { amount?: unknown }).amount
    if (typeof amount === 'number') return amount
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return Number(value) || 0
}

function coerceNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function fetchLinkedInAdsMetrics(options: LinkedInAdsOptions): Promise<NormalizedMetric[]> {
  const { accessToken, accountId, timeframeDays } = options

  if (!accessToken) {
    throw new Error('Missing LinkedIn access token')
  }

  if (!accountId) {
    throw new Error('Missing LinkedIn ad account ID on integration')
  }

  const timeRange = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    q: 'statistics',
    accounts: `urn:li:sponsoredAccount:${accountId}`,
    timeGranularity: 'DAILY',
    start: timeRange.start,
    end: timeRange.end,
  })

  const response = await fetch(`https://api.linkedin.com/v2/adAnalytics?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`LinkedIn Ads API error (${response.status}): ${errorPayload}`)
  }

  const payload = (await response.json()) as { elements?: LinkedInAnalyticsRow[] }
  const rows: LinkedInAnalyticsRow[] = Array.isArray(payload?.elements) ? payload.elements : []

  const metrics: NormalizedMetric[] = rows.map((row) => {
    const date = row?.timeRange?.start ? new Date(row.timeRange.start).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    const spend = normalizeCurrency(row?.costInLocalCurrency)
    const impressions = coerceNumber(row?.impressions)
    const clicks = coerceNumber(row?.clicks)
    const conversions = coerceNumber(row?.conversions)

    return {
      providerId: 'linkedin',
      date,
      spend,
      impressions,
      clicks,
      conversions,
      revenue: undefined,
      creatives: undefined,
      rawPayload: row,
    }
  })

  return metrics
}

export async function fetchLinkedInAdAccounts(options: { accessToken: string; statusFilter?: string[] }): Promise<LinkedInAdAccount[]> {
  const { accessToken, statusFilter = ['ACTIVE', 'DRAFT', 'PAUSED'] } = options

  if (!accessToken) {
    throw new Error('Missing LinkedIn access token')
  }

  const params = new URLSearchParams({
    q: 'search',
    count: '50',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.accountStatuses[${index}]`, status)
  })

  const response = await fetch(`https://api.linkedin.com/v2/adAccountsV2?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
  })

  if (!response.ok) {
    const errorPayload = await response.text().catch(() => '')
    throw new Error(`LinkedIn ad accounts request failed (${response.status}): ${errorPayload}`)
  }

  const payload = (await response.json()) as {
    elements?: Array<{
      id?: string
      name?: string
      status?: string
      currency?: string
    }>
  }

  const accounts = Array.isArray(payload?.elements) ? payload.elements : []

  const normalized: LinkedInAdAccount[] = []

  accounts.forEach((account) => {
    const id = typeof account?.id === 'string' ? account.id.replace('urn:li:sponsoredAccount:', '') : null
    if (!id) {
      return
    }

    normalized.push({
      id,
      name: typeof account?.name === 'string' && account.name.length > 0 ? account.name : `LinkedIn account ${id}`,
      status: typeof account?.status === 'string' ? account.status : undefined,
      currency: typeof account?.currency === 'string' ? account.currency : undefined,
    })
  })

  return normalized
}
