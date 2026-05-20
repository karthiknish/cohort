'use client'

import type { CollaborationAttachment } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

import type { Channel } from '../types'

export type ChannelInfoHeaderConfig = {
  channel: Channel
  channelParticipants: ClientTeamMember[]
  sharedFiles: CollaborationAttachment[]
  workspaceId: string
  isAdmin: boolean
  canManageMembers?: boolean
  onManageMembers?: () => void
}

export interface MessagePaneHeaderInfo {
  name: string
  type: 'channel' | 'dm'
  role?: string | null
  /** Channel workspace kind (team / client / project) for header badge */
  channelKind?: 'team' | 'client' | 'project'
  isArchived?: boolean
  isMuted?: boolean
  onArchive?: (archived: boolean) => void
  onMute?: (muted: boolean) => void
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  participantCount?: number
  messageCount?: number
  onExport?: () => void
  /** When set, header shows “Copy link” using this URL (built on demand on the client). */
  buildShareableUrl?: () => string
  /** Channel: server-backed unread count for selected channel (badge). */
  channelUnreadCount?: number
  onMarkChannelRead?: () => void | Promise<void>
  markChannelReadPending?: boolean
  onBack?: () => void
  /** Opens channel info modal with roster and asset library (channels only). */
  channelInfo?: ChannelInfoHeaderConfig
}
