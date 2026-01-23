// Client-safe import for Convex generated API.
// Keep this indirection so app code can import via `@/lib/convex-api`.
//
// Note: in this repo, runtime `api` is `anyApi`, so we access function refs via
// `(api as any).module.function`.
import { api as generatedApi } from '../../convex/_generated/api'

export const api = generatedApi

export const settingsApi = {
  getMyProfile: (api as any).settings.getMyProfile,
  updateMyProfile: (api as any).settings.updateMyProfile,
  getMyNotificationPreferences: (api as any).settings.getMyNotificationPreferences,
  updateMyNotificationPreferences: (api as any).settings.updateMyNotificationPreferences,
  getMyRegionalPreferences: (api as any).settings.getMyRegionalPreferences,
  updateMyRegionalPreferences: (api as any).settings.updateMyRegionalPreferences,
}

export const usersApi = {
  listWorkspaceMembers: (api as any).users.listWorkspaceMembers,
}

export const onboardingApi = {
  upsert: (api as any).onboardingStates.upsert,
  getByUserId: (api as any).onboardingStates.getByUserId,
}

export const clientsApi = {
  list: (api as any).clients.list,
  countActive: (api as any).clients.countActive,
  getByLegacyId: (api as any).clients.getByLegacyId,
  create: (api as any).clients.create,
  addTeamMember: (api as any).clients.addTeamMember,
  softDelete: (api as any).clients.softDelete,
}

export const debugApi = {
  whoami: (api as any).debug.whoami,
  listAnyClients: (api as any).debug.listAnyClients,
  countClientsByWorkspace: (api as any).debug.countClientsByWorkspace,
}

export const notificationsApi = {
  list: (api as any).notifications.list,
  getUnreadCount: (api as any).notifications.getUnreadCount,
  ack: (api as any).notifications.ack,
}

export const tasksApi = {
  listByClient: (api as any).tasks.listByClient,
  createTask: (api as any).tasks.createTask,
  patchTask: (api as any).tasks.patchTask,
  bulkPatchTasks: (api as any).tasks.bulkPatchTasks,
  softDeleteTask: (api as any).tasks.softDeleteTask,
  bulkSoftDeleteTasks: (api as any).tasks.bulkSoftDeleteTasks,
}

export const projectsApi = {
  list: (api as any).projects.list,
  getByLegacyId: (api as any).projects.getByLegacyId,
  create: (api as any).projects.create,
  update: (api as any).projects.update,
  softDelete: (api as any).projects.softDelete,
}

export const projectMilestonesApi = {
  listByProjectIds: (api as any).projectMilestones.listByProjectIds,
  listForProject: (api as any).projectMilestones.listForProject,
  create: (api as any).projectMilestones.create,
  update: (api as any).projectMilestones.update,
  remove: (api as any).projectMilestones.remove,
}

export const adsIntegrationsApi = {
  getAdIntegration: (api as any).adsIntegrations.getAdIntegration,
  listStatuses: (api as any).adsIntegrations.listStatuses,
  updateAutomationSettings: (api as any).adsIntegrations.updateAutomationSettings,
  requestManualSync: (api as any).adsIntegrations.requestManualSync,
  initializeAdAccount: (api as any).adsIntegrations.initializeAdAccount,
  deleteAdIntegration: (api as any).adsIntegrations.deleteAdIntegration,
  deleteSyncJobs: (api as any).adsIntegrations.deleteSyncJobs,
}

export const adsMetricsApi = {
  listMetrics: (api as any).adsMetrics.listMetrics,
  listMetricsWithSummary: (api as any).adsMetrics.listMetricsWithSummary,
}

export const adsCampaignsApi = {
  listCampaigns: (api as any).adsCampaigns.listCampaigns,
  updateCampaign: (api as any).adsCampaigns.updateCampaign,
}

export const adsCampaignGroupsApi = {
  listCampaignGroups: (api as any).adsCampaignGroups.listCampaignGroups,
  updateCampaignGroup: (api as any).adsCampaignGroups.updateCampaignGroup,
}

export const adsCampaignInsightsApi = {
  getCampaignInsights: (api as any).adsCampaignInsights.getCampaignInsights,
}

export const adsCreativesApi = {
  listCreatives: (api as any).adsCreatives.listCreatives,
  updateCreativeStatus: (api as any).adsCreatives.updateCreativeStatus,
}

export const adsAdMetricsApi = {
  listAdMetrics: (api as any).adsAdMetrics.listAdMetrics,
}

export const adsTargetingApi = {
  getTargeting: (api as any).adsTargeting.getTargeting,
}

export const adsAudiencesApi = {
  createAudience: (api as any).adsAudiences.createAudience,
}

export const agentApi = {
  sendMessage: (api as any).agentActions.sendMessage,
  listConversations: (api as any).agentActions.listConversations,
  getConversation: (api as any).agentActions.getConversation,
  updateConversationTitle: (api as any).agent.updateConversationTitle,
  deleteConversation: (api as any).agent.deleteConversation,
}

export const collaborationApi = {
  listChannel: (api as any).collaborationMessages.listChannel,
  listThreadReplies: (api as any).collaborationMessages.listThreadReplies,
  getByLegacyId: (api as any).collaborationMessages.getByLegacyId,
  searchChannel: (api as any).collaborationMessages.searchChannel,
  createMessage: (api as any).collaborationMessages.create,
  updateMessage: (api as any).collaborationMessages.updateMessage,
  softDeleteMessage: (api as any).collaborationMessages.softDelete,
  toggleReaction: (api as any).collaborationMessages.toggleReaction,
  setTyping: (api as any).collaborationTyping.setTyping,
  listTyping: (api as any).collaborationTyping.listForChannel,
  generateUploadUrl: (api as any).files.generateUploadUrl,
}

