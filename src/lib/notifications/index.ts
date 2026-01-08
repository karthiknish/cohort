// Notifications module barrel file
// Exports all notification functionality from sub-modules

// Error handling
export {
  NOTIFICATION_ERROR_CODES,
  NotificationError,
  type NotificationErrorCode,
  type NotificationChannel,
} from './errors'

// Configuration and utilities
export {
  EMAIL_WEBHOOK_URL,
  SLACK_WEBHOOK_URL,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_API_VERSION,
  RETRY_CONFIG,
  sleep,
  calculateBackoffDelay,
  parseRetryAfter,
  fetchWithTimeout,
  sanitizeWhatsAppNumber,
} from './config'

// Types
export type {
  ContactPayload,
  WorkspaceNotificationRecipients,
  WorkspaceNotificationInput,
  WhatsAppNotificationKind,
  WhatsAppSendResult,
  WhatsAppDispatchResult,
  NotificationHealthStatus,
} from './types'

// Webhook notifications (email, slack)
export { notifyContactEmail, notifyContactSlack } from './webhooks'

// WhatsApp notifications
export {
  notifyTaskCreatedWhatsApp,
  notifyCollaborationMessageWhatsApp,
  notifyInvoiceSentWhatsApp,
  notifyInvoicePaidWhatsApp,
} from './whatsapp'

// Workspace/Firestore notifications
export {
  recordTaskNotification,
  recordTaskUpdatedNotification,
  recordTaskCommentNotification,
  recordTaskMentionNotifications,
  recordCollaborationNotification,
  recordMentionNotifications,
  recordProposalDeckReadyNotification,
  recordInvoiceSentNotification,
  recordInvoicePaidNotification,
  recordProjectCreatedNotification,
} from './workspace'

// Health check
export { checkNotificationHealth } from './health'

// Brevo email notifications
export {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
  sendTransactionalEmail,
  notifyInvoicePaidEmail,
  notifyInvoiceSentEmail,
  notifyProjectCreatedEmail,
  notifyTaskAssignedEmail,
  notifyMentionEmail,
  notifyProposalReadyEmail,
  notifyIntegrationAlertEmail,
  notifyWorkspaceInviteEmail,
  notifyPerformanceDigestEmail,
  notifyTaskActivityEmail,
  notifyInvoicePaymentFailedEmail,
  checkBrevoHealth,
  type BrevoEmailResult,
  type BrevoSendOptions,
} from './brevo'
