import type { MeetingRecord } from '../types'

export type MeetingRoomPageProps = {
  meeting: MeetingRecord
  onClose: () => void
  canRecord?: boolean
  onMeetingUpdated?: (meeting: MeetingRecord) => void
  fallbackRoomName?: string | null
}

export type TranscriptMode =
  | 'save-transcript'
  | 'save-transcript-and-generate-notes'
  | 'save-notes'
  | 'finalize-post-meeting'

export type TranscriptActionResult = {
  meeting?: MeetingRecord
  transcriptSaved?: boolean
  notesGenerated?: boolean
  notesSaved?: boolean
  summary?: string | null
  model?: string | null
  notesReason?: 'ai_not_configured' | 'generation_failed' | null
  transcriptTruncatedForNotes?: boolean
}

export type LiveKitJoinPayload = {
  token: string
  serverUrl: string
  roomName: string
  meetLink?: string | null
  meeting?: MeetingRecord
  migration?: {
    created: boolean
    calendarSyncWarning: string | null
  }
}

export type CaptureStatus = {
  supported: boolean
  listening: boolean
  error: string | null
}