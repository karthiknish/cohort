import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors'
import {
  ensureMeetingNativeRoom,
  getGoogleWorkspaceTokens,
  getMeetingRecord,
  getMeetingRecordByCalendarEventId,
  getMeetingRecordByRoomName,
  upsertGoogleWorkspaceTokens,
} from '@/lib/meetings-admin'
import {
  refreshGoogleWorkspaceAccessToken,
  resolveGoogleWorkspaceOAuthCredentials,
  updateGoogleCalendarEvent,
} from '@/services/google-workspace'
import {
  buildCohortsMeetingUrl,
  createLiveKitParticipantToken,
  createLiveKitRoomName,
  resolveLiveKitServerUrl,
} from '@/services/livekit'

const createTokenSchema = z.object({
  legacyId: z.string().trim().min(1).optional(),
  calendarEventId: z.string().trim().min(1).optional(),
  roomName: z.string().trim().min(1).optional(),
}).refine((value) => Boolean(value.legacyId || value.calendarEventId || value.roomName), {
  message: 'Meeting identifier is required',
})

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createTokenSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    if (!workspace?.workspaceId) {
      throw new ForbiddenError('Workspace context is required to join a meeting')
    }

    const serverUrl = resolveLiveKitServerUrl()
    if (!serverUrl) {
      throw new ServiceUnavailableError('LiveKit server URL is not configured')
    }

    let resolvedMeeting:
      | Awaited<ReturnType<typeof getMeetingRecord>>['meeting']
      | null = null
    let migration:
      | {
          created: boolean
          calendarSyncWarning: string | null
        }
      | undefined

    if (body.legacyId) {
      const result = await getMeetingRecord({
        userId: auth.uid,
        legacyId: body.legacyId,
        workspaceId: workspace.workspaceId,
        userEmail: auth.email,
      })
      resolvedMeeting = result.meeting
    } else if (body.calendarEventId) {
      const result = await getMeetingRecordByCalendarEventId({
        userId: auth.uid,
        calendarEventId: body.calendarEventId,
        workspaceId: workspace.workspaceId,
        userEmail: auth.email,
      })
      resolvedMeeting = result.meeting
    } else if (body.roomName) {
      try {
        const result = await getMeetingRecordByRoomName({
          userId: auth.uid,
          roomName: body.roomName,
          workspaceId: workspace.workspaceId,
          userEmail: auth.email,
        })
        resolvedMeeting = result.meeting
      } catch {
        resolvedMeeting = null
      }
    }

    if (resolvedMeeting && resolvedMeeting.status === 'cancelled') {
      throw new BadRequestError('Cancelled meetings cannot be joined')
    }

    if (resolvedMeeting && !resolvedMeeting.roomName) {
      const roomName = createLiveKitRoomName(resolvedMeeting.title)
      const roomUrl = buildCohortsMeetingUrl({
        appUrl: new URL(req.url).origin,
        roomName,
      })

      let calendarSyncWarning: string | null = null

      if (resolvedMeeting.calendarEventId) {
        try {
          const integrationUserId = resolvedMeeting.integrationUserId ?? auth.uid
          const { tokens } = await getGoogleWorkspaceTokens({ userId: integrationUserId })

          if (tokens?.accessToken) {
            const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials()

            let accessToken = tokens.accessToken
            const tokenExpired =
              typeof tokens.accessTokenExpiresAtMs === 'number' && tokens.accessTokenExpiresAtMs <= Date.now() + 60_000

            if (tokenExpired) {
              if (!tokens.refreshToken) {
                throw new Error('Google Workspace access has expired. Reconnect your account to update invite links.')
              }

              if (!googleClientId || !googleClientSecret) {
                throw new Error('Google Workspace refresh credentials are not configured.')
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

            await updateGoogleCalendarEvent({
              accessToken,
              eventId: resolvedMeeting.calendarEventId,
              title: resolvedMeeting.title,
              description: resolvedMeeting.description,
              startTimeMs: resolvedMeeting.startTimeMs,
              endTimeMs: resolvedMeeting.endTimeMs,
              timezone: resolvedMeeting.timezone,
              attendeeEmails: resolvedMeeting.attendeeEmails,
              meetingUrl: roomUrl,
            })
          } else {
            calendarSyncWarning = 'Google Calendar invite could not be updated because no Google Workspace connection was found.'
          }
        } catch (error) {
          calendarSyncWarning = error instanceof Error ? error.message : 'Google Calendar invite could not be updated.'
        }
      }

      const ensured = await ensureMeetingNativeRoom({
        userId: auth.uid,
        userEmail: auth.email,
        workspaceId: workspace.workspaceId,
        legacyId: resolvedMeeting.legacyId,
        roomName,
        meetLink: roomUrl,
      })

      resolvedMeeting = ensured.meeting
      migration = {
        created: true,
        calendarSyncWarning,
      }
    }

    const resolvedRoomName = resolvedMeeting?.roomName ?? body.roomName
    if (!resolvedRoomName) {
      throw new ServiceUnavailableError('Meeting room is not configured')
    }

    const resolvedMeetLink = resolvedMeeting?.meetLink ?? buildCohortsMeetingUrl({
      appUrl: new URL(req.url).origin,
      roomName: resolvedRoomName,
    })

    const token = await createLiveKitParticipantToken({
      roomName: resolvedRoomName,
      participantIdentity: `${auth.uid}:${Date.now().toString(36)}`,
      participantName: auth.name ?? auth.email ?? 'Cohorts participant',
      metadata: {
        email: auth.email ?? null,
        meetingLegacyId: resolvedMeeting?.legacyId ?? null,
        photoURL: typeof auth.claims?.photoURL === 'string' ? auth.claims.photoURL : null,
        role: typeof auth.claims?.role === 'string' ? auth.claims.role : null,
        workspaceId: workspace.workspaceId,
      },
    })

    return {
      token,
      serverUrl,
      roomName: resolvedRoomName,
      meetLink: resolvedMeetLink,
      meeting: resolvedMeeting ?? undefined,
      migration,
    }
  }
)
