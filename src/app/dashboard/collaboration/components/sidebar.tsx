'use client'

import { ChevronDown, FileText } from 'lucide-react'
import { useId, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment } from '@/types/collaboration'

import type { Channel } from '../types'
import { cn } from '@/lib/utils'
import { getInitials } from '../utils'

interface CollaborationSidebarProps {
  channel: Channel | null
  channelParticipants: ClientTeamMember[]
  sharedFiles: CollaborationAttachment[]
}

export function CollaborationSidebar({ channel, channelParticipants, sharedFiles }: CollaborationSidebarProps) {
  const collapseId = useId()
  const [open, setOpen] = useState(true)

  const Content = () => (
    <div className="flex w-full flex-col gap-6 p-4 text-sm text-muted-foreground">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Participants</p>
        {channel ? (
          channelParticipants.length > 0 ? (
            <div className="space-y-2">
              {channelParticipants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
                    {getInitials(participant.name)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{participant.name}</span>
                    {participant.role && <span className="text-xs text-muted-foreground">{participant.role}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No teammates added yet.</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Select a channel to view its roster.</p>
        )}
      </div>

      <Separator className="lg:hidden" />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Shared files</p>
        {sharedFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Files shared in messages will appear here automatically.</p>
        ) : (
          sharedFiles.map((file) => (
            <Card key={`${file.url}-${file.name}`} className="border-muted/40 bg-muted/10">
              <CardContent className="flex items-center gap-2 p-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-foreground hover:underline"
                >
                  {file.name}
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="border-t border-muted/40 lg:relative lg:h-[640px] lg:w-64 lg:border-t-0">
      <div className="flex items-center justify-between border-b border-muted/40 p-4 lg:hidden">
        <p className="text-sm font-medium text-foreground">Workspace info</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={collapseId}
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : '')} />
          <span className="sr-only">Toggle workspace info</span>
        </Button>
      </div>
      <div
        className={cn(
          'grid overflow-hidden border-muted/40 transition-[grid-template-rows] duration-300 lg:hidden',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={collapseId}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <Content />
        </div>
      </div>
      <div className="hidden h-full lg:flex lg:flex-col lg:border-l lg:border-muted/40">
        <Content />
      </div>
    </div>
  )
}
