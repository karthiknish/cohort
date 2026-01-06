'use client'

import { useMemo } from 'react'
import { LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from './utils'
import type { InvoiceSummary } from './types'

interface InvoiceHistorySectionProps {
  loading: boolean
  invoices: InvoiceSummary[]
}

export function InvoiceHistorySection({
  loading,
  invoices,
}: InvoiceHistorySectionProps) {
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0
      return bTime - aTime
    })
  }, [invoices])

  const loadingView = (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading billing details...
      </div>
    </div>
  )

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Invoice history</h2>
        <p className="text-sm text-muted-foreground">Download receipts for bookkeeping or click through to Stripe-hosted invoices.</p>
      </div>

      {loading && !sortedInvoices.length ? (
        loadingView
      ) : sortedInvoices.length ? (
        <div className="divide-y divide-border/60 rounded-lg border border-border/60">
          {sortedInvoices.map((invoice) => (
            <div key={invoice.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {invoice.number ?? invoice.id}
                  </span>
                  {invoice.status ? (
                    <Badge variant="outline" className="capitalize">
                      {invoice.status.replace(/_/g, ' ')}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoice.createdAt ? formatDate(invoice.createdAt) : 'Date unavailable'}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-foreground md:flex-row md:items-center md:gap-4">
                <span className="font-medium">
                  {formatCurrency(invoice.total || invoice.amountPaid, invoice.currency ?? undefined)}
                </span>
                <div className="flex gap-2">
                  {invoice.hostedInvoiceUrl ? (
                    <Button variant="outline" asChild size="sm">
                      <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                        View invoice
                      </a>
                    </Button>
                  ) : null}
                  {invoice.invoicePdf ? (
                    <Button variant="ghost" asChild size="sm">
                      <a href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                        Download PDF
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
          No invoices to show yet. Once you subscribe you will see receipts and payment history here.
        </div>
      )}
    </section>
  )
}
