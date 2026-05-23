import { v } from 'convex/values'
import { internal } from "../_generated/api"
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from '../_generated/server'
import { adminMutation } from "../functions"
import {
  clientTeamMembersChanged,
  inferAdminClientTeamRolesFromClients,
  isGenericClientTeamRole,
  loadEffectiveClientAdminMembers,
  mergeTeamMembersWithAdmins,
  resolveClientTeamRoleForAdmin,
} from "../clientAdminTeamSync"
import { buildTaskAssigneeMemberPool } from "../taskAssignees"

// =============================================================================
// backfillClientAdminTeamMembers
//
// Adds every active workspace admin to each active client roster. Idempotent:
// skips clients that already include an admin by name (case-insensitive).
//
// Loop until `done: true` (admin session or CLI internal mutation):
//
//   let cursor = null
//   do {
//     const res = await convex.mutation(api.adminMigrations.backfillClientAdminTeamMembers, { cursor })
//     cursor = res.data.nextCursor
//   } while (!res.data.done)
//
// CLI (production deploy key):
//
//   npx convex run adminMigrations:backfillClientAdminTeamMembersInternal --prod --env-file .env.prod
//
// =============================================================================

type BackfillClientAdminTeamMembersArgs = {
  batchSize?: number
  cursor?: string | null
}

type BackfillClientAdminTeamMembersResult = {
  processed: number
  patched: number
  done: boolean
  nextCursor: string | null
}

async function backfillClientAdminTeamMembersBatch(
  ctx: Pick<MutationCtx, 'db'>,
  args: BackfillClientAdminTeamMembersArgs,
  now: number,
): Promise<BackfillClientAdminTeamMembersResult> {
  const batchSize = Math.min(Math.max(args.batchSize ?? 50, 1), 200)

  const result = await ctx.db
    .query('clients')
    .withIndex('by_createdAtMs')
    .order('asc')
    .paginate({ numItems: batchSize, cursor: args.cursor ?? null })

  const activeClients = result.page.filter((client) => client.deletedAtMs === null)
  const adminMembersByWorkspace = await preloadAdminMembersByWorkspace(
    ctx,
    activeClients.map((client) => client.workspaceId),
  )

  const patchResults = await Promise.all(
    activeClients.map(async (client) => {
      const adminMembers = adminMembersByWorkspace.get(client.workspaceId) ?? []
      if (adminMembers.length === 0) {
        return false
      }

      const merged = mergeTeamMembersWithAdmins(client.teamMembers, adminMembers)
      if (!clientTeamMembersChanged(client.teamMembers, merged)) {
        return false
      }

      await ctx.db.patch(client._id, {
        teamMembers: merged,
        updatedAtMs: now,
      })
      return true
    }),
  )
  const patched = patchResults.filter(Boolean).length

  return {
    processed: result.page.length,
    patched,
    done: result.isDone,
    nextCursor: result.continueCursor,
  }
}

export const backfillClientAdminTeamMembers = adminMutation({
  args: {
    batchSize: v.optional(v.number()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    processed: v.number(),
    patched: v.number(),
    done: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => backfillClientAdminTeamMembersBatch(ctx, args, ctx.now),
})

export const backfillClientAdminTeamMembersInternal = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    processed: v.number(),
    patched: v.number(),
    done: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => backfillClientAdminTeamMembersBatch(ctx, args, Date.now()),
})

function rosterHasAdminName(
  teamMembers: Array<{ name: string; role: string }>,
  adminName: string,
): boolean {
  const normalized = adminName.trim().toLowerCase()
  return teamMembers.some((member) => member.name.trim().toLowerCase() === normalized)
}

type DbCtx = Pick<MutationCtx, 'db'> | Pick<QueryCtx, 'db'>

async function preloadAdminMembersByWorkspace(
  ctx: DbCtx,
  workspaceIds: Iterable<string>,
): Promise<Map<string, Awaited<ReturnType<typeof loadEffectiveClientAdminMembers>>>> {
  const uniqueWorkspaceIds = [...new Set(workspaceIds)]
  const entries = await Promise.all(
    uniqueWorkspaceIds.map(async (workspaceId) => {
      const adminMembers = await loadEffectiveClientAdminMembers(ctx, workspaceId)
      return [workspaceId, adminMembers] as const
    }),
  )

  return new Map(entries)
}

