'use client';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
export type DashboardSnapshotMetric = {
    label: string;
    value: string;
    helper: string;
    accent?: 'primary' | 'info' | 'success';
};
const ACCENT_STYLES: Record<NonNullable<DashboardSnapshotMetric['accent']>, string> = {
    primary: 'border-l-[3px] border-l-primary bg-linear-to-br from-primary/8 via-primary/[0.02] to-background',
    info: 'border-l-[3px] border-l-info bg-linear-to-br from-info/10 via-info/[0.02] to-background',
    success: 'border-l-[3px] border-l-success bg-linear-to-br from-success/8 via-success/[0.02] to-background',
};
type DashboardSnapshotMetricGridProps = {
    metrics: DashboardSnapshotMetric[];
    loading: boolean;
};
export function DashboardSnapshotMetricGrid({ metrics, loading }: DashboardSnapshotMetricGridProps) {
    return (<FadeInStagger className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric, index) => {
            const accent = metric.accent ?? (index === 0 ? 'primary' : index === 1 ? 'info' : 'success');
            return (<FadeInItem key={metric.label}>
            <Card className={cn(DASHBOARD_THEME.stats.card, 'overflow-hidden border-muted/50 shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0', ACCENT_STYLES[accent])}>
              <CardHeader className="pb-2">
                <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {metric.label}
                </CardDescription>
                {loading ? (<Skeleton className="h-8 w-28 rounded-md"/>) : (<CardTitle className="text-2xl font-bold tabular-nums tracking-tight md:text-3xl">
                    {metric.value}
                  </CardTitle>)}
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (<Skeleton className="h-4 w-40 rounded-md"/>) : (<p className="text-sm leading-relaxed text-muted-foreground">{metric.helper}</p>)}
              </CardContent>
            </Card>
          </FadeInItem>);
        })}
    </FadeInStagger>);
}
