import { describe, expect, it } from 'vitest'

import { getObjectiveConfig } from './index'

describe('getObjectiveConfig', () => {
  it('returns direct OUTCOME_* config', () => {
    expect(getObjectiveConfig('OUTCOME_SALES')?.objective).toBe('OUTCOME_SALES')
  })

  it('maps extended API objectives to nearest module', () => {
    expect(getObjectiveConfig('STORE_TRAFFIC')?.objective).toBe('OUTCOME_TRAFFIC')
    expect(getObjectiveConfig('PRODUCT_CATALOG_SALES')?.objective).toBe('OUTCOME_SALES')
    expect(getObjectiveConfig('VIDEO_VIEWS')?.objective).toBe('OUTCOME_ENGAGEMENT')
    expect(getObjectiveConfig('OUTCOME_PAGE_LIKES')?.objective).toBe('OUTCOME_ENGAGEMENT')
  })

  it('returns null for unknown objective', () => {
    expect(getObjectiveConfig('NOT_A_REAL_OBJECTIVE_999')).toBeNull()
  })
})
