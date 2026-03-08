import {
  asNonEmptyString,
  asNumber,
  asRecord,
  parseDateToMs,
} from '../helpers'

export const ALL_PROVIDER_IDS = ['google', 'facebook', 'tiktok', 'linkedin'] as const

export type AggregateMetrics = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roas: number
  ctr: number
  cpc: number
  cpa: number
}

export type AggregateDelta = Record<keyof AggregateMetrics, number | null>

export type DirectMessageRecipient = {
  id: string
  name: string
  email?: string
  role?: string
}

export type ClientLookupRecord = {
  legacyId: string
  name: string
  workspaceId: string
}

export type ClientTaskRecord = {
  legacyId: string
  title: string
  status: string
  priority: string
  dueDateMs: number | null
  assignedTo: string[] | null
}

export function isActiveCampaignStatus(status: string | null): boolean {
  const normalized = status?.toLowerCase() ?? ''
  return normalized.includes('active') || normalized.includes('enable') || normalized.includes('live')
}

export function isPausedCampaignStatus(status: string | null): boolean {
  const normalized = status?.toLowerCase() ?? ''
  return normalized.includes('pause') || normalized.includes('disable') || normalized.includes('archived')
}

function toIsoDate(value: number): string {
  return new Date(value).toISOString().slice(0, 10)
}

export function getPreviousDateWindow(startDate: string, endDate: string): { startDate: string; endDate: string } | null {
  const startMs = parseDateToMs(startDate)
  const endMs = parseDateToMs(endDate)
  if (startMs === null || endMs === null) return null

  const spanMs = Math.max(endMs - startMs, 0)
  const previousEndMs = startMs - 86_400_000
  const previousStartMs = previousEndMs - spanMs

  return {
    startDate: toIsoDate(previousStartMs),
    endDate: toIsoDate(previousEndMs),
  }
}

export function formatProviderDisplayName(providerId: string): string {
  switch (providerId) {
    case 'google':
      return 'Google Ads'
    case 'facebook':
    case 'meta':
      return 'Meta Ads'
    case 'linkedin':
      return 'LinkedIn Ads'
    case 'tiktok':
      return 'TikTok Ads'
    default:
      return providerId
  }
}

function normalizeRecipientLookupText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolveDirectMessageRecipient(
  recipients: DirectMessageRecipient[],
  recipientQuery: string,
): { match: DirectMessageRecipient | null; matches: DirectMessageRecipient[] } {
  const normalizedQuery = normalizeRecipientLookupText(recipientQuery)
  if (!normalizedQuery) return { match: null, matches: [] }

  const exactMatches = recipients.filter((recipient) => (
    normalizeRecipientLookupText(recipient.id) === normalizedQuery ||
    normalizeRecipientLookupText(recipient.name) === normalizedQuery ||
    normalizeRecipientLookupText(recipient.email) === normalizedQuery
  ))
  if (exactMatches.length === 1) return { match: exactMatches[0] ?? null, matches: exactMatches }
  if (exactMatches.length > 1) return { match: null, matches: exactMatches }

  const tokenMatches = recipients.filter((recipient) => {
    const nameTokens = normalizeRecipientLookupText(recipient.name).split(' ').filter(Boolean)
    return nameTokens.includes(normalizedQuery)
  })
  if (tokenMatches.length === 1) return { match: tokenMatches[0] ?? null, matches: tokenMatches }
  if (tokenMatches.length > 1) return { match: null, matches: tokenMatches }

  const partialMatches = recipients.filter((recipient) => (
    normalizeRecipientLookupText(recipient.name).includes(normalizedQuery) ||
    normalizeRecipientLookupText(recipient.email).includes(normalizedQuery)
  ))
  if (partialMatches.length === 1) return { match: partialMatches[0] ?? null, matches: partialMatches }

  return { match: null, matches: partialMatches }
}

export function truncateMessagePreview(content: string): string {
  return content.length > 80 ? `${content.slice(0, 77)}...` : content
}

function normalizeLookupText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractClientLookupRecords(value: unknown): ClientLookupRecord[] {
  const items = Array.isArray(value)
    ? value
    : Array.isArray((value as { items?: unknown[] } | null)?.items)
      ? (value as { items: unknown[] }).items
      : []

  return items
    .map((item) => asRecord(item))
    .map((item) => ({
      legacyId: asNonEmptyString(item?.legacyId) ?? '',
      name: asNonEmptyString(item?.name) ?? '',
      workspaceId: asNonEmptyString(item?.workspaceId) ?? '',
    }))
    .filter((item) => item.legacyId.length > 0 && item.name.length > 0 && item.workspaceId.length > 0)
}

