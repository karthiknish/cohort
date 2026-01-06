'use client'

import { useState } from 'react'
import {
  BellRing,
  Calendar,
  Download,
  Eye,
  FileDown,
  LoaderCircle,
  MoreHorizontal,
  RotateCcw,
  Search,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
    <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Recent Invoices</CardTitle>
          <CardDescription className="mt-1">Filter, download, and monitor the latest billing activity.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport} 
            disabled={filteredInvoices.length === 0}
            className="hover:bg-muted/50 transition-colors"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:ring-primary"
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
        <ScrollArea className="max-h-[520px]">
          {filteredInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No invoices found for the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-muted/30">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="group flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-sm font-semibold text-foreground">
                        {invoice.number ?? invoice.id}
                      </p>
                      <span className="text-muted-foreground">·</span>
                      <p className="text-sm text-foreground">{invoice.clientName}</p>
                      <Badge variant="secondary" className={`${STATUS_COLORS[invoice.status]} font-medium`}>
                        {invoice.status}
                      </Badge>
                      {invoice.stripeStatus && invoice.stripeStatus !== invoice.status && (
                        <Badge variant="outline" className="capitalize text-xs">
                          {invoice.stripeStatus.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    {invoice.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{invoice.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {invoice.issuedDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> 
                          Issued {new Date(invoice.issuedDate).toLocaleDateString()}
                        </span>
                      )}
                      {invoice.dueDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> 
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {invoice.paidDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> 
                          Paid {new Date(invoice.paidDate).toLocaleDateString()}
                        </span>
                      )}
                      {typeof invoice.amountPaid === 'number' && invoice.amountPaid > 0 ? (
                        <span className="font-medium">
                          Paid {formatCurrency(invoice.amountPaid, invoice.currency ?? 'USD')}
                        </span>
                      ) : null}
                      {typeof invoice.amountRemaining === 'number' && invoice.amountRemaining > 0 ? (
                        <span className="font-medium text-amber-600">
                          Outstanding {formatCurrency(invoice.amountRemaining, invoice.currency ?? 'USD')}
                        </span>
                      ) : null}
                      {typeof invoice.amountRefunded === 'number' && invoice.amountRefunded > 0 ? (
                        <span className="font-medium text-blue-600">
                          Refunded {formatCurrency(invoice.amountRefunded, invoice.currency ?? 'USD')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(invoice.amount, invoice.currency ?? 'USD')}
                      </p>
                      {invoice.status === 'overdue' && (
                        <span className="text-xs font-semibold text-red-600">Overdue</span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 opacity-70 group-hover:opacity-100 transition-opacity"
                          aria-label="Invoice actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={!invoice.hostedInvoiceUrl}
                          onClick={() => {
                            if (!invoice.hostedInvoiceUrl) return
                            window.open(invoice.hostedInvoiceUrl, '_blank', 'noopener')
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!invoice.hostedInvoiceUrl}
                          onClick={() => {
                            if (!invoice.hostedInvoiceUrl) return
                            window.open(`${invoice.hostedInvoiceUrl}?download=1`, '_blank', 'noopener')
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        {onSendReminder && (invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={sendingInvoiceId === invoice.id}
                              onClick={() => onSendReminder(invoice)}
                            >
                              <BellRing className={`mr-2 h-4 w-4 ${sendingInvoiceId === invoice.id ? 'animate-pulse text-primary' : ''}`} />
                              {sendingInvoiceId === invoice.id ? 'Sending...' : 'Send Reminder'}
                            </DropdownMenuItem>
                          </>
                        )}
                        {onIssueRefund && 
                          invoice.status === 'paid' && 
                          typeof invoice.amountPaid === 'number' && 
                          (invoice.amountRefunded ?? 0) < invoice.amountPaid && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={refundingInvoiceId === invoice.id}
                              onClick={() => onIssueRefund(invoice)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <RotateCcw className={`mr-2 h-4 w-4 ${refundingInvoiceId === invoice.id ? 'animate-spin' : ''}`} />
                              {refundingInvoiceId === invoice.id ? 'Processing...' : 'Issue Refund'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {hasMore ? (
          <div className="border-t border-muted/30 px-6 py-4 text-center bg-muted/5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onLoadMore?.()}
              disabled={loadingMore}
              className="hover:bg-muted/50 transition-colors"
            >
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Loading more
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
