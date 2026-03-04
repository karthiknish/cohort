import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ForbiddenError, UnauthorizedError } from '@/lib/api-errors'
import { createMeetingRecord } from '@/lib/meetings-admin'
import { notifyMeetingScheduledEmail } from '@/lib/notifications/brevo'

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

function sanitizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function buildQuickMeetUrl(workspaceId: string): string {
  const safeWorkspace = sanitizeToken(workspaceId).slice(0, 24) || 'workspace'
  const nonce = Math.random().toString(36).slice(2, 8)
  const room = `cohorts-${safeWorkspace}-${Date.now().toString(36)}-${nonce}`
  return `https://meet.jit.si/${room}`
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

    const durationMinutes = Number.isFinite(body.durationMinutes) ? Math.floor(body.durationMinutes as number) : 30
    const now = Date.now()
    const startTimeMs = now
    const endTimeMs = now + Math.max(10, durationMinutes) * 60_000

    const timezone = body.timezone ?? 'UTC'
    const title = (body.title?.trim() && body.title.trim().length > 0)
      ? body.title.trim()
      : 'Quick Meet'

    const attendeeEmails = normalizeAttendees(body.attendeeEmails, auth.email)
    const meetLink = buildQuickMeetUrl(workspace.workspaceId)

    const meeting = await createMeetingRecord({
      userId: auth.uid,
      userEmail: auth.email,
      title,
      description: body.description ?? 'Instant in-site quick meeting',
      startTimeMs,
      endTimeMs,
      timezone,
      attendeeEmails,
      clientId: body.clientId ?? null,
      integrationUserId: null,
      providerId: 'cohorts-quick-meet',
      meetLink,
      calendarEventId: null,
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
          inSiteJoinUrl: meetLink,
        })
      })
    )

    return {
      meeting,
      inSiteEmbedUrl: meetLink,
    }
  }
)
