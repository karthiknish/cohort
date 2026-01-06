'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { TrendingUp, Sparkles } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCurrency } from '../utils'

interface ForecastDatum {
  label: string
  revenue: number
  profit: number
}

interface FinanceForecastCardProps {
  data: ForecastDatum[]
  currency?: string
}

export function FinanceForecastCard({ data, currency }: FinanceForecastCardProps) {
  const resolvedCurrency = currency ?? 'USD'

  const isEmpty = !data || data.length === 0

  if (isEmpty) return null

  const chartConfig = {
    revenue: {
      label: 'Projected Revenue',
      color: 'hsl(var(--primary))',
    },
    profit: {
      label: 'Projected Profit',
      color: 'hsl(142.1 76.2% 36.3%)', // Emerald color
    },
  } satisfies ChartConfig

  return (
    <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Financial Forecast
            </CardTitle>
            <CardDescription>
              Projected performance for the next 3 months based on recent trends.
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastProfitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0} />
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
                  indicator="dashed"
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {name === 'revenue' ? 'Projected Revenue' : 'Projected Profit'}
                      </span>
                      <span className={`font-bold ${name === 'revenue' ? 'text-primary' : 'text-emerald-600'}`}>
                        {formatCurrency(Number(value), resolvedCurrency)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-revenue)" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              fill="url(#forecastRevenueGradient)"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="var(--color-profit)" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              fill="url(#forecastProfitGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
