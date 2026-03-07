import { api } from '../../_generated/api'
import type { ActionCtx } from '../../_generated/server'

import type { AgentRequestContextType } from '../types'

import { asNonEmptyString, asRecord } from './values'

type ResolvedProjectContext = {
  projectId: string | null
  projectName: string | null
  clientId: string | null
  clientName: string | null
}

async function resolveClientIdFromParams(
  ctx: ActionCtx,
  workspaceId: string,
  params: Record<string, unknown>,
  context?: AgentRequestContextType,
): Promise<{ clientId: string; clientName: string | null }> {
  const directClientId = asNonEmptyString(params.clientId) ?? ''
  const directClientName = asNonEmptyString(params.clientName)

  const resolveClientById = async (legacyId: string): Promise<{ clientId: string; clientName: string | null }> => {
    try {
      const client = await ctx.runQuery(api.clients.getByLegacyIdServer, {
        workspaceId,
        legacyId,
      }) as { legacyId?: unknown; name?: unknown } | null

      return {
        clientId: asNonEmptyString(client?.legacyId) ?? legacyId,
        clientName: asNonEmptyString(client?.name),
      }
    } catch {
      return { clientId: legacyId, clientName: null }
    }
  }

  if (directClientId) {
    if (directClientName) {
      return { clientId: directClientId, clientName: directClientName }
    }

    return resolveClientById(directClientId)
  }

  if (!directClientName) {
    const activeClientId = asNonEmptyString(context?.activeClientId ?? null)
    return activeClientId ? resolveClientById(activeClientId) : { clientId: '', clientName: null }
  }

  try {
    const rawClients = await ctx.runQuery(api.clients.list, {
      workspaceId,
      limit: 200,
    })

    const items = Array.isArray(rawClients)
      ? rawClients
      : Array.isArray((rawClients as { items?: unknown[] } | null)?.items)
        ? (rawClients as { items: unknown[] }).items
        : []

    const normalizedTarget = directClientName.trim().toLowerCase()
    const exactMatch = items
      .map((item) => asRecord(item))
      .find((item) => {
        const name = asNonEmptyString(item?.name)
        return name?.trim().toLowerCase() === normalizedTarget
      })

    if (exactMatch) {
      return {
        clientId: asNonEmptyString(exactMatch.legacyId) ?? '',
        clientName: asNonEmptyString(exactMatch.name) ?? directClientName,
      }
    }
  } catch {
    // Fall back to clientName-only task creation below.
  }

  return { clientId: '', clientName: directClientName }
}

async function resolveProjectContextFromParams(
  ctx: ActionCtx,
  workspaceId: string,
  params: Record<string, unknown>,
  context?: AgentRequestContextType,
): Promise<ResolvedProjectContext> {
  const directProjectId = asNonEmptyString(params.projectId)
  const directProjectName = asNonEmptyString(params.projectName)
  const activeProjectId = asNonEmptyString(context?.activeProjectId ?? null)

  const resolveProjectById = async (legacyId: string, fallbackName?: string | null): Promise<ResolvedProjectContext> => {
    try {
      const project = await ctx.runQuery(api.projects.getByLegacyId, {
        workspaceId,
        legacyId,
      }) as { legacyId?: unknown; name?: unknown; clientId?: unknown; clientName?: unknown } | null

      return {
        projectId: asNonEmptyString(project?.legacyId) ?? legacyId,
        projectName: asNonEmptyString(project?.name) ?? fallbackName ?? null,
        clientId: asNonEmptyString(project?.clientId ?? null),
        clientName: asNonEmptyString(project?.clientName ?? null),
      }
    } catch {
      return {
        projectId: legacyId,
        projectName: fallbackName ?? null,
        clientId: null,
        clientName: null,
      }
    }
  }

  if (directProjectId) {
    return resolveProjectById(directProjectId, directProjectName)
  }

  if (!directProjectName) {
    return activeProjectId
      ? resolveProjectById(activeProjectId)
      : { projectId: null, projectName: null, clientId: null, clientName: null }
  }

  try {
    const rawProjects = await ctx.runQuery(api.projects.list, {
      workspaceId,
      limit: 200,
    })

    const items = Array.isArray(rawProjects)
      ? rawProjects
      : Array.isArray((rawProjects as { items?: unknown[] } | null)?.items)
        ? (rawProjects as { items: unknown[] }).items
        : []

    const normalizedTarget = directProjectName.trim().toLowerCase()
    const exactMatch = items
      .map((item) => asRecord(item))
      .find((item) => {
        const name = asNonEmptyString(item?.name)
        return name?.trim().toLowerCase() === normalizedTarget
      })

    if (exactMatch) {
      return {
        projectId: asNonEmptyString(exactMatch.legacyId),
        projectName: asNonEmptyString(exactMatch.name) ?? directProjectName,
        clientId: asNonEmptyString(exactMatch.clientId ?? null),
        clientName: asNonEmptyString(exactMatch.clientName ?? null),
      }
    }
  } catch {
    // Fall back to projectName-only task creation below.
  }

  return {
    projectId: null,
    projectName: directProjectName,
    clientId: null,
    clientName: null,
  }
}

function formatConversationHistory(context?: AgentRequestContextType): string {
  const historyBlock = context?.previousMessages?.length
    ? `\nRecent conversation:\n${context.previousMessages
        .slice(-4)
        .map((m) => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')}\n`
    : ''

  const contextLines: string[] = []
  const activeProposalId = asNonEmptyString(context?.activeProposalId ?? null)
  const activeProjectId = asNonEmptyString(context?.activeProjectId ?? null)
  const activeClientId = asNonEmptyString(context?.activeClientId ?? null)

  if (activeProposalId) contextLines.push(`- activeProposalId: ${activeProposalId}`)
  if (activeProjectId) contextLines.push(`- activeProjectId: ${activeProjectId}`)
  if (activeClientId) contextLines.push(`- activeClientId: ${activeClientId}`)

  const contextBlock = contextLines.length > 0 ? `\nContext hints:\n${contextLines.join('\n')}\n` : ''

  return `${historyBlock}${contextBlock}`
}

export {
  formatConversationHistory,
  resolveClientIdFromParams,
  resolveProjectContextFromParams,
}