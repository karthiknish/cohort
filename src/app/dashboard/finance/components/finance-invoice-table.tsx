'use client'

import { useState, useRef, useMemo, useCallback, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  FileText,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FinanceInvoice, FinanceInvoiceStatus } from '@/types/finance'
import { exportToCsv } from '@/lib/utils'
import { cn } from '@/lib/utils'

import { formatCurrency } from '../utils'

// =============================================================================
// CONSTANTS & HELPERS
// =============================================================================

const STATUS_COLORS: Record<FinanceInvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
}

const URGENCY_STYLES = {
  warning: 'border-l-4 border-l-amber-400 bg-amber-50/30',
  danger: 'border-l-4 border-l-orange-500 bg-orange-50/30',
  critical: 'border-l-4 border-l-red-600 bg-red-50/30',
}

function getOverdueUrgency(dueDate: string | undefined, status: FinanceInvoiceStatus): { 
  days: number
  level: 'warning' | 'danger' | 'critical' | null 
} {
  if (status !== 'overdue' || !dueDate) return { days: 0, level: null }
  
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (days <= 7) return { days, level: 'warning' }
  if (days <= 30) return { days, level: 'danger' }
  return { days, level: 'critical' }
}

// =============================================================================
// INVOICE ROW COMPONENT
// =============================================================================

interface InvoiceRowProps {
  invoice: FinanceInvoice
  paddingX: string
  onSendReminder?: (invoice: FinanceInvoice) => void
  onIssueRefund?: (invoice: FinanceInvoice) => void
  sendingInvoiceId?: string | null
  refundingInvoiceId?: string | null
}

const InvoiceRow = memo(function InvoiceRow({
  invoice,
  paddingX,
  onSendReminder,
  onIssueRefund,
  sendingInvoiceId,
  refundingInvoiceId,
}: InvoiceRowProps) {
  const urgency = getOverdueUrgency(invoice.dueDate ?? undefined, invoice.status)
  
  return (
    <div
      className={cn(
        'group flex flex-col gap-4 py-5 transition-all hover:bg-muted/20 md:flex-row md:items-center md:justify-between',
        paddingX,
        urgency.level && URGENCY_STYLES[urgency.level]
      )}
    >
      {/* Invoice details */}
      <div className="flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-sm font-semibold text-foreground">
            {invoice.number ?? invoice.id.slice(0, 8)}
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
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
            {invoice.description}
          </p>
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
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              <Calendar className="h-3.5 w-3.5" />
              Paid {new Date(invoice.paidDate).toLocaleDateString()}
            </span>
          )}
          {typeof invoice.amountPaid === 'number' && invoice.amountPaid > 0 && (
            <span className="font-medium text-emerald-600">
              Paid {formatCurrency(invoice.amountPaid, invoice.currency ?? 'USD')}
            </span>
          )}
          {typeof invoice.amountRemaining === 'number' && invoice.amountRemaining > 0 && (
            <span className="font-medium text-amber-600">
              Outstanding {formatCurrency(invoice.amountRemaining, invoice.currency ?? 'USD')}
            </span>
          )}
          {typeof invoice.amountRefunded === 'number' && invoice.amountRefunded > 0 && (
            <span className="font-medium text-blue-600">
              Refunded {formatCurrency(invoice.amountRefunded, invoice.currency ?? 'USD')}
            </span>
          )}
        </div>
      </div>
      
      {/* Amount and actions */}
      <div className="flex items-center justify-between gap-4 md:justify-end">
        <div className="text-right">
          <p className="text-lg font-semibold text-foreground tabular-nums">
            {formatCurrency(invoice.amount, invoice.currency ?? 'USD')}
          </p>
          {invoice.status === 'overdue' && urgency.days > 0 && (
            <span className="text-xs font-semibold text-red-600">
              {urgency.days} {urgency.days === 1 ? 'day' : 'days'} overdue
            </span>
          )}
        </div>

        {/* Quick action buttons - visible on hover */}
        <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {invoice.hostedInvoiceUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5"
              onClick={() => window.open(invoice.hostedInvoiceUrl!, '_blank', 'noopener')}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View
            </Button>
          )}
          {onSendReminder && (invoice.status === 'sent' || invoice.status === 'overdue') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              disabled={sendingInvoiceId === invoice.id}
              onClick={() => onSendReminder(invoice)}
            >
              <BellRing className={cn('h-4 w-4 mr-1.5', sendingInvoiceId === invoice.id && 'animate-pulse')} />
              {sendingInvoiceId === invoice.id ? 'Sending…' : 'Remind'}
            </Button>
          )}
        </div>
        
        {/* More actions dropdown */}
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
  )
})

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface EmptyStateProps {
  selectedStatus: FinanceInvoiceStatus | 'all'
  onShowAll: () => void
}

