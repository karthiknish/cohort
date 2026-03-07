import { internal } from '../_generated/api'

import {
  type ClaimedSyncJob,
  assertCronKey,
  internalMutation,
  mutation,
  normalizeClientId,
  nowMs,
  v,
  z,
  zWorkspaceQuery,
} from './shared'

export const enqueueSyncJob = internalMutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    jobType: v.optional(v.union(v.literal('initial-backfill'), v.literal('scheduled-sync'), v.literal('manual-sync'))),
    timeframeDays: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    await ctx.db.insert('adSyncJobs', {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
      jobType: args.jobType ?? 'initial-backfill',
      timeframeDays: args.timeframeDays ?? 90,
      status: 'queued',
      createdAtMs: timestamp,
      startedAtMs: null,
      processedAtMs: null,
      errorMessage: null,
    })

    return { ok: true }
  },
})

export const claimNextSyncJobInternal = internalMutation({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args): Promise<ClaimedSyncJob | null> => {
    const timestamp = nowMs()

    const next = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_workspace_status_createdAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('status', 'queued')
      )
      .order('asc')
      .first()

    if (!next) return null

    await ctx.db.patch(next._id, {
      status: 'running',
      startedAtMs: timestamp,
      errorMessage: null,
    })

    return {
      id: next._id,
      providerId: next.providerId,
      clientId: next.clientId,
      jobType: next.jobType,
      timeframeDays: next.timeframeDays,
      status: 'running' as const,
      createdAtMs: next.createdAtMs,
      startedAtMs: timestamp,
      processedAtMs: null,
      errorMessage: null,
    }
  },
})

export const claimNextSyncJob = mutation({
  args: {
    workspaceId: v.string(),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<ClaimedSyncJob | null> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    }
    return await ctx.runMutation(internal.adsIntegrations.claimNextSyncJobInternal, {
      workspaceId: args.workspaceId,
    })
  },
})

export const completeSyncJobInternal = internalMutation({
  args: {
    jobId: v.id('adSyncJobs'),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const timestamp = nowMs()
    await ctx.db.patch(args.jobId, {
      status: 'success',
      processedAtMs: timestamp,
      errorMessage: null,
    })
    return { ok: true }
  },
})

export const completeSyncJob = mutation({
  args: {
    jobId: v.id('adSyncJobs'),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    }
    return await ctx.runMutation(internal.adsIntegrations.completeSyncJobInternal, {
      jobId: args.jobId,
    })
  },
})

export const cleanupOldJobsInternal = internalMutation({
  args: {
    cutoffMs: v.number(),
  },
  handler: async (ctx, args): Promise<{ deleted: number }> => {
    const jobs = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_status_processedAt', (q) => q.eq('status', 'success'))
      .collect()

    const completed = jobs.concat(
      await ctx.db
        .query('adSyncJobs')
        .withIndex('by_status_processedAt', (q) => q.eq('status', 'error'))
        .collect()
    )

    let deleted = 0
    for (const job of completed) {
      const processedAt = job.processedAtMs
      if (typeof processedAt === 'number' && processedAt < args.cutoffMs) {
        await ctx.db.delete(job._id)
        deleted++
      }
    }

    return { deleted }
  },
})

export const cleanupOldJobsServer = mutation({
  args: {
    cutoffMs: v.number(),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ deleted: number }> => {
    assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    return await ctx.runMutation(internal.adsIntegrations.cleanupOldJobsInternal, {
      cutoffMs: args.cutoffMs,
    })
  },
})

export const resetStaleJobsInternal = internalMutation({
  args: {
    startedBeforeMs: v.number(),
  },
  handler: async (ctx, args): Promise<{ reset: number }> => {
    const running = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_status_startedAt', (q) => q.eq('status', 'running'))
      .collect()

    let reset = 0
    for (const job of running) {
      const startedAt = job.startedAtMs
      if (typeof startedAt === 'number' && startedAt < args.startedBeforeMs) {
        await ctx.db.patch(job._id, {
          status: 'queued',
          startedAtMs: null,
          errorMessage: 'Reset due to stale execution',
        })
        reset++
      }
    }

    return { reset }
  },
})

export const resetStaleJobsServer = mutation({
  args: {
    startedBeforeMs: v.number(),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ reset: number }> => {
    assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    return await ctx.runMutation(internal.adsIntegrations.resetStaleJobsInternal, {
      startedBeforeMs: args.startedBeforeMs,
    })
  },
})

export const failSyncJobInternal = internalMutation({
  args: {
    jobId: v.id('adSyncJobs'),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const timestamp = nowMs()
    await ctx.db.patch(args.jobId, {
      status: 'error',
      processedAtMs: timestamp,
      errorMessage: args.message,
    })
    return { ok: true }
  },
})

export const failSyncJob = mutation({
  args: {
    jobId: v.id('adSyncJobs'),
    message: v.string(),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    }
    return await ctx.runMutation(internal.adsIntegrations.failSyncJobInternal, {
      jobId: args.jobId,
      message: args.message,
    })
  },
})

export const hasPendingSyncJob = zWorkspaceQuery({
  args: {
    providerId: z.string(),
    clientId: z.string().nullable().optional(),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const queued = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_workspace_provider_client_status', (q) =>
        q.eq('workspaceId', args.workspaceId)
          .eq('providerId', args.providerId)
          .eq('clientId', clientId)
          .eq('status', 'queued')
      )
      .first()

    if (queued) return true

    const running = await ctx.db
      .query('adSyncJobs')
      .withIndex('by_workspace_provider_client_status', (q) =>
        q.eq('workspaceId', args.workspaceId)
          .eq('providerId', args.providerId)
          .eq('clientId', clientId)
          .eq('status', 'running')
      )
      .first()

    return !!running
  },
})

