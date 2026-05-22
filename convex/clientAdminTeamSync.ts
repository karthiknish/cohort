import type { MutationCtx, QueryCtx } from './_generated/server'

export type ClientTeamMemberRow = {
  name: string
  role: string
}

type DbReaderCtx = Pick<QueryCtx, 'db'>

type AdminUserRow = {
  name: string | null | undefined
  clientTeamRole?: string | null | undefined
}

const GENERIC_CLIENT_TEAM_ROLES = new Set([
  'admin',
  'contributor',
  'team',
  'team member',
  'member',
])

export function isGenericClientTeamRole(role: string): boolean {
  const normalized = role.trim().toLowerCase()
  if (!normalized) return true
  return GENERIC_CLIENT_TEAM_ROLES.has(normalized)
}

export function pickPreferredClientTeamRole(currentRole: string, candidateRole: string): string {
  const current = currentRole.trim() || 'Contributor'
  const candidate = candidateRole.trim() || 'Contributor'

  if (current.toLowerCase() === candidate.toLowerCase()) {
    return current
  }

  const currentGeneric = isGenericClientTeamRole(current)
  const candidateGeneric = isGenericClientTeamRole(candidate)

  if (currentGeneric && !candidateGeneric) return candidate
  if (!currentGeneric && candidateGeneric) return current
  return current
}

export function resolveClientTeamRoleForAdmin(
  user: AdminUserRow,
  inferredRole?: string | null,
): string {
  const explicit = typeof user.clientTeamRole === 'string' ? user.clientTeamRole.trim() : ''
  if (explicit) return explicit

  const inferred = typeof inferredRole === 'string' ? inferredRole.trim() : ''
  if (inferred) return inferred

  return 'Contributor'
}

export function pickMostCommonClientTeamRole(roleCounts: Array<[string, number]>): string | null {
  if (roleCounts.length === 0) return null

  const sorted = [...roleCounts].sort((left, right) => {
    const leftGeneric = isGenericClientTeamRole(left[0]) ? 1 : 0
    const rightGeneric = isGenericClientTeamRole(right[0]) ? 1 : 0
    if (leftGeneric !== rightGeneric) return leftGeneric - rightGeneric
    return right[1] - left[1]
  })

  return sorted[0]?.[0]?.trim() || null
}

export async function inferAdminClientTeamRolesFromClients(
  ctx: DbReaderCtx,
  adminNames: string[],
): Promise<Map<string, string>> {
  const adminNameSet = new Set(adminNames.map((name) => name.trim().toLowerCase()).filter(Boolean))
  const roleCounts = new Map<string, Map<string, number>>()

  const clients = await ctx.db.query('clients').collect()
  for (const client of clients) {
    if (client.deletedAtMs !== null) continue

    for (const member of client.teamMembers) {
      const normalizedName = member.name.trim().toLowerCase()
      if (!normalizedName || !adminNameSet.has(normalizedName)) continue

      const role = member.role.trim()
      if (!role) continue

      const counts = roleCounts.get(normalizedName) ?? new Map<string, number>()
      counts.set(role, (counts.get(role) ?? 0) + 1)
      roleCounts.set(normalizedName, counts)
    }
  }

  const inferred = new Map<string, string>()
  for (const adminName of adminNames) {
    const normalizedName = adminName.trim().toLowerCase()
    if (!normalizedName) continue

    const counts = roleCounts.get(normalizedName)
    if (!counts) continue

    const bestRole = pickMostCommonClientTeamRole([...counts.entries()])
    if (bestRole) {
      inferred.set(normalizedName, bestRole)
    }
  }

  return inferred
}

export function clientTeamMembersChanged(
  before: ClientTeamMemberRow[],
  after: ClientTeamMemberRow[],
): boolean {
  if (before.length !== after.length) return true

  for (let index = 0; index < before.length; index += 1) {
    const left = before[index]
    const right = after[index]
    if (!left || !right) return true
    if (left.name !== right.name || left.role !== right.role) return true
  }

  return false
}

export function mergeTeamMembersWithAdmins(
  teamMembers: ClientTeamMemberRow[],
  adminMembers: ClientTeamMemberRow[],
): ClientTeamMemberRow[] {
  const adminByName = new Map(
    adminMembers.map((member) => [member.name.trim().toLowerCase(), member]),
  )

  const mergedExisting = teamMembers.map((member) => {
    const adminDefault = adminByName.get(member.name.trim().toLowerCase())
    if (!adminDefault) return member

    const canonicalRole = adminDefault.role.trim() || 'Contributor'
    const currentRole = member.role.trim() || 'Contributor'

    if (
      isGenericClientTeamRole(currentRole) &&
      !isGenericClientTeamRole(canonicalRole) &&
      currentRole.toLowerCase() !== canonicalRole.toLowerCase()
    ) {
      return { name: member.name, role: canonicalRole }
    }

    return member
  })

  const existingNames = new Set(mergedExisting.map((member) => member.name.trim().toLowerCase()))
  const additions = adminMembers.filter((member) => !existingNames.has(member.name.trim().toLowerCase()))

  if (additions.length === 0 && !clientTeamMembersChanged(teamMembers, mergedExisting)) {
    return teamMembers
  }

  return [...mergedExisting, ...additions]
}

