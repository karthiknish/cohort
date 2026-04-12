'use client'

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
}