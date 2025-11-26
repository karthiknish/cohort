'use client'

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
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  payload?: { value: number; name: string; color: string }[]
  label?: string
  currency: string
}

function CustomTooltip({ active, payload, label, currency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
        <p className="mb-2 font-medium text-foreground">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
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

export function FinanceChartsSection({ data, currency }: FinanceChartsSectionProps) {
  const resolvedCurrency = currency ?? 'USD'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-muted/60 bg-background shadow-sm">
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>Monthly totals that incorporate company-level operating costs.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
              <XAxis 
                dataKey="label" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip currency={resolvedCurrency} />} cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Revenue" 
              />
              <Line 
                type="monotone" 
                dataKey="totalExpenses" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'hsl(var(--destructive))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Total Expenses" 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Profit" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background shadow-sm">
        <CardHeader>
          <CardTitle>Expense Composition</CardTitle>
          <CardDescription>Breakdown of campaign spend vs operating costs by month.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
              <XAxis 
                dataKey="label" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip currency={resolvedCurrency} />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
        </CardContent>
      </Card>
    </div>
  )
}
