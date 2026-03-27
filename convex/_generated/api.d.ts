/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as adSyncWorker from "../adSyncWorker.js";
import type * as adSyncWorkerActions from "../adSyncWorkerActions.js";
import type * as adminFeatures from "../adminFeatures.js";
import type * as adminFeaturesAi from "../adminFeaturesAi.js";
import type * as adminInvitations from "../adminInvitations.js";
import type * as adminMigrations from "../adminMigrations.js";
import type * as adminNotifications from "../adminNotifications.js";
import type * as adminUsage from "../adminUsage.js";
import type * as adminUsers from "../adminUsers.js";
import type * as adsAdMetrics from "../adsAdMetrics.js";
import type * as adsAudiences from "../adsAudiences.js";
import type * as adsCampaignGroups from "../adsCampaignGroups.js";
import type * as adsCampaignInsights from "../adsCampaignInsights.js";
import type * as adsCampaigns from "../adsCampaigns.js";
import type * as adsCreatives from "../adsCreatives.js";
import type * as adsIntegrations from "../adsIntegrations.js";
import type * as adsIntegrations_accountInit from "../adsIntegrations/accountInit.js";
import type * as adsIntegrations_credentialsStatus from "../adsIntegrations/credentialsStatus.js";
import type * as adsIntegrations_discovery from "../adsIntegrations/discovery.js";
import type * as adsIntegrations_metricsDeletion from "../adsIntegrations/metricsDeletion.js";
import type * as adsIntegrations_queries from "../adsIntegrations/queries.js";
import type * as adsIntegrations_settings from "../adsIntegrations/settings.js";
import type * as adsIntegrations_shared from "../adsIntegrations/shared.js";
import type * as adsIntegrations_syncJobs from "../adsIntegrations/syncJobs.js";
import type * as adsMetrics from "../adsMetrics.js";
import type * as adsTargeting from "../adsTargeting.js";
import type * as agent from "../agent.js";
import type * as agentActions from "../agentActions.js";
import type * as agentActions_helpers from "../agentActions/helpers.js";
import type * as agentActions_helpers_context from "../agentActions/helpers/context.js";
import type * as agentActions_helpers_dates from "../agentActions/helpers/dates.js";
import type * as agentActions_helpers_formatting from "../agentActions/helpers/formatting.js";
import type * as agentActions_helpers_intents from "../agentActions/helpers/intents.js";
import type * as agentActions_helpers_proposalConversation from "../agentActions/helpers/proposalConversation.js";
import type * as agentActions_helpers_proposals from "../agentActions/helpers/proposals.js";
import type * as agentActions_helpers_values from "../agentActions/helpers/values.js";
import type * as agentActions_operations from "../agentActions/operations.js";
import type * as agentActions_operations_ads from "../agentActions/operations/ads.js";
import type * as agentActions_operations_ads_index from "../agentActions/operations/ads/index.js";
import type * as agentActions_operations_ads_reports from "../agentActions/operations/ads/reports.js";
import type * as agentActions_operations_clients from "../agentActions/operations/clients.js";
import type * as agentActions_operations_clients_index from "../agentActions/operations/clients/index.js";
import type * as agentActions_operations_messaging from "../agentActions/operations/messaging.js";
import type * as agentActions_operations_messaging_index from "../agentActions/operations/messaging/index.js";
import type * as agentActions_operations_projects from "../agentActions/operations/projects.js";
import type * as agentActions_operations_projects_index from "../agentActions/operations/projects/index.js";
import type * as agentActions_operations_proposals from "../agentActions/operations/proposals.js";
import type * as agentActions_operations_proposals_index from "../agentActions/operations/proposals/index.js";
import type * as agentActions_operations_reports from "../agentActions/operations/reports.js";
import type * as agentActions_operations_shared from "../agentActions/operations/shared.js";
import type * as agentActions_operations_tasks from "../agentActions/operations/tasks.js";
import type * as agentActions_operations_tasks_index from "../agentActions/operations/tasks/index.js";
import type * as agentActions_prompting from "../agentActions/prompting.js";
import type * as agentActions_types from "../agentActions/types.js";
import type * as agentConversations from "../agentConversations.js";
import type * as agentMessages from "../agentMessages.js";
import type * as alertRules from "../alertRules.js";
import type * as analyticsInsights from "../analyticsInsights.js";
import type * as analyticsIntegrations from "../analyticsIntegrations.js";
import type * as analyticsIntegrations_accountInit from "../analyticsIntegrations/accountInit.js";
import type * as analyticsIntegrations_discovery from "../analyticsIntegrations/discovery.js";
import type * as analyticsIntegrations_queries from "../analyticsIntegrations/queries.js";
import type * as analyticsIntegrations_settings from "../analyticsIntegrations/settings.js";
import type * as analyticsIntegrations_shared from "../analyticsIntegrations/shared.js";
import type * as apiIdempotency from "../apiIdempotency.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as clients from "../clients.js";
import type * as collaborationChannels from "../collaborationChannels.js";
import type * as collaborationMessages from "../collaborationMessages.js";
import type * as collaborationMessages_listing from "../collaborationMessages/listing.js";
import type * as collaborationMessages_messageMutations from "../collaborationMessages/messageMutations.js";
import type * as collaborationMessages_readTracking from "../collaborationMessages/readTracking.js";
import type * as collaborationMessages_shared from "../collaborationMessages/shared.js";
import type * as collaborationMessages_syncAndPins from "../collaborationMessages/syncAndPins.js";
import type * as collaborationTyping from "../collaborationTyping.js";
import type * as creativesCopy from "../creativesCopy.js";
import type * as crons from "../crons.js";
import type * as customFormulas from "../customFormulas.js";
import type * as debug from "../debug.js";
import type * as directMessages from "../directMessages.js";
import type * as errors from "../errors.js";
import type * as files from "../files.js";
import type * as functions from "../functions.js";
import type * as gamma from "../gamma.js";
import type * as geminiRateLimit from "../geminiRateLimit.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as httpActions from "../httpActions.js";
import type * as meetingIntegrations from "../meetingIntegrations.js";
import type * as meetings from "../meetings.js";
import type * as notificationTargeting from "../notificationTargeting.js";
import type * as notifications from "../notifications.js";
import type * as onboardingStates from "../onboardingStates.js";
import type * as privacyMasks from "../privacyMasks.js";
import type * as problemReports from "../problemReports.js";
import type * as projectMilestones from "../projectMilestones.js";
import type * as projects from "../projects.js";
import type * as proposalAnalytics from "../proposalAnalytics.js";
import type * as proposalGeneration from "../proposalGeneration.js";
import type * as proposalTemplates from "../proposalTemplates.js";
import type * as proposalVersions from "../proposalVersions.js";
import type * as proposals from "../proposals.js";
import type * as rateLimit from "../rateLimit.js";
import type * as rateLimitApi from "../rateLimitApi.js";
import type * as schedulerAlertPreferences from "../schedulerAlertPreferences.js";
import type * as schedulerEvents from "../schedulerEvents.js";
import type * as schema_collaborationTables from "../schema/collaborationTables.js";
import type * as schema_jsonValidators from "../schema/jsonValidators.js";
import type * as schema_marketingTables from "../schema/marketingTables.js";
import type * as schema_opsTables from "../schema/opsTables.js";
import type * as schema_systemTables from "../schema/systemTables.js";
import type * as schema_workspaceTables from "../schema/workspaceTables.js";
import type * as serverCache from "../serverCache.js";
import type * as settings from "../settings.js";
import type * as socialIntegrations from "../socialIntegrations.js";
import type * as socialMetrics from "../socialMetrics.js";
import type * as taskComments from "../taskComments.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  adSyncWorker: typeof adSyncWorker;
  adSyncWorkerActions: typeof adSyncWorkerActions;
  adminFeatures: typeof adminFeatures;
  adminFeaturesAi: typeof adminFeaturesAi;
  adminInvitations: typeof adminInvitations;
  adminMigrations: typeof adminMigrations;
  adminNotifications: typeof adminNotifications;
  adminUsage: typeof adminUsage;
  adminUsers: typeof adminUsers;
  adsAdMetrics: typeof adsAdMetrics;
  adsAudiences: typeof adsAudiences;
  adsCampaignGroups: typeof adsCampaignGroups;
  adsCampaignInsights: typeof adsCampaignInsights;
  adsCampaigns: typeof adsCampaigns;
  adsCreatives: typeof adsCreatives;
  adsIntegrations: typeof adsIntegrations;
  "adsIntegrations/accountInit": typeof adsIntegrations_accountInit;
  "adsIntegrations/credentialsStatus": typeof adsIntegrations_credentialsStatus;
  "adsIntegrations/discovery": typeof adsIntegrations_discovery;
  "adsIntegrations/metricsDeletion": typeof adsIntegrations_metricsDeletion;
  "adsIntegrations/queries": typeof adsIntegrations_queries;
  "adsIntegrations/settings": typeof adsIntegrations_settings;
  "adsIntegrations/shared": typeof adsIntegrations_shared;
  "adsIntegrations/syncJobs": typeof adsIntegrations_syncJobs;
  adsMetrics: typeof adsMetrics;
  adsTargeting: typeof adsTargeting;
  agent: typeof agent;
  agentActions: typeof agentActions;
  "agentActions/helpers": typeof agentActions_helpers;
  "agentActions/helpers/context": typeof agentActions_helpers_context;
  "agentActions/helpers/dates": typeof agentActions_helpers_dates;
  "agentActions/helpers/formatting": typeof agentActions_helpers_formatting;
  "agentActions/helpers/intents": typeof agentActions_helpers_intents;
  "agentActions/helpers/proposalConversation": typeof agentActions_helpers_proposalConversation;
  "agentActions/helpers/proposals": typeof agentActions_helpers_proposals;
  "agentActions/helpers/values": typeof agentActions_helpers_values;
  "agentActions/operations": typeof agentActions_operations;
  "agentActions/operations/ads": typeof agentActions_operations_ads;
  "agentActions/operations/ads/index": typeof agentActions_operations_ads_index;
  "agentActions/operations/ads/reports": typeof agentActions_operations_ads_reports;
  "agentActions/operations/clients": typeof agentActions_operations_clients;
  "agentActions/operations/clients/index": typeof agentActions_operations_clients_index;
  "agentActions/operations/messaging": typeof agentActions_operations_messaging;
  "agentActions/operations/messaging/index": typeof agentActions_operations_messaging_index;
  "agentActions/operations/projects": typeof agentActions_operations_projects;
  "agentActions/operations/projects/index": typeof agentActions_operations_projects_index;
  "agentActions/operations/proposals": typeof agentActions_operations_proposals;
  "agentActions/operations/proposals/index": typeof agentActions_operations_proposals_index;
  "agentActions/operations/reports": typeof agentActions_operations_reports;
  "agentActions/operations/shared": typeof agentActions_operations_shared;
  "agentActions/operations/tasks": typeof agentActions_operations_tasks;
  "agentActions/operations/tasks/index": typeof agentActions_operations_tasks_index;
  "agentActions/prompting": typeof agentActions_prompting;
  "agentActions/types": typeof agentActions_types;
  agentConversations: typeof agentConversations;
  agentMessages: typeof agentMessages;
  alertRules: typeof alertRules;
  analyticsInsights: typeof analyticsInsights;
  analyticsIntegrations: typeof analyticsIntegrations;
  "analyticsIntegrations/accountInit": typeof analyticsIntegrations_accountInit;
  "analyticsIntegrations/discovery": typeof analyticsIntegrations_discovery;
  "analyticsIntegrations/queries": typeof analyticsIntegrations_queries;
  "analyticsIntegrations/settings": typeof analyticsIntegrations_settings;
  "analyticsIntegrations/shared": typeof analyticsIntegrations_shared;
  apiIdempotency: typeof apiIdempotency;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  authActions: typeof authActions;
  clients: typeof clients;
  collaborationChannels: typeof collaborationChannels;
  collaborationMessages: typeof collaborationMessages;
  "collaborationMessages/listing": typeof collaborationMessages_listing;
  "collaborationMessages/messageMutations": typeof collaborationMessages_messageMutations;
  "collaborationMessages/readTracking": typeof collaborationMessages_readTracking;
  "collaborationMessages/shared": typeof collaborationMessages_shared;
  "collaborationMessages/syncAndPins": typeof collaborationMessages_syncAndPins;
  collaborationTyping: typeof collaborationTyping;
  creativesCopy: typeof creativesCopy;
  crons: typeof crons;
  customFormulas: typeof customFormulas;
  debug: typeof debug;
  directMessages: typeof directMessages;
  errors: typeof errors;
  files: typeof files;
  functions: typeof functions;
  gamma: typeof gamma;
  geminiRateLimit: typeof geminiRateLimit;
  health: typeof health;
  http: typeof http;
  httpActions: typeof httpActions;
  meetingIntegrations: typeof meetingIntegrations;
  meetings: typeof meetings;
  notificationTargeting: typeof notificationTargeting;
  notifications: typeof notifications;
  onboardingStates: typeof onboardingStates;
  privacyMasks: typeof privacyMasks;
  problemReports: typeof problemReports;
  projectMilestones: typeof projectMilestones;
  projects: typeof projects;
  proposalAnalytics: typeof proposalAnalytics;
  proposalGeneration: typeof proposalGeneration;
  proposalTemplates: typeof proposalTemplates;
  proposalVersions: typeof proposalVersions;
  proposals: typeof proposals;
  rateLimit: typeof rateLimit;
  rateLimitApi: typeof rateLimitApi;
  schedulerAlertPreferences: typeof schedulerAlertPreferences;
  schedulerEvents: typeof schedulerEvents;
  "schema/collaborationTables": typeof schema_collaborationTables;
  "schema/jsonValidators": typeof schema_jsonValidators;
  "schema/marketingTables": typeof schema_marketingTables;
  "schema/opsTables": typeof schema_opsTables;
  "schema/systemTables": typeof schema_systemTables;
  "schema/workspaceTables": typeof schema_workspaceTables;
  serverCache: typeof serverCache;
  settings: typeof settings;
  socialIntegrations: typeof socialIntegrations;
  socialMetrics: typeof socialMetrics;
  taskComments: typeof taskComments;
  tasks: typeof tasks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAt: number;
                  email: string;
                  emailVerified: boolean;
                  image?: null | string;
                  name: string;
                  updatedAt: number;
                  userId?: null | string;
                };
                model: "user";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  ipAddress?: null | string;
                  token: string;
                  updatedAt: number;
                  userAgent?: null | string;
                  userId: string;
                };
                model: "session";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId: string;
                  createdAt: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  identifier: string;
                  updatedAt: number;
                  value: string;
                };
                model: "verification";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt?: null | number;
                  privateKey: string;
                  publicKey: string;
                };
                model: "jwks";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "userId"
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
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
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
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
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
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
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
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
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
        any
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "userId"
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
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
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
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
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
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
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
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
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
        any
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          limit?: number;
          model: "user" | "session" | "account" | "verification" | "jwks";
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
        any
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          model: "user" | "session" | "account" | "verification" | "jwks";
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
        any
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  name?: string;
                  updatedAt?: number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "userId"
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
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
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
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
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
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
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
                model: "jwks";
                update: {
                  createdAt?: number;
                  expiresAt?: null | number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
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
        any
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  name?: string;
                  updatedAt?: number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "userId"
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
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
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
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
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
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
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
                model: "jwks";
                update: {
                  createdAt?: number;
                  expiresAt?: null | number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
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
        any
      >;
    };
  };
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
