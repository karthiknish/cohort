import type { MeetingProcessingState, MeetingRecord, MeetingStatus, WorkspaceMember, WorkspaceMemberWithEmail } from './types'

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

export function extractRoomNameFromMeetingLink(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  if (normalized.length === 0) {
    return null
  }

  try {
    const url = new URL(normalized)
    const room = url.searchParams.get('room')
    if (typeof room === 'string' && room.trim().length > 0) {
      return room.trim()
    }
  } catch {
    // Ignore invalid URLs and fall back to null.
  }

  return null
}

export function formatMeetingTitleFromRoomName(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized.length === 0) {
    return null
  }

  const segments = normalized.split('-').filter(Boolean)
  if (segments.length === 0) {
    return null
  }

  const withoutPrefix = segments[0] === 'cohorts' ? segments.slice(1) : segments
  const trimmedSegments = withoutPrefix.length > 2 ? withoutPrefix.slice(0, -2) : withoutPrefix
  const displaySegments = trimmedSegments.length > 0 ? trimmedSegments : withoutPrefix

  if (displaySegments.length === 0) {
    return null
  }

  return displaySegments
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function sanitizeRoomNameSegment(value: string | null | undefined): string {
  if (typeof value !== 'string') {
    return 'meeting'
  }

  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)

  return normalized.length > 0 ? normalized : 'meeting'
}

export function buildFallbackRoomName(options: {
  title?: string | null
  startTimeMs?: number | string | null
  endTimeMs?: number | string | null
}): string {
  const titleSegment = sanitizeRoomNameSegment(options.title)
  const startSegment = coerceValidDate(options.startTimeMs)?.getTime().toString(36) ?? 'start'
  const endSegment = coerceValidDate(options.endTimeMs)?.getTime().toString(36) ?? 'end'

  return `cohorts-${titleSegment}-${startSegment}-${endSegment}`
}

function coerceValidDate(timestamp: number | string | null | undefined): Date | null {
  if (timestamp == null) {
    return null
  }

  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatLocalDateTime(timestamp: number | string | null | undefined, timezone: string | null | undefined): string {
  const date = coerceValidDate(timestamp)
  if (!date) {
    return 'Unknown time'
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: typeof timezone === 'string' && timezone.trim().length > 0 ? timezone : undefined,
    }).format(date)
  } catch {
    try {
      return date.toISOString()
    } catch {
      return 'Unknown time'
    }
  }
}

export function toTimeValue(timestamp: number | string | null | undefined): string {
  const date = coerceValidDate(timestamp)
  if (!date) {
    return '09:00'
  }

  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function normalizeMeetingProcessingState(value: MeetingProcessingState | null | undefined): MeetingProcessingState {
  return value === 'processing' || value === 'failed' ? value : 'idle'
}

export function isMeetingPostProcessing(meeting: Pick<MeetingRecord, 'transcriptProcessingState' | 'notesProcessingState'>): boolean {
  return (
    normalizeMeetingProcessingState(meeting.transcriptProcessingState) !== 'idle' ||
    normalizeMeetingProcessingState(meeting.notesProcessingState) !== 'idle'
  )
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