export function resolveClientLookupMatch(
  clients: ClientLookupRecord[],
  clientQuery: string,
): { match: ClientLookupRecord | null; matches: ClientLookupRecord[] } {
  const normalizedQuery = normalizeLookupText(clientQuery)
  if (!normalizedQuery) return { match: null, matches: [] }

  const exactMatches = clients.filter((client) => (
    normalizeLookupText(client.legacyId) === normalizedQuery ||
    normalizeLookupText(client.name) === normalizedQuery
  ))
  if (exactMatches.length === 1) return { match: exactMatches[0] ?? null, matches: exactMatches }
  if (exactMatches.length > 1) return { match: null, matches: exactMatches }

  const tokenMatches = clients.filter((client) => {
    const nameTokens = normalizeLookupText(client.name).split(' ').filter(Boolean)
    return nameTokens.includes(normalizedQuery)
  })
  if (tokenMatches.length === 1) return { match: tokenMatches[0] ?? null, matches: tokenMatches }
  if (tokenMatches.length > 1) return { match: null, matches: tokenMatches }

  const partialMatches = clients.filter((client) => (
    normalizeLookupText(client.legacyId).includes(normalizedQuery) ||
    normalizeLookupText(client.name).includes(normalizedQuery)
  ))
  if (partialMatches.length === 1) return { match: partialMatches[0] ?? null, matches: partialMatches }

  return { match: null, matches: partialMatches }
}

export function isCompletedTaskStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase()
  return normalized === 'completed' || normalized === 'done' || normalized === 'archived'
}

export function formatTaskDate(value: number | null): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value).toISOString().slice(0, 10)
    : null
}

export function formatTaskStatusLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatTaskPriorityLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function extractClientTaskRecords(value: unknown): ClientTaskRecord[] {
  const items = Array.isArray(value)
    ? value
    : Array.isArray((value as { items?: unknown[] } | null)?.items)
      ? (value as { items: unknown[] }).items
      : []

  return items
    .map((item) => asRecord(item))
    .map((item) => ({
      legacyId: asNonEmptyString(item?.legacyId) ?? '',
      title: asNonEmptyString(item?.title) ?? 'Untitled task',
      status: asNonEmptyString(item?.status) ?? 'unknown',
      priority: asNonEmptyString(item?.priority) ?? 'medium',
      dueDateMs: asNumber(item?.dueDateMs),
      assignedTo: Array.isArray(item?.assignedTo)
        ? item.assignedTo.map((entry) => asNonEmptyString(entry)).filter((entry): entry is string => entry !== null)
        : null,
    }))
    .filter((item) => item.legacyId.length > 0)
}

export function buildCampaignRoute(args: {
  providerId?: string | null
  campaignId?: string | null
  campaignName?: string | null
  startDate: string
  endDate: string
  clientId?: string | null
}): string | null {
  if (!args.providerId || !args.campaignId) return null

  const params = new URLSearchParams({
    startDate: args.startDate,
    endDate: args.endDate,
  })
  if (args.clientId) params.set('clientId', args.clientId)
  if (args.campaignName) params.set('campaignName', args.campaignName)

  return `/dashboard/ads/campaigns/${args.providerId}/${args.campaignId}?${params.toString()}`
}

export function computeAggregateMetrics(source: Record<string, unknown> | null): AggregateMetrics {
  const spend = asNumber(source?.spend) ?? 0
  const impressions = asNumber(source?.impressions) ?? 0
  const clicks = asNumber(source?.clicks) ?? 0
  const conversions = asNumber(source?.conversions) ?? 0
  const revenue = asNumber(source?.revenue) ?? 0

  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    roas: spend > 0 ? revenue / spend : 0,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
  }
}

export function computeAggregateMetricsFromRows(rows: Record<string, unknown>[]): AggregateMetrics {
  const totals = rows.reduce<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>((acc, row) => {
    acc.spend += asNumber(row.spend) ?? 0
    acc.impressions += asNumber(row.impressions) ?? 0
    acc.clicks += asNumber(row.clicks) ?? 0
    acc.conversions += asNumber(row.conversions) ?? 0
    acc.revenue += asNumber(row.revenue) ?? 0
    return acc
  }, {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  })

  return computeAggregateMetrics(totals)
}

