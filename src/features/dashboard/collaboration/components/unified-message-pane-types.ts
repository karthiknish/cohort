'use client'

export interface MessagePaneHeaderInfo {
  name: string
  type: 'channel' | 'dm'
  role?: string | null
  isArchived?: boolean
  isMuted?: boolean
  onArchive?: (archived: boolean) => void
  onMute?: (muted: boolean) => void
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  participantCount?: number
  messageCount?: number
  onExport?: () => void
}