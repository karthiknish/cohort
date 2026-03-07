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
import { internal } from './_generated/api'

import { Errors } from './errors'

const taskAttachmentZ = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
})

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
  attachments: z.array(taskAttachmentZ),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  deletedAtMs: z.number().nullable(),
})

const bulkTaskResultZ = z.object({
  id: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
})

type TaskRowInput = Omit<z.infer<typeof taskZ>, 'attachments'> & {
  attachments?: unknown
}

type TaskAttachmentInput = {
  name?: unknown
  url?: unknown
  type?: unknown
  size?: unknown
}

function normalizeTaskAttachments(raw: unknown): Array<z.infer<typeof taskAttachmentZ>> {
  if (!Array.isArray(raw)) return []

  const normalized: Array<z.infer<typeof taskAttachmentZ>> = []

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue

    const attachment = item as TaskAttachmentInput

    const name = typeof attachment.name === 'string' ? attachment.name : null
    const url = typeof attachment.url === 'string' ? attachment.url : null

    if (!name || !url) continue

    normalized.push({
      name,
      url,
      type: typeof attachment.type === 'string' ? attachment.type : null,
      size: typeof attachment.size === 'string' ? attachment.size : null,
    })
  }

  return normalized
}

function mapTaskRow(row: TaskRowInput): z.infer<typeof taskZ> {
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
    attachments: normalizeTaskAttachments(row.attachments),
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
    deletedAtMs: row.deletedAtMs,
  }
}

function getDueDateDayKey(dueDateMs: number): string {
  return new Date(dueDateMs).toISOString().slice(0, 10)
}

function getCurrentDayKey(nowMs: number, timeZone?: string | null): string {
  const currentDate = new Date(nowMs)

  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(currentDate)

      const year = parts.find((part) => part.type === 'year')?.value
      const month = parts.find((part) => part.type === 'month')?.value
      const day = parts.find((part) => part.type === 'day')?.value

      if (year && month && day) {
        return `${year}-${month}-${day}`
      }
    } catch {
      // Fall back to UTC below if the timezone is invalid.
    }
  }

  return currentDate.toISOString().slice(0, 10)
}

function assertFutureDueDateMs(dueDateMs: number | null | undefined, nowMs: number, timeZone?: string | null) {
  if (dueDateMs == null) return

  const dueDateKey = getDueDateDayKey(dueDateMs)
  const todayKey = getCurrentDayKey(nowMs, timeZone)

  if (dueDateKey < todayKey) {
    throw Errors.validation.invalidInput('Due date must be today or later.', {
      field: 'dueDateMs',
      dueDate: dueDateKey,
      today: todayKey,
    })
  }
}

