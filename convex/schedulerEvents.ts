import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { adminQuery } from './functions'

const providerFailureThresholdValidator = v.object({
  providerId: v.string(),
  failedJobs: v.number(),
  threshold: v.union(v.number(), v.null()),
})

const schedulerEventValidator = v.object({
  id: v.id('schedulerEvents'),
  createdAt: v.string(),
  source: v.string(),
  operation: v.union(v.string(), v.null()),
  processedJobs: v.number(),
  successfulJobs: v.number(),
  failedJobs: v.number(),
  hadQueuedJobs: v.boolean(),
  inspectedQueuedJobs: v.union(v.number(), v.null()),
  durationMs: v.union(v.number(), v.null()),
  severity: v.string(),
  errors: v.array(v.string()),
  notes: v.union(v.string(), v.null()),
  failureThreshold: v.union(v.number(), v.null()),
  providerFailureThresholds: v.array(providerFailureThresholdValidator),
})

/**
 * Insert a new scheduler event.
 * Called from server-side scheduler monitor - no auth required.
 */
export const insert = mutation({
  args: {
    source: v.string(),
    operation: v.union(v.string(), v.null()),
    processedJobs: v.union(v.number(), v.null()),
    successfulJobs: v.union(v.number(), v.null()),
    failedJobs: v.union(v.number(), v.null()),
    hadQueuedJobs: v.union(v.boolean(), v.null()),
    inspectedQueuedJobs: v.union(v.number(), v.null()),
    durationMs: v.union(v.number(), v.null()),
    severity: v.string(),
    errors: v.array(v.string()),
    notes: v.union(v.string(), v.null()),
    failureThreshold: v.union(v.number(), v.null()),
    providerFailureThresholds: v.array(
      v.object({
        providerId: v.string(),
        failedJobs: v.number(),
        threshold: v.union(v.number(), v.null()),
      })
    ),
  },
  returns: v.object({
    ok: v.literal(true),
    id: v.id('schedulerEvents'),
  }),
  handler: async (ctx, args) => {
    // No auth required - called from server-side scheduler code
    const id = await ctx.db.insert('schedulerEvents', {
      createdAtMs: Date.now(),
      source: args.source,
      operation: args.operation,
      processedJobs: args.processedJobs,
      successfulJobs: args.successfulJobs,
      failedJobs: args.failedJobs,
      hadQueuedJobs: args.hadQueuedJobs,
      inspectedQueuedJobs: args.inspectedQueuedJobs,
      durationMs: args.durationMs,
      severity: args.severity,
      errors: args.errors,
      notes: args.notes,
      failureThreshold: args.failureThreshold,
      providerFailureThresholds: args.providerFailureThresholds,
    })
    return { ok: true as const, id }
  },
})

export const list = adminQuery({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    severity: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  returns: v.object({
    events: v.array(schedulerEventValidator),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 25, 1), 100)

    const all = await ctx.db.query('schedulerEvents').withIndex('by_createdAtMs', (q) => q).collect()

    const filtered = all.filter((row) => {
      if (args.severity && row.severity !== args.severity) return false
      if (args.source && row.source !== args.source) return false
      return true
    })

    filtered.sort((a, b) => b.createdAtMs - a.createdAtMs)

    const cursorPos = typeof args.cursor === 'string' ? Number(args.cursor) : 0
    const start = Number.isFinite(cursorPos) && cursorPos > 0 ? cursorPos : 0

    const slice = filtered.slice(start, start + limit)
    const nextCursor = start + limit < filtered.length ? String(start + limit) : null

    const events = slice.map((row) => ({
      id: row._id,
      createdAt: new Date(row.createdAtMs).toISOString(),
      source: row.source,
      operation: row.operation,
      processedJobs: row.processedJobs ?? 0,
      successfulJobs: row.successfulJobs ?? 0,
      failedJobs: row.failedJobs ?? 0,
      hadQueuedJobs: Boolean(row.hadQueuedJobs),
      inspectedQueuedJobs: row.inspectedQueuedJobs,
      durationMs: row.durationMs,
      severity: row.severity,
      errors: row.errors.slice(0, 10),
      notes: row.notes,
      failureThreshold: row.failureThreshold,
      providerFailureThresholds: row.providerFailureThresholds,
    }))

    return { events, nextCursor }
  },
})
