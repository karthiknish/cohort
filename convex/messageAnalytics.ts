import { z } from 'zod/v4'
import {
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
} from './functions'

function generateLegacyId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export const recordMessageSent = zWorkspaceMutation({
  args: {
    conversationType: z.enum(['direct', 'channel', 'thread']),
    conversationId: z.string(),
    messageId: z.string(),
    channelType: z.string().optional(),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const legacyId = generateLegacyId()
    const now = Date.now()

    const analyticsId = await ctx.db.insert('messageAnalytics', {
      workspaceId: args.workspaceId,
      legacyId,
      conversationType: args.conversationType,
      conversationId: args.conversationId,
      messageId: args.messageId,
      senderId: currentUserId,
      firstReadAtMs: null,
      firstResponseAtMs: null,
      responseTimeMs: null,
      timeToReadMs: null,
      reactionCount: 0,
      replyCount: 0,
      shareCount: 0,
      deliveryAttempts: 1,
      deliveryStatus: 'pending',
      deliveredAtMs: null,
      channelType: args.channelType ?? null,
      clientId: args.clientId ?? null,
      projectId: args.projectId ?? null,
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: analyticsId, legacyId }
  },
})

export const recordMessageRead = zWorkspaceMutation({
  args: {
    messageId: z.string(),
    readerId: z.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.messageId)
      )
      .first()

    if (!analytics) return { success: false }
    if (analytics.firstReadAtMs) return { success: true }

    const now = Date.now()
    const timeToRead = now - analytics.createdAtMs

    await ctx.db.patch(analytics._id, {
      firstReadAtMs: now,
      timeToReadMs: timeToRead,
      updatedAtMs: now,
    })

    return { success: true, timeToReadMs: timeToRead }
  },
})

export const recordMessageResponse = zWorkspaceMutation({
  args: {
    originalMessageId: z.string(),
    responseMessageId: z.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.originalMessageId)
      )
      .first()

    if (!analytics) return { success: false }
    if (analytics.firstResponseAtMs) return { success: true }

    const now = Date.now()
    const responseTime = now - analytics.createdAtMs

    await ctx.db.patch(analytics._id, {
      firstResponseAtMs: now,
      responseTimeMs: responseTime,
      updatedAtMs: now,
    })

    return { success: true, responseTimeMs: responseTime }
  },
})

export const incrementReactionCount = zWorkspaceMutation({
  args: {
    messageId: z.string(),
    delta: z.number(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.messageId)
      )
      .first()

    if (!analytics) return { success: false }

    const newCount = Math.max(0, analytics.reactionCount + args.delta)
    await ctx.db.patch(analytics._id, {
      reactionCount: newCount,
      updatedAtMs: Date.now(),
    })

    return { success: true, reactionCount: newCount }
  },
})

export const incrementReplyCount = zWorkspaceMutation({
  args: {
    messageId: z.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.messageId)
      )
      .first()

    if (!analytics) return { success: false }

    const newCount = analytics.replyCount + 1
    await ctx.db.patch(analytics._id, {
      replyCount: newCount,
      updatedAtMs: Date.now(),
    })

    return { success: true, replyCount: newCount }
  },
})

export const incrementShareCount = zWorkspaceMutation({
  args: {
    messageId: z.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.messageId)
      )
      .first()

    if (!analytics) return { success: false }

    const newCount = analytics.shareCount + 1
    await ctx.db.patch(analytics._id, {
      shareCount: newCount,
      updatedAtMs: Date.now(),
    })

    return { success: true, shareCount: newCount }
  },
})

