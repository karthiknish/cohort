import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/dashboard/proposals/page', () => ({
  default: () => <div>FeatureProposalsPage</div>,
}))

import ProposalsPage from './page'

describe('ProposalsPage route smoke', () => {
  it('renders the feature module through the route shell', () => {
    const markup = renderToStaticMarkup(<ProposalsPage />)

    expect(markup).toContain('FeatureProposalsPage')
  })
})
