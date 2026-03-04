export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type MeetingRecord = {
  legacyId: string
  providerId: string
  title: string
  description: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  calendarEventId: string | null
  status: MeetingStatus
  meetLink: string | null
  attendeeEmails: string[]
  notesSummary: string | null
  transcriptText: string | null
}

export type WorkspaceMember = {
  id: string
  name: string
  email?: string
  role?: string
}

export type WorkspaceMemberWithEmail = WorkspaceMember & {
  email: string
}