export const auditClientAdminTeamMembersInternal = internalQuery({
  args: {},
  returns: v.object({
    workspaceCount: v.number(),
    clientCount: v.number(),
    clientsMissingAdmins: v.number(),
    workspacesWithoutNamedAdmins: v.number(),
    issues: v.array(
      v.object({
        workspaceId: v.string(),
        clientLegacyId: v.string(),
        clientName: v.string(),
        missingAdminNames: v.array(v.string()),
        expectedAdminNames: v.array(v.string()),
      }),
    ),
    workspacesMissingAdminNames: v.array(
      v.object({
        workspaceId: v.string(),
        adminCount: v.number(),
        unnamedAdminCount: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const clients = await ctx.db.query('clients').collect()
    const activeClients = clients.filter((client) => client.deletedAtMs === null)

    const workspaceIds = new Set(activeClients.map((client) => client.workspaceId))
    const adminMembersByWorkspace = await preloadAdminMembersByWorkspace(ctx, workspaceIds)
    const issues: Array<{
      workspaceId: string
      clientLegacyId: string
      clientName: string
      missingAdminNames: string[]
      expectedAdminNames: string[]
    }> = []

    for (const client of activeClients) {
      const adminMembers = adminMembersByWorkspace.get(client.workspaceId) ?? []
      const expectedAdminNames = adminMembers.map((member) => member.name)
      const missingAdminNames = expectedAdminNames.filter(
        (adminName) => !rosterHasAdminName(client.teamMembers, adminName),
      )

      if (missingAdminNames.length > 0) {
        issues.push({
          workspaceId: client.workspaceId,
          clientLegacyId: client.legacyId,
          clientName: client.name,
          missingAdminNames,
          expectedAdminNames,
        })
      }
    }

    const workspacesMissingAdminNames: Array<{
      workspaceId: string
      adminCount: number
      unnamedAdminCount: number
    }> = []

    for (const workspaceId of workspaceIds) {
      const [membersByAgency, agencyAdmin] = await Promise.all([
        ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(500),
        ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
      ])

      const rows = agencyAdmin
        ? [agencyAdmin, ...membersByAgency.filter((row) => row.legacyId !== agencyAdmin.legacyId)]
        : membersByAgency

      const adminRows = rows.filter(
        (row) =>
          row.role === 'admin' &&
          row.status !== 'disabled' &&
          row.status !== 'suspended',
      )

      const unnamedAdminCount = adminRows.filter((row) => !(typeof row.name === 'string' && row.name.trim())).length
      if (unnamedAdminCount > 0) {
        workspacesMissingAdminNames.push({
          workspaceId,
          adminCount: adminRows.length,
          unnamedAdminCount,
        })
      }
    }

    return {
      workspaceCount: workspaceIds.size,
      clientCount: activeClients.length,
      clientsMissingAdmins: issues.length,
      workspacesWithoutNamedAdmins: workspacesMissingAdminNames.length,
      issues: issues.slice(0, 50),
      workspacesMissingAdminNames,
    }
  },
})

export const seedAdminClientTeamRolesInternal = internalMutation({
  args: {},
  returns: v.object({
    adminCount: v.number(),
    patched: v.number(),
    roles: v.array(
      v.object({
        legacyId: v.string(),
        name: v.string(),
        clientTeamRole: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const now = Date.now()
    const adminUsers = (await ctx.db.query('users').take(1000)).filter((row) => {
      if (row.role !== 'admin') return false
      if (row.status === 'disabled' || row.status === 'suspended') return false
      const name = typeof row.name === 'string' ? row.name.trim() : ''
      return name.length > 0
    })

    const inferredRoles = await inferAdminClientTeamRolesFromClients(
      ctx,
      adminUsers.map((row) => row.name?.trim() ?? ''),
    )

    let patched = 0
    const roles: Array<{ legacyId: string; name: string; clientTeamRole: string }> = []

    for (const admin of adminUsers) {
      const name = admin.name?.trim() ?? ''
      const resolvedRole = resolveClientTeamRoleForAdmin(admin, inferredRoles.get(name.toLowerCase()))
      const existingRole = typeof admin.clientTeamRole === 'string' ? admin.clientTeamRole.trim() : ''

      roles.push({
        legacyId: admin.legacyId,
        name,
        clientTeamRole: existingRole || resolvedRole,
      })
    }

    const patchResults = await Promise.all(
      adminUsers.map(async (admin) => {
        const name = admin.name?.trim() ?? ''
        const resolvedRole = resolveClientTeamRoleForAdmin(admin, inferredRoles.get(name.toLowerCase()))
        const existingRole = typeof admin.clientTeamRole === 'string' ? admin.clientTeamRole.trim() : ''

        if (existingRole) return false
        if (isGenericClientTeamRole(resolvedRole)) return false

        await ctx.db.patch(admin._id, {
          clientTeamRole: resolvedRole,
          updatedAtMs: now,
        })
        return true
      }),
    )
    patched = patchResults.filter(Boolean).length

    return {
      adminCount: adminUsers.length,
      patched,
      roles,
    }
  },
})

