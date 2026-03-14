import { internal } from '/_generated/api'

import {
  Errors,
  adIntegrationZ,
  internalQuery,
  normalizeClientId,
  v,
  z,
  zWorkspaceQuery,
} from './shared'

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

export const listStatuses = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable(),
  },
  returns: z.array(z.object({
    providerId: z.string(),
    clientId: z.string().nullable(),
    accountId: z.string().nullable(),
    accountName: z.string().nullable(),
    currency: z.string().nullable(),
    lastSyncStatus: z.string(),
    lastSyncMessage: z.string().nullable(),
    lastSyncedAtMs: z.number().nullable(),
    lastSyncRequestedAtMs: z.number().nullable(),
    linkedAtMs: z.number().nullable(),
    autoSyncEnabled: z.boolean().nullable(),
    syncFrequencyMinutes: z.number().nullable(),
    scheduledTimeframeDays: z.number().nullable(),
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
        currency: row.currency,
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


