import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import {
  authenticatedMutation,
  workspaceMutation,
  workspaceQuery,
  workspaceQueryActive,
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
  billingEmail: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
  lastInvoiceStatus: z.string().nullable(),
  lastInvoiceAmount: z.number().nullable(),
  lastInvoiceCurrency: z.string().nullable(),
  lastInvoiceIssuedAtMs: z.number().nullable(),
  lastInvoiceNumber: z.string().nullable(),
  lastInvoiceUrl: z.string().nullable(),
  lastInvoicePaidAtMs: z.number().nullable(),
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
 * Used by finance-sync.
 */
export const getByLegacyIdServer = query({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx: any, args: any) => {
    // No auth required - called from server-side code
    const row = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Client', args.legacyId)

    return {
      legacyId: row.legacyId,
      name: row.name,
      accountManager: row.accountManager,
      teamMembers: row.teamMembers,
      billingEmail: row.billingEmail,
      stripeCustomerId: row.stripeCustomerId,
      lastInvoiceStatus: row.lastInvoiceStatus,
      lastInvoiceAmount: row.lastInvoiceAmount,
      lastInvoiceCurrency: row.lastInvoiceCurrency,
      lastInvoiceIssuedAtMs: row.lastInvoiceIssuedAtMs,
      lastInvoiceNumber: row.lastInvoiceNumber,
      lastInvoiceUrl: row.lastInvoiceUrl,
      lastInvoicePaidAtMs: row.lastInvoicePaidAtMs,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      deletedAtMs: row.deletedAtMs,
    }
  },
})

/**
 * Update client invoice fields (no auth - server-side use).
 * Used by finance-sync to update last invoice info.
 */
