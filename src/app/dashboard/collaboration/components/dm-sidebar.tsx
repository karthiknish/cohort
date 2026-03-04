'use client'

import { Search, Plus, MessageCircle, Archive, BellOff } from 'lucide-react'
import { useState, useMemo, type ChangeEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import type { DirectConversation } from '../hooks/use-direct-messages'

function formatRelativeTime(ms: number | null | undefined): string {
  if (!ms) return ''
  const date = new Date(ms)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface DMSidebarProps {
  conversations: DirectConversation[]
  selectedConversation: DirectConversation | null
  onSelectConversation: (conversation: DirectConversation) => void
  isLoading: boolean
  unreadCount: number
  onNewDM: () => void
}

export function DMSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  unreadCount,
  onNewDM,
}: DMSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const query = searchQuery.toLowerCase()
    return conversations.filter((c) =>
      c.otherParticipantName.toLowerCase().includes(query)
    )
  }, [conversations, searchQuery])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  return (
    <div className="flex h-full w-full flex-col border-b border-muted/40 lg:h-[640px] lg:w-80 lg:border-b-0 lg:border-r">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Direct Messages</h3>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewDM}
            title="New message"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {['dm-skeleton-1', 'dm-skeleton-2', 'dm-skeleton-3'].map((slotKey) => (
              <div key={slotKey} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations match your search.' : 'No direct messages yet.'}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onNewDM}>
              <Plus className="h-4 w-4 mr-1" />
              Start a conversation
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversation?.legacyId === conversation.legacyId
              const hasUnread = !conversation.isRead

              return (
                <button
                  key={conversation.legacyId}
                  type="button"
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                    'hover:bg-muted/50',
                    isSelected && 'bg-primary/5 border border-primary/20',
                    hasUnread && !isSelected && 'bg-muted/30'
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={cn(
                      'text-xs font-medium',
                      hasUnread && 'bg-primary/10 text-primary'
                    )}>
                      {getInitials(conversation.otherParticipantName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        'truncate text-sm',
                        hasUnread ? 'font-semibold' : 'font-medium',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {conversation.otherParticipantName}
                      </span>
                      {conversation.lastMessageAtMs && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatRelativeTime(conversation.lastMessageAtMs)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conversation.isArchived && (
                        <Archive className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      {conversation.isMuted && (
                        <BellOff className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      <p className={cn(
                        'truncate text-xs',
                        hasUnread ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {conversation.lastMessageSnippet ?? 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {hasUnread && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
