/**
 * Email Templates Barrel File
 * Re-exports all email templates for easy importing
 */

export { wrapEmailTemplate, escapeHtml } from './utils'

export { invoicePaidTemplate, type InvoicePaidTemplateParams } from './invoice-paid'
export { invoiceSentTemplate, type InvoiceSentTemplateParams } from './invoice-sent'
export { projectCreatedTemplate, type ProjectCreatedTemplateParams } from './project-created'
export { taskAssignedTemplate, type TaskAssignedTemplateParams } from './task-assigned'
export { mentionTemplate, type MentionTemplateParams } from './mention'
export { proposalReadyTemplate, type ProposalReadyTemplateParams } from './proposal-ready'
