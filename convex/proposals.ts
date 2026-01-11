import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs() {
  return Date.now()
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

export const getByLegacyId = query({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return null
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

export const list = query({
  args: {
    workspaceId: v.string(),
    limit: v.number(),
    status: v.optional(v.string()),
    clientId: v.optional(v.string()),
    afterUpdatedAtMs: v.optional(v.number()),
    afterLegacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

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

export const count = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const rows = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return { count: rows.length }
  },
})

export const create = mutation({
  args: {
    workspaceId: v.string(),
    ownerId: v.union(v.string(), v.null()),
    status: v.string(),
    stepProgress: v.number(),
    formData: v.any(),
    clientId: v.union(v.string(), v.null()),
    clientName: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

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

export const update = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    status: v.optional(v.string()),
    stepProgress: v.optional(v.number()),
    formData: v.optional(v.any()),
    clientId: v.optional(v.union(v.string(), v.null())),
    clientName: v.optional(v.union(v.string(), v.null())),
    aiInsights: v.optional(v.union(v.any(), v.null())),
    aiSuggestions: v.optional(v.union(v.string(), v.null())),
    pdfUrl: v.optional(v.union(v.string(), v.null())),
    pptUrl: v.optional(v.union(v.string(), v.null())),
    pdfStorageId: v.optional(v.union(v.string(), v.null())),
    pptStorageId: v.optional(v.union(v.string(), v.null())),
    presentationDeck: v.optional(v.union(v.any(), v.null())),
    updatedAtMs: v.number(),
    lastAutosaveAtMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw new Error('Proposal not found')
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

export const remove = mutation({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      return { ok: true }
    }

    await ctx.db.delete(existing._id)
    return { ok: true }
  },
})

export const bulkUpsert = mutation({
  args: {
    proposals: v.array(
      v.object({
        workspaceId: v.string(),
        legacyId: v.string(),
        ownerId: v.union(v.string(), v.null()),
        status: v.string(),
        stepProgress: v.number(),
        formData: v.any(),
        aiInsights: v.union(v.any(), v.null()),
        aiSuggestions: v.union(v.string(), v.null()),
        pdfUrl: v.union(v.string(), v.null()),
        pptUrl: v.union(v.string(), v.null()),
        pdfStorageId: v.optional(v.union(v.string(), v.null())),
        pptStorageId: v.optional(v.union(v.string(), v.null())),
        clientId: v.union(v.string(), v.null()),
        clientName: v.union(v.string(), v.null()),
        presentationDeck: v.union(v.any(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
        lastAutosaveAtMs: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

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
