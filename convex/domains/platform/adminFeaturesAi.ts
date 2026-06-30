import { v } from 'convex/values'
import { adminAction } from '../../functions'
import { Errors, withErrorHandling } from '../../errors'
import { enforceDeepSeekActionRateLimit } from '../../deepseekRateLimit'
import { deepseekAI } from '../../../src/services/deepseek'

type DeepSeekPayload = {
  choices?: Array<{
    message?: { content?: string }
  }>
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

async function generateWithDeepSeek(prompt: string): Promise<string> {
  if (!deepseekAI.isConfigured()) {
    throw Errors.integration.notConfigured('DeepSeek', 'DEEPSEEK_API_KEY is not configured')
  }
  return deepseekAI.generateContent(prompt)
}

function cleanupOutput(raw: string) {
  let result = raw.trim()
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1)
  }
  return result
}

export const generate = adminAction({
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
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      await enforceDeepSeekActionRateLimit(ctx, {
        name: 'adminFeatureAssist',
        userId: ctx.legacyId,
        workspaceId: ctx.agencyId,
        resourceId: args.field,
      })

      const prompt = buildPrompt({ field: args.field, context: args.context })
      const raw = await generateWithDeepSeek(prompt)
      const cleaned = cleanupOutput(raw)

      return args.field === 'title' ? { title: cleaned } : { description: cleaned }
    }, 'adminFeaturesAi:generate'),
})
