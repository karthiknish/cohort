import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@livekit/components-react', () => ({
  LiveKitRoom: ({ children }: { children: React.ReactNode }) => <div>LiveKit Room{children}</div>,
}))

vi.mock('./in-site-meeting-live-room-canvas', () => ({
  InSiteMeetingLiveRoomCanvas: ({ meetingTitle }: { meetingTitle: string }) => <div>Live Canvas {meetingTitle}</div>,
}))

import {
  MeetingRoomCanvasSection,
  MeetingRoomEmptyState,
  MeetingRoomHeroSection,
  MeetingRoomLeaveDialog,
  MeetingRoomToolsSection,
} from './in-site-meeting-card-sections'

describe('meeting room sections', () => {
  it('renders the meeting hero actions', () => {
    const markup = renderToStaticMarkup(
      <MeetingRoomHeroSection
        meetingStatus="in_progress"
        meetingTitle="Weekly client sync"
        meetingDescription="Review blockers and next steps."
        meetingStartTimeMs={1760000000000}
        meetingEndTimeMs={1760003600000}
        meetingTimezone="UTC"
        joinConfigPresent={true}
        pipSupported={true}
        pipActive={false}
        canMinimizeRoom={true}
        isMinimized={false}
        meetingLink="https://example.com/room"
        onOpenSidebar={vi.fn()}
        onTogglePictureInPicture={vi.fn()}
        onToggleMinimize={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    )

    expect(markup).toContain('Weekly client sync')
    expect(markup).toContain('Room sidebar')
    expect(markup).toContain('Picture in Picture')
    expect(markup).toContain('Copy link')
  })

  it('renders the empty state, tools, and leave dialog shells', () => {
    const markup = renderToStaticMarkup(
      <>
        <MeetingRoomEmptyState inlineJoinError="Room token missing" hasJoinReference={false} />
        <MeetingRoomToolsSection
          roomAutomationMessage="Transcript capture is active."
          roomAutomationBadge="Listening"
          lastAutoSyncAt={1760000000000}
          transcriptProcessingState="idle"
          notesProcessingState="processing"
          meetingTimezone="UTC"
          joinConfigPresent={false}
          isMobileViewport={true}
          isMinimized={false}
          joiningRoom={false}
          isPreviewMeeting={false}
          hasJoinReference={true}
          roomActionLabel="Join room"
          onOpenSidebar={vi.fn()}
          onToggleMinimize={vi.fn()}
          onJoinRoom={vi.fn()}
        />
        <MeetingRoomLeaveDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />
      </>,
    )

    expect(markup).toContain('Run the call here, keep notes in sync automatically.')
    expect(markup).toContain('Room token missing')
    expect(markup).toContain('Generating AI notes')
    expect(markup).toContain('Join room')
  })

  it('renders the live room canvas branch and minimized notice', () => {
    const markup = renderToStaticMarkup(
      <MeetingRoomCanvasSection
        autoCaptureEnabled={true}
        autoSyncing={false}
        canMinimize={true}
        finalizingSession={false}
        hasJoinReference={true}
        inlineJoinError={null}
        isMinimized={true}
        joinConfig={{ token: 'token', serverUrl: 'https://example.com' }}
        joinError="Socket reconnecting"
        layoutContext={null as never}
        meetingTitle="Weekly client sync"
        notesProcessingError={null}
        notesProcessingState="idle"
        onAppendTranscript={vi.fn()}
        onCaptureStatusChange={vi.fn()}
        onDisconnected={vi.fn()}
        onError={vi.fn()}
        onInterimTranscriptChange={vi.fn()}
        onToggleMinimize={vi.fn()}
        onTogglePictureInPicture={vi.fn()}
        pipActive={false}
        pipSupported={true}
        roomPinnedToMobileTray={true}
        roomViewportRef={vi.fn()}
        summaryPreview={null}
        transcriptProcessingError={null}
        transcriptProcessingState="idle"
      />,
    )

    expect(markup).toContain('Room minimized')
    expect(markup).toContain('Restore')
    expect(markup).toContain('LiveKit Room')
    expect(markup).toContain('Live Canvas Weekly client sync')
    expect(markup).toContain('Room connection warning')
  })
})