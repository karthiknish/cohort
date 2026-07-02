import { v } from 'convex/values'
import { adminAction } from '../../functions'
import { Errors, withErrorHandling } from '../../errors'
import { enforceDeepSeekActionRateLimit } from '../../deepseekRateLimit'
import { deepseekAI } from '../../../src/services/deepseek'

type WorkspaceEntity = 'task' | 'project'
type WorkspaceField = 'title' | 'description'

type GenerateContext = {
  currentTitle?: string
  currentDescription?: string
  priority?: string
  status?: string
  assignee?: string
}

function buildPrompt(args: {
  entity: WorkspaceEntity
  field: WorkspaceField
  context?: GenerateContext
}) {
  const { entity, field, context } = args
  const entityLabel = entity === 'task' ? 'task' : 'project'

  if (field === 'title') {
    if (entity === 'task') {
      return `Generate a concise, professional task title for a project management workspace.
The title should be:
- Clear and descriptive (3-6 words)
- Action-oriented (e.g., "Review Q2 budget report")
- Professional and suitable for a task board

${context?.currentDescription ? `Context/Description: ${context.currentDescription}` : ''}
${context?.priority ? `Priority: ${context.priority}` : ''}
${context?.status ? `Status: ${context.status}` : ''}
${context?.assignee ? `Assignee: ${context.assignee}` : ''}

Return ONLY the title, nothing else. No quotes, no explanation.`
    }

    return `Generate a concise, professional project name for a project management workspace.
The name should be:
- Clear and descriptive (2-5 words)
- Professional and suitable for a project dashboard
- Reflect the project's scope or goal

${context?.currentDescription ? `Context/Description: ${context.currentDescription}` : ''}
${context?.status ? `Status: ${context.status}` : ''}

Return ONLY the project name, nothing else. No quotes, no explanation.`
  }

  if (entity === 'task') {
    return `Generate a clear, professional task description for a project management workspace.
The description should be:
- 2-3 sentences maximum
- Explain what the task involves and its goal
- Be specific and actionable
- Suitable for a team member to understand and execute

${context?.currentTitle ? `Task Title: ${context.currentTitle}` : ''}
${context?.priority ? `Priority: ${context.priority}` : ''}
${context?.status ? `Status: ${context.status}` : ''}
${context?.assignee ? `Assignee: ${context.assignee}` : ''}

Return ONLY the description, nothing else. No quotes, no preamble.`
  }

  return `Generate a clear, professional project description for a project management workspace.
The description should be:
- 2-3 sentences maximum
- Explain the project's goals, scope, and expected value
- Be specific and actionable
- Suitable for stakeholders and team members to understand

${context?.currentTitle ? `Project Name: ${context.currentTitle}` : ''}
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
    entity: v.union(v.literal('task'), v.literal('project')),
    field: v.union(v.literal('title'), v.literal('description')),
    context: v.optional(
      v.object({
        currentTitle: v.optional(v.string()),
        currentDescription: v.optional(v.string()),
        priority: v.optional(v.string()),
        status: v.optional(v.string()),
        assignee: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      await enforceDeepSeekActionRateLimit(ctx, {
        name: 'workspaceAiAssist',
        userId: ctx.legacyId,
        workspaceId: ctx.agencyId,
        resourceId: `${args.entity}:${args.field}`,
      })

      const prompt = buildPrompt({
        entity: args.entity,
        field: args.field,
        context: args.context,
      })
      const raw = await generateWithDeepSeek(prompt)
      const cleaned = cleanupOutput(raw)

      return args.field === 'title' ? { title: cleaned } : { description: cleaned }
    }, 'workspaceAi:generate'),
})
