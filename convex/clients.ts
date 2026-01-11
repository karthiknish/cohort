import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs(): number {
  return Date.now()
}

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
  handler: async (ctx, args) => {
    // No auth required - called from server-side code
    const row = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return null

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
  handler: async (ctx, args) => {
    // No auth required - called from server-side code
    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    const timestamp = nowMs()

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
      return { ok: false, error: 'Client not found' }
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

export const list = query({
  args: {
    workspaceId: v.string(),
    limit: v.number(),
    // Cursor for pagination, based on (nameLower, legacyId)
    afterNameLower: v.optional(v.string()),
    afterLegacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    let q = ctx.db
      .query('clients')
      .withIndex('by_workspace_nameLower_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .order('asc')
      .filter((row) => row.eq(row.field('deletedAtMs'), null))

    const afterNameLower = args.afterNameLower
    const afterLegacyId = args.afterLegacyId

    if (typeof afterNameLower === 'string' && typeof afterLegacyId === 'string') {
      q = q.filter((row) =>
        row.or(
          row.gt(row.field('nameLower'), afterNameLower),
          row.and(row.eq(row.field('nameLower'), afterNameLower), row.gt(row.field('legacyId'), afterLegacyId))
        )
      )
    }

    const rows = await q.take(args.limit)
    return rows.map((row) => ({
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
    }))
  },
})

export const countActive = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const rows = await ctx.db
      .query('clients')
      .withIndex('by_workspace_deletedAtMs', (q) => q.eq('workspaceId', args.workspaceId).eq('deletedAtMs', null))
      .collect()

    return { count: rows.length }
  },
})

export const getByLegacyId = query({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return null

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

export const create = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    accountManager: v.string(),
    teamMembers: v.array(
      v.object({
        name: v.string(),
        role: v.string(),
      })
    ),
    billingEmail: v.union(v.string(), v.null()),
    createdBy: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

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
      finalId = `${baseId}-${Date.now()}`
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
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
      deletedAtMs: null,
    }

    await ctx.db.insert('clients', payload)
    return { legacyId: finalId }
  },
})

export const addTeamMember = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client || client.deletedAtMs !== null) {
      throw new Error('Client not found')
    }

    const normalizedName = args.name.trim()
    const normalizedRole = (args.role ?? '').trim() || 'Contributor'

    const exists = client.teamMembers.some((member) => member.name.toLowerCase() === normalizedName.toLowerCase())
    if (exists) {
      throw new Error('Team member already exists')
    }

    await ctx.db.patch(client._id, {
      teamMembers: [...client.teamMembers, { name: normalizedName, role: normalizedRole }],
      updatedAtMs: nowMs(),
    })

    return { ok: true }
  },
})

export const softDelete = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    deletedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client) {
      throw new Error('Client not found')
    }

    const timestamp = args.deletedAtMs ?? nowMs()

    await ctx.db.patch(client._id, {
      deletedAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return { ok: true }
  },
})

export const updateInvoiceFields = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    billingEmail: v.union(v.string(), v.null()),
    stripeCustomerId: v.union(v.string(), v.null()),
    lastInvoiceStatus: v.union(v.string(), v.null()),
    lastInvoiceAmount: v.union(v.number(), v.null()),
    lastInvoiceCurrency: v.union(v.string(), v.null()),
    lastInvoiceIssuedAtMs: v.union(v.number(), v.null()),
    lastInvoiceNumber: v.union(v.string(), v.null()),
    lastInvoiceUrl: v.union(v.string(), v.null()),
    lastInvoicePaidAtMs: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const client = await ctx.db
      .query('clients')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!client) {
      throw new Error('Client not found')
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
      updatedAtMs: nowMs(),
    })

    return { ok: true }
  },
})

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    accountManager: v.string(),
    teamMembers: v.array(
      v.object({
        name: v.string(),
        role: v.string(),
      })
    ),
    billingEmail: v.union(v.string(), v.null()),
    stripeCustomerId: v.union(v.string(), v.null()),
    lastInvoiceStatus: v.union(v.string(), v.null()),
    lastInvoiceAmount: v.union(v.number(), v.null()),
    lastInvoiceCurrency: v.union(v.string(), v.null()),
    lastInvoiceIssuedAtMs: v.union(v.number(), v.null()),
    lastInvoiceNumber: v.union(v.string(), v.null()),
    lastInvoiceUrl: v.union(v.string(), v.null()),
    lastInvoicePaidAtMs: v.union(v.number(), v.null()),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    deletedAtMs: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

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
      return { ok: true }
    }

    await ctx.db.insert('clients', payload)
    return { ok: true }
  },
})

export const bulkUpsert = mutation({
  args: {
    clients: v.array(
      v.object({
        workspaceId: v.string(),
        legacyId: v.string(),
        name: v.string(),
        accountManager: v.string(),
        teamMembers: v.array(
          v.object({
            name: v.string(),
            role: v.string(),
          })
        ),
        billingEmail: v.union(v.string(), v.null()),
        stripeCustomerId: v.union(v.string(), v.null()),
        lastInvoiceStatus: v.union(v.string(), v.null()),
        lastInvoiceAmount: v.union(v.number(), v.null()),
        lastInvoiceCurrency: v.union(v.string(), v.null()),
        lastInvoiceIssuedAtMs: v.union(v.number(), v.null()),
        lastInvoiceNumber: v.union(v.string(), v.null()),
        lastInvoiceUrl: v.union(v.string(), v.null()),
        lastInvoicePaidAtMs: v.union(v.number(), v.null()),
        createdBy: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
        deletedAtMs: v.union(v.number(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

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
