import { v } from 'convex/values'
import { Errors } from './errors'
import { authenticatedQuery, authenticatedMutation } from './functions'

const onboardingStateValidator = v.object({
  userId: v.string(),
  onboardingTourCompleted: v.boolean(),
  onboardingTourCompletedAtMs: v.union(v.number(), v.null()),
  welcomeSeenAtMs: v.union(v.number(), v.null()),
  welcomeSeen: v.boolean(),
  createdAtMs: v.number(),
  updatedAtMs: v.number(),
})

export const getByUserId = authenticatedQuery({
  args: { userId: v.string() },
  returns: v.union(v.null(), onboardingStateValidator),
  handler: async (ctx, args) => {
    // Users can only access their own onboarding state
    if (ctx.legacyId !== args.userId) {
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

export const upsert = authenticatedMutation({
  args: {
    userId: v.string(),
    onboardingTourCompleted: v.boolean(),
    onboardingTourCompletedAtMs: v.optional(v.union(v.number(), v.null())),
    welcomeSeenAtMs: v.optional(v.union(v.number(), v.null())),
    welcomeSeen: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    // Users can only modify their own onboarding state
    if (ctx.legacyId !== args.userId) {
      throw Errors.auth.unauthorized()
    }

    const existing = await ctx.db
      .query('onboardingStates')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique()

    const timestamp = ctx.now
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
      return { ok: true } as const
    }

    await ctx.db.insert('onboardingStates', {
      ...payload,
      createdAtMs: timestamp,
    })

    return { ok: true } as const
  },
})
