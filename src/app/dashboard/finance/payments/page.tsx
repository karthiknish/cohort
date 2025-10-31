'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Loader2, RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { createBillingPortalSession } from '@/services/finance'
import { formatCurrency } from '@/app/dashboard/finance/utils'
import { useFinanceData } from '@/app/dashboard/finance/hooks/use-finance-data'
import { FinanceInvoiceTable } from '@/app/dashboard/finance/components/finance-invoice-table'
import { FinanceDashboardSkeleton } from '@/app/dashboard/finance/components/finance-dashboard-skeleton'

export default function FinancePaymentsPage() {
  const { toast } = useToast()
  const { selectedClientId, selectedClient } = useClientContext()
  const {
    paymentSummary,
    upcomingPayments,
    filteredInvoices,
    invoiceStatusFilter,
    setInvoiceStatusFilter,
    isLoading,
    hasAttemptedLoad,
    loadError,
    refresh,
  } = useFinanceData()

  const [openingPortal, setOpeningPortal] = useState(false)

  const isInitialLoading = !hasAttemptedLoad && isLoading
  const isRefreshing = hasAttemptedLoad && isLoading

  const handleOpenPortal = useCallback(async () => {
    if (!selectedClientId) {
      toast({
        title: 'Select a workspace',
        description: 'Choose the workspace you want to manage before opening the billing portal.',
        variant: 'destructive',
      })
      return
    }

    try {
      setOpeningPortal(true)
      const { url } = await createBillingPortalSession(selectedClientId)
      window.location.href = url
    } catch (error: unknown) {
      toast({
        title: 'Portal unavailable',
        description: extractErrorMessage(error, 'Unable to open the Stripe billing portal'),
        variant: 'destructive',
      })
    } finally {
      setOpeningPortal(false)
    }
  }, [selectedClientId, toast])

  const outstandingDisplay = formatCurrency(paymentSummary.totalOutstanding)
  const collectedDisplay = formatCurrency(paymentSummary.totalPaid)
  const nextDueDisplay = useMemo(() => {
    if (paymentSummary.nextDueAt) {
      return new Date(paymentSummary.nextDueAt).toLocaleDateString()
    }
    if (upcomingPayments.length > 0 && upcomingPayments[0].dueDate) {
      return new Date(upcomingPayments[0].dueDate).toLocaleDateString()
    }
    return 'No upcoming due dates'
  }, [paymentSummary.nextDueAt, upcomingPayments])

  if (isInitialLoading) {
    return <FinanceDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <Alert variant="destructive">
          <AlertTitle>Payments unavailable</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payments &amp; billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your outstanding invoices and update payment methods directly through the Stripe billing portal.
          </p>
          {selectedClient && (
            <p className="mt-1 text-xs text-muted-foreground">
              Workspace: <span className="font-medium text-foreground">{selectedClient.name}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => void handleOpenPortal()}
            disabled={openingPortal || !selectedClientId}
            className="inline-flex items-center gap-2"
          >
            {openingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Open billing portal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Outstanding balance</CardTitle>
            <CardDescription>Amount currently due across all invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{outstandingDisplay}</p>
            <p className="text-xs text-muted-foreground">{paymentSummary.overdueCount} overdue · {paymentSummary.openCount} open</p>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Total collected</CardTitle>
            <CardDescription>Payments received via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{collectedDisplay}</p>
            <p className="text-xs text-muted-foreground">
              Last payment {paymentSummary.lastPaymentAt ? new Date(paymentSummary.lastPaymentAt).toLocaleDateString() : 'not recorded yet'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Next due date</CardTitle>
            <CardDescription>Keep upcoming invoices top of mind.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{nextDueDisplay}</p>
            <p className="text-xs text-muted-foreground">
              {upcomingPayments.length > 0
                ? `${upcomingPayments.length} invoice${upcomingPayments.length === 1 ? '' : 's'} queued`
                : 'All caught up'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>Upcoming payments</CardTitle>
          <CardDescription>Invoices with an outstanding balance are listed below.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no outstanding invoices right now.</p>
          ) : (
            <ScrollArea className="max-h-60">
              <div className="space-y-3">
                {upcomingPayments.map((invoice) => {
                  const outstanding =
                    typeof invoice.amountRemaining === 'number'
                      ? invoice.amountRemaining
                      : typeof invoice.amountPaid === 'number'
                        ? Math.max(invoice.amount - invoice.amountPaid, 0)
                        : invoice.amount

                  return (
                    <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{invoice.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'TBC'}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(outstanding)}</p>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <FinanceInvoiceTable
        invoices={filteredInvoices}
        selectedStatus={invoiceStatusFilter}
        onSelectStatus={setInvoiceStatusFilter}
      />

      <div className="text-xs text-muted-foreground">
        Need help?{' '}
        <Link href="/contact" className="text-primary underline">
          Contact support
        </Link>{' '}
        for billing questions.
      </div>
    </div>
  )
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return fallback
}
