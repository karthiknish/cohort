export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type MeetingProcessingState = 'idle' | 'processing' | 'failed'

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
  roomName: string | null
  attendeeEmails: string[]
  notesSummary: string | null
  transcriptText: string | null
  transcriptUpdatedAtMs?: number | null
  transcriptSource?: string | null
  transcriptProcessingState?: MeetingProcessingState | null
  transcriptProcessingError?: string | null
  notesUpdatedAtMs?: number | null
  notesModel?: string | null
  notesProcessingState?: MeetingProcessingState | null
  notesProcessingError?: string | null
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
