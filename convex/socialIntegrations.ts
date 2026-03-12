import { z } from 'zod/v4'
import { zWorkspaceQuery, zWorkspaceMutation } from './functions'

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const socialIntegrationStatusZ = z.object({
  connected: z.boolean(),
  accountId: z.string().nullable(),
  accountName: z.string().nullable(),
  lastSyncStatus: z.enum(['never', 'pending', 'success', 'error']).nullable(),
  lastSyncedAtMs: z.number().nullable(),
  linkedAtMs: z.number().nullable(),
})

export const getStatus = zWorkspaceQuery({
  args: {
    clientId: z.string().nullable().optional(),
  },
  returns: socialIntegrationStatusZ,
  handler: async (ctx, args) => {
    const clientId = normalizeClientId(args.clientId ?? null)

    // Social surfaces share the Meta/Facebook OAuth integration token
    const allRows = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', 'facebook')
      )
      .collect()

    const row = allRows.find((r) => r.clientId === clientId) ?? allRows[0] ?? null

    if (!row) {
      return {
        connected: false,
        accountId: null,
        accountName: null,
        lastSyncStatus: null,
        lastSyncedAtMs: null,
        linkedAtMs: null,
      }
    }

    const hasValidToken =
      typeof row.accessToken === 'string' && row.accessToken.length > 0

    return {
      connected: hasValidToken,
      accountId: row.accountId,
      accountName: row.accountName,
      lastSyncStatus: (row.lastSyncStatus as z.infer<typeof socialIntegrationStatusZ>['lastSyncStatus']) ?? null,
      lastSyncedAtMs: row.lastSyncedAtMs,
      linkedAtMs: row.linkedAtMs,
    }
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
    const nowMs = Date.now()

    const id = await ctx.db.insert('socialSyncJobs', {
      workspaceId: args.workspaceId,
      clientId,
      surface: args.surface ?? null,
      jobType: 'manual-sync',
      timeframeDays: args.timeframeDays,
      status: 'queued',
      createdAtMs: nowMs,
      startedAtMs: null,
      processedAtMs: null,
      errorMessage: null,
    })

    return { jobId: id }
  },
})
