'use client';
import Link from 'next/link';
import { CheckCircle2, Link2 } from 'lucide-react';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
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
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
        {ADS_WORKFLOW_STEPS.map((step, index) => {
            const done = stepDone[index] ?? false;
            return (<div key={step.title} className={cn('space-y-2.5 rounded-2xl border p-4', done
                    ? 'border-success/30 bg-success/[0.06] ring-1 ring-success/15'
                    : 'border-border/60 bg-background/80')}>
              <Badge variant={done ? 'default' : 'secondary'} className={cn('rounded-full font-medium', done && 'bg-success text-success-foreground')}>
                {done ? (<span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3" aria-hidden/>
                    Done
                  </span>) : (`Step ${index + 1}`)}
            </Badge>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
          </div>);
        })}
      </CardContent>
    </Card>);
}
