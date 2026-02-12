'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
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
  DropdownMenuSeparator,
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
import { 
  MessageList, 
  collaborationToUnifiedMessage, 
  type UnifiedMessage 
} from './message-list'
import { SwipeableMessage } from './swipeable-message'
import { MessageAttachments } from './message-attachments'
import { MessageReactions } from './message-reactions'
import { MessageContent } from './message-content'
import { SharedPlatformIcons } from './message-share-button'
import { DeletedMessageInfo } from './message-item-parts'

import type { CollaborationMessage, CollaborationAttachment } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

const PLATFORM_CONFIG: Record<'slack' | 'teams' | 'whatsapp' | 'email', { label: string; color: string }> = {
  slack: { label: 'Slack', color: 'bg-[#E01E5A]' },
  teams: { label: 'Teams', color: 'bg-[#5059C9]' },
  whatsapp: { label: 'WhatsApp', color: 'bg-[#25D366]' },
  email: { label: 'Email', color: 'bg-blue-500' },
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 127 127" className={className}>
      <path fill="#E01E5A" d="M27.2 80.0c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2v13.2zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z"/>
      <path fill="#36C5F0" d="M47 27.0c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2v13.2H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z"/>
      <path fill="#2EB67D" d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6s13.2 5.9 13.2 13.2v33.1z"/>
      <path fill="#ECB22E" d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H80.1z"/>
    </svg>
  )
}

function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 2228.6 2073.2" className={className}>
      <path fill="#5059C9" d="M1554.6 0v518.4h518.4V0h-518.4z"/>
      <path fill="#7B83EB" d="M0 1020.8c0 285.3 232.1 517.4 517.4 517.4s517.4-232.1 517.4-517.4c0-285.3-232.1-517.4-517.4-517.4S0 735.5 0 1020.8z"/>
      <path fill="#5059C9" d="M1036.2 1039.1h941.8v1034.1h-941.8z"/>
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
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
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  onReply?: (message: UnifiedMessage) => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'slack' | 'teams' | 'whatsapp' | 'email') => Promise<void>
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
  const { toast } = useToast()

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])

  const handleReply = useCallback((message: UnifiedMessage) => {
    onReply?.(message)
  }, [onReply])

  const handleDelete = useCallback(async (messageId: string) => {
    if (!onDeleteMessage) return
    setDeletingMessageId(messageId)
    try {
      await onDeleteMessage(messageId)
    } finally {
      setDeletingMessageId(null)
    }
  }, [onDeleteMessage])

  const handleShare = async (message: UnifiedMessage, platform: 'slack' | 'teams' | 'whatsapp' | 'email') => {
    if (!onShareToPlatform) return
    
    setSharingTo(`${message.id}-${platform}`)
    try {
      await onShareToPlatform(message, platform)
      toast({
        title: 'Message shared',
        description: `Sent to ${PLATFORM_CONFIG[platform]?.label ?? platform}`,
      })
    } catch (error) {
      toast({
        title: 'Share failed',
        description: `Could not send to ${PLATFORM_CONFIG[platform]?.label ?? platform}`,
        variant: 'destructive',
      })
    } finally {
      setSharingTo(null)
    }
  }

  const handleSend = async () => {
    const content = messageInput.trim()
    if (!content || isSending) return
    await onSendMessage(content)
  }

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
                  {platform === 'slack' && <SlackIcon className="h-3 w-3" />}
                  {platform === 'teams' && <TeamsIcon className="h-3 w-3" />}
                  {platform === 'whatsapp' && <WhatsAppIcon className="h-3 w-3" />}
                  {platform === 'email' && <Mail className="h-3 w-3" />}
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
                onClick={() => handleShare(message, 'slack')}
                disabled={sharingTo === `${message.id}-slack`}
              >
                <SlackIcon className="h-4 w-4 mr-2" />
                Share to Slack
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleShare(message, 'teams')}
                disabled={sharingTo === `${message.id}-teams`}
              >
                <TeamsIcon className="h-4 w-4 mr-2" />
                Share to Teams
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleShare(message, 'whatsapp')}
                disabled={sharingTo === `${message.id}-whatsapp`}
              >
                <WhatsAppIcon className="h-4 w-4 mr-2" />
                Share to WhatsApp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
                    <DropdownMenuItem onClick={() => header.onArchive!(!header.isArchived)}>
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
                    <DropdownMenuItem onClick={() => header.onMute!(!header.isMuted)}>
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
        <div className="w-full rounded-lg border border-muted/40 bg-background shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
          <RichComposer
            value={messageInput}
            onChange={onMessageInputChange}
            onSend={handleSend}
            disabled={isSending}
            placeholder={placeholder}
            participants={participants}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {typingIndicator && (
            <span className="text-xs text-muted-foreground italic">{typingIndicator}</span>
          )}
          <div className="flex-1" />
          <Button onClick={handleSend} disabled={!messageInput.trim() || isSending} size="sm">
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
