import { describe, expect, it } from 'vitest'

import { buildGoogleAnalyticsStory } from './google-analytics-story'

describe('buildGoogleAnalyticsStory', () => {
  it('builds deltas, momentum, and top days for a GA range', () => {
    const story = buildGoogleAnalyticsStory({
      currentTotals: { users: 1200, sessions: 1500, conversions: 60, revenue: 3200 },
      previousTotals: { users: 1000, sessions: 1300, conversions: 40, revenue: 2500 },
      selectedRangeDays: 7,
      chartData: [
        { date: '2026-03-01', users: 100, sessions: 140, conversions: 4, revenue: 300 },
        { date: '2026-03-02', users: 180, sessions: 220, conversions: 10, revenue: 450 },
        { date: '2026-03-03', users: 210, sessions: 260, conversions: 8, revenue: 700 },
      ],
    })

    expect(story.momentum).toBe('up')
    expect(story.activeDays).toBe(3)
    expect(story.coverageRatio).toBeCloseTo(3 / 7, 4)
    expect(story.deltas.users.direction).toBe('up')
    expect(story.deltas.users.deltaPercent).toBeCloseTo(20, 1)
    expect(story.topSessionsDay?.date).toBe('2026-03-03')
    expect(story.topConversionDay?.date).toBe('2026-03-02')
    expect(story.topRevenueDay?.date).toBe('2026-03-03')
  })

  it('treats growth from zero as new', () => {
    const story = buildGoogleAnalyticsStory({
      currentTotals: { users: 50, sessions: 80, conversions: 0, revenue: 0 },
      previousTotals: { users: 0, sessions: 0, conversions: 0, revenue: 0 },
      selectedRangeDays: 5,
      chartData: [],
    })

    expect(story.deltas.users.direction).toBe('new')
    expect(story.deltas.sessions.direction).toBe('new')
    expect(story.deltas.revenue.direction).toBe('flat')
  })
})