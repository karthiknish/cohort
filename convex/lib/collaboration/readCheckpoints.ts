import type { Doc } from '/_generated/dataModel'
import type { AuthenticatedMutationCtx, AuthenticatedQueryCtx } from '../../functions'

export type CollaborationCtx = AuthenticatedQueryCtx | AuthenticatedMutationCtx
export type CollaborationMutationCtx = AuthenticatedMutationCtx
export type ReadCheckpointRow = Doc<'collaborationReadCheckpoints'>
export type ReadCheckpointScope = 'channel' | 'thread'

export type CollaborationMessageRow = Doc<'collaborationMessages'>

export type ReadCheckpointPosition = {
  lastReadCreatedAtMs: number
  lastReadLegacyId: string
}

export function comparePosition(
  a: { createdAtMs: number; legacyId: string },
  b: { createdAtMs: number; legacyId: string },
) {
  if (a.createdAtMs !== b.createdAtMs) {
    return a.createdAtMs - b.createdAtMs
  }

  return a.legacyId.localeCompare(b.legacyId)
}

export function readPositionFromRow(
  row: CollaborationMessageRow | null,
): { createdAtMs: number; legacyId: string } | null {
  const createdAtMs = typeof row?.createdAtMs === 'number' ? row.createdAtMs : null
  const legacyId = typeof row?.legacyId === 'string' ? row.legacyId : null
  if (createdAtMs === null || !legacyId) return null
  return { createdAtMs, legacyId }
}

export function isAfterCheckpoint(
  row: CollaborationMessageRow | null,
  checkpoint: ReadCheckpointPosition | null,
) {
  if (!checkpoint) return true

  const rowPosition = readPositionFromRow(row)
  if (!rowPosition) return false

  return (
    comparePosition(rowPosition, {
      createdAtMs: checkpoint.lastReadCreatedAtMs,
      legacyId: checkpoint.lastReadLegacyId,
    }) > 0
  )
}

export function pickNewestCheckpoint(
  a: ReadCheckpointPosition | null,
  b: ReadCheckpointPosition | null,
): ReadCheckpointPosition | null {
  if (!a) return b
  if (!b) return a

  return comparePosition(
    { createdAtMs: a.lastReadCreatedAtMs, legacyId: a.lastReadLegacyId },
    { createdAtMs: b.lastReadCreatedAtMs, legacyId: b.lastReadLegacyId },
  ) >= 0
    ? a
    : b
}

export async function getReadCheckpoint(
  ctx: CollaborationCtx,
  args: {
    workspaceId: string
    userId: string
    scopeType: ReadCheckpointScope
    channelId: string | null
    channelType: string
    clientId: string | null
    projectId: string | null
    threadRootId: string | null
  },
): Promise<ReadCheckpointPosition | null> {
  const row = (await ctx.db
    .query('collaborationReadCheckpoints')
    .withIndex('by_workspace_user_scope_channel_client_project_thread', (q) =>
      q
        .eq('workspaceId', args.workspaceId)
        .eq('userId', args.userId)
        .eq('scopeType', args.scopeType)
        .eq('channelId', args.channelId)
        .eq('channelType', args.channelType)
        .eq('clientId', args.clientId)
        .eq('projectId', args.projectId)
        .eq('threadRootId', args.threadRootId),
    )
    .unique()) as ReadCheckpointRow | null

  if (!row) return null

  if (typeof row.lastReadCreatedAtMs !== 'number' || typeof row.lastReadLegacyId !== 'string') {
    return null
  }

  return {
    lastReadCreatedAtMs: row.lastReadCreatedAtMs,
    lastReadLegacyId: row.lastReadLegacyId,
  }
}

export async function upsertReadCheckpoint(
  ctx: CollaborationMutationCtx,
  args: {
    workspaceId: string
    userId: string
    scopeType: ReadCheckpointScope
    channelId: string | null
    channelType: string
    clientId: string | null
    projectId: string | null
    threadRootId: string | null
    lastReadCreatedAtMs: number
    lastReadLegacyId: string
    updatedAtMs: number
  },
) {
  const existing = (await ctx.db
    .query('collaborationReadCheckpoints')
    .withIndex('by_workspace_user_scope_channel_client_project_thread', (q) =>
      q
        .eq('workspaceId', args.workspaceId)
        .eq('userId', args.userId)
        .eq('scopeType', args.scopeType)
        .eq('channelId', args.channelId)
        .eq('channelType', args.channelType)
        .eq('clientId', args.clientId)
        .eq('projectId', args.projectId)
        .eq('threadRootId', args.threadRootId),
    )
    .unique()) as ReadCheckpointRow | null

  const nextPosition = {
    createdAtMs: args.lastReadCreatedAtMs,
    legacyId: args.lastReadLegacyId,
  }

  if (existing) {
    const currentPosition = {
      createdAtMs: typeof existing.lastReadCreatedAtMs === 'number' ? existing.lastReadCreatedAtMs : 0,
      legacyId: typeof existing.lastReadLegacyId === 'string' ? existing.lastReadLegacyId : '',
    }

    if (comparePosition(nextPosition, currentPosition) <= 0) {
      return { advanced: false }
    }

    await ctx.db.patch(existing._id, {
      lastReadCreatedAtMs: args.lastReadCreatedAtMs,
      lastReadLegacyId: args.lastReadLegacyId,
      updatedAtMs: args.updatedAtMs,
    })
    return { advanced: true }
  }

  await ctx.db.insert('collaborationReadCheckpoints', {
    workspaceId: args.workspaceId,
    userId: args.userId,
    scopeType: args.scopeType,
    channelId: args.channelId,
    channelType: args.channelType,
    clientId: args.clientId,
    projectId: args.projectId,
    threadRootId: args.threadRootId,
    lastReadCreatedAtMs: args.lastReadCreatedAtMs,
    lastReadLegacyId: args.lastReadLegacyId,
    updatedAtMs: args.updatedAtMs,
  })

  return { advanced: true }
}
