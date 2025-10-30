'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '../utils'
import type { FinanceInvoice } from '@/types/finance'

interface FinanceRevenueSidebarProps {
  revenue: Array<{ name: string; revenue: number; percentage: number }>
  upcomingPayments: FinanceInvoice[]
  totalOutstanding: number
}

export function FinanceRevenueSidebar({ revenue, upcomingPayments, totalOutstanding }: FinanceRevenueSidebarProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>Revenue by client</CardTitle>
          <CardDescription>Top contributing clients by collected revenue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {revenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">Revenue data will appear here once reporting is synced.</p>
          ) : (
            revenue.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">{entry.name}</span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{formatCurrency(entry.revenue)}</p>
                  <p>{entry.percentage}% of total</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>Upcoming payments</CardTitle>
          <CardDescription>Outstanding invoices expected within the next 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming payments in the selected range.</p>
          ) : (
            upcomingPayments.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{invoice.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'TBC'}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
              </div>
            ))
          )}
          {totalOutstanding > 0 && (
            <p className="text-xs text-muted-foreground">
              Outstanding balance: {formatCurrency(totalOutstanding)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
