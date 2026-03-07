'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, MoreHorizontal, Paperclip, Pencil, Reply, Send, Trash2, X } from 'lucide-react'
import { useConvex, useMutation, useQuery } from 'convex/react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { MessageAttachments } from '@/app/dashboard/collaboration/components/message-attachments'
import { PendingAttachmentsList } from '@/app/dashboard/collaboration/components/message-composer'
import { MessageContent } from '@/app/dashboard/collaboration/components/message-content'
import { RichComposer } from '@/app/dashboard/collaboration/components/rich-composer'
import { filesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { isConvexRealtimeEnabled } from '@/lib/convex-realtime'
import { extractMentionsFromContent } from '@/lib/mentions'
import { cn } from '@/lib/utils'
import { uploadTaskCommentAttachment } from '@/services/task-comment-attachments'
import type { TaskComment } from '@/types/task-comments'
import { api as generatedApi } from '../../../convex/_generated/api'
import type { TaskParticipant } from './task-types'

type PendingAttachment = {
  id: string
  file: File
  name: string
  mimeType: string
  sizeLabel: string
}

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

function buildPendingAttachments(files: FileList): PendingAttachment[] {
  const now = Date.now()
  return Array.from(files).map((file, index) => ({
    id: `${now}-${index}-${file.name}`,
    file,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: formatBytes(file.size),
  }))
}

function getInitials(name: string | null | undefined): string {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'TC'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getPreviewText(content: string | null | undefined): string {
  const normalized = String(content ?? '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= 72) return normalized
  return `${normalized.slice(0, 69)}...`
}

function formatCommentTimestamp(comment: TaskComment): string {
  const source = comment.updatedAt ?? comment.createdAt
  if (!source) return ''
  const label = new Date(source).toLocaleString()
  return comment.isEdited ? `${label} • edited` : label
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

  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [composerValue, setComposerValue] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<TaskComment | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
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

  const refresh = useCallback(async () => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!convexEnabled) return

    const frame = requestAnimationFrame(() => {
      if (!convexRows) {
        setLoading(true)
        return
      }

      const next = convexRows
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

      setComments(next)
      setLoading(false)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [convexEnabled, convexRows, taskId])

  useEffect(() => {
    if (convexEnabled) return

    const frame = requestAnimationFrame(() => {
      void refresh()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [convexEnabled, refresh])

  useEffect(() => {
    onCommentCountChange?.(comments.length)
  }, [comments.length, onCommentCountChange])

  useEffect(() => {
    if (replyTo && !comments.some((comment) => comment.id === replyTo.id)) {
      setReplyTo(null)
    }
    if (editingCommentId && !comments.some((comment) => comment.id === editingCommentId)) {
      setEditingCommentId(null)
      setComposerValue('')
    }
  }, [comments, editingCommentId, replyTo])

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
    if (editingCommentId) return
    fileInputRef.current?.click()
  }, [editingCommentId])

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

    if (editingCommentId) {
      setSavingEdit(true)
      void updateComment({
        workspaceId: String(workspaceId),
        taskLegacyId: String(taskId),
        legacyId: editingCommentId,
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
          parentCommentId: replyTo?.id ?? undefined,
          threadRootId: replyTo?.threadRootId ?? replyTo?.id ?? undefined,
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
    editingCommentId,
    generateUploadUrl,
    getPublicUrl,
    pendingAttachments,
    replyTo,
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
  const draftMode = editingCommentId ? 'edit' : replyTo ? 'reply' : 'new'
  const composerTitle =
    draftMode === 'edit'
      ? 'Editing comment'
      : draftMode === 'reply'
        ? `Replying to ${replyTo?.authorName ?? 'thread'}`
        : 'New comment'
  const composerDescription =
    draftMode === 'edit'
      ? 'Update the message below. Attachments remain unchanged.'
      : draftMode === 'reply'
        ? getPreviewText(replyTo?.content)
        : 'Share context, decisions, or quick next steps.'
  const composerPlaceholder =
    draftMode === 'edit'
      ? 'Refine your comment...'
      : draftMode === 'reply'
        ? `Reply to ${replyTo?.authorName ?? 'thread'}...`
        : 'Write a comment...'

  const canManageComment = useCallback(
    (comment: TaskComment) => {
      if (userRole === 'admin') return true
      if (!userName) return false
      return comment.authorName.trim().toLowerCase() === userName.trim().toLowerCase()
    },
    [userName, userRole]
  )

  function renderComment(comment: TaskComment, depth = 0) {
    const replies = threaded.repliesByParent.get(comment.id) ?? []
    const isActiveReply = replyTo?.id === comment.id
    const isActiveEdit = editingCommentId === comment.id
    const isBusy = deletingCommentId === comment.id

    return (
      <div key={comment.id} className="space-y-3">
        <div
          className={cn(
            'rounded-3xl border px-4 py-4 shadow-sm transition-colors',
            depth === 0 ? 'bg-white/95' : 'bg-slate-50/90',
            isActiveReply && 'border-sky-300 bg-sky-50/80 shadow-sky-100',
            isActiveEdit && 'border-amber-300 bg-amber-50/80 shadow-amber-100'
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="mt-0.5 h-10 w-10 border border-slate-200 bg-white shadow-sm">
              <AvatarFallback className="bg-slate-100 text-[11px] font-semibold text-slate-700">
                {getInitials(comment.authorName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{comment.authorName}</span>
                    {comment.authorRole ? (
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {comment.authorRole}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatCommentTimestamp(comment)}</p>
                </div>

                <div className="flex items-center gap-1">
                  {depth === 0 && replies.length > 0 ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
                    </span>
                  ) : null}

                  {canManageComment(comment) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl">
                        <DropdownMenuItem onSelect={() => handleStartReply(comment)}>
                          <Reply className="h-4 w-4" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStartEdit(comment)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleteTarget(comment)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-slate-600" onClick={() => handleStartReply(comment)}>
                      <Reply className="mr-1.5 h-3.5 w-3.5" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <MessageContent content={comment.content} mentions={comment.mentions} />
                {comment.attachments && comment.attachments.length > 0 ? (
                  <MessageAttachments attachments={comment.attachments} />
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={() => handleStartReply(comment)}>
                  <Reply className="mr-1.5 h-3.5 w-3.5" />
                  Reply
                </Button>
                {isBusy ? (
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Updating thread...
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {replies.length > 0 ? (
          <div className={cn('space-y-3 border-l border-dashed border-slate-300 pl-4 md:pl-6', depth === 0 && 'ml-5')}>
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-200/80 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-950">Conversation</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {comments.length} comment{comments.length === 1 ? '' : 's'}
                {threaded.replyCount > 0 ? ` • ${threaded.replyCount} repl${threaded.replyCount === 1 ? 'y' : 'ies'}` : ''}
              </p>
            </div>
            {replyTo ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                Thread reply
              </span>
            ) : editingCommentId ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                Editing
              </span>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
                Loading comments...
              </div>
            ) : threaded.roots.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
                No comments yet. Use this thread for decisions, context, and quick handoffs.
              </div>
            ) : (
              threaded.roots.map((comment) => renderComment(comment))
            )}
          </div>

          <Separator />

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner shadow-slate-100/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{composerTitle}</p>
                <p className="mt-1 text-sm text-slate-500">{composerDescription}</p>
              </div>
              {(replyTo || editingCommentId) ? (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500" onClick={resetComposer}>
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                handleAddAttachments(event.target.files)
                event.currentTarget.value = ''
              }}
            />

            {pendingAttachments.length > 0 && !editingCommentId ? (
              <div className="mt-4">
                <PendingAttachmentsList
                  attachments={pendingAttachments}
                  uploading={uploading}
                  onRemove={handleRemovePendingAttachment}
                />
              </div>
            ) : null}

            <div className="mt-4 flex items-start gap-3">
              <div className="flex-1">
                <RichComposer
                  value={composerValue}
                  onChange={setComposerValue}
                  onSend={handleSubmit}
                  disabled={isSubmitting}
                  placeholder={composerPlaceholder}
                  participants={composerParticipants}
                  onAttachClick={editingCommentId ? undefined : handleAttachClick}
                  hasAttachments={!editingCommentId && pendingAttachments.length > 0}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAttachClick}
                  disabled={isSubmitting || Boolean(editingCommentId)}
                  title={editingCommentId ? 'Attachments cannot be changed while editing' : 'Attach files'}
                  className="h-10 w-10 rounded-2xl border-slate-200 bg-white"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSubmit}
                  disabled={isSubmitting || composerValue.trim().length === 0}
                  title={editingCommentId ? 'Save comment' : 'Send comment'}
                  className="h-10 w-10 rounded-2xl"
                >
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => {
        if (!open) setDeleteTarget(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the comment from the task conversation. Replies stay in the thread only if they still have a visible parent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingCommentId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={Boolean(deletingCommentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingCommentId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
