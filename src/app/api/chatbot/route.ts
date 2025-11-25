import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { chatbotService } from '@/services/chatbot'
import { ChatbotGenerateRequest } from '@/types/chatbot'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    // Rate limit: 10 requests per 10 seconds per user
    const rateLimitResult = await checkRateLimit(`chatbot:${auth.uid}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          }
        }
      )
    }

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
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[api/chatbot] error', error)
    const message = error instanceof Error ? error.message : 'Failed to contact Cohorts AI assistant.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
