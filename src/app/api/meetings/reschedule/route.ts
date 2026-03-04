import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import {
  getGoogleWorkspaceTokens,
  getMeetingRecord,
  updateMeetingRecord,
  upsertGoogleWorkspaceTokens,
} from '@/lib/meetings-admin'
import { notifyMeetingRescheduledEmail } from '@/lib/notifications/brevo'
import {
  refreshGoogleWorkspaceAccessToken,
  resolveGoogleWorkspaceOAuthCredentials,
  updateGoogleCalendarMeetEvent,
} from '@/services/google-workspace'

const rescheduleMeetingSchema = z.object({
  legacyId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  startTimeMs: z.number(),
  endTimeMs: z.number(),
  timezone: z.string().min(1),
  attendeeEmails: z.array(z.string().email()),
})

function normalizeAttendees(attendees: string[], includeEmail?: string | null): string[] {
  const base = attendees
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)

  if (includeEmail) {
    base.push(includeEmail.trim().toLowerCase())
  }

  return Array.from(new Set(base))
}

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: rescheduleMeetingSchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    if (role !== 'admin' && role !== 'team') {
      throw new ForbiddenError('Client users cannot reschedule meetings')
    }

    if (!workspace?.workspaceId) {
      throw new BadRequestError('Workspace resolution failed for meeting rescheduling')
    }

    if (body.endTimeMs <= body.startTimeMs) {
      throw new BadRequestError('Meeting end time must be after start time')
    }

    const { meeting } = await getMeetingRecord({
      userId: auth.uid,
      legacyId: body.legacyId,
      workspaceId: workspace.workspaceId,
      userEmail: auth.email,
    })

    if (meeting.status === 'cancelled') {
      throw new BadRequestError('Cancelled meetings cannot be rescheduled')
    }

    const attendeeEmails = normalizeAttendees(body.attendeeEmails, auth.email)

    let nextMeetLink = meeting.meetLink

    if (meeting.providerId === 'google-workspace' && meeting.calendarEventId) {
      const integrationUserId = meeting.integrationUserId ?? auth.uid
      const { tokens } = await getGoogleWorkspaceTokens({ userId: integrationUserId })

      if (!tokens?.accessToken) {
        throw new BadRequestError('Google Workspace connection is required to reschedule this meeting')
      }

      const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials()

      let accessToken = tokens.accessToken
      const tokenExpired = typeof tokens.accessTokenExpiresAtMs === 'number' && tokens.accessTokenExpiresAtMs <= Date.now() + 60_000

      if (tokenExpired) {
        if (!tokens.refreshToken) {
          throw new BadRequestError('Google Workspace access has expired. Reconnect your account.')
        }

        if (!googleClientId || !googleClientSecret) {
          throw new ServiceUnavailableError('Google Workspace refresh credentials are not configured')
        }

        const refreshed = await refreshGoogleWorkspaceAccessToken({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          refreshToken: tokens.refreshToken,
        })

        accessToken = refreshed.access_token

        await upsertGoogleWorkspaceTokens({
          userId: integrationUserId,
          userEmail: tokens.userEmail,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
          idToken: refreshed.id_token ?? tokens.idToken,
          scopes: typeof refreshed.scope === 'string' ? refreshed.scope.split(' ').filter(Boolean) : tokens.scopes,
          accessTokenExpiresAtMs:
            typeof refreshed.expires_in === 'number' ? Date.now() + refreshed.expires_in * 1000 : tokens.accessTokenExpiresAtMs,
        })
      }

      const calendarEvent = await updateGoogleCalendarMeetEvent({
        accessToken,
        eventId: meeting.calendarEventId,
        title: body.title,
        description: body.description,
        startTimeMs: body.startTimeMs,
        endTimeMs: body.endTimeMs,
        timezone: body.timezone,
        attendeeEmails,
      })

      nextMeetLink = calendarEvent.meetLink ?? nextMeetLink
    }

    const { meeting: updatedMeeting } = await updateMeetingRecord({
      userId: auth.uid,
      userEmail: auth.email,
      workspaceId: workspace.workspaceId,
      legacyId: body.legacyId,
      title: body.title,
      description: body.description ?? null,
      startTimeMs: body.startTimeMs,
      endTimeMs: body.endTimeMs,
      timezone: body.timezone,
      attendeeEmails,
      meetLink: nextMeetLink,
      status: 'scheduled',
    })

    const previousMeetingStartIso = new Date(meeting.startTimeMs).toISOString()
    const newMeetingStartIso = new Date(body.startTimeMs).toISOString()
    const newMeetingEndIso = new Date(body.endTimeMs).toISOString()

    await Promise.all(
      attendeeEmails.map(async (recipientEmail) => {
        await notifyMeetingRescheduledEmail({
          recipientEmail,
          recipientName: undefined,
          meetingTitle: body.title,
          previousMeetingStartIso,
          newMeetingStartIso,
          newMeetingEndIso,
          meetingTimezone: body.timezone,
          organizerName: auth.name ?? auth.email ?? 'Cohorts',
          meetLink: nextMeetLink,
          inSiteJoinUrl: updatedMeeting.providerId === 'cohorts-quick-meet' ? nextMeetLink : null,
        })
      })
    )

    return {
      meeting: updatedMeeting,
    }
  }
)
