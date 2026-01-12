import { authenticatedQuery, adminQuery } from './functions'
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
