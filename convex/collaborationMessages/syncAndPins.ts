import {
  attachmentZ,
  assertAccessToMessage,
  assertChannelAccess,
  buildListChannelQuery,
  Errors,
  hydrateAttachments,
  hydrateMessageRow,
  mentionZ,
  normalizeChannelScope,
  requireActorUserId,
  z,
  zWorkspaceMutation,
  zWorkspaceQuery,
} from './shared'

export const bulkUpsert = zWorkspaceMutation({
  args: {
    messages: z.array(
      z.object({
        legacyId: z.string(),
        channelId: z.string().nullable().optional(),
        channelType: z.string(),
        clientId: z.string().nullable(),
        projectId: z.string().nullable(),
        senderId: z.string().nullable(),
        senderName: z.string(),
        senderRole: z.string().nullable(),
        content: z.string(),
        createdAtMs: z.number(),
        updatedAtMs: z.number().nullable(),
        deleted: z.boolean(),
        deletedAtMs: z.number().nullable(),
        deletedBy: z.string().nullable(),
        attachments: z.array(attachmentZ).nullable(),
        format: z.union([z.literal('markdown'), z.literal('plaintext')]),
        mentions: z.array(mentionZ).nullable(),
        reactions: z.array(
          z.object({
            emoji: z.string(),
            count: z.number(),
            userIds: z.array(z.string()),
          })
        ).nullable(),
        parentMessageId: z.string().nullable(),
        threadRootId: z.string().nullable(),
        isThreadRoot: z.boolean(),
        threadReplyCount: z.number().nullable(),
        threadLastReplyAtMs: z.number().nullable(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let upserted = 0

    for (const message of args.messages) {
      const existing = await ctx.db
        .query('collaborationMessages')
        .withIndex('by_workspace_legacyId', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('legacyId', message.legacyId)
        )
        .unique()

      const hydratedAttachments = await hydrateAttachments(ctx, message.attachments ?? null)

      const payload = {
        workspaceId: args.workspaceId,
        legacyId: message.legacyId,
        channelId: message.channelId ?? null,
        channelType: message.channelType,
        clientId: message.clientId,
        projectId: message.projectId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        content: message.content,
        createdAtMs: message.createdAtMs,
        updatedAtMs: message.updatedAtMs,
        deleted: message.deleted,
        deletedAtMs: message.deletedAtMs,
        deletedBy: message.deletedBy,
        attachments: hydratedAttachments,
        format: message.format,
        mentions: message.mentions,
        reactions: message.reactions,
        parentMessageId: message.parentMessageId,
        threadRootId: message.threadRootId,
        isThreadRoot: message.isThreadRoot,
        threadReplyCount: message.threadReplyCount,
        threadLastReplyAtMs: message.threadLastReplyAtMs,
        readBy: [],
        deliveredTo: [],
        isPinned: false,
        pinnedAtMs: null,
        pinnedBy: null,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('collaborationMessages', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})

// Mark a message as delivered to a user (called when message is received)
export const markAsDelivered = zWorkspaceMutation({
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

    // Don't mark own messages as delivered
    if (row.senderId === currentUserId) {
      return { success: true, alreadyDelivered: true }
    }

    const deliveredTo: string[] = Array.isArray(row.deliveredTo) ? row.deliveredTo : []

    // Check if already delivered
    if (deliveredTo.includes(currentUserId)) {
      return { success: true, alreadyDelivered: true }
    }

    // Add user to deliveredTo array
    await ctx.db.patch(row._id, {
      deliveredTo: [...deliveredTo, currentUserId],
      updatedAtMs: ctx.now,
    })

    return { success: true, alreadyDelivered: false }
  },
})

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

// List pinned messages for a channel
export const listPinnedMessages = zWorkspaceQuery({
  args: {
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
  },
  handler: async (ctx, args) => {
    const scope = normalizeChannelScope({
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
    })
    await assertChannelAccess(ctx, args.workspaceId, scope)

    const q = buildListChannelQuery(ctx, {
      workspaceId: args.workspaceId,
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
    })
    const allMessages = await q.take(200)

    // Filter for pinned messages and sort by pinnedAt
    const pinnedMessages = allMessages
      .filter((m) => m.isPinned && !m.deleted)
      .sort((a, b) => {
        const aPinnedAt = a.pinnedAtMs ?? 0
        const bPinnedAt = b.pinnedAtMs ?? 0
        return bPinnedAt - aPinnedAt // Most recently pinned first
      })

    return await Promise.all(pinnedMessages.map((row) => hydrateMessageRow(ctx, row)))
  },
})
