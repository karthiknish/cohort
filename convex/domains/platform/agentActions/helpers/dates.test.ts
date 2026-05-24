import { describe, expect, it } from 'vitest'

import {
  getPreviousCalendarMonthRange,
  getPreviousCalendarYearRange,
  parseRelativeDayRangeFromIntent,
  resolveIntentDateRange,
  resolvePeriodLabelForExplicitRange,
  resolveReportWindow,
} from './dates'

describe('parseRelativeDayRangeFromIntent', () => {
  const nowMs = Date.UTC(2026, 4, 23, 12, 0, 0)

  it('parses last N days', () => {
    expect(parseRelativeDayRangeFromIntent('ads summary from last 100 days', nowMs)).toEqual({
      startDate: '2026-02-13',
      endDate: '2026-05-23',
    })
  })

  it('parses last month as the previous calendar month', () => {
    expect(parseRelativeDayRangeFromIntent('analytics summary in the last month', nowMs)).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    })
  })

  it('parses this month from the first of the month through today', () => {
    expect(parseRelativeDayRangeFromIntent('analytics summary this month', nowMs)).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-05-23',
    })
  })

  it('parses last year as the previous calendar year', () => {
    expect(parseRelativeDayRangeFromIntent('ads summary from last year', nowMs)).toEqual({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    })
  })

  it('parses common last-month typos', () => {
    expect(parseRelativeDayRangeFromIntent('ads summary from ;ast month', nowMs)).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    })
    expect(parseRelativeDayRangeFromIntent('give me ads summary from ast month', nowMs)).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    })
  })

  it('parses yesterday and today as single-day windows', () => {
    expect(parseRelativeDayRangeFromIntent('ads spend yesterday', nowMs)).toEqual({
      startDate: '2026-05-22',
      endDate: '2026-05-22',
    })
    expect(parseRelativeDayRangeFromIntent('analytics summary for today', nowMs)).toEqual({
      startDate: '2026-05-23',
      endDate: '2026-05-23',
    })
  })

  it('parses this week from Monday through today', () => {
    expect(parseRelativeDayRangeFromIntent('social summary this week', nowMs)).toEqual({
      startDate: '2026-05-18',
      endDate: '2026-05-23',
    })
  })

  it('parses calendar quarter windows', () => {
    expect(parseRelativeDayRangeFromIntent('ads summary last quarter', nowMs)).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    })
    expect(parseRelativeDayRangeFromIntent('report for q1 2026', nowMs)).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    })
  })
})

describe('resolvePeriodLabelForExplicitRange', () => {
  const nowMs = Date.UTC(2026, 4, 23, 12, 0, 0)

  it('labels the previous calendar month', () => {
    const range = getPreviousCalendarMonthRange(nowMs)
    expect(resolvePeriodLabelForExplicitRange(range.startDate, range.endDate, nowMs)).toBe('Last month')
  })

  it('labels the previous calendar year', () => {
    const range = getPreviousCalendarYearRange(nowMs)
    expect(resolvePeriodLabelForExplicitRange(range.startDate, range.endDate, nowMs)).toBe('Last year')
  })

  it('uses a readable label for arbitrary ranges', () => {
    expect(resolveReportWindow('weekly', { startDate: '2026-02-01', endDate: '2026-02-10' })).toMatchObject({
      periodLabel: 'Feb 1–10, 2026',
      startDate: '2026-02-01',
      endDate: '2026-02-10',
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
