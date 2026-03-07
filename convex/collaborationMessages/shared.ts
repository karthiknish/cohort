import { z } from 'zod/v4'
import type { Doc, Id } from '../_generated/dataModel'
import { Errors } from '../errors'
import {
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspacePaginatedQuery,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
  type AuthenticatedMutationCtx,
  type AuthenticatedQueryCtx,
} from '../functions'

export type CollaborationCtx = AuthenticatedQueryCtx | AuthenticatedMutationCtx
export type CollaborationMutationCtx = AuthenticatedMutationCtx
export type CollaborationMessageRow = Doc<'collaborationMessages'>
export type ReadCheckpointRow = Doc<'collaborationReadCheckpoints'>
export type CollaborationChannelRow = Doc<'collaborationChannels'>

export type ChannelQueryArgs = {
  workspaceId: string
  channelId?: string | null
  channelType: string
  clientId?: string | null
  projectId?: string | null
}

export type TakeQuery<TItem> = {
  take: (limit: number) => Promise<TItem[]>
}

export type ScoredMessage = {
  row: CollaborationMessageRow
  score: number
  highlights: string[]
}

export async function hydrateAttachments(
  ctx: Pick<CollaborationCtx, 'storage'>,
  attachments: CollaborationMessageRow['attachments'],
) {
  if (!Array.isArray(attachments) || attachments.length === 0) return attachments

  const next = await Promise.all(
    attachments.map(async (attachment) => {
      const storageId = attachment.storageId
      if (typeof storageId !== 'string' || storageId.length === 0) return attachment

      const url = await ctx.storage.getUrl(storageId as Id<'_storage'>)
      return {
        ...attachment,
        url: url ?? attachment.url,
      }
    }),
  )

  return next
}

export async function hydrateMessageRow(
  ctx: Pick<CollaborationCtx, 'storage'>,
  row: CollaborationMessageRow,
): Promise<CollaborationMessageRow> {
  const attachments = Array.isArray(row.attachments) ? row.attachments : null
  const hydrated = await hydrateAttachments(ctx, attachments)
  if (hydrated === attachments) return row
  return { ...row, attachments: hydrated }
}

export function clampLimit(value: number, min: number, max: number) {
  const n = Number.isFinite(value) ? Math.trunc(value) : min
  return Math.min(Math.max(n, min), max)
}

export function normalizeTerm(term: string) {
  return term.trim().toLowerCase()
}

export function tokenize(input: string) {
  return input
    .split(/\s+/)
    .map(normalizeTerm)
    .filter((token) => token.length > 0)
}

export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  const aLen = a.length
  const bLen = b.length
  for (let i = 0; i <= bLen; i += 1) {
    matrix[i] = [i]
  }
  const firstRow = matrix[0]
  if (!firstRow) return 0
  for (let j = 0; j <= aLen; j += 1) {
    firstRow[j] = j
  }
  for (let i = 1; i <= bLen; i += 1) {
    const currentRow = matrix[i]
    const previousRow = matrix[i - 1]
    if (!currentRow || !previousRow) continue
    for (let j = 1; j <= aLen; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        currentRow[j] = previousRow[j - 1] ?? 0
      } else {
        currentRow[j] = Math.min(
          (previousRow[j - 1] ?? 0) + 1,
          (currentRow[j - 1] ?? 0) + 1,
          (previousRow[j] ?? 0) + 1,
        )
      }
    }
  }
  return matrix[bLen]?.[aLen] ?? 0
}

export function fuzzyScore(text: string, term: string): number {
  const haystack = normalizeTerm(text)
  const needle = normalizeTerm(term)
  if (!haystack || !needle) return 0
  if (haystack.includes(needle)) return Math.min(needle.length * 2, 12)

  const words = haystack.split(/[^a-z0-9]+/i).filter(Boolean)
  let best = Infinity
  for (const word of words) {
    const dist = levenshtein(word, needle)
    if (dist < best) {
      best = dist
    }
    if (best === 0) break
  }

  if (best === Infinity) return 0
  if (best <= 2) return Math.max(needle.length - best, 1)
  return 0
}

export const attachmentZ = z.object({
  name: z.string(),
  url: z.string(),
  storageId: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
})

export const mentionZ = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string().nullable(),
})

export const CHANNEL_SCAN_BATCH_SIZE = 200
export const CHANNEL_SCAN_MAX_ROWS = 5000
export const THREAD_SCAN_BATCH_SIZE = 200
export const THREAD_SCAN_MAX_ROWS = 4000

export type ReadCheckpointScope = 'channel' | 'thread'

export type ReadCheckpointPosition = {
  lastReadCreatedAtMs: number
  lastReadLegacyId: string
}

