import { defineTable } from 'convex/server'
import { v } from 'convex/values'

import { jsonRecordValidator } from './jsonValidators'

export const systemTables = {
  adminNotifications: defineTable({
    type: v.string(),
    title: v.string(),
    message: v.string(),
    userId: v.union(v.string(), v.null()),
    userEmail: v.union(v.string(), v.null()),
    userName: v.union(v.string(), v.null()),
    read: v.boolean(),
    createdAtMs: v.number(),
    updatedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_read_createdAtMs', ['read', 'createdAtMs'])
    .index('by_createdAtMs', ['createdAtMs']),

  schedulerEvents: defineTable({
    createdAtMs: v.number(),
    source: v.string(),
    operation: v.union(v.string(), v.null()),
    processedJobs: v.union(v.number(), v.null()),
    successfulJobs: v.union(v.number(), v.null()),
    failedJobs: v.union(v.number(), v.null()),
    hadQueuedJobs: v.union(v.boolean(), v.null()),
    inspectedQueuedJobs: v.union(v.number(), v.null()),
    durationMs: v.union(v.number(), v.null()),
    severity: v.string(),
    errors: v.array(v.string()),
    notes: v.union(v.string(), v.null()),
    failureThreshold: v.union(v.number(), v.null()),
    providerFailureThresholds: v.array(
      v.object({
        providerId: v.string(),
        failedJobs: v.number(),
        threshold: v.union(v.number(), v.null()),
      })
    ),
  })
    .index('by_createdAtMs', ['createdAtMs'])
    .index('by_severity_createdAtMs', ['severity', 'createdAtMs'])
    .index('by_source_createdAtMs', ['source', 'createdAtMs']),

  agentConversations: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    userId: v.string(),
    title: v.union(v.string(), v.null()),
    startedAt: v.union(v.number(), v.null()),
    lastMessageAt: v.union(v.number(), v.null()),
    messageCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspaceId_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspaceId_userId_lastMessageAt', ['workspaceId', 'userId', 'lastMessageAt']),

  agentMessages: defineTable({
    workspaceId: v.string(),
    conversationLegacyId: v.string(),
    legacyId: v.string(),
    type: v.union(v.literal('user'), v.literal('agent')),
    content: v.string(),
    createdAt: v.number(),
    userId: v.union(v.string(), v.null()),
    action: v.union(v.string(), v.null()),
    route: v.union(v.string(), v.null()),
    operation: v.union(v.string(), v.null()),
    params: v.union(jsonRecordValidator, v.null()),
    executeResult: v.union(jsonRecordValidator, v.null()),
  })
    .index('by_workspace_conversation_createdAt', ['workspaceId', 'conversationLegacyId', 'createdAt'])
    .index('by_workspace_conversation_legacyId', ['workspaceId', 'conversationLegacyId', 'legacyId']),

  problemReports: defineTable({
    legacyId: v.string(),
    userId: v.union(v.string(), v.null()),
    userEmail: v.union(v.string(), v.null()),
    userName: v.union(v.string(), v.null()),
    workspaceId: v.union(v.string(), v.null()),
    title: v.string(),
    description: v.string(),
    severity: v.string(),
    status: v.string(),
    fixed: v.optional(v.union(v.boolean(), v.null())),
    resolution: v.optional(v.union(v.string(), v.null())),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_status_createdAtMs', ['status', 'createdAtMs'])
    .index('by_createdAtMs', ['createdAtMs'])
    .index('by_legacyId', ['legacyId']),

  onboardingStates: defineTable({
    userId: v.string(),
    onboardingTourCompleted: v.boolean(),
    onboardingTourCompletedAtMs: v.union(v.number(), v.null()),
    welcomeSeenAtMs: v.optional(v.union(v.number(), v.null())),
    welcomeSeen: v.optional(v.boolean()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  }).index('by_userId', ['userId']),

  notifications: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    kind: v.string(),
    title: v.string(),
    body: v.string(),
    actorId: v.union(v.string(), v.null()),
    actorName: v.union(v.string(), v.null()),
    resourceType: v.string(),
    resourceId: v.string(),
    recipientRoles: v.array(v.string()),
    recipientClientId: v.union(v.string(), v.null()),
    recipientClientIds: v.optional(v.array(v.string())),
    recipientUserIds: v.optional(v.array(v.string())),
    readBy: v.array(v.string()),
    acknowledgedBy: v.array(v.string()),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspaceId_createdAtMs', ['workspaceId', 'createdAtMs'])
    .index('by_workspaceId_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspaceId_kind_createdAtMs', ['workspaceId', 'kind', 'createdAtMs']),
}