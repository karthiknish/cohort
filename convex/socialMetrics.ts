import { z } from 'zod/v4'
import { zWorkspaceQuery } from './functions'

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const dailyRowZ = z.object({
  entityId: z.string(),
  entityName: z.string().nullable(),
  date: z.string(),
  impressions: z.number(),
  reach: z.number(),
  engagedUsers: z.number(),
  reactions: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  saves: z.number().optional(),
  followerCount: z.number().optional(),
  followerDelta: z.number().optional(),
  engagementRate: z.number().nullable().optional(),
})

const overviewZ = z.object({
  surface: z.string(),
  impressions: z.number(),
  reach: z.number(),
  engagedUsers: z.number(),
  reactions: z.number(),
  comments: z.number(),
  shares: z.number(),
  saves: z.number(),
  followerCountLatest: z.number().nullable(),
  followerDeltaTotal: z.number(),
  rowCount: z.number(),
})

const contentRowZ = z.object({
  contentId: z.string(),
  entityId: z.string(),
  entityName: z.string().nullable(),
  publishedAt: z.string().nullable(),
  contentType: z.string().nullable(),
  contentUrl: z.string().nullable(),
  message: z.string().nullable(),
  impressions: z.number(),
  reach: z.number(),
  engagedUsers: z.number(),
  reactions: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  saves: z.number().optional(),
  videoViews: z.number().optional(),
  engagementRate: z.number().nullable().optional(),
})

/**
 * Aggregate organic metrics totals for a surface + date range.
 */
export const listOverview = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
    surface: z.enum(['facebook', 'instagram']),
    startDate: z.string(),
    endDate: z.string(),
  },
  returns: overviewZ,
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const rows = await ctx.db
      .query('socialMetricsDaily')
      .withIndex('by_workspace_surface_date', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('surface', args.surface)
          .gte('date', args.startDate)
      )
      .filter((q) =>
        q.and(
          q.lte(q.field('date'), args.endDate),
          clientId !== null
            ? q.eq(q.field('clientId'), clientId)
            : q.eq(q.field('clientId'), null)
        )
      )
      .collect()

    let impressions = 0
    let reach = 0
    let engagedUsers = 0
    let reactions = 0
    let comments = 0
    let shares = 0
    let saves = 0
    let followerDeltaTotal = 0
    let followerCountLatest: number | null = null

    for (const row of rows) {
      impressions += row.impressions
      reach += row.reach
      engagedUsers += row.engagedUsers
      reactions += row.reactions ?? 0
      comments += row.comments ?? 0
      shares += row.shares ?? 0
      saves += row.saves ?? 0
      followerDeltaTotal += row.followerDelta ?? 0
      if (typeof row.followerCount === 'number') {
        followerCountLatest = row.followerCount
      }
    }

    return {
      surface: args.surface,
      impressions,
      reach,
      engagedUsers,
      reactions,
      comments,
      shares,
      saves,
      followerCountLatest,
      followerDeltaTotal,
      rowCount: rows.length,
    }
  },
})

/**
 * Daily time-series organic metrics for charting.
 */
export const listTimeSeries = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
    surface: z.enum(['facebook', 'instagram']),
    startDate: z.string(),
    endDate: z.string(),
  },
  returns: z.array(dailyRowZ),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const rows = await ctx.db
      .query('socialMetricsDaily')
      .withIndex('by_workspace_surface_date', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('surface', args.surface)
          .gte('date', args.startDate)
      )
      .filter((q) =>
        q.and(
          q.lte(q.field('date'), args.endDate),
          clientId !== null
            ? q.eq(q.field('clientId'), clientId)
            : q.eq(q.field('clientId'), null)
        )
      )
      .collect()

    return rows.map((row) => ({
      entityId: row.entityId,
      entityName: row.entityName,
      date: row.date,
      impressions: row.impressions,
      reach: row.reach,
      engagedUsers: row.engagedUsers,
      reactions: row.reactions,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      followerCount: row.followerCount,
      followerDelta: row.followerDelta,
      engagementRate: row.engagementRate,
    }))
  },
})

/**
 * Content-level organic post metrics, newest first.
 */
export const listContent = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
    surface: z.enum(['facebook', 'instagram']),
    limit: z.number().min(1).max(100).default(50),
  },
  returns: z.array(contentRowZ),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const rows = await ctx.db
      .query('socialContentMetrics')
      .withIndex('by_workspace_client_surface', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('clientId', clientId)
          .eq('surface', args.surface)
      )
      .order('desc')
      .take(args.limit)

    return rows.map((row) => ({
      contentId: row.contentId,
      entityId: row.entityId,
      entityName: row.entityName,
      publishedAt: row.publishedAt,
      contentType: row.contentType,
      contentUrl: row.contentUrl,
      message: row.message,
      impressions: row.impressions,
      reach: row.reach,
      engagedUsers: row.engagedUsers,
      reactions: row.reactions,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      videoViews: row.videoViews,
      engagementRate: row.engagementRate,
    }))
  },
})
