import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function nowMs() {
  return Date.now()
}

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    if (identity.subject !== args.userId) {
      throw Errors.auth.unauthorized()
    }

    const row = await ctx.db
      .query('onboardingStates')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique()

    if (!row) return null

    return {
      userId: row.userId,
      onboardingTourCompleted: row.onboardingTourCompleted,
      onboardingTourCompletedAtMs: row.onboardingTourCompletedAtMs,
      welcomeSeenAtMs: (row as any).welcomeSeenAtMs ?? null,
      welcomeSeen: Boolean((row as any).welcomeSeen),
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }
  },
})

export const upsert = mutation({
  args: {
    userId: v.string(),
    onboardingTourCompleted: v.boolean(),
    onboardingTourCompletedAtMs: v.optional(v.union(v.number(), v.null())),
    welcomeSeenAtMs: v.optional(v.union(v.number(), v.null())),
    welcomeSeen: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    if (identity.subject !== args.userId) {
      throw Errors.auth.unauthorized()
    }

    const existing = await ctx.db
      .query('onboardingStates')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique()

    const timestamp = nowMs()
    const payload = {
      userId: args.userId,
      onboardingTourCompleted: args.onboardingTourCompleted,
      onboardingTourCompletedAtMs: args.onboardingTourCompletedAtMs ?? null,
      ...(args.welcomeSeenAtMs !== undefined ? { welcomeSeenAtMs: args.welcomeSeenAtMs } : {}),
      ...(args.welcomeSeen !== undefined ? { welcomeSeen: args.welcomeSeen } : {}),
      updatedAtMs: timestamp,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return { ok: true }
    }

    await ctx.db.insert('onboardingStates', {
      ...payload,
      createdAtMs: timestamp,
    })

    return { ok: true }
  },
})
