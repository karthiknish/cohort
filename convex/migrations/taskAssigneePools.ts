import { v } from "convex/values"
import { internal } from "../_generated/api"
import { internalQuery } from "../_generated/server"
import { buildTaskAssigneeMemberPool } from "../taskAssignees"

export const auditTaskAssigneePoolsInternal = internalQuery({
  args: {
    userLegacyId: v.optional(v.string()),
  },
  returns: v.object({
    clients: v.array(
      v.object({
        workspaceId: v.string(),
        clientLegacyId: v.string(),
        clientName: v.string(),
        rosterNames: v.array(v.string()),
        eligibleAssigneeIds: v.array(v.string()),
        eligibleAssigneeNames: v.array(v.string()),
      }),
    ),
    userLookup: v.union(
      v.null(),
      v.object({
        legacyId: v.string(),
        name: v.string(),
        role: v.union(v.string(), v.null()),
        agencyId: v.union(v.string(), v.null()),
        status: v.union(v.string(), v.null()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const clients = (await ctx.db.query('clients').collect()).filter((client) => client.deletedAtMs === null)
    const clientAudits = await Promise.all(
      clients.map(async (client) => {
        const rosterNames = [
          client.accountManager?.trim(),
          ...(client.teamMembers ?? []).flatMap((member) => {
            const name = member.name?.trim()
            return name ? [name] : []
          }),
        ].filter((name): name is string => Boolean(name))

        const members = await buildTaskAssigneeMemberPool(ctx, client.workspaceId, client.legacyId)

        return {
          workspaceId: client.workspaceId,
          clientLegacyId: client.legacyId,
          clientName: client.name,
          rosterNames,
          eligibleAssigneeIds: members.map((member) => member.legacyId),
          eligibleAssigneeNames: members.map((member) => member.name),
        }
      }),
    )

    let userLookup = null
    const userLegacyId = args.userLegacyId?.trim()
    if (userLegacyId) {
      const row = await ctx.db
        .query('users')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', userLegacyId))
        .unique()

      if (row) {
        userLookup = {
          legacyId: row.legacyId,
          name: typeof row.name === 'string' ? row.name : '',
          role: row.role ?? null,
          agencyId: row.agencyId ?? null,
          status: row.status ?? null,
        }
      }
    }

    return {
      clients: clientAudits,
      userLookup,
    }
  },
})

/** Convex dashboard entry point for admin audits and optional role seeding. */
type AdminDiagnosticsResult = {
  teamAudit: unknown
  taskPoolAudit: unknown
  seedRoles: unknown | null
}

