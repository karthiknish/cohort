'use client'

import { useMemo } from 'react'
import {
  TriangleAlert,
  BellRing,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  History,
  LoaderCircle,
  Mail,
  MoreHorizontal,
  Plus,
  Receipt,
  RotateCcw,
  Send,
  CircleX,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { cn, formatCurrency } from '@/lib/utils'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar'

// Types
export interface InvoiceData {
  id: string
  number: string | null
  status: string
  amount: number
  currency: string
  issuedDate: string | null
  dueDate: string | null
  paidDate: string | null
  hostedInvoiceUrl: string | null
  description: string | null
  clientName: string
  amountPaid?: number | null
  amountRefunded?: number | null
  amountRemaining?: number | null
}

export interface CreateInvoiceForm {
  amount: string
  email: string
  description: string
  dueDate: string
  lineItems: { id: string; label: string; amount: string }[]
}

export interface InvoiceSummary {
  status: string
  isOutstanding: boolean
  isPaid: boolean
  amount: number | null
  currency: string
  issuedAt: string | null
  paidAt: string | null
  identifier: string | null
  url: string | null
}

interface InvoiceManagementCardProps {
  clientName: string
  invoiceSummary: InvoiceSummary | null
  invoiceHistory: InvoiceData[]
  invoiceHistoryLoading: boolean
  showInvoiceHistory: boolean
  createInvoiceOpen: boolean
  createInvoiceLoading: boolean
  createInvoiceForm: CreateInvoiceForm
  sendingReminder: boolean
  refundDialogOpen: boolean
  refundLoading: boolean
  suggestedEmail?: string | null
  onCreateInvoiceOpenChange: (open: boolean) => void
  onCreateInvoiceFormChange: (form: CreateInvoiceForm) => void
  onCreateInvoice: () => void
  onSendReminder: (invoiceId?: string) => void
  onRefundDialogOpenChange: (open: boolean) => void
  onIssueRefund: () => void
  onToggleInvoiceHistory: () => void
}

// Utility function
function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.SHORT, undefined, '—')
}

// Invoice Status Badge Component
export function InvoiceStatusBadge({ status, isOutstanding }: { status: string; isOutstanding: boolean }) {
  const isPaid = status === 'paid'

  return (
    <Badge
      variant={isOutstanding ? 'destructive' : 'secondary'}
      className={cn(
        'h-5 px-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-full border-none shadow-sm',
        isPaid ? 'bg-emerald-500/10 text-emerald-600' :
          isOutstanding ? 'bg-red-500/10 text-red-600 animate-pulse' :
            'bg-muted/30 text-muted-foreground/60'
      )}
    >
      {status?.replace('_', ' ') || 'draft'}
    </Badge>
  )
}

