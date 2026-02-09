/**
 * API Route for sending Teams messages
 * POST /api/integrations/teams/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/server-auth'
import { TeamsClient } from '@/services/integrations/teams/client'
import { z } from 'zod'

const sendMessageSchema = z.object({
  webhookUrl: z.string().url().optional(),
  messageType: z.enum(['task', 'collaboration', 'custom']).default('custom'),
  text: z.string().min(1),
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
    const webhookUrl = validated.webhookUrl || process.env.TEAMS_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Teams not configured', code: 'TEAMS_NOT_CONFIGURED' },
        { status: 400 }
      )
    }

    const teams = new TeamsClient({ webhookUrl })

    switch (validated.messageType) {
      case 'task':
        await teams.sendTaskNotification({
          taskTitle: validated.metadata?.taskTitle || 'New Task',
          taskDescription: validated.metadata?.taskDescription,
          assignedTo: validated.metadata?.assignedTo,
          dueDate: validated.metadata?.dueDate,
          taskUrl: validated.metadata?.taskUrl,
        })
        break

      case 'collaboration':
        await teams.sendCollaborationNotification({
          senderName: validated.metadata?.senderName || 'Someone',
          message: validated.text,
          conversationUrl: validated.metadata?.conversationUrl,
        })
        break

      default:
        await teams.sendWebhookMessage({
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                type: 'AdaptiveCard',
                version: '1.4',
                $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                body: [
                  {
                    type: 'TextBlock',
                    text: validated.text,
                    wrap: true,
                  },
                ],
              },
            },
          ],
        })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[Teams API] Error sending message:', error)

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
