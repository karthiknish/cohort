import { v } from 'convex/values'
import { internal } from './_generated/api'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation, authenticatedMutation } from './functions'

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

const taskCommentValidator = v.object({
  _id: v.id('taskComments'),
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

export const listForTask = workspaceQuery({
  args: { taskLegacyId: v.string(), limit: v.number() },
  returns: v.array(taskCommentValidator),
  handler: async (ctx, args) => {
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

export const getByLegacyId = workspaceQuery({
  args: { taskLegacyId: v.string(), legacyId: v.string() },
  returns: v.union(v.null(), taskCommentValidator),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId).eq('legacyId', args.legacyId)
      )
      .unique()

    return row ?? null
  },
})

export const create = workspaceMutation({
  args: {
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
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const currentUserId = typeof ctx?.user?._id === 'string' ? ctx.user._id : null
    if (!currentUserId) {
      throw Errors.auth.unauthorized()
    }

    if (args.authorId && args.authorId !== currentUserId) {
      throw Errors.auth.forbidden('Cannot create comments on behalf of another user')
    }

    const currentUserName =
      typeof ctx?.user?.name === 'string' && ctx.user.name.trim().length > 0
        ? ctx.user.name
        : args.authorName
    const currentUserRole = typeof ctx?.user?.role === 'string' ? ctx.user.role : args.authorRole

    const timestamp = ctx.now

    await ctx.db.insert('taskComments', {
      workspaceId: args.workspaceId,
      taskLegacyId: args.taskLegacyId,
      legacyId: args.legacyId,
      content: args.content,
      format: args.format,
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: currentUserRole,
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

    const task = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.taskLegacyId))
      .unique()

    const taskTitle = task?.title ?? 'Task'
    const taskClientId = typeof task?.clientId === 'string' && task.clientId.length > 0 ? task.clientId : null
    const baseRoles = taskClientId ? ['admin', 'team', 'client'] : ['admin', 'team']

    const content = typeof args.content === 'string' ? args.content : ''
    const snippet = content.length > 200 ? `${content.slice(0, 197)}…` : content

    await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
      workspaceId: args.workspaceId,
      legacyId: `task:comment:${args.legacyId}`,
      kind: 'task.comment',
      title: `New comment: ${taskTitle}`,
      body: snippet || '(no content)',
      actorId: currentUserId,
      actorName: currentUserName ?? null,
      resourceType: 'task',
      resourceId: args.taskLegacyId,
      recipientRoles: baseRoles,
      recipientClientId: taskClientId,
      recipientClientIds: taskClientId ? [taskClientId] : undefined,
      metadata: {
        taskId: args.taskLegacyId,
        commentId: args.legacyId,
        clientId: taskClientId,
        clientName: (task as any)?.client ?? null,
      },
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    const mentions = args.mentions ?? []
    for (const mention of mentions) {
      if (!mention || typeof mention.slug !== 'string' || !mention.slug) continue

      const mentionSnippet = content.length > 150 ? `${content.slice(0, 147)}…` : content
      const senderName = currentUserName ?? 'Someone'

      await ctx.scheduler.runAfter(0, internal.notifications.createInternal, {
        workspaceId: args.workspaceId,
        legacyId: `task:mention:${args.legacyId}:${mention.slug}`,
        kind: 'task.mention',
        title: `${senderName} mentioned you`,
        body: mentionSnippet || '(no content)',
        actorId: currentUserId,
        actorName: senderName,
        resourceType: 'task',
        resourceId: args.taskLegacyId,
        recipientRoles: ['admin', 'team', 'client'],
        recipientClientId: taskClientId,
        recipientClientIds: taskClientId ? [taskClientId] : undefined,
        metadata: {
          taskId: args.taskLegacyId,
          taskTitle,
          commentId: args.legacyId,
          mentionedName: mention.name,
          mentionSlug: mention.slug,
          clientId: taskClientId,
        },
        createdAtMs: timestamp,
        updatedAtMs: timestamp,
      })
    }

    return { ok: true } as const
  },
})

// Use authenticatedMutation for bulk operations that may span multiple workspaces
export const bulkUpsert = authenticatedMutation({
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
  returns: v.object({
    ok: v.literal(true),
    upserted: v.number(),
  }),
  handler: async (ctx, args) => {
    let upserted = 0
    for (const comment of args.comments) {
      // Verify workspace access for each comment
      if (ctx.user.role !== 'admin' && ctx.agencyId !== comment.workspaceId) {
        throw Errors.auth.workspaceAccessDenied()
      }

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

    return { ok: true as const, upserted }
  },
})

export const updateContent = workspaceMutation({
  args: {
    taskLegacyId: v.string(),
    legacyId: v.string(),
    content: v.string(),
    updatedBy: v.string(),
  },
  returns: v.union(
    v.object({ ok: v.literal(true) }),
    v.object({ ok: v.literal(false), error: v.literal('not_found') })
  ),
  handler: async (ctx, args) => {
    const currentUserId = typeof ctx?.user?._id === 'string' ? ctx.user._id : null
    if (!currentUserId) {
      throw Errors.auth.unauthorized()
    }

    const row = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) return { ok: false as const, error: 'not_found' as const }

    const isAdmin = ctx?.user?.role === 'admin'
    const isAuthor = typeof row.authorId === 'string' && row.authorId === currentUserId
    if (!isAdmin && !isAuthor) {
      throw Errors.auth.forbidden('You can only edit your own comments')
    }

    await ctx.db.patch(row._id, {
      content: args.content,
      updatedAtMs: ctx.now,
      // Keep parity with Firestore schema, but we don't currently store updatedBy in Convex.
    })

    return { ok: true } as const
  },
})

export const softDelete = workspaceMutation({
  args: {
    taskLegacyId: v.string(),
    legacyId: v.string(),
    deletedBy: v.string(),
  },
  returns: v.union(
    v.object({ ok: v.literal(true) }),
    v.object({ ok: v.literal(false), error: v.literal('not_found') })
  ),
  handler: async (ctx, args) => {
    const currentUserId = typeof ctx?.user?._id === 'string' ? ctx.user._id : null
    if (!currentUserId) {
      throw Errors.auth.unauthorized()
    }

    if (args.deletedBy && args.deletedBy !== currentUserId) {
      throw Errors.auth.forbidden('Cannot delete comments on behalf of another user')
    }

    const row = await ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('taskLegacyId', args.taskLegacyId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) return { ok: false as const, error: 'not_found' as const }

    const isAdmin = ctx?.user?.role === 'admin'
    const isAuthor = typeof row.authorId === 'string' && row.authorId === currentUserId
    if (!isAdmin && !isAuthor) {
      throw Errors.auth.forbidden('You can only delete your own comments')
    }

    await ctx.db.patch(row._id, {
      deleted: true,
      deletedAtMs: ctx.now,
      deletedBy: currentUserId,
      updatedAtMs: ctx.now,
    })

    return { ok: true } as const
  },
})
