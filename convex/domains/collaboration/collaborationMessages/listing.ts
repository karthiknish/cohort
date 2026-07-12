import {
  type CollaborationMessageRow,
  type ScoredMessage,
  applyManualPagination,
  assertAccessToMessage,
  assertChannelAccess,
  buildChannelTypeQuery,
  buildListChannelQuery,
  buildThreadQuery,
  canAccessCustomChannel,
  clampLimit,
  fetchChannelRows,
  fuzzyScore,
  getPaginatedResponse,
  hydrateMessageRow,
  normalizeChannelScope,
  normalizeTerm,
  resolveChannelKey,
  tokenize,
  z,
  zWorkspacePaginatedQuery,
  zWorkspacePaginatedQueryActive,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
} from './shared'

type AttachmentCategory = 'image' | 'video' | 'audio' | 'pdf' | 'excel' | 'document' | 'file'

type RawAttachment = {
  name?: string
  type?: string | null
}

function getAttachmentCategory(attachment: RawAttachment | null | undefined): AttachmentCategory {
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

const CATEGORY_LABEL: Record<AttachmentCategory, string> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  pdf: 'PDF',
  excel: 'Excel',
  document: 'document',
  file: 'file',
}

const CATEGORY_LABEL_PLURAL: Record<AttachmentCategory, string> = {
  image: 'images',
  video: 'videos',
  audio: 'audio files',
  pdf: 'PDFs',
  excel: 'Excel files',
  document: 'documents',
  file: 'files',
}

const SINGULAR_SNIPPET: Record<AttachmentCategory, string> = {
  image: 'Sent an image',
  video: 'Sent a video',
  audio: 'Sent an audio file',
  pdf: 'Sent a PDF',
  excel: 'Sent an Excel file',
  document: 'Sent a document',
  file: 'Sent a file',
}

function joinLabels(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]!
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

/** Server-side mirror of the frontend formatAttachmentSummary helper. */
function buildAttachmentSummary(
  attachments: CollaborationMessageRow['attachments'],
): string {
  if (!Array.isArray(attachments) || attachments.length === 0) return ''

  const list = attachments.filter((a) => Boolean(a))
  if (list.length === 0) return ''

  const categories = list.map(getAttachmentCategory)

  if (categories.length === 1) {
    return SINGULAR_SNIPPET[categories[0]!]
  }

  const unique = [...new Set(categories)]
  if (unique.length === 1) {
    return `Sent ${CATEGORY_LABEL_PLURAL[unique[0]!]}`
  }

  const labels = unique.map((category) => CATEGORY_LABEL[category])
  return `Sent ${joinLabels(labels)}`
}

export const listChannel = zWorkspacePaginatedQueryActive({
  args: {
    channelId: z.string().optional().nullable(),
    channelType: z.string(),
    clientId: z.string().optional().nullable(),
    projectId: z.string().optional().nullable(),
  },
  handler: async (ctx, args) => {
    const scope = normalizeChannelScope(args)
    await assertChannelAccess(ctx, args.workspaceId, scope)

    const limit = clampLimit(typeof args.limit === 'number' ? args.limit : 50, 1, 500)
    let q = buildListChannelQuery(ctx, {
      workspaceId: args.workspaceId,
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
    })
    q = applyManualPagination(q, args.cursor)
    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')
    const items = await Promise.all(result.items.map((row) => hydrateMessageRow(ctx, row)))
    return {
      items,
      nextCursor: result.nextCursor,
    }
  },
})

