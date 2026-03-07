import { internal } from '../_generated/api'

import {
  attachmentZ,
  assertAccessToMessage,
  assertChannelAccess,
  canManageMessage,
  Errors,
  hydrateAttachments,
  mentionZ,
  normalizeChannelScope,
  requireActorUserId,
  resolveChannelKeyFromScope,
  z,
  zWorkspaceMutation,
} from './shared'

export const create = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable(),
    projectId: z.string().nullable(),
    senderId: z.string().nullable(),
    senderName: z.string(),
    senderRole: z.string().nullable(),
    content: z.string(),
    attachments: z.array(attachmentZ).optional(),
    format: z.union([z.literal('markdown'), z.literal('plaintext')]).optional(),
    mentions: z.array(mentionZ).optional(),
    parentMessageId: z.string().nullable().optional(),
    threadRootId: z.string().nullable().optional(),
    isThreadRoot: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.senderId)
    const normalizedScope = normalizeChannelScope({
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
    })
    await assertChannelAccess(ctx, args.workspaceId, normalizedScope)
    const normalizedThreadRootId =
      args.isThreadRoot === false
        ? (typeof args.threadRootId === 'string' && args.threadRootId.trim().length > 0
            ? args.threadRootId.trim()
            : (typeof args.parentMessageId === 'string' && args.parentMessageId.trim().length > 0
                ? args.parentMessageId.trim()
                : null))
        : null

    const senderName =
      typeof ctx?.user?.name === 'string' && ctx.user.name.trim().length > 0
        ? ctx.user.name
        : args.senderName
    const senderRole = typeof ctx?.user?.role === 'string' ? ctx.user.role : (args.senderRole ?? null)

    const hydratedAttachments = await hydrateAttachments(ctx, args.attachments ?? null)

    await ctx.db.insert('collaborationMessages', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      channelId: normalizedScope.channelId,
      channelType: normalizedScope.channelType,
      clientId: normalizedScope.clientId,
      projectId: normalizedScope.projectId,
      senderId: currentUserId,
      senderName,
      senderRole,
      content: args.content,
      createdAtMs: ctx.now,
      updatedAtMs: null,
      deleted: false,
      deletedAtMs: null,
      deletedBy: null,
      attachments: hydratedAttachments ?? null,
      format: args.format ?? 'markdown',
      mentions: args.mentions ?? null,
      reactions: null,
      parentMessageId: args.parentMessageId ?? null,
      threadRootId: normalizedThreadRootId,
      isThreadRoot: args.isThreadRoot ?? true,
      threadReplyCount: null,
      threadLastReplyAtMs: null,
      readBy: [], // Initialize empty readBy array
      deliveredTo: [], // Initialize empty deliveredTo array
      isPinned: false, // Initialize pinned state
      pinnedAtMs: null, // Initialize pinnedAt
      pinnedBy: null, // Initialize pinnedBy
      sharedTo: null, // Initialize sharedTo as null
    })

    if (args.isThreadRoot === false && typeof normalizedThreadRootId === 'string' && normalizedThreadRootId) {
      const root = await ctx.db
        .query('collaborationMessages')
        .withIndex('by_workspace_legacyId', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('legacyId', normalizedThreadRootId),
        )
        .unique()

      if (root) {
        const currentCount = typeof root.threadReplyCount === 'number' ? root.threadReplyCount : 0
        await ctx.db.patch(root._id, {
          threadReplyCount: currentCount + 1,
          threadLastReplyAtMs: ctx.now,
          updatedAtMs: ctx.now,
        })
      }
    }

    const nowMs = ctx.now
    const content = typeof args.content === 'string' ? args.content : ''
    const snippet = content.length > 200 ? `${content.slice(0, 197)}...` : content
    const preview = senderName ? `${senderName}: ${snippet || '(no message content)'}` : (snippet || '(no message content)')

    const isClientChannel = normalizedScope.channelType === 'client'
    const isProjectChannel = normalizedScope.channelType === 'project'
    const clientId = normalizedScope.clientId
    const channelId = resolveChannelKeyFromScope(normalizedScope)

    const baseRoles = channelId ? [] : clientId ? ['admin', 'team', 'client'] : ['admin', 'team']

    const messageTitle = isClientChannel
      ? 'Client channel update'
      : isProjectChannel
        ? 'Project channel update'
        : 'New collaboration message'

    await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
      workspaceId: args.workspaceId,
      legacyId: `collab:${args.legacyId}`,
      kind: 'collaboration.message',
      title: messageTitle,
      body: preview,
      actorId: currentUserId,
      actorName: senderName ?? null,
      resourceType: 'collaboration',
      resourceId: args.legacyId,
      recipientRoles: baseRoles,
      recipientClientId: clientId,
      recipientClientIds: clientId ? [clientId] : undefined,
      metadata: {
        channelType: normalizedScope.channelType,
        channelId,
        clientId,
        messageId: args.legacyId,
        parentMessageId: args.parentMessageId ?? null,
        threadRootId: normalizedThreadRootId,
        senderId: currentUserId,
        senderRole: senderRole ?? null,
        projectId: normalizedScope.projectId,
      },
      createdAtMs: nowMs,
      updatedAtMs: nowMs,
    })

    const mentions = Array.isArray(args.mentions) ? args.mentions : []
    for (const mention of mentions) {
      if (!mention || typeof mention !== 'object') continue
      const mentionSlug = typeof mention.slug === 'string' ? mention.slug : ''
      const mentionName = typeof mention.name === 'string' ? mention.name : ''
      if (!mentionSlug) continue

      const mentionSnippet = content.length > 150 ? `${content.slice(0, 147)}…` : content

      await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
        workspaceId: args.workspaceId,
        legacyId: `collab:${args.legacyId}:mention:${mentionSlug}`,
        kind: 'collaboration.mention',
        title: `${senderName ?? 'Someone'} mentioned you`,
        body: mentionSnippet || '(no message content)',
        actorId: currentUserId,
        actorName: senderName ?? null,
        resourceType: 'collaboration',
        resourceId: args.legacyId,
        recipientRoles: channelId ? [] : ['admin', 'team', 'client'],
        recipientClientId: clientId,
        recipientClientIds: clientId ? [clientId] : undefined,
        metadata: {
          channelType: normalizedScope.channelType,
          channelId,
          clientId,
          messageId: args.legacyId,
          parentMessageId: args.parentMessageId ?? null,
          threadRootId: normalizedThreadRootId,
          senderId: currentUserId,
          senderName: senderName ?? null,
          mentionedName: mentionName,
          mentionSlug,
          projectId: normalizedScope.projectId,
        },
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
      })
    }

    return args.legacyId
  },
})

