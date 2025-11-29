import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'
import type { ProjectRecord } from '@/types/projects'
import type {
  WorkspaceNotificationKind,
  WorkspaceNotificationRole,
  WorkspaceNotificationResource,
} from '@/types/notifications'

// =============================================================================
// ERROR CODES & CUSTOM ERROR CLASS
// =============================================================================

export const NOTIFICATION_ERROR_CODES = {
  // Configuration Errors
  WEBHOOK_NOT_CONFIGURED: 'WEBHOOK_NOT_CONFIGURED',
  WHATSAPP_NOT_CONFIGURED: 'WHATSAPP_NOT_CONFIGURED',
  INVALID_CONFIG: 'INVALID_CONFIG',
  
  // Validation Errors
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  MISSING_WORKSPACE_ID: 'MISSING_WORKSPACE_ID',
  MISSING_RECIPIENT: 'MISSING_RECIPIENT',
  
  // Delivery Errors
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  WHATSAPP_SEND_FAILED: 'WHATSAPP_SEND_FAILED',
  FIRESTORE_WRITE_FAILED: 'FIRESTORE_WRITE_FAILED',
  
  // Rate Limiting
  RATE_LIMITED: 'RATE_LIMITED',
  WHATSAPP_RATE_LIMITED: 'WHATSAPP_RATE_LIMITED',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const

export type NotificationErrorCode = (typeof NOTIFICATION_ERROR_CODES)[keyof typeof NOTIFICATION_ERROR_CODES]

export class NotificationError extends Error {
  readonly errorCode: NotificationErrorCode
  readonly httpStatus?: number
  readonly isRetryable: boolean
  readonly channel: 'email' | 'slack' | 'whatsapp' | 'firestore' | 'unknown'
  readonly retryAfterMs?: number
  readonly metadata?: Record<string, unknown>

  constructor(options: {
    message: string
    errorCode: NotificationErrorCode
    httpStatus?: number
    channel?: 'email' | 'slack' | 'whatsapp' | 'firestore' | 'unknown'
    retryAfterMs?: number
    metadata?: Record<string, unknown>
  }) {
    super(options.message)
    this.name = 'NotificationError'
    this.errorCode = options.errorCode
    this.httpStatus = options.httpStatus
    this.channel = options.channel ?? 'unknown'
    this.retryAfterMs = options.retryAfterMs
    this.metadata = options.metadata

    // Determine if error is retryable
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsRetryable(): boolean {
    const retryableErrors: string[] = [
      NOTIFICATION_ERROR_CODES.WEBHOOK_FAILED,
      NOTIFICATION_ERROR_CODES.WHATSAPP_SEND_FAILED,
      NOTIFICATION_ERROR_CODES.FIRESTORE_WRITE_FAILED,
      NOTIFICATION_ERROR_CODES.RATE_LIMITED,
      NOTIFICATION_ERROR_CODES.WHATSAPP_RATE_LIMITED,
      NOTIFICATION_ERROR_CODES.NETWORK_ERROR,
      NOTIFICATION_ERROR_CODES.TIMEOUT,
    ]

    if (retryableErrors.includes(this.errorCode)) return true

    // Server errors (5xx) are generally retryable
    if (this.httpStatus !== undefined && this.httpStatus >= 500 && this.httpStatus < 600) return true

    // Rate limit (429) is retryable after delay
    if (this.httpStatus === 429) return true

    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      httpStatus: this.httpStatus,
      channel: this.channel,
      isRetryable: this.isRetryable,
      retryAfterMs: this.retryAfterMs,
      metadata: this.metadata,
    }
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

interface ContactPayload {
  name: string
  email: string
  company: string | null
  message: string
}

const EMAIL_WEBHOOK_URL = process.env.CONTACT_EMAIL_WEBHOOK_URL
const SLACK_WEBHOOK_URL = process.env.CONTACT_SLACK_WEBHOOK_URL
const WHATSAPP_API_VERSION = process.env.WHATSAPP_BUSINESS_API_VERSION ?? 'v18.0'
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  requestTimeoutMs: 10000,
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with decorrelated jitter
 */
function calculateBackoffDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * Math.min(RETRY_CONFIG.maxDelayMs, baseDelay)
  return Math.min(RETRY_CONFIG.maxDelayMs, baseDelay + jitter)
}

/**
 * Parse Retry-After header value
 */
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null

  // Try parsing as seconds
  const seconds = parseInt(header, 10)
  if (!isNaN(seconds)) {
    return seconds * 1000
  }

  // Try parsing as HTTP date
  const date = new Date(header)
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now())
  }

  return null
}

