/**
 * API Route for sending Email notifications
 * POST /api/integrations/email/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/server-auth'
import { z } from 'zod'

const sendMessageSchema = z.object({
  messageType: z.enum(['task', 'collaboration', 'custom']).default('custom'),
  text: z.string().min(1),
  metadata: z.object({
    taskTitle: z.string().optional(),
    taskDescription: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    senderName: z.string().optional(),
    conversationUrl: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = sendMessageSchema.parse(body)

    // Get email webhook URL from environment
    const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL

    if (!emailWebhookUrl) {
      return NextResponse.json(
        { error: 'Email not configured', code: 'EMAIL_NOT_CONFIGURED' },
        { status: 400 }
      )
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
          ${validated.metadata?.conversationUrl ? `<p><a href="${validated.metadata.conversationUrl}">View in Dashboard</a></p>` : ''}
        `
        break

      default:
        emailSubject = 'Notification from Cohorts'
        emailBody = `<p>${validated.text}</p>`
    }

    // Send email via webhook
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
      throw new Error(`Email webhook failed: ${errorText}`)
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[Email API] Error sending message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
