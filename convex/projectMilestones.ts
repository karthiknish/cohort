import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs(): number {
  return Date.now()
}

function toSortKey(ms: number | null): number {
  return typeof ms === 'number' && Number.isFinite(ms) ? ms : 0
}

export const listForProject = query({
  args: { workspaceId: v.string(), projectId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const rows = await ctx.db
      .query('projectMilestones')
      .withIndex('by_workspace_project_start_created_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId)
      )
      .order('asc')
      .collect()

    return rows.map((row) => ({
      legacyId: row.legacyId,
      projectId: row.projectId,
      title: row.title,
      description: row.description,
      status: row.status,
      startDateMs: row.startDateMs,
      endDateMs: row.endDateMs,
      ownerId: row.ownerId,
      order: row.order,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }))
  },
})

export const listByProjectIds = query({
  args: { workspaceId: v.string(), projectIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const result: Record<string, unknown[]> = {}

    for (const projectId of args.projectIds) {
      const rows = await ctx.db
        .query('projectMilestones')
        .withIndex('by_workspace_project_start_created_legacyId', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('projectId', projectId)
        )
        .order('asc')
        .collect()

      result[projectId] = rows.map((row) => ({
        legacyId: row.legacyId,
        projectId: row.projectId,
        title: row.title,
        description: row.description,
        status: row.status,
        startDateMs: row.startDateMs,
        endDateMs: row.endDateMs,
        ownerId: row.ownerId,
        order: row.order,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
      }))
    }

    return result
  },
})

export const create = mutation({
  args: {
    workspaceId: v.string(),
    projectId: v.string(),
    legacyId: v.string(),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    startDateMs: v.union(v.number(), v.null()),
    endDateMs: v.union(v.number(), v.null()),
    ownerId: v.union(v.string(), v.null()),
    order: v.union(v.number(), v.null()),
    createdAtMs: v.optional(v.number()),
    updatedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

    await ctx.db.insert('projectMilestones', {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      legacyId: args.legacyId,
      title: args.title,
      description: args.description,
      status: args.status,
      startDateMs: args.startDateMs,
      endDateMs: args.endDateMs,
      startDateSortKey: toSortKey(args.startDateMs),
      ownerId: args.ownerId,
      order: args.order,
      createdAtMs: args.createdAtMs ?? timestamp,
      updatedAtMs: args.updatedAtMs ?? timestamp,
    })

    return { ok: true }
  },
})

export const update = mutation({
  args: {
    workspaceId: v.string(),
    projectId: v.string(),
    legacyId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.string()),
    startDateMs: v.optional(v.union(v.number(), v.null())),
    endDateMs: v.optional(v.union(v.number(), v.null())),
    ownerId: v.optional(v.union(v.string(), v.null())),
    order: v.optional(v.union(v.number(), v.null())),
    updatedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const milestone = await ctx.db
      .query('projectMilestones')
      .withIndex('by_workspace_project_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    const patch: Record<string, unknown> = {
      updatedAtMs: args.updatedAtMs ?? nowMs(),
    }

    if (args.title !== undefined) patch.title = args.title
    if (args.description !== undefined) patch.description = args.description
    if (args.status !== undefined) patch.status = args.status

    if (args.startDateMs !== undefined) {
      patch.startDateMs = args.startDateMs
      patch.startDateSortKey = toSortKey(args.startDateMs)
    }

    if (args.endDateMs !== undefined) patch.endDateMs = args.endDateMs
    if (args.ownerId !== undefined) patch.ownerId = args.ownerId
    if (args.order !== undefined) patch.order = args.order

    await ctx.db.patch(milestone._id, patch)
    return { ok: true }
  },
})

export const remove = mutation({
  args: { workspaceId: v.string(), projectId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const milestone = await ctx.db
      .query('projectMilestones')
      .withIndex('by_workspace_project_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    await ctx.db.delete(milestone._id)
    return { ok: true }
  },
})

export const bulkUpsert = mutation({
  args: {
    milestones: v.array(
      v.object({
        workspaceId: v.string(),
        projectId: v.string(),
        legacyId: v.string(),
        title: v.string(),
        description: v.union(v.string(), v.null()),
        status: v.string(),
        startDateMs: v.union(v.number(), v.null()),
        endDateMs: v.union(v.number(), v.null()),
        ownerId: v.union(v.string(), v.null()),
        order: v.union(v.number(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    let upserted = 0

    for (const milestone of args.milestones) {
      const existing = await ctx.db
        .query('projectMilestones')
        .withIndex('by_workspace_project_legacyId', (q) =>
          q
            .eq('workspaceId', milestone.workspaceId)
            .eq('projectId', milestone.projectId)
            .eq('legacyId', milestone.legacyId)
        )
        .unique()

      const payload = {
        workspaceId: milestone.workspaceId,
        projectId: milestone.projectId,
        legacyId: milestone.legacyId,
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        startDateMs: milestone.startDateMs,
        endDateMs: milestone.endDateMs,
        startDateSortKey: toSortKey(milestone.startDateMs),
        ownerId: milestone.ownerId,
        order: milestone.order,
        createdAtMs: milestone.createdAtMs,
        updatedAtMs: milestone.updatedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('projectMilestones', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})
