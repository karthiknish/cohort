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

const quickMeetingSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().min(10).max(240).optional(),
  attendeeEmails: z.array(z.string().email()).optional(),
  timezone: z.string().min(1).optional(),
  clientId: z.string().nullable().optional(),
})

function normalizeAttendees(attendees: string[] | undefined, includeEmail?: string | null): string[] {
  const base = (attendees ?? [])
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
    bodySchema: quickMeetingSchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    if (role !== 'admin' && role !== 'team') {
      throw new ForbiddenError('Client users cannot start quick meetings')
    }

    if (!workspace?.workspaceId) {
      throw new ForbiddenError('Workspace context is required for quick meetings')
    }

    const { tokens } = await getGoogleWorkspaceTokens({ userId: auth.uid })
    if (!tokens?.accessToken) {
      throw new BadRequestError('Connect Google Workspace before starting a quick meet')
    }

    const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials()

    let accessToken = tokens.accessToken
    const tokenExpired =
      typeof tokens.accessTokenExpiresAtMs === 'number' && tokens.accessTokenExpiresAtMs <= Date.now() + 60_000

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

    const durationMinutes = Number.isFinite(body.durationMinutes) ? Math.floor(body.durationMinutes as number) : 30
    const now = Date.now()
    const startTimeMs = now
    const endTimeMs = now + Math.max(10, durationMinutes) * 60_000

    const timezone = body.timezone ?? 'UTC'
    const title = (body.title?.trim() && body.title.trim().length > 0)
      ? body.title.trim()
      : 'Quick Meet'

    const attendeeEmails = normalizeAttendees(body.attendeeEmails, auth.email)

    const calendarEvent = await createGoogleCalendarMeetEvent({
      accessToken,
      title,
      description: body.description ?? 'Instant Google Meet quick meeting',
      startTimeMs,
      endTimeMs,
      timezone,
      attendeeEmails,
    })

    const meetLink = calendarEvent.meetLink ?? calendarEvent.eventLink

    const meeting = await createMeetingRecord({
      userId: auth.uid,
      userEmail: auth.email,
      title,
      description: body.description ?? 'Instant Google Meet quick meeting',
      startTimeMs,
      endTimeMs,
      timezone,
      attendeeEmails,
      clientId: body.clientId ?? null,
      integrationUserId: auth.uid,
      providerId: 'google-workspace',
      meetLink,
      calendarEventId: calendarEvent.eventId,
    })

    const meetingStartIso = new Date(startTimeMs).toISOString()
    const meetingEndIso = new Date(endTimeMs).toISOString()

    await Promise.all(
      attendeeEmails.map(async (recipientEmail) => {
        await notifyMeetingScheduledEmail({
          recipientEmail,
          recipientName: undefined,
          meetingTitle: title,
          meetingStartIso,
          meetingEndIso,
          meetingTimezone: timezone,
          organizerName: auth.name ?? auth.email ?? 'Cohorts',
          meetLink,
        })
      })
    )

    return {
      meeting,
      calendarEvent,
    }
  }
)
