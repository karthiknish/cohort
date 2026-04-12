import { defineTable } from 'convex/server'
import { v } from 'convex/values'

import { jsonLayer2Validator } from './jsonValidators'

export const marketingTables = {
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
    .index('by_workspace_provider', ['workspaceId', 'providerId'])
    .index('by_updatedAt', ['updatedAt']),

  analyticsIntegrations: defineTable({
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
    .index('by_workspace_provider', ['workspaceId', 'providerId'])
    .index('by_workspaceId', ['workspaceId'])
    .index('by_updatedAt', ['updatedAt']),

  meetingIntegrations: defineTable({
    workspaceId: v.string(),
    providerId: v.string(),
    userId: v.string(),
    userEmail: v.union(v.string(), v.null()),
    accessToken: v.union(v.string(), v.null()),
    refreshToken: v.union(v.string(), v.null()),
    idToken: v.union(v.string(), v.null()),
    scopes: v.array(v.string()),
    accessTokenExpiresAtMs: v.union(v.number(), v.null()),
    refreshTokenExpiresAtMs: v.union(v.number(), v.null()),
    linkedAtMs: v.union(v.number(), v.null()),
    lastUsedAtMs: v.union(v.number(), v.null()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_provider_user', ['workspaceId', 'providerId', 'userId'])
    .index('by_workspace_provider', ['workspaceId', 'providerId']),

  meetings: defineTable({
    workspaceId: v.string(),
    legacyId: v.string(),
    providerId: v.string(),
    integrationUserId: v.union(v.string(), v.null()),
    clientId: v.union(v.string(), v.null()),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    startTimeMs: v.number(),
    endTimeMs: v.number(),
    timezone: v.string(),
    meetLink: v.union(v.string(), v.null()),
    roomName: v.optional(v.union(v.string(), v.null())),
    calendarEventId: v.union(v.string(), v.null()),
    status: v.union(
      v.literal('scheduled'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    attendeeEmails: v.array(v.string()),
    createdBy: v.string(),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
    transcriptText: v.union(v.string(), v.null()),
    transcriptUpdatedAtMs: v.union(v.number(), v.null()),
    transcriptSource: v.union(v.string(), v.null()),
    transcriptProcessingState: v.optional(v.union(v.literal('idle'), v.literal('processing'), v.literal('failed'))),
    transcriptProcessingError: v.optional(v.union(v.string(), v.null())),
    notesSummary: v.union(v.string(), v.null()),
    notesUpdatedAtMs: v.union(v.number(), v.null()),
    notesModel: v.union(v.string(), v.null()),
    notesProcessingState: v.optional(v.union(v.literal('idle'), v.literal('processing'), v.literal('failed'))),
    notesProcessingError: v.optional(v.union(v.string(), v.null())),
  })
    .index('by_workspace_startTimeMs', ['workspaceId', 'startTimeMs'])
    .index('by_workspace_status_startTimeMs', ['workspaceId', 'status', 'startTimeMs'])
    .index('by_workspace_legacyId', ['workspaceId', 'legacyId'])
    .index('by_workspace_roomName', ['workspaceId', 'roomName'])
    .index('by_workspace_calendarEventId', ['workspaceId', 'calendarEventId'])
    .index('by_workspace_client_startTimeMs', ['workspaceId', 'clientId', 'startTimeMs']),

  meetingEvents: defineTable({
    workspaceId: v.string(),
    meetingLegacyId: v.string(),
    eventType: v.string(),
    payload: jsonLayer2Validator,
    receivedAtMs: v.number(),
  })
    .index('by_workspace_meeting_receivedAtMs', ['workspaceId', 'meetingLegacyId', 'receivedAtMs'])
    .index('by_workspace_receivedAtMs', ['workspaceId', 'receivedAtMs']),

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
    /** Canonical surface id (e.g. 'facebook', 'instagram', 'audience_network'). */
    surfaceId: v.optional(v.union(v.string(), v.null())),
    /** Legacy: kept as transitional alias for surfaceId on Meta rows. */
    publisherPlatform: v.optional(v.union(v.string(), v.null())),
    /** Native account currency for this metric row (e.g. 'USD', 'INR'). */
    currency: v.optional(v.union(v.string(), v.null())),
    /** How currency was determined: stamped at write time by the sync worker. */
    currencySource: v.optional(
      v.union(v.literal('metric'), v.literal('integration'), v.literal('unknown'), v.null()),
    ),
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
    rawPayload: v.optional(jsonLayer2Validator),
    createdAtMs: v.number(),
  })
    .index('by_workspace_provider_date', ['workspaceId', 'providerId', 'date'])
    .index('by_workspace_date', ['workspaceId', 'date']),

  // ==========================================================================
  // SOCIAL ORGANIC METRICS
  // Separate from adMetrics — these rows come from Page/Profile Insights APIs,
  // not from ad-account reporting. No spend/ROAS/CPA fields.
  // ==========================================================================

  /**
   * Daily aggregated organic metrics per surface entity (Page or IG profile).
   * Dedup key: workspaceId + clientId + surface + entityId + date.
   */
  socialMetricsDaily: defineTable({
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    /** 'facebook' | 'instagram' */
    surface: v.string(),
    /** Facebook Page ID or Instagram Business Account ID */
    entityId: v.string(),
    entityName: v.union(v.string(), v.null()),
    /** ISO date string YYYY-MM-DD */
    date: v.string(),
    // Delivery
    impressions: v.number(),
    reach: v.number(),
    // Engagement
    engagedUsers: v.number(),
    reactions: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    saves: v.optional(v.number()),
    // Growth
    followerCount: v.optional(v.number()),
    followerDelta: v.optional(v.number()),
    /** Derived: engagedUsers / reach (null when reach = 0) */
    engagementRate: v.optional(v.union(v.number(), v.null())),
    /** Raw API payload for debugging */
    rawPayload: v.optional(jsonLayer2Validator),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_surface_date', ['workspaceId', 'surface', 'date'])
    .index('by_workspace_client_surface_entity_date', ['workspaceId', 'clientId', 'surface', 'entityId', 'date']),

  /**
   * Post/media-level organic performance.
   * Dedup key: workspaceId + clientId + surface + contentId.
   */
  socialContentMetrics: defineTable({
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    /** 'facebook' | 'instagram' */
    surface: v.string(),
    /** Facebook Post ID or Instagram Media ID */
    contentId: v.string(),
    entityId: v.string(),
    entityName: v.union(v.string(), v.null()),
    /** Post publish date ISO string */
    publishedAt: v.union(v.string(), v.null()),
    contentType: v.union(v.string(), v.null()),
    contentUrl: v.union(v.string(), v.null()),
    message: v.union(v.string(), v.null()),
    impressions: v.number(),
    reach: v.number(),
    engagedUsers: v.number(),
    reactions: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    saves: v.optional(v.number()),
    videoViews: v.optional(v.number()),
    engagementRate: v.optional(v.union(v.number(), v.null())),
    rawPayload: v.optional(jsonLayer2Validator),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  })
    .index('by_workspace_surface_entity', ['workspaceId', 'surface', 'entityId'])
    .index('by_workspace_client_surface', ['workspaceId', 'clientId', 'surface']),

  /**
   * Social sync job queue — separate from adSyncJobs.
   */
  socialSyncJobs: defineTable({
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    /** 'facebook' | 'instagram' | null = both */
    surface: v.union(v.string(), v.null()),
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
    .index('by_workspace_client_surface_status', ['workspaceId', 'clientId', 'surface', 'status'])
    .index('by_status_processedAt', ['status', 'processedAtMs']),
}
