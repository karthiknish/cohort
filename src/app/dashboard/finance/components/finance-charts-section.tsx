'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number; name: string; color: string; dataKey?: string }[]
  label?: string
  currency: string
}

function CustomTooltip({ active, payload, label, currency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm p-4 shadow-xl ring-1 ring-black/5">
        <p className="mb-3 font-semibold text-foreground border-b pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(Number(entry.value), currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
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
      const lastProfit = data[data.length - 1].profit
      const prevProfit = data[data.length - 2].profit
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
          <Card className="border-muted/40 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(summaryStats.totalRevenue, resolvedCurrency)}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-muted/40 bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {formatCurrency(summaryStats.totalExpenses, resolvedCurrency)}
                  </p>
                </div>
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-muted/40 bg-gradient-to-br from-violet-50/50 to-background dark:from-violet-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Net Profit</p>
                  <p className={`text-2xl font-bold mt-1 ${summaryStats.totalProfit >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600'}`}>
                    {formatCurrency(summaryStats.totalProfit, resolvedCurrency)}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    summaryStats.profitTrend === 'up' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : summaryStats.profitTrend === 'down'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
        <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison with profit trend overlay.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full pt-4">
            {isEmpty ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip currency={resolvedCurrency} />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '16px' }} 
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2.5} 
                    fill="url(#revenueGradient)"
                    name="Revenue" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalExpenses" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2.5} 
                    fill="url(#expenseGradient)"
                    name="Expenses" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8b5cf6" 
                    strokeWidth={2.5} 
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    name="Profit" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
            <CardDescription>Campaign spend vs company operating costs.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full pt-4">
            {isEmpty ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip currency={resolvedCurrency} />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15, radius: 4 }} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '16px' }} 
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar 
                    dataKey="operatingExpenses" 
                    stackId="expenses" 
                    fill="#8b5cf6" 
                    name="Campaign Spend" 
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar 
                    dataKey="companyCosts" 
                    stackId="expenses" 
                    fill="#f59e0b" 
                    name="Company Costs" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
