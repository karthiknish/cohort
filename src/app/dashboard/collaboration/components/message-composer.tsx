'use client'

import type { ChangeEvent, RefObject, ClipboardEvent } from 'react'
import { FileText, Image as ImageIcon, LoaderCircle, Reply, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'
import type { Channel } from '../types'
import type { PendingAttachment } from '../hooks/types'
import { RichComposer } from './rich-composer'

export interface SenderSelectorProps {
  value: string
  onChange: (value: string) => void
  participants: ClientTeamMember[]
  disabled?: boolean
}

export function SenderSelector({
  value,
  onChange,
  participants,
  disabled = false,
}: SenderSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={participants.length === 0 || disabled}
    >
      <SelectTrigger className="h-8 w-full text-xs sm:w-56">
        <SelectValue placeholder="Choose teammate" />
      </SelectTrigger>
      <SelectContent>
        {participants.map((participant) => (
          <SelectItem key={participant.name} value={participant.name} className="text-xs">
            {participant.name}
            {participant.role ? ` • ${participant.role}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
    <div className="space-y-2 rounded-md border border-dashed border-muted/60 bg-muted/20 p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Attachments ready to upload</span>
        {uploading && (
          <span className="inline-flex items-center gap-1">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Uploading…
          </span>
        )}
      </div>
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const isImageType = attachment.mimeType.startsWith('image/')
          return (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-md border border-muted/50 bg-background p-2 text-sm"
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
                onClick={() => onRemove(attachment.id)}
                disabled={disabled}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove {attachment.name}</span>
              </Button>
            </div>
          )
        })}
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
      >
        <X className="h-3 w-3" />
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
  senderSelection: string
  onSenderSelectionChange: (value: string) => void
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
  senderSelection,
  onSenderSelectionChange,
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
  return (
    <div className="border-t border-muted/40 bg-background p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SenderSelector
            value={senderSelection}
            onChange={onSenderSelectionChange}
            participants={channelParticipants}
            disabled={sending}
          />
        </div>

        <PendingAttachmentsList
          attachments={pendingAttachments}
          uploading={uploading}
          disabled={sending}
          onRemove={onRemoveAttachment}
        />

        <div className="space-y-3">
          <div className="w-full rounded-lg border border-muted/40 bg-background shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
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
              onAttachClick={() => fileInputRef.current?.click()}
              hasAttachments={pendingAttachments.length > 0}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              onClick={onSend}
              disabled={isSendDisabled}
              className="inline-flex h-8 items-center gap-2 text-xs"
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
