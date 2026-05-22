import type { MutationCtx, QueryCtx } from './_generated/server'

import { Errors } from './errors'

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

export async function normalizeTaskAssignees(
  ctx: Pick<MutationCtx, 'db'>,
  workspaceId: string,
  assignees: string[],
): Promise<string[]> {
  const trimmedAssignees = assignees
    .map((assignee) => assignee.trim())
    .filter((assignee) => assignee.length > 0)

  if (trimmedAssignees.length === 0) return []

  const members = await loadWorkspaceMembers(ctx, workspaceId)
  const resolvedIds: string[] = []

  for (const assignee of trimmedAssignees) {
    const directMatch = members.find((member) => member.legacyId === assignee)
    if (directMatch) {
      if (!resolvedIds.includes(directMatch.legacyId)) {
        resolvedIds.push(directMatch.legacyId)
      }
      continue
    }

    const matches = findWorkspaceMemberMatches(assignee, members)
    if (matches.length === 1) {
      const member = matches[0]
      if (member && !resolvedIds.includes(member.legacyId)) {
        resolvedIds.push(member.legacyId)
      }
      continue
    }

    if (matches.length > 1) {
      throw Errors.validation.invalidInput(
        `Assignee "${assignee}" matches multiple workspace members. Pick one from your team list.`,
      )
    }

    throw Errors.validation.invalidInput(
      `Assignee "${assignee}" is not a workspace member. Pick someone from your team list.`,
    )
  }

  return resolvedIds
}

export { findWorkspaceMemberMatches, loadWorkspaceMembers, normalizeAssigneeLookup }