export const updateInvoiceFieldsServer = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.optional(v.string()),
    lastInvoiceStatus: v.union(v.string(), v.null()),
    lastInvoiceAmount: v.union(v.number(), v.null()),
    lastInvoiceCurrency: v.union(v.string(), v.null()),
    lastInvoiceIssuedAtMs: v.union(v.number(), v.null()),
    lastInvoiceNumber: v.union(v.string(), v.null()),
    lastInvoiceUrl: v.union(v.string(), v.null()),
    lastInvoicePaidAtMs: v.union(v.number(), v.null()),
    createIfMissing: v.optional(v.boolean()),
  },
  handler: async (ctx: any, args: any) => {
    // No auth required - called from server-side code
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    const timestamp = Date.now()

    if (!client) {
      if (args.createIfMissing && args.name) {
        // Create minimal client record
        await ctx.db.insert('clients', {
          workspaceId: args.workspaceId,
          legacyId: args.legacyId,
          name: args.name,
          nameLower: args.name.toLowerCase(),
          accountManager: '',
          teamMembers: [],
          billingEmail: null,
          stripeCustomerId: null,
          lastInvoiceStatus: args.lastInvoiceStatus,
          lastInvoiceAmount: args.lastInvoiceAmount,
          lastInvoiceCurrency: args.lastInvoiceCurrency,
          lastInvoiceIssuedAtMs: args.lastInvoiceIssuedAtMs,
          lastInvoiceNumber: args.lastInvoiceNumber,
          lastInvoiceUrl: args.lastInvoiceUrl,
          lastInvoicePaidAtMs: args.lastInvoicePaidAtMs,
          createdBy: null,
          createdAtMs: timestamp,
          updatedAtMs: timestamp,
          deletedAtMs: null,
        })
      return { ok: true, created: true }
    }
    throw Errors.resource.notFound('Client', args.legacyId)
  }

  const updates: Record<string, unknown> = {
      lastInvoiceStatus: args.lastInvoiceStatus,
      lastInvoiceAmount: args.lastInvoiceAmount,
      lastInvoiceCurrency: args.lastInvoiceCurrency,
      lastInvoiceIssuedAtMs: args.lastInvoiceIssuedAtMs,
      lastInvoiceNumber: args.lastInvoiceNumber,
      lastInvoiceUrl: args.lastInvoiceUrl,
      lastInvoicePaidAtMs: args.lastInvoicePaidAtMs,
      updatedAtMs: timestamp,
    }

    if (args.name && (!client.name || client.name.trim().length === 0)) {
      updates.name = args.name
      updates.nameLower = args.name.toLowerCase()
    }

    await ctx.db.patch(client._id, updates)

    return { ok: true, created: false }
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
  handler: async (ctx: any, args: any) => {
    const isAdmin = ctx.user?.role === 'admin'
    const fetchAll = isAdmin && args.includeAllWorkspaces === true

    let q: any

    if (fetchAll) {
      // Admin fetching all clients across workspaces
      q = ctx.db
        .query('clients')
        .order('asc')
    } else {
      // Standard workspace-scoped query
      q = ctx.db
        .query('clients')
        .withIndex('by_workspace_nameLower_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
        .order('asc')
    }

    q = applyManualPagination(q, args.cursor, 'nameLower', 'asc')

    const rows = await q.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'nameLower')

    return {
      items: result.items.map((row: any) => ({
        legacyId: row.legacyId,
        name: row.name,
        accountManager: row.accountManager,
        teamMembers: row.teamMembers,
        billingEmail: row.billingEmail,
        stripeCustomerId: row.stripeCustomerId,
        lastInvoiceStatus: row.lastInvoiceStatus,
        lastInvoiceAmount: row.lastInvoiceAmount,
        lastInvoiceCurrency: row.lastInvoiceCurrency,
        lastInvoiceIssuedAtMs: row.lastInvoiceIssuedAtMs,
        lastInvoiceNumber: row.lastInvoiceNumber,
        lastInvoiceUrl: row.lastInvoiceUrl,
        lastInvoicePaidAtMs: row.lastInvoicePaidAtMs,
        createdAtMs: row.createdAtMs,
        updatedAtMs: row.updatedAtMs,
        deletedAtMs: row.deletedAtMs,
        workspaceId: row.workspaceId,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const countActive = zWorkspaceQueryActive({
  args: { workspaceId: z.string() },
  returns: z.number(),
  handler: async (ctx: any, args: any) => {
    const rows = await ctx.db
      .query('clients')
      .withIndex('by_workspace_deletedAtMs', (q: any) => q.eq('workspaceId', args.workspaceId).eq('deletedAtMs', null))
      .collect()

    return rows.length
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: clientZ,
  handler: async (ctx: any, args: any) => {
    const row = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Client', args.legacyId)

    return {
      legacyId: row.legacyId,
      name: row.name,
      accountManager: row.accountManager,
      teamMembers: row.teamMembers,
      billingEmail: row.billingEmail,
      stripeCustomerId: row.stripeCustomerId,
      lastInvoiceStatus: row.lastInvoiceStatus,
      lastInvoiceAmount: row.lastInvoiceAmount,
      lastInvoiceCurrency: row.lastInvoiceCurrency,
      lastInvoiceIssuedAtMs: row.lastInvoiceIssuedAtMs,
      lastInvoiceNumber: row.lastInvoiceNumber,
      lastInvoiceUrl: row.lastInvoiceUrl,
      lastInvoicePaidAtMs: row.lastInvoicePaidAtMs,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      deletedAtMs: row.deletedAtMs,
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
    billingEmail: z.string().nullable(),
    createdBy: z.string().nullable(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx: any, args: any) => {
    const baseId = slugify(args.name)
    let candidateId = baseId
    let attempt = 1
    let finalId: string | null = null

    while (attempt <= 20) {
      const existing = await ctx.db
        .query('clients')
        .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', candidateId))
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
      billingEmail: args.billingEmail,
      stripeCustomerId: null,
      lastInvoiceStatus: null,
      lastInvoiceAmount: null,
      lastInvoiceCurrency: null,
      lastInvoiceIssuedAtMs: null,
      lastInvoiceNumber: null,
      lastInvoiceUrl: null,
      lastInvoicePaidAtMs: null,
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
  handler: async (ctx: any, args: any) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client || client.deletedAtMs !== null) {
      throw Errors.resource.notFound('Client')
    }

    const normalizedName = args.name.trim()
    const normalizedRole = (args.role ?? '').trim() || 'Contributor'

    const exists = client.teamMembers.some((member: any) => member.name.toLowerCase() === normalizedName.toLowerCase())
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
  handler: async (ctx: any, args: any) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
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

export const updateInvoiceFields = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    billingEmail: z.string().nullable(),
    stripeCustomerId: z.string().nullable(),
    lastInvoiceStatus: z.string().nullable(),
    lastInvoiceAmount: z.number().nullable(),
    lastInvoiceCurrency: z.string().nullable(),
    lastInvoiceIssuedAtMs: z.number().nullable(),
    lastInvoiceNumber: z.string().nullable(),
    lastInvoiceUrl: z.string().nullable(),
    lastInvoicePaidAtMs: z.number().nullable().optional(),
  },
  returns: z.string(),
  handler: async (ctx: any, args: any) => {
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client) {
      throw Errors.resource.notFound('Client')
    }

    await ctx.db.patch(client._id, {
      billingEmail: args.billingEmail,
      stripeCustomerId: args.stripeCustomerId,
      lastInvoiceStatus: args.lastInvoiceStatus,
      lastInvoiceAmount: args.lastInvoiceAmount,
      lastInvoiceCurrency: args.lastInvoiceCurrency,
      lastInvoiceIssuedAtMs: args.lastInvoiceIssuedAtMs,
      lastInvoiceNumber: args.lastInvoiceNumber,
      lastInvoiceUrl: args.lastInvoiceUrl,
      lastInvoicePaidAtMs: args.lastInvoicePaidAtMs ?? client.lastInvoicePaidAtMs,
      updatedAtMs: ctx.now,
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
    billingEmail: z.string().nullable(),
    stripeCustomerId: z.string().nullable(),
    lastInvoiceStatus: z.string().nullable(),
    lastInvoiceAmount: z.number().nullable(),
    lastInvoiceCurrency: z.string().nullable(),
    lastInvoiceIssuedAtMs: z.number().nullable(),
    lastInvoiceNumber: z.string().nullable(),
    lastInvoiceUrl: z.string().nullable(),
    lastInvoicePaidAtMs: z.number().nullable(),
    createdBy: z.string().nullable(),
    createdAtMs: z.number(),
    updatedAtMs: z.number(),
    deletedAtMs: z.number().nullable(),
  },
  returns: z.string(),
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    const payload = {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      name: args.name,
      nameLower: args.name.toLowerCase(),
      accountManager: args.accountManager,
      teamMembers: args.teamMembers,
      billingEmail: args.billingEmail,
      stripeCustomerId: args.stripeCustomerId,
      lastInvoiceStatus: args.lastInvoiceStatus,
      lastInvoiceAmount: args.lastInvoiceAmount,
      lastInvoiceCurrency: args.lastInvoiceCurrency,
      lastInvoiceIssuedAtMs: args.lastInvoiceIssuedAtMs,
      lastInvoiceNumber: args.lastInvoiceNumber,
      lastInvoiceUrl: args.lastInvoiceUrl,
      lastInvoicePaidAtMs: args.lastInvoicePaidAtMs,
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
        billingEmail: z.string().nullable(),
        stripeCustomerId: z.string().nullable(),
        lastInvoiceStatus: z.string().nullable(),
        lastInvoiceAmount: z.number().nullable(),
        lastInvoiceCurrency: z.string().nullable(),
        lastInvoiceIssuedAtMs: z.number().nullable(),
        lastInvoiceNumber: z.string().nullable(),
        lastInvoiceUrl: z.string().nullable(),
        lastInvoicePaidAtMs: z.number().nullable(),
        createdBy: z.string().nullable(),
        createdAtMs: z.number(),
        updatedAtMs: z.number(),
        deletedAtMs: z.number().nullable(),
      })
    ),
  },
  returns: z.object({ upserted: z.number() }),
  handler: async (ctx: any, args: any) => {
    let upserted = 0

    for (const client of args.clients) {
      const existing = await ctx.db
        .query('clients')
        .withIndex('by_workspace_legacyId', (q: any) =>
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
        billingEmail: client.billingEmail,
        stripeCustomerId: client.stripeCustomerId,
        lastInvoiceStatus: client.lastInvoiceStatus,
        lastInvoiceAmount: client.lastInvoiceAmount,
        lastInvoiceCurrency: client.lastInvoiceCurrency,
        lastInvoiceIssuedAtMs: client.lastInvoiceIssuedAtMs,
        lastInvoiceNumber: client.lastInvoiceNumber,
        lastInvoiceUrl: client.lastInvoiceUrl,
        lastInvoicePaidAtMs: client.lastInvoicePaidAtMs,
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
