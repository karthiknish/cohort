import { z } from 'zod/v4'
import {
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
  zWorkspacePaginatedQueryActive,
} from './functions'

export const listInboxItems = zWorkspacePaginatedQueryActive({
  args: {
    sourceType: z.enum(['direct_message', 'channel', 'email']).optional(),
    includeArchived: z.boolean().optional(),
    onlyUnread: z.boolean().optional(),
    onlyPinned: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    
    const q = ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_user_updatedAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId)
      )

    const rows = await q.order('desc').collect()

    const filtered = rows.filter((item) => {
      if (args.sourceType && item.sourceType !== args.sourceType) return false
      if (!args.includeArchived && item.archived) return false
      if (args.onlyUnread && item.isRead) return false
      if (args.onlyPinned && !item.pinned) return false
      return true
    })

    const limit = typeof args.limit === 'number' ? args.limit : 50
    const rawOffset = args.cursor?.fieldValue
    const parsedOffset = typeof rawOffset === 'number' ? rawOffset : Number.parseInt(String(rawOffset ?? '0'), 10)
    const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? Math.trunc(parsedOffset) : 0
    const items = filtered.slice(offset, offset + limit + 1)
    const hasMore = items.length > limit
    const visibleItems = items.slice(0, limit)
    const lastVisibleItem = visibleItems[visibleItems.length - 1]

    return {
      items: visibleItems.map((item) => ({
        _id: item._id,
        legacyId: item.legacyId,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        clientId: item.clientId,
        projectId: item.projectId,
        otherParticipantId: item.otherParticipantId,
        otherParticipantName: item.otherParticipantName,
        lastMessageSnippet: item.lastMessageSnippet,
        lastMessageAtMs: item.lastMessageAtMs,
        lastMessageSenderId: item.lastMessageSenderId,
        lastMessageSenderName: item.lastMessageSenderName,
        unreadCount: item.unreadCount,
        isRead: item.isRead,
        lastReadAtMs: item.lastReadAtMs,
        pinned: item.pinned,
        pinnedAtMs: item.pinnedAtMs,
        archived: item.archived,
        archivedAtMs: item.archivedAtMs,
        muted: item.muted,
        mutedAtMs: item.mutedAtMs,
        assignedToId: item.assignedToId,
        assignedToName: item.assignedToName,
        priority: item.priority,
        createdAtMs: item.createdAtMs,
        updatedAtMs: item.updatedAtMs,
      })),
      nextCursor: hasMore && lastVisibleItem
        ? { fieldValue: offset + limit, legacyId: lastVisibleItem.legacyId }
        : null,
    }
  },
})

export const getUnreadCounts = zWorkspaceQueryActive({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const items = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_user_unread', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId).eq('isRead', false)
      )
      .collect()

    const counts: Record<string, number> = {
      direct_message: 0,
      channel: 0,
      email: 0,
    }

    for (const item of items) {
      if (item.sourceType in counts) {
        const key = item.sourceType as keyof typeof counts
        counts[key] = (counts[key] ?? 0) + item.unreadCount
      }
    }

    return {
      bySource: counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    }
  },
})

export const markInboxItemRead = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.inboxItemLegacyId)
      )
      .first()

    if (!item) return { success: false }

    const now = Date.now()
    await ctx.db.patch(item._id, {
      isRead: true,
      unreadCount: 0,
      lastReadAtMs: now,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const setInboxItemArchived = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    archived: z.boolean(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.inboxItemLegacyId)
      )
      .first()

    if (!item) return { success: false }

    const now = Date.now()
    await ctx.db.patch(item._id, {
      archived: args.archived,
      archivedAtMs: args.archived ? now : null,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const setInboxItemPinned = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    pinned: z.boolean(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.inboxItemLegacyId)
      )
      .first()

    if (!item) return { success: false }

    const now = Date.now()
    await ctx.db.patch(item._id, {
      pinned: args.pinned,
      pinnedAtMs: args.pinned ? now : null,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const setInboxItemMuted = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    muted: z.boolean(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.inboxItemLegacyId)
      )
      .first()

    if (!item) return { success: false }

    const now = Date.now()
    await ctx.db.patch(item._id, {
      muted: args.muted,
      mutedAtMs: args.muted ? now : null,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const assignInboxItem = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    assignedToId: z.string(),
    assignedToName: z.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.inboxItemLegacyId)
      )
      .first()

    if (!item) return { success: false }

    const now = Date.now()
    await ctx.db.patch(item._id, {
      assignedToId: args.assignedToId,
      assignedToName: args.assignedToName,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const setInboxItemPriority = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query('inboxItems')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.inboxItemLegacyId)
      )
      .first()

    if (!item) return { success: false }

    const now = Date.now()
    await ctx.db.patch(item._id, {
      priority: args.priority,
      updatedAtMs: now,
    })

    return { success: true }
  },
})
