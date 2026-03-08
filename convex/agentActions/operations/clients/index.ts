import { api } from '../../../_generated/api'
import {
  asNonEmptyString,
  asRecord,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'

export const clientOperationHandlers: Record<string, OperationHandler> = {
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