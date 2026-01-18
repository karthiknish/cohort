import {
  authenticatedMutation,
  authenticatedQuery,
  adminMutation,
  adminQuery,
  workspaceQuery,
  workspaceMutation,
  zAuthenticatedMutation,
  zAdminMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
  zWorkspacePaginatedQuery,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
  type AuthenticatedQueryCtx,
  type AuthenticatedMutationCtx,
} from './functions'
import { z } from 'zod/v4'
import { v } from 'convex/values'




import { Errors } from './errors'
 
const taskZ = z.object({
  legacyId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  assignedTo: z.array(z.string()).nullable(),
  client: z.string().nullable(),
  clientId: z.string().nullable(),
  projectId: z.string().nullable(),
  projectName: z.string().nullable(),
  dueDateMs: z.number().nullable(),
  tags: z.array(z.string()),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  deletedAtMs: z.number().nullable(),
})

export const list = zWorkspacePaginatedQueryActive({
  args: {},
  returns: z.object({
    items: z.array(taskZ),
    nextCursor: z.object({
      fieldValue: z.number(),
      legacyId: z.string(),
    }).nullable(),
  }),
  handler: async (ctx: any, args: any) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const rows = await q.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'createdAtMs')

    return {
      items: result.items.map((row: any) => ({
        legacyId: row.legacyId,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assignedTo,
        client: row.client,
        clientId: row.clientId,
        projectId: row.projectId,
        projectName: row.projectName,
        dueDateMs: row.dueDateMs,
        tags: row.tags,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: { legacyId: z.string() },
  returns: taskZ,
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)
    return {
      legacyId: row.legacyId,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assignedTo,
      client: row.client,
      clientId: row.clientId,
      projectId: row.projectId,
      projectName: row.projectName,
      dueDateMs: row.dueDateMs,
      tags: row.tags,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      deletedAtMs: row.deletedAtMs,
    }
  },
})

export const listByStatus = zWorkspacePaginatedQueryActive({
  args: {
    status: z.string(),
  },
  returns: z.object({
    items: z.array(taskZ),
    nextCursor: z.object({
      fieldValue: z.number(),
      legacyId: z.string(),
    }).nullable(),
  }),
  handler: async (ctx: any, args: any) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_status_createdAtMs', (q: any) => 
        q.eq('workspaceId', args.workspaceId).eq('status', args.status)
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const rows = await q.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'createdAtMs')

    return {
      items: result.items.map((row: any) => ({
        legacyId: row.legacyId,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assignedTo,
        client: row.client,
        clientId: row.clientId,
        projectId: row.projectId,
        projectName: row.projectName,
        dueDateMs: row.dueDateMs,
        tags: row.tags,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const listForProject = zWorkspacePaginatedQueryActive({
  args: {
    projectId: z.string(),
  },
  returns: z.object({
    items: z.array(taskZ),
    nextCursor: z.object({
      fieldValue: z.number(),
      legacyId: z.string(),
    }).nullable(),
  }),
  handler: async (ctx: any, args: any) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_projectId_deletedAtMs', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId),
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const rows = await q.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'createdAtMs')

    return {
      items: result.items.map((row: any) => ({
        legacyId: row.legacyId,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assignedTo,
        client: row.client,
        clientId: row.clientId,
        projectId: row.projectId,
        projectName: row.projectName,
        dueDateMs: row.dueDateMs,
        tags: row.tags,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const listByClient = zWorkspacePaginatedQueryActive({
  args: {
    clientId: z.string(),
  },
  returns: z.object({
    items: z.array(taskZ),
    nextCursor: z.object({
      fieldValue: z.number(),
      legacyId: z.string(),
    }).nullable(),
  }),
  handler: async (ctx: any, args: any) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const rows = await q.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'createdAtMs')

    return {
      items: result.items.map((row: any) => ({
        legacyId: row.legacyId,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assignedTo,
        client: row.client,
        clientId: row.clientId,
        projectId: row.projectId,
        projectName: row.projectName,
        dueDateMs: row.dueDateMs,
        tags: row.tags,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const createTask = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.string(),
    priority: z.string(),
    assignedTo: z.array(z.string()),
    clientId: z.string(),
    client: z.string().nullable(),
    dueDateMs: z.number().nullable(),
    tags: z.array(z.string()),
  },
  returns: z.string(),
  handler: async (ctx: any, args: any) => {
    const legacyId = `task_${ctx.now}_${Math.random().toString(16).slice(2)}`

    await ctx.db.insert('tasks', {
      workspaceId: args.workspaceId,
      legacyId,
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      assignedTo: args.assignedTo,
      clientId: args.clientId,
      client: args.client,
      projectId: null,
      projectName: null,
      dueDateMs: args.dueDateMs,
      tags: args.tags,
      createdBy: ctx.legacyId,
      updatedAtMs: ctx.now,
      createdAtMs: ctx.now,
      deletedAtMs: null,
    })

    return legacyId
  },
})

export const patchTask = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    update: z.object({
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.array(z.string()).optional(),
      dueDateMs: z.number().nullable().optional(),
      tags: z.array(z.string()).optional(),
    }),
  },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)

    const patch: Record<string, unknown> = {
      updatedAtMs: ctx.now,
    }

    if (args.update.title !== undefined) patch.title = args.update.title
    if (args.update.description !== undefined) patch.description = args.update.description
    if (args.update.status !== undefined) patch.status = args.update.status
    if (args.update.priority !== undefined) patch.priority = args.update.priority
    if (args.update.assignedTo !== undefined) patch.assignedTo = args.update.assignedTo
    if (args.update.dueDateMs !== undefined) patch.dueDateMs = args.update.dueDateMs
    if (args.update.tags !== undefined) patch.tags = args.update.tags

    await ctx.db.patch(row._id, patch)

    return { ok: true }
  },
})

export const bulkPatchTasks = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    ids: z.array(z.string()),
    update: z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.array(z.string()).optional(),
      dueDateMs: z.number().nullable().optional(),
      tags: z.array(z.string()).optional(),
    }),
  },
  returns: z.object({ ok: z.boolean(), updated: z.number() }),
  handler: async (ctx: any, args: any) => {
    const idSet = new Set(args.ids)

    const rows = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(1000)

    const updates = rows.filter((row: any) => idSet.has(row.legacyId))

    for (const row of updates) {
      const patch: Record<string, unknown> = { updatedAtMs: ctx.now }
      if (args.update.status !== undefined) patch.status = args.update.status
      if (args.update.priority !== undefined) patch.priority = args.update.priority
      if (args.update.assignedTo !== undefined) patch.assignedTo = args.update.assignedTo
      if (args.update.dueDateMs !== undefined) patch.dueDateMs = args.update.dueDateMs
      if (args.update.tags !== undefined) patch.tags = args.update.tags
      await ctx.db.patch(row._id, patch)
    }

    return { ok: true, updated: updates.length }
  },
})

export const softDeleteTask = zAuthenticatedMutation({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)

    await ctx.db.patch(row._id, { deletedAtMs: ctx.now, updatedAtMs: ctx.now })
    return { ok: true }
  },
})

export const bulkSoftDeleteTasks = zAuthenticatedMutation({
  args: { workspaceId: z.string(), ids: z.array(z.string()) },
  returns: z.object({ ok: z.boolean(), deleted: z.number() }),
  handler: async (ctx: any, args: any) => {
    const idSet = new Set(args.ids)

    const rows = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(1000)

    const updates = rows.filter((row: any) => idSet.has(row.legacyId))

    for (const row of updates) {
      await ctx.db.patch(row._id, { deletedAtMs: ctx.now, updatedAtMs: ctx.now })
    }

    return { ok: true, deleted: updates.length }
  },
})

export const upsert = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.string(),
    priority: z.string(),
    assignedTo: z.array(z.string()),
    client: z.string().nullable(),
    clientId: z.string().nullable(),
    projectId: z.string().nullable(),
    projectName: z.string().nullable(),
    dueDateMs: z.number().nullable(),
    tags: z.array(z.string()),
    createdBy: z.string().nullable(),
    createdAtMs: z.number().optional(),
    updatedAtMs: z.number().optional(),
    deletedAtMs: z.number().nullable().optional(),
  },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    const payload = {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      assignedTo: args.assignedTo,
      client: args.client,
      clientId: args.clientId,
      projectId: args.projectId,
      projectName: args.projectName,
      dueDateMs: args.dueDateMs,
      tags: args.tags,
      createdBy: args.createdBy,
      createdAtMs: args.createdAtMs ?? ctx.now,
      updatedAtMs: args.updatedAtMs ?? ctx.now,
      deletedAtMs: args.deletedAtMs ?? null,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return { ok: true }
    }

    await ctx.db.insert('tasks', payload)
    return { ok: true }
  },
})

