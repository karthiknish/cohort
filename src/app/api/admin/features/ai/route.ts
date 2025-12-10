 import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'
import { geminiAI } from '@/services/gemini'

const requestSchema = z.object({
  field: z.enum(['title', 'description']),
  context: z.object({
    currentTitle: z.string().optional(),
    currentDescription: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const body = await request.json().catch(() => null)
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { field, context } = parsed.data

    let prompt: string
    let result: string

    if (field === 'title') {
      prompt = `Generate a concise, professional feature title for a software development project. 
The title should be:
- Clear and descriptive (3-6 words)
- Action-oriented or feature-focused
- Professional and suitable for a Kanban board

${context?.currentDescription ? `Context/Description: ${context.currentDescription}` : ''}
${context?.priority ? `Priority: ${context.priority}` : ''}

Return ONLY the title, nothing else. No quotes, no explanation.`
    } else {
      prompt = `Generate a clear, professional feature description for a software development project.
The description should be:
- 2-3 sentences maximum
- Explain what the feature does and its value
- Be specific and actionable
- Suitable for a development team to understand

${context?.currentTitle ? `Feature Title: ${context.currentTitle}` : ''}
${context?.priority ? `Priority: ${context.priority}` : ''}
${context?.status ? `Status: ${context.status}` : ''}

Return ONLY the description, nothing else. No quotes, no preamble.`
    }

    result = await geminiAI.generateContent(prompt)

    // Clean up the result
    result = result.trim()
    if (result.startsWith('"') && result.endsWith('"')) {
      result = result.slice(1, -1)
    }

    return NextResponse.json({ [field]: result })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/features/ai] generation failed', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
