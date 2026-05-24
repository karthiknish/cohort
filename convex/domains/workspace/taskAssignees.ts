import type { MutationCtx, QueryCtx } from '../../_generated/server'

import { Errors } from '../../errors'
import {
  buildAssigneeMemberPool,
  dedupeClientRosterNames,
  resolveProfilesForRosterNames,
} from '../../taskDocumentImportParsing'

type WorkspaceMember = {
  legacyId: string
  name: string
  email: string | null
}

function normalizeAssigneeLookup(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function nameTokens(value: string): string[] {
  return normalizeAssigneeLookup(value).split(' ').filter(Boolean)
}

async function loadWorkspaceMembers(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const [membersByAgency, agencyAdmin] = await Promise.all([
    ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(500),
    ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
  ])

  const rows = agencyAdmin
    ? [agencyAdmin, ...membersByAgency.filter((row) => row.legacyId !== agencyAdmin.legacyId)]
    : membersByAgency

  const unique = new Map<string, WorkspaceMember>()

  for (const row of rows) {
    if (row.status === 'disabled' || row.status === 'suspended') continue
    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) continue
    unique.set(row.legacyId, {
      legacyId: row.legacyId,
      name,
      email: typeof row.email === 'string' ? row.email : null,
    })
  }

  return [...unique.values()]
}

async function loadClientRosterNamesFromDb(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
  clientId: string | null | undefined,
): Promise<string[]> {
  const normalizedClientId = clientId?.trim()
  if (!normalizedClientId) return []

  const client = await ctx.db
    .query('clients')
    .withIndex('by_workspace_legacyId', (q) =>
      q.eq('workspaceId', workspaceId).eq('legacyId', normalizedClientId),
    )
    .unique()

  if (!client || client.deletedAtMs !== null) return []

  const names: string[] = []
  const accountManager = client.accountManager?.trim()
  if (accountManager) names.push(accountManager)

  for (const member of client.teamMembers ?? []) {
    const name = member.name?.trim()
    if (name) names.push(name)
  }

  return dedupeClientRosterNames(names)
}

async function loadDirectoryMembersForRosterLinking(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
): Promise<Array<{ id: string; name: string; email?: string }>> {
  const rows = await ctx.db.query('users').take(1000)

  return rows.flatMap((row) => {
    if (row.status === 'disabled' || row.status === 'suspended') return []

    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) return []

    return [
      {
        id: row.legacyId,
        name,
        email: typeof row.email === 'string' ? row.email.trim() || undefined : undefined,
      },
    ]
  })
}

function mergeAssigneeProfileLists(
  ...memberLists: Array<Array<{ id: string; name: string; email?: string | null }>>
): Array<{ id: string; name: string; email?: string }> {
  const byId = new Map<string, { id: string; name: string; email?: string }>()

  for (const members of memberLists) {
    for (const member of members) {
      const id = member.id.trim()
      const name = member.name.trim()
      if (!id || !name) continue

      const existing = byId.get(id)
      if (!existing || name.length > existing.name.length) {
        byId.set(id, {
          id,
          name,
          email: typeof member.email === 'string' ? member.email : undefined,
        })
      }
    }
  }

  return [...byId.values()]
}

export async function buildTaskAssigneeMemberPool(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
  clientId?: string | null,
): Promise<WorkspaceMember[]> {
  const [workspaceMembers, rosterNames] = await Promise.all([
    loadWorkspaceMembers(ctx, workspaceId),
    loadClientRosterNamesFromDb(ctx, workspaceId, clientId),
  ])

  if (rosterNames.length === 0) {
    return workspaceMembers
  }

  const rosterProfiles = resolveProfilesForRosterNames(
    rosterNames,
    await loadDirectoryMembersForRosterLinking(ctx),
  )

  const linkedProfiles = mergeAssigneeProfileLists(
    workspaceMembers.map((member) => ({
      id: member.legacyId,
      name: member.name,
      email: member.email,
    })),
    rosterProfiles,
  )

  const pool = buildAssigneeMemberPool(linkedProfiles, rosterNames)
  const validMembers: WorkspaceMember[] = []
  const seen = new Set<string>()

  for (const member of pool) {
    const legacyId = member.id.trim()
    const name = member.name.trim()
    if (!legacyId || seen.has(legacyId)) continue
    seen.add(legacyId)
    validMembers.push({
      legacyId,
      name,
      email: member.email ?? null,
    })
  }

  return validMembers
}

