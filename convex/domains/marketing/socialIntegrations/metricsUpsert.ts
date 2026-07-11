import { internalMutation } from '../../../_generated/server'
import { v } from 'convex/values'
import { normalizeClientId } from '@/lib/normalizeClientId'

function nowMs() {
  return Date.now()
}

const dailyMetricValidator = v.object({
  surface: v.string(),
  entityId: v.string(),
  entityName: v.union(v.string(), v.null()),
  date: v.string(),
  impressions: v.number(),
  reach: v.number(),
  engagedUsers: v.number(),
  reactions: v.optional(v.number()),
  comments: v.optional(v.number()),
  shares: v.optional(v.number()),
  saves: v.optional(v.number()),
  followerCount: v.optional(v.number()),
  followerDelta: v.optional(v.number()),
  engagementRate: v.optional(v.union(v.number(), v.null())),
  rawPayload: v.optional(v.any()),
})

export const writeMetricsBatchInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    metrics: v.array(dailyMetricValidator),
  },
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId)
    const timestamp = nowMs()
    let inserted = 0
    let updated = 0

    const upsertResults = await Promise.all(
      args.metrics.map(async (metric) => {
        const existing = await ctx.db
          .query('socialMetricsDaily')
          .withIndex('by_workspace_client_surface_entity_date', (q) =>
            q
              .eq('workspaceId', args.workspaceId)
              .eq('clientId', clientId)
              .eq('surface', metric.surface)
              .eq('entityId', metric.entityId)
              .eq('date', metric.date),
          )
          .unique()

        const payload = {
          workspaceId: args.workspaceId,
          clientId,
          surface: metric.surface,
          entityId: metric.entityId,
          entityName: metric.entityName,
          date: metric.date,
          impressions: metric.impressions,
          reach: metric.reach,
          engagedUsers: metric.engagedUsers,
          reactions: metric.reactions,
          comments: metric.comments,
          shares: metric.shares,
          saves: metric.saves,
          followerCount: metric.followerCount,
          followerDelta: metric.followerDelta,
          engagementRate: metric.engagementRate,
          rawPayload: metric.rawPayload,
          updatedAtMs: timestamp,
        }

        if (existing) {
          await ctx.db.patch(existing._id, payload)
          return 'updated' as const
        }

        await ctx.db.insert('socialMetricsDaily', {
          ...payload,
          createdAtMs: timestamp,
        })
        return 'inserted' as const
      }),
    )
    inserted = upsertResults.filter((result) => result === 'inserted').length
    updated = upsertResults.filter((result) => result === 'updated').length

    return { inserted, updated }
  },
})
