'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { api, filesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { isConvexRealtimeEnabled } from '@/lib/convex-realtime'


import type { ClientTeamMember } from '@/types/clients'
import type { TaskComment } from '@/types/task-comments'

import { MessageContent } from '@/app/dashboard/collaboration/components/message-content'
import { MessageAttachments } from '@/app/dashboard/collaboration/components/message-attachments'
import { PendingAttachmentsList } from '@/app/dashboard/collaboration/components/message-composer'
import { RichComposer } from '@/app/dashboard/collaboration/components/rich-composer'
import { extractMentionsFromContent } from '@/lib/mentions'

import { uploadTaskCommentAttachment } from '@/services/task-comment-attachments'

type PendingAttachment = {
  id: string
  file: File
  name: string
  mimeType: string
  sizeLabel: string
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

export function TaskCommentsPanel(props: {
  taskId: string
  workspaceId: string | null
  userId: string | null
  userName: string | null
  userRole: string | null
  participants: ClientTeamMember[]
}) {
  const { taskId, workspaceId, userId, userName, userRole, participants } = props
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const convexEnabled = isConvexRealtimeEnabled() && Boolean(workspaceId)
  const convexRows = useQuery(
    (api as any).taskComments.listForTask,
    convexEnabled
      ? {
          workspaceId: String(workspaceId),
          taskLegacyId: String(taskId),
          limit: 200,
        }
      : 'skip'
  ) as Array<any> | undefined

  const createComment = useMutation((api as any).taskComments.create)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const getPublicUrl = useMutation(filesApi.getPublicUrl)

  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [composerValue, setComposerValue] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<TaskComment | null>(null)

  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploading, setUploading] = useState(false)

  const sortedParticipants = useMemo(() => {
    const map = new Map<string, ClientTeamMember>()
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

  const refresh = useCallback(async () => {
    // Convex-enabled flows update in real time; nothing to refresh.
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!convexEnabled) {
      return
    }

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
  }, [convexEnabled, convexRows, taskId])

  useEffect(() => {
    if (convexEnabled) {
      return
    }

    void refresh()
  }, [convexEnabled, refresh])

  const handleAddAttachments = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const next = buildPendingAttachments(files)
    setPendingAttachments((prev) => [...prev, ...next].slice(0, 10))
  }, [])

  const handleRemovePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
  }, [])

  const handleSend = useCallback(async () => {
    const content = composerValue.trim()
    if (!content) return
    if (!userId || !workspaceId) {
      return
    }

    setSending(true)
    try {
      setUploading(true)
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

      if (!workspaceId) {
        throw new Error('Workspace not available')
      }

      const legacyId = `task-comment-${Date.now()}-${Math.random().toString(16).slice(2)}`

      const res = await createComment({
        workspaceId: String(workspaceId),
        taskLegacyId: String(taskId),
        legacyId,
        content,
        format: 'markdown',
        authorId: userId,
        authorName: userName,
        authorRole: userRole,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
        parentCommentId: replyTo?.id ?? undefined,
        threadRootId: replyTo?.threadRootId ?? replyTo?.id ?? undefined,
      })

      // Convex query will update `comments` automatically.
      setComposerValue('')
      setReplyTo(null)
      setPendingAttachments([])
    } catch (error) {
      logError(error, 'TaskCommentsPanel:handleSend')
      toast({
        title: 'Failed to post comment',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setSending(false)
    }
  }, [composerValue, pendingAttachments, replyTo, sortedParticipants, taskId, toast, userId])

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const threaded = useMemo(() => {
    const roots: TaskComment[] = []
    const repliesByParent = new Map<string, TaskComment[]>()

    for (const comment of comments) {
      const parentId = comment.parentCommentId
      if (!parentId) {
        roots.push(comment)
      } else {
        const bucket = repliesByParent.get(parentId) ?? []
        bucket.push(comment)
        repliesByParent.set(parentId, bucket)
      }
    }

    return { roots, repliesByParent }
  }, [comments])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {replyTo ? (
          <div className="flex items-center justify-between rounded-md border border-muted bg-muted/20 px-3 py-2 text-xs">
            <div className="text-muted-foreground">
              Replying to <span className="font-medium text-foreground">{replyTo.authorName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading comments…</div>
          ) : threaded.roots.length === 0 ? (
            <div className="text-sm text-muted-foreground">No comments yet.</div>
          ) : (
            threaded.roots.map((comment) => {
              const replies = threaded.repliesByParent.get(comment.id) ?? []
              return (
                <div key={comment.id} className="space-y-2">
                  <div className="rounded-md border border-muted/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-foreground">
                        {comment.authorName}
                        {comment.authorRole ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">{comment.authorRole}</span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="mt-2">
                      <MessageContent content={comment.content} mentions={comment.mentions} />
                    </div>
                    {comment.attachments && comment.attachments.length > 0 ? (
                      <div className="mt-2">
                        <MessageAttachments attachments={comment.attachments} />
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment)}>
                        Reply
                      </Button>
                    </div>
                  </div>

                  {replies.length > 0 ? (
                    <div className="ml-4 space-y-2 border-l border-muted pl-3">
                      {replies.map((reply) => (
                        <div key={reply.id} className="rounded-md border border-muted/60 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-foreground">
                              {reply.authorName}
                              {reply.authorRole ? (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">{reply.authorRole}</span>
                              ) : null}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ''}
                            </div>
                          </div>
                          <div className="mt-2">
                            <MessageContent content={reply.content} mentions={reply.mentions} />
                          </div>
                          {reply.attachments && reply.attachments.length > 0 ? (
                            <div className="mt-2">
                              <MessageAttachments attachments={reply.attachments} />
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>

        <Separator />

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

        {pendingAttachments.length > 0 ? (
          <PendingAttachmentsList
            attachments={pendingAttachments as any}
            uploading={uploading}
            onRemove={handleRemovePendingAttachment}
          />
        ) : null}

        <div className="flex items-start gap-2">
          <div className="flex-1">
            <RichComposer
              value={composerValue}
              onChange={setComposerValue}
              onSend={handleSend}
              disabled={sending || uploading}
              placeholder="Write a comment…"
              participants={sortedParticipants}
              onAttachClick={handleAttachClick}
              hasAttachments={pendingAttachments.length > 0}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAttachClick}
              disabled={sending || uploading}
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={sending || uploading || composerValue.trim().length === 0}
              title="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
