import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { SocialSurfacePanel } from './social-surface-panel'

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
        overviewLoading={false}
        connected={true}
      />,
    )
    expect(markup).toContain('Facebook organic performance')
    expect(markup).toContain('Reach')
    expect(markup).toContain('12.3K')
  })

  it('renders empty state when not connected', () => {
    const markup = renderToStaticMarkup(
      <SocialSurfacePanel
        surface="instagram"
        kpis={[]}
        overviewLoading={false}
        connected={false}
      />,
    )
    expect(markup).toContain('Instagram not connected')
    expect(markup).toContain('Connect Instagram')
  })
})