import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation, authenticatedMutation } from './functions'

function toSortKey(ms: number | null): number {
  return typeof ms === 'number' && Number.isFinite(ms) ? ms : 0
}

const milestoneValidator = v.object({
  legacyId: v.string(),
  projectId: v.string(),
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

export const listForProject = workspaceQuery({
  args: { projectId: v.string() },
  returns: v.array(milestoneValidator),
  handler: async (ctx, args) => {
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

export const listByProjectIds = workspaceQuery({
  args: { projectIds: v.array(v.string()) },
  returns: v.record(v.string(), v.array(milestoneValidator)),
  handler: async (ctx, args) => {
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

    return result as Record<string, Array<{
      legacyId: string
      projectId: string
      title: string
      description: string | null
      status: string
      startDateMs: number | null
      endDateMs: number | null
      ownerId: string | null
      order: number | null
      createdAtMs: number
      updatedAtMs: number
    }>>
  },
})

export const create = workspaceMutation({
  args: {
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
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const timestamp = ctx.now

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

    return { ok: true } as const
  },
})

export const update = workspaceMutation({
  args: {
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
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const milestone = await ctx.db
      .query('projectMilestones')
      .withIndex('by_workspace_project_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!milestone) {
      throw Errors.resource.notFound('Milestone')
    }

    const patch: Record<string, unknown> = {
      updatedAtMs: args.updatedAtMs ?? ctx.now,
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
    return { ok: true } as const
  },
})

export const remove = workspaceMutation({
  args: { projectId: v.string(), legacyId: v.string() },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const milestone = await ctx.db
      .query('projectMilestones')
      .withIndex('by_workspace_project_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!milestone) {
      throw Errors.resource.notFound('Milestone')
    }

    await ctx.db.delete(milestone._id)
    return { ok: true } as const
  },
})

// Use authenticatedMutation for bulk operations that may span multiple workspaces
export const bulkUpsert = authenticatedMutation({
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
  returns: v.object({
    upserted: v.number(),
  }),
  handler: async (ctx, args) => {
    let upserted = 0

    for (const milestone of args.milestones) {
      // Verify workspace access for each milestone
      if (ctx.user.role !== 'admin' && ctx.agencyId !== milestone.workspaceId) {
        throw Errors.auth.workspaceAccessDenied()
      }

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
