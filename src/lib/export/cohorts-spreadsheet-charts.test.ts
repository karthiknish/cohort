import { describe, expect, it } from 'vitest'

import {
  buildAdsMetricsCharts,
  buildAnalyticsExportCharts,
  buildCategoryCountChart,
  buildCollaborationExportCharts,
  buildMetricSnapshotChart,
  buildSpreadsheetChartsFromTableData,
  buildTimeSeriesChart,
  computeAxisMax,
  filterMeaningfulCharts,
  isChartSpecMeaningful,
} from './cohorts-spreadsheet-charts'

describe('cohorts spreadsheet chart builders', () => {
  it('builds category count charts', () => {
    const chart = buildCategoryCountChart(
      [
        { Status: 'Open', Priority: 'High' },
        { Status: 'Done', Priority: 'Low' },
        { Status: 'Open', Priority: 'Medium' },
      ],
      'Status',
      'Tasks by status',
      'pie',
    )

    expect(chart?.series[0]?.points).toEqual([
      { label: 'Open', value: 2 },
      { label: 'Done', value: 1 },
    ])
  })

  it('builds metric snapshot charts from numeric fields', () => {
    const chart = buildMetricSnapshotChart(
      {
        'Open Tasks': 4,
        'Completed Tasks': 9,
      },
      'Client workload snapshot',
    )

    expect(chart?.title).toBe('Client workload snapshot')
    expect(chart?.series[0]?.points).toHaveLength(2)
  })

  it('builds analytics trend and platform charts', () => {
    const charts = buildAnalyticsExportCharts([
      { date: '2026-05-01', platform: 'google', spend: 10, revenue: 20 },
      { date: '2026-05-02', platform: 'google', spend: 15, revenue: 25 },
      { date: '2026-05-03', platform: 'meta', spend: 5, revenue: 8 },
    ])

    expect(charts.map((chart) => chart.title)).toEqual([
      'Daily spend',
      'Daily revenue',
      'Spend by platform',
    ])
  })

  it('builds collaboration activity charts', () => {
    const charts = buildCollaborationExportCharts([
      { date: '5/20/2026, 10:00:00 AM', sender: 'Alex' },
      { date: '5/20/2026, 11:00:00 AM', sender: 'Alex' },
      { date: '5/21/2026, 9:00:00 AM', sender: 'Sam' },
      { date: '5/22/2026, 9:00:00 AM', sender: 'Sam' },
    ])

    expect(charts).toHaveLength(2)
    expect(charts[0]?.title).toBe('Messages over time')
    expect(charts[1]?.title).toBe('Messages by sender')
  })

  it('infers charts from generic table rows', () => {
    const charts = buildSpreadsheetChartsFromTableData(
      [
        { date: '2026-05-01', value: 10 },
        { date: '2026-05-02', value: 20 },
        { date: '2026-05-03', value: 30 },
      ],
      'Performance',
    )

    expect(charts).toHaveLength(1)
    expect(charts[0]?.kind).toBe('line')
  })

  it('returns null for empty time series input', () => {
    expect(buildTimeSeriesChart([], 'date', 'spend', 'Daily spend')).toBeNull()
  })

  it('skips sparse ads charts that are not meaningful', () => {
    const charts = buildAdsMetricsCharts([
      { date: '2026-05-01', providerId: 'facebook', spend: 4 },
      { date: '2026-05-02', providerId: 'facebook', spend: 6 },
    ])

    expect(charts).toHaveLength(0)
  })

  it('keeps ads charts when there is enough daily history', () => {
    const charts = buildAdsMetricsCharts([
      { date: '2026-05-01', providerId: 'facebook', spend: 4 },
      { date: '2026-05-02', providerId: 'facebook', spend: 6 },
      { date: '2026-05-03', providerId: 'facebook', spend: 8 },
    ])

    expect(charts.map((chart) => chart.title)).toEqual(['Daily ad spend'])
  })

  it('computes padded axis maxima for small values', () => {
    expect(computeAxisMax([0.04, 0.08])).toBeGreaterThan(0.08)
  })

  it('filters meaningless chart specs', () => {
    const charts = filterMeaningfulCharts([
      {
        title: 'Too few points',
        kind: 'line',
        series: [{ name: 'spend', points: [{ label: '2026-05-01', value: 5 }] }],
      },
    ])

    expect(charts).toHaveLength(0)
    expect(
      isChartSpecMeaningful({
        title: 'Enough points',
        kind: 'line',
        series: [
          {
            name: 'spend',
            points: [
              { label: '2026-05-01', value: 5 },
              { label: '2026-05-02', value: 8 },
              { label: '2026-05-03', value: 11 },
            ],
          },
        ],
      }),
    ).toBe(true)
  })
})
