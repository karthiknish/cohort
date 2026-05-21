'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import {
  buildAgentMessageCharts,
  type AgentChartSeries,
  type AgentDataSection,
} from './agent-message-data'
import {
  AgentListSection,
  AgentMessageBarChart,
  AgentMetricsSection,
} from './agent-message-visualizations'

type AgentDataSectionsProps = {
  sections: AgentDataSection[]
  operation?: string
  data?: Record<string, unknown>
  accentClass: string
}

function chartForSection(charts: AgentChartSeries[], sectionTitle: string): AgentChartSeries | null {
  switch (sectionTitle) {
    case 'Performance':
      return charts.find((chart) => chart.id === 'financial') ?? charts.find((chart) => chart.id === 'delivery') ?? null
    case 'Platform Breakdown':
      return charts.find((chart) => chart.id === 'providers') ?? null
    case 'Top Campaigns':
      return charts.find((chart) => chart.id === 'top-campaigns') ?? null
    case 'Status Breakdown':
      return charts.find((chart) => chart.id === 'task-status') ?? null
    default:
      return null
  }
}

function secondaryCharts(charts: AgentChartSeries[], primaryId: string | undefined): AgentChartSeries[] {
  if (!primaryId) {
    return charts.filter((chart) => chart.id === 'period-delta')
  }
  return charts.filter((chart) => chart.id !== primaryId && chart.id === 'period-delta')
}

export function AgentDataSections({ sections, operation, data, accentClass }: AgentDataSectionsProps) {
  const charts = useMemo(() => buildAgentMessageCharts(operation, data), [operation, data])

  if (sections.length === 0 && charts.length === 0) return null

  const usedChartIds = new Set<string>()

  return (
    <div className="mt-4 space-y-4">
      {charts.find((chart) => chart.id === 'period-delta') && sections.length === 0 ? (
        <AgentMessageBarChart series={charts.find((chart) => chart.id === 'period-delta')!} />
      ) : null}

      {sections.map((section) => {
        const linkedChart = chartForSection(charts, section.title)
        if (linkedChart) usedChartIds.add(linkedChart.id)
        const extraCharts = section.title === 'Performance'
          ? charts.filter((chart) => chart.id === 'delivery' || chart.id === 'period-delta')
          : secondaryCharts(charts, linkedChart?.id)

        return (
          <div
            key={section.title}
            className={cn(
              'rounded-xl border border-border/60 bg-background/85 px-3 py-3 shadow-sm',
              accentClass,
            )}
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
              {section.title}
            </p>

            {linkedChart ? (
              <div className="mb-3">
                <AgentMessageBarChart series={linkedChart} />
              </div>
            ) : null}

            {section.type === 'metrics' ? (
              <div className={linkedChart ? 'mt-1' : undefined}>
                <AgentMetricsSection section={section} />
              </div>
            ) : (
              <AgentListSection section={section} accentClass={accentClass} />
            )}

            {extraCharts
              .filter((chart) => !usedChartIds.has(chart.id))
              .map((chart) => {
                usedChartIds.add(chart.id)
                return (
                  <div key={chart.id} className="mt-3">
                    <AgentMessageBarChart series={chart} />
                  </div>
                )
              })}
          </div>
        )
      })}

      {charts
        .filter((chart) => !usedChartIds.has(chart.id))
        .map((chart) => (
          <AgentMessageBarChart key={chart.id} series={chart} />
        ))}
    </div>
  )
}
