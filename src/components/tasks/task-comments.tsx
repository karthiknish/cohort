'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'

import { apiFetch } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
    setLoading(true)
    try {
      const payload = await apiFetch<{ comments: TaskComment[] }>(`/api/tasks/${taskId}/comments?limit=200`)
      setComments(payload.comments ?? [])
    } catch (error) {
      toast({
        title: 'Failed to load comments',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [taskId, toast])

  useEffect(() => {
    if (!workspaceId) {
      void refresh()
      return
    }

    setLoading(true)

    const q = query(
      collection(db, 'workspaces', workspaceId, 'tasks', taskId, 'comments'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((doc) => {
            const data = doc.data() as any
            const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data?.createdAt ?? null)
            const updatedAt = data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data?.updatedAt ?? null)
            const deletedAt = typeof data?.deletedAt === 'string' ? data.deletedAt : null
            const isDeleted = Boolean(data?.deleted || deletedAt)

            return {
              id: doc.id,
              taskId,
              content: typeof data?.content === 'string' ? data.content : '',
              format: data?.format === 'plaintext' ? 'plaintext' : 'markdown',
              authorId: typeof data?.authorId === 'string' ? data.authorId : null,
              authorName: typeof data?.authorName === 'string' && data.authorName.trim().length > 0 ? data.authorName : 'Teammate',
              authorRole: typeof data?.authorRole === 'string' ? data.authorRole : null,
              createdAt: typeof createdAt === 'string' ? createdAt : null,
              updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
              isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
              isDeleted,
              deletedAt,
              deletedBy: typeof data?.deletedBy === 'string' ? data.deletedBy : null,
              attachments: Array.isArray(data?.attachments) ? data.attachments : undefined,
              mentions: Array.isArray(data?.mentions) ? data.mentions : undefined,
              parentCommentId: typeof data?.parentCommentId === 'string' ? data.parentCommentId : null,
              threadRootId: typeof data?.threadRootId === 'string' ? data.threadRootId : null,
            } as TaskComment
          })
          .filter((comment) => !comment.isDeleted)

        setComments(next)
        setLoading(false)
      },
      (error) => {
        console.error('[task-comments] realtime subscription failed', error)
        setLoading(false)
        void refresh()
      }
    )

    return () => unsubscribe()
  }, [refresh, taskId, workspaceId])

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
    if (!userId) {
      toast({ title: 'Sign in required', description: 'You must be signed in to comment.', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      setUploading(true)
      const uploadedAttachments: NonNullable<TaskComment['attachments']> = []

      if (pendingAttachments.length > 0) {
        const uploads = await Promise.all(
          pendingAttachments.map((attachment) =>
            uploadTaskCommentAttachment({ userId, taskId, file: attachment.file })
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

      const created = await apiFetch<TaskComment>(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          format: 'markdown',
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
          mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
          parentCommentId: replyTo?.id ?? undefined,
        }),
      })

      setComments((prev) => [...prev, created])
      setComposerValue('')
      setReplyTo(null)
      setPendingAttachments([])
    } catch (error) {
      toast({
        title: 'Failed to post comment',
        description: error instanceof Error ? error.message : 'Unexpected error',
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
