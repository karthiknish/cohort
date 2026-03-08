import { buildProjectTasksRoute } from '../../../../src/lib/project-routes'
import { api } from '../../../_generated/api'
import {
  asNonEmptyString,
  asRecord,
  asString,
  asStringArray,
  resolveAgentDueDateMs,
  resolveClientIdFromParams,
  resolveProjectContextFromParams,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import {
  extractClientLookupRecords,
  extractClientTaskRecords,
  formatTaskDate,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
  isCompletedTaskStatus,
  resolveClientLookupMatch,
} from '../shared'

export const taskOperationHandlers: Record<string, OperationHandler> = {
  async summarizeClientTasks(ctx, input) {
    const mode = asNonEmptyString(input.params.mode)?.toLowerCase() === 'summary' ? 'summary' : 'list'
    const lookupQuery =
      asNonEmptyString(input.params.clientReference) ??
      asNonEmptyString(input.params.clientName) ??
      asNonEmptyString(input.params.clientId) ??
      asNonEmptyString(input.context?.activeClientId ?? null)

    if (!lookupQuery) {
      return {
        success: false,
        retryable: false,
        data: { error: 'Client reference is required.' },
        userMessage: 'Which client should I use for that task request?',
      }
    }

    let matchedClient: { legacyId: string; name: string; workspaceId: string } | null = null

    try {
      const exactClient = await ctx.runQuery(api.clients.getByLegacyIdServer, {
        workspaceId: input.workspaceId,
        legacyId: lookupQuery,
      }) as { legacyId?: unknown; name?: unknown } | null

      const exactLegacyId = asNonEmptyString(exactClient?.legacyId)
      const exactName = asNonEmptyString(exactClient?.name)
      if (exactLegacyId && exactName) {
        matchedClient = {
          legacyId: exactLegacyId,
          name: exactName,
          workspaceId: input.workspaceId,
        }
      }
    } catch {
      // Fall back to broader lookup below.
    }

    let matches = matchedClient ? [matchedClient] : []

    if (!matchedClient) {
      const rawClients = await ctx.runQuery(api.clients.list, {
        workspaceId: input.workspaceId,
        limit: 500,
        includeAllWorkspaces: true,
      })

      const clients = extractClientLookupRecords(rawClients)
      const resolved = resolveClientLookupMatch(clients, lookupQuery)
      matchedClient = resolved.match
      matches = resolved.matches
    }

    if (!matchedClient) {
      const suggestions = matches.slice(0, 5).map((client) => client.name)
      return {
        success: false,
        retryable: false,
        data: { lookupQuery, suggestions },
        userMessage: suggestions.length === 0
          ? `I couldn’t find a client matching “${lookupQuery}”.`
          : `I found multiple clients matching “${lookupQuery}”: ${suggestions.join(', ')}. Which one should I use?`,
      }
    }

    const rawTasks = await ctx.runQuery(api.tasks.listByClient, {
      workspaceId: matchedClient.workspaceId,
      clientId: matchedClient.legacyId,
      limit: 200,
    })

    const tasks = extractClientTaskRecords(rawTasks)
    const nowMs = Date.now()
    const dueSoonCutoffMs = nowMs + 3 * 24 * 60 * 60 * 1000
    const openTasks = tasks.filter((task) => !isCompletedTaskStatus(task.status))
    const completedTasks = tasks.length - openTasks.length
    const overdueTasks = openTasks.filter((task) => typeof task.dueDateMs === 'number' && task.dueDateMs < nowMs).length
    const dueSoonTasks = openTasks.filter((task) => typeof task.dueDateMs === 'number' && task.dueDateMs >= nowMs && task.dueDateMs <= dueSoonCutoffMs).length
    const highPriorityTasks = openTasks.filter((task) => {
      const normalized = task.priority.toLowerCase()
      return normalized === 'high' || normalized === 'urgent'
    }).length

    const statusBreakdown = Array.from(tasks.reduce<Map<string, number>>((acc, task) => {
      const status = task.status.trim().toLowerCase() || 'unknown'
      acc.set(status, (acc.get(status) ?? 0) + 1)
      return acc
    }, new Map()))
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => right.count - left.count)

    const listedTasks = tasks.slice(0, 10).map((task) => ({
      taskId: task.legacyId,
      title: task.title,
      status: formatTaskStatusLabel(task.status),
      priority: formatTaskPriorityLabel(task.priority),
      dueDate: formatTaskDate(task.dueDateMs),
      assignedTo: task.assignedTo ?? [],
    }))

    if (tasks.length === 0) {
      return {
        success: true,
        data: {
          clientId: matchedClient.legacyId,
          clientName: matchedClient.name,
          totalTasks: 0,
          openTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          dueSoonTasks: 0,
          highPriorityTasks: 0,
          statusBreakdown: [],
          tasks: [],
        },
        userMessage: `I couldn’t find any tasks for ${matchedClient.name}.`,
      }
    }

    return {
      success: true,
      data: {
        clientId: matchedClient.legacyId,
        clientName: matchedClient.name,
        mode,
        totalTasks: tasks.length,
        openTasks: openTasks.length,
        completedTasks,
        overdueTasks,
        dueSoonTasks,
        highPriorityTasks,
        statusBreakdown,
        tasks: listedTasks,
      },
      userMessage: mode === 'summary'
        ? `Here’s the task summary for ${matchedClient.name}: ${openTasks.length} open, ${completedTasks} completed, ${overdueTasks} overdue.`
        : `I found ${tasks.length} task${tasks.length === 1 ? '' : 's'} for ${matchedClient.name}.`,
    }
  },

  async createTask(ctx, input) {
    const title = asNonEmptyString(input.params.title)

    if (!title) {
      return { success: false, data: { error: 'Task title is required.' }, userMessage: 'Please provide a task title.' }
    }

    const description = asNonEmptyString(input.params.description)
    const priorityRaw = asNonEmptyString(input.params.priority)?.toLowerCase()
    const priority = priorityRaw === 'low' || priorityRaw === 'high' || priorityRaw === 'medium' ? priorityRaw : 'medium'
    const status = asNonEmptyString(input.params.status) ?? 'todo'
    const dueDateMs = resolveAgentDueDateMs({
      dueDateMs: input.params.dueDateMs,
      dueDate: input.params.dueDate,
      rawMessage: input.rawMessage,
      nowMs: Date.now(),
    })
    const tags = asStringArray(input.params.tags)
    const assignedTo = asStringArray(input.params.assignedTo)
    const projectContext = await resolveProjectContextFromParams(ctx, input.workspaceId, input.params, input.context)
    const resolvedClient = projectContext.clientId
      ? {
          clientId: projectContext.clientId,
          clientName: projectContext.clientName,
        }
      : await resolveClientIdFromParams(ctx, input.workspaceId, input.params, input.context)

    const route = projectContext.projectId
      ? buildProjectTasksRoute({
          projectId: projectContext.projectId,
          projectName: projectContext.projectName,
          clientId: resolvedClient.clientId || undefined,
          clientName: resolvedClient.clientName,
        })
      : '/dashboard/tasks'

    const rawResult = await ctx.runMutation(api.tasks.createTask, {
      workspaceId: input.workspaceId,
      title,
      description: description ?? null,
      status,
      priority,
      assignedTo,
      clientId: resolvedClient.clientId,
      client: resolvedClient.clientName ?? null,
      projectId: projectContext.projectId ?? null,
      projectName: projectContext.projectName ?? null,
      dueDateMs,
      tags,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const taskId = asNonEmptyString(asRecord(unwrapped)?.legacyId) ?? asNonEmptyString(unwrapped)

    return {
      success: true,
      data: {
        taskId,
        title,
        clientId: resolvedClient.clientId || null,
        clientName: resolvedClient.clientName ?? null,
        projectId: projectContext.projectId,
        projectName: projectContext.projectName,
        route,
      },
      route,
      userMessage: taskId ? `Created task “${title}” (${taskId}).` : `Created task “${title}”.`,
    }
  },

  async updateTask(ctx, input) {
    const taskId = asNonEmptyString(input.params.taskId) ?? asNonEmptyString(input.params.legacyId) ?? asNonEmptyString(input.params.id)
    if (!taskId) {
      return { success: false, data: { error: 'taskId is required.' }, userMessage: 'Please tell me which task to update.' }
    }

    const update: Record<string, unknown> = {}
    const title = asNonEmptyString(input.params.title)
    if (title) update.title = title

    if ('description' in input.params) {
      update.description = asString(input.params.description)
    }

    const status = asNonEmptyString(input.params.status)
    if (status) update.status = status

    const priority = asNonEmptyString(input.params.priority)
    if (priority) update.priority = priority

    const assignedTo = asStringArray(input.params.assignedTo)
    if (Array.isArray(input.params.assignedTo)) update.assignedTo = assignedTo

    const dueDateMs = resolveAgentDueDateMs({
      dueDateMs: input.params.dueDateMs,
      dueDate: input.params.dueDate,
      rawMessage: input.rawMessage,
      nowMs: Date.now(),
    })
    if (dueDateMs !== null || 'dueDate' in input.params || 'dueDateMs' in input.params) {
      update.dueDateMs = dueDateMs
    }

    const tags = asStringArray(input.params.tags)
    if (Array.isArray(input.params.tags)) update.tags = tags

    if (Object.keys(update).length === 0) {
      return {
        success: false,
        data: { error: 'No valid fields provided for update.' },
        userMessage: 'Tell me what to change on the task (status, priority, title, due date, etc.).',
      }
    }

    await ctx.runMutation(api.tasks.patchTask, {
      workspaceId: input.workspaceId,
      legacyId: taskId,
      update,
    })

    return {
      success: true,
      data: { taskId, updatedFields: Object.keys(update) },
      userMessage: 'Task updated successfully.',
    }
  },
}