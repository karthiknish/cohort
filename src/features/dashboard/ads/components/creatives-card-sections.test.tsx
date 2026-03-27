import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: () => <span>mock-image</span>,
}))

vi.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import {
  CreativeComparisonDialog,
  CreativesCardContent,
  CreativesCardHeader,
  CreativesDisconnectedState,
} from './creatives-card-sections'

const creative = {
  providerId: 'facebook',
  creativeId: 'creative-1',
  campaignId: 'campaign-1',
  name: 'Summer Ad',
  type: 'IMAGE',
  status: 'ACTIVE',
  isLeadGen: true,
  headlines: ['Summer headline'],
  descriptions: ['Summer description'],
  landingPageUrl: 'https://example.com',
  callToAction: 'Learn More',
  pageName: 'Brand Page',
}

const headerSummary = { total: 5, byType: { IMAGE: 3 } }
const contentSummary = { total: 1, byType: { IMAGE: 1 } }

describe('creatives card sections', () => {
  it('renders the disconnected state and card header', () => {
    const disconnectedMarkup = renderToStaticMarkup(<CreativesDisconnectedState providerName="Meta Ads" />)
    const headerMarkup = renderToStaticMarkup(
      <CreativesCardHeader loading={false} onCompare={vi.fn()} onLoad={vi.fn()} providerName="Meta Ads" selectedCount={2} summary={headerSummary} />,
    )

    expect(disconnectedMarkup).toContain('Connect Meta Ads to view creatives')
    expect(headerMarkup).toContain('5 creatives')
    expect(headerMarkup).toContain('Compare &amp; Test (2)')
    expect(headerMarkup).toContain('Load Creatives')
  })

  it('renders the creatives content table', () => {
    const markup = renderToStaticMarkup(
      <CreativesCardContent creatives={[creative]} onToggleSelected={vi.fn()} selectedIds={new Set(['creative-1'])} summary={contentSummary} />,
    )

    expect(markup).toContain('IMAGE: 1')
    expect(markup).toContain('Summer Ad')
    expect(markup).toContain('Summer headline')
    expect(markup).toContain('Lead')
  })

  it('renders the comparison dialog', () => {
    const markup = renderToStaticMarkup(
      <CreativeComparisonDialog creatives={[creative]} onOpenChange={vi.fn()} onPromote={vi.fn()} open={true} providerName="Meta Ads" selectedIds={new Set(['creative-1'])} />,
    )

    expect(markup).toContain('Creative Comparison &amp; A/B Testing')
    expect(markup).toContain('Comparing 1 selected creatives across Meta Ads')
    expect(markup).toContain('Promote to Winner')
    expect(markup).toContain('Tip: Compare CTR and Conversion Rates')
  })
})