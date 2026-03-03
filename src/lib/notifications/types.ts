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
// HEALTH CHECK TYPES
// =============================================================================

export interface NotificationHealthStatus {
  email: { configured: boolean; healthy: boolean; error?: string }
  firestore: { configured: boolean; healthy: boolean; error?: string }
}
