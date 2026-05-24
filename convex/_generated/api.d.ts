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
import type * as adminUserPage from "../adminUserPage.js";
import type * as adminUsers from "../adminUsers.js";
import type * as adsAdMetrics from "../adsAdMetrics.js";
import type * as adsAdSets from "../adsAdSets.js";
import type * as adsAudiences from "../adsAudiences.js";
import type * as adsAudiencesMeta from "../adsAudiencesMeta.js";
import type * as adsCampaignGroups from "../adsCampaignGroups.js";
import type * as adsCampaignInsights from "../adsCampaignInsights.js";
import type * as adsCampaigns from "../adsCampaigns.js";
import type * as adsCreatives from "../adsCreatives.js";
import type * as adsIntegrations from "../adsIntegrations.js";
import type * as adsMetaCampaigns from "../adsMetaCampaigns.js";
import type * as adsMetaEvents from "../adsMetaEvents.js";
import type * as adsMetaTools from "../adsMetaTools.js";
import type * as adsMetrics from "../adsMetrics.js";
import type * as adsTargeting from "../adsTargeting.js";
import type * as agent from "../agent.js";
import type * as agentActions from "../agentActions.js";
import type * as agentAttachments from "../agentAttachments.js";
import type * as agentConversations from "../agentConversations.js";
import type * as agentMessages from "../agentMessages.js";
import type * as alertRules from "../alertRules.js";
import type * as analyticsInsights from "../analyticsInsights.js";
import type * as analyticsIntegrations from "../analyticsIntegrations.js";
import type * as apiIdempotency from "../apiIdempotency.js";
import type * as appProxy from "../appProxy.js";
import type * as artifactArchiveBackfills from "../artifactArchiveBackfills.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as clientAdminTeamSync from "../clientAdminTeamSync.js";
import type * as clients from "../clients.js";
import type * as collaborationChannelAvatars from "../collaborationChannelAvatars.js";
import type * as collaborationChannels from "../collaborationChannels.js";
import type * as collaborationMessages from "../collaborationMessages.js";
import type * as collaborationTyping from "../collaborationTyping.js";
import type * as conversationRouting from "../conversationRouting.js";
import type * as creativesCopy from "../creativesCopy.js";
import type * as crons from "../crons.js";
import type * as customFormulas from "../customFormulas.js";
import type * as debug from "../debug.js";
import type * as directMessages from "../directMessages.js";
import type * as domains_collaboration_collaborationChannelAvatars from "../domains/collaboration/collaborationChannelAvatars.js";
import type * as domains_collaboration_collaborationChannels from "../domains/collaboration/collaborationChannels.js";
import type * as domains_collaboration_collaborationMessages_listing from "../domains/collaboration/collaborationMessages/listing.js";
import type * as domains_collaboration_collaborationMessages_messageMutations from "../domains/collaboration/collaborationMessages/messageMutations.js";
import type * as domains_collaboration_collaborationMessages_readTracking from "../domains/collaboration/collaborationMessages/readTracking.js";
import type * as domains_collaboration_collaborationMessages_shared from "../domains/collaboration/collaborationMessages/shared.js";
import type * as domains_collaboration_collaborationMessages_syncAndPins from "../domains/collaboration/collaborationMessages/syncAndPins.js";
import type * as domains_collaboration_collaborationTyping from "../domains/collaboration/collaborationTyping.js";
import type * as domains_collaboration_conversationRouting from "../domains/collaboration/conversationRouting.js";
import type * as domains_collaboration_directMessages_conversations from "../domains/collaboration/directMessages/conversations.js";
import type * as domains_collaboration_directMessages_messages from "../domains/collaboration/directMessages/messages.js";
import type * as domains_collaboration_directMessages_pollsAndReactions from "../domains/collaboration/directMessages/pollsAndReactions.js";
import type * as domains_collaboration_directMessages_shared from "../domains/collaboration/directMessages/shared.js";
import type * as domains_collaboration_inboxItems from "../domains/collaboration/inboxItems.js";
import type * as domains_collaboration_messageAnalytics from "../domains/collaboration/messageAnalytics.js";
import type * as domains_marketing_adSyncWorker from "../domains/marketing/adSyncWorker.js";
import type * as domains_marketing_adSyncWorkerActions from "../domains/marketing/adSyncWorkerActions.js";
import type * as domains_marketing_adsAdMetrics from "../domains/marketing/adsAdMetrics.js";
import type * as domains_marketing_adsAdSets from "../domains/marketing/adsAdSets.js";
import type * as domains_marketing_adsAudiences from "../domains/marketing/adsAudiences.js";
import type * as domains_marketing_adsAudiencesMeta from "../domains/marketing/adsAudiencesMeta.js";
import type * as domains_marketing_adsCampaignGroups from "../domains/marketing/adsCampaignGroups.js";
import type * as domains_marketing_adsCampaignInsights from "../domains/marketing/adsCampaignInsights.js";
import type * as domains_marketing_adsCampaigns from "../domains/marketing/adsCampaigns.js";
import type * as domains_marketing_adsCreatives from "../domains/marketing/adsCreatives.js";
import type * as domains_marketing_adsCreativesActions_createCreative from "../domains/marketing/adsCreativesActions/createCreative.js";
import type * as domains_marketing_adsCreativesActions_listCreatives from "../domains/marketing/adsCreativesActions/listCreatives.js";
import type * as domains_marketing_adsCreativesActions_listMetaPageActors from "../domains/marketing/adsCreativesActions/listMetaPageActors.js";
import type * as domains_marketing_adsCreativesActions_shared from "../domains/marketing/adsCreativesActions/shared.js";
import type * as domains_marketing_adsCreativesActions_updateCreative from "../domains/marketing/adsCreativesActions/updateCreative.js";
import type * as domains_marketing_adsCreativesActions_updateCreativeStatus from "../domains/marketing/adsCreativesActions/updateCreativeStatus.js";
import type * as domains_marketing_adsCreativesActions_uploadMedia from "../domains/marketing/adsCreativesActions/uploadMedia.js";
import type * as domains_marketing_adsIntegrations_accountInit from "../domains/marketing/adsIntegrations/accountInit.js";
import type * as domains_marketing_adsIntegrations_credentialsStatus from "../domains/marketing/adsIntegrations/credentialsStatus.js";
import type * as domains_marketing_adsIntegrations_discovery from "../domains/marketing/adsIntegrations/discovery.js";
import type * as domains_marketing_adsIntegrations_metricsDeletion from "../domains/marketing/adsIntegrations/metricsDeletion.js";
import type * as domains_marketing_adsIntegrations_queries from "../domains/marketing/adsIntegrations/queries.js";
import type * as domains_marketing_adsIntegrations_settings from "../domains/marketing/adsIntegrations/settings.js";
import type * as domains_marketing_adsIntegrations_shared from "../domains/marketing/adsIntegrations/shared.js";
import type * as domains_marketing_adsIntegrations_syncJobs from "../domains/marketing/adsIntegrations/syncJobs.js";
import type * as domains_marketing_adsMetaCampaigns from "../domains/marketing/adsMetaCampaigns.js";
import type * as domains_marketing_adsMetaEvents from "../domains/marketing/adsMetaEvents.js";
import type * as domains_marketing_adsMetaTools from "../domains/marketing/adsMetaTools.js";
import type * as domains_marketing_adsMetrics from "../domains/marketing/adsMetrics.js";
import type * as domains_marketing_adsTargeting from "../domains/marketing/adsTargeting.js";
import type * as domains_marketing_analyticsInsights from "../domains/marketing/analyticsInsights.js";
import type * as domains_marketing_analyticsIntegrations_accountInit from "../domains/marketing/analyticsIntegrations/accountInit.js";
import type * as domains_marketing_analyticsIntegrations_discovery from "../domains/marketing/analyticsIntegrations/discovery.js";
import type * as domains_marketing_analyticsIntegrations_metrics from "../domains/marketing/analyticsIntegrations/metrics.js";
import type * as domains_marketing_analyticsIntegrations_queries from "../domains/marketing/analyticsIntegrations/queries.js";
import type * as domains_marketing_analyticsIntegrations_settings from "../domains/marketing/analyticsIntegrations/settings.js";
import type * as domains_marketing_analyticsIntegrations_shared from "../domains/marketing/analyticsIntegrations/shared.js";
import type * as domains_marketing_creativesCopy from "../domains/marketing/creativesCopy.js";
import type * as domains_marketing_customFormulas from "../domains/marketing/customFormulas.js";
import type * as domains_marketing_metaWebhookEvents from "../domains/marketing/metaWebhookEvents.js";
import type * as domains_marketing_socialIntegrations_discovery from "../domains/marketing/socialIntegrations/discovery.js";
import type * as domains_marketing_socialIntegrations_metricsUpsert from "../domains/marketing/socialIntegrations/metricsUpsert.js";
import type * as domains_marketing_socialIntegrations_queries from "../domains/marketing/socialIntegrations/queries.js";
import type * as domains_marketing_socialIntegrations_settings from "../domains/marketing/socialIntegrations/settings.js";
import type * as domains_marketing_socialIntegrations_syncJobs from "../domains/marketing/socialIntegrations/syncJobs.js";
import type * as domains_marketing_socialMetrics from "../domains/marketing/socialMetrics.js";
import type * as domains_marketing_socialSyncWorkerActions from "../domains/marketing/socialSyncWorkerActions.js";
import type * as domains_ops_alertRules from "../domains/ops/alertRules.js";
import type * as domains_ops_gamma from "../domains/ops/gamma.js";
import type * as domains_ops_meetingArchiveActions from "../domains/ops/meetingArchiveActions.js";
import type * as domains_ops_meetingArchives from "../domains/ops/meetingArchives.js";
import type * as domains_ops_meetingIntegrations from "../domains/ops/meetingIntegrations.js";
import type * as domains_ops_meetings from "../domains/ops/meetings.js";
import type * as domains_ops_notificationTargeting from "../domains/ops/notificationTargeting.js";
import type * as domains_ops_notifications from "../domains/ops/notifications.js";
import type * as domains_ops_presentationDeck from "../domains/ops/presentationDeck.js";
import type * as domains_ops_proposalAnalytics from "../domains/ops/proposalAnalytics.js";
import type * as domains_ops_proposalArchiveActions from "../domains/ops/proposalArchiveActions.js";
import type * as domains_ops_proposalArchives from "../domains/ops/proposalArchives.js";
import type * as domains_ops_proposalGeneration from "../domains/ops/proposalGeneration.js";
import type * as domains_ops_proposalTemplates from "../domains/ops/proposalTemplates.js";
import type * as domains_ops_proposalVersions from "../domains/ops/proposalVersions.js";
import type * as domains_ops_proposals from "../domains/ops/proposals.js";
import type * as domains_ops_schedulerAlertPreferences from "../domains/ops/schedulerAlertPreferences.js";
import type * as domains_platform_adminFeatures from "../domains/platform/adminFeatures.js";
import type * as domains_platform_adminFeaturesAi from "../domains/platform/adminFeaturesAi.js";
import type * as domains_platform_adminInvitations from "../domains/platform/adminInvitations.js";
import type * as domains_platform_adminMigrations from "../domains/platform/adminMigrations.js";
import type * as domains_platform_adminNotifications from "../domains/platform/adminNotifications.js";
import type * as domains_platform_adminUsage from "../domains/platform/adminUsage.js";
import type * as domains_platform_adminUserPage from "../domains/platform/adminUserPage.js";
import type * as domains_platform_adminUsers from "../domains/platform/adminUsers.js";
import type * as domains_platform_agent from "../domains/platform/agent.js";
import type * as domains_platform_agentActions from "../domains/platform/agentActions.js";
import type * as domains_platform_agentActions_helpers from "../domains/platform/agentActions/helpers.js";
import type * as domains_platform_agentActions_helpers_confirmation from "../domains/platform/agentActions/helpers/confirmation.js";
import type * as domains_platform_agentActions_helpers_context from "../domains/platform/agentActions/helpers/context.js";
import type * as domains_platform_agentActions_helpers_dates from "../domains/platform/agentActions/helpers/dates.js";
import type * as domains_platform_agentActions_helpers_formatting from "../domains/platform/agentActions/helpers/formatting.js";
import type * as domains_platform_agentActions_helpers_intents from "../domains/platform/agentActions/helpers/intents.js";
import type * as domains_platform_agentActions_helpers_intents_execute from "../domains/platform/agentActions/helpers/intents/execute.js";
import type * as domains_platform_agentActions_helpers_intents_index from "../domains/platform/agentActions/helpers/intents/index.js";
import type * as domains_platform_agentActions_helpers_intents_navigation from "../domains/platform/agentActions/helpers/intents/navigation.js";
import type * as domains_platform_agentActions_helpers_intents_parsing from "../domains/platform/agentActions/helpers/intents/parsing.js";
import type * as domains_platform_agentActions_helpers_proposalConversation from "../domains/platform/agentActions/helpers/proposalConversation.js";
import type * as domains_platform_agentActions_helpers_proposals from "../domains/platform/agentActions/helpers/proposals.js";
import type * as domains_platform_agentActions_helpers_values from "../domains/platform/agentActions/helpers/values.js";
import type * as domains_platform_agentActions_operations from "../domains/platform/agentActions/operations.js";
import type * as domains_platform_agentActions_operations_ads from "../domains/platform/agentActions/operations/ads.js";
import type * as domains_platform_agentActions_operations_ads_index from "../domains/platform/agentActions/operations/ads/index.js";
import type * as domains_platform_agentActions_operations_ads_reports from "../domains/platform/agentActions/operations/ads/reports.js";
import type * as domains_platform_agentActions_operations_analyticsSummary from "../domains/platform/agentActions/operations/analyticsSummary.js";
import type * as domains_platform_agentActions_operations_clients from "../domains/platform/agentActions/operations/clients.js";
import type * as domains_platform_agentActions_operations_clients_index from "../domains/platform/agentActions/operations/clients/index.js";
import type * as domains_platform_agentActions_operations_meetings_index from "../domains/platform/agentActions/operations/meetings/index.js";
import type * as domains_platform_agentActions_operations_messaging from "../domains/platform/agentActions/operations/messaging.js";
import type * as domains_platform_agentActions_operations_messaging_index from "../domains/platform/agentActions/operations/messaging/index.js";
import type * as domains_platform_agentActions_operations_notifications_index from "../domains/platform/agentActions/operations/notifications/index.js";
import type * as domains_platform_agentActions_operations_projects from "../domains/platform/agentActions/operations/projects.js";
import type * as domains_platform_agentActions_operations_projects_index from "../domains/platform/agentActions/operations/projects/index.js";
import type * as domains_platform_agentActions_operations_proposals from "../domains/platform/agentActions/operations/proposals.js";
import type * as domains_platform_agentActions_operations_proposals_index from "../domains/platform/agentActions/operations/proposals/index.js";
import type * as domains_platform_agentActions_operations_reports from "../domains/platform/agentActions/operations/reports.js";
import type * as domains_platform_agentActions_operations_shared from "../domains/platform/agentActions/operations/shared.js";
import type * as domains_platform_agentActions_operations_socials_index from "../domains/platform/agentActions/operations/socials/index.js";
import type * as domains_platform_agentActions_operations_socials_socialSummary from "../domains/platform/agentActions/operations/socials/socialSummary.js";
import type * as domains_platform_agentActions_operations_spreadsheet_builders from "../domains/platform/agentActions/operations/spreadsheet/builders.js";
import type * as domains_platform_agentActions_operations_spreadsheet_export from "../domains/platform/agentActions/operations/spreadsheet/export.js";
import type * as domains_platform_agentActions_operations_taskSummary from "../domains/platform/agentActions/operations/taskSummary.js";
import type * as domains_platform_agentActions_operations_tasks from "../domains/platform/agentActions/operations/tasks.js";
import type * as domains_platform_agentActions_operations_tasks_index from "../domains/platform/agentActions/operations/tasks/index.js";
import type * as domains_platform_agentActions_prompting from "../domains/platform/agentActions/prompting.js";
import type * as domains_platform_agentActions_runExecuteTurn from "../domains/platform/agentActions/runExecuteTurn.js";
import type * as domains_platform_agentActions_types from "../domains/platform/agentActions/types.js";
import type * as domains_platform_agentAttachments from "../domains/platform/agentAttachments.js";
import type * as domains_platform_agentConversations from "../domains/platform/agentConversations.js";
import type * as domains_platform_agentMessages from "../domains/platform/agentMessages.js";
import type * as domains_platform_apiIdempotency from "../domains/platform/apiIdempotency.js";
import type * as domains_platform_appProxy from "../domains/platform/appProxy.js";
import type * as domains_platform_artifactArchiveBackfills from "../domains/platform/artifactArchiveBackfills.js";
import type * as domains_platform_auditLogs from "../domains/platform/auditLogs.js";
import type * as domains_platform_auth from "../domains/platform/auth.js";
import type * as domains_platform_authActions from "../domains/platform/authActions.js";
import type * as domains_platform_clientAdminTeamSync from "../domains/platform/clientAdminTeamSync.js";
import type * as domains_platform_debug from "../domains/platform/debug.js";
import type * as domains_platform_geminiRateLimit from "../domains/platform/geminiRateLimit.js";
import type * as domains_platform_health from "../domains/platform/health.js";
import type * as domains_platform_httpActions from "../domains/platform/httpActions.js";
import type * as domains_platform_migrations_adMetricsCurrency from "../domains/platform/migrations/adMetricsCurrency.js";
import type * as domains_platform_migrations_adminDiagnostics from "../domains/platform/migrations/adminDiagnostics.js";
import type * as domains_platform_migrations_clientAdminTeam from "../domains/platform/migrations/clientAdminTeam.js";
import type * as domains_platform_migrations_taskAssigneePools from "../domains/platform/migrations/taskAssigneePools.js";
import type * as domains_platform_onboardingStates from "../domains/platform/onboardingStates.js";
import type * as domains_platform_privacyMasks from "../domains/platform/privacyMasks.js";
import type * as domains_platform_problemReports from "../domains/platform/problemReports.js";
import type * as domains_platform_rateLimit from "../domains/platform/rateLimit.js";
import type * as domains_platform_rateLimitApi from "../domains/platform/rateLimitApi.js";
import type * as domains_platform_schedulerEvents from "../domains/platform/schedulerEvents.js";
import type * as domains_platform_serverCache from "../domains/platform/serverCache.js";
import type * as domains_platform_settings from "../domains/platform/settings.js";
import type * as domains_platform_users from "../domains/platform/users.js";
import type * as domains_workspace_clients from "../domains/workspace/clients.js";
import type * as domains_workspace_projectDocumentImport from "../domains/workspace/projectDocumentImport.js";
import type * as domains_workspace_projectDocumentImportParsing from "../domains/workspace/projectDocumentImportParsing.js";
import type * as domains_workspace_projectMilestones from "../domains/workspace/projectMilestones.js";
import type * as domains_workspace_projects from "../domains/workspace/projects.js";
import type * as domains_workspace_projects_listFilters from "../domains/workspace/projects/listFilters.js";
import type * as domains_workspace_taskAssignees from "../domains/workspace/taskAssignees.js";
import type * as domains_workspace_taskComments from "../domains/workspace/taskComments.js";
import type * as domains_workspace_taskDocumentImport from "../domains/workspace/taskDocumentImport.js";
import type * as domains_workspace_taskDocumentImportParsing from "../domains/workspace/taskDocumentImportParsing.js";
import type * as domains_workspace_taskDocumentImportQueries from "../domains/workspace/taskDocumentImportQueries.js";
import type * as domains_workspace_tasks from "../domains/workspace/tasks.js";
import type * as domains_workspace_tasks_listFilters from "../domains/workspace/tasks/listFilters.js";
import type * as domains_workspace_tasks_projectCounts from "../domains/workspace/tasks/projectCounts.js";
import type * as errors from "../errors.js";
import type * as files from "../files.js";
import type * as functions from "../functions.js";
import type * as gamma from "../gamma.js";
import type * as geminiRateLimit from "../geminiRateLimit.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as httpActions from "../httpActions.js";
import type * as httpActions_metaWebhook from "../httpActions/metaWebhook.js";
import type * as inboxItems from "../inboxItems.js";
import type * as lib_artifactArchiveSchedule from "../lib/artifactArchiveSchedule.js";
import type * as lib_collaboration_readCheckpoints from "../lib/collaboration/readCheckpoints.js";
import type * as lib_collaborationPollMessage from "../lib/collaborationPollMessage.js";
import type * as lib_debugIntrospection from "../lib/debugIntrospection.js";
import type * as lib_facebookAdsAccess from "../lib/facebookAdsAccess.js";
import type * as lib_fileStorage from "../lib/fileStorage.js";
import type * as lib_functions_actionWrappers from "../lib/functions/actionWrappers.js";
import type * as lib_functions_auth from "../lib/functions/auth.js";
import type * as lib_functions_idempotency from "../lib/functions/idempotency.js";
import type * as lib_functions_mutationWrappers from "../lib/functions/mutationWrappers.js";
import type * as lib_functions_pagination from "../lib/functions/pagination.js";
import type * as lib_functions_queryWrappers from "../lib/functions/queryWrappers.js";
import type * as lib_functions_rateLimitedWrappers from "../lib/functions/rateLimitedWrappers.js";
import type * as lib_functions_response from "../lib/functions/response.js";
import type * as lib_functions_softDeleteDb from "../lib/functions/softDeleteDb.js";
import type * as lib_functions_types from "../lib/functions/types.js";
import type * as lib_functions_zodWrappers from "../lib/functions/zodWrappers.js";
import type * as lib_metaAudienceHash from "../lib/metaAudienceHash.js";
import type * as lib_metaCapiUserData from "../lib/metaCapiUserData.js";
import type * as lib_metaSha256 from "../lib/metaSha256.js";
import type * as lib_metaWebhookAuth from "../lib/metaWebhookAuth.js";
import type * as lib_r2ArtifactStore from "../lib/r2ArtifactStore.js";
import type * as lib_storageAccess from "../lib/storageAccess.js";
import type * as lib_webhookAuth from "../lib/webhookAuth.js";
import type * as meetingArchiveActions from "../meetingArchiveActions.js";
import type * as meetingArchives from "../meetingArchives.js";
import type * as meetingIntegrations from "../meetingIntegrations.js";
import type * as meetings from "../meetings.js";
import type * as messageAnalytics from "../messageAnalytics.js";
import type * as metaWebhookEvents from "../metaWebhookEvents.js";
import type * as notificationTargeting from "../notificationTargeting.js";
import type * as notifications from "../notifications.js";
import type * as onboardingStates from "../onboardingStates.js";
import type * as presentationDeck from "../presentationDeck.js";
import type * as privacyMasks from "../privacyMasks.js";
import type * as problemReports from "../problemReports.js";
import type * as projectDocumentImport from "../projectDocumentImport.js";
import type * as projectDocumentImportParsing from "../projectDocumentImportParsing.js";
import type * as projectMilestones from "../projectMilestones.js";
import type * as projects from "../projects.js";
import type * as proposalAnalytics from "../proposalAnalytics.js";
import type * as proposalArchiveActions from "../proposalArchiveActions.js";
import type * as proposalArchives from "../proposalArchives.js";
import type * as proposalGeneration from "../proposalGeneration.js";
import type * as proposalTemplates from "../proposalTemplates.js";
import type * as proposalVersions from "../proposalVersions.js";
import type * as proposals from "../proposals.js";
import type * as r2 from "../r2.js";
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
import type * as socialSyncWorkerActions from "../socialSyncWorkerActions.js";
import type * as taskAssignees from "../taskAssignees.js";
import type * as taskComments from "../taskComments.js";
import type * as taskDocumentImport from "../taskDocumentImport.js";
import type * as taskDocumentImportParsing from "../taskDocumentImportParsing.js";
import type * as taskDocumentImportQueries from "../taskDocumentImportQueries.js";
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
  adminUserPage: typeof adminUserPage;
  adminUsers: typeof adminUsers;
  adsAdMetrics: typeof adsAdMetrics;
  adsAdSets: typeof adsAdSets;
  adsAudiences: typeof adsAudiences;
  adsAudiencesMeta: typeof adsAudiencesMeta;
  adsCampaignGroups: typeof adsCampaignGroups;
  adsCampaignInsights: typeof adsCampaignInsights;
  adsCampaigns: typeof adsCampaigns;
  adsCreatives: typeof adsCreatives;
  adsIntegrations: typeof adsIntegrations;
  adsMetaCampaigns: typeof adsMetaCampaigns;
  adsMetaEvents: typeof adsMetaEvents;
  adsMetaTools: typeof adsMetaTools;
  adsMetrics: typeof adsMetrics;
  adsTargeting: typeof adsTargeting;
  agent: typeof agent;
  agentActions: typeof agentActions;
  agentAttachments: typeof agentAttachments;
  agentConversations: typeof agentConversations;
  agentMessages: typeof agentMessages;
  alertRules: typeof alertRules;
  analyticsInsights: typeof analyticsInsights;
  analyticsIntegrations: typeof analyticsIntegrations;
  apiIdempotency: typeof apiIdempotency;
  appProxy: typeof appProxy;
  artifactArchiveBackfills: typeof artifactArchiveBackfills;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  authActions: typeof authActions;
  clientAdminTeamSync: typeof clientAdminTeamSync;
  clients: typeof clients;
  collaborationChannelAvatars: typeof collaborationChannelAvatars;
  collaborationChannels: typeof collaborationChannels;
  collaborationMessages: typeof collaborationMessages;
  collaborationTyping: typeof collaborationTyping;
  conversationRouting: typeof conversationRouting;
  creativesCopy: typeof creativesCopy;
  crons: typeof crons;
  customFormulas: typeof customFormulas;
  debug: typeof debug;
  directMessages: typeof directMessages;
  "domains/collaboration/collaborationChannelAvatars": typeof domains_collaboration_collaborationChannelAvatars;
  "domains/collaboration/collaborationChannels": typeof domains_collaboration_collaborationChannels;
  "domains/collaboration/collaborationMessages/listing": typeof domains_collaboration_collaborationMessages_listing;
  "domains/collaboration/collaborationMessages/messageMutations": typeof domains_collaboration_collaborationMessages_messageMutations;
  "domains/collaboration/collaborationMessages/readTracking": typeof domains_collaboration_collaborationMessages_readTracking;
  "domains/collaboration/collaborationMessages/shared": typeof domains_collaboration_collaborationMessages_shared;
  "domains/collaboration/collaborationMessages/syncAndPins": typeof domains_collaboration_collaborationMessages_syncAndPins;
  "domains/collaboration/collaborationTyping": typeof domains_collaboration_collaborationTyping;
  "domains/collaboration/conversationRouting": typeof domains_collaboration_conversationRouting;
  "domains/collaboration/directMessages/conversations": typeof domains_collaboration_directMessages_conversations;
  "domains/collaboration/directMessages/messages": typeof domains_collaboration_directMessages_messages;
  "domains/collaboration/directMessages/pollsAndReactions": typeof domains_collaboration_directMessages_pollsAndReactions;
  "domains/collaboration/directMessages/shared": typeof domains_collaboration_directMessages_shared;
  "domains/collaboration/inboxItems": typeof domains_collaboration_inboxItems;
  "domains/collaboration/messageAnalytics": typeof domains_collaboration_messageAnalytics;
  "domains/marketing/adSyncWorker": typeof domains_marketing_adSyncWorker;
  "domains/marketing/adSyncWorkerActions": typeof domains_marketing_adSyncWorkerActions;
  "domains/marketing/adsAdMetrics": typeof domains_marketing_adsAdMetrics;
  "domains/marketing/adsAdSets": typeof domains_marketing_adsAdSets;
  "domains/marketing/adsAudiences": typeof domains_marketing_adsAudiences;
  "domains/marketing/adsAudiencesMeta": typeof domains_marketing_adsAudiencesMeta;
  "domains/marketing/adsCampaignGroups": typeof domains_marketing_adsCampaignGroups;
  "domains/marketing/adsCampaignInsights": typeof domains_marketing_adsCampaignInsights;
  "domains/marketing/adsCampaigns": typeof domains_marketing_adsCampaigns;
  "domains/marketing/adsCreatives": typeof domains_marketing_adsCreatives;
  "domains/marketing/adsCreativesActions/createCreative": typeof domains_marketing_adsCreativesActions_createCreative;
  "domains/marketing/adsCreativesActions/listCreatives": typeof domains_marketing_adsCreativesActions_listCreatives;
  "domains/marketing/adsCreativesActions/listMetaPageActors": typeof domains_marketing_adsCreativesActions_listMetaPageActors;
  "domains/marketing/adsCreativesActions/shared": typeof domains_marketing_adsCreativesActions_shared;
  "domains/marketing/adsCreativesActions/updateCreative": typeof domains_marketing_adsCreativesActions_updateCreative;
  "domains/marketing/adsCreativesActions/updateCreativeStatus": typeof domains_marketing_adsCreativesActions_updateCreativeStatus;
  "domains/marketing/adsCreativesActions/uploadMedia": typeof domains_marketing_adsCreativesActions_uploadMedia;
  "domains/marketing/adsIntegrations/accountInit": typeof domains_marketing_adsIntegrations_accountInit;
  "domains/marketing/adsIntegrations/credentialsStatus": typeof domains_marketing_adsIntegrations_credentialsStatus;
  "domains/marketing/adsIntegrations/discovery": typeof domains_marketing_adsIntegrations_discovery;
  "domains/marketing/adsIntegrations/metricsDeletion": typeof domains_marketing_adsIntegrations_metricsDeletion;
  "domains/marketing/adsIntegrations/queries": typeof domains_marketing_adsIntegrations_queries;
  "domains/marketing/adsIntegrations/settings": typeof domains_marketing_adsIntegrations_settings;
  "domains/marketing/adsIntegrations/shared": typeof domains_marketing_adsIntegrations_shared;
  "domains/marketing/adsIntegrations/syncJobs": typeof domains_marketing_adsIntegrations_syncJobs;
  "domains/marketing/adsMetaCampaigns": typeof domains_marketing_adsMetaCampaigns;
  "domains/marketing/adsMetaEvents": typeof domains_marketing_adsMetaEvents;
  "domains/marketing/adsMetaTools": typeof domains_marketing_adsMetaTools;
  "domains/marketing/adsMetrics": typeof domains_marketing_adsMetrics;
  "domains/marketing/adsTargeting": typeof domains_marketing_adsTargeting;
  "domains/marketing/analyticsInsights": typeof domains_marketing_analyticsInsights;
  "domains/marketing/analyticsIntegrations/accountInit": typeof domains_marketing_analyticsIntegrations_accountInit;
  "domains/marketing/analyticsIntegrations/discovery": typeof domains_marketing_analyticsIntegrations_discovery;
  "domains/marketing/analyticsIntegrations/metrics": typeof domains_marketing_analyticsIntegrations_metrics;
  "domains/marketing/analyticsIntegrations/queries": typeof domains_marketing_analyticsIntegrations_queries;
  "domains/marketing/analyticsIntegrations/settings": typeof domains_marketing_analyticsIntegrations_settings;
  "domains/marketing/analyticsIntegrations/shared": typeof domains_marketing_analyticsIntegrations_shared;
  "domains/marketing/creativesCopy": typeof domains_marketing_creativesCopy;
  "domains/marketing/customFormulas": typeof domains_marketing_customFormulas;
  "domains/marketing/metaWebhookEvents": typeof domains_marketing_metaWebhookEvents;
  "domains/marketing/socialIntegrations/discovery": typeof domains_marketing_socialIntegrations_discovery;
  "domains/marketing/socialIntegrations/metricsUpsert": typeof domains_marketing_socialIntegrations_metricsUpsert;
  "domains/marketing/socialIntegrations/queries": typeof domains_marketing_socialIntegrations_queries;
  "domains/marketing/socialIntegrations/settings": typeof domains_marketing_socialIntegrations_settings;
  "domains/marketing/socialIntegrations/syncJobs": typeof domains_marketing_socialIntegrations_syncJobs;
  "domains/marketing/socialMetrics": typeof domains_marketing_socialMetrics;
  "domains/marketing/socialSyncWorkerActions": typeof domains_marketing_socialSyncWorkerActions;
  "domains/ops/alertRules": typeof domains_ops_alertRules;
  "domains/ops/gamma": typeof domains_ops_gamma;
  "domains/ops/meetingArchiveActions": typeof domains_ops_meetingArchiveActions;
  "domains/ops/meetingArchives": typeof domains_ops_meetingArchives;
  "domains/ops/meetingIntegrations": typeof domains_ops_meetingIntegrations;
  "domains/ops/meetings": typeof domains_ops_meetings;
  "domains/ops/notificationTargeting": typeof domains_ops_notificationTargeting;
  "domains/ops/notifications": typeof domains_ops_notifications;
  "domains/ops/presentationDeck": typeof domains_ops_presentationDeck;
  "domains/ops/proposalAnalytics": typeof domains_ops_proposalAnalytics;
  "domains/ops/proposalArchiveActions": typeof domains_ops_proposalArchiveActions;
  "domains/ops/proposalArchives": typeof domains_ops_proposalArchives;
  "domains/ops/proposalGeneration": typeof domains_ops_proposalGeneration;
  "domains/ops/proposalTemplates": typeof domains_ops_proposalTemplates;
  "domains/ops/proposalVersions": typeof domains_ops_proposalVersions;
  "domains/ops/proposals": typeof domains_ops_proposals;
  "domains/ops/schedulerAlertPreferences": typeof domains_ops_schedulerAlertPreferences;
  "domains/platform/adminFeatures": typeof domains_platform_adminFeatures;
  "domains/platform/adminFeaturesAi": typeof domains_platform_adminFeaturesAi;
  "domains/platform/adminInvitations": typeof domains_platform_adminInvitations;
  "domains/platform/adminMigrations": typeof domains_platform_adminMigrations;
  "domains/platform/adminNotifications": typeof domains_platform_adminNotifications;
  "domains/platform/adminUsage": typeof domains_platform_adminUsage;
  "domains/platform/adminUserPage": typeof domains_platform_adminUserPage;
  "domains/platform/adminUsers": typeof domains_platform_adminUsers;
  "domains/platform/agent": typeof domains_platform_agent;
  "domains/platform/agentActions": typeof domains_platform_agentActions;
  "domains/platform/agentActions/helpers": typeof domains_platform_agentActions_helpers;
  "domains/platform/agentActions/helpers/confirmation": typeof domains_platform_agentActions_helpers_confirmation;
  "domains/platform/agentActions/helpers/context": typeof domains_platform_agentActions_helpers_context;
  "domains/platform/agentActions/helpers/dates": typeof domains_platform_agentActions_helpers_dates;
  "domains/platform/agentActions/helpers/formatting": typeof domains_platform_agentActions_helpers_formatting;
  "domains/platform/agentActions/helpers/intents": typeof domains_platform_agentActions_helpers_intents;
  "domains/platform/agentActions/helpers/intents/execute": typeof domains_platform_agentActions_helpers_intents_execute;
  "domains/platform/agentActions/helpers/intents/index": typeof domains_platform_agentActions_helpers_intents_index;
  "domains/platform/agentActions/helpers/intents/navigation": typeof domains_platform_agentActions_helpers_intents_navigation;
  "domains/platform/agentActions/helpers/intents/parsing": typeof domains_platform_agentActions_helpers_intents_parsing;
  "domains/platform/agentActions/helpers/proposalConversation": typeof domains_platform_agentActions_helpers_proposalConversation;
  "domains/platform/agentActions/helpers/proposals": typeof domains_platform_agentActions_helpers_proposals;
  "domains/platform/agentActions/helpers/values": typeof domains_platform_agentActions_helpers_values;
  "domains/platform/agentActions/operations": typeof domains_platform_agentActions_operations;
  "domains/platform/agentActions/operations/ads": typeof domains_platform_agentActions_operations_ads;
  "domains/platform/agentActions/operations/ads/index": typeof domains_platform_agentActions_operations_ads_index;
  "domains/platform/agentActions/operations/ads/reports": typeof domains_platform_agentActions_operations_ads_reports;
  "domains/platform/agentActions/operations/analyticsSummary": typeof domains_platform_agentActions_operations_analyticsSummary;
  "domains/platform/agentActions/operations/clients": typeof domains_platform_agentActions_operations_clients;
  "domains/platform/agentActions/operations/clients/index": typeof domains_platform_agentActions_operations_clients_index;
  "domains/platform/agentActions/operations/meetings/index": typeof domains_platform_agentActions_operations_meetings_index;
  "domains/platform/agentActions/operations/messaging": typeof domains_platform_agentActions_operations_messaging;
  "domains/platform/agentActions/operations/messaging/index": typeof domains_platform_agentActions_operations_messaging_index;
  "domains/platform/agentActions/operations/notifications/index": typeof domains_platform_agentActions_operations_notifications_index;
  "domains/platform/agentActions/operations/projects": typeof domains_platform_agentActions_operations_projects;
  "domains/platform/agentActions/operations/projects/index": typeof domains_platform_agentActions_operations_projects_index;
  "domains/platform/agentActions/operations/proposals": typeof domains_platform_agentActions_operations_proposals;
  "domains/platform/agentActions/operations/proposals/index": typeof domains_platform_agentActions_operations_proposals_index;
  "domains/platform/agentActions/operations/reports": typeof domains_platform_agentActions_operations_reports;
  "domains/platform/agentActions/operations/shared": typeof domains_platform_agentActions_operations_shared;
  "domains/platform/agentActions/operations/socials/index": typeof domains_platform_agentActions_operations_socials_index;
  "domains/platform/agentActions/operations/socials/socialSummary": typeof domains_platform_agentActions_operations_socials_socialSummary;
  "domains/platform/agentActions/operations/spreadsheet/builders": typeof domains_platform_agentActions_operations_spreadsheet_builders;
  "domains/platform/agentActions/operations/spreadsheet/export": typeof domains_platform_agentActions_operations_spreadsheet_export;
  "domains/platform/agentActions/operations/taskSummary": typeof domains_platform_agentActions_operations_taskSummary;
  "domains/platform/agentActions/operations/tasks": typeof domains_platform_agentActions_operations_tasks;
  "domains/platform/agentActions/operations/tasks/index": typeof domains_platform_agentActions_operations_tasks_index;
  "domains/platform/agentActions/prompting": typeof domains_platform_agentActions_prompting;
  "domains/platform/agentActions/runExecuteTurn": typeof domains_platform_agentActions_runExecuteTurn;
  "domains/platform/agentActions/types": typeof domains_platform_agentActions_types;
  "domains/platform/agentAttachments": typeof domains_platform_agentAttachments;
  "domains/platform/agentConversations": typeof domains_platform_agentConversations;
  "domains/platform/agentMessages": typeof domains_platform_agentMessages;
  "domains/platform/apiIdempotency": typeof domains_platform_apiIdempotency;
  "domains/platform/appProxy": typeof domains_platform_appProxy;
  "domains/platform/artifactArchiveBackfills": typeof domains_platform_artifactArchiveBackfills;
  "domains/platform/auditLogs": typeof domains_platform_auditLogs;
  "domains/platform/auth": typeof domains_platform_auth;
  "domains/platform/authActions": typeof domains_platform_authActions;
  "domains/platform/clientAdminTeamSync": typeof domains_platform_clientAdminTeamSync;
  "domains/platform/debug": typeof domains_platform_debug;
  "domains/platform/geminiRateLimit": typeof domains_platform_geminiRateLimit;
  "domains/platform/health": typeof domains_platform_health;
  "domains/platform/httpActions": typeof domains_platform_httpActions;
  "domains/platform/migrations/adMetricsCurrency": typeof domains_platform_migrations_adMetricsCurrency;
  "domains/platform/migrations/adminDiagnostics": typeof domains_platform_migrations_adminDiagnostics;
  "domains/platform/migrations/clientAdminTeam": typeof domains_platform_migrations_clientAdminTeam;
  "domains/platform/migrations/taskAssigneePools": typeof domains_platform_migrations_taskAssigneePools;
  "domains/platform/onboardingStates": typeof domains_platform_onboardingStates;
  "domains/platform/privacyMasks": typeof domains_platform_privacyMasks;
  "domains/platform/problemReports": typeof domains_platform_problemReports;
  "domains/platform/rateLimit": typeof domains_platform_rateLimit;
  "domains/platform/rateLimitApi": typeof domains_platform_rateLimitApi;
  "domains/platform/schedulerEvents": typeof domains_platform_schedulerEvents;
  "domains/platform/serverCache": typeof domains_platform_serverCache;
  "domains/platform/settings": typeof domains_platform_settings;
  "domains/platform/users": typeof domains_platform_users;
  "domains/workspace/clients": typeof domains_workspace_clients;
  "domains/workspace/projectDocumentImport": typeof domains_workspace_projectDocumentImport;
  "domains/workspace/projectDocumentImportParsing": typeof domains_workspace_projectDocumentImportParsing;
  "domains/workspace/projectMilestones": typeof domains_workspace_projectMilestones;
  "domains/workspace/projects": typeof domains_workspace_projects;
  "domains/workspace/projects/listFilters": typeof domains_workspace_projects_listFilters;
  "domains/workspace/taskAssignees": typeof domains_workspace_taskAssignees;
  "domains/workspace/taskComments": typeof domains_workspace_taskComments;
  "domains/workspace/taskDocumentImport": typeof domains_workspace_taskDocumentImport;
  "domains/workspace/taskDocumentImportParsing": typeof domains_workspace_taskDocumentImportParsing;
  "domains/workspace/taskDocumentImportQueries": typeof domains_workspace_taskDocumentImportQueries;
  "domains/workspace/tasks": typeof domains_workspace_tasks;
  "domains/workspace/tasks/listFilters": typeof domains_workspace_tasks_listFilters;
  "domains/workspace/tasks/projectCounts": typeof domains_workspace_tasks_projectCounts;
  errors: typeof errors;
  files: typeof files;
  functions: typeof functions;
  gamma: typeof gamma;
  geminiRateLimit: typeof geminiRateLimit;
  health: typeof health;
  http: typeof http;
  httpActions: typeof httpActions;
  "httpActions/metaWebhook": typeof httpActions_metaWebhook;
  inboxItems: typeof inboxItems;
  "lib/artifactArchiveSchedule": typeof lib_artifactArchiveSchedule;
  "lib/collaboration/readCheckpoints": typeof lib_collaboration_readCheckpoints;
  "lib/collaborationPollMessage": typeof lib_collaborationPollMessage;
  "lib/debugIntrospection": typeof lib_debugIntrospection;
  "lib/facebookAdsAccess": typeof lib_facebookAdsAccess;
  "lib/fileStorage": typeof lib_fileStorage;
  "lib/functions/actionWrappers": typeof lib_functions_actionWrappers;
  "lib/functions/auth": typeof lib_functions_auth;
  "lib/functions/idempotency": typeof lib_functions_idempotency;
  "lib/functions/mutationWrappers": typeof lib_functions_mutationWrappers;
  "lib/functions/pagination": typeof lib_functions_pagination;
  "lib/functions/queryWrappers": typeof lib_functions_queryWrappers;
  "lib/functions/rateLimitedWrappers": typeof lib_functions_rateLimitedWrappers;
  "lib/functions/response": typeof lib_functions_response;
  "lib/functions/softDeleteDb": typeof lib_functions_softDeleteDb;
  "lib/functions/types": typeof lib_functions_types;
  "lib/functions/zodWrappers": typeof lib_functions_zodWrappers;
  "lib/metaAudienceHash": typeof lib_metaAudienceHash;
  "lib/metaCapiUserData": typeof lib_metaCapiUserData;
  "lib/metaSha256": typeof lib_metaSha256;
  "lib/metaWebhookAuth": typeof lib_metaWebhookAuth;
  "lib/r2ArtifactStore": typeof lib_r2ArtifactStore;
  "lib/storageAccess": typeof lib_storageAccess;
  "lib/webhookAuth": typeof lib_webhookAuth;
  meetingArchiveActions: typeof meetingArchiveActions;
  meetingArchives: typeof meetingArchives;
  meetingIntegrations: typeof meetingIntegrations;
  meetings: typeof meetings;
  messageAnalytics: typeof messageAnalytics;
  metaWebhookEvents: typeof metaWebhookEvents;
  notificationTargeting: typeof notificationTargeting;
  notifications: typeof notifications;
  onboardingStates: typeof onboardingStates;
  presentationDeck: typeof presentationDeck;
  privacyMasks: typeof privacyMasks;
  problemReports: typeof problemReports;
  projectDocumentImport: typeof projectDocumentImport;
  projectDocumentImportParsing: typeof projectDocumentImportParsing;
  projectMilestones: typeof projectMilestones;
  projects: typeof projects;
  proposalAnalytics: typeof proposalAnalytics;
  proposalArchiveActions: typeof proposalArchiveActions;
  proposalArchives: typeof proposalArchives;
  proposalGeneration: typeof proposalGeneration;
  proposalTemplates: typeof proposalTemplates;
  proposalVersions: typeof proposalVersions;
  proposals: typeof proposals;
  r2: typeof r2;
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
  socialSyncWorkerActions: typeof socialSyncWorkerActions;
  taskAssignees: typeof taskAssignees;
  taskComments: typeof taskComments;
  taskDocumentImport: typeof taskDocumentImport;
  taskDocumentImportParsing: typeof taskDocumentImportParsing;
  taskDocumentImportQueries: typeof taskDocumentImportQueries;
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
        any
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
        any
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
        any
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
        any
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
        any
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
        any
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
  r2: {
    lib: {
      deleteMetadata: FunctionReference<
        "mutation",
        "internal",
        { bucket: string; key: string },
        null
      >;
      deleteObject: FunctionReference<
        "mutation",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      deleteR2Object: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      getMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        {
          bucket: string;
          bucketLink: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
          url: string;
        } | null
      >;
      listMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          cursor?: string;
          endpoint: string;
          limit?: number;
          secretAccessKey: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            bucket: string;
            bucketLink: string;
            contentType?: string;
            key: string;
            lastModified: string;
            link: string;
            sha256?: string;
            size?: number;
            url: string;
          }>;
          pageStatus?: null | "SplitRecommended" | "SplitRequired";
          splitCursor?: null | string;
        }
      >;
      store: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          secretAccessKey: string;
          url: string;
        },
        any
      >;
      syncMetadata: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          onComplete?: string;
          secretAccessKey: string;
        },
        null
      >;
      upsertMetadata: FunctionReference<
        "mutation",
        "internal",
        {
          bucket: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
        },
        { isNew: boolean }
      >;
    };
  };
};
