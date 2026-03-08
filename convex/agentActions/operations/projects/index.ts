import { buildProjectRoute } from '../../../../src/lib/project-routes'
import { api } from '../../../_generated/api'
import {
  asNonEmptyString,
  asNumber,
  asString,
  asStringArray,
  parseDateToMs,
  resolveClientIdFromParams,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'

export const projectOperationHandlers: Record<string, OperationHandler> = {
  async createProject(ctx, input) {
    const name = asNonEmptyString(input.params.name)
    if (!name) {
      return { success: false, data: { error: 'Project name is required.' }, userMessage: 'Please provide a project name.' }
    }

    const legacyId = asNonEmptyString(input.params.projectId) ?? asNonEmptyString(input.params.legacyId) ?? `project_${crypto.randomUUID()}`
    const description = asNonEmptyString(input.params.description)
    const status = asNonEmptyString(input.params.status) ?? 'planning'
    const startDateMs = asNumber(input.params.startDateMs) ?? parseDateToMs(input.params.startDate)
    const endDateMs = asNumber(input.params.endDateMs) ?? parseDateToMs(input.params.endDate)
    const tags = asStringArray(input.params.tags)
    const shouldClearClient = asNonEmptyString(input.params.clientId) === 'none'
    const resolvedClient = shouldClearClient
      ? { clientId: '', clientName: null }
      : await resolveClientIdFromParams(ctx, input.workspaceId, input.params, input.context)
    const clientId = shouldClearClient ? null : (resolvedClient.clientId || null)
    const clientName = shouldClearClient ? null : (resolvedClient.clientName ?? asNonEmptyString(input.params.clientName) ?? null)

    const rawResult = await ctx.runMutation(api.projects.create, {
      workspaceId: input.workspaceId,
      legacyId,
      name,
      description: description ?? null,
      status,
      clientId,
      clientName: clientName ?? null,
      startDateMs,
      endDateMs,
      tags,
      ownerId: input.userId,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const projectId = asNonEmptyString(unwrapped) ?? legacyId

    return {
      success: true,
      route: buildProjectRoute(projectId, name),
      data: { projectId, name, clientId, clientName, status, tags },
      userMessage: `Created project ${name}.`,
    }
  },

  async updateProject(ctx, input) {
    const projectId = asNonEmptyString(input.params.projectId)
      ?? asNonEmptyString(input.params.legacyId)
      ?? asNonEmptyString(input.params.id)
      ?? asNonEmptyString(input.context?.activeProjectId ?? null)
    if (!projectId) {
      return { success: false, data: { error: 'projectId is required.' }, userMessage: 'Please tell me which project to update.' }
    }

    const updateArgs: {
      workspaceId: string
      legacyId: string
      updatedAtMs: number
      name?: string
      description?: string | null
      status?: string
      clientId?: string | null
      clientName?: string | null
      startDateMs?: number | null
      endDateMs?: number | null
      tags?: string[]
    } = {
      workspaceId: input.workspaceId,
      legacyId: projectId,
      updatedAtMs: Date.now(),
    }

    const name = asNonEmptyString(input.params.name)
    if (name) updateArgs.name = name

    if ('description' in input.params) {
      updateArgs.description = asString(input.params.description)
    }

    const status = asNonEmptyString(input.params.status)
    if (status) updateArgs.status = status

    if ('clientId' in input.params || 'clientName' in input.params) {
      const shouldClearClient = asNonEmptyString(input.params.clientId) === 'none'
      if (shouldClearClient) {
        updateArgs.clientId = null
        updateArgs.clientName = null
      } else {
        const resolvedClient = await resolveClientIdFromParams(ctx, input.workspaceId, input.params, input.context)
        if ('clientId' in input.params) {
          updateArgs.clientId = resolvedClient.clientId || null
        }
        if ('clientName' in input.params || updateArgs.clientId) {
          updateArgs.clientName = resolvedClient.clientName ?? asString(input.params.clientName)
        }
      }
    }

    const startDateMs = asNumber(input.params.startDateMs) ?? parseDateToMs(input.params.startDate)
    if (startDateMs !== null || 'startDate' in input.params || 'startDateMs' in input.params) {
      updateArgs.startDateMs = startDateMs
    }

    const endDateMs = asNumber(input.params.endDateMs) ?? parseDateToMs(input.params.endDate)
    if (endDateMs !== null || 'endDate' in input.params || 'endDateMs' in input.params) {
      updateArgs.endDateMs = endDateMs
    }

    if (Array.isArray(input.params.tags)) {
      updateArgs.tags = asStringArray(input.params.tags)
    }

    const mutatedFields = Object.keys(updateArgs).filter((field) => !['workspaceId', 'legacyId', 'updatedAtMs'].includes(field))
    if (mutatedFields.length === 0) {
      return {
        success: false,
        data: { error: 'No valid fields provided for update.' },
        userMessage: 'Tell me what to update on the project.',
      }
    }

    await ctx.runMutation(api.projects.update, updateArgs)

    const projectRecord = await ctx.runQuery(api.projects.getByLegacyId, {
      workspaceId: input.workspaceId,
      legacyId: projectId,
    }) as { name?: unknown; clientName?: unknown; status?: unknown; tags?: unknown } | null

    const resolvedName = asNonEmptyString(projectRecord?.name) ?? name ?? projectId

    return {
      success: true,
      route: buildProjectRoute(projectId, resolvedName),
      data: {
        projectId,
        name: resolvedName,
        clientName: asNonEmptyString(projectRecord?.clientName) ?? updateArgs.clientName ?? null,
        status: asNonEmptyString(projectRecord?.status) ?? updateArgs.status ?? null,
        tags: Array.isArray(projectRecord?.tags) ? projectRecord.tags : updateArgs.tags,
        updatedFields: mutatedFields,
      },
      userMessage: 'Project updated successfully.',
    }
  },
}