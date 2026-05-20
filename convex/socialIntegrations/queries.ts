import { internalQuery } from '../_generated/server'
import { v } from 'convex/values'
import { z } from 'zod/v4'
import { zWorkspaceQuery } from '../functions'

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const socialIntegrationStatusZ = z.object({
  connected: z.boolean(),
  accountId: z.string().nullable(),
  accountName: z.string().nullable(),
  facebookPageId: z.string().nullable(),
  facebookPageName: z.string().nullable(),
  instagramBusinessId: z.string().nullable(),
  instagramBusinessName: z.string().nullable(),
  lastSyncStatus: z.enum(['never', 'pending', 'success', 'error']).nullable(),
  lastSyncedAtMs: z.number().nullable(),
  linkedAtMs: z.number().nullable(),
  setupComplete: z.boolean(),
})

export const getStatus = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
  },
  returns: socialIntegrationStatusZ,
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const row = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    if (!row) {
      return {
        connected: false,
        accountId: null,
        accountName: null,
        facebookPageId: null,
        facebookPageName: null,
        instagramBusinessId: null,
        instagramBusinessName: null,
        lastSyncStatus: null,
        lastSyncedAtMs: null,
        linkedAtMs: null,
        setupComplete: false,
      }
    }

    const hasValidToken =
      typeof row.accessToken === 'string' && row.accessToken.length > 0
    const setupComplete = Boolean(row.facebookPageId)

    return {
      connected: hasValidToken,
      accountId: row.facebookPageId,
      accountName: row.facebookPageName ?? row.metaUserName,
      facebookPageId: row.facebookPageId,
      facebookPageName: row.facebookPageName,
      instagramBusinessId: row.instagramBusinessId,
      instagramBusinessName: row.instagramBusinessName,
      lastSyncStatus: row.lastSyncStatus,
      lastSyncedAtMs: row.lastSyncedAtMs,
      linkedAtMs: row.linkedAtMs,
      setupComplete,
    }
  },
})

export const getSocialIntegrationInternal = internalQuery({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    const row = await ctx.db
      .query('socialIntegrations')
      .withIndex('by_workspace_client', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .unique()

    if (!row) return null

    return {
      accessToken: row.accessToken,
      facebookPageId: row.facebookPageId,
      facebookPageName: row.facebookPageName,
      instagramBusinessId: row.instagramBusinessId,
      instagramBusinessName: row.instagramBusinessName,
      clientId: row.clientId,
    }
  },
})
