import { internalQuery } from './_generated/server'
import { v } from 'convex/values'
import { z } from 'zod/v4'

import { zWorkspaceMutation, zWorkspaceQuery } from './functions'
import { Errors } from './errors'

const GOOGLE_WORKSPACE_PROVIDER = 'google-workspace'

function assertCanManageMeetingIntegrations(role: string | null | undefined): void {
  if (role === 'admin' || role === 'team') {
    return
  }

  throw Errors.auth.forbidden('Only admin and team users can manage meeting integrations')
}

const googleWorkspaceStatusZ = z.object({
  providerId: z.string(),
  connected: z.boolean(),
  linkedAtMs: z.number().nullable(),
  accessTokenExpiresAtMs: z.number().nullable(),
  scopes: z.array(z.string()),
  userEmail: z.string().nullable(),
})

export const getGoogleWorkspaceStatus = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    userId: z.string().optional(),
  },
  returns: googleWorkspaceStatusZ,
  handler: async (ctx, args) => {
    const targetUserId = args.userId ?? ctx.legacyId

    if (ctx.user.role !== 'admin' && targetUserId !== ctx.legacyId) {
      throw Errors.auth.forbidden('You can only inspect your own integration status')
    }

    const integration = await ctx.db
      .query('meetingIntegrations')
      .withIndex('by_workspace_provider_user', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', GOOGLE_WORKSPACE_PROVIDER).eq('userId', targetUserId)
      )
      .unique()

    return {
      providerId: GOOGLE_WORKSPACE_PROVIDER,
      connected: Boolean(integration?.accessToken),
      linkedAtMs: integration?.linkedAtMs ?? null,
      accessTokenExpiresAtMs: integration?.accessTokenExpiresAtMs ?? null,
      scopes: integration?.scopes ?? [],
      userEmail: integration?.userEmail ?? null,
    }
  },
})

export const upsertGoogleWorkspaceTokens = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    userEmail: z.string().nullable().optional(),
    accessToken: z.string().nullable(),
    refreshToken: z.string().nullable().optional(),
    idToken: z.string().nullable().optional(),
    scopes: z.array(z.string()).optional(),
    accessTokenExpiresAtMs: z.number().nullable().optional(),
    refreshTokenExpiresAtMs: z.number().nullable().optional(),
  },
  returns: z.object({
    providerId: z.string(),
    linkedAtMs: z.number(),
    updatedAtMs: z.number(),
  }),
  handler: async (ctx, args) => {
    assertCanManageMeetingIntegrations(ctx.user.role)

    const now = ctx.now
    const existing = await ctx.db
      .query('meetingIntegrations')
      .withIndex('by_workspace_provider_user', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', GOOGLE_WORKSPACE_PROVIDER).eq('userId', ctx.legacyId)
      )
      .unique()

    const payload = {
      workspaceId: args.workspaceId,
      providerId: GOOGLE_WORKSPACE_PROVIDER,
      userId: ctx.legacyId,
      userEmail: args.userEmail ?? existing?.userEmail ?? null,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken ?? existing?.refreshToken ?? null,
      idToken: args.idToken ?? existing?.idToken ?? null,
      scopes: args.scopes ?? existing?.scopes ?? [],
      accessTokenExpiresAtMs: args.accessTokenExpiresAtMs ?? existing?.accessTokenExpiresAtMs ?? null,
      refreshTokenExpiresAtMs: args.refreshTokenExpiresAtMs ?? existing?.refreshTokenExpiresAtMs ?? null,
      linkedAtMs: existing?.linkedAtMs ?? now,
      lastUsedAtMs: now,
      createdAtMs: existing?.createdAtMs ?? now,
      updatedAtMs: now,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
    } else {
      await ctx.db.insert('meetingIntegrations', payload)
    }

    return {
      providerId: GOOGLE_WORKSPACE_PROVIDER,
      linkedAtMs: payload.linkedAtMs,
      updatedAtMs: payload.updatedAtMs,
    }
  },
})

export const deleteGoogleWorkspaceIntegration = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    userId: z.string().optional(),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    assertCanManageMeetingIntegrations(ctx.user.role)

    const targetUserId = args.userId ?? ctx.legacyId

    if (ctx.user.role !== 'admin' && targetUserId !== ctx.legacyId) {
      throw Errors.auth.forbidden('You can only remove your own integration')
    }

    const integration = await ctx.db
      .query('meetingIntegrations')
      .withIndex('by_workspace_provider_user', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', GOOGLE_WORKSPACE_PROVIDER).eq('userId', targetUserId)
      )
      .unique()

    if (!integration) {
      return false
    }

    await ctx.db.delete(integration._id)
    return true
  },
})

export const getGoogleWorkspaceTokensInternal = internalQuery({
  args: {
    workspaceId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query('meetingIntegrations')
      .withIndex('by_workspace_provider_user', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('providerId', GOOGLE_WORKSPACE_PROVIDER).eq('userId', args.userId)
      )
      .unique()

    if (!integration) {
      return null
    }

    return {
      providerId: integration.providerId,
      userId: integration.userId,
      userEmail: integration.userEmail,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      idToken: integration.idToken,
      scopes: integration.scopes,
      accessTokenExpiresAtMs: integration.accessTokenExpiresAtMs,
      refreshTokenExpiresAtMs: integration.refreshTokenExpiresAtMs,
      linkedAtMs: integration.linkedAtMs,
      lastUsedAtMs: integration.lastUsedAtMs,
      updatedAtMs: integration.updatedAtMs,
    }
  },
})
