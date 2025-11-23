import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationChannelType, CollaborationMessage } from '@/types/collaboration'

export type ChannelTypeColorMap = Record<CollaborationChannelType, string>

export const CHANNEL_TYPE_COLORS: ChannelTypeColorMap = {
  client: 'bg-blue-100 text-blue-800',
  team: 'bg-emerald-100 text-emerald-800',
  project: 'bg-purple-100 text-purple-800',
}

export function normalizeTeamMembers(members: ClientTeamMember[] = []): ClientTeamMember[] {
  const map = new Map<string, ClientTeamMember>()

  members.forEach((member) => {
    const name = typeof member.name === 'string' ? member.name.trim() : ''
    if (!name) return
    const role = typeof member.role === 'string' ? member.role.trim() : ''
    const key = name.toLowerCase()

    if (!map.has(key)) {
      map.set(key, {
        name,
        role: role || 'Contributor',
      })
    }
  })

  return Array.from(map.values())
}

export function aggregateTeamMembers(
  clients: ClientRecord[],
  fallbackName: string,
  fallbackRole: string,
): ClientTeamMember[] {
  const map = new Map<string, ClientTeamMember>()

  clients.forEach((client) => {
    normalizeTeamMembers(client.teamMembers).forEach((member) => {
      const key = member.name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, member)
      }
    })
  })

  const normalizedFallback = fallbackName.trim()
  if (normalizedFallback.length > 0) {
    const key = normalizedFallback.toLowerCase()
    if (!map.has(key)) {
      map.set(key, { name: normalizedFallback, role: fallbackRole })
    }
  }

  return Array.from(map.values())
}

export function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'TM'
  const parts = trimmed.split(' ').filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export function formatRelativeTime(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatTimestamp(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function collectSharedFiles(messages: CollaborationAttachment[][]): CollaborationAttachment[] {
  const map = new Map<string, CollaborationAttachment>()
  messages.forEach((list) => {
    list.forEach((attachment) => {
      if (!attachment?.url) return
      const key = `${attachment.url}-${attachment.name}`
      if (!map.has(key)) {
        map.set(key, attachment)
      }
    })
  })
  return Array.from(map.values())
}

const URL_REGEX = /https?:\/\/(?:www\.)?[\w\-._~:/?#\[\]@!$&'()*+,;=%]+/gi
const IMAGE_EXTENSION_REGEX = /\.(?:png|jpe?g|gif|webp|svg|avif)$/i

export function extractUrlsFromContent(text: string | null | undefined): string[] {
  if (!text) return []
  const matches = text.match(URL_REGEX)
  if (!matches) return []
  const unique = new Set<string>()
  matches.forEach((raw) => {
    try {
      const normalized = new URL(raw).toString()
      unique.add(normalized)
    } catch {
      /* noop */
    }
  })
  return Array.from(unique)
}

export function isLikelyImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    return IMAGE_EXTENSION_REGEX.test(parsed.pathname)
  } catch {
    return false
  }
}

export type MessageGroup = {
  id: string
  dateSeparator?: string
  messages: CollaborationMessage[]
}

export function groupMessages(messages: CollaborationMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  let currentGroup: MessageGroup | null = null

  messages.forEach((message, index) => {
    const messageDate = message.createdAt ? new Date(message.createdAt) : new Date()
    const prevMessage = index > 0 ? messages[index - 1] : null
    const prevDate = prevMessage?.createdAt ? new Date(prevMessage.createdAt) : null

    // Check for date separator
    let dateSeparator: string | undefined
    if (!prevDate || !isSameDay(messageDate, prevDate)) {
      dateSeparator = formatDateSeparator(messageDate)
    }

    // Check if we should start a new group
    const shouldStartNewGroup =
      !currentGroup ||
      dateSeparator ||
      message.senderId !== currentGroup.messages[0].senderId ||
      (prevDate && messageDate.getTime() - prevDate.getTime() > 5 * 60 * 1000) // 5 minutes

    if (shouldStartNewGroup) {
      if (currentGroup) {
        groups.push(currentGroup)
      }
      currentGroup = {
        id: `group-${message.id}`,
        dateSeparator,
        messages: [message],
      }
    } else {
      currentGroup!.messages.push(message)
    }
  })

  if (currentGroup) {
    groups.push(currentGroup)
  }

  return groups
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function formatDateSeparator(date: Date): string {
  const today = new Date()
  if (isSameDay(date, today)) {
    return 'Today'
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