export const bulkUpsert = zAuthenticatedMutation({
  args: {
    tasks: z.array(
      z.object({
        workspaceId: z.string(),
        legacyId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        status: z.string(),
        priority: z.string(),
        assignedTo: z.array(z.string()),
        client: z.string().nullable(),
        clientId: z.string().nullable(),
        projectId: z.string().nullable(),
        projectName: z.string().nullable(),
        dueDateMs: z.number().nullable(),
        tags: z.array(z.string()),
        createdBy: z.string().nullable(),
        createdAtMs: z.number(),
        updatedAtMs: z.number(),
        deletedAtMs: z.number().nullable(),
      })
    ),
  },
  returns: z.object({ ok: z.boolean(), upserted: z.number() }),
  handler: async (ctx: any, args: any) => {
    let upserted = 0
    for (const task of args.tasks) {
      const existing = await ctx.db
        .query('tasks')
        .withIndex('by_workspace_legacyId', (q: any) =>
          q.eq('workspaceId', task.workspaceId).eq('legacyId', task.legacyId)
        )
        .unique()

      const payload = {
        workspaceId: task.workspaceId,
        legacyId: task.legacyId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        client: task.client,
        clientId: task.clientId,
        projectId: task.projectId,
        projectName: task.projectName,
        dueDateMs: task.dueDateMs,
        tags: task.tags,
        createdBy: task.createdBy,
        createdAtMs: task.createdAtMs,
        updatedAtMs: task.updatedAtMs,
        deletedAtMs: task.deletedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('tasks', payload)
      }

      upserted += 1
    }

    return { ok: true, upserted }
  },
})

