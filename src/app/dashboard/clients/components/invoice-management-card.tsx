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
} from 'lucide-react'

import { cn, formatCurrency } from '@/lib/utils'
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
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Invoice Status Badge Component
export function InvoiceStatusBadge({ status, isOutstanding }: { status: string; isOutstanding: boolean }) {
  const getVariant = () => {
    if (isOutstanding) return 'destructive'
    if (status === 'paid') return 'secondary'
    return 'outline'
  }

  const getClassName = () => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
    return ''
  }

  return (
    <Badge variant={getVariant()} className={cn('capitalize', getClassName())}>
      {status?.replace('_', ' ') || 'draft'}
    </Badge>
  )
}

// Invoice Status Icon Component
export function InvoiceStatusIcon({ status }: { status: string }) {
  const iconClasses = 'h-8 w-8 rounded-full p-1.5'

  switch (status) {
    case 'paid':
      return (
        <div className={cn(iconClasses, 'bg-emerald-100 text-emerald-600')}>
          <Check className="h-full w-full" />
        </div>
      )
    case 'open':
    case 'sent':
      return (
        <div className={cn(iconClasses, 'bg-blue-100 text-blue-600')}>
          <Send className="h-full w-full" />
        </div>
      )
    case 'overdue':
    case 'uncollectible':
      return (
        <div className={cn(iconClasses, 'bg-red-100 text-red-600')}>
          <TriangleAlert className="h-full w-full" />
        </div>
      )
    default:
      return (
        <div className={cn(iconClasses, 'bg-muted text-muted-foreground')}>
          <FileText className="h-full w-full" />
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
  const isPaid = invoice.status === 'paid'

  return (
    <div className="rounded-lg border border-muted/40 bg-card p-3 transition-all hover:border-muted hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-xs font-medium">
              {invoice.number || invoice.id.slice(0, 8)}
            </span>
            <Badge
              variant={isOutstanding ? 'destructive' : isPaid ? 'secondary' : 'outline'}
              className={cn('text-xs capitalize', isPaid && 'bg-emerald-100 text-emerald-700')}
            >
              {invoice.status}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatCurrency(invoice.amount, invoice.currency)}
            </span>
            {invoice.issuedDate && (
              <span>{formatDate(invoice.issuedDate)}</span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {invoice.hostedInvoiceUrl && (
              <DropdownMenuItem asChild>
                <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </a>
              </DropdownMenuItem>
            )}
            {invoice.hostedInvoiceUrl && (
              <DropdownMenuItem asChild>
                <a href={`${invoice.hostedInvoiceUrl}?download=1`} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </DropdownMenuItem>
            )}
            {isOutstanding && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSendReminder} disabled={sendingReminder}>
                  <BellRing className={cn('mr-2 h-4 w-4', sendingReminder && 'animate-pulse')} />
                  {sendingReminder ? 'Sending...' : 'Remind'}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {invoice.description && (
        <p className="mt-2 truncate text-xs text-muted-foreground">
          {invoice.description}
        </p>
      )}
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
    <Card className="border-muted/60 bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Invoicing</CardTitle>
            <CardDescription>Manage billing and payments</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-muted/50 bg-muted/10 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invoice-amount" className="text-sm font-medium">
                Amount or total
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  placeholder="0.00"
                  value={createInvoiceForm.amount}
                  onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, amount: e.target.value })}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Line items override this number; totals update as you type.
              </p>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="invoice-email" className="text-sm font-medium">
                Billing email <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="invoice-email"
                    type="email"
                    placeholder="billing@company.com"
                    value={createInvoiceForm.email}
                    onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, email: e.target.value })}
                    className="pl-9"
                  />
                </div>
                {suggestedEmail && suggestedEmail !== createInvoiceForm.email && (
                  <Button variant="outline" size="sm" onClick={applySuggestedEmail} className="shrink-0">
                    Use suggested
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                We pre-fill from the client record; adjust if needed.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:w-48">
              <Button
                onClick={onCreateInvoice}
                disabled={createInvoiceLoading || !effectiveAmount || !createInvoiceForm.email.trim()}
                className="gap-2"
              >
                {createInvoiceLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Create & Send
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground"
                onClick={() => {
                  applyProjectDescription()
                  if (!createInvoiceOpen) onCreateInvoiceOpenChange(true)
                }}
              >
                <FileText className="h-4 w-4" />
                Auto-fill details
              </Button>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="rounded-md border border-dashed border-muted/60 bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Details & line items</p>
                <p className="text-xs text-muted-foreground">Optional breakdowns and due dates.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => onCreateInvoiceOpenChange(!createInvoiceOpen)}
              >
                {createInvoiceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {createInvoiceOpen ? 'Hide' : 'Add details'}
              </Button>
            </div>

            {createInvoiceOpen && (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-description" className="text-sm font-medium">
                      Description
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="invoice-description"
                        placeholder="Services rendered for..."
                        maxLength={500}
                        value={createInvoiceForm.description}
                        onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, description: e.target.value })}
                      />
                      <Button variant="outline" size="sm" className="shrink-0" onClick={applyProjectDescription}>
                        Use default
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Short summary appears on the invoice.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-due-date" className="text-sm font-medium">
                      Due date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="invoice-due-date"
                        type="date"
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        value={createInvoiceForm.dueDate}
                        onChange={(e) => onCreateInvoiceFormChange({ ...createInvoiceForm, dueDate: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Leave blank for 14-day default payment terms.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm font-medium">Line items</Label>
                    <Button variant="outline" size="sm" onClick={handleAddLineItem} className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add item
                    </Button>
                  </div>
                  {createInvoiceForm.lineItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add items to break down the invoice. Totals override the simple amount.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {createInvoiceForm.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 rounded-md bg-muted/50 p-2 sm:flex-row sm:items-center"
                        >
                          <Input
                            placeholder="Work description"
                            value={item.label}
                            onChange={(e) => handleLineItemChange(item.id, 'label', e.target.value)}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="number"
                                min="0"
                                max="100000"
                                step="0.01"
                                placeholder="0.00"
                                value={item.amount}
                                onChange={(e) => handleLineItemChange(item.id, 'amount', e.target.value)}
                                className="w-32 pl-9"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveLineItem(item.id)}
                            >
                              <CircleX className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {lineItemsTotal > 0 && (
                    <p className="text-xs font-medium text-foreground">
                      Line items total {formatCurrency(lineItemsTotal, 'usd')}.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 pt-3 md:grid-cols-2">
            <div className="rounded-lg border border-muted/60 bg-background p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {effectiveAmount > 0 ? formatCurrency(effectiveAmount, 'usd') : 'Add amount'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Billing email</span>
                  <span className="truncate font-medium" title={createInvoiceForm.email || 'Add email'}>
                    {createInvoiceForm.email || 'Add email'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due</span>
                  <span className="font-medium">{createInvoiceForm.dueDate ? formatDate(createInvoiceForm.dueDate) : 'Default terms'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Description</span>
                  <p className="text-sm font-medium text-foreground">
                    {createInvoiceForm.description || `Services for ${clientName}`}
                  </p>
                </div>
                {createInvoiceForm.lineItems.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Line items</span>
                    <div className="space-y-1 rounded-md bg-muted/50 p-2 text-xs">
                      {createInvoiceForm.lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <span className="truncate text-foreground">{item.label || 'Untitled item'}</span>
                          <span className="font-medium text-foreground">
                            {item.amount ? formatCurrency(parseFloat(item.amount) || 0, 'usd') : '--'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-muted/60 bg-muted/20 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guidance</p>
              <ul className="mt-2 list-disc space-y-1 px-4 text-muted-foreground">
                <li>Line items take precedence over the single amount.</li>
                <li>Due date defaults to 14 days when left blank.</li>
                <li>We email the invoice immediately via Stripe.</li>
                <li>Use reminders below if payment stays outstanding.</li>
              </ul>
            </div>
          </div>
        </div>

        {invoiceSummary ? (
          <>
            {/* Invoice Status Header */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <InvoiceStatusIcon status={invoiceSummary.status} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Latest Invoice</p>
                  <p className="text-sm font-mono">
                    {invoiceSummary.identifier || 'Pending'}
                  </p>
                </div>
              </div>
              <InvoiceStatusBadge status={invoiceSummary.status} isOutstanding={invoiceSummary.isOutstanding} />
            </div>

            {/* Amount Display */}
            <div className="rounded-lg border border-muted/40 bg-gradient-to-br from-primary/5 to-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {invoiceSummary.amount !== null
                  ? formatCurrency(invoiceSummary.amount, invoiceSummary.currency)
                  : '—'}
              </p>
              {invoiceSummary.isOutstanding && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Payment pending</span>
                </div>
              )}
              {invoiceSummary.isPaid && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  <span>Paid in full</span>
                </div>
              )}
            </div>

            {/* Invoice Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Issued
                </span>
                <span>{formatDate(invoiceSummary.issuedAt)}</span>
              </div>
              {invoiceSummary.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-3.5 w-3.5" />
                    Paid
                  </span>
                  <span className="text-emerald-600">
                    {formatDate(invoiceSummary.paidAt)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {invoiceSummary.url && (
                <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
                  <a href={invoiceSummary.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View Invoice
                  </a>
                </Button>
              )}

              {invoiceSummary.isOutstanding && invoiceSummary.identifier && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={() => onSendReminder()}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <BellRing className="h-4 w-4" />
                      Send Reminder
                    </>
                  )}
                </Button>
              )}

              {invoiceSummary.isPaid && invoiceSummary.identifier && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRefundDialogOpenChange(true)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Issue Refund
                  </Button>

                  <AlertDialog open={refundDialogOpen} onOpenChange={onRefundDialogOpenChange}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Issue Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to issue a full refund for invoice {invoiceSummary.identifier}?
                          This action will refund {invoiceSummary.amount !== null
                            ? formatCurrency(invoiceSummary.amount, invoiceSummary.currency)
                            : 'the full amount'} to the client.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={refundLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={onIssueRefund}
                          disabled={refundLoading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {refundLoading ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm Refund'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>

            {/* Outstanding Warning */}
            {invoiceSummary.isOutstanding && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Payment Outstanding</p>
                  <p className="mt-0.5 text-amber-700">
                    Consider sending a reminder or contacting the client directly.
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Invoice History Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={onToggleInvoiceHistory}
            >
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Invoice History
              </span>
              {showInvoiceHistory ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {/* Invoice History List */}
            {showInvoiceHistory && (
              <div className="space-y-2">
                {invoiceHistoryLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : invoiceHistory.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    No invoice history available
                  </p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {invoiceHistory.map((invoice) => (
                      <InvoiceHistoryItem
                        key={invoice.id}
                        invoice={invoice}
                        onSendReminder={() => onSendReminder(invoice.id)}
                        sendingReminder={sendingReminder}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-muted/60 bg-muted/10 p-6 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">No invoices yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the invoicing form above to send the first invoice for this client.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
