import { query } from './_generated/server'
import { v } from 'convex/values'

export const ping = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    now: v.number(),
  }),
  handler: async (ctx) => {
    // Lightweight read to validate Convex connectivity.
    // This is a public query so it doesn't require authentication.
    // We just check if the database is accessible by doing a minimal operation.
    await ctx.db.query('users').take(1)

    return { ok: true as const, now: Date.now() }
  },
})
