import { query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const listMetrics = query({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    providerIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 500, 1), 2000)

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const providerSet = args.providerIds ? new Set(args.providerIds) : null
    const clientId = typeof args.clientId === 'string' ? args.clientId : null

    const filtered = all.filter((row) => {
      if (clientId !== null && row.clientId !== clientId) return false
      if (providerSet && !providerSet.has(row.providerId)) return false
      if (args.startDate && row.date < args.startDate) return false
      if (args.endDate && row.date > args.endDate) return false
      return true
    })

    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    return filtered.slice(0, limit).map((row) => ({
      providerId: row.providerId,
      clientId: row.clientId,
      accountId: row.accountId,
      date: row.date,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
      campaignId: row.campaignId,
      campaignName: row.campaignName,
      creatives: row.creatives,
      createdAtMs: row.createdAtMs,
    }))
  },
})

/**
 * Fetches metrics with optional aggregation (deduplication + summary calculation).
 * This replaces the /api/metrics REST endpoint.
 */
/**
 * Fetches recent metrics for alert evaluation (no auth - server-side use).
 * Filters by workspaceId and clientId, returns in chronological order.
 */
export const listRecentForAlerts = query({
  args: {
    workspaceId: v.string(),
    clientId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // No auth required - called from server-side alert processor
    const limit = Math.min(Math.max(args.limit ?? 30, 1), 100)

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    // Filter by clientId
    const filtered = all.filter((row) => row.clientId === args.clientId)

    // Sort by date descending (newest first) for limiting
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    // Take limit then reverse to get chronological order
    const limited = filtered.slice(0, limit)
    limited.reverse()

    return limited.map((row) => ({
      date: row.date,
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      conversions: Number(row.conversions || 0),
      revenue: Number(row.revenue || 0),
      // Calculate derived metrics
      cpc: row.clicks > 0 ? Number(row.spend || 0) / row.clicks : 0,
      ctr: row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
      roas: Number(row.spend || 0) > 0 ? Number(row.revenue || 0) / Number(row.spend || 0) : 0,
      cpa: row.conversions > 0 ? Number(row.spend || 0) / row.conversions : 0,
    }))
  },
})

export const listMetricsWithSummary = query({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    clientIds: v.optional(v.array(v.string())),
    providerIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
    aggregate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const shouldAggregate = args.aggregate === true
    const pageSize = Math.min(Math.max(args.limit ?? 100, 1), 500)
    const fetchLimit = shouldAggregate ? 3000 : pageSize

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const providerSet = args.providerIds ? new Set(args.providerIds) : null
    const clientId = typeof args.clientId === 'string' ? args.clientId : null
    const clientIdsSet = args.clientIds && args.clientIds.length > 0 ? new Set(args.clientIds) : null

    const filtered = all.filter((row) => {
      // Single clientId filter takes precedence
      if (clientId !== null && row.clientId !== clientId) return false
      // Multiple clientIds filter (if single clientId not provided)
      if (clientId === null && clientIdsSet && row.clientId && !clientIdsSet.has(row.clientId)) return false
      if (providerSet && !providerSet.has(row.providerId)) return false
      if (args.startDate && row.date < args.startDate) return false
      if (args.endDate && row.date > args.endDate) return false
      return true
    })

    // Sort by date (newest first), then by createdAtMs (newest first)
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    // Map to output format with generated ID
    const mapped = filtered.slice(0, fetchLimit).map((row) => ({
      id: `${row.providerId ?? 'unknown'}|${row.accountId ?? ''}|${row.date ?? ''}|${row.createdAtMs ?? ''}`,
      providerId: row.providerId ?? 'unknown',
      accountId: row.accountId ?? null,
      date: row.date ?? 'unknown',
      spend: Number(row.spend ?? 0),
      impressions: Number(row.impressions ?? 0),
      clicks: Number(row.clicks ?? 0),
      conversions: Number(row.conversions ?? 0),
      revenue: row.revenue !== undefined ? Number(row.revenue) : null,
      createdAtMs: row.createdAtMs ?? null,
      clientId: row.clientId ?? null,
      campaignId: row.campaignId ?? null,
      campaignName: row.campaignName ?? null,
    }))

    if (!shouldAggregate) {
      return {
        metrics: mapped.slice(0, pageSize),
        nextCursor: null,
        summary: null,
      }
    }

    // Aggregation: deduplicate by providerId|accountId|date, keeping newest
    const uniqueMetrics = new Map<string, (typeof mapped)[0] & { createdAtMillis: number }>()
    mapped.forEach((m) => {
      const key = `${m.providerId}|${m.accountId ?? ''}|${m.date}`
      const existing = uniqueMetrics.get(key)
      const createdAtMillis = m.createdAtMs ?? 0
      const existingCreatedAt = existing?.createdAtMillis ?? 0

      if (!existing || createdAtMillis > existingCreatedAt) {
        uniqueMetrics.set(key, { ...m, createdAtMillis })
      }
    })

    // Calculate totals
    const totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    const providers: Record<string, typeof totals> = {}

    uniqueMetrics.forEach((m) => {
      const pId = m.providerId || 'unknown'
      if (!providers[pId]) {
        providers[pId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }

      const p = providers[pId]
      p.spend += Number(m.spend || 0)
      p.impressions += Number(m.impressions || 0)
      p.clicks += Number(m.clicks || 0)
      p.conversions += Number(m.conversions || 0)
      p.revenue += Number(m.revenue || 0)

      totals.spend += Number(m.spend || 0)
      totals.impressions += Number(m.impressions || 0)
      totals.clicks += Number(m.clicks || 0)
      totals.conversions += Number(m.conversions || 0)
      totals.revenue += Number(m.revenue || 0)
    })

    return {
      metrics: mapped.slice(0, pageSize),
      nextCursor: null,
      summary: {
        totals,
        providers,
        count: uniqueMetrics.size,
      },
    }
  },
})
