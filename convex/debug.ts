import { authenticatedQuery, adminMutation, adminQuery } from './functions'
import { query } from './_generated/server'
import { v } from 'convex/values'

function summarizeIdentity(identity: any) {
  if (!identity) return { present: false }

  return {
    present: true,
    issuer: typeof identity.issuer === 'string' ? identity.issuer : null,
    subject: typeof identity.subject === 'string' ? identity.subject : null,
    email: typeof identity.email === 'string' ? identity.email : null,
    name: typeof identity.name === 'string' ? identity.name : null,
    role: typeof identity.role === 'string' ? identity.role : null,
  }
}

export const whoami = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    return {
      identity: summarizeIdentity(ctx.user),
      authInfo: {
        hasAuth: true, // If we're here, we're authenticated
      },
    }
  },
})

export const listAnyClients = adminQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 25, 1), 100)

    const items = await ctx.db.query('clients').order('desc').take(limit)

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

export const countClientsByWorkspace = adminQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
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

export const backfillDeletedAtMs = adminMutation({
  args: {
    tables: v.optional(v.array(v.string())),
    limitPerTable: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const defaultTables = ['tasks', 'taskComments', 'collaborationMessages', 'clients', 'projects']
    const tables = (args.tables ?? defaultTables).filter((t) => defaultTables.includes(t))
    const limitPerTable = Math.min(Math.max(args.limitPerTable ?? 500, 1), 5000)

    const summary: Record<string, { scanned: number; patched: number; skipped: number; errors: number }> = {}

    for (const table of tables) {
      summary[table] = { scanned: 0, patched: 0, skipped: 0, errors: 0 }

      const rows = await ctx.db.query(table as any).take(limitPerTable)
      summary[table].scanned = rows.length

      for (const row of rows as any[]) {
        try {
          if (row.deletedAtMs !== undefined) {
            summary[table].skipped += 1
            continue
          }
          await ctx.db.patch(row._id, { deletedAtMs: null })
          summary[table].patched += 1
        } catch {
          summary[table].errors += 1
        }
      }
    }

    return {
      ok: true,
      tables,
      limitPerTable,
      summary,
    }
  },
})

/**
 * Unauthenticated debug query to inspect raw client data.
 * WARNING: Only use in development! Remove or protect in production.
 */
export const inspectClients = query({
  args: { workspaceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 10, 1), 50)

    const rows = await ctx.db
      .query('clients')
      .withIndex('by_workspace_nameLower_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
      .take(limit)

    return {
      count: rows.length,
      rows: rows.map((row) => ({
        _id: row._id,
        workspaceId: row.workspaceId,
        legacyId: row.legacyId,
        name: row.name,
        deletedAtMs: row.deletedAtMs,
        deletedAtMsType: typeof row.deletedAtMs,
        hasDeletedAtMs: 'deletedAtMs' in row,
      })),
    }
  },
})
