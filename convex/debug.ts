import { query } from './_generated/server'
import { v } from 'convex/values'

function requireAdmin(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }

  const role = (identity as any).role
  if (role !== 'admin') {
    throw new Error('Admin access required')
  }
}

export const listAnyClients = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    const limit = Math.min(Math.max(args.limit ?? 25, 1), 100)

    const items = await ctx.db
      .query('clients')
      .order('desc')
      .take(limit)

    return items.map((row) => ({
      workspaceId: row.workspaceId,
      legacyId: row.legacyId,
      name: row.name,
      deletedAtMs: row.deletedAtMs,
      updatedAtMs: row.updatedAtMs,
      createdAtMs: row.createdAtMs,
    }))
  },
})

export const countClientsByWorkspace = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 2000)

    const rows = await ctx.db.query('clients').take(limit)

    const counts = new Map<string, { total: number; active: number }>()

    for (const row of rows) {
      const prev = counts.get(row.workspaceId) ?? { total: 0, active: 0 }
      prev.total += 1
      if (row.deletedAtMs == null) prev.active += 1
      counts.set(row.workspaceId, prev)
    }

    return {
      sampled: rows.length,
      workspaces: Array.from(counts.entries())
        .map(([workspaceId, stats]) => ({ workspaceId, ...stats }))
        .sort((a, b) => b.total - a.total),
    }
  },
})
