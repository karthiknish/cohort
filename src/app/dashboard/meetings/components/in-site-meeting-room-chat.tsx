'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'

import { useConvex, useMutation } from 'convex/react'
import { type ReceivedChatMessage, useChat, useParticipants } from '@livekit/components-react'
import { Download, File, ImageIcon, LoaderCircle, MessageSquareText, Paperclip, Send, X } from 'lucide-react'

import { MAX_ATTACHMENTS } from '@/app/dashboard/collaboration/hooks/constants'
import type { PendingAttachment } from '@/app/dashboard/collaboration/hooks/types'
import { validateAttachments } from '@/app/dashboard/collaboration/hooks/utils'
import { AgentMentionText } from '@/components/agent-mode/mention-highlights'
import { useAuth } from '@/contexts/auth-context'
import { filesApi } from '@/lib/convex-api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

import {
  buildMeetingChatMessageContent,
  countUnreadMeetingChatMessages,
  DEFAULT_MEETING_CHAT_MENTION_STATE,
  detectMeetingChatMentionState,
  getMeetingChatAuthorLabel,
  getMeetingChatAvatarUrlFromMetadata,
  getMeetingChatInitials,
  getMeetingChatParticipantAvatarUrl,
  insertMeetingChatMention,
  parseMeetingChatMessageContent,
  type MeetingChatAttachment,
  type MeetingChatMentionState,
} from './in-site-meeting-room-chat.utils'

type InSiteMeetingRoomChatProps = {
  compact?: boolean
}

type MeetingChatMentionCandidate = {
  avatarUrl: string | null
  id: string
  identity: string
  isLocal: boolean
  label: string
}

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isImageAttachment(attachment: MeetingChatAttachment): boolean {
  return attachment.type.startsWith('image/')
}

function MeetingChatAttachmentCard({ attachment, isLocal }: { attachment: MeetingChatAttachment; isLocal: boolean }) {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-3 py-2 transition hover:border-white/30 hover:bg-white/10',
        isLocal ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-border/70 bg-black/5',
      )}
    >
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
        isLocal ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-foreground',
      )}
      >
        {isImageAttachment(attachment) ? <ImageIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isLocal ? 'text-primary-foreground' : 'text-foreground')}>
          {attachment.name}
        </p>
        <p className={cn('text-xs', isLocal ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
          {attachment.size}
        </p>
      </div>
      <Download className={cn('h-4 w-4 shrink-0', isLocal ? 'text-primary-foreground/80' : 'text-muted-foreground')} />
    </a>
  )
}

function MeetingChatMessage({
  mentionLabels,
  localAvatarUrl,
  message,
}: {
  mentionLabels: string[]
  localAvatarUrl?: string | null
  message: ReceivedChatMessage
}) {
  const authorLabel = getMeetingChatAuthorLabel(message)
  const isLocal = message.from?.isLocal ?? false
  const avatarUrl = getMeetingChatParticipantAvatarUrl(message) ?? (isLocal ? localAvatarUrl ?? null : null)
  const content = useMemo(() => parseMeetingChatMessageContent(message.message), [message.message])
  const showAvatarOnLeft = !isLocal

  return (
    <div className={cn('flex gap-3', isLocal && 'justify-end')}>
      {showAvatarOnLeft ? (
        <Avatar className="h-8 w-8 shrink-0 border border-border/80">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={authorLabel} /> : null}
          <AvatarFallback className="bg-muted text-[11px] font-semibold text-foreground">
            {getMeetingChatInitials(authorLabel)}
          </AvatarFallback>
        </Avatar>
      ) : null}
      <div className={cn('max-w-[88%] space-y-1', isLocal && 'items-end text-right')}>
        <div className={cn(
          'space-y-2 rounded-2xl border px-3 py-2 shadow-sm',
          isLocal
            ? 'border-primary/30 bg-primary text-primary-foreground'
            : 'border-border/80 bg-background/95 text-foreground',
        )}
        >
          <div className={cn(
            'mb-1 flex items-center gap-2 text-[11px] font-medium',
            isLocal ? 'justify-end text-primary-foreground/80' : 'text-muted-foreground',
          )}
          >
            <span>{authorLabel}</span>
            <span>·</span>
            <span>{formatMessageTime(message.timestamp)}</span>
          </div>
          {content.text ? (
            <AgentMentionText
              text={content.text}
              mentionLabels={mentionLabels}
              className={cn('whitespace-pre-wrap text-sm leading-6', isLocal ? 'text-primary-foreground' : 'text-foreground')}
              mentionClassName={cn(
                isLocal
                  ? 'bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/20'
                  : 'bg-primary/15 text-primary ring-primary/20',
              )}
            />
          ) : null}
          {content.attachments.length > 0 ? (
            <div className="space-y-2">
              {content.attachments.map((attachment) => (
                <MeetingChatAttachmentCard
                  key={`${attachment.url}-${attachment.name}`}
                  attachment={attachment}
                  isLocal={isLocal}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {isLocal ? (
        <Avatar className="h-8 w-8 shrink-0 border border-primary/25">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={authorLabel} /> : null}
          <AvatarFallback className="bg-primary/15 text-[11px] font-semibold text-primary">
            {getMeetingChatInitials(authorLabel)}
          </AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  )
}

export function InSiteMeetingRoomChat({ compact = false }: InSiteMeetingRoomChatProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const convex = useConvex()
  const { chatMessages, send, isSending } = useChat()
  const participants = useParticipants()
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [lastReadAt, setLastReadAt] = useState(0)
  const [highlightedMentionIndex, setHighlightedMentionIndex] = useState(0)
  const [mentionState, setMentionState] = useState<MeetingChatMentionState>(DEFAULT_MEETING_CHAT_MENTION_STATE)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const trimmedDraft = draft.trim()
  const canSend = trimmedDraft.length > 0 || pendingAttachments.length > 0
  const unreadCount = isOpen ? 0 : countUnreadMeetingChatMessages(chatMessages, lastReadAt)
  const attachmentAccept = useMemo(
    () => '.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip,.md',
    [],
  )
  const mentionCandidates = useMemo<MeetingChatMentionCandidate[]>(() => {
    const byLabel = new Map<string, MeetingChatMentionCandidate>()

    for (const participant of participants) {
      const label = participant.name?.trim() || participant.identity?.trim()
      if (!label) {
        continue
      }

      const key = label.toLowerCase()
      if (!byLabel.has(key)) {
        byLabel.set(key, {
          avatarUrl: getMeetingChatAvatarUrlFromMetadata(participant.metadata),
          id: participant.sid,
          identity: participant.identity,
          isLocal: participant.isLocal,
          label,
        })
      }
    }

    return Array.from(byLabel.values()).sort((left, right) => {
      if (left.isLocal !== right.isLocal) {
        return left.isLocal ? 1 : -1
      }
      return left.label.localeCompare(right.label)
    })
  }, [participants])
  const mentionLabels = useMemo(() => mentionCandidates.map((candidate) => candidate.label), [mentionCandidates])
  const mentionResults = useMemo(() => {
    if (!mentionState.active) {
      return []
    }

    const normalizedQuery = mentionState.query.trim().toLowerCase()
    if (!normalizedQuery) {
      return mentionCandidates.slice(0, 8)
    }

    return mentionCandidates
      .filter((candidate) => {
        const label = candidate.label.toLowerCase()
        const identity = candidate.identity.toLowerCase()
        return label.includes(normalizedQuery) || identity.includes(normalizedQuery)
      })
      .slice(0, 8)
  }, [mentionCandidates, mentionState.active, mentionState.query])

  const resetMentionState = useCallback(() => {
    setMentionState(DEFAULT_MEETING_CHAT_MENTION_STATE)
    setHighlightedMentionIndex(0)
  }, [])

  const syncMentionStateFromValue = useCallback((nextValue: string, caretPosition: number) => {
    const nextState = detectMeetingChatMentionState(nextValue, caretPosition)
    setMentionState(nextState)
    setHighlightedMentionIndex(0)
  }, [])

  useEffect(() => {
    if (!isOpen || chatMessages.length === 0) {
      return
    }

    const latestTimestamp = chatMessages[chatMessages.length - 1]?.timestamp ?? 0
    setLastReadAt((current) => Math.max(current, latestTimestamp))
    messageEndRef.current?.scrollIntoView({ block: 'end' })
  }, [chatMessages, isOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    const latestTimestamp = chatMessages[chatMessages.length - 1]?.timestamp ?? 0
    if (latestTimestamp > 0) {
      setLastReadAt(latestTimestamp)
    }
    resetMentionState()
  }, [chatMessages, resetMentionState])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    resetMentionState()
  }, [resetMentionState])

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId))
  }, [])

  const handleAttachmentSelection = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const result = validateAttachments(files, pendingAttachments.length, MAX_ATTACHMENTS)

    if (result.errors.length > 0) {
      toast({
        title: 'Some files couldn\'t be attached',
        description: result.errors.join('. '),
        variant: 'destructive',
      })
    }

    if (result.valid.length > 0) {
      setPendingAttachments((current) => [...current, ...result.valid])
    }

    event.target.value = ''
  }, [pendingAttachments.length, toast])

  const uploadPendingMeetingAttachments = useCallback(async (attachments: PendingAttachment[]): Promise<MeetingChatAttachment[]> => {
    if (!user?.id) {
      throw new Error('Sign in required to share files in meeting chat.')
    }

    const uploaded: MeetingChatAttachment[] = []

    for (const attachment of attachments) {
      const uploadUrlPayload = (await generateUploadUrl({})) as { url?: string }
      const uploadUrl = uploadUrlPayload?.url
      if (!uploadUrl) {
        throw new Error('Unable to create upload URL')
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': attachment.mimeType || 'application/octet-stream',
        },
        body: attachment.file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file (${uploadResponse.status})`)
      }

      const uploadResult = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
      if (!uploadResult?.storageId) {
        throw new Error('Upload did not return storageId')
      }

      const publicUrl = await convex.query(filesApi.getPublicUrl, { storageId: uploadResult.storageId }) as { url?: string | null }
      if (!publicUrl?.url) {
        throw new Error('Unable to resolve uploaded file URL')
      }

      uploaded.push({
        name: attachment.name,
        size: attachment.sizeLabel,
        type: attachment.mimeType || 'application/octet-stream',
        url: publicUrl.url,
      })
    }

    return uploaded
  }, [convex, generateUploadUrl, user?.id])

  const handleSend = useCallback(async () => {
    if (!canSend) {
      return
    }

    try {
      let messageContent = trimmedDraft

      if (pendingAttachments.length > 0) {
        setUploadingFiles(true)
        const uploadedAttachments = await uploadPendingMeetingAttachments(pendingAttachments)
        messageContent = buildMeetingChatMessageContent({
          attachments: uploadedAttachments,
          text: trimmedDraft,
        })
      }

      await send(messageContent)
      setDraft('')
      setPendingAttachments([])
      resetMentionState()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Message failed',
        description: error instanceof Error ? error.message : 'Unable to send the room chat message or file share.',
      })
    } finally {
      setUploadingFiles(false)
    }
  }, [canSend, pendingAttachments, resetMentionState, send, toast, trimmedDraft, uploadPendingMeetingAttachments])

  const insertSelectedMention = useCallback((candidate: MeetingChatMentionCandidate) => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    const caretPosition = textarea.selectionStart ?? draft.length
    const { nextCaret, nextValue } = insertMeetingChatMention({
      caretPosition,
      currentValue: draft,
      mentionLabel: candidate.label,
      mentionState,
    })

    setDraft(nextValue)
    resetMentionState()

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCaret, nextCaret)
    })
  }, [draft, mentionState, resetMentionState])

  const handleDraftChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value
    const caretPosition = event.target.selectionStart ?? nextValue.length
    setDraft(nextValue)
    syncMentionStateFromValue(nextValue, caretPosition)
  }, [syncMentionStateFromValue])

  const handleComposerBlur = useCallback(() => {
    resetMentionState()
  }, [resetMentionState])

  const handleMentionMouseDown = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }, [])

  const handleComposerKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState.active && mentionResults.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedMentionIndex((current) => (current + 1) % mentionResults.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedMentionIndex((current) => (current - 1 + mentionResults.length) % mentionResults.length)
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        const candidate = mentionResults[highlightedMentionIndex] ?? mentionResults[0]
        if (candidate) {
          insertSelectedMention(candidate)
        }
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        resetMentionState()
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }, [handleSend, highlightedMentionIndex, insertSelectedMention, mentionResults, mentionState.active, resetMentionState])

  if (compact) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex justify-end">
      <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-2">
        {!isOpen ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="border border-white/15 bg-slate-950/65 text-white shadow-sm backdrop-blur hover:bg-slate-900/75"
            onClick={handleOpen}
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Meeting chat
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="ml-2 rounded-full border border-white/15 bg-white/10 text-white">
                {unreadCount}
              </Badge>
            ) : null}
          </Button>
        ) : null}

        {isOpen ? (
          <div className="flex h-[24rem] w-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/82 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Meeting chat</p>
                <p className="mt-1 text-sm text-slate-100">Only people currently in the room receive these messages.</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close meeting chat</span>
              </Button>
            </div>

            <ScrollArea className="min-h-0 flex-1 px-4 py-3">
              <div className="space-y-3 pr-3">
                {chatMessages.length > 0 ? (
                  chatMessages.map((message) => (
                    <MeetingChatMessage
                      key={message.id ?? message.timestamp}
                      mentionLabels={mentionLabels}
                      localAvatarUrl={user?.photoURL ?? null}
                      message={message}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-slate-300">
                    No messages yet. Say hello to everyone in the room.
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-white/10 px-4 py-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={attachmentAccept}
                className="hidden"
                onChange={handleAttachmentSelection}
              />
              {pendingAttachments.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {pendingAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-slate-100"
                    >
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                      <span className="max-w-[10rem] truncate">{attachment.name}</span>
                      <span className="text-slate-400">{attachment.sizeLabel}</span>
                      <button
                        type="button"
                        className="rounded-full p-0.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove {attachment.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              {mentionState.active && mentionResults.length > 0 ? (
                <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-lg">
                  <p className="border-b border-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                    Mention someone in the room
                  </p>
                  <div className="max-h-52 overflow-y-auto p-2">
                    {mentionResults.map((candidate, index) => {
                      const isActive = index === highlightedMentionIndex
                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          onMouseDown={handleMentionMouseDown}
                          onClick={() => insertSelectedMention(candidate)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition',
                            isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5',
                          )}
                        >
                          <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                            {candidate.avatarUrl ? <AvatarImage src={candidate.avatarUrl} alt={candidate.label} /> : null}
                            <AvatarFallback className="bg-white/10 text-[11px] font-semibold text-white">
                              {getMeetingChatInitials(candidate.label)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 flex-1 truncate">{candidate.label}</span>
                          {!candidate.isLocal ? (
                            <span className="text-[11px] text-slate-400">@{candidate.identity}</span>
                          ) : (
                            <span className="text-[11px] text-slate-400">You</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              <Textarea
                ref={textareaRef}
                value={draft}
                onBlur={handleComposerBlur}
                onChange={handleDraftChange}
                onKeyDown={handleComposerKeyDown}
                placeholder="Send a message to everyone in the room… Type @ to mention someone."
                autoGrow
                rows={2}
                className="min-h-[76px] border-white/10 bg-white/5 text-white placeholder:text-slate-400 hover:border-white/20 focus-visible:border-white/25 focus-visible:ring-white/10"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400">Press Enter to send. Shift+Enter adds a new line.</p>
                  <p className="text-[11px] text-slate-500">Type @ to mention people in the room. Share up to {MAX_ATTACHMENTS} files per message.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
                    disabled={uploadingFiles}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach files to meeting chat</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="min-w-[110px] bg-white text-slate-950 hover:bg-slate-100"
                    disabled={!canSend || isSending || uploadingFiles}
                    onClick={() => {
                      void handleSend()
                    }}
                  >
                    {isSending || uploadingFiles ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {uploadingFiles ? 'Uploading…' : isSending ? 'Sending…' : 'Send'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}