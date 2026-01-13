import { query } from './_generated/server'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
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
