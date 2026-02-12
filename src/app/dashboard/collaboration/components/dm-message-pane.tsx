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
  DropdownMenuSeparator,
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
  onShareToPlatform?: (message: DirectMessage, platform: 'slack' | 'teams' | 'whatsapp' | 'email') => Promise<void>
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

  const handleShare = async (message: DirectMessage, platform: 'slack' | 'teams' | 'whatsapp' | 'email') => {
    if (!onShareToPlatform) return
    
    setSharingTo(`${message.legacyId}-${platform}`)
    try {
      await onShareToPlatform(message, platform)
      toast({
        title: 'Message shared',
        description: `Sent to ${PLATFORM_CONFIG[platform].label}`,
      })
    } catch (error) {
      toast({
        title: 'Share failed',
        description: `Could not send to ${PLATFORM_CONFIG[platform].label}`,
        variant: 'destructive',
      })
    } finally {
      setSharingTo(null)
    }
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
                  {platform === 'slack' && <SlackIcon className="h-3 w-3" />}
                  {platform === 'teams' && <TeamsIcon className="h-3 w-3" />}
                  {platform === 'whatsapp' && <WhatsAppIcon className="h-3 w-3" />}
                  {platform === 'email' && <Mail className="h-3 w-3" />}
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
            onClick={() => handleShare(originalMsg, 'slack')}
            disabled={sharingTo === `${message.id}-slack`}
          >
            <SlackIcon className="h-4 w-4 mr-2" />
            Share to Slack
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleShare(originalMsg, 'teams')}
            disabled={sharingTo === `${message.id}-teams`}
          >
            <TeamsIcon className="h-4 w-4 mr-2" />
            Share to Teams
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleShare(originalMsg, 'whatsapp')}
            disabled={sharingTo === `${message.id}-whatsapp`}
          >
            <WhatsAppIcon className="h-4 w-4 mr-2" />
            Share to WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
