import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { SocialSurfacePanel } from './social-surface-panel'

const overview = {
  surface: 'facebook',
  impressions: 45000,
  reach: 12300,
  engagedUsers: 1200,
  reactions: 620,
  comments: 140,
  shares: 90,
  saves: 35,
  followerCountLatest: 5000,
  followerDeltaTotal: 250,
  rowCount: 28,
} as const

const organicKpis = [
  { id: 'reach', label: 'Reach', value: '12.3K', detail: '45K total impressions this period' },
  { id: 'impressions', label: 'Impressions', value: '45K', detail: 'Avg 3.7x per person reached' },
  { id: 'engaged_users', label: 'Engaged Users', value: '1.2K', detail: '9.76% engagement rate' },
  { id: 'follower_growth', label: 'Follower Growth', value: '+250', detail: '5,000 total followers this period' },
]

describe('SocialSurfacePanel', () => {
  it('renders loading skeleton when overviewLoading is true', () => {
    const markup = renderToStaticMarkup(
      <SocialSurfacePanel
        surface="facebook"
        kpis={[]}
        overview={null}
        overviewLoading={true}
        connected={true}
      />,
    )
    expect(markup).not.toContain('Facebook not connected')
  })

  it('renders organic KPI grid when connected and data loaded', () => {
    const markup = renderToStaticMarkup(
      <SocialSurfacePanel
        surface="facebook"
        kpis={organicKpis}
        overview={overview}
        overviewLoading={false}
        connected={true}
      />,
    )
    expect(markup).toContain('Facebook organic performance')
    expect(markup).toContain('Reach')
    expect(markup).toContain('12.3K')
    expect(markup).toContain('Audience footprint')
    expect(markup).toContain('Interaction mix')
    expect(markup).toContain('Derived signals')
    expect(markup).toContain('Engagement rate')
  })

  it('renders empty state when not connected', () => {
    const markup = renderToStaticMarkup(
      <SocialSurfacePanel
        surface="instagram"
        kpis={[]}
        overview={null}
        overviewLoading={false}
        connected={false}
      />,
    )
    expect(markup).toContain('Instagram not connected')
    expect(markup).toContain('Connect Instagram')
  })
})