import { internalMutation, mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import { z } from 'zod/v4'
import { Errors } from './errors'
import { zAuthenticatedQuery } from './functions'

/**
 * Log an audit action.
 * Called from server-side code without user auth context.
 */
export const logInternal = internalMutation({
  args: {
    action: v.string(),
    actorId: v.string(),
    actorEmail: v.optional(v.union(v.string(), v.null())),
    targetId: v.optional(v.union(v.string(), v.null())),
    workspaceId: v.optional(v.union(v.string(), v.null())),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))),
    ip: v.optional(v.union(v.string(), v.null())),
    userAgent: v.optional(v.union(v.string(), v.null())),
    requestId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
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

export const log = mutation({
  args: {
    serverKey: v.string(),
    action: v.string(),
    actorId: v.string(),
    actorEmail: v.optional(v.union(v.string(), v.null())),
    targetId: v.optional(v.union(v.string(), v.null())),
    workspaceId: v.optional(v.union(v.string(), v.null())),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))),
    ip: v.optional(v.union(v.string(), v.null())),
    userAgent: v.optional(v.union(v.string(), v.null())),
    requestId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const secret = process.env.INTEGRATIONS_CRON_SECRET
    if (!secret || args.serverKey !== secret) {
      throw Errors.auth.unauthorized()
    }
    const { serverKey, ...logArgs } = args
    return await ctx.runMutation(internal.auditLogs.logInternal, logArgs)
  },
})

/**
 * List recent audit logs.
 */
export const listRecent = zAuthenticatedQuery({
  args: {
    limit: z.number().optional(),
    actorId: z.string().optional(),
    action: z.string().optional(),
    workspaceId: z.string().optional(),
  },
  returns: z.array(z.object({
    id: z.string(),
    action: z.string(),
    actorId: z.string(),
    actorEmail: z.string().nullable(),
    targetId: z.string().nullable(),
    workspaceId: z.string().nullable(),
    metadata: z.any().optional(),
    ip: z.string().nullable(),
    userAgent: z.string().nullable(),
    requestId: z.string().nullable(),
    timestamp: z.string(),
  })),
  handler: async (ctx, args) => {
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
