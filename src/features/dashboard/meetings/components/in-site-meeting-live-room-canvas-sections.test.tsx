import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@livekit/components-react', () => ({
  ControlBar: () => <div>Control Bar</div>,
  GridLayout: ({ children }: { children: React.ReactNode }) => <div>Grid Layout{children}</div>,
  LayoutContextProvider: ({ children }: { children: React.ReactNode }) => <div>Layout Provider{children}</div>,
  ParticipantTile: () => <div>Participant Tile</div>,
  RoomAudioRenderer: () => <div>Room Audio</div>,
}))

vi.mock('./in-site-meeting-room-chat', () => ({
  InSiteMeetingRoomChat: ({ compact }: { compact?: boolean }) => <div>{compact ? 'Compact Chat' : 'Room Chat'}</div>,
}))

import {
  LiveRoomCanvasEmptyState,
  LiveRoomCanvasHeader,
  LiveRoomCanvasOverlay,
  LiveRoomCanvasShell,
  LiveRoomCanvasViewport,
} from './in-site-meeting-live-room-canvas-sections'

describe('live room canvas sections', () => {
  it('renders the header and overlay states', () => {
    const markup = renderToStaticMarkup(
      <>
        <LiveRoomCanvasHeader
          captureLabel="Recording live"
          compact={false}
          isSupported={true}
          meetingTitle="Weekly client sync"
        />
        <LiveRoomCanvasOverlay
          aiStatusLabel="AI notes syncing"
          autoSyncing={true}
          canMinimize={true}
          captureLabel="Recording live"
          finalizingSession={false}
          isMinimized={false}
          notesProcessingState="processing"
          onToggleMinimize={vi.fn()}
          onTogglePictureInPicture={vi.fn()}
          pipActive={false}
          pipSupported={true}
          transcriptProcessingState="idle"
          useDarkChrome={true}
        />
      </>,
    )

    expect(markup).toContain('Weekly client sync')
    expect(markup).toContain('Browser mic ready')
    expect(markup).toContain('AI notes syncing')
    expect(markup).toContain('Enter PiP')
  })

  it('renders the empty state copy', () => {
    const markup = renderToStaticMarkup(<LiveRoomCanvasEmptyState compact={false} />)

    expect(markup).toContain('Camera tiles will appear here once someone joins with video.')
    expect(markup).toContain('capture transcript data for AI notes')
  })

  it('renders the viewport and shell chrome', () => {
    const markup = renderToStaticMarkup(
      <LiveRoomCanvasShell
        aiStatusLabel="Listening for transcript"
        captureLabel="Capture armed"
        compact={false}
        isSupported={true}
        layoutContext={null as never}
        meetingTitle="Weekly client sync"
        roomViewportRef={vi.fn()}
        shouldUseAssertiveLiveRegion={false}
      >
        <LiveRoomCanvasViewport
          aiStatusLabel="Listening for transcript"
          autoSyncing={false}
          canMinimize={true}
          captureLabel="Capture armed"
          compact={false}
          finalizingSession={false}
          isMinimized={false}
          notesProcessingState="idle"
          onToggleMinimize={vi.fn()}
          onTogglePictureInPicture={vi.fn()}
          pipActive={false}
          pipSupported={true}
          tracks={[{ participant: {} } as never]}
          transcriptProcessingState="idle"
        />
      </LiveRoomCanvasShell>,
    )

    expect(markup).toContain('Layout Provider')
    expect(markup).toContain('Grid Layout')
    expect(markup).toContain('Participant Tile')
    expect(markup).toContain('Room Chat')
    expect(markup).toContain('Control Bar')
    expect(markup).toContain('Room Audio')
  })
})
