import { Errors } from './errors'
import {
  zWorkspaceQuery,
  zWorkspaceMutation,
} from './functions'
import { z } from 'zod/v4'

function nowMs() {
  return Date.now()
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}` 
}

const jsonScalarZ = z.union([z.string(), z.number(), z.boolean(), z.null()])
const jsonLayer1Z = z.union([jsonScalarZ, z.array(jsonScalarZ), z.record(z.string(), jsonScalarZ)])
const jsonLayer2Z = z.union([jsonLayer1Z, z.array(jsonLayer1Z), z.record(z.string(), jsonLayer1Z)])
const jsonRecordZ = z.record(z.string(), jsonLayer2Z)
 
const proposalZ = z.object({
  legacyId: z.string(),
  ownerId: z.string().nullable(),
  agentConversationId: z.string().nullable().optional(),
  lastAgentInteractionAtMs: z.number().nullable().optional(),
  status: z.string(),
  stepProgress: z.number(),
  formData: jsonRecordZ,
  aiInsights: jsonRecordZ.nullable(),
  aiSuggestions: z.string().nullable(),
  pdfUrl: z.string().nullable(),
  pptUrl: z.string().nullable(),
  pdfStorageId: z.string().nullable().optional(),
  pptStorageId: z.string().nullable().optional(),
  clientId: z.string().nullable(),
  clientName: z.string().nullable(),
  presentationDeck: jsonRecordZ.nullable(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  lastAutosaveAtMs: z.number().nullable(),
})

export const getByLegacyId = zWorkspaceQuery({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: proposalZ,
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Proposal', args.legacyId)

    return {
      legacyId: row.legacyId,
      ownerId: row.ownerId,
      agentConversationId: row.agentConversationId ?? null,
      lastAgentInteractionAtMs: row.lastAgentInteractionAtMs ?? null,
      status: row.status,
      stepProgress: row.stepProgress,
      formData: row.formData,
      aiInsights: row.aiInsights,
      aiSuggestions: row.aiSuggestions,
      pdfUrl: row.pdfUrl,
      pptUrl: row.pptUrl,
      pdfStorageId: row.pdfStorageId,
      pptStorageId: row.pptStorageId,
      clientId: row.clientId,
      clientName: row.clientName,
      presentationDeck: row.presentationDeck,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      lastAutosaveAtMs: row.lastAutosaveAtMs,
    }
  },
})

export const list = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    limit: z.number(),
    status: z.string().optional(),
    clientId: z.string().optional(),
    afterUpdatedAtMs: z.number().optional(),
    afterLegacyId: z.string().optional(),
  },
  returns: z.array(proposalZ),
  handler: async (ctx, args) => {
    const status = typeof args.status === 'string' && args.status.trim() ? args.status.trim() : null
    const clientId = typeof args.clientId === 'string' && args.clientId.trim() ? args.clientId.trim() : null

    const baseQuery = ctx.db.query('proposals')
    const indexedQuery = status && clientId
      ? baseQuery.withIndex('by_workspace_status_clientId_updatedAtMs_legacyId', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('status', status).eq('clientId', clientId)
        )
      : status
        ? baseQuery.withIndex('by_workspace_status_updatedAtMs_legacyId', (q) =>
            q.eq('workspaceId', args.workspaceId).eq('status', status)
          )
        : clientId
          ? baseQuery.withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
              q.eq('workspaceId', args.workspaceId).eq('clientId', clientId)
            )
          : baseQuery.withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))

    let q = indexedQuery.order('desc')

    const afterUpdatedAtMs = args.afterUpdatedAtMs
    const afterLegacyId = args.afterLegacyId

    if (typeof afterUpdatedAtMs === 'number' && typeof afterLegacyId === 'string') {
      q = q.filter((row) =>
        row.or(
          row.lt(row.field('updatedAtMs'), afterUpdatedAtMs),
          row.and(row.eq(row.field('updatedAtMs'), afterUpdatedAtMs), row.lt(row.field('legacyId'), afterLegacyId)),
        ),
      )
    }

    const rows = await q.take(args.limit)
    return rows.map((row) => ({
      legacyId: row.legacyId,
      ownerId: row.ownerId,
      agentConversationId: row.agentConversationId ?? null,
      lastAgentInteractionAtMs: row.lastAgentInteractionAtMs ?? null,
      status: row.status,
      stepProgress: row.stepProgress,
      formData: row.formData,
      aiInsights: row.aiInsights,
      aiSuggestions: row.aiSuggestions,
      pdfUrl: row.pdfUrl,
      pptUrl: row.pptUrl,
      pdfStorageId: row.pdfStorageId,
      pptStorageId: row.pptStorageId,
      clientId: row.clientId,
      clientName: row.clientName,
      presentationDeck: row.presentationDeck,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
      lastAutosaveAtMs: row.lastAutosaveAtMs,
    }))
  },
})

export const count = zWorkspaceQuery({
  args: { workspaceId: z.string() },
  returns: z.object({ count: z.number() }),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return { count: rows.length }
  },
})

export const create = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    ownerId: z.string().nullable(),
    status: z.string(),
    stepProgress: z.number(),
    formData: jsonRecordZ,
    clientId: z.string().nullable(),
    clientName: z.string().nullable(),
    agentConversationId: z.string().nullable().optional(),
    lastAgentInteractionAtMs: z.number().nullable().optional(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const timestamp = nowMs()
    let legacyId = generateId('proposal')
    let attempt = 0
    while (attempt < 5) {
      const existing = await ctx.db
        .query('proposals')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
        .unique()
      if (!existing) break
      legacyId = generateId('proposal')
      attempt += 1
    }

    await ctx.db.insert('proposals', {
      workspaceId: args.workspaceId,
      legacyId,
      ownerId: args.ownerId,
      status: args.status,
      stepProgress: args.stepProgress,
      formData: args.formData,
      aiInsights: null,
      aiSuggestions: null,
      pdfUrl: null,
      pptUrl: null,
      clientId: args.clientId,
      clientName: args.clientName,
      agentConversationId: args.agentConversationId ?? null,
      lastAgentInteractionAtMs: args.lastAgentInteractionAtMs ?? null,
      presentationDeck: null,
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
      lastAutosaveAtMs: timestamp,
    })

    return { legacyId }
  },
})

export const update = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    status: z.string().optional(),
    stepProgress: z.number().optional(),
    formData: jsonRecordZ.optional(),
    clientId: z.string().nullable().optional(),
    clientName: z.string().nullable().optional(),
    aiInsights: jsonRecordZ.nullable().optional(),
    aiSuggestions: z.string().nullable().optional(),
    pdfUrl: z.string().nullable().optional(),
    pptUrl: z.string().nullable().optional(),
    pdfStorageId: z.string().nullable().optional(),
    pptStorageId: z.string().nullable().optional(),
    presentationDeck: jsonRecordZ.nullable().optional(),
    agentConversationId: z.string().nullable().optional(),
    lastAgentInteractionAtMs: z.number().nullable().optional(),
    updatedAtMs: z.number(),
    lastAutosaveAtMs: z.number(),
  },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Proposal')
    }

    const patch: Record<string, unknown> = {
      updatedAtMs: args.updatedAtMs,
      lastAutosaveAtMs: args.lastAutosaveAtMs,
    }

    if (args.status !== undefined) patch.status = args.status
    if (args.stepProgress !== undefined) patch.stepProgress = args.stepProgress
    if (args.formData !== undefined) patch.formData = args.formData
    if (args.clientId !== undefined) patch.clientId = args.clientId
    if (args.clientName !== undefined) patch.clientName = args.clientName
    if (args.aiInsights !== undefined) patch.aiInsights = args.aiInsights
    if (args.aiSuggestions !== undefined) patch.aiSuggestions = args.aiSuggestions
    if (args.pdfUrl !== undefined) patch.pdfUrl = args.pdfUrl
    if (args.pptUrl !== undefined) patch.pptUrl = args.pptUrl
    if (args.pdfStorageId !== undefined) patch.pdfStorageId = args.pdfStorageId
    if (args.pptStorageId !== undefined) patch.pptStorageId = args.pptStorageId
    if (args.presentationDeck !== undefined) patch.presentationDeck = args.presentationDeck
    if (args.agentConversationId !== undefined) patch.agentConversationId = args.agentConversationId
    if (args.lastAgentInteractionAtMs !== undefined)
      patch.lastAgentInteractionAtMs = args.lastAgentInteractionAtMs

    await ctx.db.patch(existing._id, patch)
    return { ok: true }
  },
})

export const remove = zWorkspaceMutation({
  args: { workspaceId: z.string(), legacyId: z.string() },
  returns: z.object({ ok: z.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Proposal', args.legacyId)
    }

    await ctx.db.delete(existing._id)
    return { ok: true }
  },
})
