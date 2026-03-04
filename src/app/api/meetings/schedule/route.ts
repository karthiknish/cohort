import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import { createMeetingRecord, getGoogleWorkspaceTokens, upsertGoogleWorkspaceTokens } from '@/lib/meetings-admin'
import { notifyMeetingScheduledEmail } from '@/lib/notifications/brevo'
import {
  createGoogleCalendarMeetEvent,
  refreshGoogleWorkspaceAccessToken,
  resolveGoogleWorkspaceOAuthCredentials,
} from '@/services/google-workspace'

const scheduleMeetingSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  startTimeMs: z.number(),
  endTimeMs: z.number(),
  timezone: z.string().min(1),
  attendeeEmails: z.array(z.string().email()),
  clientId: z.string().nullable().optional(),
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
    bodySchema: scheduleMeetingSchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    if (role !== 'admin' && role !== 'team') {
      throw new ForbiddenError('Client users cannot schedule meetings')
    }

    if (!workspace?.workspaceId) {
      throw new BadRequestError('Workspace resolution failed for meeting scheduling')
    }

    if (body.endTimeMs <= body.startTimeMs) {
      throw new BadRequestError('Meeting end time must be after start time')
    }

    const { tokens } = await getGoogleWorkspaceTokens({ userId: auth.uid })

    if (!tokens?.accessToken) {
      throw new BadRequestError('Connect Google Workspace before scheduling a meeting')
    }

    const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials()

    let accessToken = tokens.accessToken
    const now = Date.now()
    const tokenExpired = typeof tokens.accessTokenExpiresAtMs === 'number' && tokens.accessTokenExpiresAtMs <= now + 60_000

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
        userId: auth.uid,
        userEmail: tokens.userEmail,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
        idToken: refreshed.id_token ?? tokens.idToken,
        scopes: typeof refreshed.scope === 'string' ? refreshed.scope.split(' ').filter(Boolean) : tokens.scopes,
        accessTokenExpiresAtMs:
          typeof refreshed.expires_in === 'number' ? Date.now() + refreshed.expires_in * 1000 : tokens.accessTokenExpiresAtMs,
      })
    }

    const attendeeEmails = normalizeAttendees(body.attendeeEmails, auth.email)

    const calendarEvent = await createGoogleCalendarMeetEvent({
      accessToken,
      title: body.title,
      description: body.description,
      startTimeMs: body.startTimeMs,
      endTimeMs: body.endTimeMs,
      timezone: body.timezone,
      attendeeEmails,
    })

    const meeting = await createMeetingRecord({
      userId: auth.uid,
      userEmail: auth.email,
      title: body.title,
      description: body.description,
      startTimeMs: body.startTimeMs,
      endTimeMs: body.endTimeMs,
      timezone: body.timezone,
      attendeeEmails,
      clientId: body.clientId ?? null,
      integrationUserId: auth.uid,
      providerId: 'google-workspace',
      meetLink: calendarEvent.meetLink,
      calendarEventId: calendarEvent.eventId,
    })

    const meetingStartIso = new Date(body.startTimeMs).toISOString()
    const meetingEndIso = new Date(body.endTimeMs).toISOString()

    await Promise.all(
      attendeeEmails.map(async (recipientEmail) => {
        await notifyMeetingScheduledEmail({
          recipientEmail,
          recipientName: undefined,
          meetingTitle: body.title,
          meetingStartIso,
          meetingEndIso,
          meetingTimezone: body.timezone,
          organizerName: auth.name ?? tokens.userEmail ?? 'Cohorts',
          meetLink: calendarEvent.meetLink,
        })
      })
    )

    return {
      meeting,
      calendarEvent,
    }
  }
)