// Invoice Status Icon Component
export function InvoiceStatusIcon({ status }: { status: string }) {
  const iconClasses = 'h-9 w-9 rounded-xl flex items-center justify-center shadow-sm border border-black/5'

  switch (status) {
    case 'paid':
      return (
        <div className={cn(iconClasses, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')}>
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
      )
    case 'open':
    case 'sent':
      return (
        <div className={cn(iconClasses, 'bg-blue-500/10 text-blue-600 border-blue-500/20')}>
          <Send className="h-4 w-4" strokeWidth={2.5} />
        </div>
      )
    case 'overdue':
    case 'uncollectible':
      return (
        <div className={cn(iconClasses, 'bg-red-500/10 text-red-600 border-red-500/20')}>
          <TriangleAlert className="h-5 w-5" strokeWidth={2.5} />
        </div>
      )
    default:
      return (
        <div className={cn(iconClasses, 'bg-muted/20 text-muted-foreground/30 border-muted/10')}>
          <FileText className="h-5 w-5" />
        </div>
      )
  }
}

// Invoice History Item Component
export function InvoiceHistoryItem({
  invoice,
  onSendReminder,
  sendingReminder,
}: {
  invoice: InvoiceData
  onSendReminder: () => void
  sendingReminder: boolean
}) {
  const isOutstanding = invoice.status === 'open' || invoice.status === 'overdue' || invoice.status === 'uncollectible'

  return (
    <div className="group rounded-xl border border-muted/20 bg-muted/2 p-4 transition-all hover:bg-muted/5 hover:border-muted/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
              {invoice.number || `#${invoice.id.slice(0, 8)}`}
            </span>
            <InvoiceStatusBadge status={invoice.status} isOutstanding={isOutstanding} />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-sm font-black text-foreground">
              {formatCurrency(invoice.amount, invoice.currency)}
            </span>
            {invoice.issuedDate && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {formatDate(invoice.issuedDate)}
              </span>
            )}
          </div>
          {invoice.description && (
            <p className="mt-2 truncate text-[10px] font-medium text-muted-foreground/50 leading-tight">
              {invoice.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-40 transition-opacity hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-muted/30 shadow-xl backdrop-blur-md">
            {invoice.hostedInvoiceUrl && (
              <DropdownMenuItem asChild className="rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-3 h-4 w-4 opacity-60" />
                  View Invoice
                </a>
              </DropdownMenuItem>
            )}
            {invoice.hostedInvoiceUrl && (
              <DropdownMenuItem asChild className="rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <a href={`${invoice.hostedInvoiceUrl}?download=1`} target="_blank" rel="noreferrer">
                  <Download className="mr-3 h-4 w-4 opacity-60" />
                  Download PDF
                </a>
              </DropdownMenuItem>
            )}
            {isOutstanding && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSendReminder}
                  disabled={sendingReminder}
                  className="rounded-lg text-[11px] font-bold uppercase tracking-wider text-primary focus:text-primary focus:bg-primary/5"
                >
                  <BellRing className={cn('mr-3 h-4 w-4', sendingReminder && 'animate-pulse')} />
                  {sendingReminder ? 'Sending...' : 'Send Reminder'}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Main Invoice Management Card
export function InvoiceManagementCard({
  clientName,
  invoiceSummary,
  invoiceHistory,
  invoiceHistoryLoading,
  showInvoiceHistory,
  createInvoiceOpen,
  createInvoiceLoading,
  createInvoiceForm,
  sendingReminder,
  refundDialogOpen,
  refundLoading,
  suggestedEmail,
  onCreateInvoiceOpenChange,
  onCreateInvoiceFormChange,
  onCreateInvoice,
  onSendReminder,
  onRefundDialogOpenChange,
  onIssueRefund,
  onToggleInvoiceHistory,
}: InvoiceManagementCardProps) {
  const lineItemsTotal = useMemo(() => {
    return createInvoiceForm.lineItems.reduce((sum, item) => {
      const value = parseFloat(item.amount)
      return Number.isFinite(value) ? sum + value : sum
    }, 0)
  }, [createInvoiceForm.lineItems])

  const effectiveAmount = lineItemsTotal > 0 ? lineItemsTotal : parseFloat(createInvoiceForm.amount) || 0

  const handleLineItemChange = (id: string, field: 'label' | 'amount', value: string) => {
    onCreateInvoiceFormChange({
      ...createInvoiceForm,
      lineItems: createInvoiceForm.lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  const handleAddLineItem = () => {
    onCreateInvoiceFormChange({
      ...createInvoiceForm,
      lineItems: [...createInvoiceForm.lineItems, { id: `item-${Date.now()}-${createInvoiceForm.lineItems.length}`, label: '', amount: '' }],
    })
  }

  const handleRemoveLineItem = (id: string) => {
    onCreateInvoiceFormChange({
      ...createInvoiceForm,
      lineItems: createInvoiceForm.lineItems.filter((item) => item.id !== id),
    })
  }

  const applySuggestedEmail = () => {
    if (!suggestedEmail) return
    onCreateInvoiceFormChange({ ...createInvoiceForm, email: suggestedEmail })
  }

  const applyProjectDescription = () => {
    if (createInvoiceForm.description.trim().length > 0) return
    onCreateInvoiceFormChange({ ...createInvoiceForm, description: `Services for ${clientName}` })
  }

  return (
    <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
      <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Financial Management</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Billing and revenue tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="rounded-2xl border border-muted/20 bg-muted/5 p-5 shadow-sm space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2.5">
              <Label htmlFor="invoice-amount" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                Amount Secured
              </Label>
              <div className="relative group">
                <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <Input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  placeholder="0.00"
                  value={createInvoiceForm.amount}
                  onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, amount: e.target.value })}
                  className="h-10 rounded-xl border-muted/30 bg-background pl-10 pr-4 text-sm font-bold shadow-sm transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="invoice-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  Billing Recipient
                </Label>
                {suggestedEmail && suggestedEmail !== createInvoiceForm.email && (
                  <button onClick={applySuggestedEmail} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                    Use Global
                  </button>
                )}
              </div>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <Input
                  id="invoice-email"
                  type="email"
                  placeholder="billing@company.com"
                  value={createInvoiceForm.email}
                  onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, email: e.target.value })}
                  className="h-10 rounded-xl border-muted/30 bg-background pl-10 pr-4 text-sm font-bold shadow-sm transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={onCreateInvoice}
              disabled={createInvoiceLoading || !effectiveAmount || !createInvoiceForm.email.trim()}
              className="h-10 flex-1 rounded-xl bg-primary text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px] active:scale-[0.98]"
            >
              {createInvoiceLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Initialize Invoicing
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-muted/30 bg-background px-4 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 active:scale-[0.98]"
              onClick={() => {
                applyProjectDescription()
                if (!createInvoiceOpen) onCreateInvoiceOpenChange(true)
              }}
            >
              <FileText className="mr-2 h-4 w-4 opacity-40" />
              Auto-fill
            </Button>
          </div>

          <div className="rounded-xl border border-dashed border-muted/30 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Advanced Parameters</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Line items and custom terms</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-foreground"
                onClick={() => onCreateInvoiceOpenChange(!createInvoiceOpen)}
              >
                {createInvoiceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {createInvoiceOpen && (
              <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Work Description</Label>
                    <Input
                      placeholder="Services rendered for..."
                      maxLength={500}
                      value={createInvoiceForm.description}
                      onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, description: e.target.value })}
                      className="h-9 rounded-xl border-muted/30 bg-background px-3 text-xs font-medium focus:border-primary/40 focus:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Payment Maturity</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-9 w-full justify-start rounded-xl border-muted/30 bg-background px-3 text-left text-xs font-medium focus:ring-0',
                            !createInvoiceForm.dueDate && 'text-muted-foreground/40'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-40" />
                          {createInvoiceForm.dueDate ? (
                            format(parseISO(createInvoiceForm.dueDate), 'PPP')
                          ) : (
                            <span>Target Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-muted/30 shadow-2xl overflow-hidden" align="start">
                        <ShadcnCalendar
                          mode="single"
                          selected={createInvoiceForm.dueDate ? parseISO(createInvoiceForm.dueDate) : undefined}
                          onSelect={(date: Date | undefined) =>
                            onCreateInvoiceFormChange({
                              ...createInvoiceForm,
                              dueDate: date ? format(date, 'yyyy-MM-dd') : '',
                            })
                          }
                          className="p-3"
                          disabled={(date: Date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Itemization</Label>
                    <button onClick={handleAddLineItem} className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>

                  {createInvoiceForm.lineItems.length === 0 ? (
                    <div className="py-2 px-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">No line items specified</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {createInvoiceForm.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 rounded-xl bg-muted/10 p-2"
                        >
                          <Input
                            placeholder="Deliverable description"
                            value={item.label}
                            onChange={(e) => handleLineItemChange(item.id, 'label', e.target.value)}
                            className="h-8 flex-1 rounded-lg border-muted/20 bg-background px-2.5 text-xs font-medium focus:ring-0"
                          />
                          <div className="relative w-28">
                            <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/40" />
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.amount}
                              onChange={(e) => handleLineItemChange(item.id, 'amount', e.target.value)}
                              className="h-8 rounded-lg border-muted/20 bg-background pl-6 pr-2 text-xs font-bold focus:ring-0"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground/20 hover:text-destructive active:scale-[0.98]"
                            onClick={() => handleRemoveLineItem(item.id)}
                          >
                            <CircleX className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {invoiceSummary ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-muted/20 bg-muted/5 p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <InvoiceStatusIcon status={invoiceSummary.status} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Active Statement</p>
                  <p className="text-sm font-black text-foreground">{invoiceSummary.identifier || 'Processing...'}</p>
                </div>
              </div>
              <InvoiceStatusBadge status={invoiceSummary.status} isOutstanding={invoiceSummary.isOutstanding} />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-muted/20 bg-background p-5 shadow-sm">
              <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Contract Value</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-foreground">
                {invoiceSummary.amount !== null
                  ? formatCurrency(invoiceSummary.amount, invoiceSummary.currency)
                  : '—'}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-muted/10 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  <Calendar className="h-3 w-3" />
                  Issued: <span className="text-foreground/60">{formatDate(invoiceSummary.issuedAt)}</span>
                </div>
                {invoiceSummary.paidAt && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <Check className="h-3 w-3" />
                    Settled
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {invoiceSummary.url && (
                <Button asChild variant="outline" className="h-10 rounded-xl border-muted/30 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  <a href={invoiceSummary.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-3.5 w-3.5 opacity-40" />
                    Portal View
                  </a>
                </Button>
              )}
              {invoiceSummary.isOutstanding && invoiceSummary.identifier && (
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-orange-500/20 bg-orange-500/[0.03] text-orange-600 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-orange-500/10"
                  onClick={() => onSendReminder()}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="mr-2 h-3.5 w-3.5" />}
                  {sendingReminder ? 'Notifying...' : 'Push Reminder'}
                </Button>
              )}
              {invoiceSummary.isPaid && invoiceSummary.identifier && (
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-red-500/20 bg-red-500/[0.03] text-red-600 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-red-500/10"
                  onClick={() => onRefundDialogOpenChange(true)}
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Issue Refund
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full flex items-center justify-between h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground hover:bg-muted/5"
              onClick={onToggleInvoiceHistory}
            >
              <span className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 opacity-40" />
                Statement History
              </span>
              {showInvoiceHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>

            {showInvoiceHistory && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {invoiceHistoryLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                  </div>
                ) : invoiceHistory.length === 0 ? (
                  <p className="text-center py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 border border-dashed border-muted/30 rounded-xl">No historical records</p>
                ) : (
                  invoiceHistory.map((invoice) => (
                    <InvoiceHistoryItem
                      key={invoice.id}
                      invoice={invoice}
                      onSendReminder={() => onSendReminder(invoice.id)}
                      sendingReminder={sendingReminder}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>

      <AlertDialog open={refundDialogOpen} onOpenChange={onRefundDialogOpenChange}>
        <AlertDialogContent className="rounded-2xl border-muted/30 shadow-2xl overflow-hidden">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight">Authorization Required</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed">
              Initiating full capital reversal for invoice <span className="font-bold text-foreground">{invoiceSummary?.identifier}</span>. This procedure is irreversible once authorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={refundLoading} className="rounded-xl border-muted/30 text-[10px] font-bold uppercase tracking-widest">Abort Transaction</AlertDialogCancel>
            <AlertDialogAction
              onClick={onIssueRefund}
              disabled={refundLoading}
              className="rounded-xl bg-red-600 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.98]"
            >
              {refundLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-white" /> : 'Confirm Reversal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
