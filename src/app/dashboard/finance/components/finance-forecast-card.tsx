'use client'

import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from '@/components/ui/recharts-dynamic'
import { TrendingUp } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
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
  } satisfies import('@/components/ui/chart').ChartConfig

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenue Forecast
        </CardTitle>
        <CardDescription>Projected revenue vs profit for next quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatCurrency(value, resolvedCurrency)}
              width={0}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="var(--color-profit)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
