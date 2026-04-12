import type { DatabaseReader } from '../_generated/server'

import {
  adIntegrationZ,
  internalQuery,
  normalizeClientId,
  v,
  z,
  zWorkspaceQuery,
} from './shared'

function mapIntegrationRow(row: {
  providerId: string
  clientId: string | null
  accessToken: string | null
  idToken: string | null
  refreshToken: string | null
  scopes: string[]
  accountId: string | null
  accountName: string | null
  currency: string | null
  developerToken: string | null
  loginCustomerId: string | null
  managerCustomerId: string | null
  accessTokenExpiresAtMs: number | null
  refreshTokenExpiresAtMs: number | null
  lastSyncStatus: 'never' | 'pending' | 'success' | 'error'
  lastSyncMessage: string | null
  lastSyncedAtMs: number | null
  lastSyncRequestedAtMs: number | null
  linkedAtMs: number | null
  autoSyncEnabled: boolean | null
  syncFrequencyMinutes: number | null
  scheduledTimeframeDays: number | null
}) {
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
}

async function findGoogleAnalyticsIntegration(
  db: DatabaseReader,
  workspaceId: string,
  clientId: string | null,
): Promise<z.infer<typeof adIntegrationZ> | null> {
  const current = await db
    .query('analyticsIntegrations')
    .withIndex('by_workspace_provider_client', (q) =>
      q.eq('workspaceId', workspaceId).eq('providerId', 'google-analytics').eq('clientId', clientId)
    )
    .unique()

  if (current) return mapIntegrationRow(current)

  const legacy = await db
    .query('adIntegrations')
    .withIndex('by_workspace_provider_client', (q) =>
      q.eq('workspaceId', workspaceId).eq('providerId', 'google-analytics').eq('clientId', clientId)
    )
    .unique()

  return legacy ? mapIntegrationRow(legacy) : null
}

export const getGoogleAnalyticsIntegrationInternal = internalQuery({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args): Promise<z.infer<typeof adIntegrationZ> | null> => {
    const clientId = normalizeClientId(args.clientId ?? null)
    return await findGoogleAnalyticsIntegration(ctx.db, args.workspaceId, clientId)
  },
})

export const getGoogleAnalyticsIntegration = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
  },
  returns: adIntegrationZ.nullable(),
  handler: async (ctx, args): Promise<z.infer<typeof adIntegrationZ> | null> => {
    const clientId = normalizeClientId(args.clientId ?? null)
    return await findGoogleAnalyticsIntegration(ctx.db, args.workspaceId, clientId)
  },
})

type GoogleAnalyticsStatus = {
  providerId: string
  clientId: string | null
  accountId: string | null
  accountName: string | null
  linkedAtMs: number | null
  lastSyncStatus: string | null
  lastSyncMessage: string | null
  lastSyncedAtMs: number | null
  lastSyncRequestedAtMs: number | null
}

export const getGoogleAnalyticsStatus = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
  },
  returns: z.object({
    providerId: z.string(),
    clientId: z.string().nullable(),
    accountId: z.string().nullable(),
    accountName: z.string().nullable(),
    linkedAtMs: z.number().nullable(),
    lastSyncStatus: z.string().nullable(),
    lastSyncMessage: z.string().nullable(),
    lastSyncedAtMs: z.number().nullable(),
    lastSyncRequestedAtMs: z.number().nullable(),
  }).nullable(),
  handler: async (ctx, args): Promise<GoogleAnalyticsStatus | null> => {
    const clientId = normalizeClientId(args.clientId ?? null)
    const integration = await findGoogleAnalyticsIntegration(ctx.db, args.workspaceId, clientId)
    if (!integration) return null
    return {
      providerId: integration.providerId,
      clientId: integration.clientId,
      accountId: integration.accountId,
      accountName: integration.accountName,
      linkedAtMs: integration.linkedAtMs,
      lastSyncStatus: integration.lastSyncStatus,
      lastSyncMessage: integration.lastSyncMessage,
      lastSyncedAtMs: integration.lastSyncedAtMs,
      lastSyncRequestedAtMs: integration.lastSyncRequestedAtMs,
    }
  },
})

export const hasPendingGoogleAnalyticsSyncJob = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)
    for (const status of ['queued', 'running'] as const) {
      const job = await ctx.db
        .query('adSyncJobs')
        .withIndex('by_workspace_provider_client_status', (q) =>
          q.eq('workspaceId', args.workspaceId)
            .eq('providerId', 'google-analytics')
            .eq('clientId', clientId)
            .eq('status', status)
        )
        .first()
      if (job) return true
    }
    return false
  },
})

export const listWorkspaceIntegrationIds = internalQuery({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const integrations = await ctx.db
      .query('analyticsIntegrations')
      .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', args.workspaceId).eq('providerId', 'google-analytics'))
      .collect()
    return integrations.map((row) => row.providerId)
  },
})

export const listAllWorkspacesWithIntegrations = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 1000, 1), 5000)
    const integrations = await ctx.db
      .query('analyticsIntegrations')
      .withIndex('by_updatedAt', (q) => q)
      .order('desc')
      .take(limit * 10)
    const workspaceIds = new Set<string>()
    for (const row of integrations) {
      workspaceIds.add(row.workspaceId)
      if (workspaceIds.size >= limit) break
    }
    return Array.from(workspaceIds)
  },
})
