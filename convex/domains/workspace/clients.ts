import { internalQuery, query } from '../../_generated/server'
import { v } from 'convex/values'
import {
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from '../../functions'
import { z } from 'zod/v4'
import { Errors } from '../../errors'
import {
  loadEffectiveClientAdminMembers,
  clientTeamMembersChanged,
  mergeTeamMembersWithAdmins,
  syncWorkspaceClientAdminMembers,
} from '../../clientAdminTeamSync'
import { slugifyClientName } from '@/lib/slugify'

const clientZ = z.object({
  legacyId: z.string(),
  name: z.string(),
  accountManager: z.string(),
  teamMembers: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
    })
  ),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  deletedAtMs: z.number().nullable(),
})

/**
 * Get client by legacyId — **internal only** (agent/actions). Not callable from public clients.
 */
export const getByLegacyIdServer = internalQuery({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Client', args.legacyId)

    return {
      legacyId: row.legacyId,
      name: row.name,
      accountManager: row.accountManager,
      teamMembers: row.teamMembers,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      deletedAtMs: row.deletedAtMs ?? null,
    }
  },
})

export const list = zWorkspacePaginatedQueryActive({
  args: {
    includeAllWorkspaces: z.boolean().optional(),
  },
  returns: z.object({
    items: z.array(clientZ.extend({ workspaceId: z.string() })),
    nextCursor: z.object({
      fieldValue: z.string(),
      legacyId: z.string(),
    }).nullable(),
  }),
  handler: async (ctx, args) => {
    const isAdmin = ctx.user?.role === 'admin'
    const fetchAll = isAdmin && args.includeAllWorkspaces === true

    const baseQuery = fetchAll
      ? ctx.db.query('clients').order('asc')
      : ctx.db
          .query('clients')
          .withIndex('by_workspace_nameLower_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
          .order('asc')

    const q = applyManualPagination(baseQuery, args.cursor, 'nameLower', 'asc')

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'nameLower')

    return {
      items: result.items.map((row) => ({
        legacyId: row.legacyId,
        name: row.name,
        accountManager: row.accountManager,
        teamMembers: row.teamMembers,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs ?? null,
        workspaceId: row.workspaceId,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const countActive = zWorkspaceQueryActive({
  args: { workspaceId: z.string() },
  returns: z.number(),
  handler: async (ctx, args) => {
    let count = 0
    let cursor: string | null = null

    while (true) {
      const page = await ctx.db
        .query('clients')
        .withIndex('by_workspace_deletedAtMs', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('deletedAtMs', null),
        )
        .paginate({ numItems: 500, cursor })

      count += page.page.length
      if (page.isDone) {
        break
      }
      cursor = page.continueCursor
    }

    return count
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: clientZ,
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Client', args.legacyId)

    return {
      legacyId: row.legacyId,
      name: row.name,
      accountManager: row.accountManager,
      teamMembers: row.teamMembers,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      deletedAtMs: row.deletedAtMs ?? null,
    }
  },
})

export const create = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    name: z.string(),
    accountManager: z.string(),
    teamMembers: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
      })
    ),
    createdBy: z.string().nullable(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const normalizedName = args.name.trim()
    const normalizedAccountManager = args.accountManager.trim()

    if (!normalizedName) {
      throw Errors.validation.invalidInput('Client name is required')
    }

    if (!normalizedAccountManager) {
      throw Errors.validation.invalidInput('Account manager is required')
    }

    const normalizedTeamMembers = args.teamMembers.flatMap((member) => {
      const normalized = {
        name: member.name.trim(),
        role: member.role.trim() || 'Contributor',
      }
      return normalized.name.length > 0 ? [normalized] : []
    })

    if (!normalizedTeamMembers.some((member) => member.name.toLowerCase() === normalizedAccountManager.toLowerCase())) {
      normalizedTeamMembers.unshift({ name: normalizedAccountManager, role: 'Account Manager' })
    }

    const adminMembers = await loadEffectiveClientAdminMembers(ctx, args.workspaceId)
    const teamMembersWithAdmins = mergeTeamMembersWithAdmins(normalizedTeamMembers, adminMembers)

    const baseId = slugifyClientName(normalizedName)
    let candidateId = baseId
    let attempt = 1
    let finalId: string | null = null

    while (attempt <= 20) {
      const existing = await ctx.db
        .query('clients')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', candidateId))
        .unique()

      if (!existing) {
        finalId = candidateId
        break
      }

      candidateId = `${baseId}-${attempt}`
      attempt += 1
    }

    if (!finalId) {
      finalId = `${baseId}-${ctx.now}`
    }

    const payload = {
      workspaceId: args.workspaceId,
      legacyId: finalId,
      name: normalizedName,
      nameLower: normalizedName.toLowerCase(),
      accountManager: normalizedAccountManager,
      teamMembers: teamMembersWithAdmins,
      createdBy: args.createdBy,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
      deletedAtMs: null,
    }

    await ctx.db.insert('clients', payload)
    return { legacyId: finalId }
  },
})

export const addTeamMember = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string(),
    role: z.string().optional(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client || client.deletedAtMs !== null) {
      throw Errors.resource.notFound('Client')
    }

    const adminMembers = await loadEffectiveClientAdminMembers(ctx, args.workspaceId)
    const teamMembersWithAdmins = mergeTeamMembersWithAdmins(client.teamMembers, adminMembers)
    let currentTeamMembers = client.teamMembers

    if (clientTeamMembersChanged(client.teamMembers, teamMembersWithAdmins)) {
      await ctx.db.patch(client._id, {
        teamMembers: teamMembersWithAdmins,
        updatedAtMs: ctx.now,
      })
      currentTeamMembers = teamMembersWithAdmins
    }

    const normalizedName = args.name.trim()
    const normalizedRole = (args.role ?? '').trim() || 'Contributor'

    if (!normalizedName) {
      throw Errors.validation.invalidInput('Team member name is required')
    }

    const exists = currentTeamMembers.some((member) => member.name.toLowerCase() === normalizedName.toLowerCase())
    if (exists) {
      throw Errors.resource.alreadyExists('Team member')
    }

    await ctx.db.patch(client._id, {
      teamMembers: [...currentTeamMembers, { name: normalizedName, role: normalizedRole }],
      updatedAtMs: ctx.now,
    })

    return client.legacyId
  },
})

