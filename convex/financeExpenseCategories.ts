import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function now() {
  return Date.now()
}

export const list = query({
  args: {
    workspaceId: v.string(),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const includeInactive = args.includeInactive ?? false

    const rows = await ctx.db
      .query('financeExpenseCategories')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const filtered = includeInactive ? rows : rows.filter((row) => row.isActive)

    filtered.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name)
    })

    return filtered.map((row) => ({
      legacyId: row.legacyId,
      name: row.name,
      code: row.code ?? null,
      description: row.description ?? null,
      isActive: row.isActive,
      isSystem: row.isSystem,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  },
})

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    code: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.union(v.string(), v.null())),
    isActive: v.boolean(),
    isSystem: v.boolean(),
    sortOrder: v.number(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('financeExpenseCategories')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    const timestamp = now()

    if (existing) {
      // Preserve system category immutability rules.
      if (existing.isSystem && !args.isSystem) {
        // allow keeping it system; disallow clearing it
        throw Errors.auth.forbidden('System categories cannot be modified')
      }

      await ctx.db.patch(existing._id, {
        name: args.name,
        code: args.code ?? null,
        description: args.description ?? null,
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    await ctx.db.insert('financeExpenseCategories', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      name: args.name,
      code: args.code ?? null,
      description: args.description ?? null,
      isActive: args.isActive,
      isSystem: args.isSystem,
      sortOrder: args.sortOrder,
      createdBy: args.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return { ok: true }
  },
})

export const bulkUpsert = mutation({
  args: {
    workspaceId: v.string(),
    categories: v.array(
      v.object({
        legacyId: v.string(),
        name: v.string(),
        code: v.optional(v.union(v.string(), v.null())),
        description: v.optional(v.union(v.string(), v.null())),
        isActive: v.boolean(),
        isSystem: v.boolean(),
        sortOrder: v.number(),
        createdBy: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    for (const category of args.categories) {
      const existing = await ctx.db
        .query('financeExpenseCategories')
        .withIndex('by_workspaceId_legacyId', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('legacyId', category.legacyId)
        )
        .unique()

      const timestamp = now()

      if (existing) {
        if (existing.isSystem) {
          // Avoid mutating system rows during backfill.
          continue
        }
        await ctx.db.patch(existing._id, {
          name: category.name,
          code: category.code ?? null,
          description: category.description ?? null,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          updatedAt: timestamp,
        })
        continue
      }

      await ctx.db.insert('financeExpenseCategories', {
        workspaceId: args.workspaceId,
        legacyId: category.legacyId,
        name: category.name,
        code: category.code ?? null,
        description: category.description ?? null,
        isActive: category.isActive,
        isSystem: category.isSystem,
        sortOrder: category.sortOrder,
        createdBy: category.createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }

    return { ok: true, upserted: args.categories.length }
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
      .query('financeExpenseCategories')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Expense Category', args.legacyId)
    }

    if (existing.isSystem) {
      throw Errors.auth.forbidden('System categories cannot be deleted')
    }

    await ctx.db.delete(existing._id)
    return { ok: true }
  },
})
