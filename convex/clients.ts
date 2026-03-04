import { query } from './_generated/server'
import { v } from 'convex/values'
import {
  zAuthenticatedMutation,
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from './functions'
import { z } from 'zod/v4'
import { Errors } from './errors'

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

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  if (base.length === 0) {
    return `client-${Date.now()}`
  }

  return base
}

/**
 * Get client by legacyId (no auth - server-side use).
 */
export const getByLegacyIdServer = query({
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
    const rows = await ctx.db
      .query('clients')
      .withIndex('by_workspace_deletedAtMs', (q) => q.eq('workspaceId', args.workspaceId).eq('deletedAtMs', null))
      .collect()

    return rows.length
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
    const baseId = slugify(args.name)
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
      name: args.name,
      nameLower: args.name.toLowerCase(),
      accountManager: args.accountManager,
      teamMembers: args.teamMembers,
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

    const normalizedName = args.name.trim()
    const normalizedRole = (args.role ?? '').trim() || 'Contributor'

    const exists = client.teamMembers.some((member) => member.name.toLowerCase() === normalizedName.toLowerCase())
    if (exists) {
      throw Errors.resource.alreadyExists('Team member')
    }

    await ctx.db.patch(client._id, {
      teamMembers: [...client.teamMembers, { name: normalizedName, role: normalizedRole }],
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
      throw Errors.resource.notFound('Client')
    }

    const timestamp = args.deletedAtMs ?? ctx.now

    await ctx.db.patch(client._id, {
      deletedAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return client.legacyId
  },
})

export const upsert = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string(),
    accountManager: z.string(),
    teamMembers: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
      })
    ),
    createdBy: z.string().nullable(),
    createdAtMs: z.number(),
    updatedAtMs: z.number(),
    deletedAtMs: z.number().nullable(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    const payload = {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      name: args.name,
      nameLower: args.name.toLowerCase(),
      accountManager: args.accountManager,
      teamMembers: args.teamMembers,
      createdBy: args.createdBy,
      createdAtMs: args.createdAtMs,
      updatedAtMs: args.updatedAtMs,
      deletedAtMs: args.deletedAtMs,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return args.legacyId
    }

    await ctx.db.insert('clients', payload)
    return args.legacyId
  },
})

export const bulkUpsert = zAuthenticatedMutation({
  args: {
    clients: z.array(
      z.object({
        workspaceId: z.string(),
        legacyId: z.string(),
        name: z.string(),
        accountManager: z.string(),
        teamMembers: z.array(
          z.object({
            name: z.string(),
            role: z.string(),
          })
        ),
        createdBy: z.string().nullable(),
        createdAtMs: z.number(),
        updatedAtMs: z.number(),
        deletedAtMs: z.number().nullable(),
      })
    ),
  },
  returns: z.object({ upserted: z.number() }),
  handler: async (ctx, args) => {
    let upserted = 0

    for (const client of args.clients) {
      const existing = await ctx.db
        .query('clients')
        .withIndex('by_workspace_legacyId', (q) =>
          q.eq('workspaceId', client.workspaceId).eq('legacyId', client.legacyId)
        )
        .unique()

      const payload = {
        workspaceId: client.workspaceId,
        legacyId: client.legacyId,
        name: client.name,
        nameLower: client.name.toLowerCase(),
        accountManager: client.accountManager,
        teamMembers: client.teamMembers,
        createdBy: client.createdBy,
        createdAtMs: client.createdAtMs,
        updatedAtMs: client.updatedAtMs,
        deletedAtMs: client.deletedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('clients', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})
