// Client-safe import for Convex generated API.
// Keep this indirection so app code can import via `@/lib/convex-api`.
//
// Note: app call sites still rely on permissive function ref typing.
import { api as generatedApi } from '/_generated/api'

export const api = generatedApi
const looseApi = api as ReturnType<typeof JSON.parse>

export const settingsApi = {
  getMyProfile: looseApi.settings.getMyProfile,
  updateMyProfile: looseApi.settings.updateMyProfile,
  getMyNotificationPreferences: looseApi.settings.getMyNotificationPreferences,
  updateMyNotificationPreferences: looseApi.settings.updateMyNotificationPreferences,
  getMyRegionalPreferences: looseApi.settings.getMyRegionalPreferences,
  updateMyRegionalPreferences: looseApi.settings.updateMyRegionalPreferences,
}

export const usersApi = {
  listWorkspaceMembers: looseApi.users.listWorkspaceMembers,
  listAllUsers: looseApi.users.listAllUsers,
}

export const onboardingApi = {
  upsert: looseApi.onboardingStates.upsert,
  getByUserId: looseApi.onboardingStates.getByUserId,
}

export const clientsApi = {
  list: looseApi.clients.list,
  countActive: looseApi.clients.countActive,
  getByLegacyId: looseApi.clients.getByLegacyId,
  getClientSummaries: looseApi.clients.getClientSummaries,
  create: looseApi.clients.create,
  addTeamMember: looseApi.clients.addTeamMember,
  removeTeamMember: looseApi.clients.removeTeamMember,
  softDelete: looseApi.clients.softDelete,
}

export const debugApi = {
  whoami: looseApi.debug.whoami,
  listAnyClients: looseApi.debug.listAnyClients,
  countClientsByWorkspace: looseApi.debug.countClientsByWorkspace,
}

export const notificationsApi = {
  list: looseApi.notifications.list,
  getUnreadCount: looseApi.notifications.getUnreadCount,
  ack: looseApi.notifications.ack,
}

export const tasksApi = {
  list: looseApi.tasks.list,
  listByClient: looseApi.tasks.listByClient,
  listForUser: looseApi.tasks.listForUser,
  createTask: looseApi.tasks.createTask,
  patchTask: looseApi.tasks.patchTask,
  bulkPatchTasks: looseApi.tasks.bulkPatchTasks,
  softDeleteTask: looseApi.tasks.softDeleteTask,
  bulkSoftDeleteTasks: looseApi.tasks.bulkSoftDeleteTasks,
}

export const projectsApi = {
  list: looseApi.projects.list,
  getByLegacyId: looseApi.projects.getByLegacyId,
  create: looseApi.projects.create,
  update: looseApi.projects.update,
  softDelete: looseApi.projects.softDelete,
}

export const projectMilestonesApi = {
  listByProjectIds: looseApi.projectMilestones.listByProjectIds,
  listForProject: looseApi.projectMilestones.listForProject,
  create: looseApi.projectMilestones.create,
  update: looseApi.projectMilestones.update,
  remove: looseApi.projectMilestones.remove,
}

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
}

export const analyticsIntegrationsApi = {
  getGoogleAnalyticsStatus: looseApi.analyticsIntegrations.getGoogleAnalyticsStatus,
  listGoogleAnalyticsProperties: looseApi.analyticsIntegrations.listGoogleAnalyticsProperties,
  initializeGoogleAnalyticsProperty: looseApi.analyticsIntegrations.initializeGoogleAnalyticsProperty,
  deleteGoogleAnalyticsIntegration: looseApi.analyticsIntegrations.deleteGoogleAnalyticsIntegration,
  deleteGoogleAnalyticsSyncJobs: looseApi.analyticsIntegrations.deleteGoogleAnalyticsSyncJobs,
  deleteGoogleAnalyticsMetrics: looseApi.analyticsIntegrations.deleteGoogleAnalyticsMetrics,
}

export const meetingIntegrationsApi = {
  getGoogleWorkspaceStatus: looseApi.meetingIntegrations.getGoogleWorkspaceStatus,
  deleteGoogleWorkspaceIntegration: looseApi.meetingIntegrations.deleteGoogleWorkspaceIntegration,
}

