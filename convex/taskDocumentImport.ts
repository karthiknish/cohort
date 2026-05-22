'use node'

import { action } from './_generated/server'
import { api, internal } from './_generated/api'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

import { geminiAI, type GeminiRequestPart } from '../src/services/gemini'
import { enforceGeminiActionRateLimit } from './geminiRateLimit'
import { ErrorCode, Errors, isAppError, withErrorHandling } from './errors'
import {
  listWorkspaceMembers,
} from './agentActions/helpers/context'
import { resolveAgentDueDateMs } from './agentActions/helpers/dates'
import { asNonEmptyString, asStringArray } from './agentActions/helpers/values'
import {
  assessDocumentImportDueDate,
  buildAssigneeMemberPool,
  enrichExtractedTasksWithDocumentAssignees,
  parseExtractedTasksResponse,
  resolveDocumentImportAssignees,
  resolveDocumentImportPriority,
  type DocumentImportWorkspaceMember,
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

export type TaskDueDateStatus = 'resolved' | 'missing' | 'unclear'

export type ProposedImportTask = {
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  assignedToUserIds: string[]
  documentAssigneeNames: string[]
  dueDateMs: number | null
  assignmentStatus: TaskAssignmentStatus
  dueDateStatus: TaskDueDateStatus
  dueDateHint: string | null
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
      ? `Workspace members (reference only — never substitute them for document assignees): ${memberNames.join(', ')}`
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
- Infer assignees from phrases like "owner", "assigned to", "@name", section headers, or names above task tables.
- For allocation sheets and tables grouped under a person's name, assign every task in that section to that person until the next person or table section.
- If a document has multiple task tables and a person name appears after the second table (common in two-column PDFs), assign the later table's tasks to that trailing name.
- assignedToNames must use people named in the document as task owners. Do NOT assign tasks to the reader/uploader unless the document explicitly assigns them.
- Use names exactly as written in the document. The import system will match them to workspace profiles by first name, last name, or email when possible.
- If no assignee is mentioned, use an empty assignedToNames array.
- Omit the priority field when the document does not state one. Do not guess priority.
- If a deadline is missing, unreadable, or ambiguous (for example "TBD", "soon", "next week"), set dueDate to null rather than guessing.
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

async function loadClientRosterNames(
  ctx: Parameters<typeof listWorkspaceMembers>[0],
  workspaceId: string,
  clientId: string | null,
): Promise<string[]> {
  if (!clientId) return []

  let client:
    | {
        accountManager: string
        teamMembers: Array<{ name: string; role: string }>
      }
    | null = null

  try {
    client = await ctx.runQuery(api.clients.getByLegacyId, {
      workspaceId,
      legacyId: clientId,
    })
  } catch (error) {
    if (isAppError(error, ErrorCode.RESOURCE.NOT_FOUND)) {
      return []
    }
    throw error
  }

  if (!client) return []

  const names: string[] = []
  const accountManager = client.accountManager?.trim()
  if (accountManager) names.push(accountManager)

  for (const member of client.teamMembers ?? []) {
    const name = member.name?.trim()
    if (name) names.push(name)
  }

  return names
}

function mergeDocumentImportAssigneeProfiles(
  ...memberLists: DocumentImportWorkspaceMember[][]
): DocumentImportWorkspaceMember[] {
  const byId = new Map<string, DocumentImportWorkspaceMember>()

  for (const members of memberLists) {
    for (const member of members) {
      const id = member.id.trim()
      const name = member.name.trim()
      if (!id || !name) continue

      const existing = byId.get(id)
      if (!existing || name.length > existing.name.trim().length) {
        byId.set(id, { id, name, email: member.email })
      }
    }
  }

  return [...byId.values()]
}

async function listDocumentImportAssigneeProfiles(
  ctx: Parameters<typeof listWorkspaceMembers>[0],
  workspaceId: string,
): Promise<DocumentImportWorkspaceMember[]> {
  const [workspaceMembers, platformAdmins] = await Promise.all([
    listWorkspaceMembers(ctx, workspaceId),
    ctx.runQuery(internal.taskDocumentImportQueries.listPlatformAdminMembersInternal, {}),
  ])

  return mergeDocumentImportAssigneeProfiles(workspaceMembers, platformAdmins)
}

async function resolveTaskAssignment(
  assignedToNames: string[],
  assigneeMemberPool: DocumentImportWorkspaceMember[],
): Promise<Pick<ProposedImportTask, 'assignedToUserIds' | 'assignmentStatus' | 'suggestions'>> {
  return resolveDocumentImportAssignees(assignedToNames, assigneeMemberPool)
}

async function resolveTaskDueDate(
  rawTask: RawExtractedTask,
  nowMs: number,
): Promise<Pick<ProposedImportTask, 'dueDateMs' | 'dueDateStatus' | 'dueDateHint'>> {
  const assessment = assessDocumentImportDueDate({
    dueDate: asNonEmptyString(rawTask.dueDate),
    description: asNonEmptyString(rawTask.description),
    sourceExcerpt: asNonEmptyString(rawTask.sourceExcerpt),
  })

  if (assessment.status !== 'resolved') {
    return {
      dueDateMs: null,
      dueDateStatus: assessment.status,
      dueDateHint: assessment.hint,
    }
  }

  const dueDateMs = resolveAgentDueDateMs({
    dueDateMs: null,
    dueDate: assessment.candidate,
    rawMessage: [
      asNonEmptyString(rawTask.dueDate),
      asNonEmptyString(rawTask.sourceExcerpt),
      asNonEmptyString(rawTask.description),
    ]
      .filter(Boolean)
      .join('\n'),
    nowMs,
  })

  if (dueDateMs === null) {
    return {
      dueDateMs: null,
      dueDateStatus: 'unclear',
      dueDateHint: assessment.hint ?? assessment.candidate,
    }
  }

  return {
    dueDateMs,
    dueDateStatus: 'resolved',
    dueDateHint: null,
  }
}

async function mapRawTasksToProposals(
  ctx: Parameters<typeof listWorkspaceMembers>[0],
  workspaceId: string,
  clientId: string | null,
  rawTasks: RawExtractedTask[],
): Promise<ProposedImportTask[]> {
  const nowMs = Date.now()
  const assigneeProfiles = await listDocumentImportAssigneeProfiles(ctx, workspaceId)
  const clientRosterNames = await loadClientRosterNames(ctx, workspaceId, clientId)
  const assigneeMemberPool = buildAssigneeMemberPool(assigneeProfiles, clientRosterNames)

  const proposals = await Promise.all(
    rawTasks.slice(0, 25).map(async (rawTask) => {
      const title = asNonEmptyString(rawTask.title)
      if (!title) return null

      const assignedToNames = asStringArray(rawTask.assignedToNames)
      const [assignment, dueDate] = await Promise.all([
        resolveTaskAssignment(assignedToNames, assigneeMemberPool),
        resolveTaskDueDate(rawTask, nowMs),
      ])
      const documentAssigneeNames: string[] = []
      for (const name of asStringArray(rawTask.assignedToNames)) {
        const trimmed = name.trim()
        if (trimmed.length > 0) documentAssigneeNames.push(trimmed)
      }

      return {
        title,
        description: asNonEmptyString(rawTask.description) ?? null,
        priority: resolveDocumentImportPriority({
          explicitPriority: rawTask.priority,
          dueDateMs: dueDate.dueDateMs,
          nowMs,
        }),
        assignedToUserIds: assignment.assignedToUserIds,
        documentAssigneeNames,
        dueDateMs: dueDate.dueDateMs,
        assignmentStatus: assignment.assignmentStatus,
        dueDateStatus: dueDate.dueDateStatus,
        dueDateHint: dueDate.dueDateHint,
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

      const members = await listDocumentImportAssigneeProfiles(ctx, workspaceId)
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

      const rawTasks = enrichExtractedTasksWithDocumentAssignees(
        extractedText,
        parseExtractedTasksResponse(raw),
      )
      const proposedTasks = await mapRawTasksToProposals(
        ctx,
        workspaceId,
        args.clientId ?? null,
        rawTasks,
      )

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
