import { describe, expect, it } from 'vitest'

import { getPreviewProposalSimulation } from './use-proposal-submission'

describe('getPreviewProposalSimulation', () => {
  it('prefers a client-specific preview deck when available', () => {
    const simulation = getPreviewProposalSimulation('preview-techcorp')

    expect(simulation?.draftId).toBe('preview-proposal-1')
    expect(simulation?.presentationDeck?.storageUrl).toContain('/dashboard/proposals/preview-proposal-1/deck?preview=1')
  })

  it('falls back to a ready preview deck when the client has no generated preview proposal', () => {
    const simulation = getPreviewProposalSimulation('preview-startupxyz')

    expect(simulation?.draftId).toBe('preview-proposal-1')
    expect(simulation?.presentationDeck?.status).toBe('ready')
    expect(simulation?.presentationDeck?.instructions).toContain('Slide 1:')
  })
})