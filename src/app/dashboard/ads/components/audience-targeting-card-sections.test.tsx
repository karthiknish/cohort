import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  AudienceTargetingContent,
  AudienceTargetingDisconnectedState,
  AudienceTargetingHeader,
} from './audience-targeting-card-sections'

const insights = {
  totalEntities: 2,
  demographicCoverage: { hasAgeTargeting: true, hasGenderTargeting: true, hasLocationTargeting: true },
  audienceStats: { totalAudiences: 6, hasCustomAudiences: true, hasRemarketingLists: false },
  interestStats: { totalInterests: 12, totalKeywords: 4 },
}

const targeting = [{
  providerId: 'meta_ads',
  entityId: 'entity-1',
  entityName: 'Prospecting Ad Set',
  entityType: 'adGroup' as const,
  demographics: { ageRanges: ['AGE_25_34'], genders: ['FEMALE'], languages: [] },
  audiences: { included: [{ id: 'aud-1', name: 'Website Visitors', type: 'remarketing' }], excluded: [] },
  locations: { included: [{ id: 'loc-1', name: 'United States', type: 'country' }], excluded: [] },
  interests: [],
  keywords: [],
  devices: [],
  placements: [],
  professional: { industries: [{ id: 'ind-1', name: 'Software' }], jobTitles: [{ id: 'job-1', name: 'CMO' }], companySizes: [], seniorities: [] },
}]

describe('audience targeting card sections', () => {
  it('renders the disconnected state and header', () => {
    const disconnectedMarkup = renderToStaticMarkup(<AudienceTargetingDisconnectedState providerName="Meta Ads" />)
    const headerMarkup = renderToStaticMarkup(<AudienceTargetingHeader insights={insights} loading={false} onLoadTargeting={vi.fn()} onOpenBuilder={vi.fn()} providerName="Meta Ads" />)

    expect(disconnectedMarkup).toContain('Connect Meta Ads to view targeting criteria')
    expect(headerMarkup).toContain('2 targeting configs')
    expect(headerMarkup).toContain('Create Audience')
    expect(headerMarkup).toContain('Load Targeting')
  })

  it('renders the empty content state', () => {
    const markup = renderToStaticMarkup(
      <AudienceTargetingContent expandedId={null} formatAgeRange={vi.fn()} insights={null} onEdit={vi.fn()} onToggleExpanded={vi.fn()} targeting={[]} />,
    )

    expect(markup).toContain('Click &quot;Load Targeting&quot; to view audience targeting data.')
  })

  it('renders the summary and expanded targeting details', () => {
    const markup = renderToStaticMarkup(
      <AudienceTargetingContent expandedId="entity-1" formatAgeRange={() => '25-34'} insights={insights} onEdit={vi.fn()} onToggleExpanded={vi.fn()} targeting={targeting} />,
    )

    expect(markup).toContain('Audiences')
    expect(markup).toContain('Geo Targeting')
    expect(markup).toContain('Prospecting Ad Set')
    expect(markup).toContain('25-34')
    expect(markup).toContain('Website Visitors')
    expect(markup).toContain('Software')
  })
})