'use client';
import { Link } from '@/shared/ui/link';
import { useMemo } from 'react';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion';
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system';
import { cn } from '@/lib/utils';
import { formatEnUsCurrency, AGENT_CHART_WHOLE_NUMBER_FORMATTER } from '@/lib/intl/formatters';
import type { AgentChartSeries, AgentDataSection, MetricItem } from './agent-message-data';
import { getAgentChartFill } from './agent-message-data';
const AGENT_CHART_BAR_INITIAL = { width: 0 } as const;
const AGENT_CHART_BAR_TRANSITION = {
    duration: motionDurationSeconds.slow,
    ease: motionEasing.out,
} as const;
function formatChartValue(value: number, format: AgentChartSeries['valueFormat'], currencyCode = 'USD'): string {
    if (format === 'currency') {
        return formatEnUsCurrency(Math.abs(value), currencyCode, { maximumFractionDigits: 0 });
    }
    if (format === 'percent') {
        const signed = value > 0 ? '+' : '';
        return `${signed}${value.toFixed(1)}%`;
    }
    return AGENT_CHART_WHOLE_NUMBER_FORMATTER.format(Math.abs(value));
}
function AgentChartBarFill({ width, fill }: {
    width: number;
    fill: string;
}) {
    const prefersReducedMotion = useReducedMotion();
    const style = ({ width: `${width}%`, backgroundColor: fill });
    const animate = ({ width: `${width}%` });
    const barColorStyle = ({ backgroundColor: fill });
    if (prefersReducedMotion) {
        return <div className="h-full rounded-full" style={style}/>;
    }
    return (<LazyMotion features={domAnimation}>
      <m.div className="h-full rounded-full" initial={AGENT_CHART_BAR_INITIAL} animate={animate} transition={AGENT_CHART_BAR_TRANSITION} style={barColorStyle}/>
    </LazyMotion>);
}
export function AgentMessageBarChart({ series }: {
    series: AgentChartSeries;
}) {
    const maxValue = Math.max(...series.points.map((point) => Math.abs(point.value)), 1);
    return (<div className="rounded-xl border border-border/50 bg-background/90 p-3 shadow-sm">
      <div className="mb-3 flex items-start gap-2">
        <BarChart3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{series.title}</p>
          {series.subtitle ? <p className="text-[11px] text-muted-foreground">{series.subtitle}</p> : null}
        </div>
      </div>
      <ul className="space-y-2.5" aria-label={series.title}>
        {series.points.map((point, index) => {
            const width = Math.max((Math.abs(point.value) / maxValue) * 100, point.value !== 0 ? 8 : 0);
            const fill = getAgentChartFill(index);
            const label = (<div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate font-medium text-foreground">{point.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatChartValue(point.value, series.valueFormat, series.currencyCode)}
              </span>
            </div>);
            const bar = (<div className="h-2.5 overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/40" role="presentation">
              <AgentChartBarFill width={width} fill={fill}/>
            </div>);
            if (point.href) {
                return (<li key={point.name}>
                <Link href={point.href} className="block rounded-lg border border-transparent px-1 py-0.5 transition-colors hover:border-border/60 hover:bg-muted/30">
                  {label}
                  {bar}
                </Link>
              </li>);
            }
            return (<li key={point.name}>
              {label}
              {bar}
            </li>);
        })}
      </ul>
    </div>);
}
function DeltaPill({ delta, tone }: {
    delta: string;
    tone?: MetricItem['deltaTone'];
}) {
    return (<span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums', tone === 'positive' && 'bg-success/12 text-success', tone === 'negative' && 'bg-destructive/12 text-destructive', tone === 'neutral' && 'bg-muted text-muted-foreground')}>
      {delta}
    </span>);
}
export function AgentMetricTile({ item, emphasized = false }: {
    item: MetricItem;
    emphasized?: boolean;
}) {
    return (<div className={cn('rounded-xl border border-border/50 bg-background px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md', emphasized && 'border-primary/20 bg-linear-to-br from-primary/[0.06] to-background ring-1 ring-primary/10')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{item.label}</span>
        {item.delta ? <DeltaPill delta={item.delta} tone={item.deltaTone}/> : null}
      </div>
      <p className={cn('mt-1 font-bold tabular-nums tracking-tight text-foreground', emphasized ? 'text-xl' : 'text-lg')}>
        {item.value}
      </p>
    </div>);
}
export function AgentOverviewChips({ items }: {
    items: MetricItem[];
}) {
    return (<div className="flex flex-wrap gap-2">
      {items.map((item) => (<div key={item.label} className="inline-flex min-w-[7rem] flex-col rounded-lg border border-border/50 bg-background/80 px-2.5 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</span>
          <span className="mt-0.5 text-sm font-medium text-foreground">{item.value}</span>
        </div>))}
    </div>);
}
export function AgentPerformanceMetricsGrid({ items }: {
    items: MetricItem[];
}) {
    const hero = items.filter((item) => item.emphasis === 'primary');
    const rest = items.filter((item) => item.emphasis !== 'primary');
    return (<div className="space-y-3">
      {hero.length > 0 ? (<div className="grid gap-2 sm:grid-cols-3">{hero.map((item) => <AgentMetricTile key={item.label} item={item} emphasized/>)}</div>) : null}
      {rest.length > 0 ? (<div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {rest.map((item) => (<AgentMetricTile key={item.label} item={item}/>))}
        </div>) : null}
    </div>);
}
export function AgentMetricsSection({ section }: {
    section: Extract<AgentDataSection, {
        type: 'metrics';
    }>;
}) {
    if (section.title === 'Insight') {
        return <p className="text-sm leading-relaxed text-foreground">{section.items[0]?.value}</p>;
    }
    if (section.title === 'Overview') {
        return <AgentOverviewChips items={section.items}/>;
    }
    if (section.title === 'Performance' || section.title === 'Task Summary') {
        return <AgentPerformanceMetricsGrid items={section.items}/>;
    }
    if (section.title === 'Status Breakdown') {
        return (<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {section.items.map((item) => (<AgentMetricTile key={item.label} item={item}/>))}
      </div>);
    }
    return (<div className="grid gap-2 grid-cols-2 md:grid-cols-3">
      {section.items.map((item) => (<AgentMetricTile key={item.label} item={item}/>))}
    </div>);
}
export function AgentListSection({ section, accentClass, }: {
    section: Extract<AgentDataSection, {
        type: 'list';
    }>;
    accentClass: string;
}) {
    return (<ul className="space-y-2">
      {section.items.map((item) => {
            const inner = (<div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{item.primary}</p>
              {item.secondary ? <p className="mt-0.5 text-xs text-muted-foreground">{item.secondary}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {item.delta ? <DeltaPill delta={item.delta} tone={item.deltaTone}/> : null}
              {item.href ? <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden/> : null}
            </div>
          </div>);
            if (item.href) {
                return (<li key={`${item.primary}-${item.secondary ?? ''}`}>
              <Link href={item.href} className={cn('block rounded-lg border border-border/50 bg-background px-3 py-2.5 shadow-sm transition-colors hover:border-accent/30 hover:bg-muted/30', accentClass)}>
                {inner}
              </Link>
            </li>);
            }
            return (<li key={`${item.primary}-${item.secondary ?? ''}`} className={cn('rounded-lg border border-border/50 bg-background px-3 py-2.5 shadow-sm', accentClass)}>
            {inner}
          </li>);
        })}
    </ul>);
}
