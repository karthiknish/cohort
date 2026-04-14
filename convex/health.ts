import { query } from './_generated/server'
import { v } from 'convex/values'

export const ping = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    now: v.number(),
  }),
  handler: async () => {
    // Public health check — no DB reads (avoids touching user rows from anonymous callers).
    return { ok: true as const, now: Date.now() }
  },
})
