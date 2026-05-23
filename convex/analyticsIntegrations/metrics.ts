import { internal } from '/_generated/api'
import type { Doc } from '/_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

import { getPaginatedResponse, zWorkspacePaginatedQuery } from '../functions'
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

const ANALYTICS_METRICS_PAGE_SIZE_DEFAULT = 100
const ANALYTICS_BREAKDOWNS_MAX = 2000

function analyticsDailyLegacyId(row: Pick<Doc<'analyticsMetricsDaily'>, 'propertyId' | 'date' | 'createdAtMs'>) {
  return `${row.propertyId}|${row.date}|${row.createdAtMs}`
}

function parseAnalyticsDailyCursor(legacyId: string) {
  const [propertyId = '', , createdAtMsRaw = '0'] = legacyId.split('|')
  const createdAtMs = Number(createdAtMsRaw)
  return {
    propertyId,
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
  }
}

type AnalyticsDailyListArgs = {
  workspaceId: string
  clientId: string | null
  propertyId?: string
  startDate?: string
  endDate?: string
  cursor?: { fieldValue: string; legacyId: string } | null
}

function applyAnalyticsDailyPagination<TQuery>(
  query: TQuery,
  cursor: { fieldValue: string; legacyId: string } | null | undefined,
): TQuery {
  if (!cursor) {
    return query
  }

  const { propertyId: cursorPropertyId, createdAtMs } = parseAnalyticsDailyCursor(cursor.legacyId)
  const filtered = query as {
    filter: (predicate: (row: {
      field: (name: string) => unknown
      eq: (left: unknown, right: unknown) => unknown
      lt: (left: unknown, right: unknown) => unknown
      gte: (left: unknown, right: unknown) => unknown
      lte: (left: unknown, right: unknown) => unknown
      and: (...conditions: unknown[]) => unknown
      or: (...conditions: unknown[]) => unknown
    }) => unknown) => TQuery
  }

  return filtered.filter((row) =>
    row.or(
      row.lt(row.field('date'), cursor.fieldValue),
      row.and(
        row.eq(row.field('date'), cursor.fieldValue),
        row.or(
          row.lt(row.field('propertyId'), cursorPropertyId),
          row.and(
            row.eq(row.field('propertyId'), cursorPropertyId),
            row.lt(row.field('createdAtMs'), createdAtMs),
          ),
        ),
      ),
    ),
  )
}

function analyticsDailyRowsQuery(ctx: QueryCtx, args: AnalyticsDailyListArgs) {
  const { clientId, propertyId, startDate, endDate, cursor } = args

  if (clientId !== null && propertyId) {
    let query = ctx.db
      .query('analyticsMetricsDaily')
      .withIndex('by_workspace_client_property_date', (index) => {
        const base = index
          .eq('workspaceId', args.workspaceId)
          .eq('clientId', clientId)
          .eq('propertyId', propertyId)
        if (startDate && endDate) {
          return base.gte('date', startDate).lte('date', endDate)
        }
        if (endDate) {
          return base.lte('date', endDate)
        }
        if (startDate) {
          return base.gte('date', startDate)
        }
        return base
      })
      .order('desc')

    return applyAnalyticsDailyPagination(query, cursor)
  }

  if (clientId !== null) {
    let query = ctx.db
      .query('analyticsMetricsDaily')
      .withIndex('by_workspace_client_property_date', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .order('desc')

    if (startDate) {
      query = query.filter((row) => row.gte(row.field('date'), startDate))
    }
    if (endDate) {
      query = query.filter((row) => row.lte(row.field('date'), endDate))
    }

    return applyAnalyticsDailyPagination(query, cursor)
  }

  let query = ctx.db
    .query('analyticsMetricsDaily')
    .withIndex('by_workspace_date', (index) => {
      const base = index.eq('workspaceId', args.workspaceId)
      if (startDate && endDate) {
        return base.gte('date', startDate).lte('date', endDate)
      }
      if (startDate) {
        return base.gte('date', startDate)
      }
      if (endDate) {
        return base.lte('date', endDate)
      }
      return base
    })
    .order('desc')

  if (propertyId) {
    query = query.filter((row) => row.eq(row.field('propertyId'), propertyId))
  }

  return applyAnalyticsDailyPagination(query, cursor)
}

function mapAnalyticsDailyRow(row: Doc<'analyticsMetricsDaily'>) {
  return {
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
  }
}

function analyticsBreakdownRowsQuery(
  ctx: QueryCtx,
  args: {
    workspaceId: string
    clientId: string | null
    startDate?: string
    endDate?: string
  },
) {
  return ctx.db.query('analyticsMetricsBreakdown').withIndex('by_workspace_client_date', (index) => {
    const base = index.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId)
    if (args.startDate && args.endDate) {
      return base.gte('date', args.startDate).lte('date', args.endDate)
    }
    if (args.startDate) {
      return base.gte('date', args.startDate)
    }
    if (args.endDate) {
      return base.lte('date', args.endDate)
    }
    return base
  })
}

