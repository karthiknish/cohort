import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const workspaceTables = {
  users: defineTable({
    legacyId: v.string(),
    email: v.union(v.string(), v.null()),
    emailLower: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    role: v.union(v.string(), v.null()),
    status: v.union(v.string(), v.null()),
    agencyId: v.union(v.string(), v.null()),
    stripeCustomerId: v.optional(v.union(v.string(), v.null())),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
    photoUrl: v.optional(v.union(v.string(), v.null())),
    notificationPreferences: v.optional(
      v.object({
        emailAdAlerts: v.boolean(),
        emailPerformanceDigest: v.boolean(),
        emailTaskActivity: v.boolean(),
        emailCollaboration: v.boolean(),
      })
    ),
    regionalPreferences: v.optional(
      v.object({
        currency: v.optional(v.union(v.string(), v.null())),
        timezone: v.optional(v.union(v.string(), v.null())),
        locale: v.optional(v.union(v.string(), v.null())),
      })
    ),
    createdAtMs: v.union(v.number(), v.null()),
    updatedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_legacyId', ['legacyId'])
    .index('by_emailLower', ['emailLower'])
    .index('by_agencyId', ['agencyId'])
    .index('by_status_updatedAtMs', ['status', 'updatedAtMs'])
    .index('by_agencyId_status_updatedAtMs', ['agencyId', 'status', 'updatedAtMs'])
    .index('by_createdAtMs', ['createdAtMs'])
    .index('by_updatedAtMs_legacyId', ['updatedAtMs', 'legacyId']),

  platformFeatures: defineTable({
    legacyId: v.union(v.string(), v.null()),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('backlog'),
      v.literal('planned'),
      v.literal('in_progress'),
      v.literal('completed')
    ),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    imageUrl: v.union(v.string(), v.null()),
    references: v.array(
      v.object({
        url: v.string(),
        label: v.string(),
      })
    ),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_status_createdAtMs', ['status', 'createdAtMs'])
    .index('by_legacyId', ['legacyId'])
    .index('by_createdAtMs', ['createdAtMs']),

  invitations: defineTable({
    legacyId: v.union(v.string(), v.null()),
    email: v.string(),
    emailLower: v.string(),
    role: v.union(v.literal('admin'), v.literal('team'), v.literal('client')),
    name: v.union(v.string(), v.null()),
    message: v.union(v.string(), v.null()),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('expired'),
      v.literal('revoked')
    ),
    invitedBy: v.string(),
    invitedByName: v.union(v.string(), v.null()),
    token: v.string(),
    expiresAtMs: v.number(),
    createdAtMs: v.number(),
    acceptedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_emailLower_status', ['emailLower', 'status'])
    .index('by_status_createdAtMs', ['status', 'createdAtMs'])
    .index('by_token', ['token'])
    .index('by_legacyId', ['legacyId'])
    .index('by_createdAtMs', ['createdAtMs']),

  customFormulas: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    formula: v.string(),
    inputs: v.array(v.string()),
    outputMetric: v.string(),
    isActive: v.boolean(),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspaceId', ['workspaceId'])
    .index('by_workspaceId_isActive', ['workspaceId', 'isActive'])
    .index('by_workspaceId_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspaceId_createdAtMs', ['workspaceId', 'createdAtMs']),

  tasks: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.string(),
    priority: v.string(),
    assignedTo: v.array(v.string()),
    client: v.union(v.string(), v.null()),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    projectName: v.union(v.string(), v.null()),
    dueDateMs: v.union(v.number(), v.null()),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          type: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.string(), v.null())),
        })
      )
    ),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    deletedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_createdAtMs_legacyId', ['workspaceId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_status_createdAtMs', ['workspaceId', 'status', 'createdAtMs'])
    .index('by_workspace_projectId_createdAtMs', ['workspaceId', 'projectId', 'createdAtMs'])
    .index('by_workspace_clientId_updatedAtMs_legacyId', ['workspaceId', 'clientId', 'updatedAtMs', 'legacyId'])
    /** Platform-wide admin metrics (leading field is not workspace-scoped). */
    .index('by_createdAtMs', ['createdAtMs']),

  taskComments: defineTable({
    workspaceId: v.string(),
    taskLegacyId: v.string(),
    legacyId: v.string(),
    content: v.string(),
    format: v.union(v.literal('markdown'), v.literal('plaintext')),
    authorId: v.union(v.string(), v.null()),
    authorName: v.union(v.string(), v.null()),
    authorRole: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    deleted: v.boolean(),
    deletedAtMs: v.union(v.number(), v.null()),
    deletedBy: v.union(v.string(), v.null()),
    attachments: v.array(
      v.object({
        name: v.string(),
        url: v.string(),
        type: v.optional(v.union(v.string(), v.null())),
        size: v.optional(v.union(v.string(), v.null())),
      })
    ),
    mentions: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        role: v.union(v.string(), v.null()),
      })
    ),
    parentCommentId: v.union(v.string(), v.null()),
    threadRootId: v.union(v.string(), v.null()),
  })
    .index('by_workspace_task_createdAtMs_legacyId', ['workspaceId', 'taskLegacyId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_task_legacyId', ['workspaceId', 'taskLegacyId', 'legacyId']),
}
