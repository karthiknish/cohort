import { internalMutation, mutation } from '../../../_generated/server'
import { v } from 'convex/values'
import { Errors } from '../../../errors'
import { requireWorkspaceAccess } from '../../../functions'
import { normalizeClientId } from '@/lib/normalizeClientId'

function nowMs() {
  return Date.now()
}

export const persistIntegrationTokens = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    accessToken: v.union(v.string(), v.null()),
    refreshToken: v.optional(v.union(v.string(), v.null())),
    scopes: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal('pending'), v.literal('success'), v.literal('error'), v.literal('never'))),
    metaUserId: v.optional(v.union(v.string(), v.null())),
    metaUserName: v.optional(v.union(v.string(), v.null())),
    accessTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
    refreshTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)

    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    const payload = {
      workspaceId: args.workspaceId,
      clientId,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken ?? null,
      scopes: args.scopes ?? [],
      metaUserId: args.metaUserId ?? null,
      metaUserName: args.metaUserName ?? null,
      facebookPageId: existing?.facebookPageId ?? null,
      facebookPageName: existing?.facebookPageName ?? null,
      instagramBusinessId: existing?.instagramBusinessId ?? null,
      instagramBusinessName: existing?.instagramBusinessName ?? null,
      accessTokenExpiresAtMs: args.accessTokenExpiresAtMs ?? null,
      refreshTokenExpiresAtMs: args.refreshTokenExpiresAtMs ?? null,
      lastSyncStatus: args.status ?? 'pending',
      lastSyncMessage: null as string | null,
      lastSyncedAtMs: existing?.lastSyncedAtMs ?? null,
      lastSyncRequestedAtMs: timestamp,
      linkedAtMs: existing?.linkedAtMs ?? timestamp,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
    } else {
      await ctx.db.insert('socialIntegrations', payload)
    }

    return { ok: true }
  },
})

export const confirmSurfaceBinding = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    facebookPageId: v.string(),
    facebookPageName: v.string(),
    instagramBusinessId: v.optional(v.union(v.string(), v.null())),
    instagramBusinessName: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)

    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    if (!existing?.accessToken) {
      throw Errors.integration.notConfigured('Social', 'Connect Meta before selecting a Page')
    }

    await ctx.db.patch(existing._id, {
      facebookPageId: args.facebookPageId,
      facebookPageName: args.facebookPageName,
      instagramBusinessId: args.instagramBusinessId ?? null,
      instagramBusinessName: args.instagramBusinessName ?? null,
      lastSyncStatus: 'pending',
      lastSyncRequestedAtMs: timestamp,
      updatedAt: timestamp,
    })

    await ctx.db.insert('socialSyncJobs', {
      workspaceId: args.workspaceId,
      clientId,
      surface: null,
      jobType: 'initial-backfill',
      timeframeDays: 30,
      status: 'queued',
      createdAtMs: timestamp,
      startedAtMs: null,
      processedAtMs: null,
      errorMessage: null,
    })

    return { ok: true }
  },
})

export const disconnectIntegration = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)

    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    if (!existing) {
      return { ok: true }
    }

    await ctx.db.delete(existing._id)
    return { ok: true }
  },
})

export const updateIntegrationStatusInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    status: v.union(v.literal('never'), v.literal('pending'), v.literal('success'), v.literal('error')),
    message: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId)

    const existing = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    if (!existing) return { ok: false }

    await ctx.db.patch(existing._id, {
      lastSyncStatus: args.status,
      lastSyncMessage: args.message,
      lastSyncedAtMs: args.status === 'success' ? timestamp : existing.lastSyncedAtMs,
      updatedAt: timestamp,
    })

    return { ok: true }
  },
})
