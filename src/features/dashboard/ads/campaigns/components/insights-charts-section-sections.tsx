'use client';
import { Info } from 'lucide-react';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { cn } from '@/lib/utils';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { MotionCard } from '@/shared/ui/motion-primitives';
import { Skeleton } from '@/shared/ui/skeleton';
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, } from '@/shared/ui/recharts-dynamic';
import { ChartContainer, ChartLegend } from '@/shared/ui/chart';
import { AREA_ACTIVE_DOT, AREA_CURSOR, BAR_REACH_CURSOR, CHART_MARGIN, conversionsChartConfig, costChartConfig, engagementChartConfig, reachChartConfig, TICK_STYLE, type ConversionChartPoint, type EngagementChartPoint, type PerformanceMetricPoint, type ReachChartPoint, } from './insights-charts-section-types';
import type { useInsightsChartsFormatters } from './use-insights-charts-formatters';
type ChartFormatters = ReturnType<typeof useInsightsChartsFormatters>;
export function PerformanceOverviewChartSection({ chartMetrics, insightsLoading, displayCurrency, }: {
    chartMetrics: PerformanceMetricPoint[];
    insightsLoading: boolean;
    displayCurrency: string;
}) {
    return (<MotionCard className={ADS_PAGE_THEME.chartCard}>
      <CardHeader className={ADS_PAGE_THEME.chartCardHeader}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">Performance Overview</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 cursor-help text-muted-foreground"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  <strong>Revenue:</strong> Total income generated from campaign conversions.
                </p>
                <p className="mt-1">
                  <strong>Ad Spend:</strong> Total amount invested in advertising for this campaign.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Spend and revenue over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-2">
        <PerformanceChart metrics={chartMetrics} loading={insightsLoading} currency={displayCurrency} dataSource="ads" showDetailLink={false} hideHeader/>
      </CardContent>
    </MotionCard>);
}
export function EngagementTrendsChartSection({ engagementChartData, insightsLoading, formatters, }: {
    engagementChartData: EngagementChartPoint[];
    insightsLoading: boolean;
    formatters: ChartFormatters;
}) {
    return (<MotionCard className={ADS_PAGE_THEME.chartCard}>
      <CardHeader className={ADS_PAGE_THEME.chartCardHeader}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">Engagement Trends</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p><strong>Clicks:</strong> Total number of times users clicked on your ad.</p>
                <p className="mt-1"><strong>CTR (Click-Through Rate):</strong> Percentage of impressions that resulted in a click. Higher CTR indicates more engaging ad content.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Clicks & CTR over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-2">
        {insightsLoading ? (<Skeleton className="size-full"/>) : engagementChartData.length === 0 ? (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No engagement data available
          </div>) : (<ChartContainer config={engagementChartConfig} className="size-full">
            <AreaChart data={engagementChartData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tickMargin={10} tick={TICK_STYLE}/>
              <YAxis axisLine={false} tickLine={false} tickMargin={8} tick={TICK_STYLE}/>
              <RechartsTooltip cursor={AREA_CURSOR} content={formatters.engagementTooltipContent}/>
              <ChartLegend content={formatters.chartLegendContent}/>
              <Area type="monotone" dataKey="clicks" stroke="var(--color-clicks)" strokeWidth={2} fill="url(#fillClicks)" dot={false} activeDot={AREA_ACTIVE_DOT}/>
            </AreaChart>
          </ChartContainer>)}
      </CardContent>
    </MotionCard>);
}
export function ConversionsChartSection({ conversionsChartData, insightsLoading, formatters, }: {
    conversionsChartData: ConversionChartPoint[];
    insightsLoading: boolean;
    formatters: ChartFormatters;
}) {
    return (<MotionCard className={ADS_PAGE_THEME.chartCard}>
      <CardHeader className={ADS_PAGE_THEME.chartCardHeader}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">Conversions Over Time</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p><strong>Conversions:</strong> Number of desired actions completed (purchases, sign-ups, etc.) attributed to your campaign.</p>
                <p className="mt-1"><strong>Revenue:</strong> Total monetary value generated from conversions.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Daily conversion performance</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-2">
        {insightsLoading ? (<Skeleton className="size-full"/>) : conversionsChartData.length === 0 ? (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No conversion data available
          </div>) : (<ChartContainer config={conversionsChartConfig} className="size-full">
            <AreaChart data={conversionsChartData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-conversions)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-conversions)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tickMargin={10} tick={TICK_STYLE}/>
              <YAxis axisLine={false} tickLine={false} tickMargin={8} tick={TICK_STYLE} tickFormatter={formatters.conversionsTickFormatter}/>
              <RechartsTooltip cursor={AREA_CURSOR} content={formatters.conversionsTooltipContent}/>
              <ChartLegend content={formatters.chartLegendContent}/>
              <Area type="monotone" dataKey="conversions" stroke="var(--color-conversions)" strokeWidth={2} fill="url(#fillConversions)" dot={false} activeDot={AREA_ACTIVE_DOT}/>
            </AreaChart>
          </ChartContainer>)}
      </CardContent>
    </MotionCard>);
}
export function CostEfficiencyChartSection({ conversionsChartData, insightsLoading, formatters, }: {
    conversionsChartData: ConversionChartPoint[];
    insightsLoading: boolean;
    formatters: ChartFormatters;
}) {
    return (<MotionCard className={ADS_PAGE_THEME.chartCard}>
      <CardHeader className={ADS_PAGE_THEME.chartCardHeader}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">Cost Efficiency</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p><strong>CPC (Cost Per Click):</strong> Average amount spent for each click. Lower CPC means more efficient ad spend.</p>
                <p className="mt-1"><strong>CPA (Cost Per Acquisition):</strong> Average cost to acquire one conversion. Lower CPA indicates better campaign efficiency.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>CPC & CPA trends</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-2">
        {insightsLoading ? (<Skeleton className="size-full"/>) : conversionsChartData.length === 0 ? (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No cost efficiency data available
          </div>) : (<ChartContainer config={costChartConfig} className="size-full">
            <BarChart data={conversionsChartData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tickMargin={10} tick={TICK_STYLE}/>
              <YAxis axisLine={false} tickLine={false} tickMargin={8} tick={TICK_STYLE} tickFormatter={formatters.costTickFormatter}/>
              <RechartsTooltip cursor={false} content={formatters.costTooltipContent}/>
              <ChartLegend content={formatters.chartLegendContent}/>
              <Bar dataKey="cpc" fill="var(--color-cpc)" radius={[4, 4, 0, 0]}/>
              <Bar dataKey="cpa" fill="var(--color-cpa)" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ChartContainer>)}
      </CardContent>
    </MotionCard>);
}
export function ReachVsImpressionsChartSection({ reachChartData, formatters, }: {
    reachChartData: ReachChartPoint[];
    formatters: ChartFormatters;
}) {
    if (reachChartData.length === 0)
        return null;
    return (<MotionCard className={cn(ADS_PAGE_THEME.chartCard, 'lg:col-span-2')}>
      <CardHeader className={ADS_PAGE_THEME.chartCardHeader}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">Reach vs Impressions</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p><strong>Reach:</strong> The number of unique people who saw your ads at least once.</p>
                <p className="mt-1"><strong>Impressions:</strong> The number of times your ads were on screen.</p>
                <p className="mt-1"><strong>Frequency:</strong> Average number of times each person saw your ad (Impressions / Reach).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Unique reach compared to total impressions</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ChartContainer config={reachChartConfig} className="size-full">
          <BarChart data={reachChartData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tickMargin={10} tick={TICK_STYLE}/>
            <YAxis axisLine={false} tickLine={false} tickMargin={8} tick={TICK_STYLE} tickFormatter={formatters.reachTickFormatter}/>
            <RechartsTooltip cursor={BAR_REACH_CURSOR} content={formatters.reachTooltipContent}/>
            <ChartLegend content={formatters.chartLegendContent}/>
            <Bar dataKey="impressions" fill="var(--color-impressions)" radius={[4, 4, 0, 0]} maxBarSize={40}/>
            <Bar dataKey="reach" fill="var(--color-reach)" radius={[4, 4, 0, 0]} maxBarSize={40}/>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </MotionCard>);
}
