'use client'

import React from 'react'
import Link from 'next/link'
import { CreditCard, ArrowRight, Clock, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { FinanceInvoice, FinanceSummaryResponse } from '@/types/finance'
import { cn, formatCurrency } from '@/lib/utils'
import { formatCurrencyDistribution, getPrimaryCurrencyTotals } from '@/app/dashboard/finance/utils'

type Props = {
  financeSummary: FinanceSummaryResponse | null
  loading: boolean
  error?: string | null
}

function getOutstandingAmount(invoice: FinanceInvoice): number {
  if (typeof invoice.amountRemaining === 'number' && Number.isFinite(invoice.amountRemaining)) {
    return invoice.amountRemaining
  }

  if (typeof invoice.amountPaid === 'number' && Number.isFinite(invoice.amountPaid)) {
    return Math.max(invoice.amount - invoice.amountPaid, 0)
  }

  return invoice.amount
}

function getInvoiceStatusVariant(status: FinanceInvoice['status']): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'overdue') return 'destructive'
  if (status === 'sent') return 'default'
  if (status === 'paid') return 'secondary'
  return 'outline'
}

export function ClientInvoicesCard({ financeSummary, loading, error }: Props) {
  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />
  }

  const paymentSummary = financeSummary?.payments
  const invoices = Array.isArray(financeSummary?.invoices) ? financeSummary!.invoices : []

  const primaryCurrencyTotals = getPrimaryCurrencyTotals(paymentSummary?.totals) ?? {
    currency: 'USD',
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    refundTotal: 0,
  }

  const primaryCurrency = primaryCurrencyTotals.currency
  const outstandingDisplay = formatCurrencyDistribution(paymentSummary?.totals, 'totalOutstanding', primaryCurrency)

  const openInvoices = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
      return aDue - bDue
    })

  const recentOpen = openInvoices.slice(0, 3)

  const nextDueDisplay = (() => {
    if (paymentSummary?.nextDueAt) {
      return new Date(paymentSummary.nextDueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    const first = openInvoices[0]
    if (first?.dueDate) {
      return new Date(first.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    return 'No upcoming due dates'
  })()

  return (
    <Card className="shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Billing
            </CardTitle>
            <CardDescription>Invoice status and upcoming payments</CardDescription>
          </div>
          <Link href="/dashboard/finance/payments">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              View <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-lg bg-muted/5">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium">Billing data unavailable</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">{error}</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase truncate">Outstanding</p>
                <p className="text-sm font-bold leading-tight">{outstandingDisplay}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase truncate">Open</p>
                <p className="text-lg font-bold">{paymentSummary?.openCount ?? 0}</p>
              </div>
              <div className={cn(
                'rounded-lg p-2 text-center border',
                (paymentSummary?.overdueCount ?? 0) > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
              )}>
                <p className={cn(
                  'text-xs font-medium uppercase truncate',
                  (paymentSummary?.overdueCount ?? 0) > 0 ? 'text-red-700' : 'text-emerald-700'
                )}>
                  Overdue
                </p>
                <p className={cn(
                  'text-lg font-bold',
                  (paymentSummary?.overdueCount ?? 0) > 0 ? 'text-red-800' : 'text-emerald-800'
                )}>
                  {paymentSummary?.overdueCount ?? 0}
                </p>
              </div>
            </div>

            {/* Next due */}
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                Next due
              </div>
              <p className="text-xs font-semibold text-foreground">{nextDueDisplay}</p>
            </div>

            {/* Open invoices list */}
            <div className="space-y-3 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Open Invoices</p>
              {recentOpen.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-lg bg-muted/5">
                  <CreditCard className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No outstanding invoices</p>
                </div>
              ) : (
                recentOpen.map((invoice) => {
                  const outstanding = getOutstandingAmount(invoice)
                  return (
                    <div key={invoice.id} className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{invoice.number ? `Invoice ${invoice.number}` : 'Invoice'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBC'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getInvoiceStatusVariant(invoice.status)}
                          className={cn(
                            'text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter',
                            invoice.status === 'sent' && 'bg-primary hover:bg-primary',
                            invoice.status === 'overdue' && 'bg-destructive hover:bg-destructive'
                          )}
                        >
                          {invoice.status}
                        </Badge>
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(outstanding, invoice.currency ?? primaryCurrency)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
