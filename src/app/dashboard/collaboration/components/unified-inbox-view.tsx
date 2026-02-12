'use client'

import { useState, useMemo } from 'react'
import { 
  Search, Inbox, MessageSquare, Mail, 
  Hash, MessageCircle, Filter, Archive
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useQuery } from 'convex/react'
import { api } from '@/lib/convex-api'

type SourceFilter = 'all' | 'direct_message' | 'channel' | 'whatsapp' | 'slack' | 'teams' | 'email'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  direct_message: <MessageCircle className="h-4 w-4" />,
  channel: <Hash className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  slack: <MessageSquare className="h-4 w-4" />,
  teams: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
}

const SOURCE_LABELS: Record<string, string> = {
  direct_message: 'Direct Messages',
  channel: 'Channels',
  whatsapp: 'WhatsApp',
  slack: 'Slack',
  teams: 'Teams',
  email: 'Email',
}

interface UnifiedInboxViewProps {
  workspaceId: string | null
  currentUserId: string | null
}

export function UnifiedInboxView({ workspaceId, currentUserId }: UnifiedInboxViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [showArchived, setShowArchived] = useState(false)

  const inboxItems = useQuery(
    (api as any).inboxItems.listInboxItems,
    workspaceId ? { 
      workspaceId, 
      sourceType: sourceFilter === 'all' ? undefined : sourceFilter,
      includeArchived: showArchived,
    } : 'skip'
  )

  const unreadCounts = useQuery(
    (api as any).inboxItems.getUnreadCounts,
    workspaceId ? { workspaceId } : 'skip'
  )

  const filteredItems = useMemo(() => {
    if (!inboxItems?.items) return []
    
    return inboxItems.items.filter((item: any) => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        item.sourceName?.toLowerCase().includes(query) ||
        item.lastMessageSnippet?.toLowerCase().includes(query) ||
        item.otherParticipantName?.toLowerCase().includes(query)
      )
    })
  }, [inboxItems, searchQuery])

  const formatRelativeTime = (ms: number | null | undefined): string => {
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

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const totalUnread = unreadCounts?.total ?? 0

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[500px]">
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-muted/40 flex flex-col">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Unified Inbox</h3>
              {totalUnread > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-xs">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={cn(showArchived && 'text-primary')}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archived
            </Button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all conversations..."
              className="pl-9"
            />
          </div>

          <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
            <TabsList className="w-full bg-muted/50 h-auto flex-wrap">
              <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
              <TabsTrigger value="direct_message" className="flex-1 text-xs">DMs</TabsTrigger>
              <TabsTrigger value="channel" className="flex-1 text-xs">Channels</TabsTrigger>
              <TabsTrigger value="email" className="flex-1 text-xs">Email</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredItems.map((item: any) => {
                const hasUnread = !item.isRead || item.unreadCount > 0
                
                return (
                  <button
                    key={item.legacyId}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                      'hover:bg-muted/50',
                      hasUnread && 'bg-muted/30'
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={cn(
                        'text-xs font-medium',
                        hasUnread && 'bg-primary/10 text-primary'
                      )}>
                        {getInitials(item.otherParticipantName || item.sourceName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          'truncate text-sm',
                          hasUnread ? 'font-semibold' : 'font-medium'
                        )}>
                          {item.otherParticipantName || item.sourceName}
                        </span>
                        {item.lastMessageAtMs && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatRelativeTime(item.lastMessageAtMs)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          {SOURCE_LABELS[item.sourceType] || item.sourceType}
                        </Badge>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.lastMessageSnippet || 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    {hasUnread && (
                      <div className="flex items-center gap-1 shrink-0">
                        {item.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 px-1.5 text-xs">
                            {item.unreadCount}
                          </Badge>
                        )}
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <Inbox className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Choose a conversation from the sidebar to view messages across all your connected platforms
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <Badge key={key} variant="outline" className="gap-1.5">
                {SOURCE_ICONS[key]}
                {label}
                {unreadCounts?.bySource?.[key] > 0 && (
                  <span className="text-primary font-semibold">
                    {unreadCounts.bySource[key]}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