export const updateDeliveryStatus = zWorkspaceMutation({
  args: {
    messageId: z.string(),
    status: z.enum(['pending', 'delivered', 'failed']),
    attempts: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.messageId)
      )
      .first()

    if (!analytics) return { success: false }

    const now = Date.now()
    await ctx.db.patch(analytics._id, {
      deliveryStatus: args.status,
      deliveryAttempts: args.attempts ?? analytics.deliveryAttempts,
      deliveredAtMs: args.status === 'delivered' ? now : null,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const getConversationAnalytics = zWorkspaceQuery({
  args: {
    conversationId: z.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_conversation_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationId', args.conversationId)
      )
      .order('desc')
      .take(100)

    return items.map((item) => ({
      _id: item._id,
      legacyId: item.legacyId,
      messageId: item.messageId,
      senderId: item.senderId,
      responseTimeMs: item.responseTimeMs,
      timeToReadMs: item.timeToReadMs,
      reactionCount: item.reactionCount,
      replyCount: item.replyCount,
      shareCount: item.shareCount,
      deliveryStatus: item.deliveryStatus,
      createdAtMs: item.createdAtMs,
    }))
  },
})

export const getUserAnalytics = zWorkspaceQueryActive({
  args: {
    days: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const days = args.days ?? 30
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000

    const items = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_sender_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('senderId', currentUserId)
      )
      .filter((q) => q.gte(q.field('createdAtMs'), cutoffMs))
      .collect()

    const stats = {
      totalMessages: items.length,
      avgResponseTimeMs: 0,
      avgReadTimeMs: 0,
      totalReactions: 0,
      totalReplies: 0,
      totalShares: 0,
      deliveryRate: 0,
    }

    let responseTimes = 0
    let responseCount = 0
    let readTimes = 0
    let readCount = 0
    let deliveredCount = 0

    for (const item of items) {
      if (item.responseTimeMs) {
        responseTimes += item.responseTimeMs
        responseCount++
      }
      if (item.timeToReadMs) {
        readTimes += item.timeToReadMs
        readCount++
      }
      stats.totalReactions += item.reactionCount
      stats.totalReplies += item.replyCount
      stats.totalShares += item.shareCount
      if (item.deliveryStatus === 'delivered') deliveredCount++
    }

    stats.avgResponseTimeMs = responseCount > 0 ? Math.round(responseTimes / responseCount) : 0
    stats.avgReadTimeMs = readCount > 0 ? Math.round(readTimes / readCount) : 0
    stats.deliveryRate = items.length > 0 ? Math.round((deliveredCount / items.length) * 100) : 0

    return stats
  },
})

export const getWorkspaceAnalytics = zWorkspaceQuery({
  args: {
    days: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000

    const items = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).gte('createdAtMs', cutoffMs)
      )
      .collect()

    const stats = {
      totalMessages: items.length,
      byConversationType: {} as Record<string, number>,
      avgResponseTimeMs: 0,
      avgReadTimeMs: 0,
      totalReactions: 0,
      totalReplies: 0,
      totalShares: 0,
      deliveryRate: 0,
      messagesBySender: {} as Record<string, { name: string; count: number }>,
    }

    let responseTimes = 0
    let responseCount = 0
    let readTimes = 0
    let readCount = 0
    let deliveredCount = 0

    for (const item of items) {
      stats.byConversationType[item.conversationType] = (stats.byConversationType[item.conversationType] ?? 0) + 1
      stats.totalReactions += item.reactionCount
      stats.totalReplies += item.replyCount
      stats.totalShares += item.shareCount
      if (item.deliveryStatus === 'delivered') deliveredCount++

      if (item.responseTimeMs) {
        responseTimes += item.responseTimeMs
        responseCount++
      }
      if (item.timeToReadMs) {
        readTimes += item.timeToReadMs
        readCount++
      }
    }

    stats.avgResponseTimeMs = responseCount > 0 ? Math.round(responseTimes / responseCount) : 0
    stats.avgReadTimeMs = readCount > 0 ? Math.round(readTimes / readCount) : 0
    stats.deliveryRate = items.length > 0 ? Math.round((deliveredCount / items.length) * 100) : 0

    return stats
  },
})

export const getAverageResponseTime = zWorkspaceQuery({
  args: {
    conversationType: z.enum(['direct', 'channel', 'thread']).optional(),
    days: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000
    const conversationType = args.conversationType

    const items = conversationType
      ? await ctx.db
          .query('messageAnalytics')
          .withIndex('by_workspace_conversationType_createdAtMs', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('conversationType', conversationType).gte('createdAtMs', cutoffMs)
          )
          .filter((q) => q.neq(q.field('responseTimeMs'), null))
          .collect()
      : await ctx.db
          .query('messageAnalytics')
          .withIndex('by_workspace_createdAtMs', (q) =>
            q.eq('workspaceId', args.workspaceId).gte('createdAtMs', cutoffMs)
          )
          .filter((q) => q.neq(q.field('responseTimeMs'), null))
          .collect()

    if (items.length === 0) return { avgMs: 0, count: 0 }

    const total = items.reduce((sum: number, item) => sum + (item.responseTimeMs ?? 0), 0)
    return {
      avgMs: Math.round(total / items.length),
      count: items.length,
    }
  },
})

export const getEngagementMetrics = zWorkspaceQuery({
  args: {
    days: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000

    const items = await ctx.db
      .query('messageAnalytics')
      .withIndex('by_workspace_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).gte('createdAtMs', cutoffMs)
      )
      .collect()

    return {
      totalReactions: items.reduce((sum: number, item) => sum + item.reactionCount, 0),
      totalReplies: items.reduce((sum: number, item) => sum + item.replyCount, 0),
      totalShares: items.reduce((sum: number, item) => sum + item.shareCount, 0),
      avgReactionsPerMessage: items.length > 0
        ? Math.round(items.reduce((sum: number, item) => sum + item.reactionCount, 0) / items.length * 100) / 100
        : 0,
      messageCount: items.length,
    }
  },
})