export const list = zWorkspacePaginatedQueryActive({
  args: {},
  returns: z.object({
    items: z.array(taskZ),
    nextCursor: z.object({
      fieldValue: z.number(),
      legacyId: z.string(),
    }).nullable(),
  }),
  handler: async (ctx, args) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')

    return {
      items: result.items.map(mapTaskRow),
      nextCursor: result.nextCursor,
    }
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: { legacyId: z.string() },
  returns: taskZ,
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)
    return mapTaskRow(row)
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
  handler: async (ctx, args) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_status_createdAtMs', (q) => 
        q.eq('workspaceId', args.workspaceId).eq('status', args.status)
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')

    return {
      items: result.items.map(mapTaskRow),
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
  handler: async (ctx, args) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_projectId_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('projectId', args.projectId),
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')

    return {
      items: result.items.map(mapTaskRow),
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
  handler: async (ctx, args) => {
    let q = ctx.db
      .query('tasks')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')

    return {
      items: result.items.map(mapTaskRow),
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
    projectId: z.string().nullable().optional(),
    projectName: z.string().nullable().optional(),
    dueDateMs: z.number().nullable(),
    tags: z.array(z.string()),
    attachments: z.array(taskAttachmentZ).optional(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    assertFutureDueDateMs(args.dueDateMs, ctx.now, ctx.user.regionalPreferences?.timezone ?? null)

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
      projectId: args.projectId ?? null,
      projectName: args.projectName ?? null,
      dueDateMs: args.dueDateMs,
      tags: args.tags,
      attachments: Array.isArray(args.attachments) ? args.attachments : [],
      createdBy: ctx.legacyId,
      updatedAtMs: ctx.now,
      createdAtMs: ctx.now,
      deletedAtMs: null,
    })

    const nowMs = ctx.now
    const segments = [`Priority: ${args.priority}`, `Status: ${args.status}`]
    if (args.assignedTo?.length) segments.push(`Assigned: ${args.assignedTo.join(', ')}`)
    if (args.dueDateMs) {
      segments.push(`Due: ${new Date(args.dueDateMs).toLocaleDateString()}`)
    }
    if (args.client) segments.push(`Client: ${args.client}`)
    if (args.projectName) segments.push(`Project: ${args.projectName}`)
    if (Array.isArray(args.attachments) && args.attachments.length > 0) {
      segments.push(`Attachments: ${args.attachments.length}`)
    }

    const clientId = typeof args.clientId === 'string' && args.clientId.length > 0 ? args.clientId : null
    const baseRoles = clientId ? ['admin', 'team', 'client'] : ['admin', 'team']

    await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
      workspaceId: args.workspaceId,
      legacyId: `task:created:${legacyId}`,
      kind: 'task.created',
      title: `Task created: ${args.title}`,
      body: segments.join(' · '),
      actorId: ctx.legacyId ?? null,
      actorName: null,
      resourceType: 'task',
      resourceId: legacyId,
      recipientRoles: baseRoles,
      recipientClientId: clientId,
      recipientClientIds: clientId ? [clientId] : undefined,
      metadata: {
        status: args.status,
        priority: args.priority,
        assignedTo: args.assignedTo,
        clientId,
        clientName: args.client ?? null,
        projectId: args.projectId ?? null,
        projectName: args.projectName ?? null,
      },
      createdAtMs: nowMs,
      updatedAtMs: nowMs,
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
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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
    if (args.update.dueDateMs !== undefined) {
      assertFutureDueDateMs(args.update.dueDateMs, ctx.now, ctx.user.regionalPreferences?.timezone ?? null)
      patch.dueDateMs = args.update.dueDateMs
    }
    if (args.update.tags !== undefined) patch.tags = args.update.tags

    await ctx.db.patch(row._id, patch)

    const changes: string[] = []
    if (args.update.status !== undefined) changes.push(`Status → ${args.update.status}`)
    if (args.update.priority !== undefined) changes.push(`Priority → ${args.update.priority}`)
    if (args.update.title !== undefined) changes.push(`Title → ${args.update.title}`)
    if (args.update.assignedTo !== undefined) changes.push(`Assigned → ${args.update.assignedTo.join(', ') || 'unassigned'}`)
    if (args.update.dueDateMs !== undefined) {
      changes.push(args.update.dueDateMs ? `Due → ${new Date(args.update.dueDateMs).toLocaleDateString()}` : 'Due date removed')
    }
    if (args.update.tags !== undefined) changes.push(`Tags → ${args.update.tags.join(', ') || 'none'}`)

    if (changes.length > 0) {
      const nowMs = ctx.now
      const clientId = typeof row.clientId === 'string' && row.clientId.length > 0 ? row.clientId : null
      const baseRoles = clientId ? ['admin', 'team', 'client'] : ['admin', 'team']

      await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
        workspaceId: args.workspaceId,
        legacyId: `task:updated:${args.legacyId}:${nowMs}`,
        kind: 'task.updated',
        title: `Task updated: ${row.title}`,
        body: changes.join(' · '),
        actorId: ctx.legacyId ?? null,
        actorName: null,
        resourceType: 'task',
        resourceId: args.legacyId,
        recipientRoles: baseRoles,
        recipientClientId: clientId,
        recipientClientIds: clientId ? [clientId] : undefined,
        metadata: {
          status: (args.update.status ?? row.status) as string,
          priority: (args.update.priority ?? row.priority) as string,
          clientId,
          clientName: row.client ?? null,
          changes,
        },
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
      })
    }

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
  handler: async (ctx, args) => {
    if (args.update.dueDateMs !== undefined) {
      assertFutureDueDateMs(args.update.dueDateMs, ctx.now, ctx.user.regionalPreferences?.timezone ?? null)
    }

    const idSet = new Set(args.ids)

    const rows = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(1000)

    const updates = rows.filter((row) => idSet.has(row.legacyId))

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
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)

    await ctx.db.patch(row._id, { deletedAtMs: ctx.now, updatedAtMs: ctx.now })
    return { ok: true }
  },
})

export const bulkSoftDeleteTasks = zAuthenticatedMutation({
  args: { workspaceId: z.string(), ids: z.array(z.string()) },
  returns: z.object({ ok: z.boolean(), deleted: z.number() }),
  handler: async (ctx, args) => {
    const idSet = new Set(args.ids)

    const rows = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_createdAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(1000)

    const updates = rows.filter((row) => idSet.has(row.legacyId))

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
    attachments: z.array(taskAttachmentZ).optional(),
    createdBy: z.string().nullable(),
    createdAtMs: z.number().optional(),
    updatedAtMs: z.number().optional(),
    deletedAtMs: z.number().nullable().optional(),
  },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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
      attachments: Array.isArray(args.attachments)
        ? args.attachments
        : (existing ? normalizeTaskAttachments(existing.attachments) : []),
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
        attachments: z.array(taskAttachmentZ).optional(),
        createdBy: z.string().nullable(),
        createdAtMs: z.number(),
        updatedAtMs: z.number(),
        deletedAtMs: z.number().nullable(),
      })
    ),
  },
  returns: z.object({ ok: z.boolean(), upserted: z.number() }),
  handler: async (ctx, args) => {
    let upserted = 0
    for (const task of args.tasks) {
      const existing = await ctx.db
        .query('tasks')
        .withIndex('by_workspace_legacyId', (q) =>
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
        attachments: Array.isArray(task.attachments)
          ? task.attachments
          : (existing ? normalizeTaskAttachments(existing.attachments) : []),
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
  returns: z.object({ ok: z.boolean(), results: z.array(bulkTaskResultZ), tasks: z.array(taskZ) }),
  handler: async (ctx, args) => {
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
      attachments: Array<z.infer<typeof taskAttachmentZ>>
      createdAtMs: number
      updatedAtMs: number
      deletedAtMs: number | null
    }> = []

    for (const legacyId of args.ids) {
      const row = await ctx.db
        .query('tasks')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
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
        attachments: normalizeTaskAttachments(row.attachments),
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
  returns: z.object({ ok: z.boolean(), results: z.array(bulkTaskResultZ) }),
  handler: async (ctx, args) => {
    const results: Array<{ id: string; success: boolean; error?: string }> = []

    for (const legacyId of args.ids) {
      const row = await ctx.db
        .query('tasks')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
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
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Task', args.legacyId)

    await ctx.db.delete(row._id)
    return { ok: true }
  },
})
