/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAtMs: number;
                  message: string;
                  read: boolean;
                  title: string;
                  type: string;
                  updatedAtMs: number | null;
                  userEmail: string | null;
                  userId: string | null;
                  userName: string | null;
                };
                model: "adminNotifications";
              }
            | {
                data: {
                  createdAtMs: number;
                  durationMs: number | null;
                  errors: Array<string>;
                  failedJobs: number | null;
                  failureThreshold: number | null;
                  hadQueuedJobs: boolean | null;
                  inspectedQueuedJobs: number | null;
                  notes: string | null;
                  operation: string | null;
                  processedJobs: number | null;
                  providerFailureThresholds: Array<{
                    failedJobs: number;
                    providerId: string;
                    threshold: number | null;
                  }>;
                  severity: string;
                  source: string;
                  successfulJobs: number | null;
                };
                model: "schedulerEvents";
              }
            | {
                data: {
                  archivedAt?: number | null;
                  createdAt: number;
                  lastMessageAt: number | null;
                  legacyId: string;
                  messageCount: number;
                  pinnedAt?: number | null;
                  previewSnippet?: string | null;
                  startedAt: number | null;
                  title: string | null;
                  updatedAt: number;
                  userId: string;
                  workspaceId: string;
                };
                model: "agentConversations";
              }
            | {
                data: {
                  action: string | null;
                  content: string;
                  conversationLegacyId: string;
                  createdAt: number;
                  executeResult: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  legacyId: string;
                  operation: string | null;
                  params: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  route: string | null;
                  type: "user" | "agent";
                  userId: string | null;
                  workspaceId: string;
                };
                model: "agentMessages";
              }
            | {
                data: {
                  createdAtMs: number;
                  description: string;
                  fixed?: boolean | null;
                  legacyId: string;
                  resolution?: string | null;
                  severity: string;
                  status: string;
                  title: string;
                  updatedAtMs: number;
                  userEmail: string | null;
                  userId: string | null;
                  userName: string | null;
                  workspaceId: string | null;
                };
                model: "problemReports";
              }
            | {
                data: {
                  createdAtMs: number;
                  onboardingTourCompleted: boolean;
                  onboardingTourCompletedAtMs: number | null;
                  updatedAtMs: number;
                  userId: string;
                  welcomeSeen?: boolean;
                  welcomeSeenAtMs?: number | null;
                };
                model: "onboardingStates";
              }
            | {
                data: {
                  acknowledgedBy: Array<string>;
                  actorId: string | null;
                  actorName: string | null;
                  body: string;
                  createdAtMs: number;
                  kind: string;
                  legacyId: string;
                  metadata?: Record<string, string | number | boolean | null>;
                  readBy: Array<string>;
                  recipientClientId: string | null;
                  recipientClientIds?: Array<string>;
                  recipientRoles: Array<string>;
                  recipientUserIds?: Array<string>;
                  resourceId: string;
                  resourceType: string;
                  title: string;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "notifications";
              }
            | {
                data: {
                  createdBy: string;
                  expiresAtMs: number;
                  storageId: string;
                  workspaceId: string;
                };
                model: "fileUploadGrants";
              }
            | {
                data: {
                  agencyId: string | null;
                  clientTeamRole?: string | null;
                  createdAtMs: number | null;
                  email: string | null;
                  emailLower: string | null;
                  legacyId: string;
                  name: string | null;
                  notificationPreferences?: {
                    categories?: {
                      ads?: { email: boolean; inApp: boolean };
                      collaboration?: { email: boolean; inApp: boolean };
                      digest?: { email: boolean; inApp: boolean };
                      meetings?: { email: boolean; inApp: boolean };
                      projects?: { email: boolean; inApp: boolean };
                      tasks?: { email: boolean; inApp: boolean };
                    };
                    emailAdAlerts?: boolean;
                    emailCollaboration?: boolean;
                    emailPerformanceDigest?: boolean;
                    emailTaskActivity?: boolean;
                    pauseAll?: boolean;
                    quietHours?: {
                      enabled: boolean;
                      end: string;
                      start: string;
                    };
                    version?: 2;
                  };
                  phoneNumber?: string | null;
                  photoUrl?: string | null;
                  regionalPreferences?: {
                    currency?: string | null;
                    locale?: string | null;
                    timezone?: string | null;
                  };
                  role: string | null;
                  status: string | null;
                  updatedAtMs: number | null;
                };
                model: "users";
              }
            | {
                data: {
                  createdAtMs: number;
                  description: string;
                  imageUrl: string | null;
                  legacyId: string | null;
                  priority: "low" | "medium" | "high";
                  references: Array<{ label: string; url: string }>;
                  status: "backlog" | "planned" | "in_progress" | "completed";
                  title: string;
                  updatedAtMs: number;
                };
                model: "platformFeatures";
              }
            | {
                data: {
                  acceptedAtMs: number | null;
                  createdAtMs: number;
                  email: string;
                  emailLower: string;
                  expiresAtMs: number;
                  invitedBy: string;
                  invitedByName: string | null;
                  legacyId: string | null;
                  message: string | null;
                  name: string | null;
                  role: "admin" | "team" | "client";
                  status: "pending" | "accepted" | "expired" | "revoked";
                  token: string;
                };
                model: "invitations";
              }
            | {
                data: {
                  createdAtMs: number;
                  createdBy: string | null;
                  description: string | null;
                  formula: string;
                  inputs: Array<string>;
                  isActive: boolean;
                  legacyId: string;
                  name: string;
                  outputMetric: string;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "customFormulas";
              }
            | {
                data: {
                  assignedTo: Array<string>;
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    type?: string | null;
                    url: string;
                  }>;
                  client: string | null;
                  clientId: string | null;
                  createdAtMs: number;
                  createdBy: string | null;
                  deletedAtMs: number | null;
                  description: string | null;
                  dueDateMs: number | null;
                  legacyId: string;
                  priority: string;
                  projectId: string | null;
                  projectName: string | null;
                  status: string;
                  tags?: Array<string>;
                  title: string;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "tasks";
              }
            | {
                data: {
                  attachments: Array<{
                    name: string;
                    size?: string | null;
                    type?: string | null;
                    url: string;
                  }>;
                  authorId: string | null;
                  authorName: string | null;
                  authorRole: string | null;
                  content: string;
                  createdAtMs: number;
                  deleted: boolean;
                  deletedAtMs: number | null;
                  deletedBy: string | null;
                  format: "markdown" | "plaintext";
                  legacyId: string;
                  mentions: Array<{
                    name: string;
                    role: string | null;
                    slug: string;
                  }>;
                  parentCommentId: string | null;
                  taskLegacyId: string;
                  threadRootId: string | null;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "taskComments";
              }
            | {
                data: {
                  accessToken: string | null;
                  accessTokenExpiresAtMs: number | null;
                  accountId: string | null;
                  accountName: string | null;
                  autoSyncEnabled: boolean | null;
                  clientId: string | null;
                  createdAt: number;
                  currency: string | null;
                  developerToken: string | null;
                  idToken: string | null;
                  lastSyncMessage: string | null;
                  lastSyncRequestedAtMs: number | null;
                  lastSyncStatus: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs: number | null;
                  linkedAtMs: number | null;
                  loginCustomerId: string | null;
                  managerCustomerId: string | null;
                  metaUseAsyncInsights?: boolean | null;
                  providerId: string;
                  refreshToken: string | null;
                  refreshTokenExpiresAtMs: number | null;
                  scheduledTimeframeDays: number | null;
                  scopes: Array<string>;
                  syncFrequencyMinutes: number | null;
                  updatedAt: number;
                  workspaceId: string;
                };
                model: "adIntegrations";
              }
            | {
                data: {
                  accessToken: string | null;
                  accessTokenExpiresAtMs: number | null;
                  accountId: string | null;
                  accountName: string | null;
                  autoSyncEnabled: boolean | null;
                  clientId: string | null;
                  createdAt: number;
                  currency: string | null;
                  developerToken: string | null;
                  idToken: string | null;
                  lastSyncMessage: string | null;
                  lastSyncRequestedAtMs: number | null;
                  lastSyncStatus: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs: number | null;
                  linkedAtMs: number | null;
                  loginCustomerId: string | null;
                  managerCustomerId: string | null;
                  providerId: string;
                  refreshToken: string | null;
                  refreshTokenExpiresAtMs: number | null;
                  scheduledTimeframeDays: number | null;
                  scopes: Array<string>;
                  syncFrequencyMinutes: number | null;
                  updatedAt: number;
                  workspaceId: string;
                };
                model: "analyticsIntegrations";
              }
            | {
                data: {
                  accessToken: string | null;
                  accessTokenExpiresAtMs: number | null;
                  createdAtMs: number;
                  idToken: string | null;
                  lastUsedAtMs: number | null;
                  linkedAtMs: number | null;
                  providerId: string;
                  refreshToken: string | null;
                  refreshTokenExpiresAtMs: number | null;
                  scopes: Array<string>;
                  updatedAtMs: number;
                  userEmail: string | null;
                  userId: string;
                  workspaceId: string;
                };
                model: "meetingIntegrations";
              }
            | {
                data: {
                  attendeeEmails: Array<string>;
                  calendarEventId: string | null;
                  clientId: string | null;
                  createdAtMs: number;
                  createdBy: string;
                  description: string | null;
                  endTimeMs: number;
                  integrationUserId: string | null;
                  legacyId: string;
                  meetLink: string | null;
                  notesModel: string | null;
                  notesProcessingError?: string | null;
                  notesProcessingState?: "idle" | "processing" | "failed";
                  notesStorageId?: string | null;
                  notesSummary: string | null;
                  notesUpdatedAtMs: number | null;
                  providerId: string;
                  roomName?: string | null;
                  startTimeMs: number;
                  status:
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled";
                  timezone: string;
                  title: string;
                  transcriptProcessingError?: string | null;
                  transcriptProcessingState?: "idle" | "processing" | "failed";
                  transcriptSource: string | null;
                  transcriptStorageId?: string | null;
                  transcriptText: string | null;
                  transcriptUpdatedAtMs: number | null;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "meetings";
              }
            | {
                data: {
                  eventType: string;
                  meetingLegacyId: string;
                  payload:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  receivedAtMs: number;
                  workspaceId: string;
                };
                model: "meetingEvents";
              }
            | {
                data: {
                  clientId: string | null;
                  createdAtMs: number;
                  errorMessage: string | null;
                  jobType:
                    | "initial-backfill"
                    | "scheduled-sync"
                    | "manual-sync";
                  processedAtMs: number | null;
                  providerId: string;
                  startedAtMs: number | null;
                  status: "queued" | "running" | "success" | "error";
                  timeframeDays: number;
                  workspaceId: string;
                };
                model: "adSyncJobs";
              }
            | {
                data: {
                  accountId: string | null;
                  campaignId: string | null;
                  campaignName: string | null;
                  clicks: number;
                  clientId: string | null;
                  conversions: number;
                  createdAtMs: number;
                  creatives: Array<{
                    clicks?: number;
                    conversions?: number;
                    id: string;
                    impressions?: number;
                    name: string;
                    revenue?: number;
                    spend?: number;
                    type: string;
                    url?: string;
                  }> | null;
                  currency?: string | null;
                  currencySource?: "metric" | "integration" | "unknown" | null;
                  date: string;
                  impressions: number;
                  providerId: string;
                  publisherPlatform?: string | null;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  revenue: number | null;
                  spend: number;
                  surfaceId?: string | null;
                  workspaceId: string;
                };
                model: "adMetrics";
              }
            | {
                data: {
                  clientId: string | null;
                  conversions: number;
                  createdAtMs: number;
                  currency: string | null;
                  date: string;
                  propertyId: string;
                  revenue: number | null;
                  sessions: number;
                  users: number;
                  workspaceId: string;
                };
                model: "analyticsMetricsDaily";
              }
            | {
                data: {
                  clientId: string | null;
                  conversions: number;
                  createdAtMs: number;
                  date: string;
                  dimension: "channel" | "source" | "device";
                  dimensionValue: string;
                  propertyId: string;
                  revenue: number | null;
                  sessions: number;
                  users: number;
                  workspaceId: string;
                };
                model: "analyticsMetricsBreakdown";
              }
            | {
                data: {
                  accessToken: string | null;
                  accessTokenExpiresAtMs: number | null;
                  clientId: string | null;
                  createdAt: number;
                  facebookPageId: string | null;
                  facebookPageName: string | null;
                  instagramBusinessId: string | null;
                  instagramBusinessName: string | null;
                  lastSyncMessage: string | null;
                  lastSyncRequestedAtMs: number | null;
                  lastSyncStatus: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs: number | null;
                  linkedAtMs: number | null;
                  metaUserId: string | null;
                  metaUserName: string | null;
                  refreshToken: string | null;
                  refreshTokenExpiresAtMs: number | null;
                  scopes: Array<string>;
                  updatedAt: number;
                  workspaceId: string;
                };
                model: "socialIntegrations";
              }
            | {
                data: {
                  clientId: string | null;
                  comments?: number;
                  createdAtMs: number;
                  date: string;
                  engagedUsers: number;
                  engagementRate?: number | null;
                  entityId: string;
                  entityName: string | null;
                  followerCount?: number;
                  followerDelta?: number;
                  impressions: number;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  reach: number;
                  reactions?: number;
                  saves?: number;
                  shares?: number;
                  surface: string;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "socialMetricsDaily";
              }
            | {
                data: {
                  clientId: string | null;
                  comments?: number;
                  contentId: string;
                  contentType: string | null;
                  contentUrl: string | null;
                  createdAtMs: number;
                  engagedUsers: number;
                  engagementRate?: number | null;
                  entityId: string;
                  entityName: string | null;
                  impressions: number;
                  message: string | null;
                  publishedAt: string | null;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  reach: number;
                  reactions?: number;
                  saves?: number;
                  shares?: number;
                  surface: string;
                  updatedAtMs: number;
                  videoViews?: number;
                  workspaceId: string;
                };
                model: "socialContentMetrics";
              }
            | {
                data: {
                  clientId: string | null;
                  createdAtMs: number;
                  errorMessage: string | null;
                  jobType:
                    | "initial-backfill"
                    | "scheduled-sync"
                    | "manual-sync";
                  processedAtMs: number | null;
                  startedAtMs: number | null;
                  status: "queued" | "running" | "success" | "error";
                  surface: string | null;
                  timeframeDays: number;
                  workspaceId: string;
                };
                model: "socialSyncJobs";
              }
            | {
                data: {
                  changeField: string | null;
                  entryId: string | null;
                  objectId: string | null;
                  objectType: string | null;
                  payload: any;
                  receivedAtMs: number;
                  verb: string | null;
                };
                model: "metaWebhookEvents";
              }
            | {
                data: {
                  archivedAtMs: number | null;
                  channelType: string;
                  createdAtMs: number;
                  createdBy: string;
                  description: string | null;
                  legacyId: string;
                  memberIds: Array<string>;
                  memberSummaries: Array<{
                    email?: string | null;
                    id: string;
                    name: string;
                    role: string | null;
                  }>;
                  name: string;
                  nameLower: string;
                  updatedAtMs: number;
                  visibility: "public" | "private";
                  workspaceId: string;
                };
                model: "collaborationChannels";
              }
            | {
                data: {
                  avatarStorageId: string;
                  channelKey: string;
                  updatedAtMs: number;
                  updatedBy: string;
                  workspaceId: string;
                };
                model: "collaborationChannelAvatars";
              }
            | {
                data: {
                  attachments: Array<{
                    name: string;
                    size?: string | null;
                    storageId?: string | null;
                    type?: string | null;
                    url: string;
                  }> | null;
                  channelId?: string | null;
                  channelType: string;
                  clientId: string | null;
                  content: string;
                  createdAtMs: number;
                  deleted: boolean;
                  deletedAtMs: number | null;
                  deletedBy: string | null;
                  deliveredTo: Array<string>;
                  format: "markdown" | "plaintext";
                  isPinned: boolean;
                  isThreadRoot: boolean;
                  legacyId: string;
                  mentions: Array<{
                    name: string;
                    role: string | null;
                    slug: string;
                  }> | null;
                  parentMessageId: string | null;
                  pinnedAtMs: number | null;
                  pinnedBy: string | null;
                  projectId: string | null;
                  reactions: Array<{
                    count: number;
                    emoji: string;
                    userIds: Array<string>;
                  }> | null;
                  readBy: Array<string>;
                  senderId: string | null;
                  senderName: string;
                  senderRole: string | null;
                  sharedTo?: Array<"email"> | null;
                  threadLastReplyAtMs: number | null;
                  threadReplyCount: number | null;
                  threadRootId: string | null;
                  updatedAtMs: number | null;
                  workspaceId: string;
                };
                model: "collaborationMessages";
              }
            | {
                data: {
                  channelId?: string | null;
                  channelType: string;
                  clientId: string | null;
                  lastReadCreatedAtMs: number;
                  lastReadLegacyId: string;
                  projectId: string | null;
                  scopeType: "channel" | "thread";
                  threadRootId: string | null;
                  updatedAtMs: number;
                  userId: string;
                  workspaceId: string;
                };
                model: "collaborationReadCheckpoints";
              }
            | {
                data: {
                  channelId: string;
                  channelType: string;
                  clientId: string | null;
                  expiresAtMs: number;
                  name: string;
                  projectId: string | null;
                  role: string | null;
                  updatedAtMs: number;
                  userId: string;
                  workspaceId: string;
                };
                model: "collaborationTyping";
              }
            | {
                data: {
                  accountManager: string;
                  createdAtMs: number;
                  createdBy: string | null;
                  deletedAtMs: number | null;
                  legacyId: string;
                  name: string;
                  nameLower: string;
                  teamMembers: Array<{ name: string; role: string }>;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "clients";
              }
            | {
                data: {
                  clientId: string | null;
                  clientName: string | null;
                  createdAtMs: number;
                  deletedAtMs: number | null;
                  description: string | null;
                  endDateMs: number | null;
                  legacyId: string;
                  name: string;
                  nameLower: string;
                  ownerId: string | null;
                  startDateMs: number | null;
                  status: string;
                  tags: Array<string>;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "projects";
              }
            | {
                data: {
                  createdAtMs: number;
                  description: string | null;
                  endDateMs: number | null;
                  legacyId: string;
                  order: number | null;
                  ownerId: string | null;
                  projectId: string;
                  startDateMs: number | null;
                  startDateSortKey: number;
                  status: string;
                  title: string;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "projectMilestones";
              }
            | {
                data: {
                  agentConversationId?: string | null;
                  aiInsights: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  aiSuggestions: string | null;
                  clientId: string | null;
                  clientName: string | null;
                  createdAtMs: number;
                  formData: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  lastAgentInteractionAtMs?: number | null;
                  lastAutosaveAtMs: number;
                  legacyId: string;
                  ownerId: string | null;
                  pdfStorageId?: string | null;
                  pdfUrl: string | null;
                  pptStorageId?: string | null;
                  pptUrl: string | null;
                  presentationDeck: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  status: string;
                  stepProgress: number;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "proposals";
              }
            | {
                data: {
                  changeDescription: string | null;
                  createdAtMs: number;
                  createdBy: string;
                  createdByName: string | null;
                  formData: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  legacyId: string;
                  proposalLegacyId: string;
                  status: string;
                  stepProgress: number;
                  versionNumber: number;
                  workspaceId: string;
                };
                model: "proposalVersions";
              }
            | {
                data: {
                  createdAtMs: number;
                  createdBy: string | null;
                  description: string | null;
                  formData: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  industry: string | null;
                  isDefault: boolean;
                  legacyId: string;
                  name: string;
                  tags: Array<string>;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "proposalTemplates";
              }
            | {
                data: {
                  clientId: string | null;
                  clientName: string | null;
                  createdAtMs: number;
                  duration: number | null;
                  error: string | null;
                  eventType: string;
                  legacyId: string;
                  metadata: Record<string, string | number | boolean | null>;
                  proposalId: string;
                  userId: string;
                  workspaceId: string;
                };
                model: "proposalAnalyticsEvents";
              }
            | {
                data: {
                  createdAtMs: number;
                  httpStatus: number | null;
                  key: string;
                  method: string | null;
                  path: string | null;
                  requestId: string | null;
                  response:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                      >;
                  status: string;
                  updatedAtMs: number;
                };
                model: "apiIdempotency";
              }
            | {
                data: {
                  createdAtMs: number;
                  failureThreshold: number | null;
                  providerId: string;
                  updatedAtMs: number;
                };
                model: "schedulerAlertPreferences";
              }
            | {
                data: {
                  campaignId: string | null;
                  channels: Array<string>;
                  condition: {
                    direction?: "up" | "down" | null;
                    operator: "gt" | "lt" | "gte" | "lte" | "eq" | "ne";
                    percentage?: number | null;
                    threshold: number | string;
                    windowSize?: number | null;
                  };
                  createdAtMs: number;
                  description: string | null;
                  enabled: boolean;
                  formulaId: string | null;
                  insightType: string | null;
                  legacyId: string;
                  metric: string;
                  name: string;
                  providerId: string | null;
                  severity: string;
                  type: string;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "alertRules";
              }
            | {
                data: {
                  createdAtMs: number;
                  expiresAtMs: number;
                  key: string;
                  keyHash: string;
                  updatedAtMs: number;
                  value: string;
                };
                model: "serverCache";
              }
            | {
                data: {
                  action: string;
                  actorEmail: string | null;
                  actorId: string;
                  ip: string | null;
                  metadata?: Record<string, string | number | boolean | null>;
                  requestId: string | null;
                  targetId: string | null;
                  timestampMs: number;
                  userAgent: string | null;
                  workspaceId: string | null;
                };
                model: "auditLogs";
              }
            | {
                data: {
                  archivedByParticipantOne: boolean;
                  archivedByParticipantTwo: boolean;
                  createdAtMs: number;
                  lastMessageAtMs: number | null;
                  lastMessageSenderId: string | null;
                  lastMessageSnippet: string | null;
                  lastReadByParticipantOneAtMs: number | null;
                  lastReadByParticipantTwoAtMs: number | null;
                  legacyId: string;
                  mutedByParticipantOne: boolean;
                  mutedByParticipantTwo: boolean;
                  participantOneId: string;
                  participantOneName: string;
                  participantOneRole: string | null;
                  participantTwoId: string;
                  participantTwoName: string;
                  participantTwoRole: string | null;
                  readByParticipantOne: boolean;
                  readByParticipantTwo: boolean;
                  unreadCountParticipantOne?: number;
                  unreadCountParticipantTwo?: number;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "directConversations";
              }
            | {
                data: {
                  attachments: Array<{
                    name: string;
                    size?: string | null;
                    storageId?: string | null;
                    type?: string | null;
                    url: string;
                  }> | null;
                  content: string;
                  conversationLegacyId: string;
                  createdAtMs: number;
                  deleted: boolean;
                  deletedAtMs: number | null;
                  deletedBy: string | null;
                  deliveredTo: Array<string>;
                  edited: boolean;
                  editedAtMs: number | null;
                  legacyId: string;
                  reactions: Array<{
                    count: number;
                    emoji: string;
                    userIds: Array<string>;
                  }> | null;
                  readAtMs: number | null;
                  readBy: Array<string>;
                  senderId: string;
                  senderName: string;
                  senderRole: string | null;
                  sharedTo?: Array<"email"> | null;
                  updatedAtMs: number | null;
                  workspaceId: string;
                };
                model: "directMessages";
              }
            | {
                data: {
                  assignedById: string | null;
                  assignedByName: string | null;
                  assignedToId: string;
                  assignedToName: string;
                  createdAtMs: number;
                  escalatedFromId: string | null;
                  firstResponseAtMs: number | null;
                  legacyId: string;
                  priority: "low" | "normal" | "high" | "urgent";
                  resolvedAtMs: number | null;
                  resourceId: string;
                  resourceType: "direct_conversation" | "channel" | "message";
                  routingReason: string | null;
                  routingRuleId: string | null;
                  slaBreached: boolean;
                  slaDeadlineMs: number | null;
                  status: "active" | "completed" | "escalated" | "transferred";
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "conversationAssignments";
              }
            | {
                data: {
                  channelType: string | null;
                  clientId: string | null;
                  conversationId: string;
                  conversationType: "direct" | "channel" | "thread";
                  createdAtMs: number;
                  deliveredAtMs: number | null;
                  deliveryAttempts: number;
                  deliveryStatus: "pending" | "delivered" | "failed";
                  firstReadAtMs: number | null;
                  firstResponseAtMs: number | null;
                  legacyId: string;
                  messageId: string;
                  projectId: string | null;
                  reactionCount: number;
                  replyCount: number;
                  responseTimeMs: number | null;
                  senderId: string;
                  shareCount: number;
                  timeToReadMs: number | null;
                  updatedAtMs: number;
                  workspaceId: string;
                };
                model: "messageAnalytics";
              }
            | {
                data: {
                  archived: boolean;
                  archivedAtMs: number | null;
                  assignedToId: string | null;
                  assignedToName: string | null;
                  clientId: string | null;
                  createdAtMs: number;
                  isRead: boolean;
                  lastMessageAtMs: number | null;
                  lastMessageSenderId: string | null;
                  lastMessageSenderName: string | null;
                  lastMessageSnippet: string | null;
                  lastReadAtMs: number | null;
                  legacyId: string;
                  muted: boolean;
                  mutedAtMs: number | null;
                  otherParticipantId: string | null;
                  otherParticipantName: string | null;
                  pinned: boolean;
                  pinnedAtMs: number | null;
                  priority: "low" | "normal" | "high" | "urgent" | null;
                  projectId: string | null;
                  sourceId: string;
                  sourceName: string;
                  sourceType: "direct_message" | "channel" | "email";
                  unreadCount: number;
                  updatedAtMs: number;
                  userId: string;
                  workspaceId: string;
                };
                model: "inboxItems";
              }
            | {
                data: {
                  createdAtMs: number;
                  displayName: string;
                  legacyId: string;
                  maskType: "pseudonym" | "relay_number" | "anonymous";
                  realName: string | null;
                  relayIdentifier: string | null;
                  resourceId: string;
                  resourceType: "conversation" | "channel" | "user";
                  updatedAtMs: number;
                  visibleToRoles: Array<string>;
                  visibleToUserIds: Array<string>;
                  workspaceId: string;
                };
                model: "privacyMasks";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any,
        Name
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "adminNotifications";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "type"
                    | "title"
                    | "message"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "read"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "createdAtMs"
                    | "source"
                    | "operation"
                    | "processedJobs"
                    | "successfulJobs"
                    | "failedJobs"
                    | "hadQueuedJobs"
                    | "inspectedQueuedJobs"
                    | "durationMs"
                    | "severity"
                    | "errors"
                    | "notes"
                    | "failureThreshold"
                    | "providerFailureThresholds"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentConversations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "title"
                    | "startedAt"
                    | "lastMessageAt"
                    | "messageCount"
                    | "pinnedAt"
                    | "archivedAt"
                    | "previewSnippet"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentMessages";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "type"
                    | "content"
                    | "createdAt"
                    | "userId"
                    | "action"
                    | "route"
                    | "operation"
                    | "params"
                    | "executeResult"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "problemReports";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "workspaceId"
                    | "title"
                    | "description"
                    | "severity"
                    | "status"
                    | "fixed"
                    | "resolution"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "onboardingStates";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "onboardingTourCompleted"
                    | "onboardingTourCompletedAtMs"
                    | "welcomeSeenAtMs"
                    | "welcomeSeen"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "notifications";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "kind"
                    | "title"
                    | "body"
                    | "actorId"
                    | "actorName"
                    | "resourceType"
                    | "resourceId"
                    | "recipientRoles"
                    | "recipientClientId"
                    | "recipientClientIds"
                    | "recipientUserIds"
                    | "readBy"
                    | "acknowledgedBy"
                    | "metadata"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "fileUploadGrants";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "storageId"
                    | "createdBy"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "users";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "name"
                    | "role"
                    | "clientTeamRole"
                    | "status"
                    | "agencyId"
                    | "phoneNumber"
                    | "photoUrl"
                    | "notificationPreferences"
                    | "regionalPreferences"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "platformFeatures";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "imageUrl"
                    | "references"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "role"
                    | "name"
                    | "message"
                    | "status"
                    | "invitedBy"
                    | "invitedByName"
                    | "token"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "acceptedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "customFormulas";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formula"
                    | "inputs"
                    | "outputMetric"
                    | "isActive"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "tasks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "assignedTo"
                    | "client"
                    | "clientId"
                    | "projectId"
                    | "projectName"
                    | "dueDateMs"
                    | "tags"
                    | "attachments"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "taskComments";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "taskLegacyId"
                    | "legacyId"
                    | "content"
                    | "format"
                    | "authorId"
                    | "authorName"
                    | "authorRole"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "mentions"
                    | "parentCommentId"
                    | "threadRootId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "metaUseAsyncInsights"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "userId"
                    | "userEmail"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "scopes"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "linkedAtMs"
                    | "lastUsedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetings";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "providerId"
                    | "integrationUserId"
                    | "clientId"
                    | "title"
                    | "description"
                    | "startTimeMs"
                    | "endTimeMs"
                    | "timezone"
                    | "meetLink"
                    | "roomName"
                    | "calendarEventId"
                    | "status"
                    | "attendeeEmails"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "transcriptText"
                    | "transcriptUpdatedAtMs"
                    | "transcriptSource"
                    | "transcriptProcessingState"
                    | "transcriptProcessingError"
                    | "notesSummary"
                    | "notesUpdatedAtMs"
                    | "notesModel"
                    | "notesProcessingState"
                    | "notesProcessingError"
                    | "notesStorageId"
                    | "transcriptStorageId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "meetingLegacyId"
                    | "eventType"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adSyncJobs";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adMetrics";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accountId"
                    | "surfaceId"
                    | "publisherPlatform"
                    | "currency"
                    | "currencySource"
                    | "date"
                    | "spend"
                    | "impressions"
                    | "clicks"
                    | "conversions"
                    | "revenue"
                    | "campaignId"
                    | "campaignName"
                    | "creatives"
                    | "rawPayload"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsDaily";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "currency"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsBreakdown";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "dimension"
                    | "dimensionValue"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "accessToken"
                    | "refreshToken"
                    | "scopes"
                    | "metaUserId"
                    | "metaUserName"
                    | "facebookPageId"
                    | "facebookPageName"
                    | "instagramBusinessId"
                    | "instagramBusinessName"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialMetricsDaily";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "entityId"
                    | "entityName"
                    | "date"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "followerCount"
                    | "followerDelta"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialContentMetrics";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "contentId"
                    | "entityId"
                    | "entityName"
                    | "publishedAt"
                    | "contentType"
                    | "contentUrl"
                    | "message"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "videoViews"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialSyncJobs";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "metaWebhookEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "objectId"
                    | "objectType"
                    | "changeField"
                    | "verb"
                    | "entryId"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannels";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "channelType"
                    | "visibility"
                    | "memberIds"
                    | "memberSummaries"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "archivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannelAvatars";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelKey"
                    | "avatarStorageId"
                    | "updatedAtMs"
                    | "updatedBy"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationMessages";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "format"
                    | "mentions"
                    | "reactions"
                    | "parentMessageId"
                    | "threadRootId"
                    | "isThreadRoot"
                    | "threadReplyCount"
                    | "threadLastReplyAtMs"
                    | "readBy"
                    | "deliveredTo"
                    | "isPinned"
                    | "pinnedAtMs"
                    | "pinnedBy"
                    | "sharedTo"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationReadCheckpoints";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "userId"
                    | "scopeType"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "threadRootId"
                    | "lastReadCreatedAtMs"
                    | "lastReadLegacyId"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationTyping";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "userId"
                    | "name"
                    | "role"
                    | "updatedAtMs"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "clients";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "accountManager"
                    | "teamMembers"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projects";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "status"
                    | "clientId"
                    | "clientName"
                    | "startDateMs"
                    | "endDateMs"
                    | "tags"
                    | "ownerId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectMilestones";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "projectId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "startDateMs"
                    | "endDateMs"
                    | "startDateSortKey"
                    | "ownerId"
                    | "order"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposals";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "ownerId"
                    | "agentConversationId"
                    | "lastAgentInteractionAtMs"
                    | "status"
                    | "stepProgress"
                    | "formData"
                    | "aiInsights"
                    | "aiSuggestions"
                    | "pdfUrl"
                    | "pptUrl"
                    | "pdfStorageId"
                    | "pptStorageId"
                    | "clientId"
                    | "clientName"
                    | "presentationDeck"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "lastAutosaveAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalVersions";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "proposalLegacyId"
                    | "legacyId"
                    | "versionNumber"
                    | "formData"
                    | "status"
                    | "stepProgress"
                    | "changeDescription"
                    | "createdBy"
                    | "createdByName"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalTemplates";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formData"
                    | "industry"
                    | "tags"
                    | "isDefault"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalAnalyticsEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "eventType"
                    | "proposalId"
                    | "userId"
                    | "clientId"
                    | "clientName"
                    | "metadata"
                    | "duration"
                    | "error"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apiIdempotency";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "key"
                    | "status"
                    | "requestId"
                    | "method"
                    | "path"
                    | "response"
                    | "httpStatus"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerAlertPreferences";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "providerId"
                    | "failureThreshold"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "alertRules";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "type"
                    | "metric"
                    | "condition"
                    | "severity"
                    | "enabled"
                    | "providerId"
                    | "campaignId"
                    | "formulaId"
                    | "insightType"
                    | "channels"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "serverCache";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "keyHash"
                    | "key"
                    | "value"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditLogs";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "actorId"
                    | "actorEmail"
                    | "targetId"
                    | "workspaceId"
                    | "metadata"
                    | "ip"
                    | "userAgent"
                    | "requestId"
                    | "timestampMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directConversations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "participantOneId"
                    | "participantOneName"
                    | "participantOneRole"
                    | "participantTwoId"
                    | "participantTwoName"
                    | "participantTwoRole"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "readByParticipantOne"
                    | "readByParticipantTwo"
                    | "unreadCountParticipantOne"
                    | "unreadCountParticipantTwo"
                    | "lastReadByParticipantOneAtMs"
                    | "lastReadByParticipantTwoAtMs"
                    | "archivedByParticipantOne"
                    | "archivedByParticipantTwo"
                    | "mutedByParticipantOne"
                    | "mutedByParticipantTwo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directMessages";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "edited"
                    | "editedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "reactions"
                    | "readBy"
                    | "deliveredTo"
                    | "readAtMs"
                    | "sharedTo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "conversationAssignments";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "assignedToId"
                    | "assignedToName"
                    | "assignedById"
                    | "assignedByName"
                    | "routingReason"
                    | "routingRuleId"
                    | "priority"
                    | "status"
                    | "escalatedFromId"
                    | "slaDeadlineMs"
                    | "slaBreached"
                    | "firstResponseAtMs"
                    | "resolvedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "messageAnalytics";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "conversationType"
                    | "conversationId"
                    | "messageId"
                    | "senderId"
                    | "firstReadAtMs"
                    | "firstResponseAtMs"
                    | "responseTimeMs"
                    | "timeToReadMs"
                    | "reactionCount"
                    | "replyCount"
                    | "shareCount"
                    | "deliveryAttempts"
                    | "deliveryStatus"
                    | "deliveredAtMs"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "inboxItems";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "sourceType"
                    | "sourceId"
                    | "sourceName"
                    | "clientId"
                    | "projectId"
                    | "otherParticipantId"
                    | "otherParticipantName"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "lastMessageSenderName"
                    | "unreadCount"
                    | "isRead"
                    | "lastReadAtMs"
                    | "pinned"
                    | "pinnedAtMs"
                    | "archived"
                    | "archivedAtMs"
                    | "muted"
                    | "mutedAtMs"
                    | "assignedToId"
                    | "assignedToName"
                    | "priority"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "privacyMasks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "maskType"
                    | "displayName"
                    | "realName"
                    | "relayIdentifier"
                    | "visibleToRoles"
                    | "visibleToUserIds"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any,
        Name
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "adminNotifications";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "type"
                    | "title"
                    | "message"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "read"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "createdAtMs"
                    | "source"
                    | "operation"
                    | "processedJobs"
                    | "successfulJobs"
                    | "failedJobs"
                    | "hadQueuedJobs"
                    | "inspectedQueuedJobs"
                    | "durationMs"
                    | "severity"
                    | "errors"
                    | "notes"
                    | "failureThreshold"
                    | "providerFailureThresholds"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentConversations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "title"
                    | "startedAt"
                    | "lastMessageAt"
                    | "messageCount"
                    | "pinnedAt"
                    | "archivedAt"
                    | "previewSnippet"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentMessages";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "type"
                    | "content"
                    | "createdAt"
                    | "userId"
                    | "action"
                    | "route"
                    | "operation"
                    | "params"
                    | "executeResult"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "problemReports";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "workspaceId"
                    | "title"
                    | "description"
                    | "severity"
                    | "status"
                    | "fixed"
                    | "resolution"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "onboardingStates";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "onboardingTourCompleted"
                    | "onboardingTourCompletedAtMs"
                    | "welcomeSeenAtMs"
                    | "welcomeSeen"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "notifications";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "kind"
                    | "title"
                    | "body"
                    | "actorId"
                    | "actorName"
                    | "resourceType"
                    | "resourceId"
                    | "recipientRoles"
                    | "recipientClientId"
                    | "recipientClientIds"
                    | "recipientUserIds"
                    | "readBy"
                    | "acknowledgedBy"
                    | "metadata"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "fileUploadGrants";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "storageId"
                    | "createdBy"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "users";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "name"
                    | "role"
                    | "clientTeamRole"
                    | "status"
                    | "agencyId"
                    | "phoneNumber"
                    | "photoUrl"
                    | "notificationPreferences"
                    | "regionalPreferences"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "platformFeatures";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "imageUrl"
                    | "references"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "role"
                    | "name"
                    | "message"
                    | "status"
                    | "invitedBy"
                    | "invitedByName"
                    | "token"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "acceptedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "customFormulas";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formula"
                    | "inputs"
                    | "outputMetric"
                    | "isActive"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "tasks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "assignedTo"
                    | "client"
                    | "clientId"
                    | "projectId"
                    | "projectName"
                    | "dueDateMs"
                    | "tags"
                    | "attachments"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "taskComments";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "taskLegacyId"
                    | "legacyId"
                    | "content"
                    | "format"
                    | "authorId"
                    | "authorName"
                    | "authorRole"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "mentions"
                    | "parentCommentId"
                    | "threadRootId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "metaUseAsyncInsights"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "userId"
                    | "userEmail"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "scopes"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "linkedAtMs"
                    | "lastUsedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetings";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "providerId"
                    | "integrationUserId"
                    | "clientId"
                    | "title"
                    | "description"
                    | "startTimeMs"
                    | "endTimeMs"
                    | "timezone"
                    | "meetLink"
                    | "roomName"
                    | "calendarEventId"
                    | "status"
                    | "attendeeEmails"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "transcriptText"
                    | "transcriptUpdatedAtMs"
                    | "transcriptSource"
                    | "transcriptProcessingState"
                    | "transcriptProcessingError"
                    | "notesSummary"
                    | "notesUpdatedAtMs"
                    | "notesModel"
                    | "notesProcessingState"
                    | "notesProcessingError"
                    | "notesStorageId"
                    | "transcriptStorageId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "meetingLegacyId"
                    | "eventType"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adSyncJobs";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adMetrics";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accountId"
                    | "surfaceId"
                    | "publisherPlatform"
                    | "currency"
                    | "currencySource"
                    | "date"
                    | "spend"
                    | "impressions"
                    | "clicks"
                    | "conversions"
                    | "revenue"
                    | "campaignId"
                    | "campaignName"
                    | "creatives"
                    | "rawPayload"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsDaily";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "currency"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsBreakdown";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "dimension"
                    | "dimensionValue"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialIntegrations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "accessToken"
                    | "refreshToken"
                    | "scopes"
                    | "metaUserId"
                    | "metaUserName"
                    | "facebookPageId"
                    | "facebookPageName"
                    | "instagramBusinessId"
                    | "instagramBusinessName"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialMetricsDaily";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "entityId"
                    | "entityName"
                    | "date"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "followerCount"
                    | "followerDelta"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialContentMetrics";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "contentId"
                    | "entityId"
                    | "entityName"
                    | "publishedAt"
                    | "contentType"
                    | "contentUrl"
                    | "message"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "videoViews"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialSyncJobs";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "metaWebhookEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "objectId"
                    | "objectType"
                    | "changeField"
                    | "verb"
                    | "entryId"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannels";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "channelType"
                    | "visibility"
                    | "memberIds"
                    | "memberSummaries"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "archivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannelAvatars";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelKey"
                    | "avatarStorageId"
                    | "updatedAtMs"
                    | "updatedBy"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationMessages";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "format"
                    | "mentions"
                    | "reactions"
                    | "parentMessageId"
                    | "threadRootId"
                    | "isThreadRoot"
                    | "threadReplyCount"
                    | "threadLastReplyAtMs"
                    | "readBy"
                    | "deliveredTo"
                    | "isPinned"
                    | "pinnedAtMs"
                    | "pinnedBy"
                    | "sharedTo"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationReadCheckpoints";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "userId"
                    | "scopeType"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "threadRootId"
                    | "lastReadCreatedAtMs"
                    | "lastReadLegacyId"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationTyping";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "userId"
                    | "name"
                    | "role"
                    | "updatedAtMs"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "clients";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "accountManager"
                    | "teamMembers"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projects";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "status"
                    | "clientId"
                    | "clientName"
                    | "startDateMs"
                    | "endDateMs"
                    | "tags"
                    | "ownerId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectMilestones";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "projectId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "startDateMs"
                    | "endDateMs"
                    | "startDateSortKey"
                    | "ownerId"
                    | "order"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposals";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "ownerId"
                    | "agentConversationId"
                    | "lastAgentInteractionAtMs"
                    | "status"
                    | "stepProgress"
                    | "formData"
                    | "aiInsights"
                    | "aiSuggestions"
                    | "pdfUrl"
                    | "pptUrl"
                    | "pdfStorageId"
                    | "pptStorageId"
                    | "clientId"
                    | "clientName"
                    | "presentationDeck"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "lastAutosaveAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalVersions";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "proposalLegacyId"
                    | "legacyId"
                    | "versionNumber"
                    | "formData"
                    | "status"
                    | "stepProgress"
                    | "changeDescription"
                    | "createdBy"
                    | "createdByName"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalTemplates";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formData"
                    | "industry"
                    | "tags"
                    | "isDefault"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalAnalyticsEvents";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "eventType"
                    | "proposalId"
                    | "userId"
                    | "clientId"
                    | "clientName"
                    | "metadata"
                    | "duration"
                    | "error"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apiIdempotency";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "key"
                    | "status"
                    | "requestId"
                    | "method"
                    | "path"
                    | "response"
                    | "httpStatus"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerAlertPreferences";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "providerId"
                    | "failureThreshold"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "alertRules";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "type"
                    | "metric"
                    | "condition"
                    | "severity"
                    | "enabled"
                    | "providerId"
                    | "campaignId"
                    | "formulaId"
                    | "insightType"
                    | "channels"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "serverCache";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "keyHash"
                    | "key"
                    | "value"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditLogs";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "actorId"
                    | "actorEmail"
                    | "targetId"
                    | "workspaceId"
                    | "metadata"
                    | "ip"
                    | "userAgent"
                    | "requestId"
                    | "timestampMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directConversations";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "participantOneId"
                    | "participantOneName"
                    | "participantOneRole"
                    | "participantTwoId"
                    | "participantTwoName"
                    | "participantTwoRole"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "readByParticipantOne"
                    | "readByParticipantTwo"
                    | "unreadCountParticipantOne"
                    | "unreadCountParticipantTwo"
                    | "lastReadByParticipantOneAtMs"
                    | "lastReadByParticipantTwoAtMs"
                    | "archivedByParticipantOne"
                    | "archivedByParticipantTwo"
                    | "mutedByParticipantOne"
                    | "mutedByParticipantTwo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directMessages";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "edited"
                    | "editedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "reactions"
                    | "readBy"
                    | "deliveredTo"
                    | "readAtMs"
                    | "sharedTo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "conversationAssignments";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "assignedToId"
                    | "assignedToName"
                    | "assignedById"
                    | "assignedByName"
                    | "routingReason"
                    | "routingRuleId"
                    | "priority"
                    | "status"
                    | "escalatedFromId"
                    | "slaDeadlineMs"
                    | "slaBreached"
                    | "firstResponseAtMs"
                    | "resolvedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "messageAnalytics";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "conversationType"
                    | "conversationId"
                    | "messageId"
                    | "senderId"
                    | "firstReadAtMs"
                    | "firstResponseAtMs"
                    | "responseTimeMs"
                    | "timeToReadMs"
                    | "reactionCount"
                    | "replyCount"
                    | "shareCount"
                    | "deliveryAttempts"
                    | "deliveryStatus"
                    | "deliveredAtMs"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "inboxItems";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "sourceType"
                    | "sourceId"
                    | "sourceName"
                    | "clientId"
                    | "projectId"
                    | "otherParticipantId"
                    | "otherParticipantName"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "lastMessageSenderName"
                    | "unreadCount"
                    | "isRead"
                    | "lastReadAtMs"
                    | "pinned"
                    | "pinnedAtMs"
                    | "archived"
                    | "archivedAtMs"
                    | "muted"
                    | "mutedAtMs"
                    | "assignedToId"
                    | "assignedToName"
                    | "priority"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "privacyMasks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "maskType"
                    | "displayName"
                    | "realName"
                    | "relayIdentifier"
                    | "visibleToRoles"
                    | "visibleToUserIds"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
        },
        any,
        Name
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          limit?: number;
          model:
            | "adminNotifications"
            | "schedulerEvents"
            | "agentConversations"
            | "agentMessages"
            | "problemReports"
            | "onboardingStates"
            | "notifications"
            | "fileUploadGrants"
            | "users"
            | "platformFeatures"
            | "invitations"
            | "customFormulas"
            | "tasks"
            | "taskComments"
            | "adIntegrations"
            | "analyticsIntegrations"
            | "meetingIntegrations"
            | "meetings"
            | "meetingEvents"
            | "adSyncJobs"
            | "adMetrics"
            | "analyticsMetricsDaily"
            | "analyticsMetricsBreakdown"
            | "socialIntegrations"
            | "socialMetricsDaily"
            | "socialContentMetrics"
            | "socialSyncJobs"
            | "metaWebhookEvents"
            | "collaborationChannels"
            | "collaborationChannelAvatars"
            | "collaborationMessages"
            | "collaborationReadCheckpoints"
            | "collaborationTyping"
            | "clients"
            | "projects"
            | "projectMilestones"
            | "proposals"
            | "proposalVersions"
            | "proposalTemplates"
            | "proposalAnalyticsEvents"
            | "apiIdempotency"
            | "schedulerAlertPreferences"
            | "alertRules"
            | "serverCache"
            | "auditLogs"
            | "directConversations"
            | "directMessages"
            | "conversationAssignments"
            | "messageAnalytics"
            | "inboxItems"
            | "privacyMasks";
          offset?: number;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          select?: Array<string>;
          sortBy?: { direction: "asc" | "desc"; field: string };
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any,
        Name
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          model:
            | "adminNotifications"
            | "schedulerEvents"
            | "agentConversations"
            | "agentMessages"
            | "problemReports"
            | "onboardingStates"
            | "notifications"
            | "fileUploadGrants"
            | "users"
            | "platformFeatures"
            | "invitations"
            | "customFormulas"
            | "tasks"
            | "taskComments"
            | "adIntegrations"
            | "analyticsIntegrations"
            | "meetingIntegrations"
            | "meetings"
            | "meetingEvents"
            | "adSyncJobs"
            | "adMetrics"
            | "analyticsMetricsDaily"
            | "analyticsMetricsBreakdown"
            | "socialIntegrations"
            | "socialMetricsDaily"
            | "socialContentMetrics"
            | "socialSyncJobs"
            | "metaWebhookEvents"
            | "collaborationChannels"
            | "collaborationChannelAvatars"
            | "collaborationMessages"
            | "collaborationReadCheckpoints"
            | "collaborationTyping"
            | "clients"
            | "projects"
            | "projectMilestones"
            | "proposals"
            | "proposalVersions"
            | "proposalTemplates"
            | "proposalAnalyticsEvents"
            | "apiIdempotency"
            | "schedulerAlertPreferences"
            | "alertRules"
            | "serverCache"
            | "auditLogs"
            | "directConversations"
            | "directMessages"
            | "conversationAssignments"
            | "messageAnalytics"
            | "inboxItems"
            | "privacyMasks";
          select?: Array<string>;
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any,
        Name
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "adminNotifications";
                update: {
                  createdAtMs?: number;
                  message?: string;
                  read?: boolean;
                  title?: string;
                  type?: string;
                  updatedAtMs?: number | null;
                  userEmail?: string | null;
                  userId?: string | null;
                  userName?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "type"
                    | "title"
                    | "message"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "read"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerEvents";
                update: {
                  createdAtMs?: number;
                  durationMs?: number | null;
                  errors?: Array<string>;
                  failedJobs?: number | null;
                  failureThreshold?: number | null;
                  hadQueuedJobs?: boolean | null;
                  inspectedQueuedJobs?: number | null;
                  notes?: string | null;
                  operation?: string | null;
                  processedJobs?: number | null;
                  providerFailureThresholds?: Array<{
                    failedJobs: number;
                    providerId: string;
                    threshold: number | null;
                  }>;
                  severity?: string;
                  source?: string;
                  successfulJobs?: number | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "createdAtMs"
                    | "source"
                    | "operation"
                    | "processedJobs"
                    | "successfulJobs"
                    | "failedJobs"
                    | "hadQueuedJobs"
                    | "inspectedQueuedJobs"
                    | "durationMs"
                    | "severity"
                    | "errors"
                    | "notes"
                    | "failureThreshold"
                    | "providerFailureThresholds"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentConversations";
                update: {
                  archivedAt?: number | null;
                  createdAt?: number;
                  lastMessageAt?: number | null;
                  legacyId?: string;
                  messageCount?: number;
                  pinnedAt?: number | null;
                  previewSnippet?: string | null;
                  startedAt?: number | null;
                  title?: string | null;
                  updatedAt?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "title"
                    | "startedAt"
                    | "lastMessageAt"
                    | "messageCount"
                    | "pinnedAt"
                    | "archivedAt"
                    | "previewSnippet"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentMessages";
                update: {
                  action?: string | null;
                  content?: string;
                  conversationLegacyId?: string;
                  createdAt?: number;
                  executeResult?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  legacyId?: string;
                  operation?: string | null;
                  params?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  route?: string | null;
                  type?: "user" | "agent";
                  userId?: string | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "type"
                    | "content"
                    | "createdAt"
                    | "userId"
                    | "action"
                    | "route"
                    | "operation"
                    | "params"
                    | "executeResult"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "problemReports";
                update: {
                  createdAtMs?: number;
                  description?: string;
                  fixed?: boolean | null;
                  legacyId?: string;
                  resolution?: string | null;
                  severity?: string;
                  status?: string;
                  title?: string;
                  updatedAtMs?: number;
                  userEmail?: string | null;
                  userId?: string | null;
                  userName?: string | null;
                  workspaceId?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "workspaceId"
                    | "title"
                    | "description"
                    | "severity"
                    | "status"
                    | "fixed"
                    | "resolution"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "onboardingStates";
                update: {
                  createdAtMs?: number;
                  onboardingTourCompleted?: boolean;
                  onboardingTourCompletedAtMs?: number | null;
                  updatedAtMs?: number;
                  userId?: string;
                  welcomeSeen?: boolean;
                  welcomeSeenAtMs?: number | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "onboardingTourCompleted"
                    | "onboardingTourCompletedAtMs"
                    | "welcomeSeenAtMs"
                    | "welcomeSeen"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "notifications";
                update: {
                  acknowledgedBy?: Array<string>;
                  actorId?: string | null;
                  actorName?: string | null;
                  body?: string;
                  createdAtMs?: number;
                  kind?: string;
                  legacyId?: string;
                  metadata?: Record<string, string | number | boolean | null>;
                  readBy?: Array<string>;
                  recipientClientId?: string | null;
                  recipientClientIds?: Array<string>;
                  recipientRoles?: Array<string>;
                  recipientUserIds?: Array<string>;
                  resourceId?: string;
                  resourceType?: string;
                  title?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "kind"
                    | "title"
                    | "body"
                    | "actorId"
                    | "actorName"
                    | "resourceType"
                    | "resourceId"
                    | "recipientRoles"
                    | "recipientClientId"
                    | "recipientClientIds"
                    | "recipientUserIds"
                    | "readBy"
                    | "acknowledgedBy"
                    | "metadata"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "fileUploadGrants";
                update: {
                  createdBy?: string;
                  expiresAtMs?: number;
                  storageId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "storageId"
                    | "createdBy"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "users";
                update: {
                  agencyId?: string | null;
                  clientTeamRole?: string | null;
                  createdAtMs?: number | null;
                  email?: string | null;
                  emailLower?: string | null;
                  legacyId?: string;
                  name?: string | null;
                  notificationPreferences?: {
                    categories?: {
                      ads?: { email: boolean; inApp: boolean };
                      collaboration?: { email: boolean; inApp: boolean };
                      digest?: { email: boolean; inApp: boolean };
                      meetings?: { email: boolean; inApp: boolean };
                      projects?: { email: boolean; inApp: boolean };
                      tasks?: { email: boolean; inApp: boolean };
                    };
                    emailAdAlerts?: boolean;
                    emailCollaboration?: boolean;
                    emailPerformanceDigest?: boolean;
                    emailTaskActivity?: boolean;
                    pauseAll?: boolean;
                    quietHours?: {
                      enabled: boolean;
                      end: string;
                      start: string;
                    };
                    version?: 2;
                  };
                  phoneNumber?: string | null;
                  photoUrl?: string | null;
                  regionalPreferences?: {
                    currency?: string | null;
                    locale?: string | null;
                    timezone?: string | null;
                  };
                  role?: string | null;
                  status?: string | null;
                  updatedAtMs?: number | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "name"
                    | "role"
                    | "clientTeamRole"
                    | "status"
                    | "agencyId"
                    | "phoneNumber"
                    | "photoUrl"
                    | "notificationPreferences"
                    | "regionalPreferences"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "platformFeatures";
                update: {
                  createdAtMs?: number;
                  description?: string;
                  imageUrl?: string | null;
                  legacyId?: string | null;
                  priority?: "low" | "medium" | "high";
                  references?: Array<{ label: string; url: string }>;
                  status?: "backlog" | "planned" | "in_progress" | "completed";
                  title?: string;
                  updatedAtMs?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "imageUrl"
                    | "references"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitations";
                update: {
                  acceptedAtMs?: number | null;
                  createdAtMs?: number;
                  email?: string;
                  emailLower?: string;
                  expiresAtMs?: number;
                  invitedBy?: string;
                  invitedByName?: string | null;
                  legacyId?: string | null;
                  message?: string | null;
                  name?: string | null;
                  role?: "admin" | "team" | "client";
                  status?: "pending" | "accepted" | "expired" | "revoked";
                  token?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "role"
                    | "name"
                    | "message"
                    | "status"
                    | "invitedBy"
                    | "invitedByName"
                    | "token"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "acceptedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "customFormulas";
                update: {
                  createdAtMs?: number;
                  createdBy?: string | null;
                  description?: string | null;
                  formula?: string;
                  inputs?: Array<string>;
                  isActive?: boolean;
                  legacyId?: string;
                  name?: string;
                  outputMetric?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formula"
                    | "inputs"
                    | "outputMetric"
                    | "isActive"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "tasks";
                update: {
                  assignedTo?: Array<string>;
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    type?: string | null;
                    url: string;
                  }>;
                  client?: string | null;
                  clientId?: string | null;
                  createdAtMs?: number;
                  createdBy?: string | null;
                  deletedAtMs?: number | null;
                  description?: string | null;
                  dueDateMs?: number | null;
                  legacyId?: string;
                  priority?: string;
                  projectId?: string | null;
                  projectName?: string | null;
                  status?: string;
                  tags?: Array<string>;
                  title?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "assignedTo"
                    | "client"
                    | "clientId"
                    | "projectId"
                    | "projectName"
                    | "dueDateMs"
                    | "tags"
                    | "attachments"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "taskComments";
                update: {
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    type?: string | null;
                    url: string;
                  }>;
                  authorId?: string | null;
                  authorName?: string | null;
                  authorRole?: string | null;
                  content?: string;
                  createdAtMs?: number;
                  deleted?: boolean;
                  deletedAtMs?: number | null;
                  deletedBy?: string | null;
                  format?: "markdown" | "plaintext";
                  legacyId?: string;
                  mentions?: Array<{
                    name: string;
                    role: string | null;
                    slug: string;
                  }>;
                  parentCommentId?: string | null;
                  taskLegacyId?: string;
                  threadRootId?: string | null;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "taskLegacyId"
                    | "legacyId"
                    | "content"
                    | "format"
                    | "authorId"
                    | "authorName"
                    | "authorRole"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "mentions"
                    | "parentCommentId"
                    | "threadRootId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  accountId?: string | null;
                  accountName?: string | null;
                  autoSyncEnabled?: boolean | null;
                  clientId?: string | null;
                  createdAt?: number;
                  currency?: string | null;
                  developerToken?: string | null;
                  idToken?: string | null;
                  lastSyncMessage?: string | null;
                  lastSyncRequestedAtMs?: number | null;
                  lastSyncStatus?: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  loginCustomerId?: string | null;
                  managerCustomerId?: string | null;
                  metaUseAsyncInsights?: boolean | null;
                  providerId?: string;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scheduledTimeframeDays?: number | null;
                  scopes?: Array<string>;
                  syncFrequencyMinutes?: number | null;
                  updatedAt?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "metaUseAsyncInsights"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  accountId?: string | null;
                  accountName?: string | null;
                  autoSyncEnabled?: boolean | null;
                  clientId?: string | null;
                  createdAt?: number;
                  currency?: string | null;
                  developerToken?: string | null;
                  idToken?: string | null;
                  lastSyncMessage?: string | null;
                  lastSyncRequestedAtMs?: number | null;
                  lastSyncStatus?: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  loginCustomerId?: string | null;
                  managerCustomerId?: string | null;
                  providerId?: string;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scheduledTimeframeDays?: number | null;
                  scopes?: Array<string>;
                  syncFrequencyMinutes?: number | null;
                  updatedAt?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  createdAtMs?: number;
                  idToken?: string | null;
                  lastUsedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  providerId?: string;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scopes?: Array<string>;
                  updatedAtMs?: number;
                  userEmail?: string | null;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "userId"
                    | "userEmail"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "scopes"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "linkedAtMs"
                    | "lastUsedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetings";
                update: {
                  attendeeEmails?: Array<string>;
                  calendarEventId?: string | null;
                  clientId?: string | null;
                  createdAtMs?: number;
                  createdBy?: string;
                  description?: string | null;
                  endTimeMs?: number;
                  integrationUserId?: string | null;
                  legacyId?: string;
                  meetLink?: string | null;
                  notesModel?: string | null;
                  notesProcessingError?: string | null;
                  notesProcessingState?: "idle" | "processing" | "failed";
                  notesStorageId?: string | null;
                  notesSummary?: string | null;
                  notesUpdatedAtMs?: number | null;
                  providerId?: string;
                  roomName?: string | null;
                  startTimeMs?: number;
                  status?:
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled";
                  timezone?: string;
                  title?: string;
                  transcriptProcessingError?: string | null;
                  transcriptProcessingState?: "idle" | "processing" | "failed";
                  transcriptSource?: string | null;
                  transcriptStorageId?: string | null;
                  transcriptText?: string | null;
                  transcriptUpdatedAtMs?: number | null;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "providerId"
                    | "integrationUserId"
                    | "clientId"
                    | "title"
                    | "description"
                    | "startTimeMs"
                    | "endTimeMs"
                    | "timezone"
                    | "meetLink"
                    | "roomName"
                    | "calendarEventId"
                    | "status"
                    | "attendeeEmails"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "transcriptText"
                    | "transcriptUpdatedAtMs"
                    | "transcriptSource"
                    | "transcriptProcessingState"
                    | "transcriptProcessingError"
                    | "notesSummary"
                    | "notesUpdatedAtMs"
                    | "notesModel"
                    | "notesProcessingState"
                    | "notesProcessingError"
                    | "notesStorageId"
                    | "transcriptStorageId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingEvents";
                update: {
                  eventType?: string;
                  meetingLegacyId?: string;
                  payload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  receivedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "meetingLegacyId"
                    | "eventType"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adSyncJobs";
                update: {
                  clientId?: string | null;
                  createdAtMs?: number;
                  errorMessage?: string | null;
                  jobType?:
                    | "initial-backfill"
                    | "scheduled-sync"
                    | "manual-sync";
                  processedAtMs?: number | null;
                  providerId?: string;
                  startedAtMs?: number | null;
                  status?: "queued" | "running" | "success" | "error";
                  timeframeDays?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adMetrics";
                update: {
                  accountId?: string | null;
                  campaignId?: string | null;
                  campaignName?: string | null;
                  clicks?: number;
                  clientId?: string | null;
                  conversions?: number;
                  createdAtMs?: number;
                  creatives?: Array<{
                    clicks?: number;
                    conversions?: number;
                    id: string;
                    impressions?: number;
                    name: string;
                    revenue?: number;
                    spend?: number;
                    type: string;
                    url?: string;
                  }> | null;
                  currency?: string | null;
                  currencySource?: "metric" | "integration" | "unknown" | null;
                  date?: string;
                  impressions?: number;
                  providerId?: string;
                  publisherPlatform?: string | null;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  revenue?: number | null;
                  spend?: number;
                  surfaceId?: string | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accountId"
                    | "surfaceId"
                    | "publisherPlatform"
                    | "currency"
                    | "currencySource"
                    | "date"
                    | "spend"
                    | "impressions"
                    | "clicks"
                    | "conversions"
                    | "revenue"
                    | "campaignId"
                    | "campaignName"
                    | "creatives"
                    | "rawPayload"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsDaily";
                update: {
                  clientId?: string | null;
                  conversions?: number;
                  createdAtMs?: number;
                  currency?: string | null;
                  date?: string;
                  propertyId?: string;
                  revenue?: number | null;
                  sessions?: number;
                  users?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "currency"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsBreakdown";
                update: {
                  clientId?: string | null;
                  conversions?: number;
                  createdAtMs?: number;
                  date?: string;
                  dimension?: "channel" | "source" | "device";
                  dimensionValue?: string;
                  propertyId?: string;
                  revenue?: number | null;
                  sessions?: number;
                  users?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "dimension"
                    | "dimensionValue"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  clientId?: string | null;
                  createdAt?: number;
                  facebookPageId?: string | null;
                  facebookPageName?: string | null;
                  instagramBusinessId?: string | null;
                  instagramBusinessName?: string | null;
                  lastSyncMessage?: string | null;
                  lastSyncRequestedAtMs?: number | null;
                  lastSyncStatus?: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  metaUserId?: string | null;
                  metaUserName?: string | null;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scopes?: Array<string>;
                  updatedAt?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "accessToken"
                    | "refreshToken"
                    | "scopes"
                    | "metaUserId"
                    | "metaUserName"
                    | "facebookPageId"
                    | "facebookPageName"
                    | "instagramBusinessId"
                    | "instagramBusinessName"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialMetricsDaily";
                update: {
                  clientId?: string | null;
                  comments?: number;
                  createdAtMs?: number;
                  date?: string;
                  engagedUsers?: number;
                  engagementRate?: number | null;
                  entityId?: string;
                  entityName?: string | null;
                  followerCount?: number;
                  followerDelta?: number;
                  impressions?: number;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  reach?: number;
                  reactions?: number;
                  saves?: number;
                  shares?: number;
                  surface?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "entityId"
                    | "entityName"
                    | "date"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "followerCount"
                    | "followerDelta"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialContentMetrics";
                update: {
                  clientId?: string | null;
                  comments?: number;
                  contentId?: string;
                  contentType?: string | null;
                  contentUrl?: string | null;
                  createdAtMs?: number;
                  engagedUsers?: number;
                  engagementRate?: number | null;
                  entityId?: string;
                  entityName?: string | null;
                  impressions?: number;
                  message?: string | null;
                  publishedAt?: string | null;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  reach?: number;
                  reactions?: number;
                  saves?: number;
                  shares?: number;
                  surface?: string;
                  updatedAtMs?: number;
                  videoViews?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "contentId"
                    | "entityId"
                    | "entityName"
                    | "publishedAt"
                    | "contentType"
                    | "contentUrl"
                    | "message"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "videoViews"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialSyncJobs";
                update: {
                  clientId?: string | null;
                  createdAtMs?: number;
                  errorMessage?: string | null;
                  jobType?:
                    | "initial-backfill"
                    | "scheduled-sync"
                    | "manual-sync";
                  processedAtMs?: number | null;
                  startedAtMs?: number | null;
                  status?: "queued" | "running" | "success" | "error";
                  surface?: string | null;
                  timeframeDays?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "metaWebhookEvents";
                update: {
                  changeField?: string | null;
                  entryId?: string | null;
                  objectId?: string | null;
                  objectType?: string | null;
                  payload?: any;
                  receivedAtMs?: number;
                  verb?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "objectId"
                    | "objectType"
                    | "changeField"
                    | "verb"
                    | "entryId"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannels";
                update: {
                  archivedAtMs?: number | null;
                  channelType?: string;
                  createdAtMs?: number;
                  createdBy?: string;
                  description?: string | null;
                  legacyId?: string;
                  memberIds?: Array<string>;
                  memberSummaries?: Array<{
                    email?: string | null;
                    id: string;
                    name: string;
                    role: string | null;
                  }>;
                  name?: string;
                  nameLower?: string;
                  updatedAtMs?: number;
                  visibility?: "public" | "private";
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "channelType"
                    | "visibility"
                    | "memberIds"
                    | "memberSummaries"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "archivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannelAvatars";
                update: {
                  avatarStorageId?: string;
                  channelKey?: string;
                  updatedAtMs?: number;
                  updatedBy?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelKey"
                    | "avatarStorageId"
                    | "updatedAtMs"
                    | "updatedBy"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationMessages";
                update: {
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    storageId?: string | null;
                    type?: string | null;
                    url: string;
                  }> | null;
                  channelId?: string | null;
                  channelType?: string;
                  clientId?: string | null;
                  content?: string;
                  createdAtMs?: number;
                  deleted?: boolean;
                  deletedAtMs?: number | null;
                  deletedBy?: string | null;
                  deliveredTo?: Array<string>;
                  format?: "markdown" | "plaintext";
                  isPinned?: boolean;
                  isThreadRoot?: boolean;
                  legacyId?: string;
                  mentions?: Array<{
                    name: string;
                    role: string | null;
                    slug: string;
                  }> | null;
                  parentMessageId?: string | null;
                  pinnedAtMs?: number | null;
                  pinnedBy?: string | null;
                  projectId?: string | null;
                  reactions?: Array<{
                    count: number;
                    emoji: string;
                    userIds: Array<string>;
                  }> | null;
                  readBy?: Array<string>;
                  senderId?: string | null;
                  senderName?: string;
                  senderRole?: string | null;
                  sharedTo?: Array<"email"> | null;
                  threadLastReplyAtMs?: number | null;
                  threadReplyCount?: number | null;
                  threadRootId?: string | null;
                  updatedAtMs?: number | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "format"
                    | "mentions"
                    | "reactions"
                    | "parentMessageId"
                    | "threadRootId"
                    | "isThreadRoot"
                    | "threadReplyCount"
                    | "threadLastReplyAtMs"
                    | "readBy"
                    | "deliveredTo"
                    | "isPinned"
                    | "pinnedAtMs"
                    | "pinnedBy"
                    | "sharedTo"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationReadCheckpoints";
                update: {
                  channelId?: string | null;
                  channelType?: string;
                  clientId?: string | null;
                  lastReadCreatedAtMs?: number;
                  lastReadLegacyId?: string;
                  projectId?: string | null;
                  scopeType?: "channel" | "thread";
                  threadRootId?: string | null;
                  updatedAtMs?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "userId"
                    | "scopeType"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "threadRootId"
                    | "lastReadCreatedAtMs"
                    | "lastReadLegacyId"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationTyping";
                update: {
                  channelId?: string;
                  channelType?: string;
                  clientId?: string | null;
                  expiresAtMs?: number;
                  name?: string;
                  projectId?: string | null;
                  role?: string | null;
                  updatedAtMs?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "userId"
                    | "name"
                    | "role"
                    | "updatedAtMs"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "clients";
                update: {
                  accountManager?: string;
                  createdAtMs?: number;
                  createdBy?: string | null;
                  deletedAtMs?: number | null;
                  legacyId?: string;
                  name?: string;
                  nameLower?: string;
                  teamMembers?: Array<{ name: string; role: string }>;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "accountManager"
                    | "teamMembers"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projects";
                update: {
                  clientId?: string | null;
                  clientName?: string | null;
                  createdAtMs?: number;
                  deletedAtMs?: number | null;
                  description?: string | null;
                  endDateMs?: number | null;
                  legacyId?: string;
                  name?: string;
                  nameLower?: string;
                  ownerId?: string | null;
                  startDateMs?: number | null;
                  status?: string;
                  tags?: Array<string>;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "status"
                    | "clientId"
                    | "clientName"
                    | "startDateMs"
                    | "endDateMs"
                    | "tags"
                    | "ownerId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectMilestones";
                update: {
                  createdAtMs?: number;
                  description?: string | null;
                  endDateMs?: number | null;
                  legacyId?: string;
                  order?: number | null;
                  ownerId?: string | null;
                  projectId?: string;
                  startDateMs?: number | null;
                  startDateSortKey?: number;
                  status?: string;
                  title?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "projectId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "startDateMs"
                    | "endDateMs"
                    | "startDateSortKey"
                    | "ownerId"
                    | "order"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposals";
                update: {
                  agentConversationId?: string | null;
                  aiInsights?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  aiSuggestions?: string | null;
                  clientId?: string | null;
                  clientName?: string | null;
                  createdAtMs?: number;
                  formData?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  lastAgentInteractionAtMs?: number | null;
                  lastAutosaveAtMs?: number;
                  legacyId?: string;
                  ownerId?: string | null;
                  pdfStorageId?: string | null;
                  pdfUrl?: string | null;
                  pptStorageId?: string | null;
                  pptUrl?: string | null;
                  presentationDeck?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  status?: string;
                  stepProgress?: number;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "ownerId"
                    | "agentConversationId"
                    | "lastAgentInteractionAtMs"
                    | "status"
                    | "stepProgress"
                    | "formData"
                    | "aiInsights"
                    | "aiSuggestions"
                    | "pdfUrl"
                    | "pptUrl"
                    | "pdfStorageId"
                    | "pptStorageId"
                    | "clientId"
                    | "clientName"
                    | "presentationDeck"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "lastAutosaveAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalVersions";
                update: {
                  changeDescription?: string | null;
                  createdAtMs?: number;
                  createdBy?: string;
                  createdByName?: string | null;
                  formData?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  legacyId?: string;
                  proposalLegacyId?: string;
                  status?: string;
                  stepProgress?: number;
                  versionNumber?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "proposalLegacyId"
                    | "legacyId"
                    | "versionNumber"
                    | "formData"
                    | "status"
                    | "stepProgress"
                    | "changeDescription"
                    | "createdBy"
                    | "createdByName"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalTemplates";
                update: {
                  createdAtMs?: number;
                  createdBy?: string | null;
                  description?: string | null;
                  formData?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  industry?: string | null;
                  isDefault?: boolean;
                  legacyId?: string;
                  name?: string;
                  tags?: Array<string>;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formData"
                    | "industry"
                    | "tags"
                    | "isDefault"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalAnalyticsEvents";
                update: {
                  clientId?: string | null;
                  clientName?: string | null;
                  createdAtMs?: number;
                  duration?: number | null;
                  error?: string | null;
                  eventType?: string;
                  legacyId?: string;
                  metadata?: Record<string, string | number | boolean | null>;
                  proposalId?: string;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "eventType"
                    | "proposalId"
                    | "userId"
                    | "clientId"
                    | "clientName"
                    | "metadata"
                    | "duration"
                    | "error"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apiIdempotency";
                update: {
                  createdAtMs?: number;
                  httpStatus?: number | null;
                  key?: string;
                  method?: string | null;
                  path?: string | null;
                  requestId?: string | null;
                  response?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                      >;
                  status?: string;
                  updatedAtMs?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "key"
                    | "status"
                    | "requestId"
                    | "method"
                    | "path"
                    | "response"
                    | "httpStatus"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerAlertPreferences";
                update: {
                  createdAtMs?: number;
                  failureThreshold?: number | null;
                  providerId?: string;
                  updatedAtMs?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "providerId"
                    | "failureThreshold"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "alertRules";
                update: {
                  campaignId?: string | null;
                  channels?: Array<string>;
                  condition?: {
                    direction?: "up" | "down" | null;
                    operator: "gt" | "lt" | "gte" | "lte" | "eq" | "ne";
                    percentage?: number | null;
                    threshold: number | string;
                    windowSize?: number | null;
                  };
                  createdAtMs?: number;
                  description?: string | null;
                  enabled?: boolean;
                  formulaId?: string | null;
                  insightType?: string | null;
                  legacyId?: string;
                  metric?: string;
                  name?: string;
                  providerId?: string | null;
                  severity?: string;
                  type?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "type"
                    | "metric"
                    | "condition"
                    | "severity"
                    | "enabled"
                    | "providerId"
                    | "campaignId"
                    | "formulaId"
                    | "insightType"
                    | "channels"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "serverCache";
                update: {
                  createdAtMs?: number;
                  expiresAtMs?: number;
                  key?: string;
                  keyHash?: string;
                  updatedAtMs?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "keyHash"
                    | "key"
                    | "value"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditLogs";
                update: {
                  action?: string;
                  actorEmail?: string | null;
                  actorId?: string;
                  ip?: string | null;
                  metadata?: Record<string, string | number | boolean | null>;
                  requestId?: string | null;
                  targetId?: string | null;
                  timestampMs?: number;
                  userAgent?: string | null;
                  workspaceId?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "actorId"
                    | "actorEmail"
                    | "targetId"
                    | "workspaceId"
                    | "metadata"
                    | "ip"
                    | "userAgent"
                    | "requestId"
                    | "timestampMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directConversations";
                update: {
                  archivedByParticipantOne?: boolean;
                  archivedByParticipantTwo?: boolean;
                  createdAtMs?: number;
                  lastMessageAtMs?: number | null;
                  lastMessageSenderId?: string | null;
                  lastMessageSnippet?: string | null;
                  lastReadByParticipantOneAtMs?: number | null;
                  lastReadByParticipantTwoAtMs?: number | null;
                  legacyId?: string;
                  mutedByParticipantOne?: boolean;
                  mutedByParticipantTwo?: boolean;
                  participantOneId?: string;
                  participantOneName?: string;
                  participantOneRole?: string | null;
                  participantTwoId?: string;
                  participantTwoName?: string;
                  participantTwoRole?: string | null;
                  readByParticipantOne?: boolean;
                  readByParticipantTwo?: boolean;
                  unreadCountParticipantOne?: number;
                  unreadCountParticipantTwo?: number;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "participantOneId"
                    | "participantOneName"
                    | "participantOneRole"
                    | "participantTwoId"
                    | "participantTwoName"
                    | "participantTwoRole"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "readByParticipantOne"
                    | "readByParticipantTwo"
                    | "unreadCountParticipantOne"
                    | "unreadCountParticipantTwo"
                    | "lastReadByParticipantOneAtMs"
                    | "lastReadByParticipantTwoAtMs"
                    | "archivedByParticipantOne"
                    | "archivedByParticipantTwo"
                    | "mutedByParticipantOne"
                    | "mutedByParticipantTwo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directMessages";
                update: {
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    storageId?: string | null;
                    type?: string | null;
                    url: string;
                  }> | null;
                  content?: string;
                  conversationLegacyId?: string;
                  createdAtMs?: number;
                  deleted?: boolean;
                  deletedAtMs?: number | null;
                  deletedBy?: string | null;
                  deliveredTo?: Array<string>;
                  edited?: boolean;
                  editedAtMs?: number | null;
                  legacyId?: string;
                  reactions?: Array<{
                    count: number;
                    emoji: string;
                    userIds: Array<string>;
                  }> | null;
                  readAtMs?: number | null;
                  readBy?: Array<string>;
                  senderId?: string;
                  senderName?: string;
                  senderRole?: string | null;
                  sharedTo?: Array<"email"> | null;
                  updatedAtMs?: number | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "edited"
                    | "editedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "reactions"
                    | "readBy"
                    | "deliveredTo"
                    | "readAtMs"
                    | "sharedTo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "conversationAssignments";
                update: {
                  assignedById?: string | null;
                  assignedByName?: string | null;
                  assignedToId?: string;
                  assignedToName?: string;
                  createdAtMs?: number;
                  escalatedFromId?: string | null;
                  firstResponseAtMs?: number | null;
                  legacyId?: string;
                  priority?: "low" | "normal" | "high" | "urgent";
                  resolvedAtMs?: number | null;
                  resourceId?: string;
                  resourceType?: "direct_conversation" | "channel" | "message";
                  routingReason?: string | null;
                  routingRuleId?: string | null;
                  slaBreached?: boolean;
                  slaDeadlineMs?: number | null;
                  status?: "active" | "completed" | "escalated" | "transferred";
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "assignedToId"
                    | "assignedToName"
                    | "assignedById"
                    | "assignedByName"
                    | "routingReason"
                    | "routingRuleId"
                    | "priority"
                    | "status"
                    | "escalatedFromId"
                    | "slaDeadlineMs"
                    | "slaBreached"
                    | "firstResponseAtMs"
                    | "resolvedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "messageAnalytics";
                update: {
                  channelType?: string | null;
                  clientId?: string | null;
                  conversationId?: string;
                  conversationType?: "direct" | "channel" | "thread";
                  createdAtMs?: number;
                  deliveredAtMs?: number | null;
                  deliveryAttempts?: number;
                  deliveryStatus?: "pending" | "delivered" | "failed";
                  firstReadAtMs?: number | null;
                  firstResponseAtMs?: number | null;
                  legacyId?: string;
                  messageId?: string;
                  projectId?: string | null;
                  reactionCount?: number;
                  replyCount?: number;
                  responseTimeMs?: number | null;
                  senderId?: string;
                  shareCount?: number;
                  timeToReadMs?: number | null;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "conversationType"
                    | "conversationId"
                    | "messageId"
                    | "senderId"
                    | "firstReadAtMs"
                    | "firstResponseAtMs"
                    | "responseTimeMs"
                    | "timeToReadMs"
                    | "reactionCount"
                    | "replyCount"
                    | "shareCount"
                    | "deliveryAttempts"
                    | "deliveryStatus"
                    | "deliveredAtMs"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "inboxItems";
                update: {
                  archived?: boolean;
                  archivedAtMs?: number | null;
                  assignedToId?: string | null;
                  assignedToName?: string | null;
                  clientId?: string | null;
                  createdAtMs?: number;
                  isRead?: boolean;
                  lastMessageAtMs?: number | null;
                  lastMessageSenderId?: string | null;
                  lastMessageSenderName?: string | null;
                  lastMessageSnippet?: string | null;
                  lastReadAtMs?: number | null;
                  legacyId?: string;
                  muted?: boolean;
                  mutedAtMs?: number | null;
                  otherParticipantId?: string | null;
                  otherParticipantName?: string | null;
                  pinned?: boolean;
                  pinnedAtMs?: number | null;
                  priority?: "low" | "normal" | "high" | "urgent" | null;
                  projectId?: string | null;
                  sourceId?: string;
                  sourceName?: string;
                  sourceType?: "direct_message" | "channel" | "email";
                  unreadCount?: number;
                  updatedAtMs?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "sourceType"
                    | "sourceId"
                    | "sourceName"
                    | "clientId"
                    | "projectId"
                    | "otherParticipantId"
                    | "otherParticipantName"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "lastMessageSenderName"
                    | "unreadCount"
                    | "isRead"
                    | "lastReadAtMs"
                    | "pinned"
                    | "pinnedAtMs"
                    | "archived"
                    | "archivedAtMs"
                    | "muted"
                    | "mutedAtMs"
                    | "assignedToId"
                    | "assignedToName"
                    | "priority"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "privacyMasks";
                update: {
                  createdAtMs?: number;
                  displayName?: string;
                  legacyId?: string;
                  maskType?: "pseudonym" | "relay_number" | "anonymous";
                  realName?: string | null;
                  relayIdentifier?: string | null;
                  resourceId?: string;
                  resourceType?: "conversation" | "channel" | "user";
                  updatedAtMs?: number;
                  visibleToRoles?: Array<string>;
                  visibleToUserIds?: Array<string>;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "maskType"
                    | "displayName"
                    | "realName"
                    | "relayIdentifier"
                    | "visibleToRoles"
                    | "visibleToUserIds"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any,
        Name
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "adminNotifications";
                update: {
                  createdAtMs?: number;
                  message?: string;
                  read?: boolean;
                  title?: string;
                  type?: string;
                  updatedAtMs?: number | null;
                  userEmail?: string | null;
                  userId?: string | null;
                  userName?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "type"
                    | "title"
                    | "message"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "read"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerEvents";
                update: {
                  createdAtMs?: number;
                  durationMs?: number | null;
                  errors?: Array<string>;
                  failedJobs?: number | null;
                  failureThreshold?: number | null;
                  hadQueuedJobs?: boolean | null;
                  inspectedQueuedJobs?: number | null;
                  notes?: string | null;
                  operation?: string | null;
                  processedJobs?: number | null;
                  providerFailureThresholds?: Array<{
                    failedJobs: number;
                    providerId: string;
                    threshold: number | null;
                  }>;
                  severity?: string;
                  source?: string;
                  successfulJobs?: number | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "createdAtMs"
                    | "source"
                    | "operation"
                    | "processedJobs"
                    | "successfulJobs"
                    | "failedJobs"
                    | "hadQueuedJobs"
                    | "inspectedQueuedJobs"
                    | "durationMs"
                    | "severity"
                    | "errors"
                    | "notes"
                    | "failureThreshold"
                    | "providerFailureThresholds"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentConversations";
                update: {
                  archivedAt?: number | null;
                  createdAt?: number;
                  lastMessageAt?: number | null;
                  legacyId?: string;
                  messageCount?: number;
                  pinnedAt?: number | null;
                  previewSnippet?: string | null;
                  startedAt?: number | null;
                  title?: string | null;
                  updatedAt?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "title"
                    | "startedAt"
                    | "lastMessageAt"
                    | "messageCount"
                    | "pinnedAt"
                    | "archivedAt"
                    | "previewSnippet"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "agentMessages";
                update: {
                  action?: string | null;
                  content?: string;
                  conversationLegacyId?: string;
                  createdAt?: number;
                  executeResult?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  legacyId?: string;
                  operation?: string | null;
                  params?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  route?: string | null;
                  type?: "user" | "agent";
                  userId?: string | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "type"
                    | "content"
                    | "createdAt"
                    | "userId"
                    | "action"
                    | "route"
                    | "operation"
                    | "params"
                    | "executeResult"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "problemReports";
                update: {
                  createdAtMs?: number;
                  description?: string;
                  fixed?: boolean | null;
                  legacyId?: string;
                  resolution?: string | null;
                  severity?: string;
                  status?: string;
                  title?: string;
                  updatedAtMs?: number;
                  userEmail?: string | null;
                  userId?: string | null;
                  userName?: string | null;
                  workspaceId?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "userId"
                    | "userEmail"
                    | "userName"
                    | "workspaceId"
                    | "title"
                    | "description"
                    | "severity"
                    | "status"
                    | "fixed"
                    | "resolution"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "onboardingStates";
                update: {
                  createdAtMs?: number;
                  onboardingTourCompleted?: boolean;
                  onboardingTourCompletedAtMs?: number | null;
                  updatedAtMs?: number;
                  userId?: string;
                  welcomeSeen?: boolean;
                  welcomeSeenAtMs?: number | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "userId"
                    | "onboardingTourCompleted"
                    | "onboardingTourCompletedAtMs"
                    | "welcomeSeenAtMs"
                    | "welcomeSeen"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "notifications";
                update: {
                  acknowledgedBy?: Array<string>;
                  actorId?: string | null;
                  actorName?: string | null;
                  body?: string;
                  createdAtMs?: number;
                  kind?: string;
                  legacyId?: string;
                  metadata?: Record<string, string | number | boolean | null>;
                  readBy?: Array<string>;
                  recipientClientId?: string | null;
                  recipientClientIds?: Array<string>;
                  recipientRoles?: Array<string>;
                  recipientUserIds?: Array<string>;
                  resourceId?: string;
                  resourceType?: string;
                  title?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "kind"
                    | "title"
                    | "body"
                    | "actorId"
                    | "actorName"
                    | "resourceType"
                    | "resourceId"
                    | "recipientRoles"
                    | "recipientClientId"
                    | "recipientClientIds"
                    | "recipientUserIds"
                    | "readBy"
                    | "acknowledgedBy"
                    | "metadata"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "fileUploadGrants";
                update: {
                  createdBy?: string;
                  expiresAtMs?: number;
                  storageId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "storageId"
                    | "createdBy"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "users";
                update: {
                  agencyId?: string | null;
                  clientTeamRole?: string | null;
                  createdAtMs?: number | null;
                  email?: string | null;
                  emailLower?: string | null;
                  legacyId?: string;
                  name?: string | null;
                  notificationPreferences?: {
                    categories?: {
                      ads?: { email: boolean; inApp: boolean };
                      collaboration?: { email: boolean; inApp: boolean };
                      digest?: { email: boolean; inApp: boolean };
                      meetings?: { email: boolean; inApp: boolean };
                      projects?: { email: boolean; inApp: boolean };
                      tasks?: { email: boolean; inApp: boolean };
                    };
                    emailAdAlerts?: boolean;
                    emailCollaboration?: boolean;
                    emailPerformanceDigest?: boolean;
                    emailTaskActivity?: boolean;
                    pauseAll?: boolean;
                    quietHours?: {
                      enabled: boolean;
                      end: string;
                      start: string;
                    };
                    version?: 2;
                  };
                  phoneNumber?: string | null;
                  photoUrl?: string | null;
                  regionalPreferences?: {
                    currency?: string | null;
                    locale?: string | null;
                    timezone?: string | null;
                  };
                  role?: string | null;
                  status?: string | null;
                  updatedAtMs?: number | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "name"
                    | "role"
                    | "clientTeamRole"
                    | "status"
                    | "agencyId"
                    | "phoneNumber"
                    | "photoUrl"
                    | "notificationPreferences"
                    | "regionalPreferences"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "platformFeatures";
                update: {
                  createdAtMs?: number;
                  description?: string;
                  imageUrl?: string | null;
                  legacyId?: string | null;
                  priority?: "low" | "medium" | "high";
                  references?: Array<{ label: string; url: string }>;
                  status?: "backlog" | "planned" | "in_progress" | "completed";
                  title?: string;
                  updatedAtMs?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "imageUrl"
                    | "references"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "invitations";
                update: {
                  acceptedAtMs?: number | null;
                  createdAtMs?: number;
                  email?: string;
                  emailLower?: string;
                  expiresAtMs?: number;
                  invitedBy?: string;
                  invitedByName?: string | null;
                  legacyId?: string | null;
                  message?: string | null;
                  name?: string | null;
                  role?: "admin" | "team" | "client";
                  status?: "pending" | "accepted" | "expired" | "revoked";
                  token?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "legacyId"
                    | "email"
                    | "emailLower"
                    | "role"
                    | "name"
                    | "message"
                    | "status"
                    | "invitedBy"
                    | "invitedByName"
                    | "token"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "acceptedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "customFormulas";
                update: {
                  createdAtMs?: number;
                  createdBy?: string | null;
                  description?: string | null;
                  formula?: string;
                  inputs?: Array<string>;
                  isActive?: boolean;
                  legacyId?: string;
                  name?: string;
                  outputMetric?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formula"
                    | "inputs"
                    | "outputMetric"
                    | "isActive"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "tasks";
                update: {
                  assignedTo?: Array<string>;
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    type?: string | null;
                    url: string;
                  }>;
                  client?: string | null;
                  clientId?: string | null;
                  createdAtMs?: number;
                  createdBy?: string | null;
                  deletedAtMs?: number | null;
                  description?: string | null;
                  dueDateMs?: number | null;
                  legacyId?: string;
                  priority?: string;
                  projectId?: string | null;
                  projectName?: string | null;
                  status?: string;
                  tags?: Array<string>;
                  title?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "priority"
                    | "assignedTo"
                    | "client"
                    | "clientId"
                    | "projectId"
                    | "projectName"
                    | "dueDateMs"
                    | "tags"
                    | "attachments"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "taskComments";
                update: {
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    type?: string | null;
                    url: string;
                  }>;
                  authorId?: string | null;
                  authorName?: string | null;
                  authorRole?: string | null;
                  content?: string;
                  createdAtMs?: number;
                  deleted?: boolean;
                  deletedAtMs?: number | null;
                  deletedBy?: string | null;
                  format?: "markdown" | "plaintext";
                  legacyId?: string;
                  mentions?: Array<{
                    name: string;
                    role: string | null;
                    slug: string;
                  }>;
                  parentCommentId?: string | null;
                  taskLegacyId?: string;
                  threadRootId?: string | null;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "taskLegacyId"
                    | "legacyId"
                    | "content"
                    | "format"
                    | "authorId"
                    | "authorName"
                    | "authorRole"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "mentions"
                    | "parentCommentId"
                    | "threadRootId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  accountId?: string | null;
                  accountName?: string | null;
                  autoSyncEnabled?: boolean | null;
                  clientId?: string | null;
                  createdAt?: number;
                  currency?: string | null;
                  developerToken?: string | null;
                  idToken?: string | null;
                  lastSyncMessage?: string | null;
                  lastSyncRequestedAtMs?: number | null;
                  lastSyncStatus?: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  loginCustomerId?: string | null;
                  managerCustomerId?: string | null;
                  metaUseAsyncInsights?: boolean | null;
                  providerId?: string;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scheduledTimeframeDays?: number | null;
                  scopes?: Array<string>;
                  syncFrequencyMinutes?: number | null;
                  updatedAt?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "metaUseAsyncInsights"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  accountId?: string | null;
                  accountName?: string | null;
                  autoSyncEnabled?: boolean | null;
                  clientId?: string | null;
                  createdAt?: number;
                  currency?: string | null;
                  developerToken?: string | null;
                  idToken?: string | null;
                  lastSyncMessage?: string | null;
                  lastSyncRequestedAtMs?: number | null;
                  lastSyncStatus?: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  loginCustomerId?: string | null;
                  managerCustomerId?: string | null;
                  providerId?: string;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scheduledTimeframeDays?: number | null;
                  scopes?: Array<string>;
                  syncFrequencyMinutes?: number | null;
                  updatedAt?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accessToken"
                    | "idToken"
                    | "refreshToken"
                    | "scopes"
                    | "accountId"
                    | "accountName"
                    | "currency"
                    | "developerToken"
                    | "loginCustomerId"
                    | "managerCustomerId"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "autoSyncEnabled"
                    | "syncFrequencyMinutes"
                    | "scheduledTimeframeDays"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  createdAtMs?: number;
                  idToken?: string | null;
                  lastUsedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  providerId?: string;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scopes?: Array<string>;
                  updatedAtMs?: number;
                  userEmail?: string | null;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "userId"
                    | "userEmail"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "scopes"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "linkedAtMs"
                    | "lastUsedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetings";
                update: {
                  attendeeEmails?: Array<string>;
                  calendarEventId?: string | null;
                  clientId?: string | null;
                  createdAtMs?: number;
                  createdBy?: string;
                  description?: string | null;
                  endTimeMs?: number;
                  integrationUserId?: string | null;
                  legacyId?: string;
                  meetLink?: string | null;
                  notesModel?: string | null;
                  notesProcessingError?: string | null;
                  notesProcessingState?: "idle" | "processing" | "failed";
                  notesStorageId?: string | null;
                  notesSummary?: string | null;
                  notesUpdatedAtMs?: number | null;
                  providerId?: string;
                  roomName?: string | null;
                  startTimeMs?: number;
                  status?:
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled";
                  timezone?: string;
                  title?: string;
                  transcriptProcessingError?: string | null;
                  transcriptProcessingState?: "idle" | "processing" | "failed";
                  transcriptSource?: string | null;
                  transcriptStorageId?: string | null;
                  transcriptText?: string | null;
                  transcriptUpdatedAtMs?: number | null;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "providerId"
                    | "integrationUserId"
                    | "clientId"
                    | "title"
                    | "description"
                    | "startTimeMs"
                    | "endTimeMs"
                    | "timezone"
                    | "meetLink"
                    | "roomName"
                    | "calendarEventId"
                    | "status"
                    | "attendeeEmails"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "transcriptText"
                    | "transcriptUpdatedAtMs"
                    | "transcriptSource"
                    | "transcriptProcessingState"
                    | "transcriptProcessingError"
                    | "notesSummary"
                    | "notesUpdatedAtMs"
                    | "notesModel"
                    | "notesProcessingState"
                    | "notesProcessingError"
                    | "notesStorageId"
                    | "transcriptStorageId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "meetingEvents";
                update: {
                  eventType?: string;
                  meetingLegacyId?: string;
                  payload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  receivedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "meetingLegacyId"
                    | "eventType"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adSyncJobs";
                update: {
                  clientId?: string | null;
                  createdAtMs?: number;
                  errorMessage?: string | null;
                  jobType?:
                    | "initial-backfill"
                    | "scheduled-sync"
                    | "manual-sync";
                  processedAtMs?: number | null;
                  providerId?: string;
                  startedAtMs?: number | null;
                  status?: "queued" | "running" | "success" | "error";
                  timeframeDays?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "adMetrics";
                update: {
                  accountId?: string | null;
                  campaignId?: string | null;
                  campaignName?: string | null;
                  clicks?: number;
                  clientId?: string | null;
                  conversions?: number;
                  createdAtMs?: number;
                  creatives?: Array<{
                    clicks?: number;
                    conversions?: number;
                    id: string;
                    impressions?: number;
                    name: string;
                    revenue?: number;
                    spend?: number;
                    type: string;
                    url?: string;
                  }> | null;
                  currency?: string | null;
                  currencySource?: "metric" | "integration" | "unknown" | null;
                  date?: string;
                  impressions?: number;
                  providerId?: string;
                  publisherPlatform?: string | null;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  revenue?: number | null;
                  spend?: number;
                  surfaceId?: string | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "providerId"
                    | "clientId"
                    | "accountId"
                    | "surfaceId"
                    | "publisherPlatform"
                    | "currency"
                    | "currencySource"
                    | "date"
                    | "spend"
                    | "impressions"
                    | "clicks"
                    | "conversions"
                    | "revenue"
                    | "campaignId"
                    | "campaignName"
                    | "creatives"
                    | "rawPayload"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsDaily";
                update: {
                  clientId?: string | null;
                  conversions?: number;
                  createdAtMs?: number;
                  currency?: string | null;
                  date?: string;
                  propertyId?: string;
                  revenue?: number | null;
                  sessions?: number;
                  users?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "currency"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "analyticsMetricsBreakdown";
                update: {
                  clientId?: string | null;
                  conversions?: number;
                  createdAtMs?: number;
                  date?: string;
                  dimension?: "channel" | "source" | "device";
                  dimensionValue?: string;
                  propertyId?: string;
                  revenue?: number | null;
                  sessions?: number;
                  users?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "propertyId"
                    | "date"
                    | "dimension"
                    | "dimensionValue"
                    | "users"
                    | "sessions"
                    | "conversions"
                    | "revenue"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialIntegrations";
                update: {
                  accessToken?: string | null;
                  accessTokenExpiresAtMs?: number | null;
                  clientId?: string | null;
                  createdAt?: number;
                  facebookPageId?: string | null;
                  facebookPageName?: string | null;
                  instagramBusinessId?: string | null;
                  instagramBusinessName?: string | null;
                  lastSyncMessage?: string | null;
                  lastSyncRequestedAtMs?: number | null;
                  lastSyncStatus?: "never" | "pending" | "success" | "error";
                  lastSyncedAtMs?: number | null;
                  linkedAtMs?: number | null;
                  metaUserId?: string | null;
                  metaUserName?: string | null;
                  refreshToken?: string | null;
                  refreshTokenExpiresAtMs?: number | null;
                  scopes?: Array<string>;
                  updatedAt?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "accessToken"
                    | "refreshToken"
                    | "scopes"
                    | "metaUserId"
                    | "metaUserName"
                    | "facebookPageId"
                    | "facebookPageName"
                    | "instagramBusinessId"
                    | "instagramBusinessName"
                    | "accessTokenExpiresAtMs"
                    | "refreshTokenExpiresAtMs"
                    | "lastSyncStatus"
                    | "lastSyncMessage"
                    | "lastSyncedAtMs"
                    | "lastSyncRequestedAtMs"
                    | "linkedAtMs"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialMetricsDaily";
                update: {
                  clientId?: string | null;
                  comments?: number;
                  createdAtMs?: number;
                  date?: string;
                  engagedUsers?: number;
                  engagementRate?: number | null;
                  entityId?: string;
                  entityName?: string | null;
                  followerCount?: number;
                  followerDelta?: number;
                  impressions?: number;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  reach?: number;
                  reactions?: number;
                  saves?: number;
                  shares?: number;
                  surface?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "entityId"
                    | "entityName"
                    | "date"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "followerCount"
                    | "followerDelta"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialContentMetrics";
                update: {
                  clientId?: string | null;
                  comments?: number;
                  contentId?: string;
                  contentType?: string | null;
                  contentUrl?: string | null;
                  createdAtMs?: number;
                  engagedUsers?: number;
                  engagementRate?: number | null;
                  entityId?: string;
                  entityName?: string | null;
                  impressions?: number;
                  message?: string | null;
                  publishedAt?: string | null;
                  rawPayload?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >;
                  reach?: number;
                  reactions?: number;
                  saves?: number;
                  shares?: number;
                  surface?: string;
                  updatedAtMs?: number;
                  videoViews?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "contentId"
                    | "entityId"
                    | "entityName"
                    | "publishedAt"
                    | "contentType"
                    | "contentUrl"
                    | "message"
                    | "impressions"
                    | "reach"
                    | "engagedUsers"
                    | "reactions"
                    | "comments"
                    | "shares"
                    | "saves"
                    | "videoViews"
                    | "engagementRate"
                    | "rawPayload"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "socialSyncJobs";
                update: {
                  clientId?: string | null;
                  createdAtMs?: number;
                  errorMessage?: string | null;
                  jobType?:
                    | "initial-backfill"
                    | "scheduled-sync"
                    | "manual-sync";
                  processedAtMs?: number | null;
                  startedAtMs?: number | null;
                  status?: "queued" | "running" | "success" | "error";
                  surface?: string | null;
                  timeframeDays?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "clientId"
                    | "surface"
                    | "jobType"
                    | "timeframeDays"
                    | "status"
                    | "createdAtMs"
                    | "startedAtMs"
                    | "processedAtMs"
                    | "errorMessage"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "metaWebhookEvents";
                update: {
                  changeField?: string | null;
                  entryId?: string | null;
                  objectId?: string | null;
                  objectType?: string | null;
                  payload?: any;
                  receivedAtMs?: number;
                  verb?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "objectId"
                    | "objectType"
                    | "changeField"
                    | "verb"
                    | "entryId"
                    | "payload"
                    | "receivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannels";
                update: {
                  archivedAtMs?: number | null;
                  channelType?: string;
                  createdAtMs?: number;
                  createdBy?: string;
                  description?: string | null;
                  legacyId?: string;
                  memberIds?: Array<string>;
                  memberSummaries?: Array<{
                    email?: string | null;
                    id: string;
                    name: string;
                    role: string | null;
                  }>;
                  name?: string;
                  nameLower?: string;
                  updatedAtMs?: number;
                  visibility?: "public" | "private";
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "channelType"
                    | "visibility"
                    | "memberIds"
                    | "memberSummaries"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "archivedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationChannelAvatars";
                update: {
                  avatarStorageId?: string;
                  channelKey?: string;
                  updatedAtMs?: number;
                  updatedBy?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelKey"
                    | "avatarStorageId"
                    | "updatedAtMs"
                    | "updatedBy"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationMessages";
                update: {
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    storageId?: string | null;
                    type?: string | null;
                    url: string;
                  }> | null;
                  channelId?: string | null;
                  channelType?: string;
                  clientId?: string | null;
                  content?: string;
                  createdAtMs?: number;
                  deleted?: boolean;
                  deletedAtMs?: number | null;
                  deletedBy?: string | null;
                  deliveredTo?: Array<string>;
                  format?: "markdown" | "plaintext";
                  isPinned?: boolean;
                  isThreadRoot?: boolean;
                  legacyId?: string;
                  mentions?: Array<{
                    name: string;
                    role: string | null;
                    slug: string;
                  }> | null;
                  parentMessageId?: string | null;
                  pinnedAtMs?: number | null;
                  pinnedBy?: string | null;
                  projectId?: string | null;
                  reactions?: Array<{
                    count: number;
                    emoji: string;
                    userIds: Array<string>;
                  }> | null;
                  readBy?: Array<string>;
                  senderId?: string | null;
                  senderName?: string;
                  senderRole?: string | null;
                  sharedTo?: Array<"email"> | null;
                  threadLastReplyAtMs?: number | null;
                  threadReplyCount?: number | null;
                  threadRootId?: string | null;
                  updatedAtMs?: number | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "format"
                    | "mentions"
                    | "reactions"
                    | "parentMessageId"
                    | "threadRootId"
                    | "isThreadRoot"
                    | "threadReplyCount"
                    | "threadLastReplyAtMs"
                    | "readBy"
                    | "deliveredTo"
                    | "isPinned"
                    | "pinnedAtMs"
                    | "pinnedBy"
                    | "sharedTo"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationReadCheckpoints";
                update: {
                  channelId?: string | null;
                  channelType?: string;
                  clientId?: string | null;
                  lastReadCreatedAtMs?: number;
                  lastReadLegacyId?: string;
                  projectId?: string | null;
                  scopeType?: "channel" | "thread";
                  threadRootId?: string | null;
                  updatedAtMs?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "userId"
                    | "scopeType"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "threadRootId"
                    | "lastReadCreatedAtMs"
                    | "lastReadLegacyId"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "collaborationTyping";
                update: {
                  channelId?: string;
                  channelType?: string;
                  clientId?: string | null;
                  expiresAtMs?: number;
                  name?: string;
                  projectId?: string | null;
                  role?: string | null;
                  updatedAtMs?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "channelId"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "userId"
                    | "name"
                    | "role"
                    | "updatedAtMs"
                    | "expiresAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "clients";
                update: {
                  accountManager?: string;
                  createdAtMs?: number;
                  createdBy?: string | null;
                  deletedAtMs?: number | null;
                  legacyId?: string;
                  name?: string;
                  nameLower?: string;
                  teamMembers?: Array<{ name: string; role: string }>;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "accountManager"
                    | "teamMembers"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projects";
                update: {
                  clientId?: string | null;
                  clientName?: string | null;
                  createdAtMs?: number;
                  deletedAtMs?: number | null;
                  description?: string | null;
                  endDateMs?: number | null;
                  legacyId?: string;
                  name?: string;
                  nameLower?: string;
                  ownerId?: string | null;
                  startDateMs?: number | null;
                  status?: string;
                  tags?: Array<string>;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "nameLower"
                    | "description"
                    | "status"
                    | "clientId"
                    | "clientName"
                    | "startDateMs"
                    | "endDateMs"
                    | "tags"
                    | "ownerId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "deletedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "projectMilestones";
                update: {
                  createdAtMs?: number;
                  description?: string | null;
                  endDateMs?: number | null;
                  legacyId?: string;
                  order?: number | null;
                  ownerId?: string | null;
                  projectId?: string;
                  startDateMs?: number | null;
                  startDateSortKey?: number;
                  status?: string;
                  title?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "projectId"
                    | "legacyId"
                    | "title"
                    | "description"
                    | "status"
                    | "startDateMs"
                    | "endDateMs"
                    | "startDateSortKey"
                    | "ownerId"
                    | "order"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposals";
                update: {
                  agentConversationId?: string | null;
                  aiInsights?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  aiSuggestions?: string | null;
                  clientId?: string | null;
                  clientName?: string | null;
                  createdAtMs?: number;
                  formData?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  lastAgentInteractionAtMs?: number | null;
                  lastAutosaveAtMs?: number;
                  legacyId?: string;
                  ownerId?: string | null;
                  pdfStorageId?: string | null;
                  pdfUrl?: string | null;
                  pptStorageId?: string | null;
                  pptUrl?: string | null;
                  presentationDeck?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  > | null;
                  status?: string;
                  stepProgress?: number;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "ownerId"
                    | "agentConversationId"
                    | "lastAgentInteractionAtMs"
                    | "status"
                    | "stepProgress"
                    | "formData"
                    | "aiInsights"
                    | "aiSuggestions"
                    | "pdfUrl"
                    | "pptUrl"
                    | "pdfStorageId"
                    | "pptStorageId"
                    | "clientId"
                    | "clientName"
                    | "presentationDeck"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "lastAutosaveAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalVersions";
                update: {
                  changeDescription?: string | null;
                  createdAtMs?: number;
                  createdBy?: string;
                  createdByName?: string | null;
                  formData?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  legacyId?: string;
                  proposalLegacyId?: string;
                  status?: string;
                  stepProgress?: number;
                  versionNumber?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "proposalLegacyId"
                    | "legacyId"
                    | "versionNumber"
                    | "formData"
                    | "status"
                    | "stepProgress"
                    | "changeDescription"
                    | "createdBy"
                    | "createdByName"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalTemplates";
                update: {
                  createdAtMs?: number;
                  createdBy?: string | null;
                  description?: string | null;
                  formData?: Record<
                    string,
                    | null
                    | boolean
                    | number
                    | string
                    | Array<null | boolean | number | string>
                    | Record<string, null | boolean | number | string>
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                      >
                  >;
                  industry?: string | null;
                  isDefault?: boolean;
                  legacyId?: string;
                  name?: string;
                  tags?: Array<string>;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "formData"
                    | "industry"
                    | "tags"
                    | "isDefault"
                    | "createdBy"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "proposalAnalyticsEvents";
                update: {
                  clientId?: string | null;
                  clientName?: string | null;
                  createdAtMs?: number;
                  duration?: number | null;
                  error?: string | null;
                  eventType?: string;
                  legacyId?: string;
                  metadata?: Record<string, string | number | boolean | null>;
                  proposalId?: string;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "eventType"
                    | "proposalId"
                    | "userId"
                    | "clientId"
                    | "clientName"
                    | "metadata"
                    | "duration"
                    | "error"
                    | "createdAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "apiIdempotency";
                update: {
                  createdAtMs?: number;
                  httpStatus?: number | null;
                  key?: string;
                  method?: string | null;
                  path?: string | null;
                  requestId?: string | null;
                  response?:
                    | null
                    | boolean
                    | number
                    | string
                    | Array<
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                      >
                    | Record<
                        string,
                        | null
                        | boolean
                        | number
                        | string
                        | Array<null | boolean | number | string>
                        | Record<string, null | boolean | number | string>
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                          >
                        | Array<
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                        | Record<
                            string,
                            | null
                            | boolean
                            | number
                            | string
                            | Array<null | boolean | number | string>
                            | Record<string, null | boolean | number | string>
                            | Array<
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                            | Record<
                                string,
                                | null
                                | boolean
                                | number
                                | string
                                | Array<null | boolean | number | string>
                                | Record<
                                    string,
                                    null | boolean | number | string
                                  >
                              >
                          >
                      >;
                  status?: string;
                  updatedAtMs?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "key"
                    | "status"
                    | "requestId"
                    | "method"
                    | "path"
                    | "response"
                    | "httpStatus"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "schedulerAlertPreferences";
                update: {
                  createdAtMs?: number;
                  failureThreshold?: number | null;
                  providerId?: string;
                  updatedAtMs?: number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "providerId"
                    | "failureThreshold"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "alertRules";
                update: {
                  campaignId?: string | null;
                  channels?: Array<string>;
                  condition?: {
                    direction?: "up" | "down" | null;
                    operator: "gt" | "lt" | "gte" | "lte" | "eq" | "ne";
                    percentage?: number | null;
                    threshold: number | string;
                    windowSize?: number | null;
                  };
                  createdAtMs?: number;
                  description?: string | null;
                  enabled?: boolean;
                  formulaId?: string | null;
                  insightType?: string | null;
                  legacyId?: string;
                  metric?: string;
                  name?: string;
                  providerId?: string | null;
                  severity?: string;
                  type?: string;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "name"
                    | "description"
                    | "type"
                    | "metric"
                    | "condition"
                    | "severity"
                    | "enabled"
                    | "providerId"
                    | "campaignId"
                    | "formulaId"
                    | "insightType"
                    | "channels"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "serverCache";
                update: {
                  createdAtMs?: number;
                  expiresAtMs?: number;
                  key?: string;
                  keyHash?: string;
                  updatedAtMs?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "keyHash"
                    | "key"
                    | "value"
                    | "expiresAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "auditLogs";
                update: {
                  action?: string;
                  actorEmail?: string | null;
                  actorId?: string;
                  ip?: string | null;
                  metadata?: Record<string, string | number | boolean | null>;
                  requestId?: string | null;
                  targetId?: string | null;
                  timestampMs?: number;
                  userAgent?: string | null;
                  workspaceId?: string | null;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "action"
                    | "actorId"
                    | "actorEmail"
                    | "targetId"
                    | "workspaceId"
                    | "metadata"
                    | "ip"
                    | "userAgent"
                    | "requestId"
                    | "timestampMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directConversations";
                update: {
                  archivedByParticipantOne?: boolean;
                  archivedByParticipantTwo?: boolean;
                  createdAtMs?: number;
                  lastMessageAtMs?: number | null;
                  lastMessageSenderId?: string | null;
                  lastMessageSnippet?: string | null;
                  lastReadByParticipantOneAtMs?: number | null;
                  lastReadByParticipantTwoAtMs?: number | null;
                  legacyId?: string;
                  mutedByParticipantOne?: boolean;
                  mutedByParticipantTwo?: boolean;
                  participantOneId?: string;
                  participantOneName?: string;
                  participantOneRole?: string | null;
                  participantTwoId?: string;
                  participantTwoName?: string;
                  participantTwoRole?: string | null;
                  readByParticipantOne?: boolean;
                  readByParticipantTwo?: boolean;
                  unreadCountParticipantOne?: number;
                  unreadCountParticipantTwo?: number;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "participantOneId"
                    | "participantOneName"
                    | "participantOneRole"
                    | "participantTwoId"
                    | "participantTwoName"
                    | "participantTwoRole"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "readByParticipantOne"
                    | "readByParticipantTwo"
                    | "unreadCountParticipantOne"
                    | "unreadCountParticipantTwo"
                    | "lastReadByParticipantOneAtMs"
                    | "lastReadByParticipantTwoAtMs"
                    | "archivedByParticipantOne"
                    | "archivedByParticipantTwo"
                    | "mutedByParticipantOne"
                    | "mutedByParticipantTwo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "directMessages";
                update: {
                  attachments?: Array<{
                    name: string;
                    size?: string | null;
                    storageId?: string | null;
                    type?: string | null;
                    url: string;
                  }> | null;
                  content?: string;
                  conversationLegacyId?: string;
                  createdAtMs?: number;
                  deleted?: boolean;
                  deletedAtMs?: number | null;
                  deletedBy?: string | null;
                  deliveredTo?: Array<string>;
                  edited?: boolean;
                  editedAtMs?: number | null;
                  legacyId?: string;
                  reactions?: Array<{
                    count: number;
                    emoji: string;
                    userIds: Array<string>;
                  }> | null;
                  readAtMs?: number | null;
                  readBy?: Array<string>;
                  senderId?: string;
                  senderName?: string;
                  senderRole?: string | null;
                  sharedTo?: Array<"email"> | null;
                  updatedAtMs?: number | null;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "conversationLegacyId"
                    | "legacyId"
                    | "senderId"
                    | "senderName"
                    | "senderRole"
                    | "content"
                    | "edited"
                    | "editedAtMs"
                    | "deleted"
                    | "deletedAtMs"
                    | "deletedBy"
                    | "attachments"
                    | "reactions"
                    | "readBy"
                    | "deliveredTo"
                    | "readAtMs"
                    | "sharedTo"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "conversationAssignments";
                update: {
                  assignedById?: string | null;
                  assignedByName?: string | null;
                  assignedToId?: string;
                  assignedToName?: string;
                  createdAtMs?: number;
                  escalatedFromId?: string | null;
                  firstResponseAtMs?: number | null;
                  legacyId?: string;
                  priority?: "low" | "normal" | "high" | "urgent";
                  resolvedAtMs?: number | null;
                  resourceId?: string;
                  resourceType?: "direct_conversation" | "channel" | "message";
                  routingReason?: string | null;
                  routingRuleId?: string | null;
                  slaBreached?: boolean;
                  slaDeadlineMs?: number | null;
                  status?: "active" | "completed" | "escalated" | "transferred";
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "assignedToId"
                    | "assignedToName"
                    | "assignedById"
                    | "assignedByName"
                    | "routingReason"
                    | "routingRuleId"
                    | "priority"
                    | "status"
                    | "escalatedFromId"
                    | "slaDeadlineMs"
                    | "slaBreached"
                    | "firstResponseAtMs"
                    | "resolvedAtMs"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "messageAnalytics";
                update: {
                  channelType?: string | null;
                  clientId?: string | null;
                  conversationId?: string;
                  conversationType?: "direct" | "channel" | "thread";
                  createdAtMs?: number;
                  deliveredAtMs?: number | null;
                  deliveryAttempts?: number;
                  deliveryStatus?: "pending" | "delivered" | "failed";
                  firstReadAtMs?: number | null;
                  firstResponseAtMs?: number | null;
                  legacyId?: string;
                  messageId?: string;
                  projectId?: string | null;
                  reactionCount?: number;
                  replyCount?: number;
                  responseTimeMs?: number | null;
                  senderId?: string;
                  shareCount?: number;
                  timeToReadMs?: number | null;
                  updatedAtMs?: number;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "conversationType"
                    | "conversationId"
                    | "messageId"
                    | "senderId"
                    | "firstReadAtMs"
                    | "firstResponseAtMs"
                    | "responseTimeMs"
                    | "timeToReadMs"
                    | "reactionCount"
                    | "replyCount"
                    | "shareCount"
                    | "deliveryAttempts"
                    | "deliveryStatus"
                    | "deliveredAtMs"
                    | "channelType"
                    | "clientId"
                    | "projectId"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "inboxItems";
                update: {
                  archived?: boolean;
                  archivedAtMs?: number | null;
                  assignedToId?: string | null;
                  assignedToName?: string | null;
                  clientId?: string | null;
                  createdAtMs?: number;
                  isRead?: boolean;
                  lastMessageAtMs?: number | null;
                  lastMessageSenderId?: string | null;
                  lastMessageSenderName?: string | null;
                  lastMessageSnippet?: string | null;
                  lastReadAtMs?: number | null;
                  legacyId?: string;
                  muted?: boolean;
                  mutedAtMs?: number | null;
                  otherParticipantId?: string | null;
                  otherParticipantName?: string | null;
                  pinned?: boolean;
                  pinnedAtMs?: number | null;
                  priority?: "low" | "normal" | "high" | "urgent" | null;
                  projectId?: string | null;
                  sourceId?: string;
                  sourceName?: string;
                  sourceType?: "direct_message" | "channel" | "email";
                  unreadCount?: number;
                  updatedAtMs?: number;
                  userId?: string;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "userId"
                    | "sourceType"
                    | "sourceId"
                    | "sourceName"
                    | "clientId"
                    | "projectId"
                    | "otherParticipantId"
                    | "otherParticipantName"
                    | "lastMessageSnippet"
                    | "lastMessageAtMs"
                    | "lastMessageSenderId"
                    | "lastMessageSenderName"
                    | "unreadCount"
                    | "isRead"
                    | "lastReadAtMs"
                    | "pinned"
                    | "pinnedAtMs"
                    | "archived"
                    | "archivedAtMs"
                    | "muted"
                    | "mutedAtMs"
                    | "assignedToId"
                    | "assignedToName"
                    | "priority"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "privacyMasks";
                update: {
                  createdAtMs?: number;
                  displayName?: string;
                  legacyId?: string;
                  maskType?: "pseudonym" | "relay_number" | "anonymous";
                  realName?: string | null;
                  relayIdentifier?: string | null;
                  resourceId?: string;
                  resourceType?: "conversation" | "channel" | "user";
                  updatedAtMs?: number;
                  visibleToRoles?: Array<string>;
                  visibleToUserIds?: Array<string>;
                  workspaceId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "workspaceId"
                    | "legacyId"
                    | "resourceType"
                    | "resourceId"
                    | "maskType"
                    | "displayName"
                    | "realName"
                    | "relayIdentifier"
                    | "visibleToRoles"
                    | "visibleToUserIds"
                    | "createdAtMs"
                    | "updatedAtMs"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
        },
        any,
        Name
      >;
    };
  };