function EmptyState({ selectedStatus, onShowAll }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <FileText className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {selectedStatus === 'all' ? 'No invoices yet' : 'No matching invoices'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        {selectedStatus === 'all' 
          ? "You haven't created any invoices yet. Head to the Clients page to send your first invoice."
          : `No invoices with status "${selectedStatus}" found.`}
      </p>
      {selectedStatus !== 'all' && (
        <button
          type="button"
          onClick={onShowAll}
          className="text-sm text-primary hover:underline font-medium"
        >
          View all invoices
        </button>
      )}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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
  embedded?: boolean
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
  embedded,
}: FinanceInvoiceTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const parentRef = useRef<HTMLDivElement>(null)

  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices
    const query = searchQuery.toLowerCase()
    return invoices.filter((invoice) =>
      invoice.clientName?.toLowerCase().includes(query) ||
      invoice.number?.toLowerCase().includes(query) ||
      invoice.id.toLowerCase().includes(query) ||
      invoice.description?.toLowerCase().includes(query)
    )
  }, [invoices, searchQuery])

  const INVOICE_ITEM_HEIGHT = 120

  const getScrollElement = useCallback(() => parentRef.current, [])
  const estimateSize = useCallback(() => INVOICE_ITEM_HEIGHT, [])
  const getItemKey = useCallback(
    (index: number) => filteredInvoices[index]?.id ?? index,
    [filteredInvoices]
  )

  const virtualizer = useVirtualizer({
    count: filteredInvoices.length,
    getScrollElement,
    estimateSize,
    overscan: 5,
    getItemKey,
  })

  const virtualItems = virtualizer.getVirtualItems()

  const handleExport = useCallback(() => {
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
  }, [filteredInvoices])

  const listPaddingX = embedded ? 'px-0' : 'px-6'

  // Header with filters
  const TableHeader = (
    <div className={cn(
      'flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-center sm:justify-between',
      embedded ? 'px-0' : undefined
    )}>
      {!embedded ? (
        <div>
          <CardTitle className="text-xl font-semibold">Recent Invoices</CardTitle>
          <CardDescription className="mt-1">Filter, download, and monitor the latest billing activity.</CardDescription>
        </div>
      ) : (
        <div className="text-sm font-medium text-foreground">Filter invoices</div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={filteredInvoices.length === 0}
          className="hover:bg-muted/50 transition-colors"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 focus-visible:ring-primary"
          />
        </div>
        <Select value={selectedStatus} onValueChange={onSelectStatus}>
          <SelectTrigger className="w-[140px]">
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
    </div>
  )

  // Main content
  const TableBody = (
    <>
      {filteredInvoices.length === 0 ? (
        <EmptyState 
          selectedStatus={selectedStatus} 
          onShowAll={() => onSelectStatus('all')} 
        />
      ) : (
        <div ref={parentRef} className="max-h-[520px] overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const invoice = filteredInvoices[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="border-b border-muted/30"
                >
                  <InvoiceRow
                    invoice={invoice}
                    paddingX={listPaddingX}
                    onSendReminder={onSendReminder}
                    onIssueRefund={onIssueRefund}
                    sendingInvoiceId={sendingInvoiceId}
                    refundingInvoiceId={refundingInvoiceId}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
      {hasMore && (
        <div className={cn('border-t border-muted/30 py-4 text-center bg-muted/5', embedded ? 'px-0' : 'px-6')}>
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
      )}
    </>
  )

  if (embedded) {
    return (
      <div className="space-y-4">
        {TableHeader}
        {TableBody}
      </div>
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
            Export
          </Button>
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:ring-primary"
            />
          </div>
          <Select value={selectedStatus} onValueChange={onSelectStatus}>
            <SelectTrigger className="w-[140px]">
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
        {TableBody}
      </CardContent>
    </Card>
  )
}
