import { internal } from '../_generated/api'

import {
  Errors,
  assertCronKey,
  internalMutation,
  mutation,
  normalizeClientId,
  nowMs,
  query,
  v,
} from './shared'

const metricRawPayloadValidator = v.union(
  v.null(),
  v.boolean(),
  v.number(),
  v.string(),
  v.array(v.string()),
  v.array(v.number()),
  v.array(v.boolean()),
  v.record(v.string(), v.string()),
  v.record(v.string(), v.number()),
  v.record(v.string(), v.boolean())
)

const metricCreativeValidator = v.object({
  id: v.string(),
  name: v.string(),
  type: v.string(),
  url: v.optional(v.string()),
  spend: v.optional(v.number()),
  impressions: v.optional(v.number()),
  clicks: v.optional(v.number()),
  conversions: v.optional(v.number()),
  revenue: v.optional(v.number()),
})

const metricInputValidator = v.object({
  providerId: v.string(),
  clientId: v.optional(v.union(v.string(), v.null())),
  accountId: v.optional(v.union(v.string(), v.null())),
  /** Canonical surface id stamped at write time (replaces publisherPlatform as canonical field). */
  surfaceId: v.optional(v.union(v.string(), v.null())),
  /** Legacy alias: accepted for backward compat with existing callers. */
  publisherPlatform: v.optional(v.union(v.string(), v.null())),
  /** Native account currency stamped at write time by the sync worker. */
  currency: v.optional(v.union(v.string(), v.null())),
  /** How currency was determined ('metric' | 'integration' | 'unknown'). */
  currencySource: v.optional(
    v.union(v.literal('metric'), v.literal('integration'), v.literal('unknown'), v.null()),
  ),
  date: v.string(),
  spend: v.number(),
  impressions: v.number(),
  clicks: v.number(),
  conversions: v.number(),
  revenue: v.optional(v.union(v.number(), v.null())),
  campaignId: v.optional(v.string()),
  campaignName: v.optional(v.string()),
  creatives: v.optional(v.array(metricCreativeValidator)),
  rawPayload: v.optional(metricRawPayloadValidator),
})

export const writeMetricsBatchInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    metrics: v.array(metricInputValidator),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; inserted: number }> => {
    const timestamp = nowMs()
    for (const metric of args.metrics) {
      // surfaceId is canonical; publisherPlatform is the legacy alias.
      // Accept both for backward compat, preferring surfaceId when present.
      const surfaceId = metric.surfaceId ?? metric.publisherPlatform ?? null
      const publisherPlatform = metric.publisherPlatform ?? metric.surfaceId ?? null

      await ctx.db.insert('adMetrics', {
        workspaceId: args.workspaceId,
        providerId: metric.providerId,
        clientId: normalizeClientId(metric.clientId ?? null),
        accountId: normalizeClientId(metric.accountId ?? null),
        surfaceId: normalizeClientId(surfaceId),
        publisherPlatform: normalizeClientId(publisherPlatform),
        currency: typeof metric.currency === 'string' ? metric.currency.trim().toUpperCase() : null,
        currencySource: metric.currencySource ?? null,
        date: metric.date,
        spend: metric.spend,
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
        revenue: metric.revenue ?? null,
        campaignId: typeof metric.campaignId === 'string' ? metric.campaignId : null,
        campaignName: typeof metric.campaignName === 'string' ? metric.campaignName : null,
        creatives: Array.isArray(metric.creatives) ? metric.creatives : null,
        rawPayload: metric.rawPayload,
        createdAtMs: timestamp,
      })
    }

    return { ok: true, inserted: args.metrics.length }
  },
})

export const writeMetricsBatch = mutation({
  args: {
    workspaceId: v.string(),
    cronKey: v.optional(v.union(v.string(), v.null())),
    metrics: v.array(metricInputValidator),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; inserted: number }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    }
    return await ctx.runMutation(internal.adsIntegrations.writeMetricsBatchInternal, {
      workspaceId: args.workspaceId,
      metrics: args.metrics,
    })
  },
})

export const deleteAdIntegration = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (!existing) return { ok: true }

    await ctx.db.delete(existing._id)
    return { ok: true }
  },
})

export const deleteSyncJobs = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    for (const status of ['queued', 'running', 'error'] as const) {
      const jobs = await ctx.db
        .query('adSyncJobs')
        .withIndex('by_workspace_provider_client_status', (q) =>
          q.eq('workspaceId', args.workspaceId)
            .eq('providerId', args.providerId)
            .eq('clientId', clientId)
            .eq('status', status)
        )
        .collect()

      for (const job of jobs) {
        await ctx.db.delete(job._id)
      }
    }

    return { ok: true }
  },
})

export const deleteProviderMetrics = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)
    const rows = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_provider_date', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId)
      )
      .collect()

    let deleted = 0
    for (const row of rows) {
      if ((clientId === null ? row.clientId === null : row.clientId === clientId)) {
        await ctx.db.delete(row._id)
        deleted += 1
      }
    }

    return { ok: true, deleted }
  },
})

/**
 * List all provider IDs for integrations in a workspace.
 * Used by auto-sync scheduler to enumerate integrations.
 * No auth required - called from server-side cron code with cronKey.
 */
export const listWorkspaceIntegrationIds = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    // No auth check - this is called by cron jobs
    const integrations = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return integrations.map((row) => row.providerId)
  },
})

/**
 * List all unique workspace IDs that have ad integrations.
 * Used by the cron scheduler to iterate over all workspaces.
 * No auth required - called from server-side cron code.
 */
export const listAllWorkspacesWithIntegrations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // No auth check - this is called by cron jobs
    const limit = Math.min(Math.max(args.limit ?? 1000, 1), 5000)

    const integrations = await ctx.db
      .query('adIntegrations')
      .take(limit * 10) // Over-fetch since we need unique workspaceIds

    const workspaceIds = new Set<string>()
    for (const row of integrations) {
      workspaceIds.add(row.workspaceId)
      if (workspaceIds.size >= limit) break
    }

    return Array.from(workspaceIds)
  },
})

/**
 * List workspaces that have queued sync jobs.
 * Used by the worker to find workspaces to process.
 * No auth required - called from server-side cron code.
 */
export const listWorkspacesWithQueuedJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // No auth check - this is called by cron jobs
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500)

    const queuedJobs = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_status_processedAt', (q) => q.eq('status', 'queued'))
      .take(limit * 5) // Over-fetch since we need unique workspaceIds

    const workspaceIds = new Set<string>()
    for (const job of queuedJobs) {
      workspaceIds.add(job.workspaceId)
      if (workspaceIds.size >= limit) break
    }

    return Array.from(workspaceIds)
  },
})

/**
 * Count queued jobs for a workspace.
 * Used by the worker to check if there are jobs to process.
 * No auth required - called from server-side cron code.
 */
export const countQueuedJobsForWorkspace = query({
  args: {
    workspaceId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // No auth check - this is called by cron jobs
    const limit = Math.min(args.limit ?? 10, 100)

    const jobs = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_workspace_status_createdAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('status', 'queued')
      )
      .take(limit)

    return { count: jobs.length, hasMore: jobs.length >= limit }
  },
})

/**
 * HTTP-callable mutation to clean up old completed/failed jobs.
 * Called from cron route with cronKey authentication.
 */
