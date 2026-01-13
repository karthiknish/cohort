import { action } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireAdmin(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const role = (identity as any).role
  if (role !== 'admin') {
    throw Errors.auth.adminRequired()
  }
}

function buildPrompt(args: {
  field: 'title' | 'description'
  context?: {
    currentTitle?: string
    currentDescription?: string
    status?: string
    priority?: string
  }
}) {
  const { field, context } = args

  if (field === 'title') {
    return `Generate a concise, professional feature title for a software development project. 
The title should be:
- Clear and descriptive (3-6 words)
- Action-oriented or feature-focused
- Professional and suitable for a Kanban board

${context?.currentDescription ? `Context/Description: ${context.currentDescription}` : ''}
${context?.priority ? `Priority: ${context.priority}` : ''}

Return ONLY the title, nothing else. No quotes, no explanation.`
  }

  return `Generate a clear, professional feature description for a software development project.
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

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw Errors.integration.notConfigured('Gemini', 'GEMINI_API_KEY (or GOOGLE_API_KEY) is not configured')
  }

  const model = (process.env.GEMINI_MODEL?.trim() || 'gemini-3-flash-preview').trim()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw Errors.base.internal(`Gemini API error ${response.status}: ${details}`)
  }

  const payload = (await response.json()) as any
  const candidate = payload?.candidates?.[0]
  const parts = candidate?.content?.parts

  const text = Array.isArray(parts)
    ? parts
        .map((part: any) => {
          if (typeof part === 'string') return part
          if (part && typeof part === 'object' && typeof part.text === 'string') return part.text
          return null
        })
        .filter(Boolean)
        .join('\n')
        .trim()
    : ''

  if (!text) {
    throw Errors.base.internal('Gemini API returned an empty response')
  }

  return text
}

function cleanupOutput(raw: string) {
  let result = raw.trim()
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1)
  }
  return result
}

export const generate = action({
  args: {
    field: v.union(v.literal('title'), v.literal('description')),
    context: v.optional(
      v.object({
        currentTitle: v.optional(v.string()),
        currentDescription: v.optional(v.string()),
        status: v.optional(v.string()),
        priority: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    const prompt = buildPrompt({ field: args.field, context: args.context })
    const raw = await generateWithGemini(prompt)
    const cleaned = cleanupOutput(raw)

    return args.field === 'title' ? { title: cleaned } : { description: cleaned }
  },
})
