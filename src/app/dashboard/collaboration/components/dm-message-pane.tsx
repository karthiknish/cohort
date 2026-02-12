'use client'

import { useRef, useEffect, useState } from 'react'
import { 
  Send, MoreVertical, Archive, BellOff, Bell, ArchiveRestore, 
  Smile, Share2, Mail
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { COLLABORATION_REACTIONS } from '@/constants/collaboration-reactions'
import { useToast } from '@/components/ui/use-toast'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'

const REACTIONS = COLLABORATION_REACTIONS.map((emoji) => ({
  emoji,
  label: emoji,
}))

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

function formatTime(ms: number): string {
  const date = new Date(ms)
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ms: number): string {
  const date = new Date(ms)
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function groupMessagesByDate(messages: DirectMessage[]): Map<string, DirectMessage[]> {
  const groups = new Map<string, DirectMessage[]>()
  
  for (const message of messages) {
    if (message.deleted) continue
    const dateKey = formatDate(message.createdAtMs)
    const existing = groups.get(dateKey) ?? []
    existing.push(message)
    groups.set(dateKey, existing)
  }
  
  return groups
}

interface DMMessagePaneProps {
  conversation: DirectConversation | null
  messages: DirectMessage[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
  onToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  onArchive: (archived: boolean) => Promise<void>
  onMute: (muted: boolean) => Promise<void>
  currentUserId: string | null
  onShareToPlatform?: (message: DirectMessage, platform: 'slack' | 'teams' | 'whatsapp' | 'email') => Promise<void>
}

export function DMMessagePane({
  conversation,
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  onSendMessage,
  isSending,
  onToggleReaction,
  onArchive,
  onMute,
  currentUserId,
  onShareToPlatform,
}: DMMessagePaneProps) {
  const [inputValue, setInputValue] = useState('')
  const [sharingTo, setSharingTo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const groupedMessages = conversation ? groupMessagesByDate(messages) : new Map()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content || isSending) return
    
    setInputValue('')
    await onSendMessage(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

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

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center border-muted/40 lg:h-[640px]">
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
    <div className="flex-1 flex flex-col border-muted/40 lg:h-[640px]">
      <div className="p-4 border-b border-muted/40">
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

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {hasMore && (
          <div className="flex justify-center pb-4">
            <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={isLoading}>
              Load older messages
            </Button>
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn('flex gap-2', i % 2 === 0 && 'justify-end')}>
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-16 w-48 bg-muted animate-pulse rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {date}
                  </span>
                  <Separator className="flex-1" />
                </div>
                
                <div className="space-y-3">
                  {msgs.map((message: DirectMessage) => {
                    const isOwn = message.senderId === currentUserId
                    
                    return (
                      <div
                        key={message.legacyId}
                        className={cn('flex gap-2 group', isOwn && 'flex-row-reverse')}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={cn(
                            'text-xs',
                            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}>
                            {getInitials(message.senderName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
                          <div className={cn(
                            'rounded-lg px-3 py-2',
                            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          
                          <div className={cn(
                            'flex items-center gap-1 mt-1',
                            isOwn && 'justify-end'
                          )}>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTime(message.createdAtMs)}
                            </span>
                            {message.edited && (
                              <span className="text-[10px] text-muted-foreground">(edited)</span>
                            )}
                          </div>
                          
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.reactions.map((reaction: { emoji: string; count: number; userIds: string[] }) => (
                                <button
                                  key={reaction.emoji}
                                  type="button"
                                  onClick={() => onToggleReaction(message.legacyId, reaction.emoji)}
                                  className={cn(
                                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs',
                                    reaction.userIds.includes(currentUserId ?? '')
                                      ? 'bg-primary/10 border border-primary/20'
                                      : 'bg-muted'
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-muted-foreground">{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {message.sharedTo && message.sharedTo.length > 0 && (
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
                                      <p>Shared to {PLATFORM_CONFIG[platform]?.label || platform}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Smile className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {REACTIONS.slice(0, 8).map((reaction) => (
                                  <DropdownMenuItem
                                    key={reaction.emoji}
                                    onClick={() => onToggleReaction(message.legacyId, reaction.emoji)}
                                  >
                                    <span className="mr-2">{reaction.emoji}</span>
                                    {reaction.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
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
                                    disabled={sharingTo === `${message.legacyId}-slack`}
                                  >
                                    <SlackIcon className="h-4 w-4 mr-2" />
                                    Share to Slack
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleShare(message, 'teams')}
                                    disabled={sharingTo === `${message.legacyId}-teams`}
                                  >
                                    <TeamsIcon className="h-4 w-4 mr-2" />
                                    Share to Teams
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleShare(message, 'whatsapp')}
                                    disabled={sharingTo === `${message.legacyId}-whatsapp`}
                                  >
                                    <WhatsAppIcon className="h-4 w-4 mr-2" />
                                    Share to WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleShare(message, 'email')}
                                    disabled={sharingTo === `${message.legacyId}-email`}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Share via Email
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-4 border-t border-muted/40">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${conversation.otherParticipantName}...`}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!inputValue.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
