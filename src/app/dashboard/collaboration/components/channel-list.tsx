'use client'

import { Search } from 'lucide-react'
import type { ChangeEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import type { ChannelSummary } from '../hooks/use-collaboration-data'
import type { Channel } from '../types'
import { CHANNEL_TYPE_COLORS, formatRelativeTime } from '../utils'

interface CollaborationChannelListProps {
  channels: Channel[]
  filteredChannels: Channel[]
  selectedChannel: Channel | null
  onSelectChannel: (channelId: string) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  channelSummaries: Map<string, ChannelSummary>
}

export function CollaborationChannelList({
  channels,
  filteredChannels,
  selectedChannel,
  onSelectChannel,
  searchQuery,
  onSearchQueryChange,
  channelSummaries,
}: CollaborationChannelListProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchQueryChange(event.target.value)
  }

  return (
    <div className="flex h-full w-full flex-col border-b border-muted/40 lg:h-[640px] lg:w-80 lg:border-b-0 lg:border-r">
      <div className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={handleSearchChange} placeholder="Search channels…" className="pl-9" />
        </div>
      </div>
      <Separator className="lg:hidden" />
      <ScrollArea className="flex-1">
        {channels.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Add a client to create your first collaboration channel.</p>
        ) : filteredChannels.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No channels match your search.</p>
        ) : (
          <div className="space-y-2 p-3">
            {filteredChannels.map((channel) => {
              const summary = channelSummaries.get(channel.id)
              const isSelected = selectedChannel?.id === channel.id
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    'flex w-full flex-col gap-1.5 rounded-lg border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                    isSelected
                      ? 'border-primary/20 bg-primary/5 shadow-sm'
                      : 'border-transparent hover:bg-muted/50 hover:border-muted/40'
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className={cn("truncate text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>
                      {channel.name}
                    </span>
                    {summary?.lastTimestamp && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelativeTime(summary.lastTimestamp)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-normal", CHANNEL_TYPE_COLORS[channel.type])}>
                        {channel.type}
                      </Badge>
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground/80 mt-0.5">
                    {summary?.lastMessage ?? 'No messages yet'}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
