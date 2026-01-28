import { v } from 'convex/values'
import { Errors } from './errors'
import { authenticatedMutation, authenticatedQuery } from './functions'
import { query } from './_generated/server'

function sanitizeString(value: string): string {
  return value.trim()
}

function sanitizeOptionalString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function ensureUniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of values) {
    const value = raw.trim()
    if (!value) continue
    if (seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

const customFormulaValidator = v.object({
  workspaceId: v.string(),
  formulaId: v.string(),
  name: v.string(),
  description: v.union(v.string(), v.null()),
  formula: v.string(),
  inputs: v.array(v.string()),
  outputMetric: v.string(),
  isActive: v.boolean(),
  createdBy: v.string(),
  createdAtMs: v.number(),
  updatedAtMs: v.number(),
})

/**
 * List active formulas for a workspace (no auth - server-side use).
 * Used by alert processor to evaluate custom formula alerts.
 */
export const listActiveForAlerts = query({
  args: { workspaceId: v.string() },
  returns: v.record(v.string(), v.object({ formula: v.string(), inputs: v.array(v.string()) })),
  handler: async (ctx, args) => {
    // No auth required - called from server-side alert processor
    const rows = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_isActive', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('isActive', true)
      )
      .collect()

    // Return as a map of formulaId -> formula details
    const formulas: Record<string, { formula: string; inputs: string[] }> = {}
    for (const row of rows) {
      formulas[row.legacyId] = {
        formula: row.formula,
        inputs: row.inputs,
      }
    }
    return formulas
  },
})

export const listByWorkspace = authenticatedQuery({
  args: {
    workspaceId: v.string(),
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(customFormulaValidator),
  handler: async (ctx, args) => {
    // Workspace access check
    if (ctx.user.role !== 'admin' && ctx.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    const activeOnly = args.activeOnly === true

    const baseQuery = ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId', (q: any) => q.eq('workspaceId', args.workspaceId))

    const rows = activeOnly
      ? await ctx.db
          .query('customFormulas')
          .withIndex('by_workspaceId_isActive', (q: any) => q.eq('workspaceId', args.workspaceId).eq('isActive', true))
          .collect()
      : await baseQuery.collect()

    rows.sort((a, b) => b.createdAtMs - a.createdAtMs)

    return rows.map((row) => ({
      workspaceId: row.workspaceId,
      formulaId: row.legacyId,
      name: row.name,
      description: row.description,
      formula: row.formula,
      inputs: row.inputs,
      outputMetric: row.outputMetric,
      isActive: row.isActive,
      createdBy: row.createdBy ?? '',
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }))
  },
})

export const getByLegacyId = authenticatedQuery({
  args: { workspaceId: v.string(), legacyId: v.string() },
  returns: v.union(v.null(), customFormulaValidator),
  handler: async (ctx, args) => {
    // Workspace access check
    if (ctx.user.role !== 'admin' && ctx.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    const row = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('Formula', args.legacyId)

    return {
      workspaceId: row.workspaceId,
      formulaId: row.legacyId,
      name: row.name,
      description: row.description,
      formula: row.formula,
      inputs: row.inputs,
      outputMetric: row.outputMetric,
      isActive: row.isActive,
      createdBy: row.createdBy ?? '',
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }
  },
})

export const create = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    formula: v.string(),
    inputs: v.array(v.string()),
    outputMetric: v.string(),
    createdBy: v.union(v.string(), v.null()),
  },
  returns: v.object({
    ok: v.literal(true),
    id: v.id('customFormulas'),
  }),
  handler: async (ctx, args) => {
    // Workspace access check
    if (ctx.user.role !== 'admin' && ctx.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    const timestamp = ctx.now

    const existing = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (existing) {
      throw Errors.resource.alreadyExists('Formula')
    }

    const payload = {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      name: sanitizeString(args.name),
      description: sanitizeOptionalString(args.description),
      formula: sanitizeString(args.formula),
      inputs: ensureUniqueStrings(args.inputs),
      outputMetric: sanitizeString(args.outputMetric),
      isActive: true,
      createdBy: sanitizeOptionalString(args.createdBy),
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
    }

    const id = await ctx.db.insert('customFormulas', payload)

    return { ok: true as const, id }
  },
})

export const update = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    formula: v.optional(v.string()),
    inputs: v.optional(v.array(v.string())),
    outputMetric: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    // Workspace access check
    if (ctx.user.role !== 'admin' && ctx.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    const existing = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Formula', args.legacyId)
    }

    const updates: Record<string, unknown> = {
      updatedAtMs: ctx.now,
    }

    if (args.name !== undefined) updates.name = sanitizeString(args.name)
    if (args.description !== undefined) {
      updates.description = sanitizeOptionalString(args.description)
    }
    if (args.formula !== undefined) updates.formula = sanitizeString(args.formula)
    if (args.inputs !== undefined) updates.inputs = ensureUniqueStrings(args.inputs)
    if (args.outputMetric !== undefined) updates.outputMetric = sanitizeString(args.outputMetric)
    if (args.isActive !== undefined) updates.isActive = args.isActive

    await ctx.db.patch(existing._id, updates)

    return { ok: true } as const
  },
})

export const remove = authenticatedMutation({
  args: { workspaceId: v.string(), legacyId: v.string() },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    // Workspace access check
    if (ctx.user.role !== 'admin' && ctx.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    const existing = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Formula', args.legacyId)
    }

    await ctx.db.delete(existing._id)

    return { ok: true } as const
  },
})
