// Client-safe import for Convex generated API.
// Keep this indirection so app code can import via `@/lib/convex-api`.
import { api as generatedApi } from '/_generated/api';
export const api = generatedApi;
const looseApi = api;
export const settingsApi = {
    getMyProfile: looseApi.settings.getMyProfile,
    updateMyProfile: looseApi.settings.updateMyProfile,
    getMyNotificationPreferences: looseApi.settings.getMyNotificationPreferences,
    updateMyNotificationPreferences: looseApi.settings.updateMyNotificationPreferences,
    getMyRegionalPreferences: looseApi.settings.getMyRegionalPreferences,
    updateMyRegionalPreferences: looseApi.settings.updateMyRegionalPreferences,
};
export const usersApi = {
    listWorkspaceMembers: looseApi.users.listWorkspaceMembers,
    resolveProfilesForNames: looseApi.users.resolveProfilesForNames,
    listAllUsers: looseApi.users.listAllUsers,
    ensureProfileOnSignIn: looseApi.users.ensureProfileOnSignIn,
    ensureProfileOnSignInFromApp: looseApi.users.ensureProfileOnSignInFromApp,
    bootstrapUpsert: looseApi.users.bootstrapUpsert,
};
export const onboardingApi = {
    upsert: looseApi.onboardingStates.upsert,
    getByUserId: looseApi.onboardingStates.getByUserId,
};
export const clientsApi = {
    list: looseApi.clients.list,
    countActive: looseApi.clients.countActive,
    getByLegacyId: looseApi.clients.getByLegacyId,
    getClientSummaries: looseApi.clients.getClientSummaries,
    create: looseApi.clients.create,
    addTeamMember: looseApi.clients.addTeamMember,
    updateTeamMemberRole: looseApi.clients.updateTeamMemberRole,
    removeTeamMember: looseApi.clients.removeTeamMember,
    syncAdminTeamMembers: looseApi.clients.syncAdminTeamMembers,
    softDelete: looseApi.clients.softDelete,
};
export const debugApi = {
    whoami: looseApi.debug.whoami,
    listAnyClients: looseApi.debug.listAnyClients,
    countClientsByWorkspace: looseApi.debug.countClientsByWorkspace,
};
export const notificationsApi = {
    list: looseApi.notifications.list,
    getUnreadCount: looseApi.notifications.getUnreadCount,
    ack: looseApi.notifications.ack,
};
export const tasksApi = {
    list: looseApi.tasks.list,
    listByClient: looseApi.tasks.listByClient,
    listForUser: looseApi.tasks.listForUser,
    summarizeCountsByProject: looseApi.tasks.summarizeCountsByProject,
    createTask: looseApi.tasks.createTask,
    patchTask: looseApi.tasks.patchTask,
    bulkPatchTasks: looseApi.tasks.bulkPatchTasks,
    softDeleteTask: looseApi.tasks.softDeleteTask,
    bulkSoftDeleteTasks: looseApi.tasks.bulkSoftDeleteTasks,
};
export const tasksDocumentImportApi = {
    extractTasksFromDocument: looseApi.taskDocumentImport.extractTasksFromDocument,
};
export const projectsDocumentImportApi = {
    extractProjectsFromDocument: looseApi.projectDocumentImport.extractProjectsFromDocument,
};
export const projectsApi = {
    list: looseApi.projects.list,
    getByLegacyId: looseApi.projects.getByLegacyId,
    create: looseApi.projects.create,
    update: looseApi.projects.update,
    softDelete: looseApi.projects.softDelete,
};
export const projectMilestonesApi = {
    listByProjectIds: looseApi.projectMilestones.listByProjectIds,
    listForProject: looseApi.projectMilestones.listForProject,
    create: looseApi.projectMilestones.create,
    update: looseApi.projectMilestones.update,
    remove: looseApi.projectMilestones.remove,
};
export const adsIntegrationsApi = {
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
    deleteProviderMetrics: looseApi.adsIntegrations.deleteProviderMetrics,
};
export const analyticsIntegrationsApi = {
    getGoogleAnalyticsStatus: looseApi.analyticsIntegrations.getGoogleAnalyticsStatus,
    listGoogleAnalyticsProperties: looseApi.analyticsIntegrations.listGoogleAnalyticsProperties,
    initializeGoogleAnalyticsProperty: looseApi.analyticsIntegrations.initializeGoogleAnalyticsProperty,
    listAnalyticsMetrics: looseApi.analyticsIntegrations.listAnalyticsMetrics,
    listAnalyticsMetricsPaginated: looseApi.analyticsIntegrations.listAnalyticsMetricsPaginated,
    listAnalyticsBreakdowns: looseApi.analyticsIntegrations.listAnalyticsBreakdowns,
    deleteGoogleAnalyticsIntegration: looseApi.analyticsIntegrations.deleteGoogleAnalyticsIntegration,
    deleteGoogleAnalyticsSyncJobs: looseApi.analyticsIntegrations.deleteGoogleAnalyticsSyncJobs,
    deleteGoogleAnalyticsMetrics: looseApi.analyticsIntegrations.deleteGoogleAnalyticsMetrics,
};
export const meetingIntegrationsApi = {
    getGoogleWorkspaceStatus: looseApi.meetingIntegrations.getGoogleWorkspaceStatus,
    deleteGoogleWorkspaceIntegration: looseApi.meetingIntegrations.deleteGoogleWorkspaceIntegration,
};
export const meetingsApi = {
    list: looseApi.meetings.list,
    getByLegacyId: looseApi.meetings.getByLegacyId,
    getByRoomName: looseApi.meetings.getByRoomName,
    create: looseApi.meetings.create,
    updateStatus: looseApi.meetings.updateStatus,
};
export const meetingArchivesApi = {
    getArtifactDownloadUrls: looseApi.meetingArchives.getArtifactDownloadUrls,
};
export const adsMetricsApi = {
    listMetrics: looseApi.adsMetrics.listMetrics,
    listMetricsWithSummary: looseApi.adsMetrics.listMetricsWithSummary,
};
export const adsCampaignsApi = {
    listCampaigns: looseApi.adsCampaigns.listCampaigns,
    createCampaign: looseApi.adsCampaigns.createCampaign,
    createMetaCampaign: looseApi.adsMetaCampaigns.createMetaCampaign,
    updateCampaign: looseApi.adsCampaigns.updateCampaign,
};
export const adsMetaCampaignsApi = {
    createMetaCampaign: looseApi.adsMetaCampaigns.createMetaCampaign,
    updateMetaCampaign: looseApi.adsMetaCampaigns.updateMetaCampaign,
};
export const adsAdSetsApi = {
    listAdSets: looseApi.adsAdSets.listAdSets,
    createAdSet: looseApi.adsAdSets.createAdSet,
    updateAdSetTargeting: looseApi.adsAdSets.updateAdSetTargeting,
    updateAdSetStatus: looseApi.adsAdSets.updateAdSetStatus,
};
export const adsCampaignGroupsApi = {
    listCampaignGroups: looseApi.adsCampaignGroups.listCampaignGroups,
    updateCampaignGroup: looseApi.adsCampaignGroups.updateCampaignGroup,
};
export const adsCampaignInsightsApi = {
    getCampaignInsights: looseApi.adsCampaignInsights.getCampaignInsights,
};
export const adsCreativesApi = {
    listCreatives: looseApi.adsCreatives.listCreatives,
    updateCreativeStatus: looseApi.adsCreatives.updateCreativeStatus,
    listMetaPageActors: looseApi.adsCreatives.listMetaPageActors,
    createCreative: looseApi.adsCreatives.createCreative,
    updateCreative: looseApi.adsCreatives.updateCreative,
    uploadMedia: looseApi.adsCreatives.uploadMedia,
};
export const adsAdMetricsApi = {
    listAdMetrics: looseApi.adsAdMetrics.listAdMetrics,
};
export const adsTargetingApi = {
    getTargeting: looseApi.adsTargeting.getTargeting,
};
export const adsAudiencesApi = {
    createAudience: looseApi.adsAudiences.createAudience,
    listAudiences: looseApi.adsAudiencesMeta.listAudiences,
    createLookalikeAudience: looseApi.adsAudiencesMeta.createLookalikeAudience,
    uploadAudienceUsers: looseApi.adsAudiencesMeta.uploadAudienceUsers,
    deleteAudience: looseApi.adsAudiencesMeta.deleteAudience,
};
export const adsMetaToolsApi = {
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
    clearAdAccountWebhooks: looseApi.adsMetaTools.clearAdAccountWebhooks,
};
export const adsMetaEventsApi = {
    sendCapiEvents: looseApi.adsMetaEvents.sendCapiEvents,
    sendOfflineEvents: looseApi.adsMetaEvents.sendOfflineEvents,
    executeBatch: looseApi.adsMetaEvents.executeBatch,
};
export const agentApi = {
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
    attachSpreadsheetExport: looseApi.agentMessages.attachSpreadsheetExport,
};
export const adminNotificationsApi = {
    list: looseApi.adminNotifications.list,
};
export const schedulerEventsApi = {
    list: looseApi.schedulerEvents.list,
};
export const collaborationApi = {
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
    syncMetadata: looseApi.r2.syncMetadata,
};
export const collaborationChannelsApi = {
    listAccessible: looseApi.collaborationChannels.listAccessible,
    create: looseApi.collaborationChannels.create,
    updateMembers: looseApi.collaborationChannels.updateMembers,
    remove: looseApi.collaborationChannels.remove,
};
export const collaborationChannelAvatarsApi = {
    listForWorkspace: looseApi.collaborationChannelAvatars.listForWorkspace,
    setAvatar: looseApi.collaborationChannelAvatars.setAvatar,
};
export const directMessagesApi = {
    searchMessages: looseApi.directMessages.searchMessages,
    voteOnPoll: looseApi.directMessages.voteOnPoll,
    endPollMessage: looseApi.directMessages.endPollMessage,
};
export const customFormulasApi = {
    listByWorkspace: looseApi.customFormulas.listByWorkspace,
    getByLegacyId: looseApi.customFormulas.getByLegacyId,
    create: looseApi.customFormulas.create,
    update: looseApi.customFormulas.update,
    remove: looseApi.customFormulas.remove,
};
export const proposalsApi = {
    list: looseApi.proposals.list,
    getByLegacyId: looseApi.proposals.getByLegacyId,
    create: looseApi.proposals.create,
    update: looseApi.proposals.update,
    remove: looseApi.proposals.remove,
    count: looseApi.proposals.count,
};
export const proposalArchivesApi = {
    getArtifactDownloadUrls: looseApi.proposalArchives.getArtifactDownloadUrls,
};
export const proposalGenerationApi = {
    generateFromProposal: looseApi.proposalGeneration.generateFromProposal,
};
export const proposalVersionsApi = {
    list: looseApi.proposalVersions.list,
    getByLegacyId: looseApi.proposalVersions.getByLegacyId,
    createSnapshot: looseApi.proposalVersions.createSnapshot,
    restoreToVersion: looseApi.proposalVersions.restoreToVersion,
    countByWorkspace: looseApi.proposalVersions.countByWorkspace,
};
export const proposalTemplatesApi = {
    list: looseApi.proposalTemplates.list,
    count: looseApi.proposalTemplates.count,
    getByLegacyId: looseApi.proposalTemplates.getByLegacyId,
    create: looseApi.proposalTemplates.create,
    update: looseApi.proposalTemplates.update,
    remove: looseApi.proposalTemplates.remove,
};
export const proposalAnalyticsApi = {
    addEvent: looseApi.proposalAnalytics.addEvent,
    listEvents: looseApi.proposalAnalytics.listEvents,
    summarize: looseApi.proposalAnalytics.summarize,
    timeSeries: looseApi.proposalAnalytics.timeSeries,
    byClient: looseApi.proposalAnalytics.byClient,
};
export const authActionsApi = {
    exportUserData: looseApi.authActions.exportUserData,
    deleteAccount: looseApi.authActions.deleteAccount,
};
export const filesApi = {
    generateUploadUrl: looseApi.r2.generateUploadUrl,
    syncMetadata: looseApi.r2.syncMetadata,
    getPublicUrl: looseApi.files.getPublicUrl,
    getDownloadUrl: looseApi.files.getDownloadUrl,
};
export const problemReportsApi = {
    create: looseApi.problemReports.create,
    list: looseApi.problemReports.list,
    update: looseApi.problemReports.update,
    remove: looseApi.problemReports.remove,
};
export const presentationDeckApi = {
    getStatus: looseApi.presentationDeck.getStatus,
    listFolders: looseApi.presentationDeck.listFolders,
    listThemes: looseApi.presentationDeck.listThemes,
};
export const analyticsInsightsApi = {
    generateInsights: looseApi.analyticsInsights.generateInsights,
};
export const creativesCopyApi = {
    generateCopy: looseApi.creativesCopy.generateCopy,
};
export const socialsIntegrationsApi = {
    getStatus: looseApi.socialIntegrations.getStatus,
    requestManualSync: looseApi.socialIntegrations.requestManualSync,
    discoverPages: looseApi.socialIntegrations.discoverPages,
    confirmSurfaceBinding: looseApi.socialIntegrations.confirmSurfaceBinding,
    disconnectIntegration: looseApi.socialIntegrations.disconnectIntegration,
};
export const socialMetricsApi = {
    listOverview: looseApi.socialMetrics.listOverview,
    listTimeSeries: looseApi.socialMetrics.listTimeSeries,
    listContent: looseApi.socialMetrics.listContent,
};
