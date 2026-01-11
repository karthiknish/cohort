import { query } from './_generated/server'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

export const ping = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    // Lightweight read to validate Convex connectivity.
    await ctx.db.query('users').take(1)

    return { ok: true, now: Date.now() }
  },
})
