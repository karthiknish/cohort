import type { MeetingRecord, MeetingStatus, WorkspaceMember, WorkspaceMemberWithEmail } from './types'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = Math.floor(index / 4)
  const minute = (index % 4) * 15
  const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  const displayDate = new Date()
  displayDate.setHours(hour, minute, 0, 0)

  return {
    value,
    label: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(displayDate),
  }
})

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function hasEmail(member: WorkspaceMember): member is WorkspaceMemberWithEmail {
  return typeof member.email === 'string' && member.email.trim().length > 0
}

export function parseAttendeeInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,;]/)
        .map((entry) => {
          const trimmed = entry.trim()
          const angleMatch = trimmed.match(/<([^>]+)>/)
          const candidate = normalizeEmail(angleMatch?.[1] ?? trimmed)
          return EMAIL_REGEX.test(candidate) ? candidate : null
        })
        .filter((entry): entry is string => Boolean(entry))
    )
  )
}

export function formatLocalDateTime(timestamp: number, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(timestamp))
  } catch {
    return new Date(timestamp).toISOString()
  }
}

export function toTimeValue(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function sanitizeRoomToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function buildInSiteMeetingUrl(workspaceId: string | null, meeting: MeetingRecord): string {
  if (typeof meeting.meetLink === 'string' && /^https:\/\/meet\.jit\.si\//i.test(meeting.meetLink)) {
    return meeting.meetLink
  }

  const safeWorkspace = sanitizeRoomToken(workspaceId ?? 'workspace').slice(0, 24) || 'workspace'
  const safeMeeting = sanitizeRoomToken(meeting.legacyId).slice(0, 36) || 'meeting-room'
  return `https://meet.jit.si/cohorts-${safeWorkspace}-${safeMeeting}`
}

export function statusVariant(status: MeetingStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    case 'in_progress':
      return 'default'
    default:
      return 'outline'
  }
}
