import type { ActionCtx } from '../../_generated/server'
import { api } from '../../_generated/api'

import type { AgentRequestContextType } from '../types'

import { asNonEmptyString, asRecord } from './values'

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
}