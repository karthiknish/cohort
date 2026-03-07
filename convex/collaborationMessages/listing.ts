import {
  type CollaborationMessageRow,
  type ScoredMessage,
  applyManualPagination,
  assertAccessToMessage,
  assertChannelAccess,
  buildListChannelQuery,
  buildThreadQuery,
  clampLimit,
  fetchChannelRows,
  fuzzyScore,
  getPaginatedResponse,
  hydrateMessageRow,
  normalizeChannelScope,
  normalizeTerm,
  tokenize,
  z,
  zWorkspacePaginatedQuery,
  zWorkspacePaginatedQueryActive,
  zWorkspaceQuery,
  zWorkspaceQueryActive,
} from './shared'

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
      .map((row): ScoredMessage | null => {
        // deleted filter is handled by workspaceQueryActive implicitly if we use fetchChannelRows correctly
        // but here rows are already fetched and hydrated.

        const senderName = typeof row?.senderName === 'string' ? row.senderName : ''
        if (senderTerm && !normalizeTerm(senderName).includes(senderTerm)) {
          return null
        }

        const mentions = Array.isArray(row?.mentions) ? row.mentions : []
        if (mentionTerm) {
          const mentionNames = mentions
            .map((m) => (typeof m?.name === 'string' ? normalizeTerm(m.name) : ''))
            .filter(Boolean)
          const hasMention = mentionNames.some((name: string) => name.includes(mentionTerm))
          if (!hasMention) return null
        }

        const attachments = Array.isArray(row?.attachments) ? row.attachments : []
        if (attachmentTerm) {
          const attachmentNames = attachments
            .map((a) => (typeof a?.name === 'string' ? normalizeTerm(a.name) : ''))
            .filter(Boolean)
          const hasAttachment = attachmentNames.some((name: string) => name.includes(attachmentTerm))
          if (!hasAttachment) return null
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

        if (totalScore <= 0) return null

        return {
          row,
          score: totalScore,
          highlights: Array.from(highlightSet),
        }
      })
      .filter((item): item is ScoredMessage => item !== null)

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, limit)
    const highlights = Array.from(new Set(top.flatMap((item) => item.highlights)))

    return {
      rows: top.map((item) => item.row),
      highlights,
    }
  },
})

