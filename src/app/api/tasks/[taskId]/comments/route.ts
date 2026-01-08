import { NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ValidationError, NotFoundError } from '@/lib/api-errors'
import { mapTaskDoc, mapTaskCommentDoc } from '@/lib/firestore/mappers'
import type { StoredTask, StoredTaskComment } from '@/types/stored-types'
import type { TaskCommentFormat } from '@/types/task-comments'
import { extractMentionsFromContent } from '@/lib/mentions'
import { recordTaskCommentNotification, recordTaskMentionNotifications } from '@/lib/notifications'

const listQuerySchema = z.object({
  limit: z.string().optional(),
})

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(240),
  url: z.string().trim().url(),
  type: z.string().trim().max(200).nullable().optional(),
  size: z.string().trim().max(40).nullable().optional(),
})

const mentionSchema = z.object({
  slug: z.string().trim().min(1).max(240),
  name: z.string().trim().min(1).max(240),
  role: z.string().trim().max(120).nullable().optional(),
})

const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment is required').max(8000),
  format: z.enum(['markdown', 'plaintext']).default('markdown') as z.ZodType<TaskCommentFormat>,
  attachments: z.array(attachmentSchema).optional(),
  mentions: z.array(mentionSchema).optional(),
  parentCommentId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional(),
})

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: listQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { workspace, params, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const taskId = (params?.taskId as string)?.trim()
    if (!taskId) {
      throw new ValidationError('Task ID is required')
    }

    const taskRef = workspace.tasksCollection.doc(taskId)
    const taskSnap = await taskRef.get()
    if (!taskSnap.exists) {
      throw new NotFoundError('Task not found')
    }

    const limit = Math.min(Math.max(parseInt(query.limit ?? '100', 10) || 100, 1), 300)

    const commentsSnap = await taskRef
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .orderBy(FieldPath.documentId(), 'asc')
      .limit(limit)
      .get()

    const comments = commentsSnap.docs
      .map((doc) => mapTaskCommentDoc(doc.id, doc.data() as StoredTaskComment))
      .filter((comment) => !comment.isDeleted)
      .map((comment) => ({ ...comment, taskId }))

    return NextResponse.json({ comments })
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createCommentSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params, body }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const taskId = (params?.taskId as string)?.trim()
    if (!taskId) {
      throw new ValidationError('Task ID is required')
    }

    const payload = body as z.infer<typeof createCommentSchema>

    const taskRef = workspace.tasksCollection.doc(taskId)
    const taskSnap = await taskRef.get()
    if (!taskSnap.exists) {
      throw new NotFoundError('Task not found')
    }

    const task = mapTaskDoc(taskSnap.id, taskSnap.data() as StoredTask)

    const uid = auth.uid!
    const actorName = auth.name ?? auth.email ?? 'Teammate'
    const actorRole = (auth.claims?.role as string | undefined) ?? null

    let threadRootId: string | null = null
    if (payload.parentCommentId) {
      const parentRef = taskRef.collection('comments').doc(payload.parentCommentId)
      const parentSnap = await parentRef.get()
      if (!parentSnap.exists) {
        throw new NotFoundError('Parent comment not found')
      }
      const parentData = parentSnap.data() as StoredTaskComment
      threadRootId = typeof parentData.threadRootId === 'string'
        ? parentData.threadRootId
        : parentSnap.id
    }

    const extracted = extractMentionsFromContent(payload.content)
    const providedMentionMap = new Map<string, { slug: string; name: string; role?: string | null }>()
    ;(payload.mentions ?? []).forEach((mention) => {
      providedMentionMap.set(mention.slug, mention)
    })

    const mentions = extracted.map((mention) => {
      const provided = providedMentionMap.get(mention.slug)
      return {
        slug: mention.slug,
        name: provided?.name ?? mention.name,
        role: provided?.role ?? null,
      }
    })

    const now = Timestamp.now()
    const commentData: StoredTaskComment = {
      taskId,
      content: payload.content,
      format: payload.format,
      authorId: uid,
      authorName: actorName,
      authorRole: actorRole,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deletedBy: null,
      deleted: false,
      attachments: payload.attachments ?? [],
      mentions,
      parentCommentId: payload.parentCommentId ?? null,
      threadRootId,
    }

    const docRef = await taskRef.collection('comments').add(commentData as any)
    const comment = mapTaskCommentDoc(docRef.id, commentData)

    const snippetSource = payload.content
    const rawSnippet = snippetSource.length > 150 ? `${snippetSource.slice(0, 147)}…` : snippetSource
    const snippet = rawSnippet.trim().length > 0 ? rawSnippet.trim() : '(no comment content)'

    try {
      await recordTaskCommentNotification({
        workspaceId: workspace.workspaceId,
        task,
        commentId: comment.id,
        snippet,
        actorId: uid,
        actorName,
      })
    } catch (notificationError) {
      console.error('[task-comments] task.comment notification failed', notificationError)
    }

    if (mentions.length > 0) {
      try {
        await recordTaskMentionNotifications({
          workspaceId: workspace.workspaceId,
          task,
          commentId: comment.id,
          mentions,
          snippet,
          actorId: uid,
          actorName,
        })
      } catch (notificationError) {
        console.error('[task-comments] task.mention notifications failed', notificationError)
      }
    }

    return comment
  }
)
