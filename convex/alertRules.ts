import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function nowMs() {
  return Date.now()
}

/**
 * List enabled alert rules for a workspace.
 * Used by alert processor to evaluate rules.
 * No auth required - called from server-side code.
 */
export const listEnabled = query({
  args: { workspaceId: v.string() },
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

/**
 * List all alert rules for a workspace (with auth).
 */
export const listByWorkspace = query({
  args: {
    workspaceId: v.string(),
    enabledOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const enabledOnly = args.enabledOnly === true

    const rows = enabledOnly
      ? await ctx.db
          .query('alertRules')
          .withIndex('by_workspaceId_enabled', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('enabled', true)
          )
          .collect()
      : await ctx.db
          .query('alertRules')
          .withIndex('by_workspaceId', (q) => q.eq('workspaceId', args.workspaceId))
          .collect()

    rows.sort((a, b) => b.createdAtMs - a.createdAtMs)

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

/**
 * Get a single alert rule by ID.
 */
export const getByLegacyId = query({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('alertRules')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) throw Errors.resource.notFound('Alert rule', args.legacyId)

    return {
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
    }
  },
})

/**
 * Create a new alert rule.
 */
export const create = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.optional(v.union(v.string(), v.null())),
    type: v.string(),
    metric: v.string(),
    condition: v.any(),
    severity: v.string(),
    enabled: v.optional(v.boolean()),
    providerId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.union(v.string(), v.null())),
    formulaId: v.optional(v.union(v.string(), v.null())),
    insightType: v.optional(v.union(v.string(), v.null())),
    channels: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

    const existing = await ctx.db
      .query('alertRules')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (existing) {
      throw Errors.resource.alreadyExists('Alert rule')
    }

    const id = await ctx.db.insert('alertRules', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      name: args.name.trim(),
      description: args.description?.trim() ?? null,
      type: args.type,
      metric: args.metric,
      condition: args.condition,
      severity: args.severity,
      enabled: args.enabled ?? true,
      providerId: args.providerId ?? null,
      campaignId: args.campaignId ?? null,
      formulaId: args.formulaId ?? null,
      insightType: args.insightType ?? null,
      channels: args.channels,
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return { ok: true, id }
  },
})

/**
 * Update an existing alert rule.
 */
export const update = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    type: v.optional(v.string()),
    metric: v.optional(v.string()),
    condition: v.optional(v.any()),
    severity: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    providerId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.union(v.string(), v.null())),
    formulaId: v.optional(v.union(v.string(), v.null())),
    insightType: v.optional(v.union(v.string(), v.null())),
    channels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('alertRules')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Alert rule', args.legacyId)
    }

    const updates: Record<string, unknown> = {
      updatedAtMs: nowMs(),
    }

    if (args.name !== undefined) updates.name = args.name.trim()
    if (args.description !== undefined) updates.description = args.description?.trim() ?? null
    if (args.type !== undefined) updates.type = args.type
    if (args.metric !== undefined) updates.metric = args.metric
    if (args.condition !== undefined) updates.condition = args.condition
    if (args.severity !== undefined) updates.severity = args.severity
    if (args.enabled !== undefined) updates.enabled = args.enabled
    if (args.providerId !== undefined) updates.providerId = args.providerId ?? null
    if (args.campaignId !== undefined) updates.campaignId = args.campaignId ?? null
    if (args.formulaId !== undefined) updates.formulaId = args.formulaId ?? null
    if (args.insightType !== undefined) updates.insightType = args.insightType ?? null
    if (args.channels !== undefined) updates.channels = args.channels

    await ctx.db.patch(existing._id, updates)

    return { ok: true }
  },
})

/**
 * Delete an alert rule.
 */
export const remove = mutation({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('alertRules')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Alert rule', args.legacyId)
    }

    await ctx.db.delete(existing._id)

    return { ok: true }
  },
})
