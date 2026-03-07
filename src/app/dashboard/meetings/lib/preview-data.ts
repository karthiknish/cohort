import type { MeetingRecord, WorkspaceMember } from '../types'

export function getPreviewMeetingWorkspaceMembers(): WorkspaceMember[] {
  return [
    { id: 'preview-member-1', name: 'Alex Morgan', email: 'alex@cohorts.ai', role: 'Account Manager' },
    { id: 'preview-member-2', name: 'Jordan Lee', email: 'jordan@cohorts.ai', role: 'Strategist' },
    { id: 'preview-member-3', name: 'Priya Patel', email: 'priya@cohorts.ai', role: 'Growth Lead' },
    { id: 'preview-member-4', name: 'Taylor Kim', email: 'taylor@cohorts.ai', role: 'Client Partner' },
    { id: 'preview-member-5', name: 'Sam Chen', email: 'sam@cohorts.ai', role: 'Performance Marketer' },
  ]
}

export function getPreviewMeetings(clientId: string | null, timezone: string): MeetingRecord[] {
  const now = typeof window === 'undefined' ? new Date('2024-01-15T12:00:00.000Z') : new Date()
  const hour = 60 * 60 * 1000
  const day = 24 * hour
  const meetings: Array<{ clientId: string; meeting: MeetingRecord }> = [
    {
      clientId: 'preview-tech-corp',
      meeting: {
        legacyId: 'preview-meeting-1', providerId: 'livekit', title: 'Weekly Growth Sync',
        description: 'Review pacing, creative tests, and SQL quality before the Q2 push.',
        startTimeMs: now.getTime() + 2 * hour, endTimeMs: now.getTime() + 2 * hour + 45 * 60 * 1000, timezone,
        calendarEventId: 'preview-gcal-1', status: 'scheduled',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-growth-sync', roomName: 'preview-growth-sync',
        attendeeEmails: ['alex@cohorts.ai', 'jordan@cohorts.ai', 'growth@techcorp.example'], notesSummary: null, transcriptText: null,
      },
    },
    {
      clientId: 'preview-startupxyz',
      meeting: {
        legacyId: 'preview-meeting-2', providerId: 'livekit', title: 'Launch War Room',
        description: 'Creator shortlist, teaser edits, and launch-week escalation plan.',
        startTimeMs: now.getTime() + day, endTimeMs: now.getTime() + day + 30 * 60 * 1000, timezone,
        calendarEventId: null, status: 'in_progress',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-launch-war-room', roomName: 'preview-launch-war-room',
        attendeeEmails: ['priya@cohorts.ai', 'launch@startupxyz.example'],
        notesSummary: 'Key actions:\n- Lock creator roster by Friday\n- Approve 3 teaser cutdowns\n- QA waitlist onboarding flow before launch day',
        transcriptText: 'We agreed to prioritize creator deliverables, finalize the teaser cutdowns, and tighten the waitlist onboarding experience before launch week.',
      },
    },
    {
      clientId: 'preview-retail-store',
      meeting: {
        legacyId: 'preview-meeting-3', providerId: 'livekit', title: 'Retail Retention Review',
        description: 'Audit repeat purchase rate, spring promo cadence, and lifecycle email segmentation.',
        startTimeMs: now.getTime() + 2 * day + 3 * hour, endTimeMs: now.getTime() + 2 * day + 4 * hour, timezone,
        calendarEventId: 'preview-gcal-3', status: 'scheduled',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-retail-retention-review', roomName: 'preview-retail-retention-review',
        attendeeEmails: ['taylor@cohorts.ai', 'marketing@retailstore.example'], notesSummary: null, transcriptText: null,
      },
    },
  ]

  return clientId ? meetings.filter((entry) => entry.clientId === clientId).map((entry) => entry.meeting) : meetings.map((entry) => entry.meeting)
}

export function getPreviewGoogleWorkspaceStatus() {
  const linkedAt = typeof window === 'undefined' ? new Date('2024-01-10T10:00:00.000Z') : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  return {
    connected: true,
    linkedAtMs: linkedAt.getTime(),
    scopes: ['calendar.events', 'meetings.space.created'],
  }
}