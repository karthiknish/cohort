// WhatsApp notification functions

import { ConvexHttpClient } from 'convex/browser'

import { internal } from '../../../convex/_generated/api'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'

import { NotificationError, NOTIFICATION_ERROR_CODES } from './errors'
import {
  WHATSAPP_API_VERSION,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  RETRY_CONFIG,
  sleep,
  calculateBackoffDelay,
  parseRetryAfter,
  fetchWithTimeout,
  sanitizeWhatsAppNumber,
} from './config'
import type { WhatsAppNotificationKind, WhatsAppSendResult, WhatsAppDispatchResult } from './types'

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN
  if (!url || !deployKey) return null
  _convexClient = new ConvexHttpClient(url)
  ;(_convexClient as any).setAdminAuth(deployKey, {
    issuer: 'system',
    subject: 'notification-service',
  })
  return _convexClient
}

// =============================================================================
// SEND WHATSAPP MESSAGE
// =============================================================================

async function sendWhatsAppMessage(to: string, body: string): Promise<WhatsAppSendResult> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.info('[notifications] whatsapp not configured, skipping send')
    return {
      success: false,
      to,
      error: new NotificationError({
        message: 'WhatsApp not configured',
        errorCode: NOTIFICATION_ERROR_CODES.WHATSAPP_NOT_CONFIGURED,
        channel: 'whatsapp',
      }),
    }
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
        const result = (await response.json().catch(() => ({}))) as {
          messages?: Array<{ id?: string }>
        }
        const messageId = result.messages?.[0]?.id
        console.log(
          `[notifications] whatsapp message sent to ${to}${messageId ? ` (id: ${messageId})` : ''}`
        )
        return { success: true, to, messageId }
      }

      // Parse WhatsApp API error
      const errorPayload = (await response.json().catch(() => ({}))) as {
        error?: { code?: number; message?: string; error_subcode?: number }
      }

      // Check for rate limiting (code 4 or 80007)
      const isRateLimited =
        response.status === 429 ||
        errorPayload.error?.code === 4 ||
        errorPayload.error?.code === 80007

      if (isRateLimited) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
        const delayMs = retryAfter ?? calculateBackoffDelay(attempt) * 2 // WhatsApp needs longer delays

        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          console.warn(
            `[notifications] whatsapp rate limited for ${to}, retrying in ${delayMs}ms...`
          )
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
        console.warn(
          `[notifications] whatsapp server error (${response.status}) for ${to}, retrying...`
        )
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
        console.warn(
          `[notifications] whatsapp ${isAbortError ? 'timed out' : 'network error'} for ${to}, retrying...`
        )
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      lastError = new NotificationError({
        message: `WhatsApp network error: ${(error as Error)?.message ?? 'Unknown error'}`,
        errorCode: isAbortError
          ? NOTIFICATION_ERROR_CODES.TIMEOUT
          : NOTIFICATION_ERROR_CODES.NETWORK_ERROR,
        channel: 'whatsapp',
        metadata: { to },
      })
    }
  }

  console.error(`[notifications] whatsapp send failed for ${to}`, lastError?.toJSON())
  return { success: false, to, error: lastError ?? undefined }
}

// =============================================================================
// MESSAGE FORMATTERS
// =============================================================================

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

function formatCollaborationNotification(
  message: CollaborationMessage,
  actorName?: string | null
): string | null {
  if (!message?.content) {
    return null
  }

  const snippet =
    message.content.length > 280 ? `${message.content.slice(0, 277)}…` : message.content
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

// =============================================================================
// DISPATCH WHATSAPP NOTIFICATIONS
// =============================================================================

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

  // Map notification kind to preference type
  const notificationType: 'tasks' | 'collaboration' | 'billing' =
    kind === 'task-created'
      ? 'tasks'
      : kind === 'invoice-sent' || kind === 'invoice-paid'
        ? 'billing'
        : 'collaboration'

  try {
    const convex = getConvexClient()
    if (!convex) {
      console.warn('[notifications] convex client not available, skipping whatsapp dispatch')
      return result
    }

    const queryResult = await convex.query(internal.users.getWhatsAppRecipientsForWorkspace as any, {
      workspaceId,
      notificationType,
    })

    if (!queryResult.phoneNumbers.length) {
      return result
    }

    const numbers = new Set<string>()
    for (const phoneNumber of queryResult.phoneNumbers) {
      const sanitized = sanitizeWhatsAppNumber(phoneNumber)
      if (sanitized) {
        numbers.add(sanitized)
      }
    }

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

    console.log(
      `[notifications] whatsapp dispatch complete: ${result.successCount}/${result.totalRecipients} sent`
    )
  } catch (error) {
    console.error('[notifications] failed to resolve whatsapp recipients', error)
    result.errors.push(
      new NotificationError({
        message: `Failed to resolve recipients: ${(error as Error)?.message ?? 'Unknown error'}`,
        errorCode: NOTIFICATION_ERROR_CODES.CONVEX_QUERY_FAILED,
        channel: 'whatsapp',
      })
    )
  }

  return result
}

// =============================================================================
// EXPORTED WHATSAPP NOTIFICATION FUNCTIONS
// =============================================================================

export async function notifyTaskCreatedWhatsApp(options: {
  workspaceId: string
  task: TaskRecord
  actorName?: string | null
}) {
  const body = formatTaskNotification(options.task, options.actorName)
  await dispatchWorkspaceWhatsAppNotification({
    workspaceId: options.workspaceId,
    kind: 'task-created',
    body,
  })
}

export async function notifyCollaborationMessageWhatsApp(options: {
  workspaceId: string
  message: CollaborationMessage
  actorName?: string | null
}) {
  const body = formatCollaborationNotification(options.message, options.actorName)
  await dispatchWorkspaceWhatsAppNotification({
    workspaceId: options.workspaceId,
    kind: 'collaboration-message',
    body,
  })
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

  const segments = [`Invoice Sent to ${clientName}`, `Amount: ${formattedAmount}`]

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

  const segments = [`Invoice Paid by ${clientName}`, `Amount: ${formattedAmount}`]

  if (invoiceNumber) {
    segments.push(`Invoice #: ${invoiceNumber}`)
  }

  const body = segments.join('\n')
  await dispatchWorkspaceWhatsAppNotification({ workspaceId, kind: 'invoice-paid', body })
}
