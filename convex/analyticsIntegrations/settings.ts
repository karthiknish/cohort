import type { Doc } from '/_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

import {
  assertCronKey,
  hasOwn,
  internalMutation,
  mutation,
  normalizeClientId,
  nowMs,
  requireWorkspaceAccess,
  v,
} from './shared'

type ExistingIntegrationRow = Doc<'analyticsIntegrations'> | Doc<'adIntegrations'> | null
type AnalyticsIntegrationWrite = Omit<Doc<'analyticsIntegrations'>, '_id' | '_creationTime'>

async function findRows(ctx: MutationCtx, workspaceId: string, clientId: string | null) {
  const [current, legacy] = await Promise.all([
    ctx.db.query('analyticsIntegrations').withIndex('by_workspace_provider_client', (q) =>
      q.eq('workspaceId', workspaceId).eq('providerId', 'google-analytics').eq('clientId', clientId)
    ).unique(),
    ctx.db.query('adIntegrations').withIndex('by_workspace_provider_client', (q) =>
      q.eq('workspaceId', workspaceId).eq('providerId', 'google-analytics').eq('clientId', clientId)
    ).unique(),
  ])
  return { current, legacy }
}

function basePayload(existing: ExistingIntegrationRow, workspaceId: string, clientId: string | null, timestamp: number): AnalyticsIntegrationWrite {
  return {
    workspaceId,
    providerId: 'google-analytics' as const,
    clientId,
    accessToken: existing?.accessToken ?? null,
    idToken: existing?.idToken ?? null,
    refreshToken: existing?.refreshToken ?? null,
    scopes: existing?.scopes ?? [],
    accountId: existing?.accountId ?? null,
    accountName: existing?.accountName ?? null,
    currency: existing?.currency ?? null,
    developerToken: existing?.developerToken ?? null,
    loginCustomerId: existing?.loginCustomerId ?? null,
    managerCustomerId: existing?.managerCustomerId ?? null,
    accessTokenExpiresAtMs: existing?.accessTokenExpiresAtMs ?? null,
    refreshTokenExpiresAtMs: existing?.refreshTokenExpiresAtMs ?? null,
    lastSyncStatus: existing?.lastSyncStatus ?? 'pending',
    lastSyncMessage: existing?.lastSyncMessage ?? null,
    lastSyncedAtMs: existing?.lastSyncedAtMs ?? null,
    lastSyncRequestedAtMs: existing?.lastSyncRequestedAtMs ?? timestamp,
    linkedAtMs: existing?.linkedAtMs ?? null,
    autoSyncEnabled: existing?.autoSyncEnabled ?? null,
    syncFrequencyMinutes: existing?.syncFrequencyMinutes ?? null,
    scheduledTimeframeDays: existing?.scheduledTimeframeDays ?? null,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  }
}

export const persistGoogleAnalyticsTokens = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    accessToken: v.union(v.string(), v.null()),
    idToken: v.optional(v.union(v.string(), v.null())),
    refreshToken: v.optional(v.union(v.string(), v.null())),
    scopes: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal('pending'), v.literal('success'), v.literal('error'), v.literal('never'))),
    accountId: v.optional(v.union(v.string(), v.null())),
    accountName: v.optional(v.union(v.string(), v.null())),
    accessTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
    refreshTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)
    const { current, legacy } = await findRows(ctx, args.workspaceId, clientId)
    const existing = current ?? legacy
    const payload = {
      ...basePayload(existing, args.workspaceId, clientId, timestamp),
      accessToken: args.accessToken,
      idToken: args.idToken ?? existing?.idToken ?? null,
      refreshToken: args.refreshToken ?? existing?.refreshToken ?? null,
      scopes: args.scopes ?? existing?.scopes ?? [],
      accountId: args.accountId ?? existing?.accountId ?? null,
      accountName: args.accountName ?? existing?.accountName ?? null,
      accessTokenExpiresAtMs: args.accessTokenExpiresAtMs ?? existing?.accessTokenExpiresAtMs ?? null,
      refreshTokenExpiresAtMs: args.refreshTokenExpiresAtMs ?? existing?.refreshTokenExpiresAtMs ?? null,
      lastSyncStatus: args.status ?? existing?.lastSyncStatus ?? 'pending',
      lastSyncMessage: null,
      lastSyncRequestedAtMs: timestamp,
      linkedAtMs: existing?.linkedAtMs ?? timestamp,
    }
    if (current) await ctx.db.patch(current._id, payload)
    else await ctx.db.insert('analyticsIntegrations', payload)
    return { ok: true }
  },
})

export const updateGoogleAnalyticsCredentialsInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    accessToken: v.optional(v.union(v.string(), v.null())),
    refreshToken: v.optional(v.union(v.string(), v.null())),
    idToken: v.optional(v.union(v.string(), v.null())),
    accessTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
    refreshTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
    accountId: v.optional(v.union(v.string(), v.null())),
    accountName: v.optional(v.union(v.string(), v.null())),
    linkedAtMs: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)
    const { current, legacy } = await findRows(ctx, args.workspaceId, clientId)
    const existing = current ?? legacy
    const payload: AnalyticsIntegrationWrite = {
      ...basePayload(existing, args.workspaceId, clientId, timestamp),
      lastSyncRequestedAtMs: timestamp,
    }
    if (hasOwn(args, 'linkedAtMs')) payload.linkedAtMs = args.linkedAtMs ?? null
    if (hasOwn(args, 'accessToken')) payload.accessToken = args.accessToken ?? null
    if (hasOwn(args, 'refreshToken')) payload.refreshToken = args.refreshToken ?? null
    if (hasOwn(args, 'idToken')) payload.idToken = args.idToken ?? null
    if (hasOwn(args, 'accountId')) payload.accountId = args.accountId ?? null
    if (hasOwn(args, 'accountName')) payload.accountName = args.accountName ?? null
    if (hasOwn(args, 'accessTokenExpiresAtMs')) payload.accessTokenExpiresAtMs = args.accessTokenExpiresAtMs ?? null
    if (hasOwn(args, 'refreshTokenExpiresAtMs')) payload.refreshTokenExpiresAtMs = args.refreshTokenExpiresAtMs ?? null
    if (current) await ctx.db.patch(current._id, payload)
    else await ctx.db.insert('analyticsIntegrations', payload)
    return { ok: true }
  },
})

export const updateGoogleAnalyticsStatus = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('error')),
    message: v.optional(v.union(v.string(), v.null())),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      await requireWorkspaceAccess(ctx, args.workspaceId)
    } else {
      assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    }
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)
    const { current, legacy } = await findRows(ctx, args.workspaceId, clientId)
    const existing = current ?? legacy
    if (!existing) return { ok: true }
    const payload = {
      ...basePayload(existing, args.workspaceId, clientId, timestamp),
      lastSyncStatus: args.status,
      lastSyncMessage: args.message ?? null,
      lastSyncedAtMs: args.status === 'success' ? timestamp : null,
    }
    if (current) await ctx.db.patch(current._id, payload)
    else await ctx.db.insert('analyticsIntegrations', payload)
    return { ok: true }
  },
})

export const markGoogleAnalyticsSyncRequested = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.literal('pending'), v.literal('never'), v.literal('error'), v.literal('success'))),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)
    const { current, legacy } = await findRows(ctx, args.workspaceId, clientId)
    const existing = current ?? legacy
    const payload = {
      ...basePayload(existing, args.workspaceId, clientId, timestamp),
      lastSyncStatus: args.status ?? 'pending',
      lastSyncMessage: null,
      lastSyncRequestedAtMs: timestamp,
    }
    if (current) await ctx.db.patch(current._id, payload)
    else await ctx.db.insert('analyticsIntegrations', payload)
    return { ok: true }
  },
})

export const deleteGoogleAnalyticsIntegration = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)
    const clientId = normalizeClientId(args.clientId ?? null)
    const { current, legacy } = await findRows(ctx, args.workspaceId, clientId)
    if (current) await ctx.db.delete(current._id)
    if (legacy) await ctx.db.delete(legacy._id)
    return { ok: true }
  },
})

export const deleteGoogleAnalyticsSyncJobs = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)
    const clientId = normalizeClientId(args.clientId ?? null)
    for (const status of ['queued', 'running', 'error'] as const) {
      const jobs = await ctx.db.query('adSyncJobs').withIndex('by_workspace_provider_client_status', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', 'google-analytics').eq('clientId', clientId).eq('status', status)
      ).collect()
      for (const job of jobs) await ctx.db.delete(job._id)
    }
    return { ok: true }
  },
})

export const deleteGoogleAnalyticsMetrics = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId)
    const clientId = normalizeClientId(args.clientId ?? null)
    const rows = await ctx.db.query('adMetrics').withIndex('by_workspace_provider_date', (q) =>
      q.eq('workspaceId', args.workspaceId).eq('providerId', 'google-analytics')
    ).collect()
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
