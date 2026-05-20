import { describe, expect, it } from 'vitest'

function parseInsightValues(data: Array<{ name?: string; values?: Array<{ value?: unknown; end_time?: string }> }>) {
  const byName = new Map<string, Map<string, number>>()

  for (const metric of data ?? []) {
    const name = typeof metric?.name === 'string' ? metric.name : null
    if (!name) continue

    const dateMap = new Map<string, number>()
    for (const point of metric.values ?? []) {
      const endTime = typeof point?.end_time === 'string' ? point.end_time : null
      if (!endTime) continue
      const date = endTime.slice(0, 10)
      const value = typeof point?.value === 'number' ? point.value : Number(point?.value ?? 0)
      dateMap.set(date, Number.isFinite(value) ? value : 0)
    }
    byName.set(name, dateMap)
  }

  return byName
}

describe('Facebook Page insights mapping', () => {
  it('parses daily insight values by metric name', () => {
    const byName = parseInsightValues([
      {
        name: 'page_impressions',
        values: [{ value: 120, end_time: '2026-05-01T07:00:00+0000' }],
      },
      {
        name: 'page_impressions_unique',
        values: [{ value: 90, end_time: '2026-05-01T07:00:00+0000' }],
      },
      {
        name: 'page_post_engagements',
        values: [{ value: 15, end_time: '2026-05-01T07:00:00+0000' }],
      },
    ])

    expect(byName.get('page_impressions')?.get('2026-05-01')).toBe(120)
    expect(byName.get('page_impressions_unique')?.get('2026-05-01')).toBe(90)
    expect(byName.get('page_post_engagements')?.get('2026-05-01')).toBe(15)
  })
})
