'use client'

import { useRef, useState, useCallback, type ChangeEvent, type ClipboardEvent } from 'react'
import { 
  Send, MoreVertical, Archive, BellOff, Bell, ArchiveRestore, 
  Share2, Mail, LoaderCircle, Hash, RefreshCw
} from 'lucide-react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { RichComposer } from './rich-composer'
import { PendingAttachmentsList } from './message-composer'
import { 
  MessageList, 
  collaborationToUnifiedMessage, 
  type UnifiedMessage 
} from './message-list'
import { SwipeableMessage } from './swipeable-message'
import { MessageAttachments } from './message-attachments'
import { MessageReactions } from './message-reactions'
import { MessageContent } from './message-content'
import { DeletedMessageInfo } from './message-item-parts'

import type { CollaborationMessage, CollaborationAttachment } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'
import type { PendingAttachment } from '../hooks/types'

const PLATFORM_CONFIG: Record<'email', { label: string; color: string }> = {
  email: { label: 'Email', color: 'bg-blue-500' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export interface MessagePaneHeaderInfo {
  name: string
  type: 'channel' | 'dm'
  role?: string | null
  isArchived?: boolean
  isMuted?: boolean
  onArchive?: (archived: boolean) => void
  onMute?: (muted: boolean) => void
  participantCount?: number
  messageCount?: number
  onExport?: () => void
}

export interface UnifiedMessagePaneProps {
  header: MessagePaneHeaderInfo | null
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onRefresh?: () => Promise<void> | void
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
  pendingAttachments?: PendingAttachment[]
  uploadingAttachments?: boolean
  onAddAttachments?: (files: FileList | File[]) => void
  onRemoveAttachment?: (attachmentId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  onReply?: (message: UnifiedMessage) => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onCreateTask?: (message: UnifiedMessage) => void
  typingIndicator?: string
  emptyState?: React.ReactNode
  placeholder?: string
  participants?: ClientTeamMember[]
  channelMessages?: CollaborationMessage[]
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>
}

export function UnifiedMessagePane({
  header,
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  isSending,
  pendingAttachments = [],
  uploadingAttachments = false,
  onAddAttachments,
  onRemoveAttachment,
  onToggleReaction,
  reactionPendingByMessage = {},
  onReply,
  onDeleteMessage,
  onEditMessage,
  onShareToPlatform,
  onCreateTask,
  typingIndicator,
  emptyState,
  placeholder = 'Type a message...',
  participants = [],
  channelMessages,
  deletedInfoByMessage,
}: UnifiedMessagePaneProps) {
  const [sharingTo, setSharingTo] = useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const hasPendingAttachments = pendingAttachments.length > 0

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])

  const handleReply = useCallback((message: UnifiedMessage) => {
    onReply?.(message)
  }, [onReply])

  const handleDelete = useCallback(async (messageId: string) => {
    if (!onDeleteMessage) return
    setDeletingMessageId(messageId)
    await onDeleteMessage(messageId).catch(() => undefined)
    setDeletingMessageId(null)
  }, [onDeleteMessage])

  const handleShare = async (message: UnifiedMessage, platform: 'email') => {
    if (!onShareToPlatform) return
    
    setSharingTo(`${message.id}-${platform}`)
    await onShareToPlatform(message, platform)
      .then(() => {
      toast({
        title: 'Message shared',
        description: `Sent to ${PLATFORM_CONFIG[platform]?.label ?? platform}`,
      })
      })
      .catch(() => {
      toast({
        title: 'Share failed',
        description: `Could not send to ${PLATFORM_CONFIG[platform]?.label ?? platform}`,
        variant: 'destructive',
      })
      })
    setSharingTo(null)
  }

  const handleSend = async () => {
    const content = messageInput.trim()
    if ((!content && !hasPendingAttachments) || isSending || uploadingAttachments) return
    await onSendMessage(content)
  }

  const handleAttachmentInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!onAddAttachments) return
      const files = event.target.files
      if (files && files.length > 0) {
        onAddAttachments(files)
      }
      event.target.value = ''
    },
    [onAddAttachments]
  )

  const handleComposerDragOver = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (!onAddAttachments) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    [onAddAttachments]
  )

  const handleComposerDrop = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (!onAddAttachments) return
      event.preventDefault()
      const files = event.dataTransfer.files
      if (files && files.length > 0) {
        onAddAttachments(files)
      }
    },
    [onAddAttachments]
  )

  const handleComposerPaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      if (!onAddAttachments) return
      const files = event.clipboardData?.files
      if (files && files.length > 0) {
        event.preventDefault()
        onAddAttachments(files)
      }
    },
    [onAddAttachments]
  )

  const renderMessageExtras = (message: UnifiedMessage) => {
    if (!message.sharedTo || message.sharedTo.length === 0) return null
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-muted-foreground">Sent to:</span>
        {message.sharedTo.map((platform) => (
          <TooltipProvider key={platform}>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                  <Mail className="h-3 w-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shared to {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.label ?? platform}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  const renderMessageActions = (message: UnifiedMessage) => {
    const canManage = !message.deleted && 
      ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')
    
    return (
      <>
        {onShareToPlatform && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Share2 className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => handleShare(message, 'email')}
                disabled={sharingTo === `${message.id}-email`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </>
    )
  }

  const renderMessageAttachments = (message: UnifiedMessage) => {
    if (!message.attachments || message.attachments.length === 0) return null
    
    const attachments: CollaborationAttachment[] = message.attachments.map(a => ({
      name: a.name ?? 'File',
      url: a.url,
      type: a.mimeType ?? null,
      size: a.size ? String(a.size) : null,
    }))
    
    return <MessageAttachments attachments={attachments} />
  }

  const renderDeletedInfo = (message: UnifiedMessage) => {
    const info = deletedInfoByMessage?.[message.id]
    if (!info) return <p className="text-sm italic text-muted-foreground">Message removed</p>
    return <DeletedMessageInfo deletedBy={info.deletedBy} deletedAt={info.deletedAt} />
  }

  const renderMessageWrapper = (message: UnifiedMessage, children: React.ReactNode) => (
    <SwipeableMessage
      key={message.id}
      message={message}
      currentUserId={currentUserId}
      canDelete={!message.deleted && message.senderId === currentUserId && !!onDeleteMessage}
      onReply={() => handleReply(message)}
      onDelete={() => handleDelete(message.id)}
    >
      {children}
    </SwipeableMessage>
  )

  if (!header) {
    return (
      <div className="flex-1 flex items-center justify-center border-muted/40 h-full bg-background/50">
        <div className="text-center p-8">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
      </div>
      
      {/* Header */}
      <div className="p-4 border-b border-muted/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className={cn(
                header.type === 'channel' ? 'bg-muted' : 'bg-primary/10 text-primary'
              )}>
                {header.type === 'channel' ? (
                  <Hash className="h-4 w-4" />
                ) : (
                  getInitials(header.name)
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{header.name}</h3>
              {header.role && (
                <Badge variant="outline" className="text-xs mt-0.5">
                  {header.role}
                </Badge>
              )}
              {header.participantCount !== undefined && (
                <span className="text-xs text-muted-foreground ml-2">
                  {header.participantCount} members
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {header.isArchived && (
              <Badge variant="secondary" className="text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
            {header.isMuted && (
              <Badge variant="secondary" className="text-xs">
                <BellOff className="h-3 w-3 mr-1" />
                Muted
              </Badge>
            )}
            
            {(header.onArchive || header.onMute || header.onExport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {header.onArchive && (
                    <DropdownMenuItem onClick={() => header.onArchive?.(!header.isArchived)}>
                      {header.isArchived ? (
                        <>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {header.onMute && (
                    <DropdownMenuItem onClick={() => header.onMute?.(!header.isMuted)}>
                      {header.isMuted ? (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <BellOff className="h-4 w-4 mr-2" />
                          Mute
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {header.onExport && (
                    <DropdownMenuItem onClick={header.onExport}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Export messages
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isLoading={isLoading || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onRefresh={onRefresh}
          onToggleReaction={handleReaction}
          reactionPendingByMessage={reactionPendingByMessage}
          onReply={onReply}
          onDeleteMessage={onDeleteMessage}
          deletingMessageId={deletingMessageId}
          renderMessageExtras={renderMessageExtras}
          renderMessageActions={renderMessageActions}
          renderMessageAttachments={renderMessageAttachments}
          renderDeletedInfo={renderDeletedInfo}
          renderMessageWrapper={renderMessageWrapper}
          emptyState={emptyState}
          variant={header.type === 'channel' ? 'channel' : 'dm'}
        />
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-muted/40 shrink-0">
        <PendingAttachmentsList
          attachments={pendingAttachments}
          uploading={uploadingAttachments}
          disabled={isSending}
          onRemove={(attachmentId) => onRemoveAttachment?.(attachmentId)}
        />
        <div className="w-full rounded-lg border border-muted/40 bg-background shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
          <RichComposer
            value={messageInput}
            onChange={onMessageInputChange}
            onSend={handleSend}
            disabled={isSending || uploadingAttachments}
            placeholder={placeholder}
            participants={participants}
            onDrop={handleComposerDrop}
            onDragOver={handleComposerDragOver}
            onPaste={handleComposerPaste}
            onAttachClick={onAddAttachments ? () => fileInputRef.current?.click() : undefined}
            hasAttachments={hasPendingAttachments}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleAttachmentInputChange}
        />
        <div className="flex items-center justify-between mt-2">
          {typingIndicator && (
            <span className="text-xs text-muted-foreground italic">{typingIndicator}</span>
          )}
          <div className="flex-1" />
          <Button
            onClick={handleSend}
            disabled={(!messageInput.trim() && !hasPendingAttachments) || isSending || uploadingAttachments}
            size="sm"
          >
            {isSending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
