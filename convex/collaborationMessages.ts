import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs() {
  return Date.now()
}

async function hydrateAttachments(
  ctx: any,
  attachments: Array<{ name: string; url: string; storageId?: string | null; type?: string | null; size?: string | null }> | null,
) {
  if (!Array.isArray(attachments) || attachments.length === 0) return attachments

  const next = await Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment || typeof attachment !== 'object') return attachment
      const storageId = (attachment as any).storageId
      if (typeof storageId !== 'string' || storageId.length === 0) return attachment

      const url = await ctx.storage.getUrl(storageId as Id<'_storage'>)
      return {
        ...(attachment as any),
        url: url ?? (attachment as any).url,
      }
    }),
  )

  return next
}

async function hydrateMessageRow(ctx: any, row: any) {
  if (!row || typeof row !== 'object') return row
  const attachments = Array.isArray((row as any).attachments) ? ((row as any).attachments as any[]) : null
  const hydrated = await hydrateAttachments(ctx, attachments as any)
  if (hydrated === attachments) return row
  return { ...(row as any), attachments: hydrated }
}

function clampLimit(value: number, min: number, max: number) {
  const n = Number.isFinite(value) ? Math.trunc(value) : min
  return Math.min(Math.max(n, min), max)
}

function normalizeTerm(term: string) {
  return term.trim().toLowerCase()
}

function tokenize(input: string) {
  return input
    .split(/\s+/)
    .map(normalizeTerm)
    .filter((token) => token.length > 0)
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  const aLen = a.length
  const bLen = b.length
  for (let i = 0; i <= bLen; i += 1) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= aLen; j += 1) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= bLen; i += 1) {
    for (let j = 1; j <= aLen; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }
  return matrix[bLen][aLen]
}

function fuzzyScore(text: string, term: string): number {
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

const attachment = v.object({
  name: v.string(),
  url: v.string(),
  storageId: v.optional(v.union(v.string(), v.null())),
  type: v.optional(v.union(v.string(), v.null())),
  size: v.optional(v.union(v.string(), v.null())),
})

const mention = v.object({
  slug: v.string(),
  name: v.string(),
  role: v.union(v.string(), v.null()),
})

function buildListChannelQuery(ctx: any, args: any) {
  let q: any

  if (args.channelType === 'client') {
    q = ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_channel_client_createdAtMs_legacyId', (q: any) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('channelType', args.channelType)
          .eq('clientId', args.clientId ?? null),
      )
  } else if (args.channelType === 'project') {
    q = ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_channel_project_createdAtMs_legacyId', (q: any) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('channelType', args.channelType)
          .eq('projectId', args.projectId ?? null),
      )
  } else {
    q = ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_channel_createdAtMs_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('channelType', args.channelType),
      )
  }

  q = q.order('desc')

  const afterCreatedAtMs = args.afterCreatedAtMs
  const afterLegacyId = args.afterLegacyId

  if (typeof afterCreatedAtMs === 'number' && typeof afterLegacyId === 'string') {
    q = q.filter((row: any) =>
      row.or(
        row.lt(row.field('createdAtMs'), afterCreatedAtMs),
        row.and(
          row.eq(row.field('createdAtMs'), afterCreatedAtMs),
          row.lt(row.field('legacyId'), afterLegacyId),
        ),
      ),
    )
  }

  return q
}

async function fetchChannelRows(ctx: any, args: any) {
  const q = buildListChannelQuery(ctx, args)
  const rows = await q.take(args.limit)
  return await Promise.all(rows.map((row: any) => hydrateMessageRow(ctx, row)))
}

export const listChannel = query({
  args: {
    workspaceId: v.string(),
    channelType: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    projectId: v.optional(v.union(v.string(), v.null())),
    limit: v.number(),
    afterCreatedAtMs: v.optional(v.number()),
    afterLegacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    return await fetchChannelRows(ctx, args)
  },
})

export const listThreadReplies = query({
  args: {
    workspaceId: v.string(),
    threadRootId: v.string(),
    limit: v.number(),
    afterCreatedAtMs: v.optional(v.number()),
    afterLegacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    let q: any = ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_threadRoot_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('threadRootId', args.threadRootId),
      )
      .order('asc')

    const afterCreatedAtMs = args.afterCreatedAtMs
    const afterLegacyId = args.afterLegacyId

    if (typeof afterCreatedAtMs === 'number' && typeof afterLegacyId === 'string') {
      q = q.filter((row: any) =>
        row.or(
          row.gt(row.field('createdAtMs'), afterCreatedAtMs),
          row.and(
            row.eq(row.field('createdAtMs'), afterCreatedAtMs),
            row.gt(row.field('legacyId'), afterLegacyId),
          ),
        ),
      )
    }

    const rows = await q.take(args.limit)
    return await Promise.all(rows.map((row: any) => hydrateMessageRow(ctx, row)))
  },
})

export const getByLegacyId = query({
  args: { workspaceId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    return row ? await hydrateMessageRow(ctx, row) : null
  },
})

export const searchChannel = query({
  args: {
    workspaceId: v.string(),
    channelType: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    projectId: v.optional(v.union(v.string(), v.null())),
    q: v.optional(v.union(v.string(), v.null())),
    sender: v.optional(v.union(v.string(), v.null())),
    attachment: v.optional(v.union(v.string(), v.null())),
    mention: v.optional(v.union(v.string(), v.null())),
    startMs: v.optional(v.union(v.number(), v.null())),
    endMs: v.optional(v.union(v.number(), v.null())),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = clampLimit(args.limit, 20, 400)

    // Reuse the same indexes + ordering as listChannel.
    const rows = (await fetchChannelRows(ctx, {
      workspaceId: args.workspaceId,
      channelType: args.channelType,
      clientId: args.clientId ?? null,
      projectId: args.projectId ?? null,
      limit,
    })) as any[]

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
      .map((row) => {
        const isDeleted = Boolean(row?.deleted || row?.deletedAtMs)
        if (isDeleted) return null

        const senderName = typeof row?.senderName === 'string' ? row.senderName : ''
        if (senderTerm && !normalizeTerm(senderName).includes(senderTerm)) {
          return null
        }

        const mentions = Array.isArray(row?.mentions) ? row.mentions : []
        if (mentionTerm) {
          const mentionNames = mentions
            .map((m: any) => (typeof m?.name === 'string' ? normalizeTerm(m.name) : ''))
            .filter(Boolean)
          const hasMention = mentionNames.some((name: string) => name.includes(mentionTerm))
          if (!hasMention) return null
        }

        const attachments = Array.isArray(row?.attachments) ? row.attachments : []
        if (attachmentTerm) {
          const attachmentNames = attachments
            .map((a: any) => (typeof a?.name === 'string' ? normalizeTerm(a.name) : ''))
            .filter(Boolean)
          const hasAttachment = attachmentNames.some((name: string) => name.includes(attachmentTerm))
          if (!hasAttachment) return null
        }

        const highlightSet = new Set<string>()
        let totalScore = 0

        const haystacks: string[] = []
        if (typeof row?.content === 'string' && row.content) haystacks.push(row.content)
        if (senderName) haystacks.push(senderName)
        if (attachments.length) haystacks.push(...attachments.map((a: any) => String(a?.name ?? '')))
        if (mentions.length) haystacks.push(...mentions.map((m: any) => String(m?.name ?? '')))

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
      .filter(Boolean) as Array<{ row: any; score: number; highlights: string[] }>

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, limit)
    const highlights = Array.from(new Set(top.flatMap((item) => item.highlights)))

    return {
      rows: top.map((item) => item.row),
      highlights,
    }
  },
})

export const create = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    channelType: v.string(),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    senderId: v.union(v.string(), v.null()),
    senderName: v.string(),
    senderRole: v.union(v.string(), v.null()),
    content: v.string(),
    attachments: v.optional(v.array(attachment)),
    format: v.optional(v.union(v.literal('markdown'), v.literal('plaintext'))),
    mentions: v.optional(v.array(mention)),
    parentMessageId: v.optional(v.union(v.string(), v.null())),
    threadRootId: v.optional(v.union(v.string(), v.null())),
    isThreadRoot: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

    const hydratedAttachments = await hydrateAttachments(ctx, (args.attachments ?? null) as any)

    await ctx.db.insert('collaborationMessages', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      content: args.content,
      createdAtMs: timestamp,
      updatedAtMs: null,
      deleted: false,
      deletedAtMs: null,
      deletedBy: null,
      attachments: hydratedAttachments ?? null,
      format: args.format ?? 'markdown',
      mentions: args.mentions ?? null,
      reactions: null,
      parentMessageId: args.parentMessageId ?? null,
      threadRootId: args.threadRootId ?? null,
      isThreadRoot: args.isThreadRoot ?? true,
      threadReplyCount: null,
      threadLastReplyAtMs: null,
    })

    if (args.isThreadRoot === false && typeof args.threadRootId === 'string' && args.threadRootId) {
      const root = await ctx.db
        .query('collaborationMessages')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.threadRootId!))
        .unique()

      if (root) {
        const currentCount = typeof root.threadReplyCount === 'number' ? root.threadReplyCount : 0
        await ctx.db.patch(root._id, {
          threadReplyCount: currentCount + 1,
          threadLastReplyAtMs: timestamp,
          updatedAtMs: timestamp,
        })
      }
    }

    return { ok: true }
  },
})