export const bulkUpdate = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    ids: z.array(z.string()),
    update: z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    }),
  },
  returns: z.object({ ok: z.boolean(), results: z.array(z.any()), tasks: z.array(taskZ) }),
  handler: async (ctx: any, args: any) => {
    const idSet = new Set(args.ids)

    const results: Array<{ id: string; success: boolean; error?: string }> = []
    const tasks: Array<{
      legacyId: string
      title: string
      description: string | null
      status: string
      priority: string
      assignedTo: string[]
      client: string | null
      clientId: string | null
      projectId: string | null
      projectName: string | null
      dueDateMs: number | null
      tags: string[]
      createdAtMs: number
      updatedAtMs: number
      deletedAtMs: number | null
    }> = []

    for (const legacyId of args.ids) {
      const row = await ctx.db
        .query('tasks')
        .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
        .unique()

      if (!row) {
        results.push({ id: legacyId, success: false, error: `Task with ID '${legacyId}' not found` })
        continue
      }

      const patch = {
        ...(args.update.status !== undefined ? { status: args.update.status } : {}),
        ...(args.update.priority !== undefined ? { priority: args.update.priority } : {}),
        ...(args.update.assignedTo !== undefined ? { assignedTo: args.update.assignedTo } : {}),
        ...(args.update.tags !== undefined ? { tags: args.update.tags } : {}),
        updatedAtMs: ctx.now,
      }

      await ctx.db.patch(row._id, patch)

      tasks.push({
        legacyId: row.legacyId,
        title: row.title,
        description: row.description,
        status: args.update.status ?? row.status,
        priority: args.update.priority ?? row.priority,
        assignedTo: args.update.assignedTo ?? row.assignedTo,
        client: row.client,
        clientId: row.clientId,
        projectId: row.projectId,
        projectName: row.projectName,
        dueDateMs: row.dueDateMs,
        tags: args.update.tags ?? row.tags,
        createdAtMs: row.createdAtMs,
        updatedAtMs: ctx.now,
        deletedAtMs: row.deletedAtMs,
      })

      results.push({ id: legacyId, success: true })
    }

    return { ok: true, results, tasks }
  },
})

export const bulkHardDelete = zAdminMutation({
  args: { workspaceId: z.string(), ids: z.array(z.string()) },
  returns: z.object({ ok: z.boolean(), results: z.array(z.any()) }),
  handler: async (ctx: any, args: any) => {
    const results: Array<{ id: string; success: boolean; error?: string }> = []

    for (const legacyId of args.ids) {
      const row = await ctx.db
        .query('tasks')
        .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
        .unique()

      if (!row) {
        results.push({ id: legacyId, success: false, error: `Task with ID '${legacyId}' not found` })
        continue
      }

      await ctx.db.delete(row._id)
      results.push({ id: legacyId, success: true })
    }

    return { ok: true, results }
  },
})

export const softDelete = zAuthenticatedMutation({
  args: { workspaceId: z.string(), legacyId: z.string(), deletedAtMs: z.number().optional() },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)

    await ctx.db.patch(row._id, {
      deletedAtMs: args.deletedAtMs ?? ctx.now,
      updatedAtMs: ctx.now,
    })

    return { ok: true }
  },
})

export const hardDelete = zAdminMutation({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)

    await ctx.db.delete(row._id)
    return { ok: true }
  },
})
