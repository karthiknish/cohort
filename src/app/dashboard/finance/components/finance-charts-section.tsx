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

export function FinanceChartsSection({ data, currency }: FinanceChartsSectionProps) {
  const resolvedCurrency = currency ?? 'USD'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>Revenue vs expenses</CardTitle>
          <CardDescription>Monthly totals that incorporate company-level operating costs.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value), resolvedCurrency)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="totalExpenses" stroke="#ef4444" strokeWidth={2} name="Total expenses" />
              <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>Expense composition</CardTitle>
          <CardDescription>Breakdown of campaign spend vs operating costs by month.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value), resolvedCurrency)} />
              <Legend />
              <Bar dataKey="operatingExpenses" stackId="expenses" fill="#6366f1" name="Campaign spend" />
              <Bar dataKey="companyCosts" stackId="expenses" fill="#f59e0b" name="Company costs" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
