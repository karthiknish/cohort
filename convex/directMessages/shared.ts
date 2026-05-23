import { z } from 'zod/v4'
import { Errors } from '../errors'
import { resolveStoredObjectUrl } from '../lib/fileStorage'
import { type AuthenticatedMutationCtx } from '../functions'

export function generateLegacyId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function sortParticipantIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1]
}

export async function assertDirectMessageParticipant(
  ctx: AuthenticatedMutationCtx,
  workspaceId: string,
  conversationLegacyId: string,
) {
  const conversation = await ctx.db
    .query('directConversations')
    .withIndex('by_workspace_legacyId', (q) =>
      q.eq('workspaceId', workspaceId).eq('legacyId', conversationLegacyId),
    )
    .first()

  if (!conversation) {
    throw Errors.resource.notFound('Conversation')
  }

  const currentUserId = ctx.user._id
  const isParticipant =
    conversation.participantOneId === currentUserId ||
    conversation.participantTwoId === currentUserId

  if (!isParticipant) {
    throw Errors.auth.forbidden()
  }

  return conversation
}

export function canManageDirectMessage(ctx: AuthenticatedMutationCtx, message: { senderId: string }) {
  return message.senderId === ctx.user._id || ctx.user.role === 'admin'
}

export function clampSearchLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 100
  return Math.min(Math.max(Math.trunc(limit), 20), 400)
}

export function normalizeSearchValue(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function tokenizeSearchValue(value: string | null | undefined): string[] {
  return normalizeSearchValue(value).split(/\s+/).filter(Boolean)
}

export async function hydrateAttachments(
  ctx: Parameters<typeof resolveStoredObjectUrl>[0],
  attachments: Array<{ name: string; url: string; storageId?: string | null; type?: string | null; size?: string | null }> | null,
) {
  if (!Array.isArray(attachments) || attachments.length === 0) return attachments

  const next = await Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment || typeof attachment !== 'object') return attachment
      const storageId = attachment.storageId
      if (typeof storageId !== 'string' || storageId.length === 0) return attachment

      const url = await resolveStoredObjectUrl(ctx, storageId)
      return {
        ...attachment,
        url: url ?? attachment.url,
      }
    }),
  )

  return next
}

export async function hydrateMessageRow<TRow extends { attachments?: Array<{ name: string; url: string; storageId?: string | null; type?: string | null; size?: string | null }> | null }>(
  ctx: Parameters<typeof resolveStoredObjectUrl>[0],
  row: TRow,
): Promise<TRow> {
  const attachments = Array.isArray(row.attachments) ? row.attachments : null
  const hydrated = await hydrateAttachments(ctx, attachments)
  if (hydrated === attachments) return row
  return { ...row, attachments: hydrated }
}

export const attachmentZ = z.object({
  name: z.string(),
  url: z.string(),
  storageId: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
})