function findWorkspaceMemberMatches(
  query: string,
  members: WorkspaceMember[],
): WorkspaceMember[] {
  const normalizedQuery = normalizeAssigneeLookup(query)
  if (!normalizedQuery) return []

  const exactMatches = members.filter(
    (member) => normalizeAssigneeLookup(member.name) === normalizedQuery,
  )
  if (exactMatches.length > 0) return exactMatches

  const emailMatches = members.filter((member) => {
    const localPart = member.email?.split('@')[0]
    return localPart ? normalizeAssigneeLookup(localPart) === normalizedQuery : false
  })
  if (emailMatches.length > 0) return emailMatches

  const firstNameMatches = members.filter((member) => nameTokens(member.name)[0] === normalizedQuery)
  if (firstNameMatches.length > 0) return firstNameMatches

  const lastNameMatches = members.filter((member) => {
    const tokens = nameTokens(member.name)
    return tokens[tokens.length - 1] === normalizedQuery
  })
  if (lastNameMatches.length > 0) return lastNameMatches

  return []
}

async function formatAssigneeLabel(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  assignee: string,
  membersById: Map<string, WorkspaceMember>,
): Promise<string> {
  const fromPool = membersById.get(assignee)
  if (fromPool?.name) return fromPool.name

  const row = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', assignee))
    .unique()

  const name = typeof row?.name === 'string' ? row.name.trim() : ''
  if (name) return name

  return assignee
}

export async function normalizeTaskAssignees(
  ctx: Pick<MutationCtx, 'db'>,
  workspaceId: string,
  assignees: string[],
  clientId?: string | null,
): Promise<string[]> {
  const trimmedAssignees: string[] = []
  for (const assignee of assignees) {
    const trimmed = assignee.trim()
    if (trimmed.length > 0) trimmedAssignees.push(trimmed)
  }

  if (trimmedAssignees.length === 0) return []

  const members = await buildTaskAssigneeMemberPool(ctx, workspaceId, clientId)
  const membersById = new Map(members.map((member) => [member.legacyId, member]))
  const hasClientScope = Boolean(clientId?.trim())
  const teamScopeLabel = hasClientScope ? "this client's team" : 'your workspace team'
  const resolvedIds = new Set<string>()
  const pendingLabels: Array<{ assignee: string; matches: typeof members }> = []

  for (const assignee of trimmedAssignees) {
    const directMatch = membersById.get(assignee)
    if (directMatch) {
      resolvedIds.add(directMatch.legacyId)
      continue
    }

    const matches = findWorkspaceMemberMatches(assignee, members)
    if (matches.length === 1) {
      const member = matches[0]
      if (member) resolvedIds.add(member.legacyId)
      continue
    }

    pendingLabels.push({ assignee, matches })
  }

  if (pendingLabels.length > 0) {
    const labels = await Promise.all(
      pendingLabels.map(async ({ assignee }) => formatAssigneeLabel(ctx, assignee, membersById)),
    )

    pendingLabels.forEach(({ assignee, matches }, index) => {
      const label = labels[index] ?? assignee

      if (matches.length > 1) {
        throw Errors.validation.invalidInput(
          `Assignee "${label}" matches multiple teammates. Pick one from ${teamScopeLabel}.`,
        )
      }

      throw Errors.validation.invalidInput(
        `Assignee "${label}" is not on ${teamScopeLabel}. Pick someone from your team list.`,
      )
    })
  }

  return [...resolvedIds]
}

export { findWorkspaceMemberMatches, loadWorkspaceMembers, normalizeAssigneeLookup }
