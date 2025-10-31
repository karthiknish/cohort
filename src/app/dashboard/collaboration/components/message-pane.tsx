'use client'

import { useEffect, useMemo, useState } from 'react'
import type { RefObject } from 'react'
import { Download, FileText, Image as ImageIcon, Loader2, MoreHorizontal, RefreshCw, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'
import { CHANNEL_TYPE_COLORS, formatTimestamp, getInitials } from '../utils'

const MAX_PREVIEW_LENGTH = 80

interface CollaborationMessagePaneProps {
  channel: Channel | null
  channelMessages: CollaborationMessage[]
  channelParticipants: ClientTeamMember[]
  messagesError: string | null
  isLoading: boolean
  onLoadMore?: () => void
  canLoadMore?: boolean
  loadingMore?: boolean
  senderSelection: string
  onSenderSelectionChange: (value: string) => void
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: () => void
  sending: boolean
  isSendDisabled: boolean
  onEditMessage: (messageId: string, nextContent: string) => void
  onDeleteMessage: (messageId: string) => void
  messageUpdatingId: string | null
  messageDeletingId: string | null
  messagesEndRef: RefObject<HTMLDivElement | null>
  currentUserId?: string | null
  currentUserRole?: string | null
}

export function CollaborationMessagePane({
  channel,
  channelMessages,
  channelParticipants,
  messagesError,
  isLoading,
  onLoadMore,
  canLoadMore = false,
  loadingMore = false,
  senderSelection,
  onSenderSelectionChange,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  sending,
  isSendDisabled,
  onEditMessage,
  onDeleteMessage,
  messageUpdatingId,
  messageDeletingId,
  messagesEndRef,
  currentUserId,
  currentUserRole,
}: CollaborationMessagePaneProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const editingPreview = useMemo(() => {
    if (!editingMessageId) return ''
    const target = channelMessages.find((message) => message.id === editingMessageId)
    if (!target) return ''
    const text = target.content ?? ''
    if (text.length <= MAX_PREVIEW_LENGTH) {
      return text
    }
    return `${text.slice(0, MAX_PREVIEW_LENGTH)}…`
  }, [channelMessages, editingMessageId])

  const handleStartEdit = (message: CollaborationMessage) => {
    if (message.isDeleted || messageUpdatingId === message.id || messageDeletingId === message.id) {
      return
    }
    setEditingMessageId(message.id)
    setEditingValue(message.content ?? '')
  }

  useEffect(() => {
    if (!editingMessageId) {
      return
    }
    const stillExists = channelMessages.some((message) => message.id === editingMessageId && !message.isDeleted)
    if (!stillExists) {
      setEditingMessageId(null)
      setEditingValue('')
    }
  }, [channelMessages, editingMessageId])

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingValue('')
  }

  const handleConfirmEdit = () => {
    if (!editingMessageId || messageUpdatingId === editingMessageId) {
      return
    }
    const trimmed = editingValue.trim()
    if (!trimmed) {
      return
    }
    onEditMessage(editingMessageId, trimmed)
    setEditingMessageId(null)
    setEditingValue('')
  }

  const handleConfirmDelete = (messageId: string) => {
    if (messageDeletingId === messageId) {
      return
    }
    if (editingMessageId === messageId) {
      handleCancelEdit()
    }
    onDeleteMessage(messageId)
  }

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Add a client to start a shared collaboration workspace.
      </div>
    )
  }

  return (
    <div className="flex min-h-[480px] flex-1 flex-col lg:h-[640px]">
      <div className="flex items-start justify-between gap-3 border-b border-muted/40 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">{channel.name}</CardTitle>
            <Badge variant="outline" className={CHANNEL_TYPE_COLORS[channel.type]}>
              {channel.type}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            {channelParticipants.map((member) => member.name).join(', ')}
          </CardDescription>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {isLoading && (
            <div className="flex justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {!isLoading && channelMessages.length === 0 && !messagesError && (
            <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Start the conversation by posting the first update for this workspace.
            </div>
          )}

          {messagesError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {messagesError}
            </div>
          )}

          {!isLoading && !messagesError && canLoadMore && onLoadMore && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 text-xs"
              >
                <RefreshCw className={loadingMore ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                {loadingMore ? 'Loading older messages…' : 'Load older messages'}
              </Button>
            </div>
          )}

          {channelMessages.map((message) => {
            const canManageMessage =
              !message.isDeleted &&
              ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')

            const isDeleting = messageDeletingId === message.id
            const isUpdating = messageUpdatingId === message.id

            return (
              <div key={message.id} className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {getInitials(message.senderName)}
                </span>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{message.senderName}</p>
                    {message.senderRole && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                        {message.senderRole}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.createdAt)}
                      {message.isEdited && !message.isDeleted ? ' · edited' : ''}
                    </span>
                    {canManageMessage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-muted-foreground"
                            disabled={isUpdating || isDeleting}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Message actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-sm">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              handleStartEdit(message)
                            }}
                            disabled={isUpdating || isDeleting}
                          >
                            Edit message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              handleConfirmDelete(message.id)
                            }}
                            className="text-destructive focus:text-destructive"
                            disabled={isDeleting || isUpdating}
                          >
                            Delete message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                        disabled={isUpdating}
                        maxLength={2000}
                        className="min-h-[88px]"
                      />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Editing message</span>
                        {editingPreview && <span className="truncate">“{editingPreview}”</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleConfirmEdit}
                          disabled={isUpdating || editingValue.trim().length === 0}
                          className="inline-flex items-center gap-2"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Save changes
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : message.isDeleted ? (
                    <p className="text-sm italic text-muted-foreground">Message removed</p>
                  ) : (
                    <p className="whitespace-pre-line text-sm text-foreground">{message.content}</p>
                  )}
                  {Array.isArray(message.attachments) && message.attachments.length > 0 && !message.isDeleted && (
                    <div className="space-y-2">
                      {message.attachments.map((attachment) => (
                        <Card key={`${attachment.url}-${attachment.name}`} className="border-muted/60 bg-muted/20">
                          <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                            <div className="flex items-center gap-2 truncate">
                              {attachment.type?.toLowerCase() === 'image' ? (
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="truncate">{attachment.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {attachment.size && <span>{attachment.size}</span>}
                              <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download {attachment.name}</span>
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                {!message.isDeleted && isDeleting && (
                  <div className="mt-2 text-xs text-destructive">
                    <Loader2 className="mr-1 inline h-3 w-3 animate-spin align-middle" /> Removing message…
                  </div>
                )}
              </div>
            )
          })}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-muted/40 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={senderSelection}
              onValueChange={onSenderSelectionChange}
              disabled={channelParticipants.length === 0 || sending}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Choose teammate" />
              </SelectTrigger>
              <SelectContent>
                {channelParticipants.map((participant) => (
                  <SelectItem key={participant.name} value={participant.name}>
                    {participant.name}
                    {participant.role ? ` • ${participant.role}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Textarea
              value={messageInput}
              onChange={(event) => onMessageInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  onSendMessage()
                }
              }}
              placeholder="Share an update, add context, or ask a question…"
              className="min-h-[72px] flex-1"
              disabled={!channel || sending}
              maxLength={2000}
            />
            <Button onClick={onSendMessage} disabled={isSendDisabled} className="sm:self-stretch">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
