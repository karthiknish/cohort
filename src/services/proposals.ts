import type { ProposalDraft, ProposalStatus } from '@/types/proposals'
import { mergeProposalForm } from '@/lib/proposals'
import { resolveProposalDeck } from '@/types/proposals'
import { ConvexReactClient } from 'convex/react'
import { api as convexApi } from '@/lib/convex-api'
import { logger } from '@/lib/logger'
import { cache } from 'react'

type ConvexAuthArgs = {
  workspaceId: string
  convexToken: string
}

interface ConvexProposalRow {
  legacyId: string
  status?: string
  stepProgress?: number
  formData?: ProposalDraft['formData'] | null
  aiInsights?: ProposalDraft['aiInsights'] | null
  aiSuggestions?: ProposalDraft['aiSuggestions'] | null
  pdfUrl?: string | null
  pptUrl?: string | null
  createdAtMs?: number
  updatedAtMs?: number
  lastAutosaveAtMs?: number
  clientId?: string | null
  clientName?: string | null
  presentationDeck?: {
    storageUrl?: string | null
    [key: string]: unknown
  } | null
}

interface ConvexCreateResponse {
  legacyId: string
}

function requireConvexUrl(): string {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    throw new Error('Convex URL is missing')
  }
  return convexUrl
}

function createAuthedConvexClient(token: string): ConvexReactClient {
  const convex = new ConvexReactClient(requireConvexUrl())
  convex.setAuth(async () => token)
  return convex
}

/**
 * Executes a Convex mutation with error handling and logging.
 */
async function executeMutation(convex: ConvexReactClient, name: string, args: any, context: any = {}): Promise<any> {
  try {
    return await convex.mutation(name as any, args)
  } catch (error) {
    logger.error(`Convex Mutation Error: ${name}`, error, {
      type: 'convex_error',
      method: 'mutation',
      name,
      ...context
    })
    throw error
  }
}

/**
 * Executes a Convex query with error handling and logging.
 */
async function executeQuery(convex: ConvexReactClient, name: string, args: any, context: any = {}): Promise<any> {
  try {
    return await convex.query(name as any, args)
  } catch (error) {
    logger.error(`Convex Query Error: ${name}`, error, {
      type: 'convex_error',
      method: 'query',
      name,
      ...context
    })
    throw error
  }
}

function mapConvexProposalToDraft(row: ConvexProposalRow): ProposalDraft {
  const baseDraft: ProposalDraft = {
    id: String(row.legacyId),
    status: (row.status ?? 'draft') as ProposalDraft['status'],
    stepProgress: typeof row.stepProgress === 'number' ? row.stepProgress : 0,
    formData: mergeProposalForm(row.formData ?? null),
    aiInsights: row.aiInsights ?? null,
    aiSuggestions: row.aiSuggestions ?? null,
    pdfUrl: row.pdfUrl ?? null,
    pptUrl: row.pptUrl ?? null,
    createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
    updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
    lastAutosaveAt: typeof row.lastAutosaveAtMs === 'number' ? new Date(row.lastAutosaveAtMs).toISOString() : null,
    clientId: row.clientId ?? null,
    clientName: row.clientName ?? null,
    presentationDeck: row.presentationDeck
      ? ({
        generationId: null,
        status: 'unknown',
        instructions: null,
        webUrl: null,
        shareUrl: null,
        pptxUrl: null,
        pdfUrl: null,
        generatedFiles: [],
        storageUrl: row.presentationDeck.storageUrl ?? row.pptUrl ?? null,
        ...row.presentationDeck,
      } as ProposalDraft['presentationDeck'])
      : null,
  }
  return resolveProposalDeck(baseDraft)
}

async function listProposalsInternal(
  params: { status?: ProposalStatus; clientId?: string; pageSize?: number } & ConvexAuthArgs
) {
  const convex = createAuthedConvexClient(params.convexToken)

  const rows = (await executeQuery(convex, 'proposals:list', {
    workspaceId: params.workspaceId,
    limit: typeof params.pageSize === 'number' && Number.isFinite(params.pageSize) ? params.pageSize : 100,
    status: params.status,
    clientId: params.clientId,
  }, { workspaceId: params.workspaceId })) as ConvexProposalRow[]

  return rows.map(mapConvexProposalToDraft)
}

export const listProposals = cache(listProposalsInternal)

async function getProposalByIdInternal(id: string, auth: ConvexAuthArgs) {
  const convex = createAuthedConvexClient(auth.convexToken)

  const row = (await executeQuery(convex, 'proposals:getByLegacyId', {
    workspaceId: auth.workspaceId,
    legacyId: id,
  }, { workspaceId: auth.workspaceId, legacyId: id })) as ConvexProposalRow | null

  if (!row) {
    throw new Error('Proposal not found')
  }

  return mapConvexProposalToDraft(row)
}

export const getProposalById = cache(getProposalByIdInternal)

export async function createProposalDraft(body: Partial<ProposalDraft> & { ownerId?: string | null } = {}, auth: ConvexAuthArgs) {
  const convex = createAuthedConvexClient(auth.convexToken)

  const res = (await executeMutation(convex, 'proposals:create', {
    workspaceId: auth.workspaceId,
    ownerId: body.ownerId ?? null,
    status: (body.status ?? 'draft') as string,
    stepProgress: typeof body.stepProgress === 'number' ? body.stepProgress : 0,
    formData: body.formData ?? mergeProposalForm(null),
    clientId: body.clientId ?? null,
    clientName: body.clientName ?? null,
  }, { workspaceId: auth.workspaceId })) as ConvexCreateResponse

  return String(res.legacyId)
}

export async function updateProposalDraft(id: string, body: Partial<ProposalDraft>, auth: ConvexAuthArgs) {
  const convex = createAuthedConvexClient(auth.convexToken)
  const timestamp = Date.now()

  await executeMutation(convex, 'proposals:update', {
    workspaceId: auth.workspaceId,
    legacyId: id,
    status: body.status,
    stepProgress: body.stepProgress,
    formData: body.formData,
    clientId: body.clientId,
    clientName: body.clientName,
    updatedAtMs: timestamp,
    lastAutosaveAtMs: timestamp,
  }, { workspaceId: auth.workspaceId, legacyId: id })

  return true
}

export async function deleteProposalDraft(id: string, auth: ConvexAuthArgs) {
  const convex = createAuthedConvexClient(auth.convexToken)

  await executeMutation(convex, 'proposals:remove', {
    workspaceId: auth.workspaceId,
    legacyId: id,
  }, { workspaceId: auth.workspaceId, legacyId: id })

  return true
}

export async function refreshProposalDraft(id: string, auth: ConvexAuthArgs) {
  return getProposalById(id, auth)
}

export async function requestProposalDeckPreparation(_id: string) {
  // Deck preparation is handled server-side; keep this helper for future triggers.
  void _id
  return { ok: true }
}
