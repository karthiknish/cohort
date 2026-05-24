import { z } from 'zod/v4'

import { Errors } from '../../errors'
import { deleteStoredObject, resolveStoredObjectUrl } from '../../lib/fileStorage'
import {
  zWorkspaceMutation,
  zWorkspaceQuery,
  type AuthenticatedMutationCtx,
} from '../../functions'

const channelAvatarZ = z.object({
  channelKey: z.string(),
  avatarUrl: z.string().nullable(),
  updatedAtMs: z.number(),
})

function assertAdmin(role: string | null | undefined) {
  if (role === 'admin') {
    return
  }

  throw Errors.auth.forbidden('Only admin users can change channel photos')
}

function normalizeChannelKey(value: string) {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw Errors.validation.invalidInput('Channel key is required')
  }
  return trimmed
}

async function resolveAvatarUrl(ctx: AuthenticatedMutationCtx, storageId: string) {
  const url = await resolveStoredObjectUrl(ctx, storageId)
  if (!url) {
    throw Errors.validation.invalidInput('Uploaded image is not available yet. Try again.')
  }
  return url
}

export const listForWorkspace = zWorkspaceQuery({
  args: {},
  returns: z.array(channelAvatarZ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('collaborationChannelAvatars')
      .withIndex('by_workspace_channelKey', (q) => q.eq('workspaceId', args.workspaceId))
      .take(500)

    const results = await Promise.all(
      rows.map(async (row) => ({
        channelKey: row.channelKey,
        avatarUrl: await resolveStoredObjectUrl(ctx, row.avatarStorageId),
        updatedAtMs: row.updatedAtMs,
      })),
    )

    return results
  },
})

export const setAvatar = zWorkspaceMutation({
  args: {
    channelKey: z.string(),
    storageId: z.string().nullable(),
  },
  returns: channelAvatarZ,
  handler: async (ctx, args) => {
    assertAdmin(ctx.user.role)

    const channelKey = normalizeChannelKey(args.channelKey)
    const existing = await ctx.db
      .query('collaborationChannelAvatars')
      .withIndex('by_workspace_channelKey', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('channelKey', channelKey),
      )
      .unique()

    if (!args.storageId) {
      if (existing) {
        await deleteStoredObject(ctx, existing.avatarStorageId)
        await ctx.db.delete(existing._id)
      }

      return {
        channelKey,
        avatarUrl: null,
        updatedAtMs: ctx.now,
      }
    }

    const storageId = args.storageId.trim()
    const avatarUrl = await resolveAvatarUrl(ctx, storageId)

    if (existing) {
      if (existing.avatarStorageId !== storageId) {
        await deleteStoredObject(ctx, existing.avatarStorageId)
      }
      await ctx.db.patch(existing._id, {
        avatarStorageId: storageId,
        updatedAtMs: ctx.now,
        updatedBy: ctx.legacyId,
      })
    } else {
      await ctx.db.insert('collaborationChannelAvatars', {
        workspaceId: args.workspaceId,
        channelKey,
        avatarStorageId: storageId,
        updatedAtMs: ctx.now,
        updatedBy: ctx.legacyId,
      })
    }

    return {
      channelKey,
      avatarUrl,
      updatedAtMs: ctx.now,
    }
  },
})
