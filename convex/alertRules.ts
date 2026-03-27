import { v } from 'convex/values'
import { internalQuery } from './_generated/server'

const alertRuleConditionValidator = v.object({
  operator: v.union(
    v.literal('gt'),
    v.literal('lt'),
    v.literal('gte'),
    v.literal('lte'),
    v.literal('eq'),
    v.literal('ne')
  ),
  threshold: v.union(v.number(), v.string()),
  windowSize: v.optional(v.union(v.number(), v.null())),
  direction: v.optional(v.union(v.literal('up'), v.literal('down'), v.null())),
  percentage: v.optional(v.union(v.number(), v.null())),
})

const alertRuleValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.union(v.string(), v.null()),
  type: v.string(),
  metric: v.string(),
  condition: alertRuleConditionValidator,
  severity: v.string(),
  enabled: v.boolean(),
  providerId: v.union(v.string(), v.null()),
  campaignId: v.union(v.string(), v.null()),
  formulaId: v.union(v.string(), v.null()),
  insightType: v.union(v.string(), v.null()),
  channels: v.array(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
})

/**
 * List enabled alert rules for a workspace.
 * Used by alert processor to evaluate rules.
 * Internal query - called from server-side alert processing.
 */
export const listEnabled = internalQuery({
  args: { workspaceId: v.string() },
  returns: v.array(alertRuleValidator),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('alertRules')
      .withIndex('by_workspaceId_enabled', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('enabled', true)
      )
      .collect()

    return rows.map((row) => ({
      id: row.legacyId,
      name: row.name,
      description: row.description,
      type: row.type,
      metric: row.metric,
      condition: row.condition,
      severity: row.severity,
      enabled: row.enabled,
      providerId: row.providerId,
      campaignId: row.campaignId,
      formulaId: row.formulaId,
      insightType: row.insightType,
      channels: row.channels,
      createdAt: new Date(row.createdAtMs).toISOString(),
      updatedAt: new Date(row.updatedAtMs).toISOString(),
    }))
  },
})
