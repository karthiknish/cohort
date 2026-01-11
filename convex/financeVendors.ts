import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

function now() {
  return Date.now()
}

export const list = query({
  args: {
    workspaceId: v.string(),
    includeInactive: v.optional(v.boolean()),
    q: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const includeInactive = args.includeInactive ?? false
    const q = (args.q ?? '').trim().toLowerCase()

    const rows = await ctx.db
      .query('financeVendors')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .collect()

    let vendors = includeInactive ? rows : rows.filter((row) => row.isActive)

    if (q) {
      vendors = vendors.filter((vendor) => vendor.name.toLowerCase().includes(q))
    }

    vendors.sort((a, b) => a.name.localeCompare(b.name))

    return vendors.map((row) => ({
      legacyId: row.legacyId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      website: row.website,
      notes: row.notes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  },
})

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.optional(v.string()),

    name: v.string(),
    email: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    website: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
    isActive: v.boolean(),

    createdBy: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()

    if (args.legacyId) {
      const existing = await ctx.db
        .query('financeVendors')
        .withIndex('by_workspaceId_legacyId', (qIndex) =>
          qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId!)
        )
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: args.name,
          email: args.email,
          phone: args.phone,
          website: args.website,
          notes: args.notes,
          isActive: args.isActive,
          updatedAt: timestamp,
        })

        return { ok: true }
      }

      await ctx.db.insert('financeVendors', {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        name: args.name,
        email: args.email,
        phone: args.phone,
        website: args.website,
        notes: args.notes,
        isActive: args.isActive,
        createdBy: args.createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    const legacyId = crypto.randomUUID()

    await ctx.db.insert('financeVendors', {
      workspaceId: args.workspaceId,
      legacyId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      website: args.website,
      notes: args.notes,
      isActive: args.isActive,
      createdBy: args.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return { ok: true, legacyId }
  },
})

export const remove = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('financeVendors')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return { ok: true }
  },
})
