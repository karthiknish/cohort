'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'

import { geminiAI } from '../src/services/gemini'
import { enforceGeminiActionRateLimit } from './geminiRateLimit'
import { Errors, withErrorHandling } from './errors'
import {
  listWorkspaceMembers,
  resolveWorkspaceAssignments,
} from './agentActions/helpers/context'
import { resolveAgentDueDateMs } from './agentActions/helpers/dates'
import { asNonEmptyString, asStringArray } from './agentActions/helpers/values'
import {
  normalizePriority,
  parseExtractedTasksResponse,
  type RawExtractedTask,
} from './taskDocumentImportParsing'

const MAX_EXTRACTED_CHARS = 12_000

export type TaskAssignmentStatus = 'resolved' | 'ambiguous' | 'unassigned'

export type ProposedImportTask = {
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  assignedTo: string[]
  dueDateMs: number | null
  assignmentStatus: TaskAssignmentStatus
  suggestions: string[]
  sourceExcerpt: string | null
}

function requireIdentity(identity: { subject: string } | null): asserts identity is { subject: string } {
  if (!identity?.subject) {
    throw Errors.auth.unauthorized()
  }
}

function buildExtractionPrompt(args: {
  fileName: string
  extractedText: string
  memberNames: string[]
  clientId?: string | null
  projectId?: string | null
}): string {
  const memberBlock =
    args.memberNames.length > 0
      ? `Workspace members (use exact names when possible): ${args.memberNames.join(', ')}`
      : 'No workspace member list was provided.'

  const contextHints = [
    args.clientId ? `Preferred clientId: ${args.clientId}` : null,
    args.projectId ? `Preferred projectId: ${args.projectId}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `You extract actionable tasks from meeting notes, briefs, and planning documents.

Return ONLY valid JSON: an array of objects with this shape:
[
  {
    "title": "string (required, concise action)",
    "description": "string (optional, context and acceptance criteria)",
    "assignedToNames": ["string"] (people responsible; use names from the document),
    "priority": "low" | "medium" | "high",
    "dueDate": "ISO date or natural language date if mentioned",
    "sourceExcerpt": "short quote from the document supporting this task"
  }
]

Rules:
- Extract distinct tasks only; merge duplicates.
- Infer assignees from phrases like "owner", "assigned to", "@name", or section headers.
- If no assignee is mentioned, use an empty assignedToNames array.
- Prefer ${args.memberNames.length > 0 ? 'names from the workspace member list when they match' : 'names exactly as written in the document'}.
- Maximum 25 tasks.

${memberBlock}
${contextHints ? `${contextHints}\n` : ''}
Document file: ${args.fileName}

Document text:
${args.extractedText}`
}

async function resolveTaskAssignment(
  ctx: Parameters<typeof resolveWorkspaceAssignments>[0],
  workspaceId: string,
  rawTask: RawExtractedTask,
): Promise<Pick<ProposedImportTask, 'assignedTo' | 'assignmentStatus' | 'suggestions'>> {
  const assignedToNames = asStringArray(rawTask.assignedToNames)
  const description = asNonEmptyString(rawTask.description)

  if (assignedToNames.length === 0 && !description) {
    return { assignedTo: [], assignmentStatus: 'unassigned', suggestions: [] }
  }

  const assignmentResolution = await resolveWorkspaceAssignments(ctx, workspaceId, {
    rawMessage: description ?? undefined,
    params: {
      assignedTo: assignedToNames,
      description,
    },
    mode: 'task',
  })

  if (assignmentResolution.status === 'ambiguous') {
    return {
      assignedTo: [],
      assignmentStatus: 'ambiguous',
      suggestions: assignmentResolution.suggestions,
    }
  }

  return {
    assignedTo: assignmentResolution.names,
    assignmentStatus: assignmentResolution.names.length > 0 ? 'resolved' : 'unassigned',
    suggestions: [],
  }
}

export const extractTasksFromDocument = action({
  args: {
    workspaceId: v.string(),
    fileName: v.string(),
    extractedText: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    projectId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const workspaceId = args.workspaceId.trim()
      if (!workspaceId) {
        throw Errors.validation.invalidInput('Workspace is required')
      }

      const extractedText = args.extractedText.replace(/\s+/g, ' ').trim().slice(0, MAX_EXTRACTED_CHARS)
      if (!extractedText) {
        throw Errors.validation.invalidInput('Could not read any text from this document.')
      }

      await enforceGeminiActionRateLimit(ctx, {
        name: 'taskDocumentImport',
        userId: identity.subject,
        resourceId: workspaceId,
        scope: args.clientId ?? null,
      })

      const members = await listWorkspaceMembers(ctx, workspaceId)
      const memberNames = members.map((member) => member.name)

      const prompt = buildExtractionPrompt({
        fileName: args.fileName,
        extractedText,
        memberNames,
        clientId: args.clientId ?? null,
        projectId: args.projectId ?? null,
      })

      const raw = await geminiAI.generateContent(prompt)
      const rawTasks = parseExtractedTasksResponse(raw)
      const nowMs = Date.now()

      const proposedTasks: ProposedImportTask[] = []

      for (const rawTask of rawTasks.slice(0, 25)) {
        const title = asNonEmptyString(rawTask.title)
        if (!title) continue

        const assignment = await resolveTaskAssignment(ctx, workspaceId, rawTask)
        const dueDateMs = resolveAgentDueDateMs({
          dueDateMs: null,
          dueDate: rawTask.dueDate,
          rawMessage: asNonEmptyString(rawTask.description) ?? title,
          nowMs,
        })

        proposedTasks.push({
          title,
          description: asNonEmptyString(rawTask.description) ?? null,
          priority: normalizePriority(rawTask.priority),
          assignedTo: assignment.assignedTo,
          dueDateMs,
          assignmentStatus: assignment.assignmentStatus,
          suggestions: assignment.suggestions,
          sourceExcerpt: asNonEmptyString(rawTask.sourceExcerpt) ?? null,
        })
      }

      if (proposedTasks.length === 0) {
        throw Errors.validation.invalidInput(
          'No actionable tasks were found in this document. Try a file with clearer owners and action items.',
        )
      }

      return {
        proposedTasks,
        documentSummary: `Found ${proposedTasks.length} task${proposedTasks.length === 1 ? '' : 's'} in ${args.fileName}.`,
      }
    }),
})
