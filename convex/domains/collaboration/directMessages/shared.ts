import { z } from 'zod/v4'
import { Errors } from '../../../errors'
import { resolveStoredObjectUrl } from '../../../lib/fileStorage'
import { type AuthenticatedMutationCtx } from '../../../functions'

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

export function clampLimit(value: number, min: number, max: number): number {
  const n = Number.isFinite(value) ? Math.trunc(value) : min
  return Math.min(Math.max(n, min), max)
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

type ReactionEntry = { emoji: string; count: number; userIds: string[] }

function normalizeReactions(reactions: unknown): { changed: boolean; reactions: ReactionEntry[] | null } {
  if (!Array.isArray(reactions) || reactions.length === 0) {
    return { changed: false, reactions: null }
  }
  let changed = false
  const normalized = reactions.flatMap((entry): ReactionEntry[] => {
    if (!entry || typeof entry !== 'object') return []
    const record = entry as Record<string, unknown>
    const emoji = typeof record.emoji === 'string' ? record.emoji : null
    if (!emoji) return []
    const userIds: string[] = Array.isArray(record.userIds)
      ? record.userIds.filter((v: unknown): v is string => typeof v === 'string')
      : []
    const correctCount = userIds.length
    const storedCount = typeof record.count === 'number' ? record.count : correctCount
    if (userIds.length === 0 && storedCount === 0) {
      changed = true
      return []
    }
    if (storedCount !== correctCount) {
      changed = true
    }
    return [{ emoji, count: correctCount, userIds }]
  })
  if (!changed) return { changed: false, reactions: reactions as ReactionEntry[] }
  return { changed: true, reactions: normalized.length > 0 ? normalized : null }
}

export async function hydrateMessageRow<TRow extends { attachments?: Array<{ name: string; url: string; storageId?: string | null; type?: string | null; size?: string | null }> | null; reactions?: ReactionEntry[] | null }>(
  ctx: Parameters<typeof resolveStoredObjectUrl>[0],
  row: TRow,
): Promise<TRow> {
  const attachments = Array.isArray(row.attachments) ? row.attachments : null
  const hydrated = await hydrateAttachments(ctx, attachments)
  const { changed: reactionsChanged, reactions: normalizedReactions } = normalizeReactions(row.reactions)
  if (hydrated === attachments && !reactionsChanged) return row
  return { ...row, attachments: hydrated, reactions: normalizedReactions as TRow['reactions'] }
}

export const attachmentZ = z.object({
  name: z.string(),
  url: z.string(),
  storageId: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
})

const MIME_TO_CATEGORY = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  pdf: 'PDF',
  excel: 'Excel',
  document: 'document',
  file: 'file',
} as const

type AttachmentCategory = keyof typeof MIME_TO_CATEGORY

function getAttachmentCategory(attachment?: { name?: string | null; type?: string | null } | null): AttachmentCategory {
  if (!attachment) return 'file'
  const type = (attachment.type ?? '').toLowerCase()
  const name = (attachment.name ?? '').toLowerCase()

  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (
    type.includes('spreadsheet') ||
    type.includes('excel') ||
    type === 'text/csv' ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv')
  )
    return 'excel'
  if (
    type.includes('word') ||
    type.includes('msword') ||
    type.includes('document') ||
    type.includes('presentation') ||
    type.includes('powerpoint') ||
    name.endsWith('.doc') ||
    name.endsWith('.docx') ||
    name.endsWith('.ppt') ||
    name.endsWith('.pptx') ||
    name.endsWith('.odt') ||
    name.endsWith('.odp')
  )
    return 'document'
  return 'file'
}

function categoryLabel(category: AttachmentCategory): string {
  return MIME_TO_CATEGORY[category]
}

function categoryLabelPlural(category: AttachmentCategory): string {
  switch (category) {
    case 'image':
      return 'images'
    case 'video':
      return 'videos'
    case 'audio':
      return 'audio files'
    case 'pdf':
      return 'PDFs'
    case 'excel':
      return 'Excel files'
    case 'document':
      return 'documents'
    case 'file':
    default:
      return 'files'
  }
}

function singularSnippet(category: AttachmentCategory): string {
  switch (category) {
    case 'image':
      return 'Sent an image'
    case 'video':
      return 'Sent a video'
    case 'audio':
      return 'Sent an audio file'
    case 'pdf':
      return 'Sent a PDF'
    case 'excel':
      return 'Sent an Excel file'
    case 'document':
      return 'Sent a document'
    case 'file':
    default:
      return 'Sent a file'
  }
}

function joinLabels(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]!
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

export function formatAttachmentSummary(
  attachments: Array<{ name?: string | null; type?: string | null }> | null | undefined,
): string | null {
  const list = attachments?.filter((a): a is NonNullable<typeof a> => Boolean(a)) ?? []
  if (list.length === 0) return null

  const categories = list.map(getAttachmentCategory)

  if (categories.length === 1) {
    return singularSnippet(categories[0]!)
  }

  const unique = [...new Set(categories)]
  if (unique.length === 1) {
    return `Sent ${categoryLabelPlural(unique[0]!)}`
  }

  const labels = unique.map((category) => categoryLabel(category))
  return `Sent ${joinLabels(labels)}`
}