export const listThreadReplies = zWorkspacePaginatedQuery({
  args: {
    threadRootId: z.string(),
  },
  handler: async (ctx, args) => {
    const threadRoot = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.threadRootId))
      .unique()

    await assertAccessToMessage(ctx, args.workspaceId, threadRoot)

    const limit = clampLimit(typeof args.limit === 'number' ? args.limit : 50, 1, 500)
    let q = buildThreadQuery(ctx, args.workspaceId, args.threadRootId, 'asc')

    q = applyManualPagination(q, args.cursor, 'asc')

    const rows = await q.take(limit + 1)
    const result = getPaginatedResponse(rows, limit, 'createdAtMs')
    const items = await Promise.all(result.items.map((row) => hydrateMessageRow(ctx, row)))

    return {
      items,
      nextCursor: result.nextCursor,
    }
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: { legacyId: z.string() },
  handler: async (ctx, args) => {
    const queriedRow = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!queriedRow) {
      return null
    }

    const row = await assertAccessToMessage(ctx, args.workspaceId, queriedRow)
    return await hydrateMessageRow(ctx, row)
  },
})

export const searchChannel = zWorkspaceQueryActive({
  args: {
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
    q: z.string().nullable().optional(),
    sender: z.string().nullable().optional(),
    attachment: z.string().nullable().optional(),
    mention: z.string().nullable().optional(),
    startMs: z.number().nullable().optional(),
    endMs: z.number().nullable().optional(),
    limit: z.number(),
  },
  handler: async (ctx, args) => {
    const limit = clampLimit(args.limit, 20, 400)
    const scope = normalizeChannelScope(args)
    await assertChannelAccess(ctx, args.workspaceId, scope)

    // Reuse the same indexes + ordering as listChannel.
    const rows = (await fetchChannelRows(ctx, {
      workspaceId: args.workspaceId,
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
      limit,
    })) as CollaborationMessageRow[]

    const startMs = typeof args.startMs === 'number' && Number.isFinite(args.startMs) ? args.startMs : null
    const endMs = typeof args.endMs === 'number' && Number.isFinite(args.endMs) ? args.endMs : null

    const filteredByDate = rows.filter((row) => {
      const createdAtMs = typeof row?.createdAtMs === 'number' ? row.createdAtMs : null
      if (createdAtMs === null) return true
      if (startMs !== null && createdAtMs < startMs) return false
      if (endMs !== null && createdAtMs > endMs) return false
      return true
    })

    const searchTerms = tokenize(typeof args.q === 'string' ? args.q : '')
    const senderTerm = typeof args.sender === 'string' && args.sender.trim() ? normalizeTerm(args.sender) : null
    const attachmentTerm =
      typeof args.attachment === 'string' && args.attachment.trim() ? normalizeTerm(args.attachment) : null
    const mentionTermRaw = typeof args.mention === 'string' && args.mention.trim() ? args.mention : null
    const mentionTerm = mentionTermRaw ? normalizeTerm(mentionTermRaw.replace(/^@/, '')) : null

    const scored = filteredByDate
      .flatMap((row): ScoredMessage[] => {
        // deleted filter is handled by workspaceQueryActive implicitly if we use fetchChannelRows correctly
        // but here rows are already fetched and hydrated.

        const senderName = typeof row?.senderName === 'string' ? row.senderName : ''
        if (senderTerm && !normalizeTerm(senderName).includes(senderTerm)) {
          return []
        }

        const mentions = Array.isArray(row?.mentions) ? row.mentions : []
        if (mentionTerm) {
          const mentionNames = mentions
            .flatMap((mention) => {
              if (typeof mention?.name !== 'string') {
                return []
              }

              const normalizedMention = normalizeTerm(mention.name)
              return normalizedMention ? [normalizedMention] : []
            })
          const hasMention = mentionNames.some((name: string) => name.includes(mentionTerm))
          if (!hasMention) return []
        }

        const attachments = Array.isArray(row?.attachments) ? row.attachments : []
        if (attachmentTerm) {
          const attachmentNames = attachments
            .flatMap((attachment) => {
              if (typeof attachment?.name !== 'string') {
                return []
              }

              const normalizedAttachment = normalizeTerm(attachment.name)
              return normalizedAttachment ? [normalizedAttachment] : []
            })
          const hasAttachment = attachmentNames.some((name: string) => name.includes(attachmentTerm))
          if (!hasAttachment) return []
        }

        const highlightSet = new Set<string>()
        let totalScore = 0

        const haystacks: string[] = []
        if (typeof row?.content === 'string' && row.content) haystacks.push(row.content)
        if (senderName) haystacks.push(senderName)
        if (attachments.length) haystacks.push(...attachments.map((a) => String(a?.name ?? '')))
        if (mentions.length) haystacks.push(...mentions.map((m) => String(m?.name ?? '')))

        if (searchTerms.length === 0) {
          totalScore = 1
        } else {
          for (const term of searchTerms) {
            let bestScore = 0
            for (const text of haystacks) {
              const score = fuzzyScore(text, term)
              if (score > bestScore) bestScore = score
            }
            if (bestScore > 0) {
              totalScore += bestScore
              highlightSet.add(term)
            }
          }
        }

        if (totalScore <= 0) return []

        return [{
          row,
          score: totalScore,
          highlights: Array.from(highlightSet),
        }]
      })

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, limit)
    const highlights = Array.from(new Set(top.flatMap((item) => item.highlights)))

    return {
      rows: top.map((item) => item.row),
      highlights,
    }
  },
})

