import { describe, expect, it } from 'vitest'

import { metaDatetimeLocalToIso } from './meta-datetime'

describe('metaDatetimeLocalToIso', () => {
  it('converts datetime-local values to ISO strings', () => {
    const iso = metaDatetimeLocalToIso('2026-05-23T14:30')
    expect(iso).toBeTruthy()
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('returns undefined for empty input', () => {
    expect(metaDatetimeLocalToIso('')).toBeUndefined()
  })
})