export function normalizeCampaignLookupText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(?:the|active|live|running|current|currently|ad|ads|campaign|campaigns)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matchesCampaignQuery(value: string | null | undefined, campaignQuery: string): boolean {
  const normalizedValue = normalizeCampaignLookupText(value)
  if (!normalizedValue || !campaignQuery) return false
  if (normalizedValue.includes(campaignQuery)) return true

  const tokens = campaignQuery.split(' ').filter(Boolean)
  return tokens.length > 0 && tokens.every((token) => normalizedValue.includes(token))
}

export function computeDelta(current: number, previous: number): number | null {
  return Number.isFinite(current) && Number.isFinite(previous) ? current - previous : null
}

export function computeDeltaPercent(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function buildAggregateComparison(current: AggregateMetrics, previous: AggregateMetrics): {
  previousTotals: AggregateMetrics
  delta: AggregateDelta
  deltaPercent: AggregateDelta
} {
  const keys: Array<keyof AggregateMetrics> = ['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'roas', 'ctr', 'cpc', 'cpa']
  const delta = {} as AggregateDelta
  const deltaPercent = {} as AggregateDelta

  for (const key of keys) {
    delta[key] = computeDelta(current[key], previous[key])
    deltaPercent[key] = computeDeltaPercent(current[key], previous[key])
  }

  return {
    previousTotals: previous,
    delta,
    deltaPercent,
  }
}

export function buildProviderBreakdownFromRows(
  currentRows: Record<string, unknown>[],
  previousRows: Record<string, unknown>[],
): Array<{
  providerId: string
  label: string
  totals: AggregateMetrics
  delta: AggregateDelta
  deltaPercent: AggregateDelta
}> {
  const accumulate = (rows: Record<string, unknown>[]) => {
    const map = new Map<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>()

    for (const row of rows) {
      const providerId = asNonEmptyString(row.providerId) ?? 'unknown'
      const current = map.get(providerId) ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      current.spend += asNumber(row.spend) ?? 0
      current.impressions += asNumber(row.impressions) ?? 0
      current.clicks += asNumber(row.clicks) ?? 0
      current.conversions += asNumber(row.conversions) ?? 0
      current.revenue += asNumber(row.revenue) ?? 0
      map.set(providerId, current)
    }

    return map
  }

  const currentMap = accumulate(currentRows)
  const previousMap = accumulate(previousRows)
  const providerIds = Array.from(new Set([...currentMap.keys(), ...previousMap.keys()]))

  return providerIds
    .map((providerId) => {
      const totals = computeAggregateMetrics(currentMap.get(providerId) ?? null)
      const previousTotals = computeAggregateMetrics(previousMap.get(providerId) ?? null)
      const comparison = buildAggregateComparison(totals, previousTotals)

      return {
        providerId,
        label: formatProviderDisplayName(providerId),
        totals,
        delta: comparison.delta,
        deltaPercent: comparison.deltaPercent,
      }
    })
    .sort((left, right) => right.totals.spend - left.totals.spend)
}

export function buildProviderBreakdown(args: {
  currentProviders: Record<string, unknown> | null
  previousProviders: Record<string, unknown> | null
}): Array<{
  providerId: string
  label: string
  totals: AggregateMetrics
  delta: AggregateDelta
  deltaPercent: AggregateDelta
}> {
  const currentProviders = args.currentProviders ?? {}
  const previousProviders = args.previousProviders ?? {}
  const providerIds = Array.from(new Set([...Object.keys(currentProviders), ...Object.keys(previousProviders)]))

  return providerIds
    .map((providerId) => {
      const current = computeAggregateMetrics(asRecord(currentProviders[providerId]))
      const previous = computeAggregateMetrics(asRecord(previousProviders[providerId]))
      const comparison = buildAggregateComparison(current, previous)

      return {
        providerId,
        label: formatProviderDisplayName(providerId),
        totals: current,
        delta: comparison.delta,
        deltaPercent: comparison.deltaPercent,
      }
    })
    .sort((left, right) => right.totals.spend - left.totals.spend)
}