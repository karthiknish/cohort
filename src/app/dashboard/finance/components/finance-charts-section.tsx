'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { AreaChart, Area, BarChart, Bar, CartesianGrid, Line, XAxis, YAxis } from '@/components/ui/recharts-dynamic'

import { formatCurrency } from '../utils'

interface ChartDatum {
  label: string
  period: string
  revenue: number
  operatingExpenses: number
  companyCosts: number
  totalExpenses: number
  profit: number
}

interface FinanceChartsSectionProps {
  data: ChartDatum[]
  currency?: string
}

function EmptyChartState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="rounded-full bg-muted/30 p-4 mb-4">
        <TrendingUp className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No data yet</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        Financial data will appear here once invoices and revenue are recorded.
      </p>
    </div>
  )
}

// Chart configuration for Revenue vs Expenses chart
const revenueExpensesConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  totalExpenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
  profit: {
    label: "Profit",
    color: "#8b5cf6",
  },
} satisfies ChartConfig

// Chart configuration for Expense Breakdown chart
const expenseBreakdownConfig = {
  operatingExpenses: {
    label: "Campaign Spend",
    color: "#8b5cf6",
  },
  companyCosts: {
    label: "Company Costs",
    color: "#f59e0b",
  },
} satisfies ChartConfig

export function FinanceChartsSection({ data, currency }: FinanceChartsSectionProps) {
  const resolvedCurrency = currency ?? 'USD'

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!data.length) return null
    
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
    const totalExpenses = data.reduce((sum, d) => sum + d.totalExpenses, 0)
    const totalProfit = data.reduce((sum, d) => sum + d.profit, 0)
    const avgProfit = totalProfit / data.length
    
    // Calculate trend (compare last 2 periods if available)
    let profitTrend: 'up' | 'down' | 'neutral' = 'neutral'
    if (data.length >= 2) {
      const lastProfit = data[data.length - 1]!.profit
      const prevProfit = data[data.length - 2]!.profit
      if (lastProfit > prevProfit * 1.05) profitTrend = 'up'
      else if (lastProfit < prevProfit * 0.95) profitTrend = 'down'
    }
    
    return { totalRevenue, totalExpenses, totalProfit, avgProfit, profitTrend }
  }, [data])

  const isEmpty = !data.length

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      {summaryStats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-muted/40 bg-gradient-to-br from-emerald-50/50 to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {formatCurrency(summaryStats.totalRevenue, resolvedCurrency)}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-muted/40 bg-gradient-to-br from-red-50/50 to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(summaryStats.totalExpenses, resolvedCurrency)}
                  </p>
                </div>
                <div className="rounded-full bg-red-100 p-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-muted/40 bg-gradient-to-br from-violet-50/50 to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Net Profit</p>
                  <p className={`text-2xl font-bold mt-1 ${summaryStats.totalProfit >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                    {formatCurrency(summaryStats.totalProfit, resolvedCurrency)}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    summaryStats.profitTrend === 'up' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : summaryStats.profitTrend === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {summaryStats.profitTrend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {summaryStats.profitTrend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {summaryStats.profitTrend === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                  {summaryStats.profitTrend === 'up' ? 'Growing' : summaryStats.profitTrend === 'down' ? 'Declining' : 'Stable'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Revenue vs Expenses Chart */}
        <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison with profit trend overlay.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isEmpty ? (
              <div className="h-[320px]">
                <EmptyChartState />
              </div>
            ) : (
              <ChartContainer config={revenueExpensesConfig} className="h-[320px] w-full">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-totalExpenses)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-totalExpenses)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(Number(value), resolvedCurrency)}
                            </span>
                          </div>
                        )}
                      />
                    } 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-revenue)" 
                    strokeWidth={2.5} 
                    fill="url(#revenueGradient)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalExpenses" 
                    stroke="var(--color-totalExpenses)" 
                    strokeWidth={2.5} 
                    fill="url(#expenseGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="var(--color-profit)" 
                    strokeWidth={2.5} 
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: 'var(--color-profit)', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown Chart */}
        <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
            <CardDescription>Campaign spend vs company operating costs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isEmpty ? (
              <div className="h-[320px]">
                <EmptyChartState />
              </div>
            ) : (
              <ChartContainer config={expenseBreakdownConfig} className="h-[320px] w-full">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(Number(value), resolvedCurrency)}
                            </span>
                          </div>
                        )}
                      />
                    } 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    dataKey="operatingExpenses" 
                    stackId="expenses" 
                    fill="var(--color-operatingExpenses)" 
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar 
                    dataKey="companyCosts" 
                    stackId="expenses" 
                    fill="var(--color-companyCosts)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
