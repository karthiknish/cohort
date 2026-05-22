import { internalQuery } from './_generated/server'
import { v } from 'convex/values'

export const listPlatformAdminMembersInternal = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      email: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db.query('users').take(1000)

    return rows.flatMap((row) => {
      if (row.role !== 'admin') return []
      if (row.status === 'disabled' || row.status === 'suspended') return []

      const name = typeof row.name === 'string' ? row.name.trim() : ''
      if (!name) return []

      return [
        {
          id: row.legacyId,
          name,
          email: row.email?.trim() || undefined,
        },
      ]
    })
  },
})
