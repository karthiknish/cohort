'use client';
import { Lightbulb, CircleCheck, TrendingUp, Target, } from 'lucide-react';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { MotionCard } from '@/shared/ui/motion-primitives';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AlgorithmicInsight } from '@/lib/ad-algorithms';
interface AlgorithmicInsightsSectionProps {
    insights: AlgorithmicInsight[];
    loading: boolean;
    efficiencyScore: number;
}
function InsightBadge({ level }: {
    level: AlgorithmicInsight['level'];
}) {
    const styles = {
        success: 'bg-success/10 text-success border-success/20',
        info: 'bg-info/10 text-info border-info/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        critical: 'bg-destructive/10 text-destructive border-destructive/20',
        error: 'bg-destructive/10 text-destructive border-destructive/20', // Fallback for some API types
    };
    return (<div className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-tight", styles[level as keyof typeof styles])}>
      {level === 'critical' ? 'High Alert' : level === 'info' ? 'Suggestion' : level}
    </div>);
}
export function AlgorithmicInsightsSection({ insights, loading, efficiencyScore, }: AlgorithmicInsightsSectionProps) {
    return (<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Efficiency Score */}
      <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
        <CardHeader className="border-b border-border/50 pb-4">
          <p className={ADS_PAGE_THEME.sectionEyebrow}>Health</p>
          <CardTitle className="text-lg font-semibold tracking-tight">Efficiency score</CardTitle>
          <CardDescription>Overall performance health rating</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-y-4 py-6">
          {loading ? (<Skeleton className="size-32 rounded-full"/>) : (<>
              <div className="relative flex size-36 items-center justify-center">
                <svg className="size-full" viewBox="0 0 100 100">
                  <circle className="stroke-muted/20" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50"/>
                  <circle className={cn("motion-chromatic-xslow", efficiencyScore > 80 ? "stroke-success" :
                efficiencyScore > 60 ? "stroke-warning" :
                    "stroke-destructive")} strokeWidth="8" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - efficiencyScore / 100)}`} strokeLinecap="round" fill="transparent" r="42" cx="50" cy="50" transform="rotate(-90 50 50)"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tighter">{efficiencyScore}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Rating</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">
                  {efficiencyScore > 80 ? 'Optimal Performance' :
                efficiencyScore > 60 ? 'Good Stability' :
                    'Requires Attention'}
                </p>
                <p className="max-w-[180px] text-xs font-medium text-muted-foreground/70">
                  Your campaign is performing better than {Math.round(efficiencyScore * 0.85)}% of similar industry segments.
                </p>
              </div>
            </>)}
        </CardContent>
      </MotionCard>

      {/* 2. AI Algorithm Insights / Suggestions */}
      <MotionCard className={cn(ADS_PAGE_THEME.surfaceCard, 'lg:col-span-2')}>
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <p className={ADS_PAGE_THEME.sectionEyebrow}>Recommendations</p>
            <CardTitle className="text-lg font-semibold tracking-tight">Algorithm analysis</CardTitle>
            <CardDescription>AI-generated performance suggestions</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (<div className="space-y-4">
                {[1, 2, 3].map((skeletonId) => (<div key={`insight-skeleton-${skeletonId}`} className="flex gap-4">
                  <Skeleton className="size-10 shrink-0 rounded-lg"/>
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/4"/>
                    <Skeleton className="h-4 w-full"/>
                  </div>
                </div>))}
            </div>) : insights.length === 0 ? (<div className={cn(ADS_PAGE_THEME.emptyState, 'min-h-[200px] py-8')}>
              <div className="rounded-2xl bg-muted/30 p-4 ring-1 ring-border/50">
                <CircleCheck className="size-8 text-muted-foreground/50" aria-hidden/>
              </div>
              <p className="text-sm font-bold">Everything looks great!</p>
              <p className="max-w-[280px] text-xs font-medium text-muted-foreground/60">
                The algorithm hasn&apos;t detected immediate optimizations needed for this period.
              </p>
            </div>) : (<div className="space-y-6">
                {insights.map((insight) => (<div key={`${insight.type}-${insight.title}`} className="group relative flex gap-4 motion-chromatic">
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", insight.level === 'success' ? "bg-success/10 text-success" :
                    insight.level === 'info' ? "bg-info/10 text-info" :
                        insight.level === 'warning' ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive")}>
                    {insight.type === 'efficiency' ? <TrendingUp className="size-5"/> :
                    insight.type === 'budget' ? <Target className="size-5"/> :
                        <Lightbulb className="size-5"/>}
                  </div>
                  <div className="space-y-1.5 pb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black tracking-tight uppercase">{insight.title}</p>
                      <InsightBadge level={insight.level}/>
                    </div>
                    <p className="text-sm font-bold text-foreground/90 leading-snug">
                      {insight.message}
                    </p>
                    {insight.suggestion && (<p className="rounded-lg bg-muted/30 p-2.5 text-xs font-medium text-muted-foreground/80 border border-muted/20">
                        <span className="font-bold text-primary mr-1">Recommendation:</span>
                        {insight.suggestion}
                      </p>)}
                  </div>
                </div>))}
            </div>)}
        </CardContent>
      </MotionCard>
    </div>);
}
