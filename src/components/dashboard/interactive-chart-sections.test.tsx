import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  ChartTooltipContent,
  InteractiveChartEmptyState,
  InteractiveChartHeader,
  PieTooltipContent,
} from './interactive-chart-sections'

describe('interactive chart sections', () => {
  it('renders header controls and empty state', () => {
    const markup = renderToStaticMarkup(
      <>
        <InteractiveChartHeader
          chartType="bar"
          description="Revenue over time"
          handleExport={vi.fn()}
          isRefreshing={true}
          onRefresh={vi.fn()}
          setChartType={vi.fn()}
          setTimeRange={vi.fn()}
          showExport={true}
          showRefresh={true}
          timeRange="30d"
          title="Revenue"
        />
        <InteractiveChartEmptyState />
      </>,
    )

    expect(markup).toContain('Revenue')
    expect(markup).toContain('Revenue over time')
    expect(markup).toContain('Bar Chart')
    expect(markup).toContain('No data available for this time range')
  })

  it('renders tooltip content blocks', () => {
    const chartMarkup = renderToStaticMarkup(
      <ChartTooltipContent
        active={true}
        payload={[{ payload: { date: '2026-03-11', value: 42, category: 'Paid' } }]}
        xAxisKey="date"
        dataKey="value"
        valueFormatter={(value) => `$${value}`}
      />,
    )

    const pieMarkup = renderToStaticMarkup(
      <PieTooltipContent active={true} payload={[{ name: 'Paid', value: 42 }]} valueFormatter={(value) => `$${value}`} />,
    )

    expect(chartMarkup).toContain('2026-03-11')
    expect(chartMarkup).toContain('$42')
    expect(chartMarkup).toContain('Paid')
    expect(pieMarkup).toContain('Paid')
    expect(pieMarkup).toContain('$42')
  })
})