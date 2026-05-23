import { buildProjectTasksRoute } from '../../../../src/lib/project-routes'
import { api, internal } from '/_generated/api'
import {
  asNonEmptyString,
  asRecord,
  asString,
  asStringArray,
  resolveAgentDueDateMs,
  resolveClientIdFromParams,
  resolveProjectContextFromParams,
  resolveWorkspaceAssignments,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import {
  buildTaskDigest,
  buildTaskDigestUserMessage,
  parseTaskTimeWindowFromIntent,
  type TaskTimeWindow,
} from '../taskSummary'
import {
  extractClientLookupRecords,
  extractClientTaskRecords,
  resolveClientLookupMatch,
} from '../shared'

function resolveTaskTimeWindow(args: {
  params: Record<string, unknown>
  rawMessage: string
}): TaskTimeWindow {
  const param = asNonEmptyString(args.params.timeWindow)?.toLowerCase()
  if (
    param === 'all' ||
    param === 'due_this_week' ||
    param === 'due_soon' ||
    param === 'overdue' ||
    param === 'today'
  ) {
    return param
  }
  return parseTaskTimeWindowFromIntent(args.rawMessage)
}

function taskDigestOperationData(
  digest: ReturnType<typeof buildTaskDigest>,
  extras: Record<string, unknown>,
) {
  return {
    ...extras,
    mode: digest.mode,
    timeWindow: digest.timeWindow,
    timeWindowLabel: digest.timeWindowLabel,
    totalTasks: digest.totalTasks,
    openTasks: digest.openTasks,
    completedTasks: digest.completedTasks,
    overdueTasks: digest.overdueTasks,
    dueSoonTasks: digest.dueSoonTasks,
    dueThisWeekTasks: digest.dueThisWeekTasks,
    highPriorityTasks: digest.highPriorityTasks,
    unscheduledOpen: digest.unscheduledOpen,
    statusBreakdown: digest.statusBreakdown,
    focusTasks: digest.focusTasks,
    overdueTaskList: digest.overdueTaskList,
    dueThisWeekList: digest.dueThisWeekList,
    dueSoonList: digest.dueSoonList,
    highPriorityList: digest.highPriorityList,
    tasks: digest.tasks,
  }
}

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
      const exactClient = await ctx.runQuery(internal.clients.getByLegacyIdServer, {
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
    const timeWindow = resolveTaskTimeWindow({ params: input.params, rawMessage: input.rawMessage ?? '' })
    const digest = buildTaskDigest({
      tasks,
      mode,
      timeWindow,
      scopeLabel: matchedClient.name,
      clientId: matchedClient.legacyId,
      clientName: matchedClient.name,
    })

    if (tasks.length === 0) {
      return {
        success: true,
        data: taskDigestOperationData(digest, {
          clientId: matchedClient.legacyId,
          clientName: matchedClient.name,
        }),
        userMessage: `I couldn’t find any tasks for ${matchedClient.name}.`,
      }
    }

    return {
      success: true,
      data: taskDigestOperationData(digest, {
        clientId: matchedClient.legacyId,
        clientName: matchedClient.name,
      }),
      userMessage: buildTaskDigestUserMessage(digest),
    }
  },

  async summarizeMyTasks(ctx, input) {
    const mode = asNonEmptyString(input.params.mode)?.toLowerCase() === 'summary' ? 'summary' : 'list'

    const rawTasks = await ctx.runQuery(api.tasks.listForUser, {
      workspaceId: input.workspaceId,
      userId: input.userId,
    })

    const tasks = extractClientTaskRecords(rawTasks)
    const timeWindow = resolveTaskTimeWindow({ params: input.params, rawMessage: input.rawMessage ?? '' })
    const digest = buildTaskDigest({
      tasks,
      mode,
      timeWindow,
      scopeLabel: 'you',
    })

    if (tasks.length === 0) {
      return {
        success: true,
        data: taskDigestOperationData(digest, { scope: 'workspace_user' }),
        userMessage: 'No tasks assigned to you (or unassigned) in this workspace right now.',
        route: '/dashboard/tasks',
      }
    }

    return {
      success: true,
      data: taskDigestOperationData(digest, { scope: 'workspace_user' }),
      userMessage: buildTaskDigestUserMessage(digest),
      route: '/dashboard/tasks',
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
    const assignmentResolution = await resolveWorkspaceAssignments(ctx, input.workspaceId, {
      rawMessage: input.rawMessage,
      params: input.params,
      context: input.context,
      mode: 'task',
    })
    if (assignmentResolution.status === 'ambiguous') {
      return {
        success: false,
        retryable: false,
        data: {
          query: assignmentResolution.query,
          suggestions: assignmentResolution.suggestions,
          error: 'Assignee is unclear.',
        },
        userMessage: `I found multiple workspace members matching “${assignmentResolution.query}”: ${assignmentResolution.suggestions.join(', ')}. Who should I assign this task to?`,
      }
    }

    const assignedTo = assignmentResolution.names.length > 0
      ? assignmentResolution.names
      : asStringArray(input.params.assignedTo)
    const projectContext = await resolveProjectContextFromParams(ctx, input.workspaceId, input.params, input.context)
    const clientResolution = projectContext.clientId
      ? {
          status: 'resolved' as const,
          clientId: projectContext.clientId,
          clientName: projectContext.clientName,
        }
      : await resolveClientIdFromParams(ctx, input.workspaceId, input.params, input.context)

    if (clientResolution.status !== 'resolved') {
      const suggestionText = clientResolution.suggestions.length > 0
        ? ` I found: ${clientResolution.suggestions.join(', ')}.`
        : ''
      return {
        success: false,
        retryable: false,
        data: {
          clientName: clientResolution.clientName,
          suggestions: clientResolution.suggestions,
          error: 'Client context is unclear.',
        },
        userMessage: clientResolution.status === 'missing'
          ? 'Which client should I attach this task to?'
          : `I’m not sure which client you mean for this task.${suggestionText} Which client should I use?`,
      }
    }

    const route = projectContext.projectId
      ? buildProjectTasksRoute({
          projectId: projectContext.projectId,
          projectName: projectContext.projectName,
          clientId: clientResolution.clientId || undefined,
          clientName: clientResolution.clientName,
        })
      : '/dashboard/tasks'

    const rawResult = await ctx.runMutation(api.tasks.createTask, {
      workspaceId: input.workspaceId,
      title,
      description: description ?? null,
      status,
      priority,
      assignedTo,
      clientId: clientResolution.clientId,
      client: clientResolution.clientName ?? null,
      projectId: projectContext.projectId ?? null,
      projectName: projectContext.projectName ?? null,
      dueDateMs,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const taskId = asNonEmptyString(asRecord(unwrapped)?.legacyId) ?? asNonEmptyString(unwrapped)

    return {
      success: true,
      data: {
        taskId,
        title,
        clientId: clientResolution.clientId || null,
        clientName: clientResolution.clientName ?? null,
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
