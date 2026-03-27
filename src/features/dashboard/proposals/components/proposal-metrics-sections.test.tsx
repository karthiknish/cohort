import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { ProposalMetricCard, ProposalMetricsGrid, ProposalMetricsLoadingGrid } from './proposal-metrics-sections'

const stat = {
  label: 'Total Proposals',
  value: '12',
  description: 'Drafts and submitted',
  color: 'text-info',
  bg: 'bg-info/10',
}

describe('proposal metrics sections', () => {
  it('renders the loading grid', () => {
    const markup = renderToStaticMarkup(<ProposalMetricsLoadingGrid />)

    expect(markup).toContain('animate-pulse')
    expect(markup.match(/animate-pulse/g)?.length).toBe(4)
  })

  it('renders the stat card and grid', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalMetricCard stat={stat} />
        <ProposalMetricsGrid stats={[stat]} />
      </>,
    )

    expect(markup).toContain('Total Proposals')
    expect(markup).toContain('12')
    expect(markup).toContain('Drafts and submitted')
  })
})
