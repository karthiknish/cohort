'use client'

import { ChevronDown, FileText, Lock, Settings2, Users } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment } from '@/types/collaboration'

import type { Channel } from '../types'
import { getInitials } from '../utils'

type CollaborationSidebarContentProps = {
  channel: Channel | null
  channelParticipants: ClientTeamMember[]
  sharedFiles: CollaborationAttachment[]
  canManageMembers?: boolean
  onManageMembers?: () => void
}

export function CollaborationSidebarMobileHeader({
  collapseId,
  onToggle,
  open,
}: {
  collapseId: string
  onToggle: () => void
  open: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-muted/40 p-4 lg:hidden">
      <p className="text-sm font-medium text-foreground">Workspace info</p>
      <Button variant="ghost" size="icon" onClick={onToggle} aria-expanded={open} aria-controls={collapseId} aria-label={open ? 'Collapse workspace info' : 'Expand workspace info'}>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : '')} />
        <span className="sr-only">Toggle workspace info</span>
      </Button>
    </div>
  )
}

export function CollaborationSidebarChannelCard({
  canManageMembers,
  channel,
  onManageMembers,
}: {
  canManageMembers?: boolean
  channel: Channel | null
  onManageMembers?: () => void
}) {
  if (!channel) return null

  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">#{channel.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground/75">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1">
              {channel.isCustom ? 'Custom channel' : `${channel.type} channel`}
            </span>
            {channel.isCustom ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1">
                {channel.visibility === 'private' ? <Lock className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                {channel.visibility === 'private' ? 'Private' : 'Public'}
              </span>
            ) : null}
          </div>
        </div>

        {channel.isCustom && canManageMembers && onManageMembers ? (
          <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={onManageMembers}>
            <Settings2 className="h-4 w-4" />
            Manage
          </Button>
        ) : null}
      </div>

      {channel.description ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{channel.description}</p> : null}
    </div>
  )
}

export function CollaborationSidebarRosterSection({
  channel,
  channelParticipants,
}: {
  channel: Channel | null
  channelParticipants: ClientTeamMember[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-muted/20 pb-2.5">
        <div className="h-2 w-2 rounded-full bg-primary/60" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Workspace Roster</p>
      </div>
      {channel ? (
        channelParticipants.length > 0 ? (
          <div className="space-y-4">
            {channelParticipants.map((participant) => (
              <div key={participant.name} className="group flex items-center gap-3 px-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-muted/60 bg-background text-xs font-bold text-foreground shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] group-hover:border-primary/40 group-hover:bg-primary/5 motion-reduce:transition-none">
                  {getInitials(participant.name)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold leading-tight text-foreground">{participant.name}</span>
                  <span className="truncate text-[11px] font-medium uppercase tracking-tight text-muted-foreground/60">
                    {participant.role || 'Teammate'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-1 text-xs italic text-muted-foreground/60">No teammates added yet.</p>
        )
      ) : (
        <p className="px-1 text-xs italic text-muted-foreground/60">Select a channel to view its roster.</p>
      )}
    </div>
  )
}

export function CollaborationSidebarAssetLibrarySection({ sharedFiles }: { sharedFiles: CollaborationAttachment[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-muted/20 pb-2.5">
        <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Asset Library</p>
      </div>
      {sharedFiles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No shared files yet"
          description="Files shared in messages will appear here automatically."
          variant="inline"
          className="rounded-lg border-dashed bg-muted/10 px-3 py-3 [&_p:last-child]:text-xs"
        />
      ) : (
        <div className="space-y-2.5">
          {sharedFiles.map((file) => (
            <a key={`${file.url}-${file.name}`} href={file.url} target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] group-hover:border-primary/30 group-hover:shadow-md motion-reduce:transition-none">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">{file.name}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export function CollaborationSidebarContent({
  channel,
  channelParticipants,
  sharedFiles,
  canManageMembers = false,
  onManageMembers,
}: CollaborationSidebarContentProps) {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-y-auto bg-muted/5 p-6 text-sm text-muted-foreground">
      <CollaborationSidebarChannelCard channel={channel} canManageMembers={canManageMembers} onManageMembers={onManageMembers} />
      <CollaborationSidebarRosterSection channel={channel} channelParticipants={channelParticipants} />
      <CollaborationSidebarAssetLibrarySection sharedFiles={sharedFiles} />
    </div>
  )
}