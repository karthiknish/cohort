'use client';
import { useMemo } from 'react';
import { FadeInStagger } from '@/shared/ui/animate-in';
import { FadeInItem } from '@/shared/ui/fade-in-item';
import { cn } from '@/lib/utils';
import { buildAgentMessageCharts, type AgentChartSeries, type AgentDataSection, } from './agent-message-data';
import { AgentListSection, AgentMessageBarChart, AgentMetricsSection, } from './agent-message-visualizations';
type AgentDataSectionsProps = {
    sections: AgentDataSection[];
    operation?: string;
    data?: Record<string, unknown>;
    accentClass: string;
};
function chartForSection(charts: AgentChartSeries[], sectionTitle: string): AgentChartSeries | null {
    switch (sectionTitle) {
        case 'Performance':
            return charts.find((chart) => chart.id === 'financial') ?? charts.find((chart) => chart.id === 'delivery') ?? null;
        case 'Traffic & Conversions':
            return (charts.find((chart) => chart.id === 'analytics-traffic') ??
                charts.find((chart) => chart.id === 'analytics-period-delta') ??
                null);
        case 'Platform Breakdown':
            return charts.find((chart) => chart.id === 'providers') ?? null;
        case 'Top Campaigns':
            return charts.find((chart) => chart.id === 'top-campaigns') ?? null;
        case 'Facebook':
            return charts.find((chart) => chart.id === 'social-facebook') ?? null;
        case 'Instagram':
            return charts.find((chart) => chart.id === 'social-instagram') ?? null;
        case 'Top Facebook Posts':
            return charts.find((chart) => chart.id === 'social-top-facebook') ?? null;
        case 'Top Instagram Posts':
            return charts.find((chart) => chart.id === 'social-top-instagram') ?? null;
        case 'Status Breakdown':
            return charts.find((chart) => chart.id === 'task-status') ?? null;
        default:
            return null;
    }
}
function secondaryCharts(charts: AgentChartSeries[], primaryId: string | undefined): AgentChartSeries[] {
    if (!primaryId) {
        return charts.filter((chart) => chart.id === 'period-delta');
    }
    return charts.filter((chart) => chart.id !== primaryId && chart.id === 'period-delta');
}
export function AgentDataSections({ sections, operation, data, accentClass }: AgentDataSectionsProps) {
    const charts = buildAgentMessageCharts(operation, data);
    if (sections.length === 0 && charts.length === 0)
        return null;
    const usedChartIds = new Set<string>();
    return (<FadeInStagger className="mt-4 space-y-4" stagger={0.06}>
      {sections.length === 0 ? (() => {
            const standaloneDelta = charts.find((chart) => chart.id === 'period-delta') ??
                charts.find((chart) => chart.id === 'analytics-period-delta');
            return standaloneDelta ? (<FadeInItem y={12}>
            <AgentMessageBarChart series={standaloneDelta}/>
          </FadeInItem>) : null;
        })() : null}

      {sections.map((section) => {
            const linkedChart = chartForSection(charts, section.title);
            if (linkedChart)
                usedChartIds.add(linkedChart.id);
            const extraCharts = section.title === 'Performance'
                ? charts.filter((chart) => chart.id === 'delivery' || chart.id === 'period-delta')
                : section.title === 'Traffic & Conversions'
                    ? charts.filter((chart) => chart.id === 'analytics-period-delta')
                    : secondaryCharts(charts, linkedChart?.id);
            return (<FadeInItem key={section.title} y={12} className={cn('rounded-xl border border-border/60 bg-background/85 p-3 shadow-sm', accentClass)}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
              {section.title}
            </p>

            {linkedChart ? (<div className="mb-3">
                <AgentMessageBarChart series={linkedChart}/>
              </div>) : null}

            {section.type === 'metrics' ? (<div className={linkedChart ? 'mt-1' : undefined}>
                <AgentMetricsSection section={section}/>
              </div>) : (<AgentListSection section={section} accentClass={accentClass}/>)}

            {extraCharts.flatMap((chart) => {
                    if (usedChartIds.has(chart.id))
                        return [];
                    usedChartIds.add(chart.id);
                    return [(<div key={chart.id} className="mt-3">
                  <AgentMessageBarChart series={chart}/>
                </div>)];
                })}
          </FadeInItem>);
        })}

      {charts.flatMap((chart) => !usedChartIds.has(chart.id)
            ? [
                <FadeInItem key={chart.id} y={12}>
                <AgentMessageBarChart series={chart}/>
              </FadeInItem>,
            ]
            : [])}
    </FadeInStagger>);
}
