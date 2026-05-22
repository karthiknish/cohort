import type { MutationCtx } from './_generated/server'

export type ClientTeamMemberRow = {
  name: string
  role: string
}

export function mergeTeamMembersWithAdmins(
  teamMembers: ClientTeamMemberRow[],
  adminMembers: ClientTeamMemberRow[],
): ClientTeamMemberRow[] {
  const existingNames = new Set(teamMembers.map((member) => member.name.toLowerCase()))
  const additions = adminMembers.filter((member) => !existingNames.has(member.name.toLowerCase()))

  if (additions.length === 0) {
    return teamMembers
  }

  return [...teamMembers, ...additions]
}

export async function loadWorkspaceAdminMembers(
  ctx: Pick<MutationCtx, 'db'>,
  workspaceId: string,
): Promise<ClientTeamMemberRow[]> {
  const [membersByAgency, agencyAdmin] = await Promise.all([
    ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(500),
    ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
  ])

  const rows = agencyAdmin
    ? [agencyAdmin, ...membersByAgency.filter((row) => row.legacyId !== agencyAdmin.legacyId)]
    : membersByAgency

  const admins: ClientTeamMemberRow[] = []

  for (const row of rows) {
    if (row.status === 'disabled' || row.status === 'suspended') continue
    if (row.role !== 'admin') continue

    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) continue

    admins.push({ name, role: 'Admin' })
  }

  return admins
}

export async function syncWorkspaceClientAdminMembers(
  ctx: Pick<MutationCtx, 'db'>,
  workspaceId: string,
  options?: { legacyId?: string; now?: number },
): Promise<{ updatedCount: number }> {
  const adminMembers = await loadWorkspaceAdminMembers(ctx, workspaceId)
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
    if (merged.length === client.teamMembers.length) {
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
