/**
 * Meeting Cancelled Email Template
 */

import { escapeHtml, wrapEmailTemplate } from './utils'

const MEETING_CANCELLED_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()
const MEETING_CANCELLED_TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function getMeetingCancelledDateFormatter(timezone: string): Intl.DateTimeFormat {
  const existingFormatter = MEETING_CANCELLED_DATE_FORMATTERS.get(timezone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeZone: timezone,
  })
  MEETING_CANCELLED_DATE_FORMATTERS.set(timezone, formatter)
  return formatter
}

function getMeetingCancelledTimeFormatter(timezone: string): Intl.DateTimeFormat {
  const existingFormatter = MEETING_CANCELLED_TIME_FORMATTERS.get(timezone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    timeZone: timezone,
  })
  MEETING_CANCELLED_TIME_FORMATTERS.set(timezone, formatter)
  return formatter
}

export interface MeetingCancelledTemplateParams {
  meetingTitle: string
  meetingStartIso: string
  meetingTimezone: string
  cancelledBy: string
  cancellationReason?: string | null
}

function formatMeetingTime(startIso: string, timezone: string): string {
  try {
    const start = new Date(startIso)
    const dateLabel = getMeetingCancelledDateFormatter(timezone).format(start)

    const startLabel = getMeetingCancelledTimeFormatter(timezone).format(start)

    return `${dateLabel} at ${startLabel}`
  } catch {
    return startIso
  }
}

export function meetingCancelledTemplate(params: MeetingCancelledTemplateParams): string {
  const {
    meetingTitle,
    meetingStartIso,
    meetingTimezone,
    cancelledBy,
    cancellationReason,
  } = params

  const safeTitle = escapeHtml(meetingTitle)
  const safeTimezone = escapeHtml(meetingTimezone)
  const safeCancelledBy = escapeHtml(cancelledBy)
  const formattedTime = formatMeetingTime(meetingStartIso, meetingTimezone)
  const safeReason = typeof cancellationReason === 'string' && cancellationReason.trim().length > 0
    ? escapeHtml(cancellationReason.trim())
    : null

  return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Cancelled</div>
    <div class="content">
      <p>This meeting has been cancelled.</p>
      <div class="highlight">
        <strong>Title:</strong> ${safeTitle}<br>
        <strong>Scheduled for:</strong> ${formattedTime}<br>
        <strong>Timezone:</strong> ${safeTimezone}<br>
        <strong>Cancelled by:</strong> ${safeCancelledBy}
      </div>
      ${safeReason ? `<p><strong>Reason:</strong> ${safeReason}</p>` : ''}
      <p class="meta">No action is needed unless a replacement invite is sent.</p>
    </div>
  `)
}
