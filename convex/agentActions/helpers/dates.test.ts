import { describe, expect, it } from 'vitest'

import { parseRelativeDayRangeFromIntent, resolveIntentDateRange } from './dates'

describe('parseRelativeDayRangeFromIntent', () => {
  const nowMs = Date.UTC(2026, 4, 23, 12, 0, 0)

  it('parses last N days', () => {
    expect(parseRelativeDayRangeFromIntent('ads summary from last 100 days', nowMs)).toEqual({
      startDate: '2026-02-13',
      endDate: '2026-05-23',
    })
  })

  it('parses last month', () => {
    expect(parseRelativeDayRangeFromIntent('analytics summary in the last month', nowMs)).toEqual({
      startDate: '2026-04-24',
      endDate: '2026-05-23',
    })
  })
})

describe('resolveIntentDateRange', () => {
  it('prefers explicit ranges over relative windows', () => {
    expect(
      resolveIntentDateRange('metrics from 2026-01-01 to 2026-01-31 in the last 100 days'),
    ).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    })
  })
})
