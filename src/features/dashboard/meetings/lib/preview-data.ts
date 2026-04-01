import type { MeetingRecord, WorkspaceMember } from '../types'

export function getPreviewMeetingWorkspaceMembers(): WorkspaceMember[] {
  return [
    { id: 'preview-member-1', name: 'Alex Morgan', email: 'alex@cohorts.ai', role: 'Account Manager' },
    { id: 'preview-member-2', name: 'Jordan Lee', email: 'jordan@cohorts.ai', role: 'Strategist' },
    { id: 'preview-member-3', name: 'Priya Patel', email: 'priya@cohorts.ai', role: 'Growth Lead' },
    { id: 'preview-member-4', name: 'Taylor Kim', email: 'taylor@cohorts.ai', role: 'Client Partner' },
    { id: 'preview-member-5', name: 'Sam Chen', email: 'sam@cohorts.ai', role: 'Performance Marketer' },
    { id: 'preview-member-6', name: 'Casey Rivera', email: 'casey@cohorts.ai', role: 'Creative Lead' },
    { id: 'preview-member-7', name: 'Mia Thompson', email: 'mia@cohorts.ai', role: 'Brand Designer' },
    { id: 'preview-member-8', name: 'Noah Bennett', email: 'noah@cohorts.ai', role: 'Lifecycle Specialist' },
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
        description: 'Review pacing, creative tests, SQL quality, and board-level highlights before the Q2 push.',
        startTimeMs: now.getTime() + 2 * hour, endTimeMs: now.getTime() + 2 * hour + 45 * 60 * 1000, timezone,
        calendarEventId: 'preview-gcal-1', status: 'scheduled',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-growth-sync', roomName: 'preview-growth-sync',
        attendeeEmails: ['alex@cohorts.ai', 'jordan@cohorts.ai', 'mia@cohorts.ai', 'growth@techcorp.example'], notesSummary: null, transcriptText: null,
        transcriptUpdatedAtMs: null,
        transcriptSource: null,
        transcriptProcessingState: 'idle',
        transcriptProcessingError: null,
        notesUpdatedAtMs: null,
        notesModel: null,
        notesProcessingState: 'idle',
        notesProcessingError: null,
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
        attendeeEmails: ['priya@cohorts.ai', 'sam@cohorts.ai', 'launch@startupxyz.example'],
        notesSummary: 'Key actions:\n- Lock creator roster by Friday\n- Approve 3 teaser cutdowns\n- QA waitlist onboarding flow before launch day',
        transcriptText: 'We agreed to prioritize creator deliverables, finalize the teaser cutdowns, and tighten the waitlist onboarding experience before launch week.',
        transcriptUpdatedAtMs: now.getTime() - 12 * 60 * 1000,
        transcriptSource: 'livekit-live-capture',
        transcriptProcessingState: 'processing',
        transcriptProcessingError: null,
        notesUpdatedAtMs: null,
        notesModel: 'gemini-2.5-flash',
        notesProcessingState: 'processing',
        notesProcessingError: null,
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
        attendeeEmails: ['taylor@cohorts.ai', 'noah@cohorts.ai', 'marketing@retailstore.example'], notesSummary: null, transcriptText: null,
        transcriptUpdatedAtMs: null,
        transcriptSource: null,
        transcriptProcessingState: 'idle',
        transcriptProcessingError: null,
        notesUpdatedAtMs: null,
        notesModel: null,
        notesProcessingState: 'idle',
        notesProcessingError: null,
      },
    },
    {
      clientId: 'preview-tech-corp',
      meeting: {
        legacyId: 'preview-meeting-4', providerId: 'livekit', title: 'Executive KPI Debrief',
        description: 'Walk through CAC, win-rate shifts, and the revised board narrative from this week\'s performance memo.',
        startTimeMs: now.getTime() - 20 * hour, endTimeMs: now.getTime() - 19 * hour - 15 * 60 * 1000, timezone,
        calendarEventId: 'preview-gcal-4', status: 'completed',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-executive-kpi-debrief', roomName: 'preview-executive-kpi-debrief',
        attendeeEmails: ['alex@cohorts.ai', 'jordan@cohorts.ai', 'finance@techcorp.example'],
        notesSummary: 'Summary:\n- Search efficiency improved after the landing-page revision\n- Executive team wants a simplified funnel view in next week\'s recap\n- Approved a 15% test-budget increase for branded demand capture',
        transcriptText: 'Alex reviewed the weekly pipeline snapshot, Jordan highlighted the strongest paid-search segments, and the client approved a larger branded demand-capture test for the next cycle.',
        transcriptUpdatedAtMs: now.getTime() - 18 * hour,
        transcriptSource: 'livekit',
        transcriptProcessingState: 'idle',
        transcriptProcessingError: null,
        notesUpdatedAtMs: now.getTime() - 17 * hour,
        notesModel: 'gemini-2.5-pro',
        notesProcessingState: 'idle',
        notesProcessingError: null,
      },
    },
    {
      clientId: 'preview-startupxyz',
      meeting: {
        legacyId: 'preview-meeting-5', providerId: 'google-meet', title: 'Creator Approval Handoff',
        description: 'Final approval session for creator contracts and launch-week posting windows.',
        startTimeMs: now.getTime() + 3 * day, endTimeMs: now.getTime() + 3 * day + 45 * 60 * 1000, timezone,
        calendarEventId: 'preview-gcal-5', status: 'cancelled',
        meetLink: null, roomName: null,
        attendeeEmails: ['priya@cohorts.ai', 'casey@cohorts.ai', 'ops@startupxyz.example'],
        notesSummary: null,
        transcriptText: null,
        transcriptUpdatedAtMs: null,
        transcriptSource: null,
        transcriptProcessingState: 'idle',
        transcriptProcessingError: null,
        notesUpdatedAtMs: null,
        notesModel: null,
        notesProcessingState: 'idle',
        notesProcessingError: null,
      },
    },
    {
      clientId: 'preview-retail-store',
      meeting: {
        legacyId: 'preview-meeting-6', providerId: 'livekit', title: 'Post-Campaign Revenue Readout',
        description: 'Close out the spring promo retrospective and align on the next lifecycle-email test sequence.',
        startTimeMs: now.getTime() - 52 * hour, endTimeMs: now.getTime() - 51 * hour - 20 * 60 * 1000, timezone,
        calendarEventId: 'preview-gcal-6', status: 'completed',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-retail-readout', roomName: 'preview-retail-readout',
        attendeeEmails: ['taylor@cohorts.ai', 'noah@cohorts.ai', 'marketing@retailstore.example'],
        notesSummary: null,
        transcriptText: 'Taylor recapped the lifecycle performance, Noah shared segmentation learnings, and the client asked for a cleaner resend policy before the next promo window.',
        transcriptUpdatedAtMs: now.getTime() - 50 * hour,
        transcriptSource: 'livekit-upload',
        transcriptProcessingState: 'idle',
        transcriptProcessingError: null,
        notesUpdatedAtMs: null,
        notesModel: 'gemini-2.5-flash',
        notesProcessingState: 'failed',
        notesProcessingError: 'Preview summary generation timed out after two retries.',
      },
    },
    {
      clientId: 'preview-tech-corp',
      meeting: {
        legacyId: 'preview-meeting-7', providerId: 'livekit', title: 'Creative QA Standup',
        description: 'Review motion cutdowns, comment backlog, and asset handoff readiness for the next paid social batch.',
        startTimeMs: now.getTime() + 30 * hour, endTimeMs: now.getTime() + 30 * hour + 25 * 60 * 1000, timezone,
        calendarEventId: null, status: 'scheduled',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-creative-qa-standup', roomName: 'preview-creative-qa-standup',
        attendeeEmails: ['mia@cohorts.ai', 'alex@cohorts.ai', 'design@techcorp.example'],
        notesSummary: null,
        transcriptText: null,
        transcriptUpdatedAtMs: null,
        transcriptSource: null,
        transcriptProcessingState: 'idle',
        transcriptProcessingError: null,
        notesUpdatedAtMs: null,
        notesModel: null,
        notesProcessingState: 'idle',
        notesProcessingError: null,
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
    scopes: ['calendar.events', 'calendar.readonly', 'meetings.space.created'],
  }
}