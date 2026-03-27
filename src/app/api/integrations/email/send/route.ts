/**
 * API Route for sending Email notifications
 * POST /api/integrations/email/send
 */

import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError } from '@/lib/api-errors'

const sendMessageSchema = z.object({
  messageType: z.enum(['task', 'collaboration', 'custom']).default('custom'),
  text: z.string().min(1),
  metadata: z
    .object({
      taskTitle: z.string().optional(),
      taskDescription: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      senderName: z.string().optional(),
      conversationUrl: z.string().optional(),
    })
    .optional(),
})

export const POST = createApiHandler(
  {
    auth: 'required',
    bodySchema: sendMessageSchema,
    rateLimit: 'sensitive',
    skipIdempotency: true,
  },
  async (_request, { body }) => {
    const validated = body
    const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL

    if (!emailWebhookUrl) {
      throw new ServiceUnavailableError('Email delivery is not configured')
    }

    let emailSubject: string
    let emailBody: string

    switch (validated.messageType) {
      case 'task':
        emailSubject = `New Task: ${validated.metadata?.taskTitle || 'Assigned to You'}`
        emailBody = `
          <h2>New Task Assigned</h2>
          <p><strong>Title:</strong> ${validated.metadata?.taskTitle || 'N/A'}</p>
          <p><strong>Description:</strong> ${validated.metadata?.taskDescription || 'N/A'}</p>
          <p><strong>Assigned To:</strong> ${validated.metadata?.assignedTo || 'N/A'}</p>
          <p><strong>Due Date:</strong> ${validated.metadata?.dueDate || 'N/A'}</p>
        `
        break

      case 'collaboration':
        emailSubject = `New Collaboration Message from ${validated.metadata?.senderName || 'Team Member'}`
        emailBody = `
          <h2>New Collaboration Message</h2>
          <p><strong>From:</strong> ${validated.metadata?.senderName || 'Someone'}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0;">
            ${validated.text}
          </blockquote>
          ${
            validated.metadata?.conversationUrl
              ? `<p><a href="${validated.metadata.conversationUrl}">View in Dashboard</a></p>`
              : ''
          }
        `
        break

      default:
        emailSubject = 'Notification from Cohorts'
        emailBody = `<p>${validated.text}</p>`
    }

    const response = await fetch(emailWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email.notification',
        payload: {
          subject: emailSubject,
          body: emailBody,
          text: validated.text,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new ServiceUnavailableError(`Email webhook failed: ${errorText}`)
    }

    return {
      success: true,
      data: { sent: true },
    }
  }
)
