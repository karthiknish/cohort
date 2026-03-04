import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import {
  getGoogleWorkspaceTokens,
  getMeetingRecord,
  updateMeetingRecord,
  upsertGoogleWorkspaceTokens,
} from '@/lib/meetings-admin'
import { notifyMeetingCancelledEmail } from '@/lib/notifications/brevo'
import {
  cancelGoogleCalendarEvent,
  refreshGoogleWorkspaceAccessToken,
  resolveGoogleWorkspaceOAuthCredentials,
} from '@/services/google-workspace'

const cancelMeetingSchema = z.object({
  legacyId: z.string().min(1),
  reason: z.string().optional(),
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
    bodySchema: cancelMeetingSchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    if (role !== 'admin' && role !== 'team') {
      throw new ForbiddenError('Client users cannot cancel meetings')
    }

    if (!workspace?.workspaceId) {
      throw new BadRequestError('Workspace resolution failed for meeting cancellation')
    }

    const { meeting } = await getMeetingRecord({
      userId: auth.uid,
      legacyId: body.legacyId,
      workspaceId: workspace.workspaceId,
      userEmail: auth.email,
    })

    if (meeting.status === 'cancelled') {
      return { meeting }
    }

    if (meeting.providerId === 'google-workspace' && meeting.calendarEventId) {
      const integrationUserId = meeting.integrationUserId ?? auth.uid
      const { tokens } = await getGoogleWorkspaceTokens({ userId: integrationUserId })

      if (!tokens?.accessToken) {
        throw new BadRequestError('Google Workspace connection is required to cancel this meeting')
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

      await cancelGoogleCalendarEvent({
        accessToken,
        eventId: meeting.calendarEventId,
      })
    }

    const { meeting: updatedMeeting } = await updateMeetingRecord({
      userId: auth.uid,
      userEmail: auth.email,
      workspaceId: workspace.workspaceId,
      legacyId: body.legacyId,
      status: 'cancelled',
    })

    const attendeeEmails = normalizeAttendees(meeting.attendeeEmails, auth.email)
    const meetingStartIso = new Date(meeting.startTimeMs).toISOString()

    await Promise.all(
      attendeeEmails.map(async (recipientEmail) => {
        await notifyMeetingCancelledEmail({
          recipientEmail,
          recipientName: undefined,
          meetingTitle: meeting.title,
          meetingStartIso,
          meetingTimezone: meeting.timezone,
          cancelledBy: auth.name ?? auth.email ?? 'Cohorts',
          cancellationReason: body.reason ?? null,
        })
      })
    )

    return {
      meeting: updatedMeeting,
    }
  }
)
