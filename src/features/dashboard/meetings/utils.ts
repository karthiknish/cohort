import { EMAIL_REGEX, normalizeEmail, parseAttendeeInput } from '@/lib/meetings/attendees'

import type { MeetingProcessingState, MeetingRecord, MeetingStatus, WorkspaceMember, WorkspaceMemberWithEmail } from './types'

const LOCAL_DATE_TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function getLocalDateTimeFormatter(timezone: string | null | undefined): Intl.DateTimeFormat {
  const normalizedTimeZone = typeof timezone === 'string' && timezone.trim().length > 0 ? timezone : ''
  const existingFormatter = LOCAL_DATE_TIME_FORMATTERS.get(normalizedTimeZone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: normalizedTimeZone || undefined,
  })
  LOCAL_DATE_TIME_FORMATTERS.set(normalizedTimeZone, formatter)
  return formatter
}

export function hasEmail(member: WorkspaceMember): member is WorkspaceMemberWithEmail {
  return typeof member.email === 'string' && member.email.trim().length > 0
}

export { EMAIL_REGEX, normalizeEmail, parseAttendeeInput }

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
    return getLocalDateTimeFormatter(timezone).format(date)
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