export const updateMessage = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    content: v.string(),
    format: v.optional(v.union(v.literal('markdown'), v.literal('plaintext'))),
    mentions: v.optional(v.array(mention)),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return { ok: false, error: 'not_found' as const }

    const timestamp = nowMs()
    await ctx.db.patch(row._id, {
      content: args.content,
      ...(args.format !== undefined ? { format: args.format } : {}),
      ...(args.mentions !== undefined ? { mentions: args.mentions } : {}),
      updatedAtMs: timestamp,
    })

    return { ok: true }
  },
})

export const softDelete = mutation({
  args: { workspaceId: v.string(), legacyId: v.string(), deletedBy: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return { ok: false, error: 'not_found' as const }

    const timestamp = nowMs()
    await ctx.db.patch(row._id, {
      deleted: true,
      deletedAtMs: timestamp,
      deletedBy: args.deletedBy,
      updatedAtMs: timestamp,
    })

    return { ok: true }
  },
})

export const toggleReaction = mutation({
  args: { workspaceId: v.string(), legacyId: v.string(), emoji: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return { ok: false, error: 'not_found' as const }

    const reactions = Array.isArray(row.reactions) ? row.reactions.slice() : []

    const updated: Array<{ emoji: string; count: number; userIds: string[] }> = []
    let reactionFound = false

    for (const entry of reactions) {
      if (!entry || typeof entry !== 'object') continue
      const emoji = (entry as any).emoji
      const userIds: string[] = Array.isArray((entry as any).userIds)
        ? (entry as any).userIds.filter((v: any): v is string => typeof v === 'string')
        : []

      if (emoji !== args.emoji) {
        updated.push({ emoji, count: Array.isArray((entry as any).userIds) ? userIds.length : (entry as any).count ?? userIds.length, userIds })
        continue
      }

      reactionFound = true
      const existingUsers = Array.from(new Set(userIds))
      const hasReacted = existingUsers.includes(args.userId)
      const nextUsers: string[] = hasReacted
        ? existingUsers.filter((id) => id !== args.userId)
        : [...existingUsers, args.userId]

      if (nextUsers.length === 0) {
        continue
      }

      updated.push({ emoji: args.emoji, count: nextUsers.length, userIds: nextUsers })
    }

    if (!reactionFound) {
      updated.push({ emoji: args.emoji, count: 1, userIds: [args.userId] })
    }

    await ctx.db.patch(row._id, {
      reactions: updated,
      updatedAtMs: nowMs(),
    })

    return { ok: true, reactions: updated }
  },
})

export const bulkUpsert = mutation({
  args: {
    messages: v.array(
      v.object({
        workspaceId: v.string(),
        legacyId: v.string(),
        channelType: v.string(),
        clientId: v.union(v.string(), v.null()),
        projectId: v.union(v.string(), v.null()),
        senderId: v.union(v.string(), v.null()),
        senderName: v.string(),
        senderRole: v.union(v.string(), v.null()),
        content: v.string(),
        createdAtMs: v.number(),
        updatedAtMs: v.union(v.number(), v.null()),
        deleted: v.boolean(),
        deletedAtMs: v.union(v.number(), v.null()),
        deletedBy: v.union(v.string(), v.null()),
        attachments: v.union(v.array(attachment), v.null()),
        format: v.union(v.literal('markdown'), v.literal('plaintext')),
        mentions: v.union(v.array(mention), v.null()),
        reactions: v.union(
          v.array(
            v.object({
              emoji: v.string(),
              count: v.number(),
              userIds: v.array(v.string()),
            })
          ),
          v.null()
        ),
        parentMessageId: v.union(v.string(), v.null()),
        threadRootId: v.union(v.string(), v.null()),
        isThreadRoot: v.boolean(),
        threadReplyCount: v.union(v.number(), v.null()),
        threadLastReplyAtMs: v.union(v.number(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    let upserted = 0

    for (const message of args.messages) {
      const existing = await ctx.db
        .query('collaborationMessages')
        .withIndex('by_workspace_legacyId', (q) =>
          q.eq('workspaceId', message.workspaceId).eq('legacyId', message.legacyId)
        )
        .unique()

      const hydratedAttachments = await hydrateAttachments(ctx, (message.attachments ?? null) as any)

      const payload = {
        workspaceId: message.workspaceId,
        legacyId: message.legacyId,
        channelType: message.channelType,
        clientId: message.clientId,
        projectId: message.projectId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        content: message.content,
        createdAtMs: message.createdAtMs,
        updatedAtMs: message.updatedAtMs,
        deleted: message.deleted,
        deletedAtMs: message.deletedAtMs,
        deletedBy: message.deletedBy,
        attachments: hydratedAttachments,
        format: message.format,
        mentions: message.mentions,
        reactions: message.reactions,
        parentMessageId: message.parentMessageId,
        threadRootId: message.threadRootId,
        isThreadRoot: message.isThreadRoot,
        threadReplyCount: message.threadReplyCount,
        threadLastReplyAtMs: message.threadLastReplyAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('collaborationMessages', payload)
      }

      upserted += 1
    }

    return { ok: true, upserted }
  },
})
