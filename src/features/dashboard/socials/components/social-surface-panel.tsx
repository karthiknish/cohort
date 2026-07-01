'use client';
import { useCallback, useMemo } from 'react';
import { Activity, ExternalLink, MessageSquareMore, Repeat2, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createSvglBrandIcon } from '@/shared/components/svgl-brand-logo';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { SocialsKpiGrid } from './socials-kpi-grid';
import type { SocialKpi } from '../hooks/use-social-insights';
import type { SocialOverview } from '../hooks/use-socials-metrics';
type SocialSurfacePanelProps = {
    surface: 'facebook' | 'instagram';
    kpis: SocialKpi[];
    overview: SocialOverview | null;
    overviewLoading: boolean;
    overviewError?: string | null;
    connected: boolean;
    setupComplete: boolean;
    hasInstagramBinding?: boolean;
    hasData: boolean;
    onRequestSync: () => void;
};
type GraphMetric = {
    label: string;
    value: number;
    valueLabel: string;
    detail: string;
    colorClass: string;
};
type InsightMetric = {
    title: string;
    value: string;
    detail: string;
    icon: LucideIcon;
};
const FacebookBrandIcon = createSvglBrandIcon('facebook') as LucideIcon;
const InstagramBrandIcon = createSvglBrandIcon('instagram') as LucideIcon;
const SURFACE_COPY = {
    facebook: {
        title: 'Facebook',
        icon: FacebookBrandIcon,
        summaryTitle: 'Facebook organic performance',
        summaryDescription: 'Organic reach, engagement, and follower growth for Facebook Pages in this workspace.',
        emptyMessage: 'Connect Meta and select a Facebook Page to sync organic metrics.',
        emptyCtaLabel: 'Set up connection',
        setupMessage: 'Select a Facebook Page in the connection card above.',
        noDataMessage: 'Page is configured but no metrics yet. Run a sync to pull organic insights.',
        noDataCtaLabel: 'Sync now',
    },
    instagram: {
        title: 'Instagram',
        icon: InstagramBrandIcon,
        summaryTitle: 'Instagram organic performance',
        summaryDescription: 'Organic reach, engagement, and follower growth for Instagram business profiles in this workspace.',
        emptyMessage: 'Connect Meta and link an Instagram business account to this Page in Meta.',
        emptyCtaLabel: 'Set up connection',
        setupMessage: 'Select a Facebook Page with a linked Instagram business account.',
        noIgMessage: 'This Page has no linked Instagram business account. Metrics stay empty until you link one in Meta Business settings.',
        noDataMessage: 'Instagram is configured but no metrics yet. Run a sync to pull organic insights.',
        noDataCtaLabel: 'Sync now',
    },
} as const;
function formatCompactNumber(value: number): string {
    if (value >= 1000000)
        return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000)
        return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
}
function formatRate(value: number): string {
    return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}
