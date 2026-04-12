import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const collaborationTables = {
  collaborationChannels: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    nameLower: v.string(),
    description: v.union(v.string(), v.null()),
    channelType: v.string(),
    visibility: v.union(v.literal('public'), v.literal('private')),
    memberIds: v.array(v.string()),
    memberSummaries: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        role: v.union(v.string(), v.null()),
        email: v.optional(v.union(v.string(), v.null())),
      }),
    ),
    createdBy: v.string(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    archivedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_channelType_updatedAtMs_legacyId', ['workspaceId', 'channelType', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_nameLower_legacyId', ['workspaceId', 'nameLower', 'legacyId']),

  collaborationMessages: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    channelId: v.optional(v.union(v.string(), v.null())),
    channelType: v.string(),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    senderId: v.union(v.string(), v.null()),
    senderName: v.string(),
    senderRole: v.union(v.string(), v.null()),
    content: v.string(),
    createdAtMs: v.number(),
    updatedAtMs: v.union(v.number(), v.null()),
    deleted: v.boolean(),
    deletedAtMs: v.union(v.number(), v.null()),
    deletedBy: v.union(v.string(), v.null()),
    attachments: v.union(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          storageId: v.optional(v.union(v.string(), v.null())),
          type: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.string(), v.null())),
        })
      ),
      v.null()
    ),
    format: v.union(v.literal('markdown'), v.literal('plaintext')),
    mentions: v.union(
      v.array(
        v.object({
          slug: v.string(),
          name: v.string(),
          role: v.union(v.string(), v.null()),
        })
      ),
      v.null()
    ),
    reactions: v.union(
      v.array(
        v.object({
          emoji: v.string(),
          count: v.number(),
          userIds: v.array(v.string()),
        })
      ),
      v.null()
    ),
    parentMessageId: v.union(v.string(), v.null()),
    threadRootId: v.union(v.string(), v.null()),
    isThreadRoot: v.boolean(),
    threadReplyCount: v.union(v.number(), v.null()),
    threadLastReplyAtMs: v.union(v.number(), v.null()),
    readBy: v.array(v.string()),
    deliveredTo: v.array(v.string()),
    isPinned: v.boolean(),
    pinnedAtMs: v.union(v.number(), v.null()),
    pinnedBy: v.union(v.string(), v.null()),
    sharedTo: v.optional(v.union(v.array(v.literal('email')), v.null())),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_channelId_createdAtMs_legacyId', ['workspaceId', 'channelId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_channel_createdAtMs_legacyId', ['workspaceId', 'channelType', 'createdAtMs', 'legacyId'])
    .index('by_workspace_channel_client_createdAtMs_legacyId', ['workspaceId', 'channelType', 'clientId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_channel_pinned', ['workspaceId', 'channelType', 'isPinned', 'pinnedAtMs'])
    .index('by_workspace_channel_project_createdAtMs_legacyId', ['workspaceId', 'channelType', 'projectId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_threadRoot_createdAtMs_legacyId', ['workspaceId', 'threadRootId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_clientId_createdAtMs_legacyId', ['workspaceId', 'clientId', 'createdAtMs', 'legacyId']),

  collaborationReadCheckpoints: defineTable({
    workspaceId: v.string(),
    userId: v.string(),
    scopeType: v.union(v.literal('channel'), v.literal('thread')),
    channelId: v.optional(v.union(v.string(), v.null())),
    channelType: v.string(),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    threadRootId: v.union(v.string(), v.null()),
    lastReadCreatedAtMs: v.number(),
    lastReadLegacyId: v.string(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_user_scope_updatedAtMs', ['workspaceId', 'userId', 'scopeType', 'updatedAtMs'])
    .index('by_workspace_user_scope_channel_client_project_thread', [
      'workspaceId',
      'userId',
      'scopeType',
      'channelId',
      'channelType',
      'clientId',
      'projectId',
      'threadRootId',
    ]),

  collaborationTyping: defineTable({
    workspaceId: v.string(),
    channelId: v.string(),
    channelType: v.string(),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    userId: v.string(),
    name: v.string(),
    role: v.union(v.string(), v.null()),
    updatedAtMs: v.number(),
    expiresAtMs: v.number(),
  })
    .index('by_workspace_channel_userId', ['workspaceId', 'channelId', 'userId'])
    .index('by_workspace_channel_expiresAtMs_userId', ['workspaceId', 'channelId', 'expiresAtMs', 'userId']),

  clients: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    nameLower: v.string(),
    accountManager: v.string(),
    billingEmail: v.optional(v.union(v.string(), v.null())),
    stripeCustomerId: v.optional(v.union(v.string(), v.null())),
    lastInvoiceAmount: v.optional(v.union(v.number(), v.null())),
    lastInvoiceCurrency: v.optional(v.union(v.string(), v.null())),
    lastInvoiceIssuedAtMs: v.optional(v.union(v.number(), v.null())),
    lastInvoiceNumber: v.optional(v.union(v.string(), v.null())),
    lastInvoicePaidAtMs: v.optional(v.union(v.number(), v.null())),
    lastInvoiceStatus: v.optional(v.union(v.string(), v.null())),
    lastInvoiceUrl: v.optional(v.union(v.string(), v.null())),
    teamMembers: v.array(
      v.object({
        name: v.string(),
        role: v.string(),
      })
    ),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    deletedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_nameLower_legacyId', ['workspaceId', 'nameLower', 'legacyId'])
    .index('by_workspace_deletedAtMs', ['workspaceId', 'deletedAtMs'])
    .index('by_workspace_createdAtMs_legacyId', ['workspaceId', 'createdAtMs', 'legacyId'])
    /** Platform-wide admin metrics. */
    .index('by_createdAtMs', ['createdAtMs']),

  projects: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    nameLower: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    clientId: v.union(v.string(), v.null()),
    clientName: v.union(v.string(), v.null()),
    startDateMs: v.union(v.number(), v.null()),
    endDateMs: v.union(v.number(), v.null()),
    tags: v.array(v.string()),
    ownerId: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    deletedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_updatedAtMs_legacyId', ['workspaceId', 'status', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_clientId_updatedAtMs_legacyId', ['workspaceId', 'clientId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_clientId_updatedAtMs_legacyId', ['workspaceId', 'status', 'clientId', 'updatedAtMs', 'legacyId'])
    /** Platform-wide admin metrics. */
    .index('by_createdAtMs', ['createdAtMs']),

  projectMilestones: defineTable({
    workspaceId: v.string(),
    projectId: v.string(),
    legacyId: v.string(),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    startDateMs: v.union(v.number(), v.null()),
    endDateMs: v.union(v.number(), v.null()),
    startDateSortKey: v.number(),
    ownerId: v.union(v.string(), v.null()),
    order: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_project_legacyId', ['workspaceId', 'projectId', 'legacyId'])
    .index('by_workspace_project_start_created_legacyId', [
      'workspaceId',
      'projectId',
      'startDateSortKey',
      'createdAtMs',
      'legacyId',
    ]),
}