'use client'

import { useState } from 'react'
import { BellRing, Calendar, Download, Eye, Loader2, RotateCcw, Search, FileDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FinanceInvoice, FinanceInvoiceStatus } from '@/types/finance'
import { exportToCsv } from '@/lib/utils'

import { formatCurrency } from '../utils'

const STATUS_COLORS: Record<FinanceInvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
}

interface FinanceInvoiceTableProps {
  invoices: FinanceInvoice[]
  selectedStatus: FinanceInvoiceStatus | 'all'
  onSelectStatus: (status: FinanceInvoiceStatus | 'all') => void
  onSendReminder?: (invoice: FinanceInvoice) => void
  onIssueRefund?: (invoice: FinanceInvoice) => void
  sendingInvoiceId?: string | null
  refundingInvoiceId?: string | null
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
}

export function FinanceInvoiceTable({
  invoices,
  selectedStatus,
  onSelectStatus,
  onSendReminder,
  onIssueRefund,
  sendingInvoiceId,
  refundingInvoiceId,
  onLoadMore,
  hasMore,
  loadingMore,
}: FinanceInvoiceTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      invoice.clientName?.toLowerCase().includes(query) ||
      invoice.number?.toLowerCase().includes(query) ||
      invoice.id.toLowerCase().includes(query) ||
      invoice.description?.toLowerCase().includes(query)
    )
  })

  const handleExport = () => {
    exportToCsv(
      filteredInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        client: inv.clientName,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        issuedDate: inv.issuedDate,
        dueDate: inv.dueDate,
        paidDate: inv.paidDate,
      })),
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'number', label: 'Invoice Number' },
        { key: 'client', label: 'Client' },
        { key: 'amount', label: 'Amount' },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'issuedDate', label: 'Issued Date' },
        { key: 'dueDate', label: 'Due Date' },
        { key: 'paidDate', label: 'Paid Date' },
      ]
    )
  }

  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recent invoices</CardTitle>
          <CardDescription>Filter, download, and monitor the latest billing activity.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredInvoices.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedStatus} onValueChange={onSelectStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[420px]">
          {filteredInvoices.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No invoices found for the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-muted/30">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {invoice.number ?? invoice.id} · {invoice.clientName}
                      </p>
                      <Badge variant="secondary" className={STATUS_COLORS[invoice.status]}>
                        {invoice.status}
                      </Badge>
                      {invoice.stripeStatus && invoice.stripeStatus !== invoice.status && (
                        <Badge variant="outline" className="capitalize">
                          {invoice.stripeStatus.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    {invoice.description && <p className="text-sm text-muted-foreground">{invoice.description}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {invoice.issuedDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Issued {new Date(invoice.issuedDate).toLocaleDateString()}
                        </span>
                      )}
                      {invoice.dueDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {invoice.paidDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Paid {new Date(invoice.paidDate).toLocaleDateString()}
                        </span>
                      )}
                      {typeof invoice.amountPaid === 'number' && invoice.amountPaid > 0 ? (
                        <span>Paid {formatCurrency(invoice.amountPaid, invoice.currency ?? 'USD')}</span>
                      ) : null}
                      {typeof invoice.amountRemaining === 'number' && invoice.amountRemaining > 0 ? (
                        <span>Outstanding {formatCurrency(invoice.amountRemaining, invoice.currency ?? 'USD')}</span>
                      ) : null}
                      {typeof invoice.amountRefunded === 'number' && invoice.amountRefunded > 0 ? (
                        <span>Refunded {formatCurrency(invoice.amountRefunded, invoice.currency ?? 'USD')}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(invoice.amount, invoice.currency ?? 'USD')}
                      </p>
                      {invoice.status === 'overdue' && (
                        <span className="text-xs font-medium text-red-600">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="View invoice"
                        disabled={!invoice.hostedInvoiceUrl}
                        onClick={() => {
                          if (!invoice.hostedInvoiceUrl) return
                          window.open(invoice.hostedInvoiceUrl, '_blank', 'noopener')
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Download invoice"
                        disabled={!invoice.hostedInvoiceUrl}
                        onClick={() => {
                          if (!invoice.hostedInvoiceUrl) return
                          window.open(`${invoice.hostedInvoiceUrl}?download=1`, '_blank', 'noopener')
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {onSendReminder && (invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Send reminder"
                          disabled={sendingInvoiceId === invoice.id}
                          onClick={() => onSendReminder(invoice)}
                        >
                          <BellRing className={`h-4 w-4 ${sendingInvoiceId === invoice.id ? 'animate-pulse text-primary' : ''}`} />
                        </Button>
                      )}
                      {onIssueRefund && invoice.status === 'paid' && typeof invoice.amountPaid === 'number' && (invoice.amountRefunded ?? 0) < invoice.amountPaid && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Issue refund"
                          disabled={refundingInvoiceId === invoice.id}
                          onClick={() => onIssueRefund(invoice)}
                        >
                          <RotateCcw className={`h-4 w-4 ${refundingInvoiceId === invoice.id ? 'animate-spin text-primary' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {hasMore ? (
          <div className="border-t border-muted/30 px-6 py-3 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onLoadMore?.()}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading more
                </span>
              ) : (
                'Load more invoices'
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
