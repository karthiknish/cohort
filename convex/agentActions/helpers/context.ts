import { api, internal } from '/_generated/api'
import type { ActionCtx } from '../../_generated/server'

import type { AgentRequestContextType } from '../types'

import { asNonEmptyString, asRecord, asStringArray } from './values'

type ResolvedProjectContext = {
  projectId: string | null
  projectName: string | null
  clientId: string | null
  clientName: string | null
}

type ClientResolution =
  | {
      status: 'resolved'
      clientId: string
      clientName: string | null
    }
  | {
      status: 'missing'
      clientId: ''
      clientName: null
      suggestions: []
    }
  | {
      status: 'ambiguous'
      clientId: ''
      clientName: string | null
      suggestions: string[]
    }

type WorkspaceMember = {
  id: string
  name: string
  email?: string
  role?: string
}

type AssignmentResolution =
  | {
      status: 'resolved'
      names: string[]
      ownerId: string | null
      ownerName: string | null
    }
  | {
      status: 'ambiguous'
      names: string[]
      ownerId: null
      ownerName: null
      suggestions: string[]
      query: string
    }

function normalizeLookupValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const trimmed = asNonEmptyString(value)
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }

  return result
}

function extractAssignmentQueries(text: string, labels: string[]): string[] {
  const results: string[] = []

  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*(?::|is|=)?\\s+([^\\n.;]+)`, 'ig')
    for (const match of text.matchAll(pattern)) {
      const captured = asNonEmptyString(match[1])
      if (!captured) continue
      const cleaned = captured
        .replace(/\b(?:and due|due date|priority|status|client|project)\b.*$/i, '')
        .replace(/^@+/, '')
        .trim()
      if (cleaned) results.push(cleaned)
    }
  }

  const mentionMatches = text.match(/@([A-Za-z][A-Za-z0-9._-]*(?:\s+[A-Za-z][A-Za-z0-9._-]*)?)/g) ?? []
  for (const mention of mentionMatches) {
    results.push(mention.replace(/^@+/, '').trim())
  }

  return uniqueStrings(results)
}

async function listWorkspaceMembers(
  ctx: ActionCtx,
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const rawMembers = await ctx.runQuery(api.users.listWorkspaceMembers, {
    workspaceId,
    limit: 300,
  })
  const members = Array.isArray(rawMembers) ? rawMembers : []

  return members
    .map((member) => ({
      id: asNonEmptyString(member?.id) ?? '',
      name: asNonEmptyString(member?.name) ?? '',
      email: asNonEmptyString(member?.email) ?? undefined,
      role: asNonEmptyString(member?.role) ?? undefined,
    }))
    .filter((member) => member.id.length > 0 && member.name.length > 0)
}

function resolveMemberMatches(members: WorkspaceMember[], query: string): WorkspaceMember[] {
  const normalizedQuery = normalizeLookupValue(query)
  if (!normalizedQuery) return []

  const exact = members.filter((member) => normalizeLookupValue(member.name) === normalizedQuery)
  if (exact.length > 0) return exact

  return members.filter((member) => normalizeLookupValue(member.name).includes(normalizedQuery))
}

async function resolveWorkspaceAssignments(
  ctx: ActionCtx,
  workspaceId: string,
  input: {
    rawMessage?: string
    params: Record<string, unknown>
    context?: AgentRequestContextType
    mode: 'task' | 'project'
  },
): Promise<AssignmentResolution> {
  const members = await listWorkspaceMembers(ctx, workspaceId)
  if (members.length === 0) {
    return { status: 'resolved', names: [], ownerId: null, ownerName: null }
  }

  const texts = uniqueStrings([
    asNonEmptyString(input.rawMessage),
    asNonEmptyString(input.params.description),
    ...(input.context?.attachmentContext?.map((attachment) => asNonEmptyString(attachment.extractedText) ?? asNonEmptyString(attachment.excerpt)) ?? []),
  ])

  const taskLabels = ['assign(?:ed)? to', 'assignee', 'owner', 'point person']
  const projectLabels = ['project lead', 'lead', 'owner', 'owned by', 'assign(?:ed)? to']
  const labels = input.mode === 'task' ? taskLabels : projectLabels

  const explicitQueries = uniqueStrings([
    ...asStringArray(input.params.assignedTo),
    asNonEmptyString(input.params.assignee),
    asNonEmptyString(input.params.assigneeName),
    asNonEmptyString(input.params.ownerName),
    asNonEmptyString(input.params.owner),
    ...texts.flatMap((text) => extractAssignmentQueries(text, labels)),
  ])

  if (explicitQueries.length === 0) {
    return { status: 'resolved', names: [], ownerId: null, ownerName: null }
  }

  const matchedMembers: WorkspaceMember[] = []
  for (const query of explicitQueries) {
    const matches = resolveMemberMatches(members, query)
    if (matches.length === 0) continue
    if (matches.length > 1) {
      return {
        status: 'ambiguous',
        names: [],
        ownerId: null,
        ownerName: null,
        suggestions: matches.map((member) => member.name).slice(0, 5),
        query,
      }
    }

    const match = matches[0]
    if (!match) continue
    if (!matchedMembers.some((member) => member.id === match.id)) {
      matchedMembers.push(match)
    }
  }

  if (matchedMembers.length === 0) {
    return { status: 'resolved', names: [], ownerId: null, ownerName: null }
  }

  return {
    status: 'resolved',
    names: matchedMembers.map((member) => member.name),
    ownerId: matchedMembers[0]?.id ?? null,
    ownerName: matchedMembers[0]?.name ?? null,
  }
}

async function resolveClientIdFromParams(
  ctx: ActionCtx,
  workspaceId: string,
  params: Record<string, unknown>,
  context?: AgentRequestContextType,
): Promise<ClientResolution> {
  const directClientId = asNonEmptyString(params.clientId) ?? ''
  const directClientName = asNonEmptyString(params.clientName)

  const resolveClientById = async (legacyId: string): Promise<ClientResolution> => {
    try {
      const client = await ctx.runQuery(internal.clients.getByLegacyIdServer, {
        workspaceId,
        legacyId,
      }) as { legacyId?: unknown; name?: unknown } | null

      return {
        status: 'resolved',
        clientId: asNonEmptyString(client?.legacyId) ?? legacyId,
        clientName: asNonEmptyString(client?.name),
      }
    } catch {
      return { status: 'resolved', clientId: legacyId, clientName: null }
    }
  }

  if (directClientId) {
    if (directClientName) {
      return { status: 'resolved', clientId: directClientId, clientName: directClientName }
    }

    return resolveClientById(directClientId)
  }

  if (!directClientName) {
    const activeClientId = asNonEmptyString(context?.activeClientId ?? null)
    return activeClientId
      ? resolveClientById(activeClientId)
      : { status: 'missing', clientId: '', clientName: null, suggestions: [] }
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
    const matches = items
      .map((item) => asRecord(item))
      .filter((item) => {
        const name = asNonEmptyString(item?.name)
        return name?.trim().toLowerCase().includes(normalizedTarget)
      })

    const exactMatch = matches.find((item) => {
      const name = asNonEmptyString(item?.name)
      return name?.trim().toLowerCase() === normalizedTarget
    })

    if (exactMatch) {
      return {
        status: 'resolved',
        clientId: asNonEmptyString(exactMatch.legacyId) ?? '',
        clientName: asNonEmptyString(exactMatch.name) ?? directClientName,
      }
    }

    if (matches.length > 1) {
      return {
        status: 'ambiguous',
        clientId: '',
        clientName: directClientName,
        suggestions: matches
          .map((item) => asNonEmptyString(item?.name))
          .filter((name): name is string => Boolean(name))
          .slice(0, 5),
      }
    }

    if (matches.length === 1) {
      const match = matches[0]
      return {
        status: 'resolved',
        clientId: asNonEmptyString(match?.legacyId) ?? '',
        clientName: asNonEmptyString(match?.name) ?? directClientName,
      }
    }
  } catch {
    // Fall through to ask for explicit client clarification below.
  }

  return {
    status: 'ambiguous',
    clientId: '',
    clientName: directClientName,
    suggestions: [],
  }
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

  const attachmentBlock = context?.attachmentContext?.length
    ? `\nAttachment context:\n${context.attachmentContext
        .slice(0, 4)
        .map((attachment, index) => {
          const extractedPreview = asNonEmptyString(attachment.extractedText)
          const excerpt = extractedPreview ?? asNonEmptyString(attachment.excerpt) ?? 'No readable text extracted.'
          return [
            `${index + 1}. ${attachment.name} (${attachment.mimeType}, ${attachment.sizeLabel})`,
            `   status: ${attachment.extractionStatus}`,
            `   excerpt: ${excerpt.slice(0, 1200)}`,
          ].join('\n')
        })
        .join('\n')}\n`
    : ''

  return `${historyBlock}${contextBlock}${attachmentBlock}`
}

export {
  formatConversationHistory,
  resolveClientIdFromParams,
  resolveProjectContextFromParams,
  resolveWorkspaceAssignments,
}
