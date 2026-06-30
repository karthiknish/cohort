'use client';
import { TrendingUp } from 'lucide-react';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { TONE_BADGE } from '../constants';
import { OVERVIEW_METRICS } from '../preview-data';
import type { PreviewTone } from '../types';
type OverviewPanelProps = {
    activeMetricId: string;
    onMetricClick: (e: MouseEvent<HTMLButtonElement>) => void;
};
export function OverviewPanel({ activeMetricId, onMetricClick }: OverviewPanelProps) {
    const metric = OVERVIEW_METRICS.find((m) => m.id === activeMetricId) ?? OVERVIEW_METRICS[0]!;
    return (<div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {OVERVIEW_METRICS.map((m) => {
            const isActive = m.id === activeMetricId;
            return (<button key={m.id} type="button" data-metric-id={m.id} aria-pressed={isActive} onClick={onMetricClick} className={cn('rounded-xl border px-3 py-2.5 text-left outline-none transition-[colors,transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none', isActive
                    ? cn('border-transparent bg-muted/90 shadow-sm ring-1 ring-primary/15', TONE_BADGE[m.tone])
                    : 'border-border/40 bg-muted/20 hover:scale-[1.01] hover:bg-muted/40 hover:shadow-sm motion-reduce:hover:scale-100')} aria-label={`${m.label}, ${m.value}, ${m.delta}`}>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
                {m.label}
              </p>
              <div className="mt-1.5 flex items-end justify-between gap-2">
                <span className="text-lg font-semibold text-foreground">{m.value}</span>
                <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', TONE_BADGE[m.tone])}>
                  {m.delta}
                </span>
              </div>
            </button>);
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
              {metric.chartLabel}
            </p>
            <TrendingUp className="size-3 text-muted-foreground/40"/>
          </div>
          <div className="flex h-20 items-end gap-[5px]">
            {metric.bars.map((bar) => (<div key={bar.id} className={cn('flex-1 rounded-t-md transition-[height,background-color] duration-300', bar.h, bar.accent ? 'bg-accent' : 'bg-accent/10')}/>))}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
          <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
            Needs attention
          </p>
          <div className="space-y-2">
            {([
            { id: 'q1', title: 'Apex launch brief', tag: 'Proposal', tone: 'warning' as PreviewTone },
            { id: 'q2', title: 'BlueWave weekly report', tag: 'Review', tone: 'info' as PreviewTone },
            { id: 'q3', title: 'Novex kickoff room', tag: 'Meeting', tone: 'success' as PreviewTone },
        ] as const).map((item) => (<div key={item.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-2.5 py-2">
                <span className="text-[11px] font-medium text-foreground/80">{item.title}</span>
                <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', TONE_BADGE[item.tone])}>
                  {item.tag}
                </span>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
