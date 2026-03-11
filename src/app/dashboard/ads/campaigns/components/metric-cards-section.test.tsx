import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MetricCardsSection } from './metric-cards-section'

describe('MetricCardsSection', () => {
  it('formats spend, cpa, and cpc with the provided currency', () => {
    const markup = renderToStaticMarkup(
      <MetricCardsSection
        loading={false}
        currency="GBP"
        efficiencyScore={87}
        metrics={{
          spend: 1234,
          impressions: 12000,
          clicks: 320,
          conversions: 18,
          revenue: 4567,
          ctr: 2.67,
          cpc: 3.86,
          cpa: 68.56,
          roas: 3.7,
          convRate: 5.63,
          reach: 8200,
        }}
      />,
    )

    expect(markup).toContain('£1,234.00')
    expect(markup).toContain('£68.56')
    expect(markup).toContain('£3.86')
    expect(markup).toContain('87%')
  })
})