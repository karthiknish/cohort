'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

import { geminiAI, type GeminiRequestPart } from '../src/services/gemini'
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
const MAX_VISUAL_DOCUMENT_BYTES = 15 * 1024 * 1024

const visualDocumentValidator = v.object({
  fileName: v.string(),
  mimeType: v.string(),
  storageId: v.id('_storage'),
})

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

function buildTaskExtractionRules(memberNames: string[]): string {
  const memberBlock =
    memberNames.length > 0
      ? `Workspace members (use exact names when possible): ${memberNames.join(', ')}`
      : 'No workspace member list was provided.'

  return `You extract actionable tasks from meeting notes, briefs, planning documents, and handwritten notes.

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
- Prefer ${memberNames.length > 0 ? 'names from the workspace member list when they match' : 'names exactly as written in the document'}.
- For handwriting, whiteboards, or photos, do your best to read messy text and still extract clear tasks.
- Maximum 25 tasks.

${memberBlock}`
}

function buildTextExtractionPrompt(args: {
  fileName: string
  extractedText: string
  memberNames: string[]
  clientId?: string | null
  projectId?: string | null
}): string {
  const contextHints = [
    args.clientId ? `Preferred clientId: ${args.clientId}` : null,
    args.projectId ? `Preferred projectId: ${args.projectId}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `${buildTaskExtractionRules(args.memberNames)}
${contextHints ? `${contextHints}\n` : ''}
Document file: ${args.fileName}

Document text:
${args.extractedText}`
}

function buildVisualExtractionPrompt(args: {
  fileNames: string[]
  memberNames: string[]
  clientId?: string | null
  projectId?: string | null
  supplementalText?: string | null
}): string {
  const contextHints = [
    args.clientId ? `Preferred clientId: ${args.clientId}` : null,
    args.projectId ? `Preferred projectId: ${args.projectId}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const fileList =
    args.fileNames.length === 1
      ? args.fileNames[0]
      : args.fileNames.map((name, index) => `${index + 1}. ${name}`).join('\n')

  const supplementalBlock = args.supplementalText?.trim()
    ? `\nSupplemental extracted text:\n${args.supplementalText.trim()}`
    : ''

  return `${buildTaskExtractionRules(args.memberNames)}
${contextHints ? `${contextHints}\n` : ''}
Read the attached file${args.fileNames.length === 1 ? '' : 's'} (handwritten notes, whiteboard photos, scans, or image-only PDFs are expected).
Document file${args.fileNames.length === 1 ? '' : 's'}:
${fileList}${supplementalBlock}`
}

async function loadVisualGeminiParts(
  ctx: { storage: { get: (id: Id<'_storage'>) => Promise<Blob | null> } },
  documents: Array<{ fileName: string; mimeType: string; storageId: Id<'_storage'> }>,
): Promise<GeminiRequestPart[]> {
  return Promise.all(
    documents.map(async (document) => {
      const blob = await ctx.storage.get(document.storageId)
      if (!blob) {
        throw Errors.validation.invalidInput(`Could not read uploaded file "${document.fileName}".`)
      }

      const buffer = Buffer.from(await blob.arrayBuffer())
      if (buffer.length <= 0) {
        throw Errors.validation.invalidInput(`Uploaded file "${document.fileName}" is empty.`)
      }

      if (buffer.length > MAX_VISUAL_DOCUMENT_BYTES) {
        throw Errors.validation.invalidInput(
          `"${document.fileName}" is too large. Try a file under 15 MB.`,
        )
      }

      return {
        inlineData: {
          mimeType: document.mimeType,
          data: buffer.toString('base64'),
        },
      } satisfies GeminiRequestPart
    }),
  )
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

async function mapRawTasksToProposals(
  ctx: Parameters<typeof resolveWorkspaceAssignments>[0],
  workspaceId: string,
  rawTasks: RawExtractedTask[],
): Promise<ProposedImportTask[]> {
  const nowMs = Date.now()

  const proposals = await Promise.all(
    rawTasks.slice(0, 25).map(async (rawTask) => {
      const title = asNonEmptyString(rawTask.title)
      if (!title) return null

      const assignment = await resolveTaskAssignment(ctx, workspaceId, rawTask)
      const dueDateMs = resolveAgentDueDateMs({
        dueDateMs: null,
        dueDate: rawTask.dueDate,
        rawMessage: asNonEmptyString(rawTask.description) ?? title,
        nowMs,
      })

      return {
        title,
        description: asNonEmptyString(rawTask.description) ?? null,
        priority: normalizePriority(rawTask.priority),
        assignedTo: assignment.assignedTo,
        dueDateMs,
        assignmentStatus: assignment.assignmentStatus,
        suggestions: assignment.suggestions,
        sourceExcerpt: asNonEmptyString(rawTask.sourceExcerpt) ?? null,
      } satisfies ProposedImportTask
    }),
  )

  return proposals.filter((task): task is ProposedImportTask => task !== null)
}

export const extractTasksFromDocument = action({
  args: {
    workspaceId: v.string(),
    fileName: v.string(),
    extractedText: v.optional(v.string()),
    visualDocuments: v.optional(v.array(visualDocumentValidator)),
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

      const extractedText = args.extractedText?.replace(/\s+/g, ' ').trim().slice(0, MAX_EXTRACTED_CHARS) ?? ''
      const visualDocuments = args.visualDocuments ?? []
      const hasText = extractedText.length > 0
      const hasVisual = visualDocuments.length > 0

      if (!hasText && !hasVisual) {
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

      let raw: string
      if (hasVisual) {
        const prompt = buildVisualExtractionPrompt({
          fileNames: visualDocuments.map((document) => document.fileName),
          memberNames,
          clientId: args.clientId ?? null,
          projectId: args.projectId ?? null,
          supplementalText: hasText ? extractedText : null,
        })
        const visualParts = await loadVisualGeminiParts(ctx, visualDocuments)
        raw = await geminiAI.generateContentWithParts([{ text: prompt }, ...visualParts])
      } else {
        const prompt = buildTextExtractionPrompt({
          fileName: args.fileName,
          extractedText,
          memberNames,
          clientId: args.clientId ?? null,
          projectId: args.projectId ?? null,
        })
        raw = await geminiAI.generateContent(prompt)
      }

      const rawTasks = parseExtractedTasksResponse(raw)
      const proposedTasks = await mapRawTasksToProposals(ctx, workspaceId, rawTasks)

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
