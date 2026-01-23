/**
 * Brevo (formerly Sendinblue) Email Notification Service
 *
 * Sends transactional emails for important platform activities.
 */

import { cache } from 'react'
import * as Brevo from '@getbrevo/brevo'
import { ConvexHttpClient } from 'convex/browser'

import { internal } from '@/../convex/_generated/api'
import { RETRY_CONFIG, sleep, calculateBackoffDelay } from './config'
import {
  invoicePaidTemplate,
  invoiceSentTemplate,
  projectCreatedTemplate,
  taskAssignedTemplate,
  mentionTemplate,
  proposalReadyTemplate,
  integrationAlertTemplate,
  workspaceInviteTemplate,
  performanceDigestTemplate,
  taskActivityTemplate,
  invoicePaymentFailedTemplate,
} from './email-templates'
import type { IntegrationAlertTemplateParams, WorkspaceInviteTemplateParams, PerformanceDigestTemplateParams, TaskActivityTemplateParams, InvoicePaymentFailedTemplateParams } from './email-templates'

// =============================================================================
// CONFIGURATION
// =============================================================================

export const BREVO_API_KEY = process.env.BREVO_API_KEY
export const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? 'notifications@cohorts.app'
export const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? 'Cohorts'

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
// TYPES
// =============================================================================

export interface BrevoEmailResult {
  success: boolean
  messageId?: string
  error?: Error
}

export interface BrevoSendOptions {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: { email: string; name?: string }
  tags?: string[]
}

// =============================================================================
// API CLIENT SETUP
// =============================================================================

function getBrevoClient(): Brevo.TransactionalEmailsApi | null {
  if (!BREVO_API_KEY) {
    console.warn('[brevo] BREVO_API_KEY not configured')
    return null
  }

  const apiInstance = new Brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY)
  return apiInstance
}

const fetchNotificationPreferences = cache(async (convex: ConvexHttpClient, email: string) => {
  return await convex.query(internal.users.getNotificationPreferencesByEmail as any, { email })
})

/**
 * Check if a user has enabled a specific email notification type.
 * Returns true if enabled or if no preference is set (defaults to true).
 */
async function isEmailNotificationEnabled(recipientEmail: string, prefKey: 'adAlerts' | 'performanceDigest' | 'taskActivity'): Promise<boolean> {
  try {
    const convex = getConvexClient()
    if (!convex) return true // Default to true if Convex unavailable

    const result = await fetchNotificationPreferences(convex, recipientEmail)
    
    if (!result || !result.notificationPreferences) return true

    // Map prefKey to notification preference field names
    const keyMap: Record<string, keyof typeof result.notificationPreferences> = {
      'adAlerts': 'emailAdAlerts',
      'performanceDigest': 'emailPerformanceDigest',
      'taskActivity': 'emailTaskActivity',
    }
    
    const actualKey = keyMap[prefKey]
    if (!actualKey) return true
    
    return result.notificationPreferences[actualKey] !== false
  } catch (error) {
    console.error('[brevo] error checking preferences', error)
    return true // Default to true on error to ensure critical emails are sent
  }
}

// =============================================================================
// CORE SEND FUNCTION WITH RETRY
// =============================================================================

export async function sendTransactionalEmail(options: BrevoSendOptions): Promise<BrevoEmailResult> {
  const client = getBrevoClient()
  if (!client) {
    return { success: false, error: new Error('Brevo not configured') }
  }

  const sendSmtpEmail = new Brevo.SendSmtpEmail()
  sendSmtpEmail.sender = { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME }
  sendSmtpEmail.to = options.to
  sendSmtpEmail.subject = options.subject
  sendSmtpEmail.htmlContent = options.htmlContent
  if (options.textContent) {
    sendSmtpEmail.textContent = options.textContent
  }
  if (options.replyTo) {
    sendSmtpEmail.replyTo = options.replyTo
  }
  if (options.tags) {
    sendSmtpEmail.tags = options.tags
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await client.sendTransacEmail(sendSmtpEmail)
      console.log(`[brevo] email sent successfully: ${options.subject}`)
      return {
        success: true,
        messageId: result.body?.messageId,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown Brevo error')

      // Check if retryable (rate limit, server error)
      const statusCode = (error as { status?: number })?.status
      const retryable = statusCode === 429 || (statusCode && statusCode >= 500)

      if (retryable && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[brevo] send failed (${statusCode}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[brevo] failed to send email after all retries', lastError)
  return { success: false, error: lastError ?? undefined }
}

// =============================================================================
// NOTIFICATION FUNCTIONS
// =============================================================================

export async function notifyInvoicePaidEmail(options: {
  recipientEmail: string
  recipientName?: string
  clientName: string
  amount: string
  invoiceNumber: string | null
  paidAt: string
}): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, clientName, amount, invoiceNumber, paidAt } = options

  const subject = `💰 Payment received: ${amount} from ${clientName}`
  const htmlContent = invoicePaidTemplate({ clientName, amount, invoiceNumber, paidAt })

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['invoice-paid'],
  })
}

