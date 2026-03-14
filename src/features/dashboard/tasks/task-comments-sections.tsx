'use client'

import type { RefObject } from 'react'
import { LoaderCircle, MoreHorizontal, Paperclip, Pencil, Reply, Send, Trash2, X } from 'lucide-react'

import { MessageAttachments } from '@/features/dashboard/collaboration/components/message-attachments'
import { PendingAttachmentsList } from '@/features/dashboard/collaboration/components/message-composer'
import { MessageContent } from '@/features/dashboard/collaboration/components/message-content'
import { RichComposer } from '@/features/dashboard/collaboration/components/rich-composer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { CardHeader, CardTitle } from '@/shared/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TaskComment } from '@/types/task-comments'

export type TaskCommentComposerAttachment = {
  id: string
  file: File
  name: string
  mimeType: string
  sizeLabel: string
}

function getInitials(name: string | null | undefined): string {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'TC'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function formatCommentTimestamp(comment: TaskComment): string {
  const source = comment.updatedAt ?? comment.createdAt
  if (!source) return ''
  const label = new Date(source).toLocaleString()
  return comment.isEdited ? `${label} • edited` : label
}

function TaskCommentThreadItem({
  comment,
  depth = 0,
  repliesByParent,
  replyToId,
  editingCommentId,
  deletingCommentId,
  canManageComment,
  onStartReply,
  onStartEdit,
  onRequestDelete,
}: {
  comment: TaskComment
  depth?: number
  repliesByParent: Map<string, TaskComment[]>
  replyToId: string | null
  editingCommentId: string | null
  deletingCommentId: string | null
  canManageComment: (comment: TaskComment) => boolean
  onStartReply: (comment: TaskComment) => void
  onStartEdit: (comment: TaskComment) => void
  onRequestDelete: (comment: TaskComment) => void
}) {
  const replies = repliesByParent.get(comment.id) ?? []
  const isActiveReply = replyToId === comment.id
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500" aria-label="Comment actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                      <DropdownMenuItem onSelect={() => onStartReply(comment)}>
                        <Reply className="h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onStartEdit(comment)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onRequestDelete(comment)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-slate-600" onClick={() => onStartReply(comment)}>
                    <Reply className="mr-1.5 h-3.5 w-3.5" />
                    Reply
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <MessageContent content={comment.content} mentions={comment.mentions} />
              {comment.attachments && comment.attachments.length > 0 ? <MessageAttachments attachments={comment.attachments} /> : null}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={() => onStartReply(comment)}>
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
          {replies.map((reply) => (
            <TaskCommentThreadItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              repliesByParent={repliesByParent}
              replyToId={replyToId}
              editingCommentId={editingCommentId}
              deletingCommentId={deletingCommentId}
              canManageComment={canManageComment}
              onStartReply={onStartReply}
              onStartEdit={onStartEdit}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function TaskCommentsSummaryHeader({
  commentsCount,
  replyCount,
  replyTo,
  editingCommentId,
}: {
  commentsCount: number
  replyCount: number
  replyTo: TaskComment | null
  editingCommentId: string | null
}) {
  return (
    <CardHeader className="border-b border-slate-200/80 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base text-slate-950">Conversation</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            {commentsCount} comment{commentsCount === 1 ? '' : 's'}
            {replyCount > 0 ? ` • ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}` : ''}
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
  )
}

export function TaskCommentsThreadList({
  loading,
  roots,
  repliesByParent,
  replyToId,
  editingCommentId,
  deletingCommentId,
  canManageComment,
  onStartReply,
  onStartEdit,
  onRequestDelete,
}: {
  loading: boolean
  roots: TaskComment[]
  repliesByParent: Map<string, TaskComment[]>
  replyToId: string | null
  editingCommentId: string | null
  deletingCommentId: string | null
  canManageComment: (comment: TaskComment) => boolean
  onStartReply: (comment: TaskComment) => void
  onStartEdit: (comment: TaskComment) => void
  onRequestDelete: (comment: TaskComment) => void
}) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
          Loading comments...
        </div>
      ) : roots.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
          No comments yet. Use this thread for decisions, context, and quick handoffs.
        </div>
      ) : (
        roots.map((comment) => (
          <TaskCommentThreadItem
            key={comment.id}
            comment={comment}
            repliesByParent={repliesByParent}
            replyToId={replyToId}
            editingCommentId={editingCommentId}
            deletingCommentId={deletingCommentId}
            canManageComment={canManageComment}
            onStartReply={onStartReply}
            onStartEdit={onStartEdit}
            onRequestDelete={onRequestDelete}
          />
        ))
      )}
    </div>
  )
}

export function TaskCommentsComposerSection({
  fileInputRef,
  replyTo,
  editingCommentId,
  composerTitle,
  composerDescription,
  composerPlaceholder,
  pendingAttachments,
  uploading,
  isSubmitting,
  composerValue,
  composerParticipants,
  onReset,
  onAddAttachments,
  onRemovePendingAttachment,
  onAttachClick,
  onComposerChange,
  onSubmit,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>
  replyTo: TaskComment | null
  editingCommentId: string | null
  composerTitle: string
  composerDescription: string
  composerPlaceholder: string
  pendingAttachments: TaskCommentComposerAttachment[]
  uploading: boolean
  isSubmitting: boolean
  composerValue: string
  composerParticipants: Array<{ name: string; role: string }>
  onReset: () => void
  onAddAttachments: (files: FileList | null) => void
  onRemovePendingAttachment: (attachmentId: string) => void
  onAttachClick: () => void
  onComposerChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner shadow-slate-100/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{composerTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{composerDescription}</p>
        </div>
        {replyTo || editingCommentId ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500" onClick={onReset} aria-label="Reset composer">
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
          onAddAttachments(event.target.files)
          event.currentTarget.value = ''
        }}
      />

      {pendingAttachments.length > 0 && !editingCommentId ? (
        <div className="mt-4">
          <PendingAttachmentsList
            attachments={pendingAttachments}
            uploading={uploading}
            onRemove={onRemovePendingAttachment}
          />
        </div>
      ) : null}

      <div className="mt-4 flex items-start gap-3">
        <div className="flex-1">
          <RichComposer
            value={composerValue}
            onChange={onComposerChange}
            onSend={onSubmit}
            disabled={isSubmitting}
            placeholder={composerPlaceholder}
            participants={composerParticipants}
            onAttachClick={editingCommentId ? undefined : onAttachClick}
            hasAttachments={!editingCommentId && pendingAttachments.length > 0}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAttachClick}
            disabled={isSubmitting || Boolean(editingCommentId)}
            title={editingCommentId ? 'Attachments cannot be changed while editing' : 'Attach files'}
            className="h-10 w-10 rounded-2xl border-slate-200 bg-white"
            aria-label={editingCommentId ? 'Attachments cannot be changed while editing' : 'Attach files'}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={onSubmit}
            disabled={isSubmitting || composerValue.trim().length === 0}
            title={editingCommentId ? 'Save comment' : 'Send comment'}
            className="h-10 w-10 rounded-2xl"
            aria-label={editingCommentId ? 'Save comment' : 'Send comment'}
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function TaskCommentsDeleteDialog({
  deleteTarget,
  deletingCommentId,
  onClose,
  onConfirm,
}: {
  deleteTarget: TaskComment | null
  deletingCommentId: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => {
      if (!open) onClose()
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
            onClick={onConfirm}
            disabled={Boolean(deletingCommentId)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletingCommentId ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