/**
 * Fetch the latest non-deleted message for every channel in the workspace so
 * the inbox sidebar can show previews without loading each channel's full
 * message history. Returns a map keyed by channel key (e.g. "team-agency",
 * "client-<id>", "project-<id>", or the custom channel legacyId).
 */
export const listChannelPreviews = zWorkspaceQueryActive({
  args: {},
  handler: async (ctx, args) => {
    const channelTypeScanLimit = 200
    const channelKeyToMessage: Record<
      string,
      { content: string; createdAtMs: number } | undefined
    > = {}

    const extractPreviewContent = (row: CollaborationMessageRow): string => {
      const text =
        typeof row.content === 'string' && row.content.trim().length > 0
          ? row.content.trim()
          : ''
      if (text) return text
      return buildAttachmentSummary(row.attachments)
    }

    // Scan each channel type's recent messages and keep the latest per channel key.
    const channelTypes = ['team', 'client', 'project'] as const
    for (const channelType of channelTypes) {
      const rows = await buildChannelTypeQuery(
        ctx,
        args.workspaceId,
        channelType,
      )
        .take(channelTypeScanLimit)

      for (const row of rows) {
        if (row.deleted) continue
        const channelKey = resolveChannelKey(row)
        if (!channelKey) continue

        // buildChannelTypeQuery orders desc, so the first row we see for a
        // given channel key is the latest.
        if (channelKeyToMessage[channelKey]) continue

        const content = extractPreviewContent(row)
        if (!content) continue

        channelKeyToMessage[channelKey] = {
          content,
          createdAtMs: typeof row.createdAtMs === 'number' ? row.createdAtMs : 0,
        }
      }
    }

    // Also scan custom channels (team channels with a channelId).
    const customChannels = (await ctx.db
      .query('collaborationChannels')
      .withIndex('by_workspace_channelType_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('channelType', 'team'),
      )
      .order('desc')
      .take(200))
      .filter((row) => canAccessCustomChannel(ctx, row))

    for (const channel of customChannels) {
      if (channelKeyToMessage[channel.legacyId]) continue

      const rows = await buildListChannelQuery(ctx, {
        workspaceId: args.workspaceId,
        channelId: channel.legacyId,
        channelType: 'team',
        clientId: null,
        projectId: null,
      }).take(1)

      const last = rows[0]
      if (!last || last.deleted) continue

      const content = extractPreviewContent(last)
      if (!content) continue

      channelKeyToMessage[channel.legacyId] = {
        content,
        createdAtMs: typeof last.createdAtMs === 'number' ? last.createdAtMs : 0,
      }
    }

    return { previewsByChannelKey: channelKeyToMessage }
  },
})

