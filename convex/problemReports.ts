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

export const create = mutation({
  args: {
    legacyId: v.string(),
    userId: v.union(v.string(), v.null()),
    userEmail: v.union(v.string(), v.null()),
    userName: v.union(v.string(), v.null()),
    workspaceId: v.union(v.string(), v.null()),
    title: v.string(),
    description: v.string(),
    severity: v.string(),
    status: v.string(),
    createdAtMs: v.optional(v.number()),
    updatedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('problemReports')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    const timestamp = nowMs()

    const payload = {
      legacyId: args.legacyId,
      userId: args.userId,
      userEmail: args.userEmail,
      userName: args.userName,
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      severity: args.severity,
      status: args.status,
      fixed: null as boolean | null,
      resolution: null as string | null,
      createdAtMs: args.createdAtMs ?? timestamp,
      updatedAtMs: args.updatedAtMs ?? timestamp,
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...payload,
        fixed: existing.fixed ?? null,
        resolution: existing.resolution ?? null,
      })
      return { ok: true, id: existing._id }
    }

    const id = await ctx.db.insert('problemReports', payload)
    return { ok: true, id }
  },
})

export const list = query({
  args: {
    status: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.max(1, Math.min(args.limit ?? 200, 500))
    const status = args.status ?? null

    let rows
    if (status && status !== 'all') {
      rows = await ctx.db
        .query('problemReports')
        .withIndex('by_status_createdAtMs', (q) => q.eq('status', status))
        .order('desc')
        .take(limit)
    } else {
      rows = await ctx.db.query('problemReports').withIndex('by_createdAtMs').order('desc').take(limit)
    }

    return rows.map((row) => ({
      id: row.legacyId,
      userId: row.userId,
      userEmail: row.userEmail,
      userName: row.userName,
      workspaceId: row.workspaceId,
      title: row.title,
      description: row.description,
      severity: row.severity,
      status: row.status,
      fixed: (row.fixed ?? null) as boolean | null,
      resolution: (row.resolution ?? null) as string | null,
      createdAt: new Date(row.createdAtMs).toISOString(),
      updatedAt: new Date(row.updatedAtMs).toISOString(),
    }))
  },
})

export const update = mutation({
  args: {
    legacyId: v.string(),
    status: v.optional(v.string()),
    fixed: v.optional(v.boolean()),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('problemReports')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Problem report')
    }

    const updates: Record<string, unknown> = {
      updatedAtMs: nowMs(),
    }

    if (typeof args.status === 'string') {
      updates.status = args.status
    }

    if (typeof args.fixed === 'boolean') {
      updates.fixed = args.fixed
    }

    if (typeof args.resolution === 'string') {
      updates.resolution = args.resolution
    }

    await ctx.db.patch(existing._id, updates)
    return { ok: true }
  },
})

export const remove = mutation({
  args: { legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('problemReports')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      return { ok: true }
    }

    await ctx.db.delete(existing._id)
    return { ok: true }
  },
})
