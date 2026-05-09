import { describe, expect, it } from 'vitest'

import { isMutableAdvantageState } from './types'

describe('isMutableAdvantageState', () => {
  it('accepts classic campaign mutations', () => {
    expect(isMutableAdvantageState('classic')).toBe(true)
  })

  it('rejects deprecated Advantage+ mutation states', () => {
    expect(isMutableAdvantageState('advantage_plus_sales')).toBe(false)
    expect(isMutableAdvantageState('advantage_plus_app')).toBe(false)
  })
})