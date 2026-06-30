'use client';
import { DashboardSectionHeading, } from '@/features/dashboard/home/components/dashboard-empty-performance-card';
import { StatsCards } from '@/features/dashboard/home/components/stats-cards';
import type { SummaryStat } from '@/types/dashboard';
import { FadeIn } from '@/shared/ui/animate-in';
export function DashboardOverviewSummarySection({ displayStats, statsLoading, }: {
    displayStats: SummaryStat[];
    statsLoading: boolean;
}) {
    if (displayStats.length === 0)
        return null;
    return (<FadeIn>
      <section className="space-y-4" aria-label="Summary statistics">
        <DashboardSectionHeading eyebrow="Signals" title="Summary" description="Cross-channel KPIs rolled up for this workspace."/>
        <StatsCards stats={displayStats} loading={statsLoading} primaryCount={4} linkless/>
      </section>
    </FadeIn>);
}