export const meetingsApi = {
  list: looseApi.meetings.list,
  getByLegacyId: looseApi.meetings.getByLegacyId,
  getByRoomName: looseApi.meetings.getByRoomName,
  create: looseApi.meetings.create,
  updateStatus: looseApi.meetings.updateStatus,
}

export const adsMetricsApi = {
  listMetrics: looseApi.adsMetrics.listMetrics,
  listMetricsWithSummary: looseApi.adsMetrics.listMetricsWithSummary,
}

export const adsCampaignsApi = {
  listCampaigns: looseApi.adsCampaigns.listCampaigns,
  updateCampaign: looseApi.adsCampaigns.updateCampaign,
}

export const adsCampaignGroupsApi = {
  listCampaignGroups: looseApi.adsCampaignGroups.listCampaignGroups,
  updateCampaignGroup: looseApi.adsCampaignGroups.updateCampaignGroup,
}

export const adsCampaignInsightsApi = {
  getCampaignInsights: looseApi.adsCampaignInsights.getCampaignInsights,
}

export const adsCreativesApi = {
  listCreatives: looseApi.adsCreatives.listCreatives,
  updateCreativeStatus: looseApi.adsCreatives.updateCreativeStatus,
  listMetaPageActors: looseApi.adsCreatives.listMetaPageActors,
  createCreative: looseApi.adsCreatives.createCreative,
  updateCreative: looseApi.adsCreatives.updateCreative,
  uploadMedia: looseApi.adsCreatives.uploadMedia,
}

export const adsAdMetricsApi = {
  listAdMetrics: looseApi.adsAdMetrics.listAdMetrics,
}

export const adsTargetingApi = {
  getTargeting: looseApi.adsTargeting.getTargeting,
}

export const adsAudiencesApi = {
  createAudience: looseApi.adsAudiences.createAudience,
}

export const agentApi = {
  sendMessage: looseApi.agentActions.sendMessage,
  listConversations: looseApi.agentActions.listConversations,
  getConversation: looseApi.agentActions.getConversation,
  updateConversationTitle: looseApi.agent.updateConversationTitle,
  deleteConversation: looseApi.agent.deleteConversation,
}

export const collaborationApi = {
  listChannel: looseApi.collaborationMessages.listChannel,
  listThreadReplies: looseApi.collaborationMessages.listThreadReplies,
  getByLegacyId: looseApi.collaborationMessages.getByLegacyId,
  searchChannel: looseApi.collaborationMessages.searchChannel,
  getUnreadCount: looseApi.collaborationMessages.getUnreadCount,
  getUnreadCountsByChannel: looseApi.collaborationMessages.getUnreadCountsByChannel,
  createMessage: looseApi.collaborationMessages.create,
  updateMessage: looseApi.collaborationMessages.updateMessage,
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
  generateUploadUrl: looseApi.files.generateUploadUrl,
}

export const collaborationChannelsApi = {
  listAccessible: looseApi.collaborationChannels.listAccessible,
  create: looseApi.collaborationChannels.create,
  updateMembers: looseApi.collaborationChannels.updateMembers,
  remove: looseApi.collaborationChannels.remove,
}

export const directMessagesApi = {
  searchMessages: looseApi.directMessages.searchMessages,
}

export const customFormulasApi = {
  listByWorkspace: looseApi.customFormulas.listByWorkspace,
  getByLegacyId: looseApi.customFormulas.getByLegacyId,
  create: looseApi.customFormulas.create,
  update: looseApi.customFormulas.update,
  remove: looseApi.customFormulas.remove,
}

export const proposalsApi = {
  list: looseApi.proposals.list,
  getByLegacyId: looseApi.proposals.getByLegacyId,
  create: looseApi.proposals.create,
  update: looseApi.proposals.update,
  remove: looseApi.proposals.remove,
  count: looseApi.proposals.count,
}

export const proposalGenerationApi = {
  generateFromProposal: looseApi.proposalGeneration.generateFromProposal,
}

