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
  billingEmail?: unknown
  stripeCustomerId?: unknown
  lastInvoiceStatus?: unknown
  lastInvoiceAmount?: unknown
  lastInvoiceCurrency?: unknown
  lastInvoiceIssuedAt?: unknown
  lastInvoiceNumber?: unknown
  lastInvoiceUrl?: unknown
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
  tags?: unknown
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
// Finance Types
// ============================================================================

export type StoredFinanceRevenue = {
  clientId?: unknown
  period?: unknown
  label?: unknown
  revenue?: unknown
  operatingExpenses?: unknown
  currency?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredFinanceInvoice = {
  clientId?: unknown
  clientName?: unknown
  amount?: unknown
  status?: unknown
  stripeStatus?: unknown
  issuedDate?: unknown
  dueDate?: unknown
  description?: unknown
  hostedInvoiceUrl?: unknown
  number?: unknown
  amountPaid?: unknown
  amountRemaining?: unknown
  amountRefunded?: unknown
  currency?: unknown
  paidDate?: unknown
  paymentIntentId?: unknown
  collectionMethod?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredFinanceCost = {
  clientId?: unknown
  category?: unknown
  amount?: unknown
  cadence?: unknown
  currency?: unknown
  workspaceId?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredFinanceExpenseCategory = {
  name?: unknown
  code?: unknown
  description?: unknown
  isActive?: unknown
  isSystem?: unknown
  sortOrder?: unknown
  workspaceId?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredFinanceVendor = {
  name?: unknown
  email?: unknown
  phone?: unknown
  website?: unknown
  notes?: unknown
  isActive?: unknown
  workspaceId?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredFinanceExpense = {
  description?: unknown
  categoryId?: unknown
  categoryName?: unknown
  vendorId?: unknown
  vendorName?: unknown
  amount?: unknown
  currency?: unknown
  costType?: unknown
  incurredAt?: unknown
  status?: unknown
  employeeId?: unknown
  submittedAt?: unknown
  approvedAt?: unknown
  rejectedAt?: unknown
  decidedBy?: unknown
  decisionNote?: unknown
  attachments?: unknown
  workspaceId?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export type StoredFinancePurchaseOrder = {
  number?: unknown
  status?: unknown
  vendorId?: unknown
  vendorName?: unknown
  currency?: unknown
  items?: unknown
  totalAmount?: unknown
  notes?: unknown
  requestedBy?: unknown
  submittedAt?: unknown
  approvedAt?: unknown
  rejectedAt?: unknown
  decidedBy?: unknown
  decisionNote?: unknown
  orderedAt?: unknown
  receivedAt?: unknown
  workspaceId?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
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
// Recurring Invoice Types
// ============================================================================

export type StoredSchedule = {
  clientId?: unknown
  clientName?: unknown
  amount?: unknown
  currency?: unknown
  description?: unknown
  frequency?: unknown
  dayOfMonth?: unknown
  dayOfWeek?: unknown
  startDate?: unknown
  endDate?: unknown
  nextRunDate?: unknown
  lastRunDate?: unknown
  lastInvoiceId?: unknown
  isActive?: unknown
  totalInvoicesGenerated?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
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
