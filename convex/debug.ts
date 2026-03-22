import { authenticatedQuery, adminMutation, adminQuery } from './functions'
import { v } from 'convex/values'

function summarizeIdentity(identity: unknown) {
  if (!identity) return { present: false }

  const record = identity && typeof identity === 'object' ? (identity as Record<string, unknown>) : null

  return {
    present: true,
    issuer: typeof record?.issuer === 'string' ? record.issuer : null,
    subject: typeof record?.subject === 'string' ? record.subject : null,
    email: typeof record?.email === 'string' ? record.email : null,
    name: typeof record?.name === 'string' ? record.name : null,
    role: typeof record?.role === 'string' ? record.role : null,
  }
}

const DEBUG_TABLES = ['tasks', 'taskComments', 'collaborationMessages', 'clients', 'projects'] as const
type DebugTable = (typeof DEBUG_TABLES)[number]

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
    const tables = (args.tables ?? [...DEBUG_TABLES]).filter((t): t is DebugTable =>
      (DEBUG_TABLES as readonly string[]).includes(t),
    )
    const limitPerTable = Math.min(Math.max(args.limitPerTable ?? 500, 1), 5000)

    const summary: Record<string, { scanned: number; patched: number; skipped: number; errors: number }> = {}

    for (const table of tables) {
      summary[table] = { scanned: 0, patched: 0, skipped: 0, errors: 0 }

      const rows =
        table === 'tasks'
          ? await ctx.db.query('tasks').take(limitPerTable)
          : table === 'taskComments'
            ? await ctx.db.query('taskComments').take(limitPerTable)
            : table === 'collaborationMessages'
              ? await ctx.db.query('collaborationMessages').take(limitPerTable)
              : table === 'clients'
                ? await ctx.db.query('clients').take(limitPerTable)
                : await ctx.db.query('projects').take(limitPerTable)

      summary[table].scanned = rows.length

      for (const row of rows) {
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
 * Admin-only debug query to inspect raw client data.
 */
export const inspectClients = adminQuery({
  args: { workspaceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 10, 1), 50)

    const rows = await ctx.db
      .query('clients')
      .withIndex('by_workspace_nameLower_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
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
