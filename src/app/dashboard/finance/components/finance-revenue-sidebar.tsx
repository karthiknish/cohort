'use client'

import { CalendarClock, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <div className="space-y-6">
      {/* Revenue by Client Card */}
      <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Revenue by Client</CardTitle>
              <CardDescription>Top contributing clients by collected revenue.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-muted/30 p-3 mb-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">Revenue data will appear here once reporting is synced.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {revenue.map((entry, index) => (
                <div key={entry.name} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground text-sm truncate max-w-[140px]">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-foreground text-sm tabular-nums">
                      {formatCurrency(entry.revenue, primaryCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={entry.percentage} className="h-2 flex-1" />
                    <span className="w-10 text-right text-xs font-medium text-muted-foreground tabular-nums">
                      {entry.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Payments Card */}
      <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <CalendarClock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Upcoming Payments</CardTitle>
              <CardDescription>Outstanding invoices expected soon.</CardDescription>
            </div>
            {upcomingPayments.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {upcomingPayments.length} pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {upcomingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-muted/30 p-3 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No upcoming payments in the selected range.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[300px] pr-2">
              <div className="space-y-3">
                {upcomingPayments.map((invoice) => {
                  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null
                  const isOverdue = dueDate && dueDate < new Date()
                  const amountDue = typeof invoice.amountRemaining === 'number'
                    ? invoice.amountRemaining
                    : typeof invoice.amountPaid === 'number'
                      ? Math.max(invoice.amount - invoice.amountPaid, 0)
                      : invoice.amount

                  return (
                    <div
                      key={invoice.id}
                      className="group flex items-center justify-between rounded-lg border border-muted/40 bg-card p-3.5 transition-all hover:bg-muted/20 hover:border-muted/60 hover:shadow-sm"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {invoice.clientName}
                          </p>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{invoice.dueDate ? `Due ${new Date(invoice.dueDate).toLocaleDateString()}` : 'TBC'}</span>
                          <span>·</span>
                          <span className="text-muted-foreground/70">{invoice.number ?? 'No #'}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(amountDue, invoice.currency ?? primaryCurrency)}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-medium uppercase tracking-wider text-amber-600">
                          <ArrowUpRight className="h-3 w-3" />
                          Pending
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
          
          {hasOutstanding && (
            <div className="mt-4 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 p-3.5 border border-muted/30">
              <p className="text-xs font-medium text-muted-foreground text-center">
                Total Outstanding: <span className="text-foreground font-semibold">{outstandingDisplay}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
