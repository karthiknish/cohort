import { api } from '/_generated/api'
import {
  asNonEmptyString,
  asRecord,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import { extractClientLookupRecords } from '../shared'

const MAX_CLIENT_PAGES = 5
const CLIENT_PAGE_LIMIT = 200

type ClientsListQueryResult = {
  items?: unknown
  nextCursor?: {
    fieldValue?: unknown
    legacyId?: unknown
  } | null
}

export const clientOperationHandlers: Record<string, OperationHandler> = {
  async listWorkspaceClients(ctx, input) {
    const queryRaw = asNonEmptyString(input.params.query)?.toLowerCase().trim() ?? ''
    const query = queryRaw.length >= 2 ? queryRaw : ''

    const collected: ReturnType<typeof extractClientLookupRecords> = []
    let cursor: { fieldValue: string | number; legacyId: string } | null = null

    for (let page = 0; page < MAX_CLIENT_PAGES; page++) {
      const raw = (await ctx.runQuery(api.clients.list, {
        workspaceId: input.workspaceId,
        limit: CLIENT_PAGE_LIMIT,
        cursor,
        includeAllWorkspaces: true,
      })) as ClientsListQueryResult

      const batch = extractClientLookupRecords(raw).filter((c) => c.workspaceId === input.workspaceId)
      collected.push(...batch)

      const next = raw.nextCursor
      if (!next || typeof next !== 'object') break
      const legacyId = next.legacyId
      const fieldValue = next.fieldValue
      if (typeof legacyId !== 'string' || (typeof fieldValue !== 'string' && typeof fieldValue !== 'number')) {
        break
      }
      cursor = { fieldValue, legacyId }
      if (batch.length < CLIENT_PAGE_LIMIT) break
    }

    const filtered = query
      ? collected.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.legacyId.toLowerCase().includes(query),
        )
      : collected

    const clients = filtered.slice(0, 100).map((c) => ({
      clientId: c.legacyId,
      name: c.name,
    }))

    return {
      success: true,
      data: {
        total: filtered.length,
        clients,
      },
      userMessage:
        filtered.length === 0
          ? query
            ? `No clients match “${queryRaw}”.`
            : 'No clients found in this workspace.'
          : query
            ? `Found ${filtered.length} client${filtered.length === 1 ? '' : 's'} matching “${queryRaw}”.`
            : `Listing ${filtered.length} workspace client${filtered.length === 1 ? '' : 's'}.`,
      route: '/dashboard/clients',
    }
  },

  async createClient(ctx, input) {
    const name = asNonEmptyString(input.params.name)
    if (!name) {
      return { success: false, data: { error: 'Client name is required.' }, userMessage: 'Please provide a client name.' }
    }

    const accountManager = asNonEmptyString(input.params.accountManager) ?? 'Unassigned'
    const rawTeamMembers = Array.isArray(input.params.teamMembers) ? input.params.teamMembers : []
    const teamMembers = rawTeamMembers
      .map((member) => {
        const memberRecord = asRecord(member)
        if (!memberRecord) {
          const nameFromString = asNonEmptyString(member)
          return nameFromString ? { name: nameFromString, role: 'Contributor' } : null
        }

        const memberName = asNonEmptyString(memberRecord.name)
        if (!memberName) return null

        return {
          name: memberName,
          role: asNonEmptyString(memberRecord.role) ?? 'Contributor',
        }
      })
      .filter((member): member is { name: string; role: string } => member !== null)

    const rawResult = await ctx.runMutation(api.clients.create, {
      workspaceId: input.workspaceId,
      name,
      accountManager,
      teamMembers,
      createdBy: input.userId,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const record = asRecord(unwrapped)
    const clientId = asNonEmptyString(record?.legacyId)

    return {
      success: true,
      data: { clientId, name },
      userMessage: `Created client ${name}.`,
    }
  },

  async addClientTeamMember(ctx, input) {
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.params.legacyId)
    const name = asNonEmptyString(input.params.name)

    if (!clientId || !name) {
      return {
        success: false,
        data: { error: 'clientId and name are required.' },
        userMessage: 'Please provide both the client and the team member name.',
      }
    }

    const role = asNonEmptyString(input.params.role) ?? undefined

    await ctx.runMutation(api.clients.addTeamMember, {
      workspaceId: input.workspaceId,
      legacyId: clientId,
      name,
      role,
    })

    return {
      success: true,
      data: { clientId, name, role: role ?? 'Contributor' },
      userMessage: `Added ${name} to the client team.`,
    }
  },
}