import { action, internalMutation, mutation, query, internalQuery } from './_generated/server'
import { v } from 'convex/values'
import { z } from 'zod/v4'
import { internal } from './_generated/api'
import { Errors, withErrorHandling } from './errors'
import { authenticatedMutation, authenticatedQuery, workspaceMutation, zWorkspaceQuery, zWorkspaceMutation, zWorkspaceQueryActive } from './functions'

function nowMs() {
  return Date.now()
}

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function assertCronKey(ctx: { auth: { getUserIdentity: () => Promise<unknown> } }, args: { cronKey?: string | null }) {
  // Allows background workers (httpActions/schedulers) to call specific mutations
  // without requiring a user identity, guarded by a shared secret.
  const secret = process.env.INTEGRATIONS_CRON_SECRET
  if (!secret) {
    throw Errors.base.internal('INTEGRATIONS_CRON_SECRET is not configured')
  }

  if (args.cronKey !== secret) {
    throw Errors.auth.unauthorized()
  }
}

function hasOwn(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

const adIntegrationZ = z.object({
  providerId: z.string(),
  clientId: z.string().nullable(),
  accessToken: z.string().nullable(),
  idToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  scopes: z.array(z.string()),
  accountId: z.string().nullable(),
  accountName: z.string().nullable(),
  currency: z.string().nullable(),
  developerToken: z.string().nullable(),
  loginCustomerId: z.string().nullable(),
  managerCustomerId: z.string().nullable(),
  accessTokenExpiresAtMs: z.number().nullable(),
  refreshTokenExpiresAtMs: z.number().nullable(),
  lastSyncStatus: z.union([
    z.literal('never'),
    z.literal('pending'),
    z.literal('success'),
    z.literal('error'),
  ]),
  lastSyncMessage: z.string().nullable(),
  lastSyncedAtMs: z.number().nullable(),
  lastSyncRequestedAtMs: z.number().nullable(),
  linkedAtMs: z.number().nullable(),
  autoSyncEnabled: z.boolean().nullable(),
  syncFrequencyMinutes: z.number().nullable(),
  scheduledTimeframeDays: z.number().nullable(),
})

export const getAdIntegrationInternal = internalQuery({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<z.infer<typeof adIntegrationZ>> => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const row = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Integration', args.providerId)
    }

    return {
      providerId: row.providerId,
      clientId: row.clientId,
      accessToken: row.accessToken,
      idToken: row.idToken,
      refreshToken: row.refreshToken,
      scopes: row.scopes,
      accountId: row.accountId,
      accountName: row.accountName,
      currency: row.currency,
      developerToken: row.developerToken,
      loginCustomerId: row.loginCustomerId,
      managerCustomerId: row.managerCustomerId,
      accessTokenExpiresAtMs: row.accessTokenExpiresAtMs,
      refreshTokenExpiresAtMs: row.refreshTokenExpiresAtMs,
      lastSyncStatus: row.lastSyncStatus,
      lastSyncMessage: row.lastSyncMessage,
      lastSyncedAtMs: row.lastSyncedAtMs,
      lastSyncRequestedAtMs: row.lastSyncRequestedAtMs,
      linkedAtMs: row.linkedAtMs,
      autoSyncEnabled: row.autoSyncEnabled,
      syncFrequencyMinutes: row.syncFrequencyMinutes,
      scheduledTimeframeDays: row.scheduledTimeframeDays,
    }
  },
})

export const getAdIntegration = zWorkspaceQuery({
  args: {
    providerId: z.string(),
    clientId: z.string().nullable().optional(),
  },
  returns: adIntegrationZ,
  handler: async (ctx, args): Promise<z.infer<typeof adIntegrationZ>> => {
    return await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, args)
  },
})

export const listStatuses = zWorkspaceMutation({
  args: {
    clientId: z.string().nullable(),
  },
  returns: z.array(z.object({
    providerId: z.string(),
    clientId: z.string().nullable(),
    lastSyncStatus: z.string(),
    lastSyncMessage: z.string().nullable(),
    lastSyncedAtMs: z.number().nullable(),
    accountId: z.string().nullable(),
    accountName: z.string().nullable(),
  })),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId)

    // We scan by workspace and then filter clientId. This is fine because
    // the number of providers per workspace is small.
    const all = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return all
      .filter((row) => (clientId === null ? row.clientId === null : row.clientId === clientId))
      .map((row) => ({
        providerId: row.providerId,
        clientId: row.clientId,
        accountId: row.accountId,
        accountName: row.accountName,
        lastSyncStatus: row.lastSyncStatus,
        lastSyncMessage: row.lastSyncMessage,
        lastSyncedAtMs: row.lastSyncedAtMs,
        lastSyncRequestedAtMs: row.lastSyncRequestedAtMs,
        linkedAtMs: row.linkedAtMs,
        autoSyncEnabled: row.autoSyncEnabled,
        syncFrequencyMinutes: row.syncFrequencyMinutes,
        scheduledTimeframeDays: row.scheduledTimeframeDays,
      }))
  },
})


