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
                <Button
                  key={channel.id}
                  type="button"
                  variant="ghost"
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    'h-auto w-full justify-start rounded-lg border border-transparent bg-transparent px-3 py-3 text-left shadow-none transition hover:bg-muted',
                    isSelected && 'border-primary/40 bg-muted',
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{channel.name}</p>
                        <Badge variant="outline" className={CHANNEL_TYPE_COLORS[channel.type]}>
                          {channel.type}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {summary?.lastMessage ?? 'No messages yet'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {summary?.lastTimestamp ? formatRelativeTime(summary.lastTimestamp) : ''}
                      </span>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
