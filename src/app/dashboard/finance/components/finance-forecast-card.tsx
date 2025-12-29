'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, Sparkles } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      <CardContent className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-primary/20 bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                      <p className="mb-2 font-semibold text-foreground text-xs uppercase tracking-wider">{label}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Projected Revenue</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(Number(payload[0].value), resolvedCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Projected Profit</span>
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(Number(payload[1].value), resolvedCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              fill="url(#forecastRevenueGradient)"
              name="Projected Revenue" 
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(var(--emerald-500))" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              fill="transparent"
              name="Projected Profit" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