export const persistIntegrationTokens = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),

    accessToken: v.union(v.string(), v.null()),
    idToken: v.optional(v.union(v.string(), v.null())),
    refreshToken: v.optional(v.union(v.string(), v.null())),
    scopes: v.optional(v.array(v.string())),

    status: v.optional(v.union(v.literal('pending'), v.literal('success'), v.literal('error'), v.literal('never'))),

    accountId: v.optional(v.union(v.string(), v.null())),
    accountName: v.optional(v.union(v.string(), v.null())),
    developerToken: v.optional(v.union(v.string(), v.null())),
    loginCustomerId: v.optional(v.union(v.string(), v.null())),
    managerCustomerId: v.optional(v.union(v.string(), v.null())),
    accessTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
    refreshTokenExpiresAtMs: v.optional(v.union(v.number(), v.null())),
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

    const payload = {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,

      accessToken: args.accessToken,
      idToken: args.idToken ?? null,
      refreshToken: args.refreshToken ?? null,
      scopes: args.scopes ?? [],

      accountId: args.accountId ?? null,
      accountName: args.accountName ?? null,
      currency: null as string | null,

      developerToken: args.developerToken ?? null,
      loginCustomerId: args.loginCustomerId ?? null,
      managerCustomerId: args.managerCustomerId ?? null,

      accessTokenExpiresAtMs: args.accessTokenExpiresAtMs ?? null,
      refreshTokenExpiresAtMs: args.refreshTokenExpiresAtMs ?? null,

      lastSyncStatus: args.status ?? 'pending',
      lastSyncMessage: null as string | null,
      lastSyncedAtMs: null as number | null,
      lastSyncRequestedAtMs: timestamp,
      linkedAtMs: timestamp,

      autoSyncEnabled: null as boolean | null,
      syncFrequencyMinutes: null as number | null,
      scheduledTimeframeDays: null as number | null,

      createdAt: existing ? existing.createdAt : timestamp,
      updatedAt: timestamp,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
    } else {
      await ctx.db.insert('adIntegrations', payload)
    }

    return { ok: true }
  },
})

export const updateAutomationSettings = mutation({
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

    if (!existing) {
      throw Errors.resource.notFound('Integration')
    }

    const patch: Record<string, unknown> = {
      updatedAt: timestamp,
    }

    if (hasOwn(args, 'autoSyncEnabled')) patch.autoSyncEnabled = args.autoSyncEnabled ?? null
    if (hasOwn(args, 'syncFrequencyMinutes')) patch.syncFrequencyMinutes = args.syncFrequencyMinutes ?? null
    if (hasOwn(args, 'scheduledTimeframeDays')) patch.scheduledTimeframeDays = args.scheduledTimeframeDays ?? null

    await ctx.db.patch(existing._id, patch)
    return { ok: true }
  },
})

export const requestManualSync = mutation({
  args: {
    workspaceId: v.string(),
    providerId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    timeframeDays: v.optional(v.number()),

    // Allows callers to record a linked timestamp when running setup flows.
    linkedAtMs: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const timestamp = nowMs()
    const clientId = normalizeClientId(args.clientId ?? null)

    await ctx.db.insert('adSyncJobs', {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
      jobType: 'manual-sync',
      timeframeDays: args.timeframeDays ?? 7,
      status: 'queued',
      createdAtMs: timestamp,
      startedAtMs: null,
      processedAtMs: null,
      errorMessage: null,
    })

    const existing = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', args.providerId).eq('clientId', clientId)
      )
      .unique()

    if (existing) {
      const patch: Record<string, unknown> = {
        lastSyncRequestedAtMs: timestamp,
        updatedAt: timestamp,
      }

      if (hasOwn(args, 'linkedAtMs')) patch.linkedAtMs = args.linkedAtMs ?? null

      await ctx.db.patch(existing._id, patch)
    }

    return { scheduled: true }
  },
})