function formatSignedNumber(value: number): string {
    if (value === 0)
        return '0';
    return `${value > 0 ? '+' : '-'}${formatCompactNumber(Math.abs(value))}`;
}
function SocialMetricBars({ metrics, labelledBy }: {
    metrics: GraphMetric[];
    labelledBy?: string;
}) {
    const maxValue = Math.max(...metrics.map((metric) => metric.value), 0);
    return (<ul className="list-none space-y-5" aria-labelledby={labelledBy}>
      {metrics.map((metric) => {
            return (<li key={metric.label} className="list-none space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{metric.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{metric.detail}</p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">{metric.valueLabel}</p>
            </div>
            <progress className={cn('h-3 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-muted/30 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted/50 [&::-webkit-progress-value]:rounded-full', metric.colorClass)} value={metric.value} max={maxValue > 0 ? maxValue : 100} aria-label={`${metric.label}: ${metric.valueLabel}`}/>
          </li>);
        })}
    </ul>);
}
function SocialInsightCards({ insights }: {
    insights: InsightMetric[];
}) {
    return (<div className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => {
            const Icon = insight.icon;
            return (<Card key={insight.title} className={cn('overflow-hidden border-muted/50 bg-linear-to-b from-muted/20 to-background shadow-sm transition-shadow hover:shadow-md', DASHBOARD_THEME.cards.base)}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={DASHBOARD_THEME.stats.label}>{insight.title}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">{insight.value}</p>
                </div>
                <div className={cn(DASHBOARD_THEME.icons.container, 'size-10 shrink-0')}>
                  <Icon className="size-5" aria-hidden/>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{insight.detail}</p>
            </CardContent>
          </Card>);
        })}
    </div>);
}
export function SocialSurfacePanel({ surface, kpis, overview, overviewLoading, overviewError, connected, setupComplete, hasInstagramBinding = true, hasData, onRequestSync, }: SocialSurfacePanelProps) {
    const copy = SURFACE_COPY[surface];
    const SurfaceIcon = copy.icon;
    const handleScrollToConnections = () => {
        document.getElementById('social-connections-panel')?.scrollIntoView({ behavior: 'smooth' });
    };
    const showMetrics = connected && setupComplete && hasData && !overviewError && (surface !== 'instagram' || hasInstagramBinding);
    const emptyState = (() => {
        if (overviewError && connected && setupComplete) {
            return {
                title: 'Unable to load metrics',
                description: overviewError,
                action: { label: 'Try again', onClick: onRequestSync },
            };
        }
        if (!connected) {
            return {
                title: `${copy.title} not connected`,
                description: copy.emptyMessage,
                action: { label: copy.emptyCtaLabel, onClick: handleScrollToConnections },
            };
        }
        if (!setupComplete) {
            return {
                title: 'Finish setup',
                description: copy.setupMessage,
                action: { label: 'Go to setup', onClick: handleScrollToConnections },
            };
        }
        if (surface === 'instagram' && !hasInstagramBinding) {
            return {
                title: 'No linked Instagram',
                description: SURFACE_COPY.instagram.noIgMessage,
                action: {
                    label: 'Link in Meta Business',
                    onClick: () => {
                        window.open('https://www.facebook.com/business/help/898752960195806', '_blank', 'noopener,noreferrer');
                    },
                    icon: ExternalLink,
                },
            };
        }
        if (!hasData) {
            return {
                title: 'No organic data yet',
                description: copy.noDataMessage,
                action: { label: copy.noDataCtaLabel, onClick: onRequestSync },
            };
        }
        return null;
    })();
    const performanceGraph = (() => {
        if (!overview)
            return [];
        return [
            {
                label: 'Reach',
                value: overview.reach,
                valueLabel: formatCompactNumber(overview.reach),
                detail: 'Unique people reached in the selected range',
                colorClass: 'bg-primary',
            },
            {
                label: 'Impressions',
                value: overview.impressions,
                valueLabel: formatCompactNumber(overview.impressions),
                detail: 'Total content views delivered across the range',
                colorClass: 'bg-info',
            },
            {
                label: 'Engaged users',
                value: overview.engagedUsers,
                valueLabel: formatCompactNumber(overview.engagedUsers),
                detail: 'People who reacted, commented, shared, or saved content',
                colorClass: 'bg-success',
            },
        ];
    })();
    const interactionGraph = (() => {
        if (!overview)
            return [];
        return [
            {
                label: 'Reactions',
                value: overview.reactions,
                valueLabel: formatCompactNumber(overview.reactions),
                detail: 'Lightweight approval and sentiment actions',
                colorClass: 'bg-primary',
            },
            {
                label: 'Comments',
                value: overview.comments,
                valueLabel: formatCompactNumber(overview.comments),
                detail: 'Direct responses that signal conversation depth',
                colorClass: 'bg-info',
            },
            {
                label: 'Shares',
                value: overview.shares,
                valueLabel: formatCompactNumber(overview.shares),
                detail: 'Content amplification from your audience',
                colorClass: 'bg-accent',
            },
            ...(overview.saves > 0 ? [{
                    label: 'Saves',
                    value: overview.saves,
                    valueLabel: formatCompactNumber(overview.saves),
                    detail: 'Intent signals from people bookmarking posts',
                    colorClass: 'bg-warning',
                }] : []),
        ];
    })();
    const insightCards = (() => {
        if (!overview)
            return [];
        const engagementRate = overview.reach > 0 ? (overview.engagedUsers / overview.reach) * 100 : 0;
        const impressionFrequency = overview.reach > 0 ? overview.impressions / overview.reach : 0;
        const conversationActions = overview.comments + overview.shares + overview.saves;
        const conversationRate = overview.engagedUsers > 0 ? (conversationActions / overview.engagedUsers) * 100 : 0;
        return [
            {
                title: 'Engagement rate',
                value: formatRate(engagementRate),
                detail: `${formatCompactNumber(overview.engagedUsers)} engaged users from ${formatCompactNumber(overview.reach)} reached accounts.`,
                icon: Activity,
            },
            {
                title: 'Repeat visibility',
                value: `${impressionFrequency.toFixed(2)}x`,
                detail: `${formatCompactNumber(overview.impressions)} impressions across ${overview.rowCount} synced days.`,
                icon: Repeat2,
            },
            {
                title: 'Community momentum',
                value: formatSignedNumber(overview.followerDeltaTotal),
                detail: overview.followerCountLatest !== null
                    ? `${formatCompactNumber(overview.followerCountLatest)} total followers. ${formatRate(conversationRate)} of engaged users moved into comments, shares, or saves.`
                    : `${formatRate(conversationRate)} of engaged users moved into comments, shares, or saves.`,
                icon: UsersRound,
            },
        ];
    })();
    return (<div className="space-y-6">
      <Card className={cn('overflow-hidden ring-1 ring-muted/20', DASHBOARD_THEME.cards.base)}>
        <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'bg-muted/[0.02]')}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(DASHBOARD_THEME.icons.container, 'size-12 shadow-sm', surface === 'facebook' ? 'bg-info/10 text-info border-info/25' : 'bg-accent/10 text-accent border-accent/25')}>
                <SurfaceIcon className="size-6" aria-hidden/>
              </div>
              <div className="max-w-2xl space-y-1.5">
                <CardTitle className="text-balance text-xl md:text-2xl">{copy.summaryTitle}</CardTitle>
                <CardDescription className="text-pretty text-sm leading-relaxed md:text-[15px]">
                  {copy.summaryDescription}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={cn(DASHBOARD_THEME.badges.base, 'w-fit shrink-0')}>
              {overviewLoading ? 'Loading…' : connected ? 'Organic data' : 'Not connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {overviewLoading ? (<div className={DASHBOARD_THEME.stats.container}>
              {[0, 1, 2, 3].map((slot) => (<Skeleton key={slot} className="h-28 w-full rounded-2xl"/>))}
            </div>) : showMetrics ? (<div className="space-y-6">
              <SocialsKpiGrid items={kpis}/>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card className={cn('overflow-hidden border-muted/50 shadow-sm', DASHBOARD_THEME.cards.base)}>
                  <CardHeader className="pb-3">
                    <CardTitle id={`${surface}-audience-title`} className="text-base">
                      Audience footprint
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed sm:text-sm">
                      Relative mix of reach, impressions, and engaged users for the selected date range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <SocialMetricBars metrics={performanceGraph} labelledBy={`${surface}-audience-title`}/>
                  </CardContent>
                </Card>

                <Card className={cn('overflow-hidden border-muted/50 shadow-sm', DASHBOARD_THEME.cards.base)}>
                  <CardHeader className="pb-3">
                    <CardTitle id={`${surface}-interaction-title`} className="text-base">
                      Interaction mix
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed sm:text-sm">
                      Reactions, comments, shares, and saves, scaled so you can compare channel behavior at a glance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <SocialMetricBars metrics={interactionGraph} labelledBy={`${surface}-interaction-title`}/>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-muted/30 pb-2">
                  <MessageSquareMore className="size-4 text-primary" aria-hidden/>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Derived signals</h3>
                </div>
                <SocialInsightCards insights={insightCards}/>
              </div>
            </div>) : emptyState ? (<EmptyState title={emptyState.title} description={emptyState.description} action={emptyState.action} variant="card" className="rounded-2xl"/>) : null}
        </CardContent>
      </Card>
    </div>);
}
