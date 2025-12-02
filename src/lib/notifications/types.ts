// Notification types and interfaces

import type {
  WorkspaceNotificationKind,
  WorkspaceNotificationRole,
  WorkspaceNotificationResource,
} from '@/types/notifications'

// =============================================================================
// CONTACT PAYLOAD
// =============================================================================

export interface ContactPayload {
  name: string
  email: string
  company: string | null
  message: string
}

// =============================================================================
// WORKSPACE NOTIFICATION TYPES
// =============================================================================

export type WorkspaceNotificationRecipients = {
  roles: WorkspaceNotificationRole[]
  clientIds?: string[]
  clientId?: string | null
  userIds?: string[]
}

export type WorkspaceNotificationInput = {
  workspaceId: string
  kind: WorkspaceNotificationKind
  title: string
  body: string
  actor: { id: string | null; name: string | null }
  resource: WorkspaceNotificationResource
  recipients: WorkspaceNotificationRecipients
  metadata?: Record<string, unknown>
}

// =============================================================================
// WHATSAPP TYPES
// =============================================================================

export type WhatsAppNotificationKind =
  | 'task-created'
  | 'collaboration-message'
  | 'invoice-sent'
  | 'invoice-paid'

export interface WhatsAppSendResult {
  success: boolean
  to: string
  messageId?: string
  error?: Error
}

export interface WhatsAppDispatchResult {
  totalRecipients: number
  successCount: number
  failureCount: number
  errors: Error[]
}

// =============================================================================
// HEALTH CHECK TYPES
// =============================================================================

export interface NotificationHealthStatus {
  email: { configured: boolean; healthy: boolean; error?: string }
  slack: { configured: boolean; healthy: boolean; error?: string }
  whatsapp: { configured: boolean; healthy: boolean; error?: string }
  firestore: { configured: boolean; healthy: boolean; error?: string }
}