export const initializeAdAccount = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('linkedin'), v.literal('facebook'), v.literal('tiktok')),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    // Make sure linkedAt is set so the UI considers it connected.
    const linkedAtMs = typeof integration.linkedAtMs === 'number' ? integration.linkedAtMs : nowMs()

    if (args.providerId === 'google') {
      if (!integration.accessToken || !integration.developerToken) {
        throw Errors.integration.missingToken('Google')
      }

      const { fetchGoogleAdAccounts } = await import('@/services/integrations/google-ads')

      const accounts = await fetchGoogleAdAccounts({
        accessToken: integration.accessToken,
        developerToken: integration.developerToken,
      })

      if (!accounts.length) {
        throw Errors.integration.notConfigured('Google', 'No ad accounts available')
      }

      const primaryAccount = accounts.find((account) => !account.manager) ?? accounts[0]
      const accountId = primaryAccount.id
      const loginCustomerId = primaryAccount.loginCustomerId ?? (primaryAccount.manager ? primaryAccount.id : null)
      const managerCustomerId = primaryAccount.managerCustomerId ?? (primaryAccount.manager ? primaryAccount.id : null)

      await ctx.runMutation('adsIntegrations:updateIntegrationCredentials' as any, {
        workspaceId: args.workspaceId,
        providerId: 'google',
        clientId,
        accountId,
        accountName: primaryAccount.name,
        loginCustomerId: loginCustomerId ?? null,
        managerCustomerId: managerCustomerId ?? null,
        linkedAtMs,
      })

      await ctx.runMutation('adsIntegrations:enqueueSyncJob' as any, {
        workspaceId: args.workspaceId,
        providerId: 'google',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

      return {
        accountId,
        accountName: primaryAccount.name,
        loginCustomerId,
        managerCustomerId,
        accounts,
      }
    }

    if (args.providerId === 'linkedin') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('LinkedIn')
      }

      const { fetchLinkedInAdAccounts } = await import('@/services/integrations/linkedin-ads')

      const accounts = await fetchLinkedInAdAccounts({ accessToken: integration.accessToken })
      if (!accounts.length) {
        throw Errors.integration.notConfigured('LinkedIn', 'No ad accounts available')
      }

      const preferredAccount = accounts.find((account) => account.status?.toUpperCase() === 'ACTIVE') ?? accounts[0]

      await ctx.runMutation('adsIntegrations:updateIntegrationCredentials' as any, {
        workspaceId: args.workspaceId,
        providerId: 'linkedin',
        clientId,
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        linkedAtMs,
      })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'linkedin',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

      return {
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        accounts,
      }
    }

    if (args.providerId === 'facebook') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('Meta')
      }

      const { fetchMetaAdAccounts } = await import('@/services/integrations/meta-ads')

      const accounts = await fetchMetaAdAccounts({ accessToken: integration.accessToken })
      if (!accounts.length) {
        throw Errors.integration.notConfigured('Meta', 'No ad accounts available')
      }

      const preferredAccount = accounts.find((account) => account.account_status === 1) ?? accounts[0]

      await ctx.runMutation('adsIntegrations:updateIntegrationCredentials' as any, {
        workspaceId: args.workspaceId,
        providerId: 'facebook',
        clientId,
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        linkedAtMs,
      })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'facebook',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

      return {
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        accounts,
      }
    }

    // tiktok
    if (!integration.accessToken) {
      throw Errors.integration.missingToken('TikTok')
    }

    const { fetchTikTokAdAccounts } = await import('@/services/integrations/tiktok-ads')

    const accounts = await fetchTikTokAdAccounts({ accessToken: integration.accessToken })
    if (!accounts.length) {
      throw Errors.integration.notConfigured('TikTok', 'No ad accounts available')
    }

    const preferredAccount = accounts.find((account) => account.status?.toUpperCase() === 'ENABLE') ?? accounts[0]

    await ctx.runMutation('adsIntegrations:updateIntegrationCredentials' as any, {
      workspaceId: args.workspaceId,
      providerId: 'tiktok',
      clientId,
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      linkedAtMs,
    })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'tiktok',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

    return {
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      accounts,
    }
  }, 'adsIntegrations:initializeAdAccount'),
})

export const updateIntegrationCredentials = mutation({
  args: {
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

    // Used by init/setup flows to indicate an account is linked even if the
    // first sync hasn't completed yet.
    linkedAtMs: v.optional(v.union(v.number(), v.null())),
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
  handler: async (ctx, args): Promise<any> => {
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
  handler: async (ctx, args): Promise<any> => {
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

export const cleanupOldJobs = internalMutation({
  args: {
    cutoffMs: v.number(),
  },
  handler: async (ctx, args) => {
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

export const resetStaleJobs = internalMutation({
  args: {
    startedBeforeMs: v.number(),
  },
  handler: async (ctx, args) => {
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

export const writeMetricsBatchInternal = internalMutation({
  args: {
    workspaceId: v.string(),
    metrics: v.array(
      v.object({
        providerId: v.string(),
        clientId: v.optional(v.union(v.string(), v.null())),
        accountId: v.optional(v.union(v.string(), v.null())),
        date: v.string(),
        spend: v.number(),
        impressions: v.number(),
        clicks: v.number(),
        conversions: v.number(),
        revenue: v.optional(v.union(v.number(), v.null())),
        campaignId: v.optional(v.string()),
        campaignName: v.optional(v.string()),
        creatives: v.optional(
          v.array(
            v.object({
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
          )
        ),
        rawPayload: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; inserted: number }> => {
    const timestamp = nowMs()
    for (const metric of args.metrics) {
      await ctx.db.insert('adMetrics', {
        workspaceId: args.workspaceId,
        providerId: metric.providerId,
        clientId: normalizeClientId(metric.clientId ?? null),
        accountId: normalizeClientId(metric.accountId ?? null),
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
    metrics: v.array(v.any()), // Raw payload passed through to internal
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

