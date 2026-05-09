/**
 * Meeting Scheduled Email Template
 */

import { escapeHtml, wrapEmailTemplate } from './utils'

const MEETING_SCHEDULED_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()
const MEETING_SCHEDULED_TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function getMeetingScheduledDateFormatter(timezone: string): Intl.DateTimeFormat {
  const existingFormatter = MEETING_SCHEDULED_DATE_FORMATTERS.get(timezone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeZone: timezone,
  })
  MEETING_SCHEDULED_DATE_FORMATTERS.set(timezone, formatter)
  return formatter
}

function getMeetingScheduledTimeFormatter(timezone: string): Intl.DateTimeFormat {
  const existingFormatter = MEETING_SCHEDULED_TIME_FORMATTERS.get(timezone)
  if (existingFormatter) {
    return existingFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    timeZone: timezone,
  })
  MEETING_SCHEDULED_TIME_FORMATTERS.set(timezone, formatter)
  return formatter
}

export interface MeetingScheduledTemplateParams {
  meetingTitle: string
  meetingStartIso: string
  meetingEndIso?: string | null
  meetingTimezone: string
  organizerName: string
  meetLink: string | null
  inSiteJoinUrl?: string | null
}

function formatMeetingTime(startIso: string, endIso: string | null | undefined, timezone: string): string {
  try {
    const start = new Date(startIso)
    const dateLabel = getMeetingScheduledDateFormatter(timezone).format(start)

    const startLabel = getMeetingScheduledTimeFormatter(timezone).format(start)

    if (!endIso) {
      return `${dateLabel} at ${startLabel}`
    }

    const end = new Date(endIso)
    const endLabel = getMeetingScheduledTimeFormatter(timezone).format(end)

    return `${dateLabel} at ${startLabel} - ${endLabel}`
  } catch {
    return startIso
  }
}

export function meetingScheduledTemplate(params: MeetingScheduledTemplateParams): string {
  const { meetingTitle, meetingStartIso, meetingEndIso, meetingTimezone, organizerName, meetLink, inSiteJoinUrl } = params
  const formattedTime = formatMeetingTime(meetingStartIso, meetingEndIso, meetingTimezone)
  const safeTitle = escapeHtml(meetingTitle)
  const safeTimezone = escapeHtml(meetingTimezone)
  const safeOrganizer = escapeHtml(organizerName)

  return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Scheduled</div>
    <div class="content">
      <p>Your meeting is confirmed and has been added to the calendar workflow.</p>
      <div class="highlight">
        <strong>Title:</strong> ${safeTitle}<br>
        <strong>When:</strong> ${formattedTime}<br>
        <strong>Timezone:</strong> ${safeTimezone}<br>
        <strong>Organizer:</strong> ${safeOrganizer}
      </div>
      ${meetLink ? `<a class="button" href="${meetLink}">Open Meeting Room</a>` : ''}
      ${inSiteJoinUrl ? `<p class="meta">Prefer joining in-app? Use your workspace meeting room: <a href="${inSiteJoinUrl}">${inSiteJoinUrl}</a></p>` : ''}
      <p class="meta">This notification was sent by Cohorts Meetings.</p>
    </div>
  `)
}
