import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import { ProposalAssetDeliveryCard, ProposalStrategyBriefCard, ProposalSubmittedHero } from './proposal-submitted-panel-sections'

const summary = {
  company: { name: 'Acme', industry: 'SaaS', website: 'https://acme.test' },
  marketing: { budget: '$5k', platforms: ['Google Ads'] },
  goals: { objectives: ['Leads'], challenges: ['Awareness'] },
  scope: { services: ['Paid Search'] },
  timelines: { startTime: 'Next month' },
} as never

describe('proposal submitted panel sections', () => {
  it('renders the hero and strategy brief card', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalSubmittedHero
          activeProposalIdForDeck="p1"
          canResumeSubmission={true}
          deckDownloadUrl="https://cdn.example.com/deck.pptx"
          isSubmitting={false}
          onResumeSubmission={vi.fn()}
        />
        <ProposalStrategyBriefCard onCopySummary={vi.fn()} summary={summary} />
      </>,
    )

    expect(markup).toContain('Your Proposal is Ready!')
    expect(markup).toContain('View Presentation')
    expect(markup).toContain('Strategy Brief')
    expect(markup).toContain('Acme')
  })

  it('renders ready and generating asset delivery states', () => {
    const readyMarkup = renderToStaticMarkup(
      <ProposalAssetDeliveryCard
        activeProposalIdForDeck="p1"
        deckDownloadUrl="https://cdn.example.com/deck.pptx"
        isRecheckingDeck={false}
        onCopyShareLink={vi.fn()}
        onRecheckDeck={vi.fn()}
        presentationDeck={{ status: 'ready', storageUrl: 'https://cdn.example.com/deck.pptx', pptxUrl: null } as never}
        viewerHref="/dashboard/proposals/viewer?src=test"
      />,
    )

    const pendingMarkup = renderToStaticMarkup(
      <ProposalAssetDeliveryCard
        activeProposalIdForDeck={null}
        deckDownloadUrl={null}
        isRecheckingDeck={false}
        onCopyShareLink={vi.fn()}
        presentationDeck={null}
        viewerHref={null}
      />,
    )

    expect(readyMarkup).toContain('Asset Delivery')
    expect(readyMarkup).toContain('PowerPoint (PPTX)')
    expect(readyMarkup).toContain('Copy Share Link')
    expect(pendingMarkup).toContain('Architecting Your Deck')
  })
})