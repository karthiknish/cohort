import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

/**
 * Log an audit action.
 * Called from server-side code without user auth context.
 */
export const log = mutation({
  args: {
    action: v.string(),
    actorId: v.string(),
    actorEmail: v.optional(v.union(v.string(), v.null())),
    targetId: v.optional(v.union(v.string(), v.null())),
    workspaceId: v.optional(v.union(v.string(), v.null())),
    metadata: v.optional(v.any()),
    ip: v.optional(v.union(v.string(), v.null())),
    userAgent: v.optional(v.union(v.string(), v.null())),
    requestId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    // No auth check - audit logs are written by server-side code
    const timestampMs = Date.now()

    await ctx.db.insert('auditLogs', {
      action: args.action,
      actorId: args.actorId,
      actorEmail: args.actorEmail ?? null,
      targetId: args.targetId ?? null,
      workspaceId: args.workspaceId ?? null,
      metadata: args.metadata,
      ip: args.ip ?? null,
      userAgent: args.userAgent ?? null,
      requestId: args.requestId ?? null,
      timestampMs,
    })

    return { ok: true }
  },
})

/**
 * List recent audit logs.
 */
export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    actorId: v.optional(v.string()),
    action: v.optional(v.string()),
    workspaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const limit = Math.min(args.limit ?? 50, 200)

    let query

    if (args.actorId) {
      query = ctx.db
        .query('auditLogs')
        .withIndex('by_actorId_timestampMs', (q) => q.eq('actorId', args.actorId!))
        .order('desc')
    } else if (args.action) {
      query = ctx.db
        .query('auditLogs')
        .withIndex('by_action_timestampMs', (q) => q.eq('action', args.action!))
        .order('desc')
    } else if (args.workspaceId) {
      query = ctx.db
        .query('auditLogs')
        .withIndex('by_workspaceId_timestampMs', (q) => q.eq('workspaceId', args.workspaceId!))
        .order('desc')
    } else {
      query = ctx.db
        .query('auditLogs')
        .withIndex('by_timestampMs')
        .order('desc')
    }

    const logs = await query.take(limit)

    return logs.map((log) => ({
      id: log._id,
      action: log.action,
      actorId: log.actorId,
      actorEmail: log.actorEmail,
      targetId: log.targetId,
      workspaceId: log.workspaceId,
      metadata: log.metadata,
      ip: log.ip,
      userAgent: log.userAgent,
      requestId: log.requestId,
      timestamp: new Date(log.timestampMs).toISOString(),
    }))
  },
})
