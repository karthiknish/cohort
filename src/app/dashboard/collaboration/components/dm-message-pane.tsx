'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { 
  Send, MoreVertical, Archive, BellOff, Bell, ArchiveRestore, 
  Share2, Mail, LoaderCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/components/ui/use-toast'
import { RichComposer } from './rich-composer'
import { MessageList, type UnifiedMessage } from './message-list'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'

const PLATFORM_CONFIG = {
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

function toUnifiedMessage(msg: DirectMessage): UnifiedMessage {
  return {
    id: msg.legacyId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    content: msg.content,
    createdAtMs: msg.createdAtMs,
    edited: msg.edited,
    deleted: msg.deleted,
    reactions: msg.reactions ?? undefined,
    attachments: msg.attachments?.map(a => ({
      url: a.url,
      name: a.name,
      mimeType: a.type ?? undefined,
      size: a.size ? parseInt(a.size, 10) : undefined,
    })) ?? undefined,
    sharedTo: msg.sharedTo ?? undefined,
  }
}

interface DMMessagePaneProps {
  conversation: DirectConversation | null
  messages: DirectMessage[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
  onToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  onDeleteMessage?: (messageLegacyId: string) => Promise<void>
  onEditMessage?: (messageLegacyId: string, newContent: string) => Promise<void>
  onArchive: (archived: boolean) => Promise<void>
  onMute: (muted: boolean) => Promise<void>
  currentUserId: string | null
  onShareToPlatform?: (message: DirectMessage, platform: 'email') => Promise<void>
}

export function DMMessagePane({
  conversation,
  messages,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSendMessage,
  isSending,
  onToggleReaction,
  onDeleteMessage,
  onEditMessage,
  onArchive,
  onMute,
  currentUserId,
  onShareToPlatform,
}: DMMessagePaneProps) {
  const [inputValue, setInputValue] = useState('')
  const [sharingTo, setSharingTo] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const unifiedMessages = messages.map(toUnifiedMessage)

  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [conversation?.legacyId])

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content || isSending) return
    
    setInputValue('')
    await onSendMessage(content)
  }

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])

  const handleShare = async (message: DirectMessage, platform: 'email') => {
    if (!onShareToPlatform) return
    
    setSharingTo(`${message.legacyId}-${platform}`)
    await onShareToPlatform(message, platform)
      .then(() => {
      toast({
        title: 'Message shared',
        description: `Sent to ${PLATFORM_CONFIG[platform].label}`,
      })
      })
      .catch(() => {
      toast({
        title: 'Share failed',
        description: `Could not send to ${PLATFORM_CONFIG[platform].label}`,
        variant: 'destructive',
      })
      })
    setSharingTo(null)
  }

  const renderMessageExtras = (message: UnifiedMessage) => {
    const originalMsg = messages.find(m => m.legacyId === message.id)
    if (!originalMsg?.sharedTo || originalMsg.sharedTo.length === 0) return null
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-muted-foreground">Sent to:</span>
        {originalMsg.sharedTo.map((platform) => (
          <TooltipProvider key={platform}>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                  <Mail className="h-3 w-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shared to {PLATFORM_CONFIG[platform]?.label || platform}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  const renderMessageActions = (message: UnifiedMessage) => {
    if (!onShareToPlatform) return null
    
    const originalMsg = messages.find(m => m.legacyId === message.id)
    if (!originalMsg) return null
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Share2 className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            onClick={() => handleShare(originalMsg, 'email')}
            disabled={sharingTo === `${message.id}-email`}
          >
            <Mail className="h-4 w-4 mr-2" />
            Share via Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center border-muted/40 h-full">
        <div className="text-center p-8">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a direct message from the sidebar to start chatting
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <div className="p-4 border-b border-muted/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(conversation.otherParticipantName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">
                {conversation.otherParticipantName}
              </h3>
              {conversation.otherParticipantRole && (
                <Badge variant="outline" className="text-xs mt-0.5">
                  {conversation.otherParticipantRole}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {conversation.isArchived && (
              <Badge variant="secondary" className="text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
            {conversation.isMuted && (
              <Badge variant="secondary" className="text-xs">
                <BellOff className="h-3 w-3 mr-1" />
                Muted
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onArchive(!conversation.isArchived)}>
                  {conversation.isArchived ? (
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
                <DropdownMenuItem onClick={() => onMute(!conversation.isMuted)}>
                  {conversation.isMuted ? (
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={unifiedMessages}
          currentUserId={currentUserId}
          isLoading={isLoading || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onToggleReaction={handleReaction}
          renderMessageExtras={renderMessageExtras}
          renderMessageActions={renderMessageActions}
          variant="dm"
        />
      </div>

      <div className="p-4 border-t border-muted/40 shrink-0">
        <div className="w-full rounded-lg border border-muted/40 bg-background shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
          <RichComposer
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={!conversation || isSending}
            placeholder={`Message ${conversation.otherParticipantName}...`}
            participants={[]}
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button onClick={handleSend} disabled={!inputValue.trim() || isSending} size="sm">
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
