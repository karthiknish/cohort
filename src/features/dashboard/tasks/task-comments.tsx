'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
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

type TaskCommentsPanelState = {
  composerValue: string
  sending: boolean
  uploading: boolean
  replyTo: TaskComment | null
  editingCommentId: string | null
  savingEdit: boolean
  pendingAttachments: TaskCommentComposerAttachment[]
  deleteTarget: TaskComment | null
  deletingCommentId: string | null
}

type TaskCommentsPanelAction =
  | { type: 'setComposerValue'; composerValue: string }
  | { type: 'setSending'; sending: boolean }
  | { type: 'setUploading'; uploading: boolean }
  | { type: 'setReplyTo'; replyTo: TaskComment | null }
  | { type: 'setEditingCommentId'; editingCommentId: string | null }
  | { type: 'setSavingEdit'; savingEdit: boolean }
  | { type: 'setPendingAttachments'; pendingAttachments: TaskCommentComposerAttachment[] }
  | { type: 'setDeleteTarget'; deleteTarget: TaskComment | null }
  | { type: 'setDeletingCommentId'; deletingCommentId: string | null }
  | { type: 'resetComposer' }
  | { type: 'startReply'; comment: TaskComment }
  | { type: 'startEdit'; comment: TaskComment }
  | { type: 'startSending' }

const INITIAL_TASK_COMMENTS_PANEL_STATE: TaskCommentsPanelState = {
  composerValue: '',
  sending: false,
  uploading: false,
  replyTo: null,
  editingCommentId: null,
  savingEdit: false,
  pendingAttachments: [],
  deleteTarget: null,
  deletingCommentId: null,
}

function taskCommentsPanelReducer(
  state: TaskCommentsPanelState,
  action: TaskCommentsPanelAction,
): TaskCommentsPanelState {
  switch (action.type) {
    case 'setComposerValue':
      return { ...state, composerValue: action.composerValue }
    case 'setSending':
      return { ...state, sending: action.sending }
    case 'setUploading':
      return { ...state, uploading: action.uploading }
    case 'setReplyTo':
      return { ...state, replyTo: action.replyTo }
    case 'setEditingCommentId':
      return { ...state, editingCommentId: action.editingCommentId }
    case 'setSavingEdit':
      return { ...state, savingEdit: action.savingEdit }
    case 'setPendingAttachments':
      return { ...state, pendingAttachments: action.pendingAttachments }
    case 'setDeleteTarget':
      return { ...state, deleteTarget: action.deleteTarget }
    case 'setDeletingCommentId':
      return { ...state, deletingCommentId: action.deletingCommentId }
    case 'resetComposer':
      return {
        ...state,
        composerValue: '',
        replyTo: null,
        editingCommentId: null,
        pendingAttachments: [],
      }
    case 'startReply':
      return {
        ...state,
        replyTo: action.comment,
        editingCommentId: null,
        composerValue: '',
        pendingAttachments: [],
      }
    case 'startEdit':
      return {
        ...state,
        editingCommentId: action.comment.id,
        replyTo: null,
        composerValue: action.comment.content,
        pendingAttachments: [],
      }
    case 'startSending':
      return {
        ...state,
        sending: true,
        uploading: true,
      }
    default:
      return state
  }
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
  const generateUploadUrlMutation = useMutation(filesApi.generateUploadUrl)
  const generateUploadUrl = useCallback(
    () => generateUploadUrlMutation({}),
    [generateUploadUrlMutation]
  )
  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex]
  )

  const [state, dispatch] = useReducer(taskCommentsPanelReducer, INITIAL_TASK_COMMENTS_PANEL_STATE)
  const {
    composerValue,
    sending,
    uploading,
    replyTo,
    editingCommentId,
    savingEdit,
    pendingAttachments,
    deleteTarget,
    deletingCommentId,
  } = state

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
    dispatch({ type: 'resetComposer' })
  }, [])

  const handleAddAttachments = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const next = buildPendingAttachments(files)
    dispatch({
      type: 'setPendingAttachments',
      pendingAttachments: [...pendingAttachments, ...next].slice(0, 10),
    })
  }, [pendingAttachments])

  const handleRemovePendingAttachment = useCallback((attachmentId: string) => {
    dispatch({
      type: 'setPendingAttachments',
      pendingAttachments: pendingAttachments.filter((item) => item.id !== attachmentId),
    })
  }, [pendingAttachments])

  const handleAttachClick = useCallback(() => {
    if (activeEditingCommentId) return
    fileInputRef.current?.click()
  }, [activeEditingCommentId])

  const handleStartReply = useCallback((comment: TaskComment) => {
    dispatch({ type: 'startReply', comment })
  }, [])

  const handleStartEdit = useCallback((comment: TaskComment) => {
    dispatch({ type: 'startEdit', comment })
  }, [])

  const handleSubmit = useCallback(() => {
    const content = composerValue.trim()
    if (!content || !workspaceId) return

    if (activeEditingCommentId) {
      dispatch({ type: 'setSavingEdit', savingEdit: true })
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
          dispatch({ type: 'setSavingEdit', savingEdit: false })
        })
      return
    }

    if (!userId) return

    dispatch({ type: 'startSending' })

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
        dispatch({ type: 'setUploading', uploading: false })
        dispatch({ type: 'setSending', sending: false })
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

    dispatch({ type: 'setDeletingCommentId', deletingCommentId: deleteTarget.id })
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
          dispatch({ type: 'setReplyTo', replyTo: null })
        }
        dispatch({ type: 'setDeleteTarget', deleteTarget: null })
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
        dispatch({ type: 'setDeletingCommentId', deletingCommentId: null })
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

  const handleCloseDeleteDialog = useCallback(() => {
    dispatch({ type: 'setDeleteTarget', deleteTarget: null })
  }, [])

  const handleComposerChange = useCallback((value: string) => {
    dispatch({ type: 'setComposerValue', composerValue: value })
  }, [])

  const handleRequestDelete = useCallback((comment: TaskComment) => {
    dispatch({ type: 'setDeleteTarget', deleteTarget: comment })
  }, [])

  return (
    <>
      <Card className="overflow-hidden border-border/60 bg-background/95 shadow-sm">
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
            onRequestDelete={handleRequestDelete}
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
            onComposerChange={handleComposerChange}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <TaskCommentsDeleteDialog
        deleteTarget={deleteTarget}
        deletingCommentId={deletingCommentId}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
