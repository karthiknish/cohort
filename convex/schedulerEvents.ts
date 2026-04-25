import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
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
 * Called from trusted server routes (cron/worker) via ConvexHttpClient.
 * When env `SCHEDULER_EVENTS_SECRET` is set, `authSecret` must match (set same value in Convex + app server).
 */
export const insert = mutation({
  args: {
    /** Must match Convex env SCHEDULER_EVENTS_SECRET when that variable is set. */
    authSecret: v.optional(v.string()),
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
    const expected = process.env.SCHEDULER_EVENTS_SECRET
    if (typeof expected === 'string' && expected.length > 0 && args.authSecret !== expected) {
      throw Errors.auth.unauthorized('Invalid scheduler event credentials')
    }

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
    const BOUND = 5000
    const severity = args.severity
    const source = args.source

    const all = await (
      severity
        ? ctx.db
            .query('schedulerEvents')
            .withIndex('by_severity_createdAtMs', (iq) => iq.eq('severity', severity))
        : source
          ? ctx.db
              .query('schedulerEvents')
              .withIndex('by_source_createdAtMs', (iq) => iq.eq('source', source))
          : ctx.db.query('schedulerEvents').withIndex('by_createdAtMs', (iq) => iq)
    )
      .order('desc')
      .take(BOUND)

    const filtered = all.filter((row) => {
      if (severity && source) {
        return row.severity === severity && row.source === source
      }
      if (severity && row.severity !== severity) return false
      if (source && row.source !== source) return false
      return true
    })

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
