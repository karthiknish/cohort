import type { QueryCtx, MutationCtx } from '../_generated/server'
import { Errors } from '../errors'
import { requireWorkspaceAccess } from './functions/auth'
import { isR2ObjectRef, toR2ObjectKey } from './fileStorage'

const MESSAGE_SCAN_LIMIT = 250
const RECORD_SCAN_LIMIT = 200

function attachmentsContainStorageId(
  attachments: Array<{ storageId?: string | null }> | null | undefined,
  storageId: string,
): boolean {
  if (!attachments) return false
  return attachments.some((attachment) => attachment.storageId === storageId)
}

function recordReferencesStorageId(value: unknown, storageId: string): boolean {
  if (value === storageId) return true
  if (Array.isArray(value)) {
    return value.some((entry) => recordReferencesStorageId(entry, storageId))
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some((entry) =>
      recordReferencesStorageId(entry, storageId),
    )
  }
  return false
}

async function hasActiveUploadGrant(
  ctx: QueryCtx | MutationCtx,
  workspaceId: string,
  storageId: string,
): Promise<boolean> {
  const grant = await ctx.db
    .query('fileUploadGrants')
    .withIndex('by_workspace_storageId', (q) =>
      q.eq('workspaceId', workspaceId).eq('storageId', storageId),
    )
    .unique()

  return Boolean(grant && grant.expiresAtMs > Date.now())
}

/**
 * Ensures the caller may resolve a stored object URL within the given workspace.
 */
export async function assertWorkspaceStorageAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: string,
  storageId: string,
): Promise<void> {
  await requireWorkspaceAccess(ctx, workspaceId)

  const trimmed = storageId.trim()
  if (!trimmed) {
    throw Errors.validation.invalidInput('storageId is required')
  }

  if (isR2ObjectRef(trimmed)) {
    const key = toR2ObjectKey(trimmed)
    if (key.startsWith(`workspaces/${workspaceId}/`)) {
      return
    }
  }

  if (await hasActiveUploadGrant(ctx, workspaceId, trimmed)) {
    return
  }

  const avatarRows = await ctx.db
    .query('collaborationChannelAvatars')
    .withIndex('by_workspace_channelKey', (q) => q.eq('workspaceId', workspaceId))
    .take(RECORD_SCAN_LIMIT)

  if (avatarRows.some((row) => row.avatarStorageId === trimmed)) {
    return
  }

  const proposals = await ctx.db
    .query('proposals')
    .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', workspaceId))
    .order('desc')
    .take(RECORD_SCAN_LIMIT)

  if (
    proposals.some(
      (row) => row.pdfStorageId === trimmed || row.pptStorageId === trimmed,
    )
  ) {
    return
  }

  const meetings = await ctx.db
    .query('meetings')
    .withIndex('by_workspace_startTimeMs', (q) => q.eq('workspaceId', workspaceId))
    .order('desc')
    .take(RECORD_SCAN_LIMIT)

  if (
    meetings.some(
      (row) => row.notesStorageId === trimmed || row.transcriptStorageId === trimmed,
    )
  ) {
    return
  }

  const collaborationMessages = await ctx.db
    .query('collaborationMessages')
    .withIndex('by_workspace_channel_createdAtMs_legacyId', (q) => q.eq('workspaceId', workspaceId))
    .order('desc')
    .take(MESSAGE_SCAN_LIMIT)

  if (collaborationMessages.some((row) => attachmentsContainStorageId(row.attachments, trimmed))) {
    return
  }

  const directMessages = await ctx.db
    .query('directMessages')
    .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', workspaceId))
    .take(MESSAGE_SCAN_LIMIT)

  if (directMessages.some((row) => attachmentsContainStorageId(row.attachments, trimmed))) {
    return
  }

  const agentMessages = await ctx.db
    .query('agentMessages')
    .withIndex('by_workspace_conversation_createdAt', (q) => q.eq('workspaceId', workspaceId))
    .order('desc')
    .take(MESSAGE_SCAN_LIMIT)

  if (
    agentMessages.some(
      (row) =>
        recordReferencesStorageId(row.params, trimmed) ||
        recordReferencesStorageId(row.executeResult, trimmed),
    )
  ) {
    return
  }

  throw Errors.auth.forbidden('You do not have access to this file')
}
