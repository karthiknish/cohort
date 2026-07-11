'use client';
import { Link } from '@/shared/ui/link';
import { Check, Link2 } from 'lucide-react';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import { ADS_WORKFLOW_STEPS } from './utils';
type WorkflowCardProps = {
    connectedCount?: number;
    hasSuccessfulSync?: boolean;
    hasPendingSetup?: boolean;
};
export function WorkflowCard({ connectedCount = 0, hasSuccessfulSync = false, hasPendingSetup = false, }: WorkflowCardProps) {
    const stepDone = [
        connectedCount > 0 && !hasPendingSetup,
        hasSuccessfulSync,
        hasSuccessfulSync,
    ];
    const completedCount = stepDone.filter(Boolean).length;
    const progressPercent = (completedCount / ADS_WORKFLOW_STEPS.length) * 100;
    return (<Card className={ADS_PAGE_THEME.surfaceCardHighlight}>
      <CardHeader className="flex flex-col gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-primary" aria-hidden/>
            <CardTitle className="text-base leading-tight">Get paid media connected</CardTitle>
          </div>
          <CardDescription className="max-w-xl text-pretty leading-relaxed">
            OAuth into Google, Meta, LinkedIn, and TikTok - then finish account selection in the setup
            panel. First sync pulls roughly 90 days of history.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 rounded-xl">
          <Link href="#connect-ad-platforms">Connect platforms</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Progress bar */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}/>
          </div>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">{completedCount}/{ADS_WORKFLOW_STEPS.length}</span>
        </div>
        {/* Steps with connectors */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-0">
          {ADS_WORKFLOW_STEPS.map((step, index) => {
            const done = stepDone[index] ?? false;
            const isLast = index === ADS_WORKFLOW_STEPS.length - 1;
            return (<div key={step.title} className={cn('relative flex flex-col gap-3 sm:px-4', !isLast && 'sm:border-r sm:border-dashed sm:border-border/50')}>
              {/* Step indicator circle */}
              <div className="flex items-center gap-2.5">
                <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors', done
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-foreground/70 ring-1 ring-border/60')}>
                  {done ? <Check className="size-4" aria-hidden/> : index + 1}
                </div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground sm:pl-9">{step.description}</p>
            </div>);
          })}
        </div>
      </CardContent>
    </Card>);
}
