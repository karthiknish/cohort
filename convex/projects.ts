import { v } from 'convex/values'
import {
  authenticatedMutation,
  workspaceMutation,
  workspaceQuery,
  workspaceQueryActive,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from './functions'
import { z } from 'zod/v4'
import { Errors } from './errors'

export const list = zWorkspacePaginatedQueryActive({
  args: {
    status: z.string().optional(),
    clientId: z.string().optional(),
  },
  handler: async (ctx, args) => {
    const hasStatus = typeof args.status === 'string'
    const hasClientId = typeof args.clientId === 'string'

    let q: any = ctx.db.query('projects')

    if (hasStatus && hasClientId) {
      q = q.withIndex('by_workspace_status_clientId_updatedAtMs_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('status', args.status!).eq('clientId', args.clientId!)
      )
    } else if (hasStatus) {
      q = q.withIndex('by_workspace_status_updatedAtMs_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('status', args.status!)
      )
    } else if (hasClientId) {
      q = q.withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId!)
      )
    } else {
      q = q.withIndex('by_workspace_updatedAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
    }

    q = q.order('desc')
    q = applyManualPagination(q, args.cursor, 'updatedAtMs', 'desc')

    const rows = await q.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'updatedAtMs')

    return {
      items: result.items.map((row: any) => ({
        legacyId: row.legacyId,
        name: row.name,
        description: row.description,
        status: row.status,
        clientId: row.clientId,
        clientName: row.clientName,
        startDateMs: row.startDateMs,
        endDateMs: row.endDateMs,
        tags: row.tags,
        ownerId: row.ownerId,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const getByLegacyId = workspaceQuery({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('projects')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Project', args.legacyId)

    return {
      legacyId: row.legacyId,
      name: row.name,
      description: row.description,
      status: row.status,
      clientId: row.clientId,
      clientName: row.clientName,
      startDateMs: row.startDateMs,
      endDateMs: row.endDateMs,
      tags: row.tags,
      ownerId: row.ownerId,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      deletedAtMs: row.deletedAtMs,
    }
  },
})

export const create = workspaceMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    clientId: v.union(v.string(), v.null()),
    clientName: v.union(v.string(), v.null()),
    startDateMs: v.union(v.number(), v.null()),
    endDateMs: v.union(v.number(), v.null()),
    tags: v.array(v.string()),
    ownerId: v.union(v.string(), v.null()),
    createdAtMs: v.optional(v.number()),
    updatedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('projects', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      name: args.name,
      nameLower: args.name.toLowerCase(),
      description: args.description,
      status: args.status,
      clientId: args.clientId,
      clientName: args.clientName,
      startDateMs: args.startDateMs,
      endDateMs: args.endDateMs,
      tags: args.tags,
      ownerId: args.ownerId,
      createdAtMs: args.createdAtMs ?? ctx.now,
      updatedAtMs: args.updatedAtMs ?? ctx.now,
      deletedAtMs: null,
    })

    return args.legacyId
  },
})

export const update = workspaceMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.string()),
    clientId: v.optional(v.union(v.string(), v.null())),
    clientName: v.optional(v.union(v.string(), v.null())),
    startDateMs: v.optional(v.union(v.number(), v.null())),
    endDateMs: v.optional(v.union(v.number(), v.null())),
    tags: v.optional(v.array(v.string())),
    ownerId: v.optional(v.union(v.string(), v.null())),
    updatedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query('projects')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!project || project.deletedAtMs !== null) {
      throw Errors.resource.notFound('Project')
    }

    const patch: Record<string, unknown> = {
      updatedAtMs: args.updatedAtMs ?? ctx.now,
    }

    if (args.name !== undefined) {
      patch.name = args.name
      patch.nameLower = args.name.toLowerCase()
    }

    if (args.description !== undefined) patch.description = args.description
    if (args.status !== undefined) patch.status = args.status
    if (args.clientId !== undefined) patch.clientId = args.clientId
    if (args.clientName !== undefined) patch.clientName = args.clientName
    if (args.startDateMs !== undefined) patch.startDateMs = args.startDateMs
    if (args.endDateMs !== undefined) patch.endDateMs = args.endDateMs
    if (args.tags !== undefined) patch.tags = args.tags
    if (args.ownerId !== undefined) patch.ownerId = args.ownerId

    await ctx.db.patch(project._id, patch)
    return project.legacyId
  },
})

export const softDelete = workspaceMutation({
  args: { workspaceId: v.string(), legacyId: v.string(), deletedAtMs: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query('projects')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!project) {
      throw Errors.resource.notFound('Project')
    }

    const timestamp = args.deletedAtMs ?? ctx.now
    await ctx.db.patch(project._id, {
      deletedAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return project.legacyId
  },
})

export const bulkUpsert = authenticatedMutation({
  args: {
    projects: v.array(
      v.object({
        workspaceId: v.string(),
        legacyId: v.string(),
        name: v.string(),
        description: v.union(v.string(), v.null()),
        status: v.string(),
        clientId: v.union(v.string(), v.null()),
        clientName: v.union(v.string(), v.null()),
        startDateMs: v.union(v.number(), v.null()),
        endDateMs: v.union(v.number(), v.null()),
        tags: v.array(v.string()),
        ownerId: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
        deletedAtMs: v.union(v.number(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let upserted = 0

    for (const project of args.projects) {
      const existing = await ctx.db
        .query('projects')
        .withIndex('by_workspace_legacyId', (q) =>
          q.eq('workspaceId', project.workspaceId).eq('legacyId', project.legacyId)
        )
        .unique()

      const payload = {
        workspaceId: project.workspaceId,
        legacyId: project.legacyId,
        name: project.name,
        nameLower: project.name.toLowerCase(),
        description: project.description,
        status: project.status,
        clientId: project.clientId,
        clientName: project.clientName,
        startDateMs: project.startDateMs,
        endDateMs: project.endDateMs,
        tags: project.tags,
        ownerId: project.ownerId,
        createdAtMs: project.createdAtMs,
        updatedAtMs: project.updatedAtMs,
        deletedAtMs: project.deletedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('projects', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})
