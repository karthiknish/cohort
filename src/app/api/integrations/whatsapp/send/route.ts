/**
 * API Route for sending WhatsApp messages
 * POST /api/integrations/whatsapp/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/server-auth'
import { WhatsAppClient } from '@/services/integrations/whatsapp/client'
import { z } from 'zod'

const sendMessageSchema = z.object({
  to: z.string().min(1),
  text: z.string().min(1),
  messageType: z.enum(['task', 'collaboration', 'custom']).default('custom'),
  metadata: z.object({
    taskTitle: z.string().optional(),
    taskDescription: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    senderName: z.string().optional(),
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

    // Get credentials from environment
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: 'WhatsApp not configured', code: 'WHATSAPP_NOT_CONFIGURED' },
        { status: 400 }
      )
    }

    const whatsapp = new WhatsAppClient({ accessToken, phoneNumberId })

    let result

    switch (validated.messageType) {
      case 'task':
        result = await whatsapp.sendTaskNotification({
          to: validated.to,
          taskTitle: validated.metadata?.taskTitle || 'New Task',
          taskDescription: validated.metadata?.taskDescription,
          assignedTo: validated.metadata?.assignedTo,
          dueDate: validated.metadata?.dueDate,
        })
        break

      case 'collaboration':
        result = await whatsapp.sendCollaborationNotification({
          to: validated.to,
          senderName: validated.metadata?.senderName || 'Someone',
          message: validated.text,
        })
        break

      default:
        result = await whatsapp.sendMessage({
          to: validated.to,
          text: validated.text,
        })
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[WhatsApp API] Error sending message:', error)

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
