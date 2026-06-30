import { internalMutation } from '../_generated/server'
import { v } from 'convex/values'
import type { GenericMutationCtx } from 'convex/server'
import type { DataModel } from '../_generated/dataModel'

type Ctx = GenericMutationCtx<DataModel>

// Trigger callbacks — sync Better Auth `user` table → app `users` table.
// The Better Auth user `_id` becomes the `legacyId` in the app `users` table,
// so identity-gated queries (getByLegacyIdSafe) always match.

export async function onUserCreate(
  ctx: Ctx,
  user: { _id: string; email: string; name: string; image?: string | null },
) {
  const existing = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', user._id))
    .unique()
  if (existing) return

  const isFirstUser = (await ctx.db.query('users').first()) === null
  const timestamp = Date.now()
  const email = user.email ?? ''
  const emailLower = email ? email.toLowerCase() : ''

  await ctx.db.insert('users', {
    legacyId: user._id,
    email,
    emailLower,
    name: user.name ?? null,
    role: isFirstUser ? 'admin' : 'client',
    status: isFirstUser ? 'active' : 'pending',
    agencyId: user._id,
    phoneNumber: null,
    photoUrl: user.image ?? null,
    createdAtMs: timestamp,
    updatedAtMs: timestamp,
  })
}

export async function onUserUpdate(
  ctx: Ctx,
  newUser: { _id: string; email: string; name: string; image?: string | null },
) {
  const appUser = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', newUser._id))
    .unique()
  if (!appUser) return

  const email = newUser.email ?? appUser.email ?? null
  const emailLower = email ? email.toLowerCase() : null
  const name = newUser.name ?? appUser.name ?? null
  const photoUrl = newUser.image ?? appUser.photoUrl ?? null

  if (email !== appUser.email || emailLower !== appUser.emailLower || name !== appUser.name || photoUrl !== appUser.photoUrl) {
    await ctx.db.patch(appUser._id, {
      email,
      emailLower,
      name,
      photoUrl,
      updatedAtMs: Date.now(),
    })
  }
}

export async function onUserDelete(
  ctx: Ctx,
  user: { _id: string },
) {
  const appUser = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', user._id))
    .unique()
  if (appUser) {
    await ctx.db.delete(appUser._id)
  }
}

// Internal mutations that the Better Auth component calls via `authFunctions`.
// These are the bridge between the component's adapter (which fires on user
// create/update/delete) and the trigger callbacks above.
// oxlint-disable-next-line convex-unused/no-unused-functions
export const onCreate = internalMutation({
  args: { doc: v.any(), model: v.string() },
  handler: async (ctx, args) => {
    if (args.model !== 'user') return
    await onUserCreate(ctx, args.doc)
  },
})

// oxlint-disable-next-line convex-unused/no-unused-functions
export const onUpdate = internalMutation({
  args: { oldDoc: v.any(), newDoc: v.any(), model: v.string() },
  handler: async (ctx, args) => {
    if (args.model !== 'user') return
    await onUserUpdate(ctx, args.newDoc)
  },
})

// oxlint-disable-next-line convex-unused/no-unused-functions
export const onDelete = internalMutation({
  args: { doc: v.any(), model: v.string() },
  handler: async (ctx, args) => {
    if (args.model !== 'user') return
    await onUserDelete(ctx, args.doc)
  },
})
