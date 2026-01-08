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
    <div className="flex w-full flex-col gap-8 p-6 text-sm text-muted-foreground bg-muted/5 h-full overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-muted/20">
          <div className="h-2 w-2 rounded-full bg-primary/60" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Workspace Roster</p>
        </div>
        {channel ? (
          channelParticipants.length > 0 ? (
            <div className="space-y-4">
              {channelParticipants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-3 group px-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-muted/60 text-xs font-bold text-foreground shadow-sm group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-200">
                    {getInitials(participant.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-foreground truncate leading-tight">{participant.name}</span>
                    <span className="text-[11px] font-medium text-muted-foreground/60 truncate uppercase tracking-tight">
                      {participant.role || 'Teammate'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic px-1">No teammates added yet.</p>
          )
        ) : (
          <p className="text-xs text-muted-foreground/60 italic px-1">Select a channel to view its roster.</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-muted/20">
          <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Asset Library</p>
        </div>
        {sharedFiles.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 italic px-1 leading-relaxed">Files shared in messages will appear here automatically.</p>
        ) : (
          <div className="space-y-2.5">
            {sharedFiles.map((file) => (
              <a
                key={`${file.url}-${file.name}`}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="border-muted/40 bg-background shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all duration-200 overflow-hidden">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {file.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
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
