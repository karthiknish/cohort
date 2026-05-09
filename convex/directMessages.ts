import { z } from 'zod/v4'
import type { Id } from '/_generated/dataModel'
import { Errors } from './errors'
import {
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
} from './functions'

function generateLegacyId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

function sortParticipantIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1]
}

function clampSearchLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 100
  return Math.min(Math.max(Math.trunc(limit), 20), 400)
}

function normalizeSearchValue(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function tokenizeSearchValue(value: string | null | undefined): string[] {
  return normalizeSearchValue(value).split(/\s+/).filter(Boolean)
}

async function hydrateAttachments(
  ctx: { storage: { getUrl: (id: Id<'_storage'>) => Promise<string | null> } },
  attachments: Array<{ name: string; url: string; storageId?: string | null; type?: string | null; size?: string | null }> | null,
) {
  if (!Array.isArray(attachments) || attachments.length === 0) return attachments

  const next = await Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment || typeof attachment !== 'object') return attachment
      const storageId = attachment.storageId
      if (typeof storageId !== 'string' || storageId.length === 0) return attachment

      const url = await ctx.storage.getUrl(storageId as Id<'_storage'>)
      return {
        ...attachment,
        url: url ?? attachment.url,
      }
    }),
  )

  return next
}

async function hydrateMessageRow<TRow extends { attachments?: Array<{ name: string; url: string; storageId?: string | null; type?: string | null; size?: string | null }> | null }>(
  ctx: { storage: { getUrl: (id: Id<'_storage'>) => Promise<string | null> } },
  row: TRow,
): Promise<TRow> {
  const attachments = Array.isArray(row.attachments) ? row.attachments : null
  const hydrated = await hydrateAttachments(ctx, attachments)
  if (hydrated === attachments) return row
  return { ...row, attachments: hydrated }
}

const attachmentZ = z.object({
  name: z.string(),
  url: z.string(),
  storageId: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
})

