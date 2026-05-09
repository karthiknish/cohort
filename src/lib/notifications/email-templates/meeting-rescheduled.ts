/**
 * Meeting Rescheduled Email Template
 */

import { escapeHtml, wrapEmailTemplate } from './utils'

const MEETING_RESCHEDULED_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()
const MEETING_RESCHEDULED_TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function getMeetingRescheduledDateFormatter(timezone: string): Intl.DateTimeFormat {
  const existingFormatter = MEETING_RESCHEDULED_DATE_FORMATTERS.get(timezone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeZone: timezone,
  })
  MEETING_RESCHEDULED_DATE_FORMATTERS.set(timezone, formatter)
  return formatter
}

function getMeetingRescheduledTimeFormatter(timezone: string): Intl.DateTimeFormat {
  const existingFormatter = MEETING_RESCHEDULED_TIME_FORMATTERS.get(timezone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    timeZone: timezone,
  })
  MEETING_RESCHEDULED_TIME_FORMATTERS.set(timezone, formatter)
  return formatter
}

export interface MeetingRescheduledTemplateParams {
  meetingTitle: string
  previousMeetingStartIso: string
  newMeetingStartIso: string
  newMeetingEndIso?: string | null
  meetingTimezone: string
  organizerName: string
  meetLink: string | null
  inSiteJoinUrl?: string | null
}

function formatMeetingTime(startIso: string, endIso: string | null | undefined, timezone: string): string {
  try {
    const start = new Date(startIso)
    const dateLabel = getMeetingRescheduledDateFormatter(timezone).format(start)

    const startLabel = getMeetingRescheduledTimeFormatter(timezone).format(start)

    if (!endIso) {
      return `${dateLabel} at ${startLabel}`
    }

    const end = new Date(endIso)
    const endLabel = getMeetingRescheduledTimeFormatter(timezone).format(end)

    return `${dateLabel} at ${startLabel} - ${endLabel}`
  } catch {
    return startIso
  }
}

export function meetingRescheduledTemplate(params: MeetingRescheduledTemplateParams): string {
  const {
    meetingTitle,
    previousMeetingStartIso,
    newMeetingStartIso,
    newMeetingEndIso,
    meetingTimezone,
    organizerName,
    meetLink,
    inSiteJoinUrl,
  } = params

  const safeTitle = escapeHtml(meetingTitle)
  const safeTimezone = escapeHtml(meetingTimezone)
  const safeOrganizer = escapeHtml(organizerName)

  const previousTime = formatMeetingTime(previousMeetingStartIso, null, meetingTimezone)
  const updatedTime = formatMeetingTime(newMeetingStartIso, newMeetingEndIso, meetingTimezone)

  return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Rescheduled</div>
    <div class="content">
      <p>The meeting schedule has been updated.</p>
      <div class="highlight">
        <strong>Title:</strong> ${safeTitle}<br>
        <strong>Previously:</strong> ${previousTime}<br>
        <strong>Now:</strong> ${updatedTime}<br>
        <strong>Timezone:</strong> ${safeTimezone}<br>
        <strong>Updated by:</strong> ${safeOrganizer}
      </div>
      ${meetLink ? `<a class="button" href="${meetLink}">Open Updated Room</a>` : ''}
      ${inSiteJoinUrl ? `<p class="meta">In-app room: <a href="${inSiteJoinUrl}">${inSiteJoinUrl}</a></p>` : ''}
      <p class="meta">Please update your calendar reminders.</p>
    </div>
  `)
}
