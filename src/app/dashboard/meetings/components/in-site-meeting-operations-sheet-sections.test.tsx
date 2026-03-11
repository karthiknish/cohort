import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/sheet', () => ({
  SheetDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { MeetingAutomationPipeline } from './meeting-automation-pipeline'
import {
  MeetingOperationsAlerts,
  MeetingOperationsAttendeesCard,
  MeetingOperationsAutomationCard,
  MeetingOperationsCaptureCard,
  MeetingOperationsLiveCapturePreview,
  MeetingOperationsSheetHeader,
  MeetingOperationsSummaryCard,
  MeetingOperationsSyncCards,
} from './in-site-meeting-operations-sheet-sections'

describe('meeting operations sheet sections', () => {
  it('renders header and status cards', () => {
    const markup = renderToStaticMarkup(
      <>
        <MeetingOperationsSheetHeader joinConfig={{ roomName: 'room-1', serverUrl: 'wss://lk.example.com', token: 'token' }} meetingRoomName="room-1" />
        <MeetingOperationsCaptureCard
          captureStatus={{ error: null, listening: true, supported: true }}
          joinConfig={{ roomName: 'room-1', serverUrl: 'wss://lk.example.com', token: 'token' }}
          transcriptSource="livekit"
        />
        <MeetingOperationsAttendeesCard meetingAttendeeEmails={['alex@example.com', 'sam@example.com']} />
        <MeetingOperationsAutomationCard
          autoSyncing={true}
          finalizingSession={false}
          joinConfig={{ roomName: 'room-1', serverUrl: 'wss://lk.example.com', token: 'token' }}
          markCompleted={true}
          notesProcessingState="processing"
          retryingPostCallProcessing={false}
          transcriptProcessingState="idle"
        />
        <MeetingOperationsSyncCards
          notesModel="gemini-2.5"
          summaryStatus="Generating summary now"
          transcriptLength={120}
          transcriptProcessingState="processing"
          transcriptSource="livekit"
          transcriptStatus="Finalizing transcript now"
          transcriptTruncatedForNotes={true}
        />
        <MeetingAutomationPipeline
          captureListening={true}
          finalizingSession={false}
          hasTranscriptSaved={true}
          inRoom={true}
          notesProcessingState="processing"
          summaryReady={false}
          transcriptProcessingState="idle"
        />
      </>,
    )

    expect(markup).toContain('Room sidebar')
    expect(markup).toContain('room-1')
    expect(markup).toContain('Browser speech capture is available')
    expect(markup).toContain('2 attendees')
    expect(markup).toContain('AI notes generating')
    expect(markup).toContain('Transcript truncated')
    expect(markup).toContain('Automation pipeline')
    expect(markup).toContain('Capture → Transcript → AI notes')
    expect(markup).toContain('Generating')
  })

  it('renders alerts, summary states, and live capture', () => {
    const markup = renderToStaticMarkup(
      <>
        <MeetingOperationsAlerts
          captureError="Microphone unavailable"
          notesProcessingError="Gemini request failed"
          notesReason="generation_failed"
          canGenerateNotes={true}
          canRetryPostCallProcessing={true}
          generatingNotes={false}
          retryingPostCallProcessing={false}
          onGenerateNotes={vi.fn()}
          onRetryPostCallProcessing={vi.fn()}
          transcriptProcessingError="Transcript finalization failed"
        />
        <MeetingOperationsSummaryCard
          canGenerateNotes={true}
          generatingNotes={false}
          notesProcessingState="idle"
          onGenerateNotes={vi.fn()}
          postCallProcessingActive={true}
          summaryPreview={null}
          transcriptLength={42}
        />
        <MeetingOperationsSummaryCard
          canGenerateNotes={true}
          generatingNotes={false}
          notesProcessingState="idle"
          onGenerateNotes={vi.fn()}
          postCallProcessingActive={false}
          summaryPreview="Action items and next steps"
          transcriptLength={42}
        />
        <MeetingOperationsLiveCapturePreview interimTranscript="Discussing scope and timeline" />
      </>,
    )

    expect(markup).toContain('Capture warning')
    expect(markup).toContain('AI summary failed')
    expect(markup).toContain('Retry post-call processing')
    expect(markup).toContain('Retry AI notes')
    expect(markup).toContain('Generate notes')
    expect(markup).toContain('Latest AI summary')
    expect(markup).toContain('Keep this page open until transcript finalization and notes generation finish.')
    expect(markup).toContain('Discussing scope and timeline')
  })
})