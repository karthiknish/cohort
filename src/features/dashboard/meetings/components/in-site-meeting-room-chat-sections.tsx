'use client'

import { useMemo, type ChangeEvent, type KeyboardEvent, type MouseEvent, type RefObject } from 'react'

import type { ReceivedChatMessage } from '@livekit/components-react'
import { Download, File, ImageIcon, LoaderCircle, MessageSquareText, Paperclip, Send, X } from 'lucide-react'

import type { PendingAttachment } from '@/features/dashboard/collaboration/hooks/types'
import { AgentMentionText } from '@/shared/components/agent-mode/mention-highlights'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/lib/utils'

import {
  getMeetingChatAuthorLabel,
  getMeetingChatInitials,
  getMeetingChatParticipantAvatarUrl,
  parseMeetingChatMessageContent,
  type MeetingChatAttachment,
} from './in-site-meeting-room-chat.utils'

export type MeetingChatMentionCandidate = {
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

export function MeetingChatAttachmentCard({ attachment, isLocal }: { attachment: MeetingChatAttachment; isLocal: boolean }) {
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
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
          isLocal ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-foreground',
        )}
      >
        {isImageAttachment(attachment) ? <ImageIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isLocal ? 'text-primary-foreground' : 'text-foreground')}>{attachment.name}</p>
        <p className={cn('text-xs', isLocal ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{attachment.size}</p>
      </div>
      <Download className={cn('h-4 w-4 shrink-0', isLocal ? 'text-primary-foreground/80' : 'text-muted-foreground')} />
    </a>
  )
}

export function MeetingChatMessageItem({
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
          <AvatarFallback className="bg-muted text-[11px] font-semibold text-foreground">{getMeetingChatInitials(authorLabel)}</AvatarFallback>
        </Avatar>
      ) : null}
      <div className={cn('max-w-[88%] space-y-1', isLocal && 'items-end text-right')}>
        <div
          className={cn(
            'space-y-2 rounded-2xl border px-3 py-2 shadow-sm',
            isLocal ? 'border-primary/30 bg-primary text-primary-foreground' : 'border-border/80 bg-background/95 text-foreground',
          )}
        >
          <div className={cn('mb-1 flex items-center gap-2 text-[11px] font-medium', isLocal ? 'justify-end text-primary-foreground/80' : 'text-muted-foreground')}>
            <span>{authorLabel}</span>
            <span>·</span>
            <span>{formatMessageTime(message.timestamp)}</span>
          </div>
          {content.text ? (
            <AgentMentionText
              text={content.text}
              mentionLabels={mentionLabels}
              className={cn('whitespace-pre-wrap text-sm leading-6', isLocal ? 'text-primary-foreground' : 'text-foreground')}
              mentionClassName={cn(isLocal ? 'bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/20' : 'bg-primary/15 text-primary ring-primary/20')}
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
          <AvatarFallback className="bg-primary/15 text-[11px] font-semibold text-primary">{getMeetingChatInitials(authorLabel)}</AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  )
}

export function MeetingChatLauncherButton({ unreadCount, onOpen }: { unreadCount: number; onOpen: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className="border border-white/15 bg-slate-950/65 text-white shadow-sm backdrop-blur hover:bg-slate-900/75"
      onClick={onOpen}
    >
      <MessageSquareText className="mr-2 h-4 w-4" />
      Meeting chat
      {unreadCount > 0 ? (
        <Badge variant="secondary" className="ml-2 rounded-full border border-white/15 bg-white/10 text-white">
          {unreadCount}
        </Badge>
      ) : null}
    </Button>
  )
}

export type MeetingChatPanelProps = {
  attachmentAccept: string
  canSend: boolean
  chatMessages: ReceivedChatMessage[]
  draft: string
  fileInputRef: RefObject<HTMLInputElement | null>
  highlightedMentionIndex: number
  isSending: boolean
  localAvatarUrl?: string | null
  maxAttachments: number
  mentionLabels: string[]
  mentionResults: MeetingChatMentionCandidate[]
  messageEndRef: RefObject<HTMLDivElement | null>
  onAttachmentSelection: (event: ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
  onComposerBlur: () => void
  onDraftChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onMentionMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
  onRemoveAttachment: (attachmentId: string) => void
  onSelectMention: (candidate: MeetingChatMentionCandidate) => void
  onSend: () => void
  pendingAttachments: PendingAttachment[]
  showMentionResults: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  uploadingFiles: boolean
}

export function MeetingChatFloatingDock({
  compact,
  isOpen,
  onOpen,
  panelProps,
  unreadCount,
}: {
  compact: boolean
  isOpen: boolean
  onOpen: () => void
  panelProps: MeetingChatPanelProps
  unreadCount: number
}) {
  if (compact) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex justify-end">
      <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-2">
        {!isOpen ? <MeetingChatLauncherButton unreadCount={unreadCount} onOpen={onOpen} /> : null}
        {isOpen ? <MeetingChatPanel {...panelProps} /> : null}
      </div>
    </div>
  )
}

export function MeetingChatPanel({
  attachmentAccept,
  canSend,
  chatMessages,
  draft,
  fileInputRef,
  highlightedMentionIndex,
  isSending,
  localAvatarUrl,
  maxAttachments,
  mentionLabels,
  mentionResults,
  messageEndRef,
  onAttachmentSelection,
  onClose,
  onComposerBlur,
  onDraftChange,
  onKeyDown,
  onMentionMouseDown,
  onRemoveAttachment,
  onSelectMention,
  onSend,
  pendingAttachments,
  showMentionResults,
  textareaRef,
  uploadingFiles,
}: MeetingChatPanelProps) {
  return (
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
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close meeting chat</span>
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-4 py-3">
        <div className="space-y-3 pr-3">
          {chatMessages.length > 0 ? (
            chatMessages.map((message) => (
              <MeetingChatMessageItem
                key={message.id ?? message.timestamp}
                mentionLabels={mentionLabels}
                localAvatarUrl={localAvatarUrl}
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
          onChange={onAttachmentSelection}
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
                  onClick={() => onRemoveAttachment(attachment.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove {attachment.name}</span>
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {showMentionResults && mentionResults.length > 0 ? (
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
                    onMouseDown={onMentionMouseDown}
                    onClick={() => onSelectMention(candidate)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition',
                      isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5',
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                      {candidate.avatarUrl ? <AvatarImage src={candidate.avatarUrl} alt={candidate.label} /> : null}
                      <AvatarFallback className="bg-white/10 text-[11px] font-semibold text-white">{getMeetingChatInitials(candidate.label)}</AvatarFallback>
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
          onBlur={onComposerBlur}
          onChange={onDraftChange}
          onKeyDown={onKeyDown}
          placeholder="Send a message to everyone in the room… Type @ to mention someone."
          autoGrow
          rows={2}
          className="min-h-[76px] border-white/10 bg-white/5 text-white placeholder:text-slate-400 hover:border-white/20 focus-visible:border-white/25 focus-visible:ring-white/10"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Press Enter to send. Shift+Enter adds a new line.</p>
            <p className="text-[11px] text-slate-500">Type @ to mention people in the room. Share up to {maxAttachments} files per message.</p>
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
              onClick={onSend}
            >
              {isSending || uploadingFiles ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {uploadingFiles ? 'Uploading…' : isSending ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}