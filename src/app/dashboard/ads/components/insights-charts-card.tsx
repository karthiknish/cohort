'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatCurrency } from '@/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from 'recharts'
import type { PerformanceAnalysis } from '@/lib/ad-algorithms'

// =============================================================================
// TYPES
// =============================================================================

interface InsightsChartsCardProps {
  analysis: PerformanceAnalysis | null
  loading?: boolean
}

// =============================================================================
// CHART CONFIGS
// =============================================================================

const providerColors: Record<string, string> = {
  google: '#4285F4',
  facebook: '#1877F2',
  meta: '#1877F2',
  linkedin: '#0A66C2',
  tiktok: '#000000',
}

const metricColors = {
  spend: '#ef4444',
  revenue: '#22c55e',
  roas: '#3b82f6',
  ctr: '#f59e0b',
  efficiency: '#8b5cf6',
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ChartSkeleton() {
  return <Skeleton className="h-full min-h-[280px] w-full rounded-lg" />
}

function ProviderComparisonChart({ data }: { data: PerformanceAnalysis['chartData']['providerComparison'] }) {
  const chartData = data.map(d => ({
    name: d.displayName,
    spend: d.metrics.spend,
    revenue: d.metrics.revenue,
    roas: d.metrics.roas,
    efficiency: d.metrics.efficiencyScore,
    fill: d.color,
  }))

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'spend' || name === 'revenue') return formatCurrency(value)
              if (name === 'roas') return `${value.toFixed(2)}x`
              return value
            }}
          />
          <Legend />
          <Bar dataKey="spend" name="Spend" fill={metricColors.spend} radius={[0, 4, 4, 0]} />
          <Bar dataKey="revenue" name="Revenue" fill={metricColors.revenue} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EfficiencyRadarChart({
  data,
  providerId
}: {
  data: Record<string, { dimension: string; score: number; weight: number; benchmark: number }[]>
  providerId: string
}) {
  const breakdown = data[providerId]
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        No efficiency data available
      </div>
    )
  }

  const chartData = breakdown.map(b => ({
    metric: b.dimension,
    score: Math.round(b.score),
    fullMark: 100,
  }))

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={metricColors.efficiency}
            fill={metricColors.efficiency}
            fillOpacity={0.5}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendChart({
  data,
  providerId
}: {
  data: Record<string, { date: string; actual: number; trend: number }[]>
  providerId: string
}) {
  const trendData = data[providerId]
  if (!trendData || trendData.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Insufficient data for trend analysis
      </div>
    )
  }

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 10 }}
          />
          <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={(v) => new Date(v).toLocaleDateString()}
            formatter={(v: number) => formatCurrency(v)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Spend"
            stroke={metricColors.spend}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="trend"
            name="Trend (EMA)"
            stroke={metricColors.roas}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function FunnelChart({
  data,
  providerId
}: {
  data: Record<string, { name: string; value: number; fill: string; dropOff: number }[]>
  providerId: string
}) {
  const funnelData = data[providerId]
  if (!funnelData || funnelData.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        No funnel data available
      </div>
    )
  }

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={funnelData} layout="vertical" margin={{ left: 80, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              const dropOff = props?.payload?.dropOff ?? 0
              return [
                `${value.toLocaleString()} (${dropOff.toFixed(1)}% drop-off)`,
                name
              ]
            }}
          />
          <Bar dataKey="value" name="Volume" radius={[0, 4, 4, 0]}>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function BenchmarkChart({
  data,
  providerId
}: {
  data: Record<string, { metric: string; current: number; benchmark: number; percentile: number }[]>
  providerId: string
}) {
  const benchmarkData = data[providerId]
  if (!benchmarkData || benchmarkData.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        No benchmark data available
      </div>
    )
  }

  // Normalize for comparison (show as percentile)
  const chartData = benchmarkData.map(b => ({
    metric: b.metric,
    percentile: b.percentile,
    benchmark: 50, // Industry average is 50th percentile
  }))

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Percentile', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip formatter={(v: number) => `${v}th percentile`} />
          <Legend />
          <Bar dataKey="percentile" name="Your Performance" fill={metricColors.efficiency} radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.percentile > 75 ? '#22c55e' : entry.percentile > 50 ? '#3b82f6' : entry.percentile > 25 ? '#f59e0b' : '#ef4444'}
              />
            ))}
          </Bar>
          <Bar dataKey="benchmark" name="Industry Average" fill="#9ca3af" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InsightsChartsCard({ analysis, loading = false }: InsightsChartsCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  const providers = useMemo(() => {
    if (!analysis) return []
    return analysis.summaries.map(s => ({
      id: s.providerId,
      name: s.providerId === 'google' ? 'Google Ads' :
        s.providerId === 'facebook' || s.providerId === 'meta' ? 'Meta Ads' :
          s.providerId === 'linkedin' ? 'LinkedIn Ads' :
            s.providerId === 'tiktok' ? 'TikTok Ads' : s.providerId,
    }))
  }, [analysis])

  const activeProvider = selectedProvider === 'all' && providers.length > 0
    ? providers[0]!.id
    : selectedProvider

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!analysis || analysis.summaries.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Performance Insights</CardTitle>
          <CardDescription>Visual analysis of your ad performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
            Connect ad platforms and sync data to see performance charts.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Performance Insights</CardTitle>
            <CardDescription>
              Visual analysis across {providers.length} platform{providers.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          {providers.length > 1 && (
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Spend vs Revenue by Platform</h4>
              <p className="text-xs text-muted-foreground">Compare financial performance across connected platforms</p>
              <ProviderComparisonChart data={analysis.chartData.providerComparison} />
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Efficiency Breakdown</h4>
              <p className="text-xs text-muted-foreground">Multi-dimensional performance analysis</p>
              <EfficiencyRadarChart
                data={analysis.chartData.efficiencyBreakdown}
                providerId={activeProvider}
              />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Spend Trend Analysis</h4>
              <p className="text-xs text-muted-foreground">Historical spend with trend line</p>
              <TrendChart
                data={analysis.chartData.trendCharts}
                providerId={activeProvider}
              />
            </div>
          </TabsContent>

          <TabsContent value="funnel" className="mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Conversion Funnel</h4>
              <p className="text-xs text-muted-foreground">Impressions → Clicks → Conversions drop-off analysis</p>
              <FunnelChart
                data={analysis.chartData.funnelCharts}
                providerId={activeProvider}
              />
            </div>
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Industry Benchmarks</h4>
              <p className="text-xs text-muted-foreground">How you compare to industry averages</p>
              <BenchmarkChart
                data={analysis.chartData.benchmarkCharts}
                providerId={activeProvider}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
