/**
 * API Route for sending Slack messages
 * POST /api/integrations/slack/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/server-auth'
import { SlackClient } from '@/services/integrations/slack/client'
import { z } from 'zod'

const sendMessageSchema = z.object({
  channel: z.string().min(1),
  text: z.string().min(1),
  webhookUrl: z.string().url().optional(),
  botToken: z.string().optional(),
  messageType: z.enum(['task', 'collaboration', 'custom']).default('custom'),
  metadata: z.object({
    taskTitle: z.string().optional(),
    taskDescription: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    taskUrl: z.string().optional(),
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

    // Get credentials from environment or request
    const botToken = validated.botToken || process.env.SLACK_BOT_TOKEN
    const webhookUrl = validated.webhookUrl || process.env.SLACK_WEBHOOK_URL

    if (!botToken && !webhookUrl) {
      return NextResponse.json(
        { error: 'Slack not configured', code: 'SLACK_NOT_CONFIGURED' },
        { status: 400 }
      )
    }

    const slack = new SlackClient({ botToken, webhookUrl })

    let result: { ts?: string; channel?: string } = {}

    switch (validated.messageType) {
      case 'task':
        await slack.sendTaskNotification({
          channel: validated.channel,
          taskTitle: validated.metadata?.taskTitle || 'New Task',
          taskDescription: validated.metadata?.taskDescription,
          assignedTo: validated.metadata?.assignedTo,
          dueDate: validated.metadata?.dueDate,
          taskUrl: validated.metadata?.taskUrl,
        })
        break

      case 'collaboration':
        await slack.sendCollaborationNotification({
          channel: validated.channel,
          senderName: validated.metadata?.senderName || 'Someone',
          message: validated.text,
          conversationUrl: validated.metadata?.conversationUrl,
        })
        break

      default:
        if (webhookUrl) {
          await slack.sendWebhookMessage({ text: validated.text })
        } else {
          const response = await slack.sendMessage({
            channel: validated.channel,
            text: validated.text,
          })
          result = response
        }
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[Slack API] Error sending message:', error)

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
