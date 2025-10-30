'use client'

import { Calendar, Download, Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FinanceInvoice, FinanceInvoiceStatus } from '@/types/finance'

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
}

export function FinanceInvoiceTable({ invoices, selectedStatus, onSelectStatus }: FinanceInvoiceTableProps) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recent invoices</CardTitle>
          <CardDescription>Filter, download, and monitor the latest billing activity.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[420px]">
          {invoices.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No invoices found for the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-muted/30">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {invoice.id} · {invoice.clientName}
                      </p>
                      <Badge variant="secondary" className={STATUS_COLORS[invoice.status]}>
                        {invoice.status}
                      </Badge>
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
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(invoice.amount)}
                      </p>
                      {invoice.status === 'overdue' && (
                        <span className="text-xs font-medium text-red-600">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View invoice">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download invoice">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
