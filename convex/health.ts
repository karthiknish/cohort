import { authenticatedQuery } from './functions'
import { v } from 'convex/values'

export const ping = authenticatedQuery({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    now: v.number(),
  }),
  handler: async (ctx) => {
    // Lightweight read to validate Convex connectivity.
    await ctx.db.query('users').take(1)

    return { ok: true as const, now: Date.now() }
  },
})
