import { describe, expect, it } from 'vitest'

import { resolveMetaAdSetDefaults } from './meta-ad-set-defaults'

describe('resolveMetaAdSetDefaults', () => {
  it('uses traffic defaults for OUTCOME_TRAFFIC', () => {
    expect(resolveMetaAdSetDefaults('OUTCOME_TRAFFIC')).toEqual({
      optimizationGoal: 'LINK_CLICKS',
      billingEvent: 'IMPRESSIONS',
    })
  })

  it('uses lead defaults for OUTCOME_LEADS', () => {
    const result = resolveMetaAdSetDefaults('OUTCOME_LEADS')
    expect(result.optimizationGoal).toBeTruthy()
    expect(result.billingEvent).toBeTruthy()
  })

  it('falls back when objective unknown', () => {
    expect(resolveMetaAdSetDefaults('UNKNOWN')).toEqual({
      optimizationGoal: 'LINK_CLICKS',
      billingEvent: 'IMPRESSIONS',
    })
  })
})