async function loadAnalyticsBreakdowns(
  ctx: QueryCtx,
  args: {
    workspaceId: string
    clientId: string | null
    propertyId?: string
    startDate?: string
    endDate?: string
  },
) {
  const breakdownRows = await analyticsBreakdownRowsQuery(ctx, args)
    .order('desc')
    .take(ANALYTICS_BREAKDOWNS_MAX)

  return breakdownRows
    .filter((row) => !args.propertyId || row.propertyId === args.propertyId)
    .map((row) => ({
      propertyId: row.propertyId,
      date: row.date,
      dimension: row.dimension,
      dimensionValue: row.dimensionValue,
      users: row.users,
      sessions: row.sessions,
      conversions: row.conversions,
      revenue: row.revenue,
    }))
}

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

    await Promise.all(
      args.daily.map(async (row) => {
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
      }),
    )
    dailyInserted = args.daily.length

    const breakdowns = args.breakdowns ?? []
    await Promise.all(
      breakdowns.map(async (row) => {
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
      }),
    )
    breakdownInserted = breakdowns.length

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

export const listAnalyticsBreakdowns = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
    propertyId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  },
  returns: z.object({
    breakdowns: z.array(analyticsBreakdownRowZ),
  }),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)
    const breakdowns = await loadAnalyticsBreakdowns(ctx, {
      workspaceId: args.workspaceId,
      clientId,
      propertyId: args.propertyId,
      startDate: args.startDate,
      endDate: args.endDate,
    })

    return { breakdowns }
  },
})

export const listAnalyticsMetricsPaginated = zWorkspacePaginatedQuery({
  args: {
    clientId: z.string().nullable().optional(),
    propertyId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  },
  returns: z.object({
    metrics: z.array(analyticsMetricRowZ),
    breakdowns: z.array(analyticsBreakdownRowZ),
    nextCursor: z
      .object({
        fieldValue: z.string(),
        legacyId: z.string(),
      })
      .nullable(),
  }),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)
    const limit = Math.min(Math.max(args.limit ?? ANALYTICS_METRICS_PAGE_SIZE_DEFAULT, 1), 200)

    const rows = await analyticsDailyRowsQuery(ctx, {
      workspaceId: args.workspaceId,
      clientId,
      propertyId: args.propertyId,
      startDate: args.startDate,
      endDate: args.endDate,
      cursor: args.cursor
        ? {
            fieldValue: String(args.cursor.fieldValue),
            legacyId: args.cursor.legacyId,
          }
        : null,
    }).take(limit + 1)

    const withLegacy = rows.map((row) => ({
      ...row,
      legacyId: analyticsDailyLegacyId(row),
    }))
    const page = getPaginatedResponse(withLegacy, limit, 'date')

    return {
      metrics: page.items.map(mapAnalyticsDailyRow),
      breakdowns: [],
      nextCursor: page.nextCursor
        ? {
            fieldValue: String(page.nextCursor.fieldValue),
            legacyId: page.nextCursor.legacyId,
          }
        : null,
    }
  },
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
    const dailyToDelete = daily.filter((row) =>
      clientId === null ? row.clientId === null : row.clientId === clientId,
    )
    await Promise.all(dailyToDelete.map(async (row) => ctx.db.delete(row._id)))
    deleted += dailyToDelete.length

    const breakdowns = await ctx.db
      .query('analyticsMetricsBreakdown')
      .withIndex('by_workspace_client_date', (q) => q.eq('workspaceId', args.workspaceId).eq('clientId', clientId))
      .collect()
    await Promise.all(breakdowns.map(async (row) => ctx.db.delete(row._id)))
    deleted += breakdowns.length

    const legacy = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_provider_date', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', 'google-analytics'),
      )
      .collect()
    const legacyToDelete = legacy.filter((row) =>
      clientId === null ? row.clientId === null : row.clientId === clientId,
    )
    await Promise.all(legacyToDelete.map(async (row) => ctx.db.delete(row._id)))
    deleted += legacyToDelete.length

    return { ok: true, deleted }
  },
})

