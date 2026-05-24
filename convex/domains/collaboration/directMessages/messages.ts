import { z } from 'zod/v4'
import { Errors } from '../../../errors'
import {
  zWorkspaceMutation,
  zWorkspacePaginatedQueryActive,
  zWorkspaceQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from '../../../functions'
import {
  attachmentZ,
  canManageDirectMessage,
  clampSearchLimit,
  generateLegacyId,
  hydrateMessageRow,
  normalizeSearchValue,
  tokenizeSearchValue,
} from './shared'

export const listMessages = zWorkspacePaginatedQueryActive({
  args: {
    conversationLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query('directMessages')
      .withIndex('by_workspace_conversation_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', args.conversationLegacyId)
      )
      .order('desc')

    q = applyManualPagination(q, args.cursor)

    const limit = args.limit ?? 50
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')
    const items = await Promise.all(result.items.map((row) => hydrateMessageRow(ctx, row)))

    return {
      items: items.map((msg) => ({
        _id: msg._id,
        legacyId: msg.legacyId,
        conversationLegacyId: args.conversationLegacyId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        content: msg.content,
        edited: msg.edited,
        editedAtMs: msg.editedAtMs,
        deleted: msg.deleted,
        deletedAtMs: msg.deletedAtMs,
        deletedBy: msg.deletedBy,
        attachments: msg.attachments,
        reactions: msg.reactions,
        readBy: msg.readBy,
        deliveredTo: msg.deliveredTo,
        readAtMs: msg.readAtMs,
        sharedTo: msg.sharedTo,
        createdAtMs: msg.createdAtMs,
        updatedAtMs: msg.updatedAtMs,
      })),
      nextCursor: result.nextCursor,
    }
  },
})

export const searchMessages = zWorkspaceQueryActive({
  args: {
    conversationLegacyId: z.string(),
    q: z.string().nullable().optional(),
    sender: z.string().nullable().optional(),
    attachment: z.string().nullable().optional(),
    startMs: z.number().nullable().optional(),
    endMs: z.number().nullable().optional(),
    limit: z.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const conversation = await ctx.db
      .query('directConversations')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationLegacyId)
      )
      .first()

    if (!conversation) {
      throw Errors.resource.notFound('Conversation')
    }

    const isParticipant =
      conversation.participantOneId === currentUserId ||
      conversation.participantTwoId === currentUserId

    if (!isParticipant) {
      throw Errors.auth.forbidden()
    }

    const limit = clampSearchLimit(args.limit)
    const startMs = typeof args.startMs === 'number' && Number.isFinite(args.startMs) ? args.startMs : null
    const endMs = typeof args.endMs === 'number' && Number.isFinite(args.endMs) ? args.endMs : null
    const searchTerms = tokenizeSearchValue(args.q)
    const senderTerm = normalizeSearchValue(args.sender) || null
    const attachmentTerm = normalizeSearchValue(args.attachment) || null

    const rows = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_conversation_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', args.conversationLegacyId)
      )
      .order('desc')
      .collect()

    const filtered = rows
      .filter((row) => {
        if (row.deleted) return false
        if (startMs !== null && row.createdAtMs < startMs) return false
        if (endMs !== null && row.createdAtMs > endMs) return false

        const senderName = normalizeSearchValue(row.senderName)
        if (senderTerm && !senderName.includes(senderTerm)) {
          return false
        }

        const attachmentNames = Array.isArray(row.attachments)
          ? row.attachments.map((attachment) => normalizeSearchValue(attachment?.name ?? ''))
          : []
        if (attachmentTerm && !attachmentNames.some((name) => name.includes(attachmentTerm))) {
          return false
        }

        if (searchTerms.length === 0) {
          return true
        }

        const haystacks = [
          normalizeSearchValue(row.content),
          senderName,
          ...attachmentNames,
        ].filter(Boolean)

        return searchTerms.every((term) => haystacks.some((text) => text.includes(term)))
      })
      .slice(0, limit)

    const hydrated = await Promise.all(filtered.map((row) => hydrateMessageRow(ctx, row)))

    return {
      rows: hydrated,
    }
  },
})

