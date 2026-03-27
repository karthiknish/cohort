import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { DeckProgressOverlayContent, DeckProgressOverlayShell, ProposalGenerationOverlayContent } from './deck-progress-overlays-sections'

const errorCopy = { title: 'Deck preparation failed', description: 'Please retry.' }

describe('deck progress overlay sections', () => {
  it('renders the proposal generation overlay content', () => {
    const markup = renderToStaticMarkup(
      <DeckProgressOverlayShell className="overlay-shell">
        <ProposalGenerationOverlayContent
          currentStageHelper="Writing tailored recommendations"
          currentStageLabel="Drafting strategy..."
          isComplete={false}
          progressPercent={60}
          stageIndex={2}
          stageLabels={['Analyzing', 'Gathering', 'Drafting', 'Formatting', 'Generating']}
        />
      </DeckProgressOverlayShell>,
    )

    expect(markup).toContain('Drafting strategy...')
    expect(markup).toContain('Writing tailored recommendations')
    expect(markup).toContain('Processing Strategy')
    expect(markup).toContain('60%')
  })

  it('renders the simple deck progress states', () => {
    const markup = renderToStaticMarkup(
      <DeckProgressOverlayShell className="deck-shell">
        <DeckProgressOverlayContent
          stage="error"
          copy={errorCopy}
        />
      </DeckProgressOverlayShell>,
    )

    expect(markup).toContain('Deck preparation failed')
    expect(markup).toContain('Please retry.')
  })
})