import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { mapTaskCommentDoc } from '@/lib/firestore/mappers'
import type { StoredTaskComment } from '@/types/stored-types'

const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(8000).optional(),
})

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: updateCommentSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params, body }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const taskId = (params?.taskId as string)?.trim()
    const commentId = (params?.commentId as string)?.trim()
    if (!taskId) throw new ValidationError('Task ID is required')
    if (!commentId) throw new ValidationError('Comment ID is required')

    const payload = body as z.infer<typeof updateCommentSchema>
    if (!payload.content) {
      throw new ValidationError('No valid updates supplied')
    }

    const taskRef = workspace.tasksCollection.doc(taskId)
    const taskSnap = await taskRef.get()
    if (!taskSnap.exists) {
      throw new NotFoundError('Task not found')
    }

    const commentRef = taskRef.collection('comments').doc(commentId)
    const commentSnap = await commentRef.get()
    if (!commentSnap.exists) {
      throw new NotFoundError('Comment not found')
    }

    await commentRef.update({
      content: payload.content,
      updatedAt: Timestamp.now(),
      updatedBy: auth.uid!,
    })

    const updatedData = { ...(commentSnap.data() as StoredTaskComment), content: payload.content, updatedAt: Timestamp.now() } as StoredTaskComment
    return mapTaskCommentDoc(commentId, updatedData)
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const taskId = (params?.taskId as string)?.trim()
    const commentId = (params?.commentId as string)?.trim()
    if (!taskId) throw new ValidationError('Task ID is required')
    if (!commentId) throw new ValidationError('Comment ID is required')

    const taskRef = workspace.tasksCollection.doc(taskId)
    const taskSnap = await taskRef.get()
    if (!taskSnap.exists) {
      throw new NotFoundError('Task not found')
    }

    const commentRef = taskRef.collection('comments').doc(commentId)
    const commentSnap = await commentRef.get()
    if (!commentSnap.exists) {
      throw new NotFoundError('Comment not found')
    }

    await commentRef.update({
      deleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: auth.uid!,
      updatedAt: Timestamp.now(),
    })

    return { success: true }
  }
)