export const sendMessage = zWorkspaceMutation({
  args: {
    conversationLegacyId: z.string(),
    content: z.string(),
    attachments: z.array(attachmentZ).nullable().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const currentUserName = ctx.user.name ?? 'Unknown'
    const currentUserRole = ctx.user.role ?? null

    const conversation = await ctx.db
      .query('directConversations')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationLegacyId)
      )
      .first()

    if (!conversation) {
      throw Errors.resource.notFound('Conversation')
    }

    const isParticipant =
      conversation.participantOneId === currentUserId ||
      conversation.participantTwoId === currentUserId

    if (!isParticipant) {
      throw Errors.auth.forbidden()
    }

    const legacyId = generateLegacyId()
    const now = Date.now()
    const snippet = args.content.length > 100 ? args.content.substring(0, 97) + '...' : args.content

    const messageId = await ctx.db.insert('directMessages', {
      workspaceId: args.workspaceId,
      conversationLegacyId: args.conversationLegacyId,
      legacyId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content: args.content,
      edited: false,
      editedAtMs: null,
      deleted: false,
      deletedAtMs: null,
      deletedBy: null,
      attachments: args.attachments ?? null,
      reactions: null,
      readBy: [currentUserId],
      deliveredTo: [currentUserId],
      readAtMs: null,
      sharedTo: null,
      createdAtMs: now,
      updatedAtMs: now,
    })

    const isSenderParticipantOne = conversation.participantOneId === currentUserId
    const recipientUnreadCount = isSenderParticipantOne
      ? (conversation.unreadCountParticipantTwo ?? 0) + 1
      : (conversation.unreadCountParticipantOne ?? 0) + 1

    await ctx.db.patch(conversation._id, {
      lastMessageSnippet: snippet,
      lastMessageAtMs: now,
      lastMessageSenderId: currentUserId,
      readByParticipantOne: isSenderParticipantOne,
      readByParticipantTwo: !isSenderParticipantOne,
      unreadCountParticipantOne: isSenderParticipantOne ? 0 : recipientUnreadCount,
      unreadCountParticipantTwo: isSenderParticipantOne ? recipientUnreadCount : 0,
      updatedAtMs: now,
    })

    return { _id: messageId, legacyId }
  },
})

export const markAsRead = zWorkspaceMutation({
  args: {
    conversationLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const conversation = await ctx.db
      .query('directConversations')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationLegacyId)
      )
      .first()

    if (!conversation) {
      throw Errors.resource.notFound('Conversation')
    }

    const isParticipantOne = conversation.participantOneId === currentUserId
    const isParticipantTwo = conversation.participantTwoId === currentUserId

    if (!isParticipantOne && !isParticipantTwo) {
      throw Errors.auth.forbidden()
    }

    const now = Date.now()
    const updates: Record<string, unknown> = { updatedAtMs: now }

    if (isParticipantOne) {
      updates.readByParticipantOne = true
      updates.unreadCountParticipantOne = 0
      updates.lastReadByParticipantOneAtMs = now
    } else {
      updates.readByParticipantTwo = true
      updates.unreadCountParticipantTwo = 0
      updates.lastReadByParticipantTwoAtMs = now
    }

    await ctx.db.patch(conversation._id, updates)

    const unreadMessages = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_conversation_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', args.conversationLegacyId)
      )
      .filter((q) => q.neq(q.field('senderId'), currentUserId))
      .collect()

    const now2 = Date.now()
    await Promise.all(
      unreadMessages.map(async (msg) => {
        const readBy = Array.isArray(msg.readBy) ? msg.readBy : []
        const readBySet = new Set(readBy)
        if (!readBySet.has(currentUserId)) {
          await ctx.db.patch(msg._id, {
            readBy: [...readBy, currentUserId],
            readAtMs: msg.readAtMs ?? now2,
            updatedAtMs: now2,
          })
        }
      }),
    )

    return { success: true }
  },
})

export const editMessage = zWorkspaceMutation({
  args: {
    messageLegacyId: z.string(),
    newContent: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const message = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.messageLegacyId)
      )
      .first()

    if (!message) {
      throw Errors.resource.notFound('Message')
    }

    if (!canManageDirectMessage(ctx, message)) {
      throw Errors.auth.forbidden()
    }

    if (message.deleted) {
      throw Errors.validation.invalidInput('Cannot edit deleted message')
    }

    const now = Date.now()
    await ctx.db.patch(message._id, {
      content: args.newContent,
      edited: true,
      editedAtMs: now,
      updatedAtMs: now,
    })

    const snippet = args.newContent.length > 100 ? args.newContent.substring(0, 97) + '...' : args.newContent
    const conversation = await ctx.db
      .query('directConversations')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', message.conversationLegacyId)
      )
      .first()

    if (conversation && conversation.lastMessageSenderId === currentUserId) {
      await ctx.db.patch(conversation._id, {
        lastMessageSnippet: snippet,
        updatedAtMs: now,
      })
    }

    return { success: true }
  },
})

export const deleteMessage = zWorkspaceMutation({
  args: {
    messageLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const message = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.messageLegacyId)
      )
      .first()

    if (!message) {
      throw Errors.resource.notFound('Message')
    }

    if (!canManageDirectMessage(ctx, message)) {
      throw Errors.auth.forbidden()
    }

    const now = Date.now()
    await ctx.db.patch(message._id, {
      deleted: true,
      deletedAtMs: now,
      deletedBy: currentUserId,
      updatedAtMs: now,
    })

    return { success: true }
  },
})
