import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import {
  ProposalHistoryEmptyState,
  ProposalHistoryHeader,
  ProposalHistoryRow,
  type ProposalHistoryRowViewModel,
} from './proposal-history-sections'

const baseProposal = {
  id: 'proposal-12345678',
  status: 'draft',
  updatedAt: '2026-03-11T12:00:00.000Z',
  clientName: 'Acme',
  aiSuggestions: 'Generate a deck',
  aiInsights: null,
  pptUrl: null,
  presentationDeck: null,
} as const

const proposalHistoryRow: ProposalHistoryRowViewModel = {
  deckRequestable: true,
  displayName: 'Acme',
  isActiveDraft: false,
  isDeckPreparing: false,
  presentationUrl: null,
  proposal: baseProposal as never,
  resumeDisabled: false,
  resumeLabel: 'Resume editing',
}

const readyProposalHistoryRow: ProposalHistoryRowViewModel = {
  ...proposalHistoryRow,
  deckRequestable: false,
  presentationUrl: 'https://cdn.example.com/deck.pptx',
  proposal: { ...baseProposal, status: 'ready' } as never,
  resumeLabel: 'View proposal',
}

describe('proposal history sections', () => {
  it('renders the header and empty state', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalHistoryHeader isLoading={false} onRefresh={vi.fn()} proposalCount={2} />
        <ProposalHistoryEmptyState canCreate={true} isCreating={false} isGenerating={false} onCreateNew={vi.fn()} />
      </>,
    )

    expect(markup).toContain('2 total proposals')
    expect(markup).toContain('Refresh')
    expect(markup).toContain('No proposals yet')
    expect(markup).toContain('Create first proposal')
  })

  it('renders a history row with proposal actions', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalHistoryRow deletingProposalId={null} onDownloadDeck={vi.fn()} onRequestDelete={vi.fn()} onResume={vi.fn()} row={proposalHistoryRow} />
        <ProposalHistoryRow deletingProposalId={null} onDownloadDeck={vi.fn()} onRequestDelete={vi.fn()} onResume={vi.fn()} row={readyProposalHistoryRow} />
      </>,
    )

    expect(markup).toContain('Resume editing')
    expect(markup).toContain('Generate Deck')
    expect(markup).toContain('View proposal')
    expect(markup).toContain('Preview')
    expect(markup).toContain('PPT')
  })
})