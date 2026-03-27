import { internalMutation, mutation } from './_generated/server'
import { internal } from '/_generated/api'
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
    return await ctx.runMutation(internal.auditLogs.logInternal, {
      action: args.action,
      actorId: args.actorId,
      actorEmail: args.actorEmail,
      targetId: args.targetId,
      workspaceId: args.workspaceId,
      metadata: args.metadata,
      ip: args.ip,
      userAgent: args.userAgent,
      requestId: args.requestId,
    })
  },
})
