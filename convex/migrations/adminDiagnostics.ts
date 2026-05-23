import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { internalAction } from '../_generated/server'

/** Convex dashboard entry point for admin audits and optional role seeding. */
type AdminDiagnosticsResult = {
  teamAudit: unknown
  taskPoolAudit: unknown
  seedRoles: unknown | null
}

export const runAdminDiagnosticsInternal = internalAction({
  args: {
    seedRoles: v.optional(v.boolean()),
  },
  returns: v.object({
    teamAudit: v.any(),
    taskPoolAudit: v.any(),
    seedRoles: v.union(v.null(), v.any()),
  }),
  handler: async (ctx, args): Promise<AdminDiagnosticsResult> => {
    const [teamAudit, taskPoolAudit]: [unknown, unknown] = await Promise.all([
      ctx.runQuery(internal.adminMigrations.auditClientAdminTeamMembersInternal, {}),
      ctx.runQuery(internal.adminMigrations.auditTaskAssigneePoolsInternal, {}),
    ])

    const seedRoles: unknown | null = args.seedRoles
      ? await ctx.runMutation(internal.adminMigrations.seedAdminClientTeamRolesInternal, {})
      : null

    return { teamAudit, taskPoolAudit, seedRoles }
  },
})
