'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useClientContext } from '@/contexts/client-context'
import { formatDate, formatInvoiceAmount, getInvoiceBadgeVariant, isInvoiceOutstanding } from './utils'

export function ClientBillingCard() {
  const { selectedClient } = useClientContext()

  const outstandingInvoiceStatus = selectedClient?.lastInvoiceStatus ?? null
  const outstandingInvoiceAmount = typeof selectedClient?.lastInvoiceAmount === 'number' ? selectedClient.lastInvoiceAmount : null
  const outstandingInvoiceCurrency = selectedClient?.lastInvoiceCurrency ?? 'usd'
  const outstandingInvoiceNumber = selectedClient?.lastInvoiceNumber ?? null
  const outstandingInvoiceUrl = selectedClient?.lastInvoiceUrl ?? null
  const outstandingInvoiceIssuedAt = selectedClient?.lastInvoiceIssuedAt ?? null
  const outstandingInvoiceEmail = selectedClient?.billingEmail ?? null

  const invoiceStatusIsOutstanding = isInvoiceOutstanding(outstandingInvoiceStatus)
  const hasClientInvoice = outstandingInvoiceAmount !== null || outstandingInvoiceStatus !== null || outstandingInvoiceNumber !== null

  const formattedInvoiceIssuedAtRaw = outstandingInvoiceIssuedAt ? formatDate(outstandingInvoiceIssuedAt) : null
  const formattedInvoiceIssuedAt = formattedInvoiceIssuedAtRaw && formattedInvoiceIssuedAtRaw !== 'Date unavailable' ? formattedInvoiceIssuedAtRaw : null

  const invoiceBadgeVariant = getInvoiceBadgeVariant(outstandingInvoiceStatus, invoiceStatusIsOutstanding)
  const invoiceHeaderLabel = invoiceStatusIsOutstanding ? 'Outstanding balance' : 'Latest invoice'
  const invoiceStatusLabel = outstandingInvoiceStatus ? outstandingInvoiceStatus.replace(/_/g, ' ') : null
  const invoiceContainerClass = cn(
    'rounded-lg border p-4 transition-colors',
    invoiceStatusIsOutstanding ? 'border-destructive/40 bg-destructive/10 text-destructive-foreground' : 'border-muted/60 bg-muted/20 text-foreground'
  )

  const displayInvoiceAmount = formatInvoiceAmount(outstandingInvoiceAmount, outstandingInvoiceCurrency)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client billing</CardTitle>
        <CardDescription>
          {selectedClient ? `Latest invoice for ${selectedClient.name}.` : 'Select a client workspace to view outstanding balances.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedClient ? (
          hasClientInvoice ? (
            <div className={invoiceContainerClass}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{invoiceHeaderLabel}</span>
                {invoiceStatusLabel ? (
                  <Badge variant={invoiceBadgeVariant} className="capitalize">
                    {invoiceStatusLabel}
                  </Badge>
                ) : null}
              </div>
              {displayInvoiceAmount ? (
                <p className="mt-2 text-xl font-semibold">{displayInvoiceAmount}</p>
              ) : (
                <p className="mt-2 text-sm">No amount on record for the latest invoice.</p>
              )}
              {outstandingInvoiceNumber ? (
                <p className="mt-2 text-xs text-muted-foreground">Invoice {outstandingInvoiceNumber}</p>
              ) : null}
              {formattedInvoiceIssuedAt ? (
                <p className="text-xs text-muted-foreground">Sent {formattedInvoiceIssuedAt}</p>
              ) : null}
              {outstandingInvoiceEmail ? (
                <p className="text-xs text-muted-foreground">Delivered to {outstandingInvoiceEmail}</p>
              ) : null}
              {outstandingInvoiceUrl ? (
                <Button asChild size="sm" variant="outline" className="mt-3 w-fit">
                  <a href={outstandingInvoiceUrl} target="_blank" rel="noreferrer">
                    View invoice
                  </a>
                </Button>
              ) : null}
              {invoiceStatusIsOutstanding ? (
                <p className="mt-3 text-xs font-medium">
                  Please settle this balance to keep services running smoothly.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No invoices have been issued for this client yet. New invoices will appear here as soon as they are sent.
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a client workspace from the sidebar to view invoice details and payment status.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminBillingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client invoicing</CardTitle>
        <CardDescription>Send Stripe invoices and review payment status from the admin clients workspace.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Head to the admin clients dashboard whenever you need to raise a new invoice or confirm a payment.
        </p>
        <Button asChild>
          <Link href="/admin/clients">Open admin clients</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
