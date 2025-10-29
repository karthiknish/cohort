import { NextRequest, NextResponse } from 'next/server'

import { chatbotService } from '@/services/chatbot'
import { ChatbotGenerateRequest } from '@/types/chatbot'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatbotGenerateRequest | null

    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await chatbotService.generateResponse(body.message.trim(), {
      conversation: Array.isArray(body.conversation) ? body.conversation : undefined,
      context: typeof body.context === 'object' && body.context !== null ? body.context : undefined,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[api/chatbot] error', error)
    const message = error instanceof Error ? error.message : 'Failed to contact Cohorts AI assistant.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