export type NormalizedChannelScope = {
  channelId: string | null
  channelType: string
  clientId: string | null
  projectId: string | null
}

export function buildListChannelQuery(ctx: CollaborationCtx, args: ChannelQueryArgs) {
  if (typeof args.channelId === 'string' && args.channelId.length > 0) {
    return ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_channelId_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('channelId', args.channelId),
      )
      .order('desc')
  }

  if (args.channelType === 'client') {
    return ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_channel_client_createdAtMs_legacyId', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('channelType', args.channelType)
          .eq('clientId', args.clientId ?? null),
      )
      .order('desc')
  }

  if (args.channelType === 'project') {
    return ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_channel_project_createdAtMs_legacyId', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('channelType', args.channelType)
          .eq('projectId', args.projectId ?? null),
      )
      .order('desc')
  }

  return ctx.db
    .query('collaborationMessages')
    .withIndex('by_workspace_channel_createdAtMs_legacyId', (q) =>
      q.eq('workspaceId', args.workspaceId).eq('channelType', args.channelType),
    )
    .order('desc')
}

export function buildChannelTypeQuery(ctx: CollaborationCtx, workspaceId: string, channelType: string) {
  return ctx.db
    .query('collaborationMessages')
    .withIndex('by_workspace_channel_createdAtMs_legacyId', (q) =>
      q.eq('workspaceId', workspaceId).eq('channelType', channelType),
    )
    .order('desc')
}

export function buildThreadQuery(ctx: CollaborationCtx, workspaceId: string, threadRootId: string, order: 'asc' | 'desc' = 'desc') {
  return ctx.db
    .query('collaborationMessages')
    .withIndex('by_workspace_threadRoot_createdAtMs_legacyId', (q) =>
      q.eq('workspaceId', workspaceId).eq('threadRootId', threadRootId),
    )
    .order(order)
}

