import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import {
  authenticatedMutation,
  authenticatedQuery,
  adminMutation,
  adminQuery,
  workspaceQuery,
  workspaceMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
  type AuthenticatedQueryCtx,
  type AuthenticatedMutationCtx,
} from './functions'
import { z } from 'zod/v4'




export const list = zWorkspaceQueryActive({
  args: {
    limit: z.number().min(1).max(200),
    // Cursor for pagination, based on (createdAtMs, legacyId)
    afterCreatedAtMs: z.number().optional(),
    afterLegacyId: z.string().optional(),
  },
  handler: async (ctx: any, args: any) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
      .order('desc')

    const afterCreatedAtMs = args.afterCreatedAtMs
    const afterLegacyId = args.afterLegacyId

    if (typeof afterCreatedAtMs === 'number' && typeof afterLegacyId === 'string') {
      q = q.filter((row: any) =>
        row.or(
          row.lt(row.field('createdAtMs'), afterCreatedAtMs),
          row.and(
            row.eq(row.field('createdAtMs'), afterCreatedAtMs),
            row.lt(row.field('legacyId'), afterLegacyId),
          ),
        ),
      )
    }

    const rows = await q.take(args.limit)
    return rows.map((row: any) => ({
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
    }))
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: { legacyId: z.string() },
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return null
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

export const listForProject = zWorkspaceQueryActive({
  args: {
    projectId: z.string(),
    limit: z.number().min(1).max(200),
  },
  handler: async (ctx: any, args: any) => {
    const rows = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_projectId_deletedAtMs', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId),
      )
      .order('desc')
      .filter((row: any) => row.eq(row.field('deletedAtMs'), null))
      .take(args.limit)

    return rows.map((row: any) => ({
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
    }))
  },
})

export const listByClient = zWorkspaceQueryActive({
  args: {
    clientId: z.string(),
    limit: z.number().min(1).max(200),
  },
  handler: async (ctx: any, args: any) => {
    const base = ctx.db
      .query('tasks')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')

    const rows = await base.take(500)

    return rows
      .filter((row: any) => row.deletedAtMs === null)
      .map((row: any) => ({
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
      }))
  },
})

export const createTask = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    priority: v.string(),
    assignedTo: v.array(v.string()),
    clientId: v.string(),
    client: v.union(v.string(), v.null()),
    dueDateMs: v.union(v.number(), v.null()),
    tags: v.array(v.string()),
  },
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

export const patchTask = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    update: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.union(v.string(), v.null())),
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      assignedTo: v.optional(v.array(v.string())),
      dueDateMs: v.optional(v.union(v.number(), v.null())),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) {
      return { ok: false, error: 'not_found' as const }
    }

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

export const bulkPatchTasks = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    ids: v.array(v.string()),
    update: v.object({
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      assignedTo: v.optional(v.array(v.string())),
      dueDateMs: v.optional(v.union(v.number(), v.null())),
      tags: v.optional(v.array(v.string())),
    }),
  },
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

export const softDeleteTask = authenticatedMutation({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) {
      return { ok: false, error: 'not_found' as const }
    }

    await ctx.db.patch(row._id, { deletedAtMs: ctx.now, updatedAtMs: ctx.now })
    return { ok: true }
  },
})

export const bulkSoftDeleteTasks = authenticatedMutation({
  args: { workspaceId: v.string(), ids: v.array(v.string()) },
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

export const upsert = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    priority: v.string(),
    assignedTo: v.array(v.string()),
    client: v.union(v.string(), v.null()),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    projectName: v.union(v.string(), v.null()),
    dueDateMs: v.union(v.number(), v.null()),
    tags: v.array(v.string()),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.optional(v.number()),
    updatedAtMs: v.optional(v.number()),
    deletedAtMs: v.optional(v.union(v.number(), v.null())),
  },
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

export const bulkUpsert = authenticatedMutation({
  args: {
    tasks: v.array(
      v.object({
        workspaceId: v.string(),
        legacyId: v.string(),
        title: v.string(),
        description: v.union(v.string(), v.null()),
        status: v.string(),
        priority: v.string(),
        assignedTo: v.array(v.string()),
        client: v.union(v.string(), v.null()),
        clientId: v.union(v.string(), v.null()),
        projectId: v.union(v.string(), v.null()),
        projectName: v.union(v.string(), v.null()),
        dueDateMs: v.union(v.number(), v.null()),
        tags: v.array(v.string()),
        createdBy: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
        deletedAtMs: v.union(v.number(), v.null()),
      })
    ),
  },
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

export const bulkUpdate = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    ids: v.array(v.string()),
    update: v.object({
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      assignedTo: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    }),
  },
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

export const bulkHardDelete = adminMutation({
  args: { workspaceId: v.string(), ids: v.array(v.string()) },
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

export const softDelete = authenticatedMutation({
  args: { workspaceId: v.string(), legacyId: v.string(), deletedAtMs: v.optional(v.number()) },
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return { ok: false, error: 'not_found' as const }

    await ctx.db.patch(row._id, {
      deletedAtMs: args.deletedAtMs ?? ctx.now,
      updatedAtMs: ctx.now,
    })

    return { ok: true }
  },
})

export const hardDelete = adminMutation({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return { ok: false, error: 'not_found' as const }

    await ctx.db.delete(row._id)
    return { ok: true }
  },
})
