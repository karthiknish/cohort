import { z } from 'zod/v4'
import { Errors } from '../../../errors'
import { zWorkspaceMutation, zWorkspaceQuery, zWorkspaceQueryActive } from '../../../functions'
import { generateLegacyId, sortParticipantIds } from './shared'

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
      unreadCountParticipantOne: 0,
      unreadCountParticipantTwo: 0,
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
      const storedUnreadCount = isParticipantOne
        ? conv.unreadCountParticipantOne
        : conv.unreadCountParticipantTwo
      const unreadCount =
        typeof storedUnreadCount === 'number'
          ? Math.max(0, storedUnreadCount)
          : isRead
            ? 0
            : 1

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
        unreadCount,
        isArchived,
        isMuted,
        createdAtMs: conv.createdAtMs,
        updatedAtMs: conv.updatedAtMs,
      }
    })
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