function mergeAdminMemberLists(...lists: ClientTeamMemberRow[][]): ClientTeamMemberRow[] {
  const merged = new Map<string, ClientTeamMemberRow>()

  for (const list of lists) {
    for (const admin of list) {
      const name = admin.name.trim()
      if (!name) continue

      const key = name.toLowerCase()
      const role = admin.role.trim() || 'Contributor'
      const existing = merged.get(key)

      if (!existing) {
        merged.set(key, { name, role })
        continue
      }

      merged.set(key, {
        name: existing.name,
        role: pickPreferredClientTeamRole(existing.role, role),
      })
    }
  }

  return [...merged.values()]
}

async function loadAllPlatformAdminMembers(ctx: DbReaderCtx): Promise<ClientTeamMemberRow[]> {
  const rows = await ctx.db.query('users').take(1000)
  const adminUsers = rows.filter((row) => {
    if (row.status === 'disabled' || row.status === 'suspended') return false
    if (row.role !== 'admin') return false
    const name = typeof row.name === 'string' ? row.name.trim() : ''
    return name.length > 0
  })

  const inferredRoles = await inferAdminClientTeamRolesFromClients(
    ctx,
    adminUsers.map((row) => row.name?.trim() ?? ''),
  )

  const admins: ClientTeamMemberRow[] = []
  const seen = new Set<string>()

  for (const row of adminUsers) {
    const name = row.name?.trim() ?? ''
    if (!name) continue

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    admins.push({
      name,
      role: resolveClientTeamRoleForAdmin(row, inferredRoles.get(key)),
    })
  }

  return admins
}

export async function loadWorkspaceAdminMembers(
  ctx: DbReaderCtx,
  workspaceId: string,
): Promise<ClientTeamMemberRow[]> {
  const [membersByAgency, agencyAdmin] = await Promise.all([
    ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(500),
    ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
  ])

  const rows = agencyAdmin
    ? [agencyAdmin, ...membersByAgency.filter((row) => row.legacyId !== agencyAdmin.legacyId)]
    : membersByAgency

  const workspaceAdmins: ClientTeamMemberRow[] = []
  const inferredRoles = await inferAdminClientTeamRolesFromClients(
    ctx,
    rows
      .filter((row) => row.role === 'admin' && row.status !== 'disabled' && row.status !== 'suspended')
      .map((row) => row.name?.trim() ?? ''),
  )

  for (const row of rows) {
    if (row.status === 'disabled' || row.status === 'suspended') continue
    if (row.role !== 'admin') continue

    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) continue

    workspaceAdmins.push({
      name,
      role: resolveClientTeamRoleForAdmin(row, inferredRoles.get(name.toLowerCase())),
    })
  }

  if (workspaceAdmins.length > 0) {
    return mergeAdminMemberLists(workspaceAdmins)
  }

  return loadAllPlatformAdminMembers(ctx)
}

export async function loadEffectiveClientAdminMembers(
  ctx: DbReaderCtx,
  workspaceId: string,
): Promise<ClientTeamMemberRow[]> {
  const [membersByAgency, agencyAdmin, platformAdmins] = await Promise.all([
    ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(500),
    ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
    loadAllPlatformAdminMembers(ctx),
  ])

  const rows = agencyAdmin
    ? [agencyAdmin, ...membersByAgency.filter((row) => row.legacyId !== agencyAdmin.legacyId)]
    : membersByAgency

  const workspaceAdmins: ClientTeamMemberRow[] = []
  const inferredRoles = await inferAdminClientTeamRolesFromClients(
    ctx,
    rows
      .filter((row) => row.role === 'admin' && row.status !== 'disabled' && row.status !== 'suspended')
      .map((row) => row.name?.trim() ?? ''),
  )

  for (const row of rows) {
    if (row.status === 'disabled' || row.status === 'suspended') continue
    if (row.role !== 'admin') continue

    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) continue

    workspaceAdmins.push({
      name,
      role: resolveClientTeamRoleForAdmin(row, inferredRoles.get(name.toLowerCase())),
    })
  }

  return mergeAdminMemberLists(workspaceAdmins, platformAdmins)
}

export async function syncWorkspaceClientAdminMembers(
  ctx: Pick<MutationCtx, 'db'>,
  workspaceId: string,
  options?: { legacyId?: string; now?: number },
): Promise<{ updatedCount: number }> {
  const adminMembers = await loadEffectiveClientAdminMembers(ctx, workspaceId)
  if (adminMembers.length === 0) {
    return { updatedCount: 0 }
  }

  const now = options?.now ?? Date.now()
  const legacyId = options?.legacyId

  const clients = legacyId
    ? await ctx.db
        .query('clients')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', workspaceId).eq('legacyId', legacyId))
        .unique()
        .then((row) => (row && row.deletedAtMs === null ? [row] : []))
    : await ctx.db
        .query('clients')
        .withIndex('by_workspace_nameLower_legacyId', (q) => q.eq('workspaceId', workspaceId))
        .collect()
        .then((rows) => rows.filter((row) => row.deletedAtMs === null))

  let updatedCount = 0

  for (const client of clients) {
    const merged = mergeTeamMembersWithAdmins(client.teamMembers, adminMembers)
    if (!clientTeamMembersChanged(client.teamMembers, merged)) {
      continue
    }

    await ctx.db.patch(client._id, {
      teamMembers: merged,
      updatedAtMs: now,
    })
    updatedCount += 1
  }

  return { updatedCount }
}