export const syncAdminTeamMembers = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string().optional(),
  },
  returns: z.object({ updatedCount: z.number() }),
  handler: async (ctx, args) => {
    const { updatedCount } = await syncWorkspaceClientAdminMembers(ctx, args.workspaceId, {
      legacyId: args.legacyId,
      now: ctx.now,
    })

    return { updatedCount }
  },
})

export const updateTeamMemberRole = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string(),
    role: z.string(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client || client.deletedAtMs !== null) {
      throw Errors.resource.notFound('Client')
    }

    const normalizedName = args.name.trim()
    if (!normalizedName) {
      throw Errors.validation.invalidInput('Team member name is required')
    }

    const normalizedRole = args.role.trim() || 'Contributor'
    let found = false

    const nextTeamMembers = client.teamMembers.map((member) => {
      if (member.name.toLowerCase() !== normalizedName.toLowerCase()) {
        return member
      }

      found = true
      return { name: member.name, role: normalizedRole }
    })

    if (!found) {
      throw Errors.resource.notFound('Team member')
    }

    const unchanged =
      nextTeamMembers.length === client.teamMembers.length &&
      client.teamMembers.every((member, index) => {
        const next = nextTeamMembers[index]
        return next && member.name === next.name && member.role === next.role
      })

    if (unchanged) {
      return client.legacyId
    }

    await ctx.db.patch(client._id, {
      teamMembers: nextTeamMembers,
      updatedAtMs: ctx.now,
    })

    return client.legacyId
  },
})

export const removeTeamMember = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client || client.deletedAtMs !== null) {
      throw Errors.resource.notFound('Client')
    }

    const normalizedName = args.name.trim()
    if (!normalizedName) {
      throw Errors.validation.invalidInput('Team member name is required')
    }

    if (client.accountManager.toLowerCase() === normalizedName.toLowerCase()) {
      throw Errors.validation.invalidState('Account manager cannot be removed from team members')
    }

    const nextTeamMembers = client.teamMembers.filter(
      (member) => member.name.toLowerCase() !== normalizedName.toLowerCase()
    )

    if (nextTeamMembers.length === client.teamMembers.length) {
      throw Errors.resource.notFound('Team member')
    }

    await ctx.db.patch(client._id, {
      teamMembers: nextTeamMembers,
      updatedAtMs: ctx.now,
    })

    return client.legacyId
  },
})

export const softDelete = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    deletedAtMs: z.number().optional(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client) {
      return args.legacyId
    }

    if (client.deletedAtMs !== null) {
      return client.legacyId
    }

    const timestamp = args.deletedAtMs ?? ctx.now

    await ctx.db.patch(client._id, {
      deletedAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return client.legacyId
  },
})

/**
 * Returns a lightweight summary for every active client in the workspace:
 * open task count, active project count, and the soonest upcoming meeting timestamp.
 * Intended for the Jira-style client overview grid on the activity/for-you page.
 */
export const getClientSummaries = zWorkspaceQueryActive({
  args: { workspaceId: z.string() },
  returns: z.array(
    z.object({
      legacyId: z.string(),
      name: z.string(),
      accountManager: z.string(),
      teamMembersCount: z.number(),
      openTaskCount: z.number(),
      activeProjectCount: z.number(),
      nextMeetingMs: z.number().nullable(),
    })
  ),
  handler: async (ctx, args) => {
    // Fetch all active clients for the workspace
    const clients = await ctx.db
      .query('clients')
      .withIndex('by_workspace_nameLower_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const now = Date.now()
    const database = ctx.db
    const results = []

    const clientSummaries = await Promise.all(
      clients.map(async (client) => {
        const clientId = client.legacyId

        // Open tasks: status not in ['completed', 'archived']
        const allClientTasks = await database
          .query('tasks')
          .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
          )
          .collect()

        const openTaskCount = allClientTasks.filter(
          (t) => t.status !== 'completed' && t.status !== 'archived' && t.deletedAtMs == null,
        ).length

        // Active projects
        const activeProjects = await database
          .query('projects')
          .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
          )
          .filter((q) => q.eq(q.field('status'), 'active'))
          .collect()

        const activeProjectCount = activeProjects.filter((p) => p.deletedAtMs == null).length

        // Next upcoming meeting (scheduled or in_progress, future startTimeMs)
        const upcomingMeetings = await database
          .query('meetings')
          .withIndex('by_workspace_client_startTimeMs', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('clientId', clientId).gte('startTimeMs', now),
          )
          .order('asc')
          .take(1)

        const firstMeeting = upcomingMeetings[0]
        const nextMeetingMs =
          firstMeeting !== undefined &&
          (firstMeeting.status === 'scheduled' || firstMeeting.status === 'in_progress')
            ? firstMeeting.startTimeMs
            : null

        return {
          legacyId: clientId,
          name: client.name,
          accountManager: client.accountManager,
          teamMembersCount: client.teamMembers.length,
          openTaskCount,
          activeProjectCount,
          nextMeetingMs,
        }
      }),
    )
    results.push(...clientSummaries)

    return results
  },
})
