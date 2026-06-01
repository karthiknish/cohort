'use client';
import { LayoutDashboard, LoaderCircle, RefreshCw, Users } from 'lucide-react';
import { DASHBOARD_THEME, getBadgeClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero';
import { FadeIn } from '@/shared/ui/animate-in';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
type DashboardOverviewHeaderProps = {
    clientName: string;
    isClientScoped: boolean;
    teamMembersCount: number;
    accountManager: string | null;
    hasLiveMetrics: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
};
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12)
        return 'Good morning';
    if (hour < 17)
        return 'Good afternoon';
    return 'Good evening';
}
export function DashboardOverviewHeader({ clientName, isClientScoped, teamMembersCount, accountManager, hasLiveMetrics, isRefreshing, onRefresh, }: DashboardOverviewHeaderProps) {
    const greeting = getGreeting();
    return (<FadeIn>
      <DashboardPageHero innerClassName="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className={cn(DASHBOARD_THEME.icons.container, 'bg-primary/10 text-primary border-primary/20')}>
            <LayoutDashboard className="size-6" aria-hidden/>
          </div>
          <div className="min-w-0 space-y-2">
            <p className={DASHBOARD_THEME.sectionEyebrow}>{greeting}</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-balance text-2xl tracking-tight text-foreground sm:text-3xl">
                {clientName}
              </h1>
              <Badge variant="outline" className={cn('font-normal normal-case tracking-normal', isClientScoped ? getBadgeClasses('primary') : getBadgeClasses('secondary'))}>
                {isClientScoped ? 'Client view' : 'All clients'}
              </Badge>
              {hasLiveMetrics ? (<Badge className={cn(getBadgeClasses('success'), 'font-normal normal-case tracking-normal')}>
                  Metrics synced
                </Badge>) : null}
            </div>
            <p className={DASHBOARD_THEME.sectionDescription}>
              {isClientScoped
            ? 'Delivery, paid media, and site performance at a glance for this workspace.'
            : 'Workspace-wide pulse. Pick a client in the sidebar for a focused breakdown.'}
            </p>
            {isClientScoped ? (<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {teamMembersCount > 0 ? (<span className="inline-flex items-center gap-1.5">
                    <Users className="size-4 shrink-0" aria-hidden/>
                    {teamMembersCount} team {teamMembersCount === 1 ? 'member' : 'members'}
                  </span>) : null}
                {accountManager ? <span>Account manager · {accountManager}</span> : null}
              </div>) : null}
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2 self-start border-muted/50 bg-background/80 shadow-sm backdrop-blur-sm" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? (<LoaderCircle className="size-4 animate-spin" aria-hidden/>) : (<RefreshCw className="size-4" aria-hidden/>)}
          Refresh data
        </Button>
      </DashboardPageHero>
    </FadeIn>);
}