export const updateMessage = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    content: z.string(),
    format: z.union([z.literal('markdown'), z.literal('plaintext')]).optional(),
    mentions: z.array(mentionZ).optional(),
  },
  handler: async (ctx, args) => {
    const row = await assertAccessToMessage(
      ctx,
      args.workspaceId,
      await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique(),
    )

    if (!canManageMessage(ctx, row)) {
      throw Errors.auth.forbidden('You can only edit your own messages')
    }

    await ctx.db.patch(row._id, {
      content: args.content,
      ...(args.format !== undefined ? { format: args.format } : {}),
      ...(args.mentions !== undefined ? { mentions: args.mentions } : {}),
      updatedAtMs: ctx.now,
    })

    return args.legacyId
  },
})

export const softDelete = zWorkspaceMutation({
  args: { legacyId: z.string(), deletedBy: z.string() },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.deletedBy)

    const row = await assertAccessToMessage(
      ctx,
      args.workspaceId,
      await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique(),
    )

    if (!canManageMessage(ctx, row)) {
      throw Errors.auth.forbidden('You can only delete your own messages')
    }

    await ctx.db.patch(row._id, {
      deleted: true,
      deletedAtMs: ctx.now,
      deletedBy: currentUserId,
      updatedAtMs: ctx.now,
    })

    return args.legacyId
  },
})

export const updateSharedTo = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    sharedTo: z.array(z.literal('email')),
  },
  handler: async (ctx, args) => {
    const row = await assertAccessToMessage(
      ctx,
      args.workspaceId,
      await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique(),
    )

    if (!canManageMessage(ctx, row)) {
      throw Errors.auth.forbidden('Only the sender or an admin can update sharing')
    }

    await ctx.db.patch(row._id, {
      sharedTo: args.sharedTo,
      updatedAtMs: ctx.now,
    })

    return args.legacyId
  },
})

export const toggleReaction = zWorkspaceMutation({
  args: { legacyId: z.string(), emoji: z.string(), userId: z.string() },
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

    const reactions = Array.isArray(row.reactions) ? row.reactions.slice() : []

    const updated: Array<{ emoji: string; count: number; userIds: string[] }> = []
    let reactionFound = false

    for (const entry of reactions) {
      if (!entry || typeof entry !== 'object') continue
      const emoji = typeof entry.emoji === 'string' ? entry.emoji : null
      if (!emoji) continue

      const userIds: string[] = Array.isArray(entry.userIds)
        ? entry.userIds.filter((v): v is string => typeof v === 'string')
        : []
      const fallbackCount = typeof entry.count === 'number' ? entry.count : userIds.length

      if (emoji !== args.emoji) {
        updated.push({ emoji, count: userIds.length > 0 ? userIds.length : fallbackCount, userIds })
        continue
      }

      reactionFound = true
      const existingUsers = Array.from(new Set(userIds))
      const hasReacted = existingUsers.includes(currentUserId)
      const nextUsers: string[] = hasReacted
        ? existingUsers.filter((id) => id !== currentUserId)
        : [...existingUsers, currentUserId]

      if (nextUsers.length === 0) {
        continue
      }

      updated.push({ emoji: args.emoji, count: nextUsers.length, userIds: nextUsers })
    }

    if (!reactionFound) {
      updated.push({ emoji: args.emoji, count: 1, userIds: [currentUserId] })
    }

    await ctx.db.patch(row._id, {
      reactions: updated,
      updatedAtMs: ctx.now,
    })

    return updated
  },
})

// Mark a single message as read by a user
