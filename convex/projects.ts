import {
  authenticatedMutation,
  workspaceMutation,
  workspaceQuery,
  workspaceQueryActive,
  zAuthenticatedMutation,
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from './functions'
import { v } from 'convex/values'
import { z } from 'zod/v4'
import { Errors } from './errors'
 
const projectZ = z.object({
  legacyId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  clientId: z.string().nullable(),
  clientName: z.string().nullable(),
  startDateMs: z.number().nullable(),
  endDateMs: z.number().nullable(),
  tags: z.array(z.string()),
  ownerId: z.string().nullable(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  deletedAtMs: z.number().nullable(),
})

export const list = zWorkspacePaginatedQueryActive({
  args: {
    status: z.string().optional(),
    clientId: z.string().optional(),
  },
  returns: z.object({
    items: z.array(projectZ),
    nextCursor: z.object({
      fieldValue: z.number(),
      legacyId: z.string(),
    }).nullable(),
  }),
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

export const getByLegacyId = zWorkspaceQuery({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: projectZ,
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

export const create = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.string(),
    clientId: z.string().nullable(),
    clientName: z.string().nullable(),
    startDateMs: z.number().nullable(),
    endDateMs: z.number().nullable(),
    tags: z.array(z.string()),
    ownerId: z.string().nullable(),
    createdAtMs: z.number().optional(),
    updatedAtMs: z.number().optional(),
  },
  returns: z.string(),
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

export const update = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    status: z.string().optional(),
    clientId: z.string().nullable().optional(),
    clientName: z.string().nullable().optional(),
    startDateMs: z.number().nullable().optional(),
    endDateMs: z.number().nullable().optional(),
    tags: z.array(z.string()).optional(),
    ownerId: z.string().nullable().optional(),
    updatedAtMs: z.number().optional(),
  },
  returns: z.string(),
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

export const softDelete = zWorkspaceMutation({
  args: { workspaceId: z.string(), legacyId: z.string(), deletedAtMs: z.number().optional() },
  returns: z.string(),
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

export const bulkUpsert = zAuthenticatedMutation({
  args: {
    projects: z.array(
      z.object({
        workspaceId: z.string(),
        legacyId: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        status: z.string(),
        clientId: z.string().nullable(),
        clientName: z.string().nullable(),
        startDateMs: z.number().nullable(),
        endDateMs: z.number().nullable(),
        tags: z.array(z.string()),
        ownerId: z.string().nullable(),
        createdAtMs: z.number(),
        updatedAtMs: z.number(),
        deletedAtMs: z.number().nullable(),
      })
    ),
  },
  returns: z.object({ upserted: z.number() }),
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
