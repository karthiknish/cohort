import type { QueryCtx } from './_generated/server'

export type AuthedLegacyId = {
  legacyId: string
}

export async function requireLegacyId(ctx: QueryCtx): Promise<AuthedLegacyId> {
  const identity = await ctx.auth.getUserIdentity()
  const legacyId = identity?.subject

  if (!legacyId) {
    throw new Error('Unauthorized')
  }

  return { legacyId }
}

export async function requireAdminFromUsersTable(ctx: QueryCtx): Promise<AuthedLegacyId> {
  const { legacyId } = await requireLegacyId(ctx)

  const user = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', legacyId))
    .unique()

  if (!user) {
    throw new Error('User not found')
  }

  if (user.status === 'disabled' || user.status === 'suspended') {
    throw new Error('User is not active')
  }

  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return { legacyId }
}
