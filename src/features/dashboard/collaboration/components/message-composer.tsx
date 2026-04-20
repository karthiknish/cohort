'use client'

import { useCallback } from 'react'
import type { ChangeEvent, RefObject, ClipboardEvent } from 'react'
import { FileText, Image as ImageIcon, LoaderCircle, Reply, Send, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'
import type { Channel } from '../types'
import type { PendingAttachment } from '../hooks/types'
import { RichComposer } from './rich-composer'

function PendingAttachmentRow({
  attachment,
  disabled,
  onRemove,
}: {
  attachment: PendingAttachment
  disabled: boolean
  onRemove: (attachmentId: string) => void
}) {
  const isImageType = attachment.mimeType.startsWith('image/')

  const handleRemove = useCallback(() => {
    onRemove(attachment.id)
  }, [attachment.id, onRemove])

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md border border-muted/50 bg-background p-2 text-sm animate-in fade-in-50 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
      key={attachment.id}
    >
      <div className="flex min-w-0 items-center gap-2">
        {isImageType ? (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="truncate" title={attachment.name}>
          {attachment.name}
        </span>
        <span className="text-xs text-muted-foreground">{attachment.sizeLabel}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        disabled={disabled}
        className="h-7 w-7"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove {attachment.name}</span>
      </Button>
    </div>
  )
}

export interface PendingAttachmentsListProps {
  attachments: PendingAttachment[]
  uploading: boolean
  disabled?: boolean
  onRemove: (attachmentId: string) => void
}

export function PendingAttachmentsList({
  attachments,
  uploading,
  disabled = false,
  onRemove,
}: PendingAttachmentsListProps) {
  if (attachments.length === 0) return null

  return (
    <div className="space-y-2 rounded-md border border-dashed border-muted/60 bg-muted/20 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{attachments.length} attachment{attachments.length === 1 ? '' : 's'} ready to send</span>
        {uploading && (
          <span className="inline-flex items-center gap-1">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Uploading…
          </span>
        )}
      </div>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <PendingAttachmentRow
            key={attachment.id}
            attachment={attachment}
            disabled={disabled}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

export interface ReplyIndicatorProps {
  message: CollaborationMessage
  onCancel: () => void
}

export function ReplyIndicator({ message, onCancel }: ReplyIndicatorProps) {
  return (
    <div className="flex items-center justify-between rounded-t-lg border-b border-muted/40 bg-muted/20 px-3 py-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
          <Reply className="h-3 w-3 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Replying to thread</span>
          <span className="font-medium text-foreground">{message.senderName}</span>
        </div>
        {message.content && (
          <span className="ml-2 max-w-[200px] truncate border-l border-muted pl-2 text-muted-foreground">
            &quot;{message.content.slice(0, 50)}
            {message.content.length > 50 ? '…' : ''}&quot;
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded-full hover:bg-muted/50"
        onClick={onCancel}
        aria-label="Cancel reply"
      >
        <X className="h-3 w-3" aria-hidden />
      </Button>
    </div>
  )
}

export interface MessageComposerProps {
  channel: Channel | null
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSend: () => void
  sending: boolean
  isSendDisabled: boolean
  pendingAttachments: PendingAttachment[]
  uploading: boolean
  onAddAttachments: (files: FileList | File[]) => void
  onRemoveAttachment: (attachmentId: string) => void
  channelParticipants: ClientTeamMember[]
  replyingToMessage: CollaborationMessage | null
  onCancelReply: () => void
  onComposerFocus: () => void
  onComposerBlur: () => void
  typingIndicator: string
  fileInputRef: RefObject<HTMLInputElement | null>
  onAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onComposerDrop: (event: React.DragEvent<HTMLTextAreaElement>) => void
  onComposerDragOver: (event: React.DragEvent<HTMLTextAreaElement>) => void
  onComposerPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void
}

export function MessageComposer({
  channel,
  messageInput,
  onMessageInputChange,
  onSend,
  sending,
  isSendDisabled,
  pendingAttachments,
  uploading,
  onRemoveAttachment,
  channelParticipants,
  replyingToMessage,
  onCancelReply,
  onComposerFocus,
  onComposerBlur,
  typingIndicator,
  fileInputRef,
  onAttachmentInputChange,
  onComposerDrop,
  onComposerDragOver,
  onComposerPaste,
}: MessageComposerProps) {
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  return (
    <div className="border-t border-muted/40 bg-background p-4">
      <div className="space-y-3">
        <PendingAttachmentsList
          attachments={pendingAttachments}
          uploading={uploading}
          disabled={sending}
          onRemove={onRemoveAttachment}
        />

        <div className="space-y-3">
          <div className="w-full rounded-lg border border-muted/40 bg-background shadow-sm motion-chromatic focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
            {replyingToMessage && (
              <ReplyIndicator message={replyingToMessage} onCancel={onCancelReply} />
            )}
            <RichComposer
              value={messageInput}
              onChange={onMessageInputChange}
              onSend={onSend}
              disabled={!channel || sending}
              onFocus={onComposerFocus}
              onBlur={onComposerBlur}
              onDrop={onComposerDrop}
              onDragOver={onComposerDragOver}
              onPaste={onComposerPaste}
              participants={channelParticipants}
              onAttachClick={handleAttachClick}
              hasAttachments={pendingAttachments.length > 0}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              onClick={onSend}
              disabled={isSendDisabled}
              className="inline-flex h-8 items-center gap-2 text-xs motion-chromatic duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
            >
              {sending ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send Message
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onAttachmentInputChange}
        />

        {typingIndicator && (
          <div className="text-xs text-muted-foreground">{typingIndicator}</div>
        )}
      </div>
    </div>
  )
}
