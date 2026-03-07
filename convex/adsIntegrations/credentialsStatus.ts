import { internal } from '../_generated/api'

import {
  Errors,
  assertCronKey,
  hasOwn,
  internalMutation,
  mutation,
  normalizeClientId,
  nowMs,
  v,
} from './shared'

const updateIntegrationCredentialsArgs = {
  workspaceId: v.string(),
  providerId: v.string(),
  clientId: v.optional(v.union(v.string(), v.null())),
  accessToken: v.optional(v.union(v.string(), v.null())),
  refreshToken: v.optional(v.union(v.string(), v.null())),
  idToken: v.optional(v.union(v.string(), v.null())),
  accessTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
  refreshTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
  developerToken: v.optional(v.union(v.string(), v.null())),
  loginCustomerId: v.optional(v.union(v.string(), v.null())),
  managerCustomerId: v.optional(v.union(v.string(), v.null())),
  accountId: v.optional(v.union(v.string(), v.null())),
  accountName: v.optional(v.union(v.string(), v.null())),
  linkedAtMs: v.optional(v.union(v.number(), v.null())),
}

export const updateIntegrationCredentialsInternal = internalMutation({
  args: updateIntegrationCredentialsArgs,
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (!existing) {
      // Create a minimal record if one doesn't exist yet.
        await ctx.db.insert('adIntegrations', {
          workspaceId: args.workspaceId,
          providerId: args.providerId,
          clientId,
          accessToken: args.accessToken ?? null,
          idToken: args.idToken ?? null,
          refreshToken: args.refreshToken ?? null,
          scopes: [],
          accountId: args.accountId ?? null,
          accountName: args.accountName ?? null,
          currency: null,
          developerToken: args.developerToken ?? null,
          loginCustomerId: args.loginCustomerId ?? null,
          managerCustomerId: args.managerCustomerId ?? null,
          accessTokenExpiresAtMs: args.accessTokenExpiresAtMs ?? null,
          refreshTokenExpiresAtMs: args.refreshTokenExpiresAtMs ?? null,
          lastSyncStatus: 'pending',
          lastSyncMessage: null,
          lastSyncedAtMs: null,
          lastSyncRequestedAtMs: timestamp,
          linkedAtMs: hasOwn(args, 'linkedAtMs') ? (args.linkedAtMs ?? null) : timestamp,
          autoSyncEnabled: null,
          syncFrequencyMinutes: null,
          scheduledTimeframeDays: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        return { ok: true }
      }

    const patch: Record<string, unknown> = {
      updatedAt: timestamp,
      lastSyncRequestedAtMs: timestamp,
    }

    if (hasOwn(args, 'linkedAtMs')) patch.linkedAtMs = args.linkedAtMs ?? null

    if (hasOwn(args, 'accessToken')) patch.accessToken = args.accessToken ?? null
    if (hasOwn(args, 'refreshToken')) patch.refreshToken = args.refreshToken ?? null
    if (hasOwn(args, 'idToken')) patch.idToken = args.idToken ?? null
    if (hasOwn(args, 'developerToken')) patch.developerToken = args.developerToken ?? null
    if (hasOwn(args, 'loginCustomerId')) patch.loginCustomerId = args.loginCustomerId ?? null
    if (hasOwn(args, 'managerCustomerId')) patch.managerCustomerId = args.managerCustomerId ?? null
    if (hasOwn(args, 'accountId')) patch.accountId = args.accountId ?? null
    if (hasOwn(args, 'accountName')) patch.accountName = args.accountName ?? null
    if (hasOwn(args, 'accessTokenExpiresAtMs')) patch.accessTokenExpiresAtMs = args.accessTokenExpiresAtMs ?? null
    if (hasOwn(args, 'refreshTokenExpiresAtMs')) patch.refreshTokenExpiresAtMs = args.refreshTokenExpiresAtMs ?? null

    await ctx.db.patch(existing._id, patch)
    return { ok: true }
  },
})

export const updateIntegrationCredentials = mutation({
  args: updateIntegrationCredentialsArgs,
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }
    return await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, args)
  },
})

export const updateIntegrationStatusInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('error')),
    message: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (!existing) return { ok: true }

    await ctx.db.patch(existing._id, {
      lastSyncStatus: args.status,
      lastSyncMessage: args.message ?? null,
      lastSyncedAtMs: args.status === 'success' ? timestamp : null,
      updatedAt: timestamp,
    })

    return { ok: true }
  },
})

export const updateIntegrationStatus = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('error')),
    message: v.optional(v.union(v.string(), v.null())),
    cronKey: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      assertCronKey(ctx, { cronKey: args.cronKey ?? null })
    }
    return await ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId: args.clientId,
      status: args.status,
      message: args.message,
    })
  },
})

export const markIntegrationSyncRequested = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.literal('pending'), v.literal('never'), v.literal('error'), v.literal('success'))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (!existing) {
      await ctx.db.insert('adIntegrations', {
        workspaceId: args.workspaceId,
        providerId: args.providerId,
        clientId,
        accessToken: null,
        idToken: null,
        refreshToken: null,
        scopes: [],
        accountId: null,
        accountName: null,
        currency: null,
        developerToken: null,
        loginCustomerId: null,
        managerCustomerId: null,
        accessTokenExpiresAtMs: null,
        refreshTokenExpiresAtMs: null,
        lastSyncStatus: args.status ?? 'pending',
        lastSyncMessage: null,
        lastSyncedAtMs: null,
        lastSyncRequestedAtMs: timestamp,
        linkedAtMs: null,
        autoSyncEnabled: null,
        syncFrequencyMinutes: null,
        scheduledTimeframeDays: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      return { ok: true }
    }

    await ctx.db.patch(existing._id, {
      lastSyncStatus: args.status ?? 'pending',
      lastSyncMessage: null,
      lastSyncRequestedAtMs: timestamp,
      updatedAt: timestamp,
    })

    return { ok: true }
  },
})

export const updateIntegrationPreferences = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    autoSyncEnabled: v.optional(v.union(v.boolean(), v.null())),
    syncFrequencyMinutes: v.optional(v.union(v.number(), v.null())),
    scheduledTimeframeDays: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    const existing = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (!existing) return { ok: true }

    const patch: Record<string, unknown> = { updatedAt: timestamp }

    if (hasOwn(args, 'autoSyncEnabled')) patch.autoSyncEnabled = args.autoSyncEnabled ?? null
    if (hasOwn(args, 'syncFrequencyMinutes')) patch.syncFrequencyMinutes = args.syncFrequencyMinutes ?? null
    if (hasOwn(args, 'scheduledTimeframeDays')) patch.scheduledTimeframeDays = args.scheduledTimeframeDays ?? null

    await ctx.db.patch(existing._id, patch)
    return { ok: true }
  },
})

