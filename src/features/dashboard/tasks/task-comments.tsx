'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useMutation, useQuery } from 'convex/react'

import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { useToast } from '@/shared/ui/use-toast'
import { filesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { isConvexRealtimeEnabled } from '@/lib/convex-realtime'
import { extractMentionsFromContent } from '@/lib/mentions'
import { uploadTaskCommentAttachment } from '@/services/task-comment-attachments'
import type { TaskComment } from '@/types/task-comments'
import { api as generatedApi } from '@convex/_generated/api'
import type { TaskParticipant } from './task-types'
import {
  TaskCommentsComposerSection,
  TaskCommentsDeleteDialog,
  TaskCommentsSummaryHeader,
  TaskCommentsThreadList,
  type TaskCommentComposerAttachment,
} from './task-comments-sections'

type TaskCommentsPanelProps = {
  taskId: string
  workspaceId: string | null
  userId: string | null
  userName: string | null
  userRole: string | null
  participants: TaskParticipant[]
  onCommentCountChange?: (count: number) => void
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '1 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildPendingAttachments(files: FileList): TaskCommentComposerAttachment[] {
  const now = Date.now()
  return Array.from(files).map((file, index) => ({
    id: `${now}-${index}-${file.name}`,
    file,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: formatBytes(file.size),
  }))
}

function getPreviewText(content: string | null | undefined): string {
  const normalized = String(content ?? '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= 72) return normalized
  return `${normalized.slice(0, 69)}...`
}

export function TaskCommentsPanel(props: TaskCommentsPanelProps) {
  const { taskId, workspaceId, userId, userName, userRole, participants, onCommentCountChange } = props
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const convex = useConvex()

  const convexEnabled = isConvexRealtimeEnabled() && Boolean(workspaceId)
  const convexRows = useQuery(
    generatedApi.taskComments.listForTask,
    convexEnabled
      ? {
          workspaceId: String(workspaceId),
          taskLegacyId: String(taskId),
          limit: 200,
        }
      : 'skip'
  ) as Array<Record<string, unknown>> | undefined

  const createComment = useMutation(generatedApi.taskComments.create)
  const updateComment = useMutation(generatedApi.taskComments.updateContent)
  const deleteComment = useMutation(generatedApi.taskComments.softDelete)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex]
  )

  const [composerValue, setComposerValue] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<TaskComment | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<TaskCommentComposerAttachment[]>([])
  const [deleteTarget, setDeleteTarget] = useState<TaskComment | null>(null)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const sortedParticipants = useMemo(() => {
    const map = new Map<string, TaskParticipant>()
    for (const participant of participants) {
      const key = participant.name.trim().toLowerCase()
      if (!key) continue
      if (!map.has(key)) map.set(key, participant)
    }
    if (userName) {
      const key = userName.trim().toLowerCase()
      if (key && !map.has(key)) {
        map.set(key, { name: userName, role: userRole ?? 'Team' })
      }
    }
    return Array.from(map.values())
  }, [participants, userName, userRole])

  const composerParticipants = useMemo(
    () =>
      sortedParticipants.map((participant) => ({
        name: participant.name,
        role: participant.role ?? 'Team',
      })),
    [sortedParticipants]
  )

  const comments = useMemo(() => {
    if (!convexEnabled || !convexRows) {
      return []
    }

    return convexRows
      .map((row) => {
        const createdAt = typeof row?.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null
        const updatedAt = typeof row?.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null
        const deletedAt = typeof row?.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null
        const isDeleted = Boolean(row?.deleted || deletedAt)

        return {
          id: String(row?.legacyId ?? ''),
          taskId,
          content: typeof row?.content === 'string' ? row.content : '',
          format: row?.format === 'plaintext' ? 'plaintext' : 'markdown',
          authorId: typeof row?.authorId === 'string' ? row.authorId : null,
          authorName:
            typeof row?.authorName === 'string' && row.authorName.trim().length > 0 ? row.authorName : 'Teammate',
          authorRole: typeof row?.authorRole === 'string' ? row.authorRole : null,
          createdAt,
          updatedAt,
          isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
          isDeleted,
          deletedAt,
          deletedBy: typeof row?.deletedBy === 'string' ? row.deletedBy : null,
          attachments: Array.isArray(row?.attachments) ? row.attachments : undefined,
          mentions: Array.isArray(row?.mentions) ? row.mentions : undefined,
          parentCommentId: typeof row?.parentCommentId === 'string' ? row.parentCommentId : null,
          threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
        } as TaskComment
      })
      .filter((comment) => comment.id && !comment.isDeleted)
  }, [convexEnabled, convexRows, taskId])

  const loading = convexEnabled && convexRows === undefined

  useEffect(() => {
    onCommentCountChange?.(comments.length)
  }, [comments.length, onCommentCountChange])

  const activeReplyTo = useMemo(() => {
    if (!replyTo) return null
    return comments.some((comment) => comment.id === replyTo.id) ? replyTo : null
  }, [comments, replyTo])

  const activeEditingCommentId = useMemo(() => {
    if (!editingCommentId) return null
    return comments.some((comment) => comment.id === editingCommentId) ? editingCommentId : null
  }, [comments, editingCommentId])

  const resetComposer = useCallback(() => {
    setComposerValue('')
    setReplyTo(null)
    setEditingCommentId(null)
    setPendingAttachments([])
  }, [])

  const handleAddAttachments = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const next = buildPendingAttachments(files)
    setPendingAttachments((prev) => [...prev, ...next].slice(0, 10))
  }, [])

  const handleRemovePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
  }, [])

  const handleAttachClick = useCallback(() => {
    if (activeEditingCommentId) return
    fileInputRef.current?.click()
  }, [activeEditingCommentId])

  const handleStartReply = useCallback((comment: TaskComment) => {
    setReplyTo(comment)
    setEditingCommentId(null)
    setComposerValue('')
    setPendingAttachments([])
  }, [])

  const handleStartEdit = useCallback((comment: TaskComment) => {
    setEditingCommentId(comment.id)
    setReplyTo(null)
    setComposerValue(comment.content)
    setPendingAttachments([])
  }, [])

  const handleSubmit = useCallback(() => {
    const content = composerValue.trim()
    if (!content || !workspaceId) return

    if (activeEditingCommentId) {
      setSavingEdit(true)
      void updateComment({
        workspaceId: String(workspaceId),
        taskLegacyId: String(taskId),
        legacyId: activeEditingCommentId,
        content,
        updatedBy: '',
      })
        .then(() => {
          toast({ title: 'Comment updated' })
          resetComposer()
        })
        .catch((error) => {
          logError(error, 'TaskCommentsPanel:handleSaveEdit')
          toast({
            title: 'Failed to update comment',
            description: asErrorMessage(error),
            variant: 'destructive',
          })
        })
        .finally(() => {
          setSavingEdit(false)
        })
      return
    }

    if (!userId) return

    setSending(true)
    setUploading(true)

    void Promise.resolve()
      .then(async () => {
        const uploadedAttachments: NonNullable<TaskComment['attachments']> = []

        if (pendingAttachments.length > 0) {
          const uploads = await Promise.all(
            pendingAttachments.map((attachment) =>
              uploadTaskCommentAttachment({
                userId,
                taskId,
                file: attachment.file,
                generateUploadUrl,
                getPublicUrl,
              })
            )
          )
          uploadedAttachments.push(...uploads)
        }

        const extracted = extractMentionsFromContent(content)
        const mentionMetadata = extracted.map((mention) => {
          const participant = sortedParticipants.find(
            (member) => member.name.trim().toLowerCase() === mention.name.trim().toLowerCase()
          )
          return { slug: mention.slug, name: participant?.name ?? mention.name, role: participant?.role ?? null }
        })

        const legacyId = `task-comment-${Date.now()}-${Math.random().toString(16).slice(2)}`

        return createComment({
          workspaceId: String(workspaceId),
          taskLegacyId: String(taskId),
          legacyId,
          content,
          format: 'markdown',
          authorId: null,
          authorName: userName,
          authorRole: userRole,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
          mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
          parentCommentId: activeReplyTo?.id ?? undefined,
          threadRootId: activeReplyTo?.threadRootId ?? activeReplyTo?.id ?? undefined,
        })
      })
      .then(() => {
        resetComposer()
      })
      .catch((error) => {
        logError(error, 'TaskCommentsPanel:handleSend')
        toast({
          title: 'Failed to post comment',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setUploading(false)
        setSending(false)
      })
  }, [
    composerValue,
    createComment,
    activeEditingCommentId,
    generateUploadUrl,
    getPublicUrl,
    pendingAttachments,
    activeReplyTo,
    resetComposer,
    sortedParticipants,
    taskId,
    toast,
    updateComment,
    userId,
    userName,
    userRole,
    workspaceId,
  ])

  const handleConfirmDelete = useCallback(() => {
    if (!workspaceId || !deleteTarget) return

    setDeletingCommentId(deleteTarget.id)
    void deleteComment({
      workspaceId: String(workspaceId),
      taskLegacyId: String(taskId),
      legacyId: deleteTarget.id,
      deletedBy: '',
    })
      .then(() => {
        toast({ title: 'Comment deleted' })
        if (editingCommentId === deleteTarget.id) {
          resetComposer()
        }
        if (replyTo?.id === deleteTarget.id) {
          setReplyTo(null)
        }
        setDeleteTarget(null)
      })
      .catch((error) => {
        logError(error, 'TaskCommentsPanel:handleDeleteComment')
        toast({
          title: 'Failed to delete comment',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setDeletingCommentId(null)
      })
  }, [deleteComment, deleteTarget, editingCommentId, replyTo?.id, resetComposer, taskId, toast, workspaceId])

  const threaded = useMemo(() => {
    const roots: TaskComment[] = []
    const repliesByParent = new Map<string, TaskComment[]>()

    for (const comment of comments) {
      const parentId = comment.parentCommentId
      if (!parentId) {
        roots.push(comment)
        continue
      }

      const bucket = repliesByParent.get(parentId) ?? []
      bucket.push(comment)
      repliesByParent.set(parentId, bucket)
    }

    return {
      roots,
      repliesByParent,
      replyCount: Math.max(0, comments.length - roots.length),
    }
  }, [comments])

  const isSubmitting = sending || uploading || savingEdit
  const draftMode = activeEditingCommentId ? 'edit' : activeReplyTo ? 'reply' : 'new'
  const composerTitle =
    draftMode === 'edit'
      ? 'Editing comment'
      : draftMode === 'reply'
        ? `Replying to ${activeReplyTo?.authorName ?? 'thread'}`
        : 'New comment'
  const composerDescription =
    draftMode === 'edit'
      ? 'Update the message below. Attachments remain unchanged.'
      : draftMode === 'reply'
        ? getPreviewText(activeReplyTo?.content)
        : 'Share context, decisions, or quick next steps.'
  const composerPlaceholder =
    draftMode === 'edit'
      ? 'Refine your comment...'
      : draftMode === 'reply'
        ? `Reply to ${activeReplyTo?.authorName ?? 'thread'}...`
        : 'Write a comment...'

  const canManageComment = useCallback(
    (comment: TaskComment) => {
      if (userRole === 'admin') return true
      if (!userName) return false
      return comment.authorName.trim().toLowerCase() === userName.trim().toLowerCase()
    },
    [userName, userRole]
  )

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-sm">
        <TaskCommentsSummaryHeader
          commentsCount={comments.length}
          replyCount={threaded.replyCount}
          replyTo={activeReplyTo}
          editingCommentId={activeEditingCommentId}
        />

        <CardContent className="space-y-5 p-5">
          <TaskCommentsThreadList
            loading={loading}
            roots={threaded.roots}
            repliesByParent={threaded.repliesByParent}
            replyToId={activeReplyTo?.id ?? null}
            editingCommentId={activeEditingCommentId}
            deletingCommentId={deletingCommentId}
            canManageComment={canManageComment}
            onStartReply={handleStartReply}
            onStartEdit={handleStartEdit}
            onRequestDelete={setDeleteTarget}
          />

          <Separator />

          <TaskCommentsComposerSection
            fileInputRef={fileInputRef}
            replyTo={activeReplyTo}
            editingCommentId={activeEditingCommentId}
            composerTitle={composerTitle}
            composerDescription={composerDescription}
            composerPlaceholder={composerPlaceholder}
            pendingAttachments={pendingAttachments}
            uploading={uploading}
            isSubmitting={isSubmitting}
            composerValue={composerValue}
            composerParticipants={composerParticipants}
            onReset={resetComposer}
            onAddAttachments={handleAddAttachments}
            onRemovePendingAttachment={handleRemovePendingAttachment}
            onAttachClick={handleAttachClick}
            onComposerChange={setComposerValue}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <TaskCommentsDeleteDialog
        deleteTarget={deleteTarget}
        deletingCommentId={deletingCommentId}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
