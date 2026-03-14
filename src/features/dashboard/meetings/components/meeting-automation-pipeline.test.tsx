import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { MeetingAutomationPipeline } from './meeting-automation-pipeline'

describe('meeting automation pipeline', () => {
  it('renders explicit in-progress transcript and notes steps', () => {
    const markup = renderToStaticMarkup(
      <MeetingAutomationPipeline
        captureListening={true}
        finalizingSession={true}
        hasTranscriptSaved={true}
        inRoom={true}
        notesProcessingState="processing"
        summaryReady={false}
        transcriptProcessingState="processing"
      />, 
    )

    expect(markup).toContain('Automation pipeline')
    expect(markup).toContain('Recording')
    expect(markup).toContain('Finalizing')
    expect(markup).toContain('Generating')
  })

  it('renders attention states when capture or post-call processing fails', () => {
    const markup = renderToStaticMarkup(
      <MeetingAutomationPipeline
        captureErrorPresent={true}
        captureListening={false}
        finalizingSession={false}
        hasTranscriptSaved={false}
        inRoom={false}
        notesProcessingState="failed"
        summaryReady={false}
        transcriptProcessingState="failed"
      />,
    )

    expect(markup).toContain('Check mic')
    expect(markup).toContain('Needs attention')
    expect(markup).toContain('Capture needs attention before transcript syncing can continue.')
    expect(markup).toContain('AI notes generation failed. Retry after more transcript is captured.')
  })
})