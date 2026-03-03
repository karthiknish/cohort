import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Convex schema for the application.
  // NOTE: We key records by workspaceId + legacyId for backward compatibility
  // with existing UI code and data references.

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
    params: v.union(v.record(v.string(), v.any()), v.null()),
    executeResult: v.union(v.record(v.string(), v.any()), v.null()),
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

  // Ads integrations (Google/Meta/TikTok/LinkedIn/GA tokens, sync jobs, metrics)
  adIntegrations: defineTable({
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.union(v.string(), v.null()),

    accessToken: v.union(v.string(), v.null()),
    idToken: v.union(v.string(), v.null()),
    refreshToken: v.union(v.string(), v.null()),
    scopes: v.array(v.string()),

    accountId: v.union(v.string(), v.null()),
    accountName: v.union(v.string(), v.null()),
    currency: v.union(v.string(), v.null()),

    developerToken: v.union(v.string(), v.null()),
    loginCustomerId: v.union(v.string(), v.null()),
    managerCustomerId: v.union(v.string(), v.null()),

    accessTokenExpiresAtMs: v.union(v.number(), v.null()),
    refreshTokenExpiresAtMs: v.union(v.number(), v.null()),

    lastSyncStatus: v.union(
      v.literal('never'),
      v.literal('pending'),
      v.literal('success'),
      v.literal('error')
    ),
    lastSyncMessage: v.union(v.string(), v.null()),
    lastSyncedAtMs: v.union(v.number(), v.null()),
    lastSyncRequestedAtMs: v.union(v.number(), v.null()),
    linkedAtMs: v.union(v.number(), v.null()),

    autoSyncEnabled: v.union(v.boolean(), v.null()),
    syncFrequencyMinutes: v.union(v.number(), v.null()),
    scheduledTimeframeDays: v.union(v.number(), v.null()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace_provider_client', ['workspaceId', 'providerId', 'clientId'])
    .index('by_workspace_provider', ['workspaceId', 'providerId']),

  adSyncJobs: defineTable({
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.union(v.string(), v.null()),
    jobType: v.union(
      v.literal('initial-backfill'),
      v.literal('scheduled-sync'),
      v.literal('manual-sync')
    ),
    timeframeDays: v.number(),
    status: v.union(v.literal('queued'), v.literal('running'), v.literal('success'), v.literal('error')),
    createdAtMs: v.number(),
    startedAtMs: v.union(v.number(), v.null()),
    processedAtMs: v.union(v.number(), v.null()),
    errorMessage: v.union(v.string(), v.null()),
  })
    .index('by_workspace_status_createdAt', ['workspaceId', 'status', 'createdAtMs'])
    .index('by_workspace_provider_client_status', ['workspaceId', 'providerId', 'clientId', 'status'])
    .index('by_status_processedAt', ['status', 'processedAtMs'])
    .index('by_status_startedAt', ['status', 'startedAtMs']),

  adMetrics: defineTable({
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.union(v.string(), v.null()),
    accountId: v.union(v.string(), v.null()),
    date: v.string(),
    spend: v.number(),
    impressions: v.number(),
    clicks: v.number(),
    conversions: v.number(),
    revenue: v.union(v.number(), v.null()),
    campaignId: v.union(v.string(), v.null()),
    campaignName: v.union(v.string(), v.null()),
    creatives: v.union(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          type: v.string(),
          url: v.optional(v.string()),
          spend: v.optional(v.number()),
          impressions: v.optional(v.number()),
          clicks: v.optional(v.number()),
          conversions: v.optional(v.number()),
          revenue: v.optional(v.number()),
        })
      ),
      v.null()
    ),
    rawPayload: v.optional(v.any()),
    createdAtMs: v.number(),
  })
    .index('by_workspace_provider_date', ['workspaceId', 'providerId', 'date'])
    .index('by_workspace_date', ['workspaceId', 'date']),

  // User profiles table.
  // This is separate from Better Auth's internal user database (stored in the component).
  users: defineTable({
    legacyId: v.string(),
    email: v.union(v.string(), v.null()),
    emailLower: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    role: v.union(v.string(), v.null()),
    status: v.union(v.string(), v.null()),
    agencyId: v.union(v.string(), v.null()),

    phoneNumber: v.optional(v.union(v.string(), v.null())),
    photoUrl: v.optional(v.union(v.string(), v.null())),

    notificationPreferences: v.optional(
      v.object({
        // Email notifications
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
    .index('by_agencyId', ['agencyId']),

  // Admin-managed platform feature backlog (migrated from Firestore `platform_features`).
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
    .index('by_legacyId', ['legacyId']),

  // Admin invitations (migrated from Firestore `invitations`).
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
    .index('by_legacyId', ['legacyId']),

  // Custom formulas (migrated from Firestore `workspaces/{clientId}/customFormulas`).
  // NOTE: Historical Firestore path used `workspaces/{clientId}` for client doc id.
  // We preserve that value in `workspaceId` so the UI/API stays stable.
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

  // Tasks (migrated from Firestore `workspaces/{workspaceId}/tasks`).
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
    tags: v.array(v.string()),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    deletedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_createdAtMs_legacyId', ['workspaceId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_status_createdAtMs', ['workspaceId', 'status', 'createdAtMs'])
    .index('by_workspace_projectId_createdAtMs', ['workspaceId', 'projectId', 'createdAtMs'])
    .index('by_workspace_clientId_updatedAtMs_legacyId', ['workspaceId', 'clientId', 'updatedAtMs', 'legacyId']),

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

  // Collaboration messages (migrated from Firestore `workspaces/{workspaceId}/collaborationMessages`).
  collaborationMessages: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
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
    readBy: v.array(v.string()), // Array of user IDs who have read this message
    deliveredTo: v.array(v.string()), // Array of user IDs who have received this message
    isPinned: v.boolean(), // Whether the message is pinned to the channel
    pinnedAtMs: v.union(v.number(), v.null()), // When the message was pinned
    pinnedBy: v.union(v.string(), v.null()), // User ID who pinned the message
    sharedTo: v.optional(v.union(v.array(v.literal('email')), v.null())), // External platforms message was shared to
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_channel_createdAtMs_legacyId', ['workspaceId', 'channelType', 'createdAtMs', 'legacyId'])
    .index('by_workspace_channel_client_createdAtMs_legacyId', ['workspaceId', 'channelType', 'clientId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_channel_pinned', ['workspaceId', 'channelType', 'isPinned', 'pinnedAtMs'])
    .index('by_workspace_channel_project_createdAtMs_legacyId', ['workspaceId', 'channelType', 'projectId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_threadRoot_createdAtMs_legacyId', ['workspaceId', 'threadRootId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_clientId_createdAtMs_legacyId', ['workspaceId', 'clientId', 'createdAtMs', 'legacyId']),

  // Collaboration typing presence (ephemeral; replaces Firestore `workspaces/{workspaceId}/collaborationTyping/{channelId}`).
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

  // Clients (migrated from Firestore `workspaces/{workspaceId}/clients`).
  clients: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    nameLower: v.string(),
    accountManager: v.string(),
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
    .index('by_workspace_deletedAtMs', ['workspaceId', 'deletedAtMs']),

  // Projects (migrated from Firestore `workspaces/{workspaceId}/projects`).
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
    .index('by_workspace_status_clientId_updatedAtMs_legacyId', ['workspaceId', 'status', 'clientId', 'updatedAtMs', 'legacyId']),

  // Project milestones (migrated from Firestore `workspaces/{workspaceId}/projects/{projectId}/milestones`).
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

  // Proposals (migrated from Firestore `workspaces/{workspaceId}/proposals`).
  proposals: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    ownerId: v.union(v.string(), v.null()),
    status: v.string(),
    stepProgress: v.number(),
    formData: v.record(v.string(), v.any()),
    aiInsights: v.union(v.record(v.string(), v.any()), v.null()),
    aiSuggestions: v.union(v.string(), v.null()),
    pdfUrl: v.union(v.string(), v.null()),
    pptUrl: v.union(v.string(), v.null()),
    pdfStorageId: v.optional(v.union(v.string(), v.null())),
    pptStorageId: v.optional(v.union(v.string(), v.null())),
    clientId: v.union(v.string(), v.null()),
    clientName: v.union(v.string(), v.null()),
    presentationDeck: v.union(v.record(v.string(), v.any()), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    lastAutosaveAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_updatedAtMs_legacyId', ['workspaceId', 'status', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_clientId_updatedAtMs_legacyId', ['workspaceId', 'clientId', 'updatedAtMs', 'legacyId']),

  // Proposal versions (migrated from Firestore `users/{uid}/proposals/{proposalId}/versions`).
  proposalVersions: defineTable({
    workspaceId: v.string(),
    proposalLegacyId: v.string(),
    legacyId: v.string(),
    versionNumber: v.number(),
    formData: v.record(v.string(), v.any()),
    status: v.string(),
    stepProgress: v.number(),
    changeDescription: v.union(v.string(), v.null()),
    createdBy: v.string(),
    createdByName: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_workspace_proposal_legacyId', ['workspaceId', 'proposalLegacyId', 'legacyId'])
    .index('by_workspace_proposal_versionNumber_legacyId', ['workspaceId', 'proposalLegacyId', 'versionNumber', 'legacyId']),

  // Proposal templates (migrated from Firestore `workspaces/{workspaceId}/proposalTemplates`).
  proposalTemplates: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    formData: v.record(v.string(), v.any()),
    industry: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    isDefault: v.boolean(),
    createdBy: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_createdAtMs_legacyId', ['workspaceId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_isDefault', ['workspaceId', 'isDefault']),

  // Proposal analytics events.
  proposalAnalyticsEvents: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    eventType: v.string(),
    proposalId: v.string(),
    userId: v.string(),
    clientId: v.union(v.string(), v.null()),
    clientName: v.union(v.string(), v.null()),
    metadata: v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null())),
    duration: v.union(v.number(), v.null()),
    error: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
  })
    .index('by_workspace_createdAtMs_legacyId', ['workspaceId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_clientId_createdAtMs_legacyId', ['workspaceId', 'clientId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_proposalId_createdAtMs_legacyId', ['workspaceId', 'proposalId', 'createdAtMs', 'legacyId']),

  // API idempotency tracking (prevents duplicate request processing)
  apiIdempotency: defineTable({
    key: v.string(),
    status: v.string(), // 'pending' | 'completed'
    requestId: v.union(v.string(), v.null()),
    method: v.union(v.string(), v.null()),
    path: v.union(v.string(), v.null()),
    response: v.union(
      v.null(),
      v.boolean(),
      v.number(),
      v.string(),
      v.array(v.any()),
      v.record(v.string(), v.any())
    ),
    httpStatus: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  }).index('by_key', ['key']),

  // Scheduler alert preferences (per-provider failure thresholds)
  schedulerAlertPreferences: defineTable({
    providerId: v.string(),
    failureThreshold: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  }).index('by_providerId', ['providerId']),

  // Alert rules (migrated from Firestore `workspaces/{workspaceId}/alertRules`).
  alertRules: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),

    name: v.string(),
    description: v.union(v.string(), v.null()),
    type: v.string(), // 'threshold' | 'anomaly' | 'trend' | 'algorithmic'
    metric: v.string(), // 'spend' | 'cpc' | 'ctr' | 'roas' | 'conversions' | 'cpa' | 'revenue' | 'impressions' | 'clicks' | 'custom_formula'
    condition: v.object({
      operator: v.union(
        v.literal('gt'),
        v.literal('lt'),
        v.literal('gte'),
        v.literal('lte'),
        v.literal('eq'),
        v.literal('ne')
      ),
      threshold: v.union(v.number(), v.string()),
      windowSize: v.optional(v.union(v.number(), v.null())),
      direction: v.optional(v.union(v.literal('up'), v.literal('down'), v.null())),
      percentage: v.optional(v.union(v.number(), v.null())),
    }),
    severity: v.string(), // 'info' | 'warning' | 'critical'
    enabled: v.boolean(),

    providerId: v.union(v.string(), v.null()),
    campaignId: v.union(v.string(), v.null()),
    formulaId: v.union(v.string(), v.null()),
    insightType: v.union(v.string(), v.null()), // 'efficiency' | 'budget' | 'creative' | 'audience' | 'all'
    channels: v.array(v.string()), // ['email', 'in-app']

    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspaceId', ['workspaceId'])
    .index('by_workspaceId_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspaceId_enabled', ['workspaceId', 'enabled']),

  // Distributed cache (replaces Firestore _cache collection).
  serverCache: defineTable({
    keyHash: v.string(), // SHA-256 hash of the key (safe for doc IDs)
    key: v.string(), // Original key for prefix queries
    value: v.string(), // JSON-serialized value
    expiresAtMs: v.number(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_keyHash', ['keyHash'])
    .index('by_key', ['key'])
    .index('by_expiresAtMs', ['expiresAtMs']),

  // Audit logs (replaces Firestore audit_logs collection).
  auditLogs: defineTable({
    action: v.string(),
    actorId: v.string(),
    actorEmail: v.union(v.string(), v.null()),
    targetId: v.union(v.string(), v.null()),
    workspaceId: v.union(v.string(), v.null()),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))),
    ip: v.union(v.string(), v.null()),
    userAgent: v.union(v.string(), v.null()),
    requestId: v.union(v.string(), v.null()),
    timestampMs: v.number(),
  })
    .index('by_timestampMs', ['timestampMs'])
    .index('by_actorId_timestampMs', ['actorId', 'timestampMs'])
    .index('by_action_timestampMs', ['action', 'timestampMs'])
    .index('by_workspaceId_timestampMs', ['workspaceId', 'timestampMs']),

  // Direct conversations (1:1 DMs between users)
  directConversations: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    // Two participants in the conversation (sorted for uniqueness)
    participantOneId: v.string(),
    participantOneName: v.string(),
    participantOneRole: v.union(v.string(), v.null()),
    participantTwoId: v.string(),
    participantTwoName: v.string(),
    participantTwoRole: v.union(v.string(), v.null()),
    // Conversation metadata
    lastMessageSnippet: v.union(v.string(), v.null()),
    lastMessageAtMs: v.union(v.number(), v.null()),
    lastMessageSenderId: v.union(v.string(), v.null()),
    // Per-participant read state
    readByParticipantOne: v.boolean(),
    readByParticipantTwo: v.boolean(),
    lastReadByParticipantOneAtMs: v.union(v.number(), v.null()),
    lastReadByParticipantTwoAtMs: v.union(v.number(), v.null()),
    // Archive/mute state per participant
    archivedByParticipantOne: v.boolean(),
    archivedByParticipantTwo: v.boolean(),
    mutedByParticipantOne: v.boolean(),
    mutedByParticipantTwo: v.boolean(),
    // Timestamps
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_participantOne_participantTwo', ['workspaceId', 'participantOneId', 'participantTwoId'])
    .index('by_workspace_participantOne_updatedAtMs', ['workspaceId', 'participantOneId', 'updatedAtMs'])
    .index('by_workspace_participantTwo_updatedAtMs', ['workspaceId', 'participantTwoId', 'updatedAtMs'])
    .index('by_workspace_lastMessageAtMs', ['workspaceId', 'lastMessageAtMs']),

  // Direct messages (messages in 1:1 conversations)
  directMessages: defineTable({
    workspaceId: v.string(),
    conversationLegacyId: v.string(),
    legacyId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.union(v.string(), v.null()),
    content: v.string(),
    // Message state
    edited: v.boolean(),
    editedAtMs: v.union(v.number(), v.null()),
    deleted: v.boolean(),
    deletedAtMs: v.union(v.number(), v.null()),
    deletedBy: v.union(v.string(), v.null()),
    // Attachments and reactions
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
    // Read/delivery receipts
    readBy: v.array(v.string()),
    deliveredTo: v.array(v.string()),
    readAtMs: v.union(v.number(), v.null()), // When recipient first read
    // External sharing
    sharedTo: v.optional(v.union(v.array(v.literal('email')), v.null())),
    // Timestamps
    createdAtMs: v.number(),
    updatedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_conversation_createdAtMs_legacyId', ['workspaceId', 'conversationLegacyId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_sender_createdAtMs', ['workspaceId', 'senderId', 'createdAtMs']),

  // Conversation assignments (for smart routing)
  conversationAssignments: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    // What's being assigned (can be a DM conversation, channel, or specific message)
    resourceType: v.union(v.literal('direct_conversation'), v.literal('channel'), v.literal('message')),
    resourceId: v.string(),
    // Assignment details
    assignedToId: v.string(),
    assignedToName: v.string(),
    assignedById: v.union(v.string(), v.null()),
    assignedByName: v.union(v.string(), v.null()),
    // Routing metadata
    routingReason: v.union(v.string(), v.null()), // 'manual', 'auto-skill', 'auto-geography', 'escalation'
    routingRuleId: v.union(v.string(), v.null()),
    priority: v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent')),
    // Status
    status: v.union(v.literal('active'), v.literal('completed'), v.literal('escalated'), v.literal('transferred')),
    escalatedFromId: v.union(v.string(), v.null()), // Previous assignment if escalated
    // SLA tracking
    slaDeadlineMs: v.union(v.number(), v.null()),
    slaBreached: v.boolean(),
    firstResponseAtMs: v.union(v.number(), v.null()),
    resolvedAtMs: v.union(v.number(), v.null()),
    // Timestamps
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_resource', ['workspaceId', 'resourceType', 'resourceId'])
    .index('by_workspace_assignedTo_status', ['workspaceId', 'assignedToId', 'status'])
    .index('by_workspace_status_priority', ['workspaceId', 'status', 'priority'])
    .index('by_workspace_slaDeadline', ['workspaceId', 'slaDeadlineMs']),

  // Message analytics (response times, engagement metrics)
  messageAnalytics: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    // What's being tracked
    conversationType: v.union(v.literal('direct'), v.literal('channel'), v.literal('thread')),
    conversationId: v.string(),
    messageId: v.string(),
    senderId: v.string(),
    // Response metrics
    firstReadAtMs: v.union(v.number(), v.null()),
    firstResponseAtMs: v.union(v.number(), v.null()),
    responseTimeMs: v.union(v.number(), v.null()), // Time from message to first response
    timeToReadMs: v.union(v.number(), v.null()), // Time from send to first read
    // Engagement metrics
    reactionCount: v.number(),
    replyCount: v.number(),
    shareCount: v.number(),
    // Delivery metrics
    deliveryAttempts: v.number(),
    deliveryStatus: v.union(v.literal('pending'), v.literal('delivered'), v.literal('failed')),
    deliveredAtMs: v.union(v.number(), v.null()),
    // Channel context
    channelType: v.union(v.string(), v.null()),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    // Timestamps
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_conversation_createdAtMs', ['workspaceId', 'conversationId', 'createdAtMs'])
    .index('by_workspace_sender_createdAtMs', ['workspaceId', 'senderId', 'createdAtMs'])
    .index('by_workspace_conversationType_responseTime', ['workspaceId', 'conversationType', 'responseTimeMs']),

  // Unified inbox items (aggregates all conversations: DMs, channels, external)
  inboxItems: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    userId: v.string(), // User this inbox item belongs to
    // Source info
    sourceType: v.union(v.literal('direct_message'), v.literal('channel'), v.literal('email')),
    sourceId: v.string(), // Conversation/channel ID
    sourceName: v.string(), // Display name
    // Related entities
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    otherParticipantId: v.union(v.string(), v.null()), // For DMs
    otherParticipantName: v.union(v.string(), v.null()),
    // Last activity
    lastMessageSnippet: v.union(v.string(), v.null()),
    lastMessageAtMs: v.union(v.number(), v.null()),
    lastMessageSenderId: v.union(v.string(), v.null()),
    lastMessageSenderName: v.union(v.string(), v.null()),
    // Unread state
    unreadCount: v.number(),
    isRead: v.boolean(),
    lastReadAtMs: v.union(v.number(), v.null()),
    // Organization
    pinned: v.boolean(),
    pinnedAtMs: v.union(v.number(), v.null()),
    archived: v.boolean(),
    archivedAtMs: v.union(v.number(), v.null()),
    muted: v.boolean(),
    mutedAtMs: v.union(v.number(), v.null()),
    // Assignment (for routing)
    assignedToId: v.union(v.string(), v.null()),
    assignedToName: v.union(v.string(), v.null()),
    priority: v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent'), v.null()),
    // Timestamps
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_user_updatedAtMs', ['workspaceId', 'userId', 'updatedAtMs'])
    .index('by_workspace_user_sourceType', ['workspaceId', 'userId', 'sourceType'])
    .index('by_workspace_user_archived_updatedAtMs', ['workspaceId', 'userId', 'archived', 'updatedAtMs'])
    .index('by_workspace_user_pinned_updatedAtMs', ['workspaceId', 'userId', 'pinned', 'updatedAtMs'])
    .index('by_workspace_user_unread', ['workspaceId', 'userId', 'isRead']),

  // Privacy masking rules (for anonymized conversations)
  privacyMasks: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    // What's being masked
    resourceType: v.union(v.literal('conversation'), v.literal('channel'), v.literal('user')),
    resourceId: v.string(),
    // Masking configuration
    maskType: v.union(v.literal('pseudonym'), v.literal('relay_number'), v.literal('anonymous')),
    displayName: v.string(), // The masked display name shown to others
    realName: v.union(v.string(), v.null()), // The real name (admin only)
    relayIdentifier: v.union(v.string(), v.null()), // Relay phone/email if applicable
    // Access control
    visibleToRoles: v.array(v.string()), // Which roles can see real identity
    visibleToUserIds: v.array(v.string()), // Specific users who can see real identity
    // Timestamps
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_resource', ['workspaceId', 'resourceType', 'resourceId']),
})