export async function notifyInvoiceSentEmail(options: {
  recipientEmail: string
  recipientName?: string
  clientName: string
  amount: string
  invoiceNumber: string | null
  dueDate: string | null
  invoiceUrl: string | null
}): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, clientName, amount, invoiceNumber, dueDate, invoiceUrl } = options

  const subject = `📄 Invoice sent to ${clientName}: ${amount}`
  const htmlContent = invoiceSentTemplate({ clientName, amount, invoiceNumber, dueDate, invoiceUrl })

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['invoice-sent'],
  })
}

export async function notifyProjectCreatedEmail(options: {
  recipientEmail: string
  recipientName?: string
  projectName: string
  clientName: string | null
  createdBy: string | null
}): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, projectName, clientName, createdBy } = options

  const subject = `🚀 New project: ${projectName}`
  const htmlContent = projectCreatedTemplate({ projectName, clientName, createdBy })

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['project-created'],
  })
}

export async function notifyTaskAssignedEmail(options: {
  recipientEmail: string
  recipientName?: string
  taskTitle: string
  priority: string
  dueDate: string | null
  assignedBy: string | null
  clientName: string | null
}): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, taskTitle, priority, dueDate, assignedBy, clientName } = options

  if (!(await isEmailNotificationEnabled(recipientEmail, 'taskActivity'))) {
    return { success: true }
  }

  const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'
  const subject = `${priorityEmoji} Task assigned: ${taskTitle}`
  const htmlContent = taskAssignedTemplate({ taskTitle, priority, dueDate, assignedBy, clientName })

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['task-assigned'],
  })
}

export async function notifyMentionEmail(options: {
  recipientEmail: string
  recipientName?: string
  mentionedBy: string
  messageSnippet: string
  channelType: string
  clientName: string | null
}): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, mentionedBy, messageSnippet, channelType, clientName } = options

  if (!(await isEmailNotificationEnabled(recipientEmail, 'taskActivity'))) {
    return { success: true }
  }

  const subject = `💬 ${mentionedBy} mentioned you`
  const htmlContent = mentionTemplate({ mentionedBy, messageSnippet, channelType, clientName })

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['mention'],
  })
}

export async function notifyProposalReadyEmail(options: {
  recipientEmail: string
  recipientName?: string
  proposalTitle: string
  clientName: string | null
  downloadUrl: string | null
}): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, proposalTitle, clientName, downloadUrl } = options

  const subject = `✨ Presentation ready: ${proposalTitle}`
  const htmlContent = proposalReadyTemplate({ proposalTitle, clientName, downloadUrl })

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['proposal-ready'],
  })
}

export async function notifyIntegrationAlertEmail(options: {
  recipientEmail: string
  recipientName?: string
} & IntegrationAlertTemplateParams): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, ...params } = options

  if (!(await isEmailNotificationEnabled(recipientEmail, 'adAlerts'))) {
    return { success: true }
  }

  const subject = `🚨 Action Required: ${params.providerId.toUpperCase()} Connection issue`
  const htmlContent = integrationAlertTemplate(params)

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['integration-alert'],
  })
}

export async function notifyWorkspaceInviteEmail(options: {
  recipientEmail: string
  recipientName?: string
} & WorkspaceInviteTemplateParams): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, ...params } = options

  const subject = `🚀 You've been invited to ${params.workspaceName}`
  const htmlContent = workspaceInviteTemplate(params)

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['workspace-invite'],
  })
}

export async function notifyPerformanceDigestEmail(options: {
  recipientEmail: string
  recipientName?: string
} & PerformanceDigestTemplateParams): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, ...params } = options

  if (!(await isEmailNotificationEnabled(recipientEmail, 'performanceDigest'))) {
    return { success: true }
  }

  const subject = `📈 Performance Summary: ${params.workspaceName}`
  const htmlContent = performanceDigestTemplate(params)

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['performance-digest'],
  })
}

export async function notifyTaskActivityEmail(options: {
  recipientEmail: string
  recipientName?: string
} & TaskActivityTemplateParams): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, ...params } = options

  if (!(await isEmailNotificationEnabled(recipientEmail, 'taskActivity'))) {
    return { success: true }
  }

  const subject = `📝 Task ${params.action}: ${params.taskTitle}`
  const htmlContent = taskActivityTemplate(params)

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['task-activity'],
  })
}

export async function notifyInvoicePaymentFailedEmail(options: {
  recipientEmail: string
  recipientName?: string
} & InvoicePaymentFailedTemplateParams): Promise<BrevoEmailResult> {
  const { recipientEmail, recipientName, ...params } = options

  const subject = `⚠️ Payment failed for ${params.clientName}`
  const htmlContent = invoicePaymentFailedTemplate(params)

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent,
    tags: ['invoice-failed'],
  })
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export async function checkBrevoHealth(): Promise<{ configured: boolean; healthy: boolean; error?: string }> {
  if (!BREVO_API_KEY) {
    return { configured: false, healthy: false, error: 'BREVO_API_KEY not set' }
  }

  try {
    const client = getBrevoClient()
    if (!client) {
      return { configured: false, healthy: false, error: 'Failed to initialize client' }
    }

    // Attempt to get account info as a health check
    const accountApi = new Brevo.AccountApi()
    accountApi.setApiKey(Brevo.AccountApiApiKeys.apiKey, BREVO_API_KEY)
    await accountApi.getAccount()

    return { configured: true, healthy: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { configured: true, healthy: false, error: message }
  }
}
