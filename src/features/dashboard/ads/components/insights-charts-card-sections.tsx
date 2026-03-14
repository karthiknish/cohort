'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type ProviderOption = { id: string; name: string }

function ChartSkeleton() {
  return <Skeleton className="h-full min-h-[280px] w-full rounded-lg" />
}

function InsightsChartPanel({ children, description, title, value }: { children: React.ReactNode; description: string; title: string; value: string }) {
  return <TabsContent value={value} className="mt-4"><div className="space-y-2"><h4 className="text-sm font-medium">{title}</h4><p className="text-xs text-muted-foreground">{description}</p>{children}</div></TabsContent>
}

export function InsightsChartsLoadingState() {
  return <Card className="shadow-sm"><CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /></CardHeader><CardContent><ChartSkeleton /></CardContent></Card>
}

export function InsightsChartsEmptyState() {
  return <Card className="shadow-sm"><CardHeader><CardTitle className="text-lg">Performance Insights</CardTitle><CardDescription>Visual analysis of your ad performance</CardDescription></CardHeader><CardContent><div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">Connect ad platforms and sync data to see performance charts.</div></CardContent></Card>
}

export function InsightsChartsHeader({ onSelectedProviderChange, providers, providersCount, selectedProvider }: { onSelectedProviderChange: (value: string) => void; providers: ProviderOption[]; providersCount: number; selectedProvider: string }) {
  return <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-lg">Performance Insights</CardTitle><CardDescription>Visual analysis across {providersCount} platform{providersCount !== 1 ? 's' : ''}</CardDescription></div>{providers.length > 1 ? <Select value={selectedProvider} onValueChange={onSelectedProviderChange}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Select provider" /></SelectTrigger><SelectContent><SelectItem value="all">All Platforms</SelectItem>{providers.map((provider) => <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>)}</SelectContent></Select> : null}</div></CardHeader>
}

export function InsightsChartsTabs({ benchmarkChart, comparisonChart, efficiencyChart, funnelChart, trendsChart }: { benchmarkChart: React.ReactNode; comparisonChart: React.ReactNode; efficiencyChart: React.ReactNode; funnelChart: React.ReactNode; trendsChart: React.ReactNode }) {
  return <CardContent><Tabs defaultValue="comparison" className="w-full"><TabsList className="grid w-full grid-cols-5"><TabsTrigger value="comparison">Comparison</TabsTrigger><TabsTrigger value="efficiency">Efficiency</TabsTrigger><TabsTrigger value="trends">Trends</TabsTrigger><TabsTrigger value="funnel">Funnel</TabsTrigger><TabsTrigger value="benchmarks">Benchmarks</TabsTrigger></TabsList><InsightsChartPanel value="comparison" title="Spend vs Revenue by Platform" description="Compare financial performance across connected platforms">{comparisonChart}</InsightsChartPanel><InsightsChartPanel value="efficiency" title="Efficiency Breakdown" description="Multi-dimensional performance analysis">{efficiencyChart}</InsightsChartPanel><InsightsChartPanel value="trends" title="Spend Trend Analysis" description="Historical spend with trend line">{trendsChart}</InsightsChartPanel><InsightsChartPanel value="funnel" title="Conversion Funnel" description="Impressions → Clicks → Conversions drop-off analysis">{funnelChart}</InsightsChartPanel><InsightsChartPanel value="benchmarks" title="Industry Benchmarks" description="How you compare to industry averages">{benchmarkChart}</InsightsChartPanel></Tabs></CardContent>
}