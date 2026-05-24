'use node'

import { action, type ActionCtx } from '../../_generated/server'
import { api } from '../../_generated/api'
import { v } from 'convex/values'
import { loadStoredObjectBlob } from '../../lib/fileStorage'

import { geminiAI, type GeminiRequestPart } from '../../../src/services/gemini'
import { enforceGeminiActionRateLimit } from '../../geminiRateLimit'
import { Errors, withErrorHandling } from '../../errors'
import { asNonEmptyString } from '../platform/agentActions/helpers/values'
import { resolveAgentDueDateMs } from '../platform/agentActions/helpers/dates'
import {
  parseExtractedProjectsResponse,
  parseProjectStatus,
  parseProjectTags,
  resolveDocumentImportClient,
  resolveDocumentImportProjectDate,
  type DocumentImportClient,
  type DocumentImportClientStatus,
  type DocumentImportDateStatus,
  type ParsedProjectStatus,
  type RawExtractedProject,
} from './projectDocumentImportParsing'

const MAX_EXTRACTED_CHARS = 12_000
const MAX_VISUAL_DOCUMENT_BYTES = 15 * 1024 * 1024

const visualDocumentValidator = v.object({
  fileName: v.string(),
  mimeType: v.string(),
  storageId: v.string(),
})

export type ProposedImportProject = {
  name: string
  description: string | null
  status: ParsedProjectStatus
  clientId: string | null
  documentClientName: string | null
  clientStatus: DocumentImportClientStatus
  startDateMs: number | null
  endDateMs: number | null
  startDateStatus: DocumentImportDateStatus
  endDateStatus: DocumentImportDateStatus
  startDateHint: string | null
  endDateHint: string | null
  tags: string[]
  suggestions: string[]
  sourceExcerpt: string | null
}

function requireIdentity(identity: { subject: string } | null): asserts identity is { subject: string } {
  if (!identity?.subject) {
    throw Errors.auth.unauthorized()
  }
}

function buildProjectExtractionRules(clientNames: string[]): string {
  const clientBlock =
    clientNames.length > 0
      ? `Workspace clients (match clientName to these when mentioned): ${clientNames.join(', ')}`
      : 'No client list was provided — leave clientName null when not mentioned.'

  return `You extract portfolio projects from briefs, SOWs, planning decks, status reports, and handwritten notes.

Return ONLY valid JSON: an array of objects with this shape:
[
  {
    "name": "string (required)",
    "description": "string (optional)",
    "clientName": "string (optional — company or client named in the document)",
    "status": "planning" | "active" | "on_hold" | "completed",
    "startDate": "ISO date or natural language if mentioned",
    "endDate": "ISO date or natural language if mentioned",
    "tags": ["string"],
    "sourceExcerpt": "short quote supporting this project"
  }
]

Rules:
- Extract distinct projects or engagements only; merge duplicates.
- Use clientName exactly as written when a company or client is tied to the project.
- Omit status when unclear — do not guess.
- If dates are missing, unreadable, or vague (TBD, soon), set startDate/endDate to null.
- Maximum 25 projects.

${clientBlock}`
}

function buildPreferredClientHint(
  clients: DocumentImportClient[],
  preferredClientId: string | null,
): string | null {
  if (!preferredClientId) return null

  const preferred = clients.find((client) => client.id === preferredClientId)
  if (preferred) {
    return `The user already selected client "${preferred.name}" (id: ${preferred.id}). Assign every project to this client unless the document explicitly names a different client.`
  }

  return `The user already selected client id ${preferredClientId}. Assign projects to this client unless the document explicitly names another client.`
}

function buildTextExtractionPrompt(args: {
  fileName: string
  extractedText: string
  clientNames: string[]
  preferredClientId?: string | null
  clients?: DocumentImportClient[]
}): string {
  const contextHints = buildPreferredClientHint(args.clients ?? [], args.preferredClientId ?? null)

  return `${buildProjectExtractionRules(args.clientNames)}
${contextHints ? `${contextHints}\n` : ''}
Document file: ${args.fileName}

Document text:
${args.extractedText}`
}

function buildVisualExtractionPrompt(args: {
  fileNames: string[]
  clientNames: string[]
  preferredClientId?: string | null
  clients?: DocumentImportClient[]
  supplementalText?: string | null
}): string {
  const contextHints = buildPreferredClientHint(args.clients ?? [], args.preferredClientId ?? null)

  const fileList =
    args.fileNames.length === 1
      ? args.fileNames[0]
      : args.fileNames.map((name, index) => `${index + 1}. ${name}`).join('\n')

  const supplementalBlock = args.supplementalText?.trim()
    ? `\nSupplemental extracted text:\n${args.supplementalText.trim()}`
    : ''

  return `${buildProjectExtractionRules(args.clientNames)}
${contextHints ? `${contextHints}\n` : ''}
Read the attached file${args.fileNames.length === 1 ? '' : 's'} (handwritten notes, scans, or image-only PDFs are expected).
Document file${args.fileNames.length === 1 ? '' : 's'}:
${fileList}${supplementalBlock}`
}

