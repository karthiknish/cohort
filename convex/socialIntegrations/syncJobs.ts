import { internalMutation, internalQuery, mutation } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { v } from 'convex/values'
import { z } from 'zod/v4'
import { Errors } from '../errors'
import { zWorkspaceMutation } from '../functions'

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function nowMs() {
  return Date.now()
}

export type ClaimedSocialSyncJob = {
  id: Id<'socialSyncJobs'>
  clientId: string | null
  surface: string | null
  timeframeDays: number
}

export const enqueueSyncJobInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    surface: v.optional(v.union(v.string(), v.null())),
    jobType: v.optional(
      v.union(v.literal('initial-backfill'), v.literal('scheduled-sync'), v.literal('manual-sync')),
    ),
    timeframeDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const id = await ctx.db.insert('socialSyncJobs', {
      workspaceId: args.workspaceId,
      clientId,
      surface: args.surface ?? null,
      jobType: args.jobType ?? 'manual-sync',
      timeframeDays: args.timeframeDays ?? 30,
      status: 'queued',
      createdAtMs: timestamp,
      startedAtMs: null,
      processedAtMs: null,
      errorMessage: null,
    })

    return { jobId: id }
  },
})

export const requestManualSync = zWorkspaceMutation({
  args: {
    clientId: z.string().nullable().optional(),
    surface: z.enum(['facebook', 'instagram']).nullable().optional(),
    timeframeDays: z.number().default(30),
  },
  returns: z.object({ jobId: z.string() }),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)
    const timestamp = nowMs()

    const integration = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    if (!integration?.accessToken || !integration.facebookPageId) {
      throw Errors.integration.notConfigured('Meta', 'Connect Meta and select a Facebook Page before syncing')
    }

    const id = await ctx.db.insert('socialSyncJobs', {
      workspaceId: args.workspaceId,
      clientId,
      surface: args.surface ?? null,
      jobType: 'manual-sync',
      timeframeDays: args.timeframeDays,
      status: 'queued',
      createdAtMs: timestamp,
      startedAtMs: null,
      processedAtMs: null,
      errorMessage: null,
    })

    if (integration) {
      await ctx.db.patch(integration._id, {
        lastSyncStatus: 'pending',
        lastSyncRequestedAtMs: timestamp,
        updatedAt: timestamp,
      })
    }

    return { jobId: id }
  },
})

export const claimNextSyncJobInternal = internalMutation({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args): Promise<ClaimedSocialSyncJob | null> => {
    const timestamp = nowMs()

    const next = await ctx.db
      .query('socialSyncJobs')
      .withIndex('by_workspace_status_createdAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('status', 'queued'),
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
      clientId: next.clientId,
      surface: next.surface,
      timeframeDays: next.timeframeDays,
    }
  },
})

export const completeSyncJobInternal = internalMutation({
  args: {
    jobId: v.id('socialSyncJobs'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: 'success',
      processedAtMs: nowMs(),
      errorMessage: null,
    })
    return { ok: true }
  },
})

export const failSyncJobInternal = internalMutation({
  args: {
    jobId: v.id('socialSyncJobs'),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: 'error',
      processedAtMs: nowMs(),
      errorMessage: args.message,
    })
    return { ok: true }
  },
})

export const listWorkspacesWithQueuedJobsInternal = internalQuery({
  handler: async (ctx): Promise<string[]> => {
    const queued = await ctx.db
      .query('socialSyncJobs')
      .withIndex('by_status_processedAt', (q) => q.eq('status', 'queued'))
      .collect()

    const seen = new Set<string>()
    for (const job of queued) {
      seen.add(job.workspaceId)
    }
    return [...seen]
  },
})