export const proposalVersionsApi = {
  list: looseApi.proposalVersions.list,
  getByLegacyId: looseApi.proposalVersions.getByLegacyId,
  createSnapshot: looseApi.proposalVersions.createSnapshot,
  restoreToVersion: looseApi.proposalVersions.restoreToVersion,
  countByWorkspace: looseApi.proposalVersions.countByWorkspace,
}

export const proposalTemplatesApi = {
  list: looseApi.proposalTemplates.list,
  count: looseApi.proposalTemplates.count,
  getByLegacyId: looseApi.proposalTemplates.getByLegacyId,
  create: looseApi.proposalTemplates.create,
  update: looseApi.proposalTemplates.update,
  remove: looseApi.proposalTemplates.remove,
}

export const proposalAnalyticsApi = {
  addEvent: looseApi.proposalAnalytics.addEvent,
  listEvents: looseApi.proposalAnalytics.listEvents,
  summarize: looseApi.proposalAnalytics.summarize,
  timeSeries: looseApi.proposalAnalytics.timeSeries,
  byClient: looseApi.proposalAnalytics.byClient,
}

export const authActionsApi = {
  exportUserData: looseApi.authActions.exportUserData,
  deleteAccount: looseApi.authActions.deleteAccount,
}

export const filesApi = {
  generateUploadUrl: looseApi.files.generateUploadUrl,
  getPublicUrl: looseApi.files.getPublicUrl,
  getDownloadUrl: looseApi.files.getDownloadUrl,
}

export const problemReportsApi = {
  create: looseApi.problemReports.create,
  list: looseApi.problemReports.list,
  update: looseApi.problemReports.update,
  remove: looseApi.problemReports.remove,
}

export const workforceApi = {
  getTimeDashboard: looseApi.workforce.getTimeDashboard,
  seedTimeModule: looseApi.workforce.seedTimeModule,
  clockAction: looseApi.workforce.clockAction,
  submitTimeSessionReview: looseApi.workforce.submitTimeSessionReview,
  getSchedulingDashboard: looseApi.workforce.getSchedulingDashboard,
  seedSchedulingModule: looseApi.workforce.seedSchedulingModule,
  createCoverageShift: looseApi.workforce.createCoverageShift,
  setMyAvailability: looseApi.workforce.setMyAvailability,
  createShiftSwapRequest: looseApi.workforce.createShiftSwapRequest,
  reviewShiftSwapRequest: looseApi.workforce.reviewShiftSwapRequest,
  claimOpenShift: looseApi.workforce.claimOpenShift,
  getFormsDashboard: looseApi.workforce.getFormsDashboard,
  seedFormsModule: looseApi.workforce.seedFormsModule,
  createChecklistTemplate: looseApi.workforce.createChecklistTemplate,
  submitChecklist: looseApi.workforce.submitChecklist,
  reviewFormSubmission: looseApi.workforce.reviewFormSubmission,
  getTimeOffDashboard: looseApi.workforce.getTimeOffDashboard,
  seedTimeOffModule: looseApi.workforce.seedTimeOffModule,
  createTimeOffRequest: looseApi.workforce.createTimeOffRequest,
  reviewTimeOffRequest: looseApi.workforce.reviewTimeOffRequest,
}

export const gammaApi = {
  getStatus: looseApi.gamma.getStatus,
  listFolders: looseApi.gamma.listFolders,
  listThemes: looseApi.gamma.listThemes,
}

export const analyticsInsightsApi = {
  generateInsights: looseApi.analyticsInsights.generateInsights,
}

export const creativesCopyApi = {
  generateCopy: looseApi.creativesCopy.generateCopy,
}

export const socialsIntegrationsApi = {
  getStatus: looseApi.socialIntegrations.getStatus,
  requestManualSync: looseApi.socialIntegrations.requestManualSync,
}

export const socialMetricsApi = {
  listOverview: looseApi.socialMetrics.listOverview,
  listTimeSeries: looseApi.socialMetrics.listTimeSeries,
  listContent: looseApi.socialMetrics.listContent,
}
