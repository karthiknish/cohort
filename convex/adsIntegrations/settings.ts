import {
  Errors,
  hasOwn,
  mutation,
  normalizeClientId,
  nowMs,
  requireWorkspaceAccess,
  v,
} from './shared'

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
    await requireWorkspaceAccess(ctx, args.workspaceId)

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
    await requireWorkspaceAccess(ctx, args.workspaceId)

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
    await requireWorkspaceAccess(ctx, args.workspaceId)

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

