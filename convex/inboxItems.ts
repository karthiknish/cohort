import { z } from 'zod/v4'
import type { Doc } from './_generated/dataModel'
import { Errors, isAppError } from './errors'
import {
  applyManualPagination,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
  zWorkspacePaginatedQueryActive,
} from './functions'

type InboxItemRow = Doc<'inboxItems'>

function mapInboxItem(item: InboxItemRow) {
  return {
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
  }
}

function throwInboxItemsError(operation: string, error: unknown, context?: Record<string, unknown>): never {
  console.error(`[inboxItems:${operation}]`, context ?? {}, error)

  if (isAppError(error)) {
    throw error
  }

  throw Errors.base.internal('Inbox item operation failed')
}

function matchesInboxItemFilters(item: InboxItemRow, args: {
  sourceType?: 'direct_message' | 'channel' | 'email'
  includeArchived?: boolean
  onlyUnread?: boolean
  onlyPinned?: boolean
}) {
  if (args.sourceType && item.sourceType !== args.sourceType) return false
  if (args.includeArchived === false && item.archived) return false
  if (args.onlyUnread && item.isRead) return false
  if (args.onlyPinned && !item.pinned) return false
  return true
}

export const listInboxItems = zWorkspacePaginatedQueryActive({
  args: {
    sourceType: z.enum(['direct_message', 'channel', 'email']).optional(),
    includeArchived: z.boolean().optional(),
    onlyUnread: z.boolean().optional(),
    onlyPinned: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    try {
      const currentUserId = ctx.user._id
      const limit = typeof args.limit === 'number' ? args.limit : 50
      const sourceType = args.sourceType

      const baseQuery = args.onlyUnread
        ? ctx.db
            .query('inboxItems')
            .withIndex('by_workspace_user_unread_updatedAtMs_legacyId', (q) =>
              q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId).eq('isRead', false)
            )
            .order('desc')
        : args.onlyPinned
          ? ctx.db
              .query('inboxItems')
              .withIndex('by_workspace_user_pinned_updatedAtMs_legacyId', (q) =>
                q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId).eq('pinned', true)
              )
              .order('desc')
          : args.includeArchived === false
            ? ctx.db
                .query('inboxItems')
                .withIndex('by_workspace_user_archived_updatedAtMs_legacyId', (q) =>
                  q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId).eq('archived', false)
                )
                .order('desc')
            : sourceType
              ? ctx.db
                  .query('inboxItems')
                  .withIndex('by_workspace_user_sourceType_updatedAtMs_legacyId', (q) =>
                    q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId).eq('sourceType', sourceType)
                  )
                  .order('desc')
              : ctx.db
                  .query('inboxItems')
                  .withIndex('by_workspace_user_updatedAtMs_legacyId', (q) =>
                    q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId)
                  )
                  .order('desc')

      const batchSize = Math.min(Math.max(limit * 3, limit + 1), 200)
      const items: InboxItemRow[] = []
      let batchCursor = args.cursor ?? null
      let exhausted = false

      while (items.length < limit + 1 && !exhausted) {
        const batch = await applyManualPagination(baseQuery, batchCursor, 'updatedAtMs', 'desc').take(batchSize)

        if (batch.length === 0) {
          exhausted = true
          break
        }

        for (const item of batch) {
          if (!matchesInboxItemFilters(item, args)) continue
          items.push(item)
          if (items.length >= limit + 1) {
            break
          }
        }

        const lastBatchItem = batch.at(-1) ?? null
        if (!lastBatchItem || batch.length < batchSize) {
          exhausted = true
          break
        }

        batchCursor = { fieldValue: lastBatchItem.updatedAtMs, legacyId: lastBatchItem.legacyId }
      }

      const visibleItems = items.slice(0, limit)
      const lastVisibleItem = visibleItems.at(-1) ?? null
      const nextCursor = items.length > limit && lastVisibleItem
        ? { fieldValue: lastVisibleItem.updatedAtMs, legacyId: lastVisibleItem.legacyId }
        : null

      return {
        items: visibleItems.map(mapInboxItem),
        nextCursor,
      }
    } catch (error) {
      throwInboxItemsError('listInboxItems', error, {
        workspaceId: args.workspaceId,
        userId: ctx.user._id,
        sourceType: args.sourceType ?? null,
        includeArchived: args.includeArchived ?? null,
        onlyUnread: args.onlyUnread ?? false,
        onlyPinned: args.onlyPinned ?? false,
      })
    }
  },
})

export const getUnreadCounts = zWorkspaceQueryActive({
  args: {},
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('getUnreadCounts', error, { workspaceId: args.workspaceId, userId: ctx.user._id })
    }
  },
})

export const markInboxItemRead = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('markInboxItemRead', error, {
        workspaceId: args.workspaceId,
        inboxItemLegacyId: args.inboxItemLegacyId,
      })
    }
  },
})

export const setInboxItemArchived = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    archived: z.boolean(),
  },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('setInboxItemArchived', error, {
        workspaceId: args.workspaceId,
        inboxItemLegacyId: args.inboxItemLegacyId,
        archived: args.archived,
      })
    }
  },
})

export const setInboxItemPinned = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    pinned: z.boolean(),
  },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('setInboxItemPinned', error, {
        workspaceId: args.workspaceId,
        inboxItemLegacyId: args.inboxItemLegacyId,
        pinned: args.pinned,
      })
    }
  },
})

export const setInboxItemMuted = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    muted: z.boolean(),
  },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('setInboxItemMuted', error, {
        workspaceId: args.workspaceId,
        inboxItemLegacyId: args.inboxItemLegacyId,
        muted: args.muted,
      })
    }
  },
})

export const assignInboxItem = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    assignedToId: z.string(),
    assignedToName: z.string(),
  },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('assignInboxItem', error, {
        workspaceId: args.workspaceId,
        inboxItemLegacyId: args.inboxItemLegacyId,
        assignedToId: args.assignedToId,
      })
    }
  },
})

export const setInboxItemPriority = zWorkspaceMutation({
  args: {
    inboxItemLegacyId: z.string(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
  },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwInboxItemsError('setInboxItemPriority', error, {
        workspaceId: args.workspaceId,
        inboxItemLegacyId: args.inboxItemLegacyId,
        priority: args.priority,
      })
    }
  },
})
