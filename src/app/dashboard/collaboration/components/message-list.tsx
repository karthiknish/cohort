'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { LoaderCircle, RefreshCw, Smile } from 'lucide-react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { CollaborationMessage, CollaborationMention } from '@/types/collaboration'

export interface UnifiedMessage {
  id: string
  senderId: string | null
  senderName: string
  senderRole?: string | null
  content: string
  createdAtMs: number
  edited?: boolean
  deleted?: boolean
  reactions?: Array<{ emoji: string; count: number; userIds: string[] }>
  attachments?: Array<{ url: string; name?: string; mimeType?: string; size?: number }>
  sharedTo?: string[]
  // Channel-specific fields
  mentions?: CollaborationMention[]
  threadRootId?: string | null
  threadReplyCount?: number
  threadLastReplyAt?: string | null
  isPinned?: boolean
  deletedBy?: string | null
  deletedAt?: string | null
}

/**
 * Convert a CollaborationMessage (channel message) to UnifiedMessage format
 */
export function collaborationToUnifiedMessage(msg: CollaborationMessage): UnifiedMessage {
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    content: msg.content ?? '',
    createdAtMs: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
    edited: msg.isEdited,
    deleted: msg.isDeleted,
    reactions: msg.reactions ?? undefined,
    attachments: msg.attachments?.map(a => ({
      url: a.url,
      name: a.name,
      mimeType: a.type ?? undefined,
      size: a.size ? parseInt(a.size, 10) : undefined,
    })) ?? undefined,
    sharedTo: msg.sharedTo ?? undefined,
    mentions: msg.mentions ?? undefined,
    threadRootId: msg.threadRootId ?? undefined,
    threadReplyCount: msg.threadReplyCount ?? undefined,
    threadLastReplyAt: msg.threadLastReplyAt ?? undefined,
    isPinned: msg.isPinned,
    deletedBy: msg.deletedBy ?? undefined,
    deletedAt: msg.deletedAt ?? undefined,
  }
}

export interface MessageListProps {
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  renderMessageExtras?: (message: UnifiedMessage) => React.ReactNode
  renderMessageActions?: (message: UnifiedMessage) => React.ReactNode
  renderMessageContent?: (message: UnifiedMessage) => React.ReactNode
  renderMessageAttachments?: (message: UnifiedMessage) => React.ReactNode
  renderMessageFooter?: (message: UnifiedMessage) => React.ReactNode
  renderThreadSection?: (message: UnifiedMessage) => React.ReactNode
  renderEditForm?: (message: UnifiedMessage) => React.ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => React.ReactNode
  renderMessageWrapper?: (message: UnifiedMessage, children: React.ReactNode) => React.ReactNode
  emptyState?: React.ReactNode
  loadingSkeleton?: React.ReactNode
  variant?: 'channel' | 'dm'
  showAvatars?: boolean
  compact?: boolean
  // Channel-specific callbacks
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReply?: (message: UnifiedMessage) => void
  onCreateTask?: (message: UnifiedMessage) => void
  // Pull to refresh
  onRefresh?: () => Promise<void> | void
  // State for editing/deleting
  editingMessageId?: string | null
  deletingMessageId?: string | null
  updatingMessageId?: string | null
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

function groupMessagesByDate(messages: UnifiedMessage[]): Map<string, UnifiedMessage[]> {
  const groups = new Map<string, UnifiedMessage[]>()
  const seenIds = new Set<string>()
  
  for (const message of messages) {
    if (message.deleted) continue
    if (seenIds.has(message.id)) continue
    seenIds.add(message.id)
    
    const dateKey = formatDate(message.createdAtMs)
    const existing = groups.get(dateKey) ?? []
    existing.push(message)
    groups.set(dateKey, existing)
  }
  
  return groups
}

export function MessageList({
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  hasMore,
  onLoadMore,
  onToggleReaction,
  reactionPendingByMessage = {},
  renderMessageExtras,
  renderMessageActions,
  renderMessageContent,
  renderMessageAttachments,
  renderMessageFooter,
  renderThreadSection,
  renderEditForm,
  renderDeletedInfo,
  renderMessageWrapper,
  emptyState,
  loadingSkeleton,
  variant = 'dm',
  showAvatars = true,
  compact = false,
  onEditMessage,
  onDeleteMessage,
  onReply,
  onCreateTask,
  onRefresh,
  editingMessageId,
  deletingMessageId,
  updatingMessageId,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prependSnapshotRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null)
  const loadingOlderRef = useRef(false)
  const previousEdgeRef = useRef<{ firstId: string | null; lastId: string | null }>({
    firstId: null,
    lastId: null,
  })
  const shouldStickToBottomRef = useRef(true)
  const hasAutoScrolledInitiallyRef = useRef(false)
  const [localReactionPending, setLocalReactionPending] = useState<string | null>(null)

  const sortedMessages = useMemo(() => 
    [...messages].sort((a, b) => a.createdAtMs - b.createdAtMs),
    [messages]
  )
  
  const groupedMessages = useMemo(() => 
    groupMessagesByDate(sortedMessages),
    [sortedMessages]
  )

  const requestLoadOlder = useCallback(() => {
    const container = scrollRef.current
    if (!container || !hasMore || isLoading || loadingOlderRef.current) {
      return
    }

    prependSnapshotRef.current = {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
    }
    loadingOlderRef.current = true
    onLoadMore()
  }, [hasMore, isLoading, onLoadMore])

  useEffect(() => {
    // Release load-more guard if a load cycle ends without message changes.
    if (!isLoading && loadingOlderRef.current && prependSnapshotRef.current) {
      loadingOlderRef.current = false
      prependSnapshotRef.current = null
    }
  }, [isLoading])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const firstId = sortedMessages[0]?.id ?? null
    const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null
    const lastId = lastMessage ? lastMessage.id : null
    const previousFirst = previousEdgeRef.current.firstId
    const previousLast = previousEdgeRef.current.lastId

    if (prependSnapshotRef.current) {
      const snapshot = prependSnapshotRef.current
      const delta = container.scrollHeight - snapshot.scrollHeight
      container.scrollTop = snapshot.scrollTop + delta
      prependSnapshotRef.current = null
      loadingOlderRef.current = false
    } else if (!hasAutoScrolledInitiallyRef.current && sortedMessages.length > 0) {
      container.scrollTop = container.scrollHeight
      shouldStickToBottomRef.current = true
      hasAutoScrolledInitiallyRef.current = true
    } else {
      const conversationSwitched =
        previousFirst !== null &&
        previousLast !== null &&
        firstId !== null &&
        lastId !== null &&
        previousFirst !== firstId &&
        previousLast !== lastId

      const appendedAtBottom =
        previousLast !== null &&
        previousFirst === firstId &&
        previousLast !== lastId

      if ((conversationSwitched || appendedAtBottom) && shouldStickToBottomRef.current) {
        container.scrollTop = container.scrollHeight
      }
    }

    previousEdgeRef.current = { firstId, lastId }
  }, [sortedMessages])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
    shouldStickToBottomRef.current = distanceFromBottom < 80
    
    if (container.scrollTop < 64) {
      requestLoadOlder()
    }
  }, [requestLoadOlder])

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    const key = `${messageId}-${emoji}`
    if (localReactionPending) return
    setLocalReactionPending(key)
    await onToggleReaction(messageId, emoji).catch(() => undefined)
    setLocalReactionPending(null)
  }, [localReactionPending, onToggleReaction])

  const isChannel = variant === 'channel'

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {loadingSkeleton || (
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
        )}
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {emptyState || (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto min-h-0 relative"
    >
      <div className={cn('p-4', isChannel && 'space-y-4')}>
        {hasMore && (
          <div className="flex justify-center pb-4">
            <Button variant="ghost" size="sm" onClick={requestLoadOlder} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Load older messages
                </>
              )}
            </Button>
          </div>
        )}

        <div className={cn('space-y-6', isChannel && 'space-y-1')}>
          {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground font-medium">
                  {date}
                </span>
                <Separator className="flex-1" />
              </div>
              
              <div className={cn('space-y-3', isChannel && 'space-y-1')}>
                {msgs.map((message) => {
                  const isOwn = message.senderId === currentUserId
                  const isPendingThis = localReactionPending?.startsWith(message.id) || 
                    reactionPendingByMessage[message.id]
                  const isEditing = editingMessageId === message.id
                  const isDeleting = deletingMessageId === message.id
                  const isUpdating = updatingMessageId === message.id
                  const canManage = !message.deleted && 
                    ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')
                  
                  if (isChannel) {
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "group relative flex items-start gap-3 px-6 py-2.5 transition-all duration-200",
                          !message.deleted && "hover:bg-muted/5"
                        )}
                      >
                        {showAvatars && (
                          <div className="shrink-0 pt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">
                                {getInitials(message.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{message.senderName}</span>
                            {message.senderRole && (
                              <span className="text-xs text-muted-foreground">({message.senderRole})</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.createdAtMs)}
                            </span>
                            {message.edited && !message.deleted && (
                              <span className="text-xs text-muted-foreground">(edited)</span>
                            )}
                          </div>
                          
                          {/* Message content, edit form, or deleted info */}
                          {isEditing && renderEditForm ? (
                            renderEditForm(message)
                          ) : message.deleted ? (
                            renderDeletedInfo ? (
                              renderDeletedInfo(message)
                            ) : (
                              <p className="text-sm italic text-muted-foreground">Message removed</p>
                            )
                          ) : (
                            <>
                              {renderMessageContent ? (
                                renderMessageContent(message)
                              ) : (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              )}
                              
                              {renderMessageAttachments?.(message)}
                            </>
                          )}
                          
                          {/* Reactions (not shown when editing or deleted) */}
                          {!isEditing && !message.deleted && message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.reactions.map((reaction) => {
                                const isPending = localReactionPending === `${message.id}-${reaction.emoji}` ||
                                  reactionPendingByMessage[message.id] === reaction.emoji
                                
                                return (
                                  <button
                                    key={reaction.emoji}
                                    type="button"
                                    onClick={() => handleReaction(message.id, reaction.emoji)}
                                    disabled={!!isPendingThis || isDeleting || isUpdating}
                                    className={cn(
                                      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all',
                                      reaction.userIds.includes(currentUserId ?? '')
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'bg-muted hover:bg-muted/80'
                                    )}
                                  >
                                    {isPending ? (
                                      <LoaderCircle className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <span>{reaction.emoji}</span>
                                    )}
                                    <span className="text-muted-foreground">{reaction.count}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                          
                          {renderMessageExtras?.(message)}
                          
                          {/* Thread section for channel messages */}
                          {!isEditing && !message.deleted && renderThreadSection?.(message)}
                          
                          {renderMessageFooter?.(message)}
                        </div>
                        
                        {/* Action buttons (not shown when editing or deleted) */}
                        {!isEditing && !message.deleted && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isDeleting || isUpdating}>
                                  <Smile className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <EmojiPicker
                                  onEmojiClick={(emojiData: EmojiClickData) => {
                                    handleReaction(message.id, emojiData.emoji)
                                  }}
                                  theme={Theme.LIGHT}
                                  width={300}
                                  height={350}
                                />
                              </PopoverContent>
                            </Popover>
                            
                            {renderMessageActions?.(message)}
                          </div>
                        )}
                        
                        {/* Deleting overlay */}
                        {isDeleting && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                            <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )
                  }

                  const messageContent = (
                    <div
                      key={message.id}
                      className={cn('flex gap-2 group', isOwn && 'justify-end')}
                    >
                      {showAvatars && !isOwn && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(message.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn('max-w-[70%] flex flex-col', isOwn && 'items-end')}>
                        <div className={cn(
                          'rounded-lg px-3 py-2',
                          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                          {renderMessageContent ? (
                            renderMessageContent(message)
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}
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
                        
                        {renderMessageAttachments?.(message)}
                        
                        {message.reactions && message.reactions.length > 0 && (
                          <div className={cn('flex flex-wrap gap-1 mt-1', isOwn && 'justify-end')}>
                            {message.reactions.map((reaction) => {
                              const isPending = localReactionPending === `${message.id}-${reaction.emoji}` ||
                                reactionPendingByMessage[message.id] === reaction.emoji
                              
                              return (
                                <button
                                  key={reaction.emoji}
                                  type="button"
                                  onClick={() => handleReaction(message.id, reaction.emoji)}
                                  disabled={!!isPendingThis}
                                  className={cn(
                                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all',
                                    reaction.userIds.includes(currentUserId ?? '')
                                      ? 'bg-primary/10 border border-primary/20'
                                      : 'bg-muted hover:bg-muted/80'
                                  )}
                                >
                                  {isPending ? (
                                    <LoaderCircle className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span>{reaction.emoji}</span>
                                  )}
                                  <span className="text-muted-foreground">{reaction.count}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                        
                        {renderMessageExtras?.(message)}
                        {renderMessageFooter?.(message)}
                        
                        <div className={cn('flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity', isOwn && 'justify-end')}>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Smile className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <EmojiPicker
                                onEmojiClick={(emojiData: EmojiClickData) => {
                                  handleReaction(message.id, emojiData.emoji)
                                }}
                                theme={Theme.LIGHT}
                                width={300}
                                height={350}
                              />
                            </PopoverContent>
                          </Popover>
                          
                          {renderMessageActions?.(message)}
                        </div>
                      </div>
                      
                      {showAvatars && isOwn && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {getInitials(message.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )
                  
                  return renderMessageWrapper 
                    ? renderMessageWrapper(message, messageContent)
                    : messageContent
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
