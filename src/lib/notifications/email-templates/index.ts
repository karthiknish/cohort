/**
 * Email Templates Barrel File
 * Re-exports all email templates for easy importing
 */

export { wrapEmailTemplate, escapeHtml } from './utils'

export { projectCreatedTemplate, type ProjectCreatedTemplateParams } from './project-created'
export { taskAssignedTemplate, type TaskAssignedTemplateParams } from './task-assigned'
export { mentionTemplate, type MentionTemplateParams } from './mention'
export { proposalReadyTemplate, type ProposalReadyTemplateParams } from './proposal-ready'
export { adAlertsTemplate, type AdAlertsTemplateParams } from './ad-alerts'
export { integrationAlertTemplate, type IntegrationAlertTemplateParams } from './integration-alert'
export { workspaceInviteTemplate, type WorkspaceInviteTemplateParams } from './workspace-invite'
export { performanceDigestTemplate, type PerformanceDigestTemplateParams } from './performance-digest'
export { taskActivityTemplate, type TaskActivityTemplateParams } from './task-activity'
export { meetingScheduledTemplate, type MeetingScheduledTemplateParams } from './meeting-scheduled'
export { meetingRescheduledTemplate, type MeetingRescheduledTemplateParams } from './meeting-rescheduled'
export { meetingCancelledTemplate, type MeetingCancelledTemplateParams } from './meeting-cancelled'
