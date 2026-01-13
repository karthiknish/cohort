import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw Errors.auth.unauthorized()
}

function nowMs() {
  return Date.now()
}

const attachment = v.object({
  name: v.string(),
  url: v.string(),
  type: v.optional(v.union(v.string(), v.null())),
  size: v.optional(v.union(v.string(), v.null())),
})

const mention = v.object({
  slug: v.string(),
  name: v.string(),
  role: v.union(v.string(), v.null()),
})

export const listForTask = query({
  args: { workspaceId: v.string(), taskLegacyId: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const rows = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId)
      )
      .order('asc')
      .take(args.limit)

    return rows
  },
})

export const getByLegacyId = query({
  args: { workspaceId: v.string(), taskLegacyId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId).eq('legacyId', args.legacyId)
      )
      .unique()

    return row ?? null
  },
})

export const create = mutation({
  args: {
    workspaceId: v.string(),
    taskLegacyId: v.string(),
    legacyId: v.string(),
    content: v.string(),
    format: v.union(v.literal('markdown'), v.literal('plaintext')),
    authorId: v.union(v.string(), v.null()),
    authorName: v.union(v.string(), v.null()),
    authorRole: v.union(v.string(), v.null()),
    attachments: v.optional(v.array(attachment)),
    mentions: v.optional(v.array(mention)),
    parentCommentId: v.optional(v.union(v.string(), v.null())),
    threadRootId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

    await ctx.db.insert('taskComments', {
      workspaceId: args.workspaceId,
      taskLegacyId: args.taskLegacyId,
      legacyId: args.legacyId,
      content: args.content,
      format: args.format,
      authorId: args.authorId,
      authorName: args.authorName,
      authorRole: args.authorRole,
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
      deleted: false,
      deletedAtMs: null,
      deletedBy: null,
      attachments: args.attachments ?? [],
      mentions: args.mentions ?? [],
      parentCommentId: args.parentCommentId ?? null,
      threadRootId: args.threadRootId ?? null,
    })

    return { ok: true }
  },
})

export const bulkUpsert = mutation({
  args: {
    comments: v.array(
      v.object({
        workspaceId: v.string(),
        taskLegacyId: v.string(),
        legacyId: v.string(),
        content: v.string(),
        format: v.union(v.literal('markdown'), v.literal('plaintext')),
        authorId: v.union(v.string(), v.null()),
        authorName: v.union(v.string(), v.null()),
        authorRole: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
        deleted: v.boolean(),
        deletedAtMs: v.union(v.number(), v.null()),
        deletedBy: v.union(v.string(), v.null()),
        attachments: v.array(attachment),
        mentions: v.array(mention),
        parentCommentId: v.union(v.string(), v.null()),
        threadRootId: v.union(v.string(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    let upserted = 0
    for (const comment of args.comments) {
      const existing = await ctx.db
        .query('taskComments')
        .withIndex('by_workspace_task_legacyId', (q) =>
          q
            .eq('workspaceId', comment.workspaceId)
            .eq('taskLegacyId', comment.taskLegacyId)
            .eq('legacyId', comment.legacyId)
        )
        .unique()

      const payload = {
        workspaceId: comment.workspaceId,
        taskLegacyId: comment.taskLegacyId,
        legacyId: comment.legacyId,
        content: comment.content,
        format: comment.format,
        authorId: comment.authorId,
        authorName: comment.authorName,
        authorRole: comment.authorRole,
        createdAtMs: comment.createdAtMs,
        updatedAtMs: comment.updatedAtMs,
        deleted: comment.deleted,
        deletedAtMs: comment.deletedAtMs,
        deletedBy: comment.deletedBy,
        attachments: comment.attachments,
        mentions: comment.mentions,
        parentCommentId: comment.parentCommentId,
        threadRootId: comment.threadRootId,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('taskComments', payload)
      }

      upserted += 1
    }

    return { ok: true, upserted }
  },
})

export const updateContent = mutation({
  args: { workspaceId: v.string(), taskLegacyId: v.string(), legacyId: v.string(), content: v.string(), updatedBy: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) return { ok: false, error: 'not_found' as const }

    const timestamp = nowMs()
    await ctx.db.patch(row._id, {
      content: args.content,
      updatedAtMs: timestamp,
      // Keep parity with Firestore schema, but we don't currently store updatedBy in Convex.
    })

    return { ok: true }
  },
})

export const softDelete = mutation({
  args: { workspaceId: v.string(), taskLegacyId: v.string(), legacyId: v.string(), deletedBy: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId).eq('legacyId', args.legacyId)
      )
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
