import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { AuthenticationError } from '@/lib/server-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { chatbotService } from '@/services/chatbot'
import { createApiHandler } from '@/lib/api-handler'

const chatbotSchema = z.object({
  message: z.string().min(1),
  conversation: z.array(z.any()).optional(),
  context: z.record(z.string(), z.any()).optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: chatbotSchema,
  },
  async (req, { auth, body }) => {
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
          },
        }
      )
    }

    const response = await chatbotService.generateResponse(body.message.trim(), {
      conversation: body.conversation,
      context: body.context,
    })

    return response
  }
)