async function loadVisualGeminiParts(
  ctx: Parameters<typeof loadStoredObjectBlob>[0],
  documents: Array<{ fileName: string; mimeType: string; storageId: string }>,
): Promise<GeminiRequestPart[]> {
  return Promise.all(
    documents.map(async (document) => {
      const blob = await loadStoredObjectBlob(ctx, document.storageId)
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

async function loadWorkspaceClients(ctx: ActionCtx, workspaceId: string): Promise<DocumentImportClient[]> {
  const raw = (await ctx.runQuery(api.clients.list, {
    workspaceId,
    limit: 500,
  })) as { items?: Array<{ legacyId?: string; name?: string }> }

  return (raw.items ?? [])
    .map((client) => {
      const id = asNonEmptyString(client.legacyId)
      const name = asNonEmptyString(client.name)
      if (!id || !name) return null
      return { id, name }
    })
    .filter((client): client is DocumentImportClient => client !== null)
}

function resolveProjectDateField(
  assessment: ReturnType<typeof resolveDocumentImportProjectDate>,
  rawValue: string | null,
  context: string,
  nowMs: number,
): { dateMs: number | null; status: DocumentImportDateStatus; hint: string | null } {
  if (assessment.status !== 'resolved' || assessment.dateMs === null) {
    return {
      dateMs: null,
      status: assessment.status,
      hint: assessment.hint,
    }
  }

  const dateMs = resolveAgentDueDateMs({
    dueDateMs: assessment.dateMs,
    dueDate: rawValue,
    rawMessage: context,
    nowMs,
  })

  if (dateMs === null) {
    return {
      dateMs: null,
      status: 'unclear',
      hint: assessment.hint ?? rawValue,
    }
  }

  return {
    dateMs,
    status: 'resolved',
    hint: null,
  }
}

function mapRawProjectToProposal(
  rawProject: RawExtractedProject,
  clients: DocumentImportClient[],
  preferredClientId: string | null,
  nowMs: number,
): ProposedImportProject | null {
  const name = asNonEmptyString(rawProject.name)
  if (!name) return null

  const description = asNonEmptyString(rawProject.description) ?? null
  const sourceExcerpt = asNonEmptyString(rawProject.sourceExcerpt) ?? null
  const context = { description, sourceExcerpt }

  const clientResolution = resolveDocumentImportClient(
    asNonEmptyString(rawProject.clientName),
    clients,
    preferredClientId,
  )

  const startAssessment = resolveDocumentImportProjectDate(
    asNonEmptyString(rawProject.startDate),
    context,
  )
  const endAssessment = resolveDocumentImportProjectDate(
    asNonEmptyString(rawProject.endDate),
    context,
  )

  const startResolved = resolveProjectDateField(
    startAssessment,
    asNonEmptyString(rawProject.startDate),
    [rawProject.startDate, sourceExcerpt, description].filter(Boolean).join('\n'),
    nowMs,
  )
  const endResolved = resolveProjectDateField(
    endAssessment,
    asNonEmptyString(rawProject.endDate),
    [rawProject.endDate, sourceExcerpt, description].filter(Boolean).join('\n'),
    nowMs,
  )

  return {
    name,
    description,
    status: parseProjectStatus(rawProject.status) ?? 'planning',
    clientId: clientResolution.clientId,
    documentClientName: clientResolution.documentClientName,
    clientStatus: clientResolution.clientStatus,
    startDateMs: startResolved.dateMs,
    endDateMs: endResolved.dateMs,
    startDateStatus: startResolved.status,
    endDateStatus: endResolved.status,
    startDateHint: startResolved.hint,
    endDateHint: endResolved.hint,
    tags: parseProjectTags(rawProject.tags),
    suggestions: clientResolution.suggestions,
    sourceExcerpt,
  }
}

export const extractProjectsFromDocument = action({
  args: {
    workspaceId: v.string(),
    fileName: v.string(),
    extractedText: v.optional(v.string()),
    visualDocuments: v.optional(v.array(visualDocumentValidator)),
    preferredClientId: v.optional(v.union(v.string(), v.null())),
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
        name: 'projectDocumentImport',
        userId: identity.subject,
        resourceId: workspaceId,
        scope: args.preferredClientId ?? null,
      })

      const clients = await loadWorkspaceClients(ctx, workspaceId)
      const clientNames = clients.map((client) => client.name)
      const preferredClientId = args.preferredClientId ?? null

      let raw: string
      if (hasVisual) {
        const prompt = buildVisualExtractionPrompt({
          fileNames: visualDocuments.map((document) => document.fileName),
          clientNames,
          preferredClientId,
          clients,
          supplementalText: hasText ? extractedText : null,
        })
        const visualParts = await loadVisualGeminiParts(ctx, visualDocuments)
        raw = await geminiAI.generateContentWithParts([{ text: prompt }, ...visualParts])
      } else {
        const prompt = buildTextExtractionPrompt({
          fileName: args.fileName,
          extractedText,
          clientNames,
          preferredClientId,
          clients,
        })
        raw = await geminiAI.generateContent(prompt)
      }

      const nowMs = Date.now()
      const rawProjects = parseExtractedProjectsResponse(raw)
      const proposedProjects = rawProjects
        .map((rawProject) => mapRawProjectToProposal(rawProject, clients, preferredClientId, nowMs))
        .filter((project): project is ProposedImportProject => project !== null)
        .slice(0, 25)

      if (proposedProjects.length === 0) {
        throw Errors.validation.invalidInput(
          'No projects were found in this document. Try a file with clearer project names and timelines.',
        )
      }

      return {
        proposedProjects,
        documentSummary: `Found ${proposedProjects.length} project${proposedProjects.length === 1 ? '' : 's'} in ${args.fileName}.`,
      }
    }),
})