export function normalizeChannelScope(args: {
  channelId?: string | null
  channelType: string
  clientId?: string | null
  projectId?: string | null
}): NormalizedChannelScope {
  const channelId = typeof args.channelId === 'string' && args.channelId.length > 0 ? args.channelId : null
  if (channelId) {
    return {
      channelId,
      channelType: 'team',
      clientId: null,
      projectId: null,
    }
  }

  const channelType = typeof args.channelType === 'string' && args.channelType.length > 0 ? args.channelType : 'team'

  if (channelType === 'client') {
    return {
      channelId: null,
      channelType,
      clientId: typeof args.clientId === 'string' && args.clientId.length > 0 ? args.clientId : null,
      projectId: null,
    }
  }

  if (channelType === 'project') {
    return {
      channelId: null,
      channelType,
      clientId: typeof args.clientId === 'string' && args.clientId.length > 0 ? args.clientId : null,
      projectId: typeof args.projectId === 'string' && args.projectId.length > 0 ? args.projectId : null,
    }
  }

  return {
    channelId: null,
    channelType: 'team',
    clientId: null,
    projectId: null,
  }
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

  return comparePosition(rowPosition, {
    createdAtMs: checkpoint.lastReadCreatedAtMs,
    legacyId: checkpoint.lastReadLegacyId,
  }) > 0
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

export function resolveChannelKeyFromScope(scope: NormalizedChannelScope): string | null {
  if (scope.channelId) {
    return scope.channelId
  }

  if (scope.channelType === 'team') {
    return 'team-agency'
  }

  if (scope.channelType === 'client' && scope.clientId) {
    return `client-${scope.clientId}`
  }

  if (scope.channelType === 'project' && scope.projectId) {
    return `project-${scope.projectId}`
  }

  return null
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

    // Never move checkpoints backwards.
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

export async function scanChannelRows(
  queryBuilder: () => TakeQuery<CollaborationMessageRow>,
  visitor: (row: CollaborationMessageRow) => Promise<boolean | undefined> | boolean | undefined,
  options?: { batchSize?: number; maxRows?: number },
) {
  const batchSize = clampLimit(options?.batchSize ?? CHANNEL_SCAN_BATCH_SIZE, 20, CHANNEL_SCAN_BATCH_SIZE)
  const maxRows = clampLimit(options?.maxRows ?? CHANNEL_SCAN_MAX_ROWS, 200, CHANNEL_SCAN_MAX_ROWS)

  let cursor: { fieldValue: number | string; legacyId: string } | null = null
  let scanned = 0
  let truncated = false
  let stoppedEarly = false

  while (scanned < maxRows) {
    let q = queryBuilder()
    q = applyManualPagination(q, cursor)

    const rows = await q.take(batchSize + 1)
    const result = getPaginatedResponse(rows, batchSize, 'createdAtMs')

    if (!result.items.length) {
      break
    }

    for (const row of result.items) {
      const shouldContinue = await visitor(row)
      scanned += 1
      if (shouldContinue === false) {
        stoppedEarly = true
        break
      }
      if (scanned >= maxRows) {
        truncated = Boolean(result.nextCursor)
        break
      }
    }

    if (stoppedEarly || !result.nextCursor || scanned >= maxRows) {
      break
    }

    cursor = result.nextCursor
  }

  return { scanned, truncated, stoppedEarly }
}

export function resolveChannelKey(row: CollaborationMessageRow): string | null {
  if (typeof row?.channelId === 'string' && row.channelId.length > 0) {
    return row.channelId
  }

  if (row?.channelType === 'team') {
    return 'team-agency'
  }

  if (row?.channelType === 'client' && typeof row?.clientId === 'string' && row.clientId.length > 0) {
    return `client-${row.clientId}`
  }

  if (row?.channelType === 'project' && typeof row?.projectId === 'string' && row.projectId.length > 0) {
    return `project-${row.projectId}`
  }

  return null
}

export async function fetchChannelRows(ctx: CollaborationCtx, args: ChannelQueryArgs & { limit: number }) {
  const q = buildListChannelQuery(ctx, args)
  const rows = await q.take(args.limit)
  return await Promise.all(rows.map((row) => hydrateMessageRow(ctx, row)))
}

export function requireActorUserId(ctx: CollaborationCtx, providedUserId?: string | null) {
  const currentUserId = typeof ctx?.legacyId === 'string' && ctx.legacyId.length > 0 ? ctx.legacyId : null
  if (!currentUserId) {
    throw Errors.auth.unauthorized()
  }

  if (typeof providedUserId === 'string' && providedUserId.length > 0 && providedUserId !== currentUserId) {
    throw Errors.auth.forbidden('Cannot act on behalf of another user')
  }

  return currentUserId
}

export async function getCustomChannelById(
  ctx: CollaborationCtx,
  workspaceId: string,
  channelId: string | null,
): Promise<CollaborationChannelRow | null> {
  if (!channelId) return null

  return await ctx.db
    .query('collaborationChannels')
    .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', workspaceId).eq('legacyId', channelId))
    .unique()
}

export function canAccessCustomChannel(ctx: CollaborationCtx, channel: CollaborationChannelRow | null) {
  if (!channel || channel.archivedAtMs !== null) {
    return false
  }

  const currentUserId = typeof ctx?.legacyId === 'string' && ctx.legacyId.length > 0 ? ctx.legacyId : null
  if (!currentUserId) return false

  if (ctx.user.role === 'admin') {
    return true
  }

  if (Array.isArray(channel.memberIds) && channel.memberIds.includes(currentUserId)) {
    return true
  }

  return channel.visibility === 'public' && ctx.user.role === 'team'
}

export async function assertChannelAccess(ctx: CollaborationCtx, workspaceId: string, scope: NormalizedChannelScope) {
  if (!scope.channelId) {
    return null
  }

  const channel = await getCustomChannelById(ctx, workspaceId, scope.channelId)
  if (!canAccessCustomChannel(ctx, channel)) {
    throw Errors.auth.forbidden('You do not have access to this collaboration channel')
  }

  return channel
}

export function getScopeFromMessageRow(row: CollaborationMessageRow): NormalizedChannelScope {
  return normalizeChannelScope({
    channelId: typeof row?.channelId === 'string' ? row.channelId : null,
    channelType: typeof row?.channelType === 'string' ? row.channelType : 'team',
    clientId: typeof row?.clientId === 'string' ? row.clientId : null,
    projectId: typeof row?.projectId === 'string' ? row.projectId : null,
  })
}

export async function assertAccessToMessage(
  ctx: CollaborationCtx,
  workspaceId: string,
  row: CollaborationMessageRow | null,
): Promise<CollaborationMessageRow> {
  if (!row) {
    throw Errors.resource.notFound('Message')
  }

  await assertChannelAccess(ctx, workspaceId, getScopeFromMessageRow(row))
  return row
}

export function canManageMessage(ctx: CollaborationCtx, row: CollaborationMessageRow) {
  const currentUserId = typeof ctx?.legacyId === 'string' && ctx.legacyId.length > 0 ? ctx.legacyId : null
  if (!currentUserId) return false

  const isAdmin = ctx?.user?.role === 'admin'
  const isOwner = typeof row?.senderId === 'string' && row.senderId === currentUserId
  return isAdmin || isOwner
}



export {
  z,
  Errors,
  zWorkspaceMutation,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspacePaginatedQuery,
  zWorkspacePaginatedQueryActive,
  applyManualPagination,
  getPaginatedResponse,
}
