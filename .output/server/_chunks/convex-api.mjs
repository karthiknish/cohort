import { t as api$1 } from "./api.mjs";
//#region src/lib/convex-api.ts
var api = api$1;
var looseApi = api;
var settingsApi = {
	getMyProfile: looseApi.settings.getMyProfile,
	updateMyProfile: looseApi.settings.updateMyProfile,
	getMyNotificationPreferences: looseApi.settings.getMyNotificationPreferences,
	updateMyNotificationPreferences: looseApi.settings.updateMyNotificationPreferences,
	getMyRegionalPreferences: looseApi.settings.getMyRegionalPreferences,
	updateMyRegionalPreferences: looseApi.settings.updateMyRegionalPreferences
};
var usersApi = {
	listWorkspaceMembers: looseApi.users.listWorkspaceMembers,
	resolveProfilesForNames: looseApi.users.resolveProfilesForNames,
	listAllUsers: looseApi.users.listAllUsers,
	ensureProfileOnSignIn: looseApi.users.ensureProfileOnSignIn,
	ensureProfileOnSignInFromApp: looseApi.users.ensureProfileOnSignInFromApp,
	bootstrapUpsert: looseApi.users.bootstrapUpsert
};
var onboardingApi = {
	upsert: looseApi.onboardingStates.upsert,
	getByUserId: looseApi.onboardingStates.getByUserId
};
var clientsApi = {
	list: looseApi.clients.list,
	countActive: looseApi.clients.countActive,
	getByLegacyId: looseApi.clients.getByLegacyId,
	getClientSummaries: looseApi.clients.getClientSummaries,
	create: looseApi.clients.create,
	addTeamMember: looseApi.clients.addTeamMember,
	updateTeamMemberRole: looseApi.clients.updateTeamMemberRole,
	removeTeamMember: looseApi.clients.removeTeamMember,
	syncAdminTeamMembers: looseApi.clients.syncAdminTeamMembers,
	softDelete: looseApi.clients.softDelete
};
var debugApi = {
	whoami: looseApi.debug.whoami,
	listAnyClients: looseApi.debug.listAnyClients,
	countClientsByWorkspace: looseApi.debug.countClientsByWorkspace
};
var notificationsApi = {
	list: looseApi.notifications.list,
	getUnreadCount: looseApi.notifications.getUnreadCount,
	ack: looseApi.notifications.ack
};
var tasksApi = {
	list: looseApi.tasks.list,
	listByClient: looseApi.tasks.listByClient,
	listForUser: looseApi.tasks.listForUser,
	summarizeCountsByProject: looseApi.tasks.summarizeCountsByProject,
	createTask: looseApi.tasks.createTask,
	patchTask: looseApi.tasks.patchTask,
	bulkPatchTasks: looseApi.tasks.bulkPatchTasks,
	softDeleteTask: looseApi.tasks.softDeleteTask,
	bulkSoftDeleteTasks: looseApi.tasks.bulkSoftDeleteTasks
};
var tasksDocumentImportApi = { extractTasksFromDocument: looseApi.taskDocumentImport.extractTasksFromDocument };
var projectsDocumentImportApi = { extractProjectsFromDocument: looseApi.projectDocumentImport.extractProjectsFromDocument };
var projectsApi = {
	list: looseApi.projects.list,
	getByLegacyId: looseApi.projects.getByLegacyId,
	create: looseApi.projects.create,
	update: looseApi.projects.update,
	softDelete: looseApi.projects.softDelete
};
var projectMilestonesApi = {
	listByProjectIds: looseApi.projectMilestones.listByProjectIds,
	listForProject: looseApi.projectMilestones.listForProject,
	create: looseApi.projectMilestones.create,
	update: looseApi.projectMilestones.update,
	remove: looseApi.projectMilestones.remove
};
var adsIntegrationsApi = {
	getAdIntegration: looseApi.adsIntegrations.getAdIntegration,
	listStatuses: looseApi.adsIntegrations.listStatuses,
	listGoogleAdAccounts: looseApi.adsIntegrations.listGoogleAdAccounts,
	listGoogleAnalyticsProperties: looseApi.adsIntegrations.listGoogleAnalyticsProperties,
	listMetaAdAccounts: looseApi.adsIntegrations.listMetaAdAccounts,
	updateAutomationSettings: looseApi.adsIntegrations.updateAutomationSettings,
	requestManualSync: looseApi.adsIntegrations.requestManualSync,
	runManualSync: looseApi.adSyncWorkerActions.runManualSync,
	initializeAdAccount: looseApi.adsIntegrations.initializeAdAccount,
	deleteAdIntegration: looseApi.adsIntegrations.deleteAdIntegration,
	deleteSyncJobs: looseApi.adsIntegrations.deleteSyncJobs,
	deleteProviderMetrics: looseApi.adsIntegrations.deleteProviderMetrics
};
var analyticsIntegrationsApi = {
	getGoogleAnalyticsStatus: looseApi.analyticsIntegrations.getGoogleAnalyticsStatus,
	listGoogleAnalyticsProperties: looseApi.analyticsIntegrations.listGoogleAnalyticsProperties,
	initializeGoogleAnalyticsProperty: looseApi.analyticsIntegrations.initializeGoogleAnalyticsProperty,
	listAnalyticsMetrics: looseApi.analyticsIntegrations.listAnalyticsMetrics,
	listAnalyticsMetricsPaginated: looseApi.analyticsIntegrations.listAnalyticsMetricsPaginated,
	listAnalyticsBreakdowns: looseApi.analyticsIntegrations.listAnalyticsBreakdowns,
	deleteGoogleAnalyticsIntegration: looseApi.analyticsIntegrations.deleteGoogleAnalyticsIntegration,
	deleteGoogleAnalyticsSyncJobs: looseApi.analyticsIntegrations.deleteGoogleAnalyticsSyncJobs,
	deleteGoogleAnalyticsMetrics: looseApi.analyticsIntegrations.deleteGoogleAnalyticsMetrics
};
var meetingIntegrationsApi = {
	getGoogleWorkspaceStatus: looseApi.meetingIntegrations.getGoogleWorkspaceStatus,
	deleteGoogleWorkspaceIntegration: looseApi.meetingIntegrations.deleteGoogleWorkspaceIntegration
};
var meetingsApi = {
	list: looseApi.meetings.list,
	getByLegacyId: looseApi.meetings.getByLegacyId,
	getByRoomName: looseApi.meetings.getByRoomName,
	create: looseApi.meetings.create,
	updateStatus: looseApi.meetings.updateStatus
};
var meetingArchivesApi = { getArtifactDownloadUrls: looseApi.meetingArchives.getArtifactDownloadUrls };
var adsMetricsApi = {
	listMetrics: looseApi.adsMetrics.listMetrics,
	listMetricsWithSummary: looseApi.adsMetrics.listMetricsWithSummary
};
var adsCampaignsApi = {
	listCampaigns: looseApi.adsCampaigns.listCampaigns,
	createCampaign: looseApi.adsCampaigns.createCampaign,
	createMetaCampaign: looseApi.adsMetaCampaigns.createMetaCampaign,
	updateCampaign: looseApi.adsCampaigns.updateCampaign
};
var adsMetaCampaignsApi = {
	createMetaCampaign: looseApi.adsMetaCampaigns.createMetaCampaign,
	updateMetaCampaign: looseApi.adsMetaCampaigns.updateMetaCampaign
};
var adsAdSetsApi = {
	listAdSets: looseApi.adsAdSets.listAdSets,
	createAdSet: looseApi.adsAdSets.createAdSet,
	updateAdSetTargeting: looseApi.adsAdSets.updateAdSetTargeting,
	updateAdSetStatus: looseApi.adsAdSets.updateAdSetStatus
};
var adsCampaignGroupsApi = {
	listCampaignGroups: looseApi.adsCampaignGroups.listCampaignGroups,
	updateCampaignGroup: looseApi.adsCampaignGroups.updateCampaignGroup
};
var adsCampaignInsightsApi = { getCampaignInsights: looseApi.adsCampaignInsights.getCampaignInsights };
var adsCreativesApi = {
	listCreatives: looseApi.adsCreatives.listCreatives,
	updateCreativeStatus: looseApi.adsCreatives.updateCreativeStatus,
	listMetaPageActors: looseApi.adsCreatives.listMetaPageActors,
	createCreative: looseApi.adsCreatives.createCreative,
	updateCreative: looseApi.adsCreatives.updateCreative,
	uploadMedia: looseApi.adsCreatives.uploadMedia
};
var adsAdMetricsApi = { listAdMetrics: looseApi.adsAdMetrics.listAdMetrics };
var adsTargetingApi = { getTargeting: looseApi.adsTargeting.getTargeting };
var adsAudiencesApi = {
	createAudience: looseApi.adsAudiences.createAudience,
	listAudiences: looseApi.adsAudiencesMeta.listAudiences,
	createLookalikeAudience: looseApi.adsAudiencesMeta.createLookalikeAudience,
	uploadAudienceUsers: looseApi.adsAudiencesMeta.uploadAudienceUsers,
	deleteAudience: looseApi.adsAudiencesMeta.deleteAudience
};
var adsMetaToolsApi = {
	searchTargetingInterests: looseApi.adsMetaTools.searchTargetingInterests,
	searchTargetingGeolocations: looseApi.adsMetaTools.searchTargetingGeolocations,
	listLeadgenForms: looseApi.adsMetaTools.listLeadgenForms,
	createLeadgenForm: looseApi.adsMetaTools.createLeadgenForm,
	listPagePosts: looseApi.adsMetaTools.listPagePosts,
	listPageEvents: looseApi.adsMetaTools.listPageEvents,
	listAdPixels: looseApi.adsMetaTools.listAdPixels,
	listProductCatalogs: looseApi.adsMetaTools.listProductCatalogs,
	listProductSets: looseApi.adsMetaTools.listProductSets,
	listMetaAds: looseApi.adsMetaTools.listMetaAds,
	getPixelDetails: looseApi.adsMetaTools.getPixelDetails,
	getPixelStats: looseApi.adsMetaTools.getPixelStats,
	listBusinesses: looseApi.adsMetaTools.listBusinesses,
	listBusinessAdAccounts: looseApi.adsMetaTools.listBusinessAdAccounts,
	searchAdLibrary: looseApi.adsMetaTools.searchAdLibrary,
	listAdAccountWebhooks: looseApi.adsMetaTools.listAdAccountWebhooks,
	updateAdAccountWebhooks: looseApi.adsMetaTools.updateAdAccountWebhooks,
	clearAdAccountWebhooks: looseApi.adsMetaTools.clearAdAccountWebhooks
};
var adsMetaEventsApi = {
	sendCapiEvents: looseApi.adsMetaEvents.sendCapiEvents,
	sendOfflineEvents: looseApi.adsMetaEvents.sendOfflineEvents,
	executeBatch: looseApi.adsMetaEvents.executeBatch
};
var agentApi = {
	sendMessage: looseApi.agentActions.sendMessage,
	listConversations: looseApi.agentActions.listConversations,
	getConversation: looseApi.agentActions.getConversation,
	duplicateConversation: looseApi.agentActions.duplicateConversation,
	exportConversation: looseApi.agentActions.exportConversation,
	shareConversation: looseApi.agentActions.shareConversation,
	extractPdfText: looseApi.agentAttachments.extractPdfText,
	updateConversationTitle: looseApi.agent.updateConversationTitle,
	deleteConversation: looseApi.agent.deleteConversation,
	setConversationFlags: looseApi.agentConversations.setConversationFlags,
	searchByUser: looseApi.agentMessages.searchByUser,
	attachSpreadsheetExport: looseApi.agentMessages.attachSpreadsheetExport
};
looseApi.adminNotifications.list;
looseApi.schedulerEvents.list;
var collaborationApi = {
	listChannel: looseApi.collaborationMessages.listChannel,
	listThreadReplies: looseApi.collaborationMessages.listThreadReplies,
	getByLegacyId: looseApi.collaborationMessages.getByLegacyId,
	searchChannel: looseApi.collaborationMessages.searchChannel,
	getUnreadCount: looseApi.collaborationMessages.getUnreadCount,
	getUnreadCountsByChannel: looseApi.collaborationMessages.getUnreadCountsByChannel,
	createMessage: looseApi.collaborationMessages.create,
	updateMessage: looseApi.collaborationMessages.updateMessage,
	voteOnPoll: looseApi.collaborationMessages.voteOnPoll,
	endPollMessage: looseApi.collaborationMessages.endPollMessage,
	softDeleteMessage: looseApi.collaborationMessages.softDelete,
	markAsRead: looseApi.collaborationMessages.markAsRead,
	markMultipleAsRead: looseApi.collaborationMessages.markMultipleAsRead,
	markChannelAsRead: looseApi.collaborationMessages.markChannelAsRead,
	markThreadAsRead: looseApi.collaborationMessages.markThreadAsRead,
	getThreadUnreadCounts: looseApi.collaborationMessages.getThreadUnreadCounts,
	toggleReaction: looseApi.collaborationMessages.toggleReaction,
	updateSharedTo: looseApi.collaborationMessages.updateSharedTo,
	setTyping: looseApi.collaborationTyping.setTyping,
	listTyping: looseApi.collaborationTyping.listForChannel,
	generateUploadUrl: looseApi.r2.generateUploadUrl,
	syncMetadata: looseApi.r2.syncMetadata
};
var collaborationChannelsApi = {
	listAccessible: looseApi.collaborationChannels.listAccessible,
	create: looseApi.collaborationChannels.create,
	updateMembers: looseApi.collaborationChannels.updateMembers,
	remove: looseApi.collaborationChannels.remove
};
var collaborationChannelAvatarsApi = {
	listForWorkspace: looseApi.collaborationChannelAvatars.listForWorkspace,
	setAvatar: looseApi.collaborationChannelAvatars.setAvatar
};
var directMessagesApi = {
	searchMessages: looseApi.directMessages.searchMessages,
	voteOnPoll: looseApi.directMessages.voteOnPoll,
	endPollMessage: looseApi.directMessages.endPollMessage
};
var customFormulasApi = {
	listByWorkspace: looseApi.customFormulas.listByWorkspace,
	getByLegacyId: looseApi.customFormulas.getByLegacyId,
	create: looseApi.customFormulas.create,
	update: looseApi.customFormulas.update,
	remove: looseApi.customFormulas.remove
};
var proposalsApi = {
	list: looseApi.proposals.list,
	getByLegacyId: looseApi.proposals.getByLegacyId,
	create: looseApi.proposals.create,
	update: looseApi.proposals.update,
	remove: looseApi.proposals.remove,
	count: looseApi.proposals.count
};
var proposalArchivesApi = { getArtifactDownloadUrls: looseApi.proposalArchives.getArtifactDownloadUrls };
var proposalGenerationApi = { generateFromProposal: looseApi.proposalGeneration.generateFromProposal };
var proposalVersionsApi = {
	list: looseApi.proposalVersions.list,
	getByLegacyId: looseApi.proposalVersions.getByLegacyId,
	createSnapshot: looseApi.proposalVersions.createSnapshot,
	restoreToVersion: looseApi.proposalVersions.restoreToVersion,
	countByWorkspace: looseApi.proposalVersions.countByWorkspace
};
var proposalTemplatesApi = {
	list: looseApi.proposalTemplates.list,
	count: looseApi.proposalTemplates.count,
	getByLegacyId: looseApi.proposalTemplates.getByLegacyId,
	create: looseApi.proposalTemplates.create,
	update: looseApi.proposalTemplates.update,
	remove: looseApi.proposalTemplates.remove
};
var proposalAnalyticsApi = {
	addEvent: looseApi.proposalAnalytics.addEvent,
	listEvents: looseApi.proposalAnalytics.listEvents,
	summarize: looseApi.proposalAnalytics.summarize,
	timeSeries: looseApi.proposalAnalytics.timeSeries,
	byClient: looseApi.proposalAnalytics.byClient
};
var authActionsApi = {
	exportUserData: looseApi.authActions.exportUserData,
	deleteAccount: looseApi.authActions.deleteAccount
};
var filesApi = {
	generateUploadUrl: looseApi.r2.generateUploadUrl,
	syncMetadata: looseApi.r2.syncMetadata,
	getPublicUrl: looseApi.files.getPublicUrl,
	getDownloadUrl: looseApi.files.getDownloadUrl
};
var problemReportsApi = {
	create: looseApi.problemReports.create,
	list: looseApi.problemReports.list,
	update: looseApi.problemReports.update,
	remove: looseApi.problemReports.remove
};
var presentationDeckApi = {
	getStatus: looseApi.presentationDeck.getStatus,
	listFolders: looseApi.presentationDeck.listFolders,
	listThemes: looseApi.presentationDeck.listThemes
};
var analyticsInsightsApi = { generateInsights: looseApi.analyticsInsights.generateInsights };
var creativesCopyApi = { generateCopy: looseApi.creativesCopy.generateCopy };
var socialsIntegrationsApi = {
	getStatus: looseApi.socialIntegrations.getStatus,
	requestManualSync: looseApi.socialIntegrations.requestManualSync,
	discoverPages: looseApi.socialIntegrations.discoverPages,
	confirmSurfaceBinding: looseApi.socialIntegrations.confirmSurfaceBinding,
	disconnectIntegration: looseApi.socialIntegrations.disconnectIntegration
};
var socialMetricsApi = {
	listOverview: looseApi.socialMetrics.listOverview,
	listTimeSeries: looseApi.socialMetrics.listTimeSeries,
	listContent: looseApi.socialMetrics.listContent
};
//#endregion
export { meetingsApi as A, proposalGenerationApi as B, creativesCopyApi as C, filesApi as D, directMessagesApi as E, projectMilestonesApi as F, socialMetricsApi as G, proposalVersionsApi as H, projectsApi as I, tasksDocumentImportApi as J, socialsIntegrationsApi as K, projectsDocumentImportApi as L, onboardingApi as M, presentationDeckApi as N, meetingArchivesApi as O, problemReportsApi as P, proposalAnalyticsApi as R, collaborationChannelsApi as S, debugApi as T, proposalsApi as U, proposalTemplatesApi as V, settingsApi as W, usersApi as Y, api as _, adsCampaignInsightsApi as a, collaborationApi as b, adsIntegrationsApi as c, adsMetaToolsApi as d, adsMetricsApi as f, analyticsIntegrationsApi as g, analyticsInsightsApi as h, adsCampaignGroupsApi as i, notificationsApi as j, meetingIntegrationsApi as k, adsMetaCampaignsApi as l, agentApi as m, adsAdSetsApi as n, adsCampaignsApi as o, adsTargetingApi as p, tasksApi as q, adsAudiencesApi as r, adsCreativesApi as s, adsAdMetricsApi as t, adsMetaEventsApi as u, authActionsApi as v, customFormulasApi as w, collaborationChannelAvatarsApi as x, clientsApi as y, proposalArchivesApi as z };