/**
 * Execute a fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = RETRY_CONFIG.requestTimeoutMs
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// =============================================================================
// WEBHOOK NOTIFICATIONS WITH RETRY
// =============================================================================

export async function notifyContactEmail(payload: ContactPayload): Promise<void> {
  if (!EMAIL_WEBHOOK_URL) {
    console.info('[notifications] email webhook not configured, skipping')
    return
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact.created', payload }),
      })

      if (response.ok) {
        console.log(`[notifications] email webhook sent successfully`)
        return
      }

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
        const delayMs = retryAfter ?? calculateBackoffDelay(attempt)

        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          console.warn(`[notifications] email webhook rate limited, retrying in ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        }
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] email webhook failed (${response.status}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      const errorText = await response.text().catch(() => 'Unknown error')
      throw new NotificationError({
        message: `Email webhook failed (${response.status}): ${errorText}`,
        errorCode: NOTIFICATION_ERROR_CODES.WEBHOOK_FAILED,
        httpStatus: response.status,
        channel: 'email',
      })
    } catch (error) {
      if (error instanceof NotificationError) {
        throw error
      }

      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Retry on network errors
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const isAbortError = lastError.name === 'AbortError'
        console.warn(`[notifications] email webhook ${isAbortError ? 'timed out' : 'network error'}, retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[notifications] email webhook failed after all retries', lastError)
}

export async function notifyContactSlack(payload: ContactPayload): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.info('[notifications] slack webhook not configured, skipping')
    return
  }

  const text = `:wave: *New contact message*\n*Name:* ${payload.name}\n*Email:* ${payload.email}\n*Company:* ${payload.company ?? '—'}\n*Message:* ${payload.message}`

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        console.log(`[notifications] slack webhook sent successfully`)
        return
      }

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
        const delayMs = retryAfter ?? calculateBackoffDelay(attempt)

        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          console.warn(`[notifications] slack webhook rate limited, retrying in ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        }
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] slack webhook failed (${response.status}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      const errorText = await response.text().catch(() => 'Unknown error')
      throw new NotificationError({
        message: `Slack webhook failed (${response.status}): ${errorText}`,
        errorCode: NOTIFICATION_ERROR_CODES.WEBHOOK_FAILED,
        httpStatus: response.status,
        channel: 'slack',
      })
    } catch (error) {
      if (error instanceof NotificationError) {
        throw error
      }

      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Retry on network errors
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const isAbortError = lastError.name === 'AbortError'
        console.warn(`[notifications] slack webhook ${isAbortError ? 'timed out' : 'network error'}, retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[notifications] slack webhook failed after all retries', lastError)
}

type WhatsAppNotificationKind = 'task-created' | 'collaboration-message' | 'invoice-sent' | 'invoice-paid'

type WorkspaceNotificationRecipients = {
  roles: WorkspaceNotificationRole[]
  clientIds?: string[]
  clientId?: string | null
  userIds?: string[]
}

type WorkspaceNotificationInput = {
  workspaceId: string
  kind: WorkspaceNotificationKind
  title: string
  body: string
  actor: { id: string | null; name: string | null }
  resource: WorkspaceNotificationResource
  recipients: WorkspaceNotificationRecipients
  metadata?: Record<string, unknown>
}

function uniqueRoles(roles: WorkspaceNotificationRole[]): WorkspaceNotificationRole[] {
  const seen = new Set<WorkspaceNotificationRole>()
  const allowed: WorkspaceNotificationRole[] = ['admin', 'team', 'client']

  roles.forEach((role) => {
    if (allowed.includes(role) && !seen.has(role)) {
      seen.add(role)
    }
  })

  return Array.from(seen)
}

function sanitizeIdList(values?: unknown[]): string[] | undefined {
  if (!Array.isArray(values)) {
    return undefined
  }

  const set = new Set<string>()
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        set.add(trimmed)
      }
    }
  }

  return set.size > 0 ? Array.from(set) : undefined
}

// =============================================================================
// FIRESTORE NOTIFICATION CREATION WITH RETRY
// =============================================================================

async function createWorkspaceNotification(input: WorkspaceNotificationInput): Promise<void> {
  const { workspaceId, recipients, ...rest } = input

  if (!workspaceId) {
    console.warn('[notifications] missing workspaceId, skipping notification creation')
    return
  }

  const normalizedRecipients: WorkspaceNotificationRecipients = {
    roles: uniqueRoles(recipients.roles ?? []),
  }

  const clientIds = sanitizeIdList(recipients.clientIds)
  if (clientIds) {
    normalizedRecipients.clientIds = clientIds
  }

  const explicitClientId = typeof recipients.clientId === 'string' && recipients.clientId.trim().length > 0
    ? recipients.clientId.trim()
    : null

  const primaryClientId = explicitClientId ?? clientIds?.[0] ?? null
  if (primaryClientId) {
    normalizedRecipients.clientId = primaryClientId
  }

  const userIds = sanitizeIdList(recipients.userIds)
  if (userIds) {
    normalizedRecipients.userIds = userIds
  }

  if (!normalizedRecipients.roles.length) {
    normalizedRecipients.roles = ['team']
  }

  const payload = {
    ...rest,
    workspaceId,
    recipients: normalizedRecipients,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    readBy: [] as string[],
    acknowledgedBy: [] as string[],
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      await adminDb.collection('workspaces').doc(workspaceId).collection('notifications').add(payload)
      console.log(`[notifications] workspace notification created: ${rest.kind}`)
      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Check if it's a retryable Firestore error
      const errorCode = (error as { code?: string })?.code
      const retryableErrors = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted']

      if (retryableErrors.includes(errorCode ?? '') && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] Firestore write failed (${errorCode}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[notifications] failed to record workspace notification after all retries', lastError)
}

// =============================================================================
// WHATSAPP NOTIFICATIONS WITH RETRY
// =============================================================================

function sanitizeWhatsAppNumber(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null
  }
  const digits = input.replace(/\D+/g, '')
  if (digits.length < 8) {
    return null
  }
  return digits
}

interface WhatsAppSendResult {
  success: boolean
  to: string
  messageId?: string
  error?: NotificationError
}

async function sendWhatsAppMessage(to: string, body: string): Promise<WhatsAppSendResult> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.info('[notifications] whatsapp not configured, skipping send')
    return { success: false, to, error: new NotificationError({
      message: 'WhatsApp not configured',
      errorCode: NOTIFICATION_ERROR_CODES.WHATSAPP_NOT_CONFIGURED,
      channel: 'whatsapp',
    })}
  }

  const endpoint = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${encodeURIComponent(WHATSAPP_PHONE_NUMBER_ID)}/messages`

  let lastError: NotificationError | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: {
            body,
            preview_url: false,
          },
        }),
      })

      if (response.ok) {
        const result = await response.json().catch(() => ({})) as { messages?: Array<{ id?: string }> }
        const messageId = result.messages?.[0]?.id
        console.log(`[notifications] whatsapp message sent to ${to}${messageId ? ` (id: ${messageId})` : ''}`)
        return { success: true, to, messageId }
      }

      // Parse WhatsApp API error
      const errorPayload = await response.json().catch(() => ({})) as {
        error?: { code?: number; message?: string; error_subcode?: number }
      }

      // Check for rate limiting (code 4 or 80007)
      const isRateLimited = response.status === 429 ||
        errorPayload.error?.code === 4 ||
        errorPayload.error?.code === 80007

      if (isRateLimited) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
        const delayMs = retryAfter ?? calculateBackoffDelay(attempt) * 2 // WhatsApp needs longer delays

        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          console.warn(`[notifications] whatsapp rate limited for ${to}, retrying in ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        }

        lastError = new NotificationError({
          message: `WhatsApp rate limited: ${errorPayload.error?.message ?? 'Too many requests'}`,
          errorCode: NOTIFICATION_ERROR_CODES.WHATSAPP_RATE_LIMITED,
          httpStatus: response.status,
          channel: 'whatsapp',
          retryAfterMs: delayMs,
          metadata: { to, errorCode: errorPayload.error?.code },
        })
        break
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] whatsapp server error (${response.status}) for ${to}, retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      // Check for invalid token (190)
      if (errorPayload.error?.code === 190) {
        lastError = new NotificationError({
          message: 'WhatsApp access token is invalid or expired',
          errorCode: NOTIFICATION_ERROR_CODES.WHATSAPP_SEND_FAILED,
          httpStatus: response.status,
          channel: 'whatsapp',
          metadata: { to, errorCode: errorPayload.error.code },
        })
        break // Don't retry auth errors
      }

      lastError = new NotificationError({
        message: `WhatsApp send failed (${response.status}): ${errorPayload.error?.message ?? 'Unknown error'}`,
        errorCode: NOTIFICATION_ERROR_CODES.WHATSAPP_SEND_FAILED,
        httpStatus: response.status,
        channel: 'whatsapp',
        metadata: { to, errorCode: errorPayload.error?.code },
      })

      // Don't retry 4xx errors (except rate limits)
      if (response.status >= 400 && response.status < 500) {
        break
      }
    } catch (error) {
      const isAbortError = (error as Error)?.name === 'AbortError'

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] whatsapp ${isAbortError ? 'timed out' : 'network error'} for ${to}, retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      lastError = new NotificationError({
        message: `WhatsApp network error: ${(error as Error)?.message ?? 'Unknown error'}`,
        errorCode: isAbortError ? NOTIFICATION_ERROR_CODES.TIMEOUT : NOTIFICATION_ERROR_CODES.NETWORK_ERROR,
        channel: 'whatsapp',
        metadata: { to },
      })
    }
  }

  console.error(`[notifications] whatsapp send failed for ${to}`, lastError?.toJSON())
  return { success: false, to, error: lastError ?? undefined }
}

function formatTaskNotification(task: TaskRecord, actorName?: string | null): string | null {
  if (!task?.title) {
    return null
  }

  const assigned = task.assignedTo.length ? task.assignedTo.join(', ') : 'Unassigned'
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
  const segments = [
    `New task: "${task.title}"`,
    `Priority: ${task.priority}`,
    `Status: ${task.status}`,
    `Assigned: ${assigned}`,
    `Due: ${due}`,
  ]

  if (task.client) {
    segments.push(`Client: ${task.client}`)
  }

  if (actorName) {
    segments.push(`By: ${actorName}`)
  }

  return segments.join('\n')
}

function formatCollaborationNotification(message: CollaborationMessage, actorName?: string | null): string | null {
  if (!message?.content) {
    return null
  }

  const snippet = message.content.length > 280 ? `${message.content.slice(0, 277)}…` : message.content
  const channelLabel =
    message.channelType === 'client'
      ? message.clientId
        ? `Client channel (${message.clientId})`
        : 'Client channel'
      : message.channelType === 'project'
        ? message.projectId
          ? `Project channel (${message.projectId})`
          : 'Project channel'
        : 'Team channel'

  const segments = [
    `New collaboration message in ${channelLabel}`,
    `From: ${message.senderName}`,
    snippet,
  ]

  if (actorName) {
    segments.push(`Shared by: ${actorName}`)
  }

  return segments.join('\n')
}

interface WhatsAppDispatchResult {
  totalRecipients: number
  successCount: number
  failureCount: number
  errors: NotificationError[]
}

async function dispatchWorkspaceWhatsAppNotification(options: {
  workspaceId: string
  kind: WhatsAppNotificationKind
  body: string | null
}): Promise<WhatsAppDispatchResult> {
  const { workspaceId, kind, body } = options
  const result: WhatsAppDispatchResult = {
    totalRecipients: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
  }

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return result
  }

  if (!workspaceId || !body || body.trim().length === 0) {
    return result
  }

  const fieldPath = kind === 'task-created'
    ? 'notificationPreferences.whatsapp.tasks'
    : kind === 'invoice-sent' || kind === 'invoice-paid'
      ? 'notificationPreferences.whatsapp.billing'
      : 'notificationPreferences.whatsapp.collaboration'

  try {
    const snapshot = await adminDb
      .collection('users')
      .where('agencyId', '==', workspaceId)
      .where(fieldPath, '==', true)
      .limit(50)
      .get()

    if (snapshot.empty) {
      return result
    }

    const numbers = new Set<string>()
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const sanitized = sanitizeWhatsAppNumber(data.phoneNumber)
      if (sanitized) {
        numbers.add(sanitized)
      }
    })

    if (!numbers.size) {
      return result
    }

    result.totalRecipients = numbers.size

    // Send messages with controlled concurrency to avoid rate limits
    const numbersArray = Array.from(numbers)
    const BATCH_SIZE = 5
    const BATCH_DELAY_MS = 1000

    for (let i = 0; i < numbersArray.length; i += BATCH_SIZE) {
      const batch = numbersArray.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map((number) => sendWhatsAppMessage(number, body))
      )

      for (const sendResult of results) {
        if (sendResult.status === 'fulfilled') {
          if (sendResult.value.success) {
            result.successCount++
          } else {
            result.failureCount++
            if (sendResult.value.error) {
              result.errors.push(sendResult.value.error)
            }
          }
        } else {
          result.failureCount++
        }
      }

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < numbersArray.length) {
        await sleep(BATCH_DELAY_MS)
      }
    }

    console.log(`[notifications] whatsapp dispatch complete: ${result.successCount}/${result.totalRecipients} sent`)
  } catch (error) {
    console.error('[notifications] failed to resolve whatsapp recipients', error)
    result.errors.push(new NotificationError({
      message: `Failed to resolve recipients: ${(error as Error)?.message ?? 'Unknown error'}`,
      errorCode: NOTIFICATION_ERROR_CODES.FIRESTORE_WRITE_FAILED,
      channel: 'whatsapp',
    }))
  }

  return result
}

// =============================================================================
// HEALTH CHECK FUNCTIONS
// =============================================================================

export interface NotificationHealthStatus {
  email: { configured: boolean; healthy: boolean; error?: string }
  slack: { configured: boolean; healthy: boolean; error?: string }
  whatsapp: { configured: boolean; healthy: boolean; error?: string }
  firestore: { configured: boolean; healthy: boolean; error?: string }
}

export async function checkNotificationHealth(): Promise<NotificationHealthStatus> {
  const status: NotificationHealthStatus = {
    email: { configured: !!EMAIL_WEBHOOK_URL, healthy: false },
    slack: { configured: !!SLACK_WEBHOOK_URL, healthy: false },
    whatsapp: {
      configured: !!(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID),
      healthy: false,
    },
    firestore: { configured: true, healthy: false },
  }

  // Check Firestore connectivity
  try {
    const testDoc = await adminDb.collection('_health_check').doc('notifications').get()
    status.firestore.healthy = true
  } catch (error) {
    status.firestore.error = (error as Error)?.message ?? 'Connection failed'
  }

  // For webhooks, we can only verify configuration (not actual health without triggering)
  status.email.healthy = status.email.configured
  status.slack.healthy = status.slack.configured

  // For WhatsApp, verify the access token is present (full health check would require API call)
  if (status.whatsapp.configured) {
    status.whatsapp.healthy = true
  }

  return status
}

export async function notifyTaskCreatedWhatsApp(options: {
  workspaceId: string
  task: TaskRecord
  actorName?: string | null
}) {
  const body = formatTaskNotification(options.task, options.actorName)
  await dispatchWorkspaceWhatsAppNotification({ workspaceId: options.workspaceId, kind: 'task-created', body })
}

export async function notifyCollaborationMessageWhatsApp(options: {
  workspaceId: string
  message: CollaborationMessage
  actorName?: string | null
}) {
  const body = formatCollaborationNotification(options.message, options.actorName)
  await dispatchWorkspaceWhatsAppNotification({ workspaceId: options.workspaceId, kind: 'collaboration-message', body })
}

export async function notifyInvoiceSentWhatsApp(options: {
  workspaceId: string
  clientName: string
  amount: number
  currency: string
  invoiceNumber: string | null
  invoiceUrl: string | null
}) {
  const { workspaceId, clientName, amount, currency, invoiceNumber, invoiceUrl } = options

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const segments = [
    `Invoice Sent to ${clientName}`,
    `Amount: ${formattedAmount}`,
  ]

  if (invoiceNumber) {
    segments.push(`Invoice #: ${invoiceNumber}`)
  }

  if (invoiceUrl) {
    segments.push(`Pay here: ${invoiceUrl}`)
  }

  const body = segments.join('\n')
  await dispatchWorkspaceWhatsAppNotification({ workspaceId, kind: 'invoice-sent', body })
}

export async function notifyInvoicePaidWhatsApp(options: {
  workspaceId: string
  clientName: string
  amount: number
  currency: string
  invoiceNumber: string | null
}) {
  const { workspaceId, clientName, amount, currency, invoiceNumber } = options

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const segments = [
    `Invoice Paid by ${clientName}`,
    `Amount: ${formattedAmount}`,
  ]

  if (invoiceNumber) {
    segments.push(`Invoice #: ${invoiceNumber}`)
  }

  const body = segments.join('\n')
  await dispatchWorkspaceWhatsAppNotification({ workspaceId, kind: 'invoice-paid', body })
}

export async function recordTaskNotification(options: {
  workspaceId: string
  task: TaskRecord
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, task } = options
  if (!workspaceId || !task?.id) {
    return
  }

  const clientId = typeof task.clientId === 'string' && task.clientId.trim().length > 0 ? task.clientId.trim() : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const segments = [
    `Priority: ${task.priority}`,
    `Status: ${task.status}`,
  ]

  if (task.assignedTo?.length) {
    segments.push(`Assigned: ${task.assignedTo.join(', ')}`)
  }

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate)
    const formattedDue = Number.isNaN(dueDate.getTime()) ? task.dueDate : dueDate.toLocaleDateString()
    segments.push(`Due: ${formattedDue}`)
  }

  if (task.client) {
    segments.push(`Client: ${task.client}`)
  }

  await createWorkspaceNotification({
    workspaceId,
    kind: 'task.created',
    title: `Task created: ${task.title}`,
    body: segments.join(' · '),
    actor: {
      id: options.actorId ?? null,
      name: options.actorName ?? null,
    },
    resource: { type: 'task', id: task.id },
    recipients,
    metadata: {
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      assignedTo: task.assignedTo,
      clientId,
      clientName: task.client ?? null,
    },
  })
}

export async function recordCollaborationNotification(options: {
  workspaceId: string
  message: CollaborationMessage
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, message } = options
  if (!workspaceId || !message?.id) {
    return
  }

  const isClientChannel = message.channelType === 'client'
  const isProjectChannel = message.channelType === 'project'
  const clientId = (isClientChannel || isProjectChannel) && typeof message.clientId === 'string' && message.clientId.trim().length > 0
    ? message.clientId.trim()
    : null

  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const content = typeof message.content === 'string' ? message.content : ''
  const rawSnippet = content.length > 200 ? `${content.slice(0, 197)}…` : content
  const snippet = rawSnippet.trim().length > 0 ? rawSnippet : '(no message content)'
  const preview = message.senderName ? `${message.senderName}: ${snippet}` : snippet

  await createWorkspaceNotification({
    workspaceId,
    kind: 'collaboration.message',
    title: isClientChannel
      ? 'Client channel update'
      : isProjectChannel
        ? 'Project channel update'
        : 'New collaboration message',
    body: preview,
    actor: {
      id: options.actorId ?? message.senderId ?? null,
      name: options.actorName ?? message.senderName ?? null,
    },
    resource: { type: 'collaboration', id: message.id },
    recipients,
    metadata: {
      channelType: message.channelType,
      clientId,
      senderId: message.senderId ?? null,
      senderRole: message.senderRole ?? null,
      attachments: message.attachments?.map((attachment) => ({
        name: attachment.name,
        url: attachment.url,
        type: attachment.type ?? null,
        size: attachment.size ?? null,
      })) ?? [],
      projectId: isProjectChannel && typeof message.projectId === 'string' ? message.projectId : null,
    },
  })

  // Send mention notifications for each mentioned user
  if (message.mentions && message.mentions.length > 0) {
    await recordMentionNotifications({
      workspaceId,
      message,
      actorId: options.actorId ?? message.senderId ?? null,
      actorName: options.actorName ?? message.senderName ?? null,
    })
  }
}

export async function recordMentionNotifications(options: {
  workspaceId: string
  message: CollaborationMessage
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, message } = options
  if (!workspaceId || !message?.id || !message.mentions?.length) {
    return
  }

  const isClientChannel = message.channelType === 'client'
  const isProjectChannel = message.channelType === 'project'
  const clientId = (isClientChannel || isProjectChannel) && typeof message.clientId === 'string' && message.clientId.trim().length > 0
    ? message.clientId.trim()
    : null

  const content = typeof message.content === 'string' ? message.content : ''
  const rawSnippet = content.length > 150 ? `${content.slice(0, 147)}…` : content
  const snippet = rawSnippet.trim().length > 0 ? rawSnippet : '(no message content)'

  const senderName = options.actorName ?? message.senderName ?? 'Someone'

  // Create a notification for each mention
  for (const mention of message.mentions) {
    const mentionedName = mention.name

    await createWorkspaceNotification({
      workspaceId,
      kind: 'collaboration.mention',
      title: `${senderName} mentioned you`,
      body: snippet,
      actor: {
        id: options.actorId ?? null,
        name: senderName,
      },
      resource: { type: 'collaboration', id: message.id },
      recipients: {
        roles: ['admin', 'team', 'client'],
        clientIds: clientId ? [clientId] : undefined,
        clientId,
      },
      metadata: {
        channelType: message.channelType,
        clientId,
        senderId: message.senderId ?? null,
        senderName: message.senderName ?? null,
        mentionedName,
        mentionSlug: mention.slug,
        projectId: isProjectChannel && typeof message.projectId === 'string' ? message.projectId : null,
      },
    })
  }
}

export async function recordProposalDeckReadyNotification(options: {
  workspaceId: string
  proposalId: string
  proposalTitle?: string | null
  clientId?: string | null
  clientName?: string | null
  storageUrl?: string | null
}) {
  const { workspaceId, proposalId } = options
  if (!workspaceId || !proposalId) {
    return
  }

  const proposalTitle = typeof options.proposalTitle === 'string' && options.proposalTitle.trim().length > 0
    ? options.proposalTitle.trim()
    : null
  const clientName = typeof options.clientName === 'string' && options.clientName.trim().length > 0
    ? options.clientName.trim()
    : null
  const clientId = typeof options.clientId === 'string' && options.clientId.trim().length > 0
    ? options.clientId.trim()
    : null

  const title = proposalTitle ? `Presentation ready: ${proposalTitle}` : 'Presentation ready'

  const details: string[] = []
  if (clientName) {
    details.push(`Client: ${clientName}`)
  }
  details.push('Your Gamma presentation is ready to download.')
  if (options.storageUrl) {
    details.push('Stored in Firebase Storage for quick access.')
  }

  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? ['admin', 'team', 'client'] : ['admin', 'team'],
    clientIds: clientId ? [clientId] : undefined,
    clientId: clientId ?? undefined,
  }

  await createWorkspaceNotification({
    workspaceId,
    kind: 'proposal.deck.ready',
    title,
    body: details.join(' · '),
    actor: {
      id: null,
      name: null,
    },
    resource: { type: 'proposal', id: proposalId },
    recipients,
    metadata: {
      proposalId,
      proposalTitle: proposalTitle ?? null,
      clientId: clientId ?? null,
      clientName: clientName ?? null,
      storageUrl: options.storageUrl ?? null,
    },
  })
}

export async function recordInvoiceSentNotification(options: {
  workspaceId: string
  invoiceId: string
  clientId: string
  clientName: string
  amount: number
  currency: string
  invoiceNumber: string | null
  actorId: string
}) {
  const { workspaceId, invoiceId, clientId, clientName, amount, currency, invoiceNumber, actorId } = options

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const title = `Invoice sent: ${clientName}`
  const body = `Amount: ${formattedAmount}${invoiceNumber ? ` · #${invoiceNumber}` : ''}`

  await createWorkspaceNotification({
    workspaceId,
    kind: 'invoice.sent',
    title,
    body,
    actor: { id: actorId, name: 'Admin' },
    resource: { type: 'invoice', id: invoiceId },
    recipients: {
      roles: ['admin', 'team', 'client'],
      clientIds: [clientId],
      clientId,
    },
    metadata: {
      amount,
      currency,
      invoiceNumber,
      clientId,
      clientName,
    },
  })
}

export async function recordInvoicePaidNotification(options: {
  workspaceId: string
  invoiceId: string
  clientId: string
  clientName: string
  amount: number
  currency: string
  invoiceNumber: string | null
}) {
  const { workspaceId, invoiceId, clientId, clientName, amount, currency, invoiceNumber } = options

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const title = `Invoice paid: ${clientName}`
  const body = `Received ${formattedAmount}${invoiceNumber ? ` · #${invoiceNumber}` : ''}`

  await createWorkspaceNotification({
    workspaceId,
    kind: 'invoice.paid',
    title,
    body,
    actor: { id: null, name: 'Stripe' },
    resource: { type: 'invoice', id: invoiceId },
    recipients: {
      roles: ['admin', 'team'],
      clientIds: [clientId],
      clientId,
    },
    metadata: {
      amount,
      currency,
      invoiceNumber,
      clientId,
      clientName,
    },
  })
}

export async function recordTaskUpdatedNotification(options: {
  workspaceId: string
  task: TaskRecord
  changes: string[]
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, task, changes } = options
  if (!workspaceId || !task?.id || changes.length === 0) {
    return
  }

  const clientId = typeof task.clientId === 'string' && task.clientId.trim().length > 0 ? task.clientId.trim() : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const body = changes.join(' · ')

  await createWorkspaceNotification({
    workspaceId,
    kind: 'task.updated',
    title: `Task updated: ${task.title}`,
    body,
    actor: {
      id: options.actorId ?? null,
      name: options.actorName ?? null,
    },
    resource: { type: 'task', id: task.id },
    recipients,
    metadata: {
      status: task.status,
      priority: task.priority,
      clientId,
      clientName: task.client ?? null,
      changes,
    },
  })
}

export async function recordProjectCreatedNotification(options: {
  workspaceId: string
  project: ProjectRecord
  actorId?: string | null
  actorName?: string | null
}) {
  const { workspaceId, project } = options
  if (!workspaceId || !project?.id) {
    return
  }

  const clientId = typeof project.clientId === 'string' && project.clientId.trim().length > 0 ? project.clientId.trim() : null
  const baseRoles: WorkspaceNotificationRole[] = ['admin', 'team']
  const recipients: WorkspaceNotificationRecipients = {
    roles: clientId ? uniqueRoles([...baseRoles, 'client']) : baseRoles,
    clientIds: clientId ? [clientId] : undefined,
    clientId,
  }

  const segments = [
    `Status: ${project.status}`,
  ]

  if (project.startDate) {
    const startDate = new Date(project.startDate)
    const formattedStart = Number.isNaN(startDate.getTime()) ? project.startDate : startDate.toLocaleDateString()
    segments.push(`Start: ${formattedStart}`)
  }

  if (project.clientName) {
    segments.push(`Client: ${project.clientName}`)
  }

  await createWorkspaceNotification({
    workspaceId,
    kind: 'project.created',
    title: `New project: ${project.name}`,
    body: segments.join(' · '),
    actor: {
      id: options.actorId ?? null,
      name: options.actorName ?? null,
    },
    resource: { type: 'project', id: project.id },
    recipients,
    metadata: {
      status: project.status,
      clientId,
      clientName: project.clientName ?? null,
    },
  })
}
