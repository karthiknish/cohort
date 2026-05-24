import {
  assertAccessToMessage,
  Errors,
  requireActorUserId,
  z,
  zWorkspaceMutation,
} from './shared'

// Pin a message to the channel
export const pinMessage = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    userId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)

    const row = await assertAccessToMessage(
      ctx,
      args.workspaceId,
      await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique(),
    )

    // Check if already pinned
    if (row.isPinned) {
      return { success: true, alreadyPinned: true }
    }

    await ctx.db.patch(row._id, {
      isPinned: true,
      pinnedAtMs: ctx.now,
      pinnedBy: currentUserId,
      updatedAtMs: ctx.now,
    })

    return { success: true, alreadyPinned: false }
  },
})

// Unpin a message from the channel
export const unpinMessage = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx)

    const row = await assertAccessToMessage(
      ctx,
      args.workspaceId,
      await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique(),
    )

    // Check if not pinned
    if (!row.isPinned) {
      return { success: true, wasNotPinned: true }
    }

    const isAdmin = ctx?.user?.role === 'admin'
    const isPinnedByUser = typeof row.pinnedBy === 'string' && row.pinnedBy === currentUserId
    if (!isAdmin && !isPinnedByUser) {
      throw Errors.auth.forbidden('Only the pinner or an admin can unpin this message')
    }

    await ctx.db.patch(row._id, {
      isPinned: false,
      pinnedAtMs: null,
      pinnedBy: null,
      updatedAtMs: ctx.now,
    })

    return { success: true, wasNotPinned: false }
  },
})
