'use client'

import { useId, useState } from 'react'

import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment } from '@/types/collaboration'

import type { Channel } from '../types'
import { cn } from '@/lib/utils'
import { CollaborationSidebarContent, CollaborationSidebarMobileHeader } from './sidebar-sections'

interface CollaborationSidebarProps {
  channel: Channel | null
  channelParticipants: ClientTeamMember[]
  sharedFiles: CollaborationAttachment[]
  canManageMembers?: boolean
  onManageMembers?: () => void
}

export function CollaborationSidebar({
  channel,
  channelParticipants,
  sharedFiles,
  canManageMembers = false,
  onManageMembers,
}: CollaborationSidebarProps) {
  const collapseId = useId()
  const [open, setOpen] = useState(true)

  return (
    <div className="border-t border-muted/40 lg:relative lg:h-[640px] lg:w-64 lg:border-t-0">
      <CollaborationSidebarMobileHeader collapseId={collapseId} open={open} onToggle={() => setOpen((prev) => !prev)} />
      <div
        className={cn(
          'grid overflow-hidden border-muted/40 transition-[grid-template-rows] duration-300 lg:hidden',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={collapseId}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <CollaborationSidebarContent
            channel={channel}
            channelParticipants={channelParticipants}
            sharedFiles={sharedFiles}
            canManageMembers={canManageMembers}
            onManageMembers={onManageMembers}
          />
        </div>
      </div>
      <div className="hidden h-full lg:flex lg:flex-col lg:border-l lg:border-muted/40">
        <CollaborationSidebarContent
          channel={channel}
          channelParticipants={channelParticipants}
          sharedFiles={sharedFiles}
          canManageMembers={canManageMembers}
          onManageMembers={onManageMembers}
        />
      </div>
    </div>
  )
}
