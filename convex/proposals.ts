import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
import {
  workspaceQuery,
  workspaceMutation,
  authenticatedMutation,
  adminMutation,
  zWorkspaceQuery,
  zWorkspaceMutation,
  zAdminMutation,
} from './functions'
import { z } from 'zod/v4'

function nowMs() {
  return Date.now()
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}` 
}
 
const proposalZ = z.object({
  legacyId: z.string(),
  ownerId: z.string().nullable(),
  status: z.string(),
  stepProgress: z.number(),
  formData: z.any(),
  aiInsights: z.any().nullable(),
  aiSuggestions: z.string().nullable(),
  pdfUrl: z.string().nullable(),
  pptUrl: z.string().nullable(),
  pdfStorageId: z.string().nullable().optional(),
  pptStorageId: z.string().nullable().optional(),
  clientId: z.string().nullable(),
  clientName: z.string().nullable(),
  presentationDeck: z.any().nullable(),
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
    let q = ctx.db
      .query('proposals')
      .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')

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

    if (typeof args.status === 'string' && args.status.trim()) {
      const status = args.status.trim()
      q = q.filter((row) => row.eq(row.field('status'), status))
    }

    if (typeof args.clientId === 'string' && args.clientId.trim()) {
      const clientId = args.clientId.trim()
      q = q.filter((row) => row.eq(row.field('clientId'), clientId))
    }

    const rows = await q.take(args.limit)
    return rows.map((row) => ({
      legacyId: row.legacyId,
      ownerId: row.ownerId,
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
    formData: z.any(),
    clientId: z.string().nullable(),
    clientName: z.string().nullable(),
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
    formData: z.any().optional(),
    clientId: z.string().nullable().optional(),
    clientName: z.string().nullable().optional(),
    aiInsights: z.any().nullable().optional(),
    aiSuggestions: z.string().nullable().optional(),
    pdfUrl: z.string().nullable().optional(),
    pptUrl: z.string().nullable().optional(),
    pdfStorageId: z.string().nullable().optional(),
    pptStorageId: z.string().nullable().optional(),
    presentationDeck: z.any().nullable().optional(),
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

export const bulkUpsert = zAdminMutation({
  args: {
    proposals: z.array(
      z.object({
        workspaceId: z.string(),
        legacyId: z.string(),
        ownerId: z.string().nullable(),
        status: z.string(),
        stepProgress: z.number(),
        formData: z.any(),
        aiInsights: z.any().nullable(),
        aiSuggestions: z.string().nullable(),
        pdfUrl: z.string().nullable(),
        pptUrl: z.string().nullable(),
        pdfStorageId: z.string().nullable().optional(),
        pptStorageId: z.string().nullable().optional(),
        clientId: z.string().nullable(),
        clientName: z.string().nullable(),
        presentationDeck: z.any().nullable(),
        createdAtMs: z.number(),
        updatedAtMs: z.number(),
        lastAutosaveAtMs: z.number(),
      })
    ),
  },
  returns: z.object({ upserted: z.number() }),
  handler: async (ctx, args) => {
    let upserted = 0

    for (const proposal of args.proposals) {
      const existing = await ctx.db
        .query('proposals')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', proposal.workspaceId).eq('legacyId', proposal.legacyId))
        .unique()

      const payload = {
        workspaceId: proposal.workspaceId,
        legacyId: proposal.legacyId,
        ownerId: proposal.ownerId,
        status: proposal.status,
        stepProgress: proposal.stepProgress,
        formData: proposal.formData,
        aiInsights: proposal.aiInsights,
        aiSuggestions: proposal.aiSuggestions,
        pdfUrl: proposal.pdfUrl,
        pptUrl: proposal.pptUrl,
        pdfStorageId: proposal.pdfStorageId ?? null,
        pptStorageId: proposal.pptStorageId ?? null,
        clientId: proposal.clientId,
        clientName: proposal.clientName,
        presentationDeck: proposal.presentationDeck,
        createdAtMs: proposal.createdAtMs,
        updatedAtMs: proposal.updatedAtMs,
        lastAutosaveAtMs: proposal.lastAutosaveAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('proposals', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})
