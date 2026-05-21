import { internal } from '/_generated/api'

import {
  internalMutation,
  mutation,
  normalizeClientId,
  nowMs,
  requireWorkspaceAccess,
  v,
  z,
  zWorkspaceQuery,
} from './shared'

const metricRowValidator = v.object({
  propertyId: v.string(),
  date: v.string(),
  users: v.number(),
  sessions: v.number(),
  conversions: v.number(),
  revenue: v.union(v.number(), v.null()),
  currency: v.union(v.string(), v.null()),
})

const breakdownRowValidator = v.object({
  propertyId: v.string(),
  date: v.string(),
  dimension: v.union(v.literal('channel'), v.literal('source'), v.literal('device')),
  dimensionValue: v.string(),
  users: v.number(),
  sessions: v.number(),
  conversions: v.number(),
  revenue: v.union(v.number(), v.null()),
})

export const writeAnalyticsMetricsBatchInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    propertyId: v.string(),
    currency: v.union(v.string(), v.null()),
    daily: v.array(metricRowValidator),
    breakdowns: v.optional(v.array(breakdownRowValidator)),
  },
  handler: async (ctx, args) => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId)
    let dailyInserted = 0
    let breakdownInserted = 0

    for (const row of args.daily) {
      await ctx.db.insert('analyticsMetricsDaily', {
        workspaceId: args.workspaceId,
        clientId,
        propertyId: row.propertyId,
        date: row.date,
        users: row.users,
        sessions: row.sessions,
        conversions: row.conversions,
        revenue: row.revenue,
        currency: row.currency ?? args.currency,
        createdAtMs: timestamp,
      })
      dailyInserted += 1
    }

    for (const row of args.breakdowns ?? []) {
      await ctx.db.insert('analyticsMetricsBreakdown', {
        workspaceId: args.workspaceId,
        clientId,
        propertyId: row.propertyId,
        date: row.date,
        dimension: row.dimension,
        dimensionValue: row.dimensionValue,
        users: row.users,
        sessions: row.sessions,
        conversions: row.conversions,
        revenue: row.revenue,
        createdAtMs: timestamp,
      })
      breakdownInserted += 1
    }

    return { ok: true, dailyInserted, breakdownInserted }
  },
})

const analyticsMetricRowZ = z.object({
  id: z.string(),
  providerId: z.literal('google-analytics'),
  propertyId: z.string(),
  clientId: z.string().nullable(),
  date: z.string(),
  users: z.number(),
  sessions: z.number(),
  conversions: z.number(),
  revenue: z.number().nullable(),
  currency: z.string().nullable(),
  spend: z.number(),
  impressions: z.number(),
  clicks: z.number(),
})

const analyticsBreakdownRowZ = z.object({
  propertyId: z.string(),
  date: z.string(),
  dimension: z.enum(['channel', 'source', 'device']),
  dimensionValue: z.string(),
  users: z.number(),
  sessions: z.number(),
  conversions: z.number(),
  revenue: z.number().nullable(),
})

export const listAnalyticsMetrics = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
    propertyId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().optional(),
  },
  returns: z.object({
    metrics: z.array(analyticsMetricRowZ),
    breakdowns: z.array(analyticsBreakdownRowZ),
  }),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)
    const limit = Math.min(Math.max(args.limit ?? 500, 1), 2000)

    const dailyRows = await ctx.db
      .query('analyticsMetricsDaily')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const filteredDaily = dailyRows
      .filter((row) => {
        if (clientId !== null && row.clientId !== clientId) return false
        if (args.propertyId && row.propertyId !== args.propertyId) return false
        if (args.startDate && row.date < args.startDate) return false
        if (args.endDate && row.date > args.endDate) return false
        return true
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit)

    const breakdownRows = await ctx.db
      .query('analyticsMetricsBreakdown')
      .withIndex('by_workspace_client_date', (q) => q.eq('workspaceId', args.workspaceId).eq('clientId', clientId))
      .collect()

    const filteredBreakdowns = breakdownRows
      .filter((row) => {
        if (args.propertyId && row.propertyId !== args.propertyId) return false
        if (args.startDate && row.date < args.startDate) return false
        if (args.endDate && row.date > args.endDate) return false
        return true
      })
      .slice(0, limit * 10)

    return {
      metrics: filteredDaily.map((row) => ({
        id: `ga|${row.propertyId}|${row.date}|${row.createdAtMs}`,
        providerId: 'google-analytics' as const,
        propertyId: row.propertyId,
        clientId: row.clientId,
        date: row.date,
        users: row.users,
        sessions: row.sessions,
        conversions: row.conversions,
        revenue: row.revenue,
        currency: row.currency,
        spend: 0,
        impressions: row.users,
        clicks: row.sessions,
      })),
      breakdowns: filteredBreakdowns.map((row) => ({
        propertyId: row.propertyId,
        date: row.date,
        dimension: row.dimension,
        dimensionValue: row.dimensionValue,
        users: row.users,
        sessions: row.sessions,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
    }
  },
})

export const deleteGoogleAnalyticsMetricsDataInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId)
    let deleted = 0

    const daily = await ctx.db
      .query('analyticsMetricsDaily')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()
    for (const row of daily) {
      if (clientId === null ? row.clientId === null : row.clientId === clientId) {
        await ctx.db.delete(row._id)
        deleted += 1
      }
    }

    const breakdowns = await ctx.db
      .query('analyticsMetricsBreakdown')
      .withIndex('by_workspace_client_date', (q) => q.eq('workspaceId', args.workspaceId).eq('clientId', clientId))
      .collect()
    for (const row of breakdowns) {
      await ctx.db.delete(row._id)
      deleted += 1
    }

    const legacy = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_provider_date', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', 'google-analytics'),
      )
      .collect()
    for (const row of legacy) {
      if (clientId === null ? row.clientId === null : row.clientId === clientId) {
        await ctx.db.delete(row._id)
        deleted += 1
      }
    }

    return { ok: true, deleted }
  },
})

