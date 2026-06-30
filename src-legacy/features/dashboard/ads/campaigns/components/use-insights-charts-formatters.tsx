'use client';
import { useCallback, useMemo } from 'react';
import { formatMoney } from '@/constants/currencies';
import { ChartTooltipContent, ChartLegendContent } from '@/shared/ui/chart';
import { conversionsChartConfig, costChartConfig, engagementChartConfig, reachChartConfig, } from './insights-charts-section-types';
export function useInsightsChartsFormatters(displayCurrency: string) {
    const engagementFormatter = (value: unknown, name: unknown) => (<div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {engagementChartConfig[name as keyof typeof engagementChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {name === 'ctr' ? `${Number(value).toFixed(2)}%` : Number(value).toLocaleString('en-US')}
      </span>
    </div>);
    const engagementTooltipContent = (<ChartTooltipContent formatter={engagementFormatter}/>);
    const chartLegendContent = <ChartLegendContent />;
    const conversionsTickFormatter = (value: unknown) => `${Number(value).toLocaleString('en-US')}`;
    const conversionsFormatter = (value: unknown, name: unknown) => (<div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {conversionsChartConfig[name as keyof typeof conversionsChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {name === 'revenue'
            ? formatMoney(Number(value), displayCurrency)
            : Number(value).toLocaleString('en-US')}
      </span>
    </div>);
    const conversionsTooltipContent = (<ChartTooltipContent formatter={conversionsFormatter}/>);
    const costTickFormatter = (value: unknown) => formatMoney(Number(value), displayCurrency);
    const costFormatter = (value: unknown, name: unknown) => (<div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {costChartConfig[name as keyof typeof costChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {formatMoney(Number(value), displayCurrency)}
      </span>
    </div>);
    const costTooltipContent = (<ChartTooltipContent formatter={costFormatter}/>);
    const reachTickFormatter = (value: unknown) => Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(1)}k` : String(value);
    const reachFormatter = (value: unknown, name: unknown) => (<div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {reachChartConfig[name as keyof typeof reachChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {Number(value).toLocaleString('en-US')}
      </span>
    </div>);
    const reachTooltipContent = (<ChartTooltipContent formatter={reachFormatter}/>);
    return {
        engagementTooltipContent,
        chartLegendContent,
        conversionsTickFormatter,
        conversionsTooltipContent,
        costTickFormatter,
        costTooltipContent,
        reachTickFormatter,
        reachTooltipContent,
    };
}