export const getOrCreateConversation = zWorkspaceMutation({
  args: {
    otherUserId: z.string(),
    otherUserName: z.string(),
    otherUserRole: z.string().nullable().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const currentUserName = ctx.user.name ?? 'Unknown'
    const currentUserRole = ctx.user.role ?? null

    const [participantOneId, participantTwoId] = sortParticipantIds(currentUserId, args.otherUserId)
    
    const existing = await ctx.db
      .query('directConversations')
      .withIndex('by_workspace_participantOne_participantTwo', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('participantOneId', participantOneId).eq('participantTwoId', participantTwoId)
      )
      .first()

    if (existing) {
      return { _id: existing._id, legacyId: existing.legacyId, isNew: false }
    }

    const legacyId = generateLegacyId()
    const now = Date.now()

    const participantOneName = participantOneId === currentUserId ? currentUserName : args.otherUserName
    const participantOneRole = participantOneId === currentUserId ? currentUserRole : (args.otherUserRole ?? null)
    const participantTwoName = participantTwoId === currentUserId ? currentUserName : args.otherUserName
    const participantTwoRole = participantTwoId === currentUserId ? currentUserRole : (args.otherUserRole ?? null)

    const conversationId = await ctx.db.insert('directConversations', {
      workspaceId: args.workspaceId,
      legacyId,
      participantOneId,
      participantOneName,
      participantOneRole,
      participantTwoId,
      participantTwoName,
      participantTwoRole,
      lastMessageSnippet: null,
      lastMessageAtMs: null,
      lastMessageSenderId: null,
      readByParticipantOne: true,
      readByParticipantTwo: true,
      lastReadByParticipantOneAtMs: now,
      lastReadByParticipantTwoAtMs: now,
      archivedByParticipantOne: false,
      archivedByParticipantTwo: false,
      mutedByParticipantOne: false,
      mutedByParticipantTwo: false,
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: conversationId, legacyId, isNew: true }
  },
})

export const listConversations = zWorkspaceQueryActive({
  args: {
    includeArchived: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const [asParticipantOne, asParticipantTwo] = await Promise.all([
      ctx.db
        .query('directConversations')
        .withIndex('by_workspace_participantOne_updatedAtMs', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('participantOneId', currentUserId)
        )
        .order('desc')
        .collect(),
      ctx.db
        .query('directConversations')
        .withIndex('by_workspace_participantTwo_updatedAtMs', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('participantTwoId', currentUserId)
        )
        .order('desc')
        .collect(),
    ])

    const allConversations = [...asParticipantOne, ...asParticipantTwo]
      .filter((conv) => {
        if (args.includeArchived) return true
        if (conv.participantOneId === currentUserId && conv.archivedByParticipantOne) return false
        if (conv.participantTwoId === currentUserId && conv.archivedByParticipantTwo) return false
        return true
      })
      .sort((a, b) => (b.updatedAtMs ?? 0) - (a.updatedAtMs ?? 0))

    return allConversations.map((conv) => {
      const isParticipantOne = conv.participantOneId === currentUserId
      const otherParticipantId = isParticipantOne ? conv.participantTwoId : conv.participantOneId
      const otherParticipantName = isParticipantOne ? conv.participantTwoName : conv.participantOneName
      const otherParticipantRole = isParticipantOne ? conv.participantTwoRole : conv.participantOneRole
      const isRead = isParticipantOne ? conv.readByParticipantOne : conv.readByParticipantTwo
      const isArchived = isParticipantOne ? conv.archivedByParticipantOne : conv.archivedByParticipantTwo
      const isMuted = isParticipantOne ? conv.mutedByParticipantOne : conv.mutedByParticipantTwo

      return {
        _id: conv._id,
        legacyId: conv.legacyId,
        otherParticipantId,
        otherParticipantName,
        otherParticipantRole,
        lastMessageSnippet: conv.lastMessageSnippet,
        lastMessageAtMs: conv.lastMessageAtMs,
        lastMessageSenderId: conv.lastMessageSenderId,
        isRead,
        isArchived,
        isMuted,
        createdAtMs: conv.createdAtMs,
        updatedAtMs: conv.updatedAtMs,
      }
    })
  },
})

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
    await ctx.db.patch(conversation._id, {
      lastMessageSnippet: snippet,
      lastMessageAtMs: now,
      lastMessageSenderId: currentUserId,
      readByParticipantOne: isSenderParticipantOne,
      readByParticipantTwo: !isSenderParticipantOne,
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
      updates.lastReadByParticipantOneAtMs = now
    } else {
      updates.readByParticipantTwo = true
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
    for (const msg of unreadMessages) {
      const readBy = Array.isArray(msg.readBy) ? msg.readBy : []
      const readBySet = new Set(readBy)
      if (!readBySet.has(currentUserId)) {
        await ctx.db.patch(msg._id, {
          readBy: [...readBy, currentUserId],
          readAtMs: msg.readAtMs ?? now2,
          updatedAtMs: now2,
        })
      }
    }

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

    if (message.senderId !== currentUserId) {
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

    if (message.senderId !== currentUserId) {
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

export const toggleReaction = zWorkspaceMutation({
  args: {
    messageLegacyId: z.string(),
    emoji: z.string(),
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

    if (message.deleted) {
      throw Errors.validation.invalidInput('Cannot react to deleted message')
    }

    const reactions = Array.isArray(message.reactions)
      ? message.reactions
          .filter(
            (reaction): reaction is { emoji: string; count: number; userIds: string[] } =>
              Boolean(reaction) &&
              typeof reaction.emoji === 'string' &&
              typeof reaction.count === 'number' &&
              Array.isArray(reaction.userIds),
          )
          .map((reaction) => ({ ...reaction, userIds: [...reaction.userIds] }))
      : []
    const existingIndex = reactions.findIndex((r) => r.emoji === args.emoji)
    const now = Date.now()

    if (existingIndex >= 0) {
      const reaction = reactions[existingIndex]
      if (!reaction) {
        return { success: true }
      }

      const userIds = Array.isArray(reaction.userIds) ? reaction.userIds : []
      
      if (userIds.includes(currentUserId)) {
        const newUserIds = userIds.filter((id: string) => id !== currentUserId)
        if (newUserIds.length === 0) {
          reactions.splice(existingIndex, 1)
        } else {
          reactions[existingIndex] = { ...reaction, count: newUserIds.length, userIds: newUserIds }
        }
      } else {
        reactions[existingIndex] = { ...reaction, count: reaction.count + 1, userIds: [...userIds, currentUserId] }
      }
    } else {
      reactions.push({ emoji: args.emoji, count: 1, userIds: [currentUserId] })
    }

    await ctx.db.patch(message._id, {
      reactions,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const setArchiveStatus = zWorkspaceMutation({
  args: {
    conversationLegacyId: z.string(),
    archived: z.boolean(),
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
      updates.archivedByParticipantOne = args.archived
    } else {
      updates.archivedByParticipantTwo = args.archived
    }

    await ctx.db.patch(conversation._id, updates)

    return { success: true }
  },
})

export const setMuteStatus = zWorkspaceMutation({
  args: {
    conversationLegacyId: z.string(),
    muted: z.boolean(),
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
      updates.mutedByParticipantOne = args.muted
    } else {
      updates.mutedByParticipantTwo = args.muted
    }

    await ctx.db.patch(conversation._id, updates)

    return { success: true }
  },
})

export const getUnreadCount = zWorkspaceQuery({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const [asParticipantOne, asParticipantTwo] = await Promise.all([
      ctx.db
        .query('directConversations')
        .withIndex('by_workspace_participantOne_read_updatedAtMs', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('participantOneId', currentUserId).eq('readByParticipantOne', false)
        )
        .collect(),
      ctx.db
        .query('directConversations')
        .withIndex('by_workspace_participantTwo_read_updatedAtMs', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('participantTwoId', currentUserId).eq('readByParticipantTwo', false)
        )
        .collect(),
    ])

    return asParticipantOne.length + asParticipantTwo.length
  },
})
