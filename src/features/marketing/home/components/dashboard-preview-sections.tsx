'use client';
import { ArrowUpRight, Bot, BriefcaseBusiness, CalendarClock, Sparkles, TrendingUp, } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { ViewTransition, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { DASHBOARD_VIEWS, EMPHASIZED_BAR_CLASSES, TONE_BADGE_CLASSES, TONE_DOT_CLASSES, type PreviewMetric, type PreviewView, } from './dashboard-preview-data';
export function DashboardPreviewChrome() {
    return (<div className="border-b border-border/60 bg-muted/70 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-destructive/70"/>
            <span className="size-3 rounded-full bg-warning/70"/>
            <span className="size-3 rounded-full bg-success/70"/>
          </div>
          <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            app.cohorts.ai/dashboard
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-success uppercase">
            Interactive preview
          </div>
          <Link href="/dashboard" transitionTypes={['nav-forward']} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
            Open dashboard
            <ArrowUpRight className="size-3.5"/>
          </Link>
        </div>
      </div>
    </div>);
}
type DashboardPreviewViewRailProps = {
    activeViewId: PreviewView['id'];
    onViewSelect: (event: MouseEvent<HTMLButtonElement>) => void;
};
export function DashboardPreviewViewRail({ activeViewId, onViewSelect }: DashboardPreviewViewRailProps) {
    return (<div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
      {DASHBOARD_VIEWS.map((view) => {
            const isActive = view.id === activeViewId;
            const ViewIcon = view.Icon;
            return (<button key={view.id} type="button" data-view-id={view.id} aria-pressed={isActive} onClick={onViewSelect} className={cn('flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left transition-colors lg:min-h-27', isActive
                    ? 'border-accent/30 bg-accent/8 text-foreground'
                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/70')}>
            <ViewIcon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')}/>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">{view.label}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground lg:text-[10px]">{view.status}</p>
            </div>
          </button>);
        })}
    </div>);
}
type DashboardPreviewMetricPickerProps = {
    currentView: PreviewView;
    currentMetric: PreviewMetric;
    onMetricSelect: (event: MouseEvent<HTMLButtonElement>) => void;
};
export function DashboardPreviewMetricPicker({ currentView, currentMetric, onMetricSelect, }: DashboardPreviewMetricPickerProps) {
    return (<div className="rounded-3xl border border-border/60 bg-background/90 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            {currentView.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-[1.9rem]">{currentView.label}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{currentView.summary}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
          <span className="size-2 rounded-full bg-foreground/55"/>
          {currentView.status}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {currentView.metrics.map((metric) => {
            const isActive = metric.id === currentMetric.id;
            return (<ViewTransition key={metric.id}>
              <button type="button" data-metric-id={metric.id} aria-pressed={isActive} onClick={onMetricSelect} className={cn('rounded-2xl border p-3 text-left transition-colors', isActive
                    ? cn('border-transparent bg-muted/90', TONE_BADGE_CLASSES[metric.tone])
                    : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60')}>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  {metric.label}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-2xl font-semibold text-foreground">{metric.value}</span>
                  <span className={cn('rounded-full border px-2 py-1 text-[11px] font-semibold', TONE_BADGE_CLASSES[metric.tone])}>
                    {metric.delta}
                  </span>
                </div>
              </button>
            </ViewTransition>);
        })}
      </div>
    </div>);
}
type DashboardPreviewMetricDetailProps = {
    currentMetric: PreviewMetric;
};
export function DashboardPreviewMetricDetail({ currentMetric }: DashboardPreviewMetricDetailProps) {
    return (<div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(250px,0.85fr)]">
      <ViewTransition key={currentMetric.id}>
        <div className="rounded-3xl border border-border/60 bg-background/90 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {currentMetric.focusLabel}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-foreground">{currentMetric.label}</h4>
            </div>
            <div className={cn('rounded-full border px-3 py-1 text-xs font-semibold', TONE_BADGE_CLASSES[currentMetric.tone])}>
              {currentMetric.delta}
            </div>
          </div>

          <div className="mt-6 flex h-32 items-end gap-2">
            {currentMetric.bars.map((bar) => (<div key={bar.id} className="flex flex-1 flex-col items-center gap-2">
                <div className={cn('w-full rounded-t-2xl transition-[height,background-color] duration-300', bar.heightClass, 'emphasized' in bar && bar.emphasized
                ? EMPHASIZED_BAR_CLASSES[currentMetric.tone]
                : 'bg-foreground/10')}/>
                <span className="text-[11px] font-medium text-muted-foreground">{bar.label}</span>
              </div>))}
          </div>

          <p className="mt-5 text-sm leading-6 text-muted-foreground">{currentMetric.detail}</p>
        </div>
      </ViewTransition>

      <ViewTransition key={`${currentMetric.id}-focus`}>
        <div className="rounded-3xl border border-border/60 bg-muted/35 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary"/>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Focus summary</p>
          </div>

          <div className="mt-4 space-y-3">
            {currentMetric.focusItems.map((item) => (<ViewTransition key={item}>
                <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/85 p-3">
                  <span className={cn('mt-1 size-2.5 rounded-full', TONE_DOT_CLASSES[currentMetric.tone])}/>
                  <p className="text-sm leading-6 text-foreground">{item}</p>
                </div>
              </ViewTransition>))}
          </div>
        </div>
      </ViewTransition>
    </div>);
}
type DashboardPreviewQueuePanelProps = {
    currentView: PreviewView;
};
export function DashboardPreviewQueuePanel({ currentView }: DashboardPreviewQueuePanelProps) {
    return (<div className="rounded-3xl border border-border/60 bg-background/90 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Live queue</p>
          <h4 className="mt-2 text-lg font-semibold text-foreground">What needs attention next</h4>
        </div>
        <CalendarClock className="size-4 text-primary"/>
      </div>

      <div className="mt-4 space-y-3">
        {currentView.queue.map((item) => (<ViewTransition key={item.id}>
            <div className="rounded-2xl border border-border/50 bg-muted/35 p-3 transition-colors hover:bg-muted/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.meta}</p>
                </div>
                <span className={cn('rounded-full border px-2 py-1 text-[11px] font-semibold', TONE_BADGE_CLASSES[item.tone])}>
                  {item.stage}
                </span>
              </div>
            </div>
          </ViewTransition>))}
      </div>
    </div>);
}
type DashboardPreviewAgentPanelProps = {
    currentView: PreviewView;
};
export function DashboardPreviewAgentPanel({ currentView }: DashboardPreviewAgentPanelProps) {
    return (<div className="rounded-3xl border border-accent/12 bg-primary p-4 text-primary-foreground sm:px-5 sm:py-5">
      <div className="flex items-center gap-2 text-primary-foreground/80">
        <Sparkles className="size-4"/>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">Agent readout</p>
      </div>

      <h4 className="mt-3 text-lg font-semibold">{currentView.agentTitle}</h4>
      <p className="mt-3 text-sm leading-6 text-primary-foreground/80">{currentView.agentSummary}</p>

      <div className="mt-4 space-y-3">
        {currentView.agentItems.map((item) => (<ViewTransition key={item.id}>
            <div className="rounded-2xl border border-primary-foreground/12 bg-primary-foreground/8 p-3">
              <div className="flex items-start gap-3">
                <Bot className="mt-0.5 size-4 shrink-0 text-foreground/65"/>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">{item.label}</p>
                  <p className="mt-1 text-[11px] font-medium tracking-[0.16em] text-primary-foreground/70 uppercase">
                    {item.meta}
                  </p>
                </div>
              </div>
            </div>
          </ViewTransition>))}
      </div>

      <Link href="/dashboard" transitionTypes={['nav-forward']} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
        Launch workspace
        <ArrowUpRight className="size-4"/>
      </Link>
    </div>);
}
export function DashboardPreviewFooterHints() {
    return (<div className="mt-4 flex flex-col gap-2 text-[11px] font-medium tracking-[0.16em] text-primary-foreground/65 uppercase sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-2">
        <span className="size-2 rounded-full bg-foreground/55"/>
        Hover to tilt, tap lanes to inspect the board.
      </div>
      <div className="inline-flex items-center gap-2">
        <BriefcaseBusiness className="size-3.5"/>
        Compact on purpose, interactive by default.
      </div>
    </div>);
}
