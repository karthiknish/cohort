/**
 * Centralized Firestore stored document types.
 * 
 * These types represent raw Firestore document data (untyped) and use `unknown`
 * for all fields. They are safely coerced by mapper functions in each route.
 * 
 * This pattern provides type safety when reading from Firestore while
 * acknowledging that Firestore data is inherently untyped at runtime.
 */

// ============================================================================
// Client Types
// ============================================================================

export type StoredClient = {
  name?: unknown
  accountManager?: unknown
  teamMembers?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

// ============================================================================
// Task Types
// ============================================================================

export type StoredTask = {
  title?: unknown
  description?: unknown
  status?: unknown
  priority?: unknown
  assignedTo?: unknown
  client?: unknown
  clientId?: unknown
  projectId?: unknown
  projectName?: unknown
  dueDate?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  deletedAt?: unknown
}

export type StoredTaskComment = {
  taskId?: unknown
  content?: unknown
  format?: unknown
  authorId?: unknown
  authorName?: unknown
  authorRole?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  deletedAt?: unknown
  deletedBy?: unknown
  deleted?: unknown
  attachments?: unknown
  mentions?: unknown
  parentCommentId?: unknown
  threadRootId?: unknown
}

// ============================================================================
// Collaboration Message Types
// ============================================================================

export type StoredMessage = {
  channelType?: unknown
  clientId?: unknown
  projectId?: unknown
  senderId?: unknown
  senderName?: unknown
  senderRole?: unknown
  content?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  deletedAt?: unknown
  deletedBy?: unknown
  deleted?: unknown
  attachments?: unknown
  format?: unknown
  mentions?: unknown
  reactions?: unknown
  parentMessageId?: unknown
  threadRootId?: unknown
  isThreadRoot?: unknown
  threadReplyCount?: unknown
  threadLastReplyAt?: unknown
}

export type StoredAttachment = {
  name?: unknown
  url?: unknown
  type?: unknown
  size?: unknown
}

export type StoredMention = {
  slug?: unknown
  name?: unknown
  role?: unknown
}

export type StoredReaction = {
  emoji?: unknown
  count?: unknown
  userIds?: unknown
}

// ============================================================================
// Proposal Types
// ============================================================================

export type StoredTemplate = {
  name?: unknown
  description?: unknown
  formData?: unknown
  industry?: unknown
  tags?: unknown
  isDefault?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredVersion = {
  proposalId?: string
  versionNumber?: number
  formData?: unknown
  status?: string
  stepProgress?: number
  changeDescription?: string | null
  createdBy?: string
  createdByName?: string | null
  createdAt?: unknown
}

// ============================================================================
// Admin Types
// ============================================================================

export type StoredInvitation = {
  email?: unknown
  role?: unknown
  name?: unknown
  message?: unknown
  status?: unknown
  invitedBy?: unknown
  invitedByName?: unknown
  token?: unknown
  expiresAt?: unknown
  createdAt?: unknown
  acceptedAt?: unknown
}