export const customFormulasApi = {
  listByWorkspace: (api as any).customFormulas.listByWorkspace,
  getByLegacyId: (api as any).customFormulas.getByLegacyId,
  create: (api as any).customFormulas.create,
  update: (api as any).customFormulas.update,
  remove: (api as any).customFormulas.remove,
}

export const proposalsApi = {
  list: (api as any).proposals.list,
  getByLegacyId: (api as any).proposals.getByLegacyId,
  create: (api as any).proposals.create,
  update: (api as any).proposals.update,
  remove: (api as any).proposals.remove,
  count: (api as any).proposals.count,
}

export const proposalGenerationApi = {
  generateFromProposal: (api as any).proposalGeneration.generateFromProposal,
}

export const proposalVersionsApi = {
  list: (api as any).proposalVersions.list,
  getByLegacyId: (api as any).proposalVersions.getByLegacyId,
  createSnapshot: (api as any).proposalVersions.createSnapshot,
  restoreToVersion: (api as any).proposalVersions.restoreToVersion,
  countByWorkspace: (api as any).proposalVersions.countByWorkspace,
}

export const proposalTemplatesApi = {
  list: (api as any).proposalTemplates.list,
  count: (api as any).proposalTemplates.count,
  getByLegacyId: (api as any).proposalTemplates.getByLegacyId,
  create: (api as any).proposalTemplates.create,
  update: (api as any).proposalTemplates.update,
  remove: (api as any).proposalTemplates.remove,
}

export const proposalAnalyticsApi = {
  addEvent: (api as any).proposalAnalytics.addEvent,
  listEvents: (api as any).proposalAnalytics.listEvents,
  summarize: (api as any).proposalAnalytics.summarize,
  timeSeries: (api as any).proposalAnalytics.timeSeries,
  byClient: (api as any).proposalAnalytics.byClient,
}

export const financeVendorsApi = {
  list: (api as any).financeVendors.list,
  upsert: (api as any).financeVendors.upsert,
  remove: (api as any).financeVendors.remove,
}

export const financeExpenseCategoriesApi = {
  list: (api as any).financeExpenseCategories.list,
  upsert: (api as any).financeExpenseCategories.upsert,
  remove: (api as any).financeExpenseCategories.remove,
}

export const financeExpensesApi = {
  list: (api as any).financeExpenses.list,
  getByLegacyId: (api as any).financeExpenses.getByLegacyId,
  upsert: (api as any).financeExpenses.upsert,
  remove: (api as any).financeExpenses.remove,
  report: (api as any).financeExpenseReport.report,
}

export const financePurchaseOrdersApi = {
  list: (api as any).financePurchaseOrders.list,
  getByLegacyId: (api as any).financePurchaseOrders.getByLegacyId,
  upsert: (api as any).financePurchaseOrders.upsert,
  remove: (api as any).financePurchaseOrders.remove,
}

export const financeRevenueApi = {
  list: (api as any).financeRevenue.list,
}

export const financeCostsApi = {
  list: (api as any).financeCosts.list,
  create: (api as any).financeCosts.create,
  remove: (api as any).financeCosts.remove,
}

export const financeInvoicesApi = {
  list: (api as any).financeInvoices.list,
  getByLegacyId: (api as any).financeInvoices.getByLegacyId,
  upsert: (api as any).financeInvoices.upsert,
  remind: (api as any).financeInvoicesActions.remind,
  refund: (api as any).financeInvoicesActions.refund,
  createAndSend: (api as any).financeInvoicesActions.createAndSend,
}

export const financeSummaryApi = {
  get: (api as any).financeSummary.get,
}

export const recurringInvoicesApi = {
  list: (api as any).recurringInvoices.list,
  getById: (api as any).recurringInvoices.getById,
  create: (api as any).recurringInvoices.create,
  update: (api as any).recurringInvoices.update,
  remove: (api as any).recurringInvoices.remove,
  trigger: (api as any).recurringInvoices.trigger,
}

export const billingApi = {
  getStatus: (api as any).billing.getStatus,
  createCheckoutSession: (api as any).billing.createCheckoutSession,
  createPortalSession: (api as any).billing.createPortalSession,
}

export const authActionsApi = {
  exportUserData: (api as any).authActions.exportUserData,
  deleteAccount: (api as any).authActions.deleteAccount,
}

export const filesApi = {
  generateUploadUrl: (api as any).files.generateUploadUrl,
  getPublicUrl: (api as any).files.getPublicUrl,
  getDownloadUrl: (api as any).files.getDownloadUrl,
}

export const problemReportsApi = {
  create: (api as any).problemReports.create,
  list: (api as any).problemReports.list,
  update: (api as any).problemReports.update,
  remove: (api as any).problemReports.remove,
}

export const gammaApi = {
  getStatus: (api as any).gamma.getStatus,
  listFolders: (api as any).gamma.listFolders,
  listThemes: (api as any).gamma.listThemes,
}

export const analyticsInsightsApi = {
  generateInsights: (api as any).analyticsInsights.generateInsights,
}

export const creativesCopyApi = {
  generateCopy: (api as any).creativesCopy.generateCopy,
}
