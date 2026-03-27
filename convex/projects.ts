import {
  zAuthenticatedMutation,
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from './functions'
import { z } from 'zod/v4'
import { internal } from '/_generated/api'
import { Errors } from './errors'
import { resolveProjectNotificationRecipientUserIds } from './notificationTargeting'
 
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
    const status = typeof args.status === 'string' ? args.status : null
    const clientId = typeof args.clientId === 'string' ? args.clientId : null

    const baseQuery = ctx.db.query('projects')
    const indexedQuery = status && clientId
      ? baseQuery.withIndex('by_workspace_status_clientId_updatedAtMs_legacyId', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('status', status).eq('clientId', clientId)
        )
      : status
        ? baseQuery.withIndex('by_workspace_status_updatedAtMs_legacyId', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('status', status)
          )
        : clientId
          ? baseQuery.withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
              q.eq('workspaceId', args.workspaceId).eq('clientId', clientId)
            )
          : baseQuery.withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))

    let q = indexedQuery.order('desc')
    q = applyManualPagination(q, args.cursor, 'updatedAtMs', 'desc')

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'updatedAtMs')

    return {
      items: result.items.map((row) => ({
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
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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
    const createdAtMs = args.createdAtMs ?? ctx.now
    const updatedAtMs = args.updatedAtMs ?? ctx.now

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
      createdAtMs,
      updatedAtMs,
      deletedAtMs: null,
    })

    const recipientUserIds = (await resolveProjectNotificationRecipientUserIds(
      ctx,
      args.workspaceId,
      args.ownerId,
    )).filter((userId) => userId !== ctx.legacyId)

    if (recipientUserIds.length > 0) {
      const clientId = typeof args.clientId === 'string' && args.clientId.length > 0 ? args.clientId : null
      const segments = [`Status: ${args.status}`]

      if (args.startDateMs) {
        segments.push(`Start: ${new Date(args.startDateMs).toLocaleDateString()}`)
      }

      if (args.clientName) {
        segments.push(`Client: ${args.clientName}`)
      }

      await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
        workspaceId: args.workspaceId,
        legacyId: `project:created:${args.legacyId}`,
        kind: 'project.created',
        title: `New project: ${args.name}`,
        body: segments.join(' · '),
        actorId: ctx.legacyId ?? null,
        actorName: null,
        resourceType: 'project',
        resourceId: args.legacyId,
        recipientRoles: [],
        recipientClientId: clientId,
        recipientClientIds: clientId ? [clientId] : undefined,
        recipientUserIds,
        metadata: {
          status: args.status,
          clientId,
          clientName: args.clientName ?? null,
        },
        createdAtMs,
        updatedAtMs,
      })
    }

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
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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
