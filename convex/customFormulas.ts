import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
import {
  authenticatedMutation,
  authenticatedQuery,
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'

function nowMs() {
  return Date.now()
}

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

/**
 * List active formulas for a workspace (no auth - server-side use).
 * Used by alert processor to evaluate custom formula alerts.
 */
export const listActiveForAlerts = query({
  args: { workspaceId: v.string() },
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

export const listByWorkspace = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    activeOnly: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
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

export const getByLegacyId = zAuthenticatedQuery({
  args: { workspaceId: z.string(), legacyId: z.string() },
  handler: async (ctx, args) => {
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

export const create = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    formula: z.string(),
    inputs: z.array(z.string()),
    outputMetric: z.string(),
    createdBy: z.string().nullable().optional(),
  },
  handler: async (ctx, args) => {
    const timestamp = nowMs()

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
      description: sanitizeOptionalString((args.description ?? null) as string | null),
      formula: sanitizeString(args.formula),
      inputs: ensureUniqueStrings(args.inputs),
      outputMetric: sanitizeString(args.outputMetric),
      isActive: true,
      createdBy: sanitizeOptionalString((args.createdBy ?? null) as string | null),
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
    }

    const id = await ctx.db.insert('customFormulas', payload)

    return { ok: true, id }
  },
})

export const update = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    formula: z.string().optional(),
    inputs: z.array(z.string()).optional(),
    outputMetric: z.string().optional(),
    isActive: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Formula', args.legacyId)
    }

    const updates: Record<string, unknown> = {
      updatedAtMs: nowMs(),
    }

    if (args.name !== undefined) updates.name = sanitizeString(args.name)
    if (args.description !== undefined) {
      updates.description = sanitizeOptionalString((args.description ?? null) as string | null)
    }
    if (args.formula !== undefined) updates.formula = sanitizeString(args.formula)
    if (args.inputs !== undefined) updates.inputs = ensureUniqueStrings(args.inputs)
    if (args.outputMetric !== undefined) updates.outputMetric = sanitizeString(args.outputMetric)
    if (args.isActive !== undefined) updates.isActive = args.isActive

    await ctx.db.patch(existing._id, updates)

    return { ok: true }
  },
})

export const remove = zAuthenticatedMutation({
  args: { workspaceId: z.string(), legacyId: z.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('customFormulas')
      .withIndex('by_workspaceId_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Formula', args.legacyId)
    }

    await ctx.db.delete(existing._id)

    return { ok: true }
  },
})
