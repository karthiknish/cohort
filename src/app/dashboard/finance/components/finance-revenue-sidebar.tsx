'use client'

import { CalendarClock, TrendingUp } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatCurrencyDistribution } from '../utils'
import type { FinanceInvoice, FinancePaymentSummary } from '@/types/finance'

interface FinanceRevenueSidebarProps {
  revenue: Array<{ name: string; revenue: number; percentage: number }>
  upcomingPayments: FinanceInvoice[]
  totalOutstanding: number
  currencyTotals: FinancePaymentSummary['totals']
  primaryCurrency: string
}

export function FinanceRevenueSidebar({ revenue, upcomingPayments, totalOutstanding, currencyTotals, primaryCurrency }: FinanceRevenueSidebarProps) {
  const outstandingDisplay = formatCurrencyDistribution(currencyTotals, 'totalOutstanding', primaryCurrency)
  const hasOutstanding = totalOutstanding > 0 || currencyTotals.some((entry) => entry.totalOutstanding > 0)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Revenue by Client</CardTitle>
              <CardDescription>Top contributing clients by collected revenue.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {revenue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">Revenue data will appear here once reporting is synced.</p>
            </div>
          ) : (
            revenue.map((entry) => (
              <div key={entry.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{entry.name}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(entry.revenue, primaryCurrency)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={entry.percentage} className="h-2" />
                  <span className="w-12 text-right text-xs text-muted-foreground">{entry.percentage}%</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-500/10 p-2">
              <CalendarClock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Upcoming Payments</CardTitle>
              <CardDescription>Outstanding invoices expected within the next 30 days.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No upcoming payments in the selected range.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map((invoice) => (
                <div
                  key={invoice.id}
                  className="group flex items-center justify-between rounded-lg border border-muted/40 bg-card p-3 transition-colors hover:bg-muted/20 hover:border-muted/60"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {invoice.clientName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'TBC'}</span>
                      <span>·</span>
                      <span>{invoice.number ?? 'No #'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(
                        typeof invoice.amountRemaining === 'number'
                          ? invoice.amountRemaining
                          : typeof invoice.amountPaid === 'number'
                            ? Math.max(invoice.amount - invoice.amountPaid, 0)
                            : invoice.amount,
                        invoice.currency ?? primaryCurrency
                      )}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">
                      Pending
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hasOutstanding && (
            <div className="mt-4 rounded-lg bg-muted/30 p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                Total Outstanding Balance: <span className="text-foreground">{outstandingDisplay}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
