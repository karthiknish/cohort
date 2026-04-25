import { defineTable } from 'convex/server'
import { v } from 'convex/values'

import {
  jsonDeepArrayValidator,
  jsonDeepRecordValidator,
  jsonRecordValidator,
} from './jsonValidators'

export const opsTables = {
  workforceTimeSessions: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    personId: v.string(),
    personName: v.string(),
    role: v.string(),
    project: v.string(),
    status: v.union(
      v.literal('clocked-in'),
      v.literal('on-break'),
      v.literal('clocked-out'),
      v.literal('needs-review'),
    ),
    startedAtMs: v.number(),
    endedAtMs: v.union(v.number(), v.null()),
    durationMinutes: v.number(),
    locationLabel: v.string(),
    flaggedReason: v.union(v.string(), v.null()),
    managerReview: v.optional(
      v.union(
        v.literal('none'),
        v.literal('pending'),
        v.literal('approved'),
        v.literal('rejected'),
      ),
    ),
    approvedAtMs: v.optional(v.union(v.number(), v.null())),
    approvedById: v.optional(v.union(v.string(), v.null())),
    approvedByName: v.optional(v.union(v.string(), v.null())),
    managerNote: v.optional(v.union(v.string(), v.null())),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_updatedAtMs_legacyId', ['workspaceId', 'status', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_personId_updatedAtMs_legacyId', ['workspaceId', 'personId', 'updatedAtMs', 'legacyId']),

  workforceShifts: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    title: v.string(),
    assigneeId: v.union(v.string(), v.null()),
    assigneeName: v.string(),
    team: v.string(),
    dayStartMs: v.number(),
    dayLabel: v.string(),
    timeLabel: v.string(),
    coverageLabel: v.string(),
    status: v.union(
      v.literal('scheduled'),
      v.literal('open'),
      v.literal('swap-requested'),
    ),
    locationLabel: v.optional(v.string()),
    notes: v.optional(v.string()),
    requiredRole: v.optional(v.string()),
    startsAtMs: v.optional(v.number()),
    endsAtMs: v.optional(v.number()),
    acceptedByAssignee: v.optional(v.boolean()),
    conflictWithTimeOff: v.optional(v.string()),
    conflictWithAvailability: v.optional(v.string()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_dayStartMs_legacyId', ['workspaceId', 'dayStartMs', 'legacyId'])
    .index('by_workspace_status_dayStartMs_legacyId', ['workspaceId', 'status', 'dayStartMs', 'legacyId']),

  workforceAvailability: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    personId: v.string(),
    startMs: v.number(),
    endMs: v.number(),
    kind: v.union(v.literal('unavailable'), v.literal('preferred')),
    label: v.string(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_person_startMs', ['workspaceId', 'personId', 'startMs', 'legacyId'])
    .index('by_workspace_startMs_legacyId', ['workspaceId', 'startMs', 'legacyId']),

  workforceShiftSwaps: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    shiftLegacyId: v.string(),
    shiftTitle: v.string(),
    requestedBy: v.string(),
    requestedTo: v.string(),
    windowLabel: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('blocked'),
    ),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_updatedAtMs_legacyId', ['workspaceId', 'status', 'updatedAtMs', 'legacyId']),

  workforceFormTemplates: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    title: v.string(),
    category: v.string(),
    completionRate: v.number(),
    fieldsCount: v.number(),
    frequency: v.string(),
    fields: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        type: v.union(
          v.literal('text'),
          v.literal('select'),
          v.literal('photo'),
          v.literal('checklist'),
          v.literal('number'),
        ),
        required: v.boolean(),
      }),
    ),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId']),

  workforceFormSubmissions: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    templateLegacyId: v.string(),
    templateTitle: v.string(),
    submittedBy: v.string(),
    submittedAtMs: v.number(),
    status: v.union(
      v.literal('ready'),
      v.literal('needs-follow-up'),
      v.literal('in-review'),
    ),
    scoreCompleted: v.number(),
    scoreTotal: v.number(),
    answers: v.optional(
      v.array(
        v.object({
          fieldId: v.string(),
          value: v.string(),
        }),
      ),
    ),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_submittedAtMs_legacyId', ['workspaceId', 'submittedAtMs', 'legacyId'])
    .index('by_workspace_status_submittedAtMs_legacyId', ['workspaceId', 'status', 'submittedAtMs', 'legacyId']),

  workforceTimeOffBalances: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    label: v.string(),
    usedLabel: v.string(),
    remainingLabel: v.string(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId']),

  workforceTimeOffRequests: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    personId: v.string(),
    personName: v.string(),
    type: v.string(),
    windowLabel: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('declined'),
    ),
    approverName: v.string(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_updatedAtMs_legacyId', ['workspaceId', 'status', 'updatedAtMs', 'legacyId']),

  proposals: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    ownerId: v.union(v.string(), v.null()),
    agentConversationId: v.optional(v.union(v.string(), v.null())),
    lastAgentInteractionAtMs: v.optional(v.union(v.number(), v.null())),
    status: v.string(),
    stepProgress: v.number(),
    formData: jsonRecordValidator,
    aiInsights: v.union(jsonRecordValidator, v.null()),
    aiSuggestions: v.union(v.string(), v.null()),
    pdfUrl: v.union(v.string(), v.null()),
    pptUrl: v.union(v.string(), v.null()),
    pdfStorageId: v.optional(v.union(v.string(), v.null())),
    pptStorageId: v.optional(v.union(v.string(), v.null())),
    clientId: v.union(v.string(), v.null()),
    clientName: v.union(v.string(), v.null()),
    presentationDeck: v.union(jsonRecordValidator, v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    lastAutosaveAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_updatedAtMs_legacyId', ['workspaceId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_updatedAtMs_legacyId', ['workspaceId', 'status', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_clientId_updatedAtMs_legacyId', ['workspaceId', 'clientId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_status_clientId_updatedAtMs_legacyId', ['workspaceId', 'status', 'clientId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_agentConversationId', ['workspaceId', 'agentConversationId']),

  proposalVersions: defineTable({
    workspaceId: v.string(),
    proposalLegacyId: v.string(),
    legacyId: v.string(),
    versionNumber: v.number(),
    formData: jsonRecordValidator,
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

  proposalTemplates: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    formData: jsonRecordValidator,
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

  apiIdempotency: defineTable({
    key: v.string(),
    status: v.string(),
    requestId: v.union(v.string(), v.null()),
    method: v.union(v.string(), v.null()),
    path: v.union(v.string(), v.null()),
    response: v.union(
      v.null(),
      v.boolean(),
      v.number(),
      v.string(),
      jsonDeepArrayValidator,
      jsonDeepRecordValidator
    ),
    httpStatus: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  }).index('by_key', ['key']),

  schedulerAlertPreferences: defineTable({
    providerId: v.string(),
    failureThreshold: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_providerId', ['providerId'])
    .index('by_updatedAtMs', ['updatedAtMs']),

  alertRules: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    type: v.string(),
    metric: v.string(),
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
    severity: v.string(),
    enabled: v.boolean(),
    providerId: v.union(v.string(), v.null()),
    campaignId: v.union(v.string(), v.null()),
    formulaId: v.union(v.string(), v.null()),
    insightType: v.union(v.string(), v.null()),
    channels: v.array(v.string()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspaceId', ['workspaceId'])
    .index('by_workspaceId_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspaceId_enabled', ['workspaceId', 'enabled']),

  serverCache: defineTable({
    keyHash: v.string(),
    key: v.string(),
    value: v.string(),
    expiresAtMs: v.number(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_keyHash', ['keyHash'])
    .index('by_key', ['key'])
    .index('by_expiresAtMs', ['expiresAtMs']),

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

  directConversations: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    participantOneId: v.string(),
    participantOneName: v.string(),
    participantOneRole: v.union(v.string(), v.null()),
    participantTwoId: v.string(),
    participantTwoName: v.string(),
    participantTwoRole: v.union(v.string(), v.null()),
    lastMessageSnippet: v.union(v.string(), v.null()),
    lastMessageAtMs: v.union(v.number(), v.null()),
    lastMessageSenderId: v.union(v.string(), v.null()),
    readByParticipantOne: v.boolean(),
    readByParticipantTwo: v.boolean(),
    lastReadByParticipantOneAtMs: v.union(v.number(), v.null()),
    lastReadByParticipantTwoAtMs: v.union(v.number(), v.null()),
    archivedByParticipantOne: v.boolean(),
    archivedByParticipantTwo: v.boolean(),
    mutedByParticipantOne: v.boolean(),
    mutedByParticipantTwo: v.boolean(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_participantOne_participantTwo', ['workspaceId', 'participantOneId', 'participantTwoId'])
    .index('by_workspace_participantOne_updatedAtMs', ['workspaceId', 'participantOneId', 'updatedAtMs'])
    .index('by_workspace_participantTwo_updatedAtMs', ['workspaceId', 'participantTwoId', 'updatedAtMs'])
    .index('by_workspace_lastMessageAtMs', ['workspaceId', 'lastMessageAtMs'])
    .index('by_workspace_participantOne_read_updatedAtMs', ['workspaceId', 'participantOneId', 'readByParticipantOne', 'updatedAtMs'])
    .index('by_workspace_participantTwo_read_updatedAtMs', ['workspaceId', 'participantTwoId', 'readByParticipantTwo', 'updatedAtMs']),

  directMessages: defineTable({
    workspaceId: v.string(),
    conversationLegacyId: v.string(),
    legacyId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.union(v.string(), v.null()),
    content: v.string(),
    edited: v.boolean(),
    editedAtMs: v.union(v.number(), v.null()),
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
    readBy: v.array(v.string()),
    deliveredTo: v.array(v.string()),
    readAtMs: v.union(v.number(), v.null()),
    sharedTo: v.optional(v.union(v.array(v.literal('email')), v.null())),
    createdAtMs: v.number(),
    updatedAtMs: v.union(v.number(), v.null()),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_conversation_createdAtMs_legacyId', ['workspaceId', 'conversationLegacyId', 'createdAtMs', 'legacyId'])
    .index('by_workspace_sender_createdAtMs', ['workspaceId', 'senderId', 'createdAtMs']),

  conversationAssignments: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    resourceType: v.union(v.literal('direct_conversation'), v.literal('channel'), v.literal('message')),
    resourceId: v.string(),
    assignedToId: v.string(),
    assignedToName: v.string(),
    assignedById: v.union(v.string(), v.null()),
    assignedByName: v.union(v.string(), v.null()),
    routingReason: v.union(v.string(), v.null()),
    routingRuleId: v.union(v.string(), v.null()),
    priority: v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent')),
    status: v.union(v.literal('active'), v.literal('completed'), v.literal('escalated'), v.literal('transferred')),
    escalatedFromId: v.union(v.string(), v.null()),
    slaDeadlineMs: v.union(v.number(), v.null()),
    slaBreached: v.boolean(),
    firstResponseAtMs: v.union(v.number(), v.null()),
    resolvedAtMs: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_resource', ['workspaceId', 'resourceType', 'resourceId'])
    .index('by_workspace_assignedTo_status', ['workspaceId', 'assignedToId', 'status'])
    .index('by_workspace_status_priority', ['workspaceId', 'status', 'priority'])
    .index('by_workspace_slaDeadline', ['workspaceId', 'slaDeadlineMs'])
    .index('by_workspace_assignedTo_priority_createdAtMs', ['workspaceId', 'assignedToId', 'priority', 'createdAtMs'])
    .index('by_workspace_assignedTo_createdAtMs', ['workspaceId', 'assignedToId', 'createdAtMs']),

  messageAnalytics: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    conversationType: v.union(v.literal('direct'), v.literal('channel'), v.literal('thread')),
    conversationId: v.string(),
    messageId: v.string(),
    senderId: v.string(),
    firstReadAtMs: v.union(v.number(), v.null()),
    firstResponseAtMs: v.union(v.number(), v.null()),
    responseTimeMs: v.union(v.number(), v.null()),
    timeToReadMs: v.union(v.number(), v.null()),
    reactionCount: v.number(),
    replyCount: v.number(),
    shareCount: v.number(),
    deliveryAttempts: v.number(),
    deliveryStatus: v.union(v.literal('pending'), v.literal('delivered'), v.literal('failed')),
    deliveredAtMs: v.union(v.number(), v.null()),
    channelType: v.union(v.string(), v.null()),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_conversation_createdAtMs', ['workspaceId', 'conversationId', 'createdAtMs'])
    .index('by_workspace_sender_createdAtMs', ['workspaceId', 'senderId', 'createdAtMs'])
    .index('by_workspace_conversationType_responseTime', ['workspaceId', 'conversationType', 'responseTimeMs'])
    .index('by_workspace_createdAtMs', ['workspaceId', 'createdAtMs'])
    .index('by_workspace_conversationType_createdAtMs', ['workspaceId', 'conversationType', 'createdAtMs']),

  inboxItems: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    userId: v.string(),
    sourceType: v.union(v.literal('direct_message'), v.literal('channel'), v.literal('email')),
    sourceId: v.string(),
    sourceName: v.string(),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    otherParticipantId: v.union(v.string(), v.null()),
    otherParticipantName: v.union(v.string(), v.null()),
    lastMessageSnippet: v.union(v.string(), v.null()),
    lastMessageAtMs: v.union(v.number(), v.null()),
    lastMessageSenderId: v.union(v.string(), v.null()),
    lastMessageSenderName: v.union(v.string(), v.null()),
    unreadCount: v.number(),
    isRead: v.boolean(),
    lastReadAtMs: v.union(v.number(), v.null()),
    pinned: v.boolean(),
    pinnedAtMs: v.union(v.number(), v.null()),
    archived: v.boolean(),
    archivedAtMs: v.union(v.number(), v.null()),
    muted: v.boolean(),
    mutedAtMs: v.union(v.number(), v.null()),
    assignedToId: v.union(v.string(), v.null()),
    assignedToName: v.union(v.string(), v.null()),
    priority: v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent'), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_user_updatedAtMs', ['workspaceId', 'userId', 'updatedAtMs'])
    .index('by_workspace_user_updatedAtMs_legacyId', ['workspaceId', 'userId', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_user_sourceType', ['workspaceId', 'userId', 'sourceType'])
    .index('by_workspace_user_sourceType_updatedAtMs_legacyId', ['workspaceId', 'userId', 'sourceType', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_user_archived_updatedAtMs', ['workspaceId', 'userId', 'archived', 'updatedAtMs'])
    .index('by_workspace_user_archived_updatedAtMs_legacyId', ['workspaceId', 'userId', 'archived', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_user_pinned_updatedAtMs', ['workspaceId', 'userId', 'pinned', 'updatedAtMs'])
    .index('by_workspace_user_pinned_updatedAtMs_legacyId', ['workspaceId', 'userId', 'pinned', 'updatedAtMs', 'legacyId'])
    .index('by_workspace_user_unread', ['workspaceId', 'userId', 'isRead'])
    .index('by_workspace_user_unread_updatedAtMs_legacyId', ['workspaceId', 'userId', 'isRead', 'updatedAtMs', 'legacyId']),

  privacyMasks: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    resourceType: v.union(v.literal('conversation'), v.literal('channel'), v.literal('user')),
    resourceId: v.string(),
    maskType: v.union(v.literal('pseudonym'), v.literal('relay_number'), v.literal('anonymous')),
    displayName: v.string(),
    realName: v.union(v.string(), v.null()),
    relayIdentifier: v.union(v.string(), v.null()),
    visibleToRoles: v.array(v.string()),
    visibleToUserIds: v.array(v.string()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_resource', ['workspaceId', 'resourceType', 'resourceId']),
}
