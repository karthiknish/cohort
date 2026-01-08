'use client'

import type { ChangeEvent } from 'react'
import Link from 'next/link'
import { Download, MessageSquare, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'
import type { Channel } from '../types'
import { CHANNEL_TYPE_COLORS } from '../utils'

export interface MessagePaneHeaderProps {
  channel: Channel
  channelParticipants: ClientTeamMember[]
  messageCount: number
  onExport: () => void
}

export function MessagePaneHeader({
  channel,
  channelParticipants,
  messageCount,
  onExport,
}: MessagePaneHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-muted/40 bg-background/60 p-5 backdrop-blur-md sticky top-0 z-20">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-sm border border-primary/10">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold tracking-tight text-foreground">{channel.name}</h2>
              <Badge
                variant="outline"
                className={cn(
                  'h-5 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider',
                  CHANNEL_TYPE_COLORS[channel.type]
                )}
              >
                {channel.type}
              </Badge>
              {channel.clientId && (
                <Link href={`/dashboard/clients?clientId=${channel.clientId}`}>
                  <Badge
                    variant="secondary"
                    className="h-5 cursor-pointer border-none bg-muted/50 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition-colors shadow-none"
                  >
                    Client
                  </Badge>
                </Link>
              )}
            </div>
            <p className="truncate text-xs font-medium text-muted-foreground/70">
              {channelParticipants.length} people · {channelParticipants.map((member) => member.name).slice(0, 3).join(', ')}{channelParticipants.length > 3 ? '...' : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          disabled={messageCount === 0}
          className="h-9 px-3 text-xs font-semibold gap-2 border border-muted/40 hover:bg-muted/60"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}

export interface MessageSearchBarProps {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  resultCount: number
  isActive: boolean
}

export function MessageSearchBar({
  value,
  onChange,
  resultCount,
  isActive,
}: MessageSearchBarProps) {
  return (
    <div className="border-b border-muted/40 bg-muted/5 px-4 py-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={onChange}
          placeholder="Search messages in this channel…"
          className="pl-9 pr-20"
        />
        {isActive && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>
    </div>
  )
}

export function EmptyChannelState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <div className="mb-4 rounded-full bg-muted/30 p-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No channel selected</h3>
      <p className="max-w-sm text-sm">
        Select a channel from the list to view messages, or start a new conversation with your
        team.
      </p>
    </div>
  )
}

export function EmptyMessagesState() {
  return (
    <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      Start the conversation by posting the first update for this workspace.
    </div>
  )
}

export function NoSearchResultsState() {
  return (
    <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      No messages match your search.
    </div>
  )
}

export interface MessagesErrorStateProps {
  error: string
}

export function MessagesErrorState({ error }: MessagesErrorStateProps) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      {error}
    </div>
  )
}

export interface DateSeparatorProps {
  label: string
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-muted/40" />
      </div>
      <div className="relative flex justify-center text-xs font-medium uppercase text-muted-foreground">
        <span className="bg-background px-2">{label}</span>
      </div>
    </div>
  )
}
