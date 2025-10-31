'use client'

import { useCallback } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useFinanceData } from '../hooks/use-finance-data'
import { FinanceHeader } from './finance-header'
import { FinanceStatsGrid } from './finance-stats-grid'
import { FinanceCostsCard } from './finance-costs-card'
import { FinanceChartsSection } from './finance-charts-section'
import { FinanceInvoiceTable } from './finance-invoice-table'
import { FinanceRevenueSidebar } from './finance-revenue-sidebar'
import { FinanceDashboardSkeleton } from './finance-dashboard-skeleton'
import { useAuth } from '@/contexts/auth-context'
import type { FinanceInvoice } from '@/types/finance'
import { formatCurrency } from '../utils'

export function FinanceDashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const {
    selectedPeriod,
    setSelectedPeriod,
    invoiceStatusFilter,
    setInvoiceStatusFilter,
    stats,
    costs,
    chartData,
    filteredInvoices,
    upcomingPayments,
    monthlyCostTotal,
    handleAddCost,
    handleRemoveCost,
    newCost,
    setNewCost,
    removingCostId,
    isLoading,
    hasAttemptedLoad,
    isSubmittingCost,
    refresh,
    loadError,
    revenueByClient,
    sendingInvoiceId,
    refundingInvoiceId,
    sendInvoiceReminder,
    issueInvoiceRefund,
    hasMoreInvoices,
    hasMoreCosts,
    loadMoreInvoices,
    loadMoreCosts,
    loadingMoreInvoices,
    loadingMoreCosts,
  } = useFinanceData()

  const handleSendReminder = useCallback(
    (invoice: FinanceInvoice) => {
      void sendInvoiceReminder(invoice.id)
    },
    [sendInvoiceReminder]
  )

  const handleIssueRefund = useCallback(
    (invoice: FinanceInvoice) => {
      const availableRefund = typeof invoice.amountPaid === 'number'
        ? invoice.amountPaid - (invoice.amountRefunded ?? 0)
        : invoice.amount

      if (availableRefund <= 0) {
        return
      }

      const confirmation = window.confirm(
        `Issue a refund of ${formatCurrency(Math.max(availableRefund, 0), invoice.currency ?? stats.primaryCurrency)} for invoice ${invoice.number ?? invoice.id}?`
      )

      if (!confirmation) {
        return
      }

      void issueInvoiceRefund(invoice.id)
    },
    [issueInvoiceRefund, stats.primaryCurrency]
  )

  const isInitialLoading = !hasAttemptedLoad && isLoading
  const isRefreshing = hasAttemptedLoad && isLoading

  if (isInitialLoading) {
    return <FinanceDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <Alert variant="destructive">
          <AlertTitle>Finance data unavailable</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      <FinanceHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        onRefresh={refresh}
        refreshing={isRefreshing}
        paymentsHref="/dashboard/finance/payments"
      />
      <FinanceStatsGrid stats={stats} />
      <FinanceCostsCard
        costs={costs}
        monthlyCostTotal={monthlyCostTotal}
        newCost={newCost}
        onChangeNewCost={setNewCost}
        onAddCost={handleAddCost}
        onRemoveCost={handleRemoveCost}
        submitting={isSubmittingCost}
        removingCostId={removingCostId}
        onLoadMore={loadMoreCosts}
        hasMore={hasMoreCosts}
        loadingMore={loadingMoreCosts}
        currency={stats.primaryCurrency}
      />
      <FinanceChartsSection data={chartData} currency={stats.primaryCurrency} />
      <FinanceInvoiceTable
        invoices={filteredInvoices}
        selectedStatus={invoiceStatusFilter}
        onSelectStatus={setInvoiceStatusFilter}
        onSendReminder={isAdmin ? handleSendReminder : undefined}
        onIssueRefund={isAdmin ? handleIssueRefund : undefined}
        sendingInvoiceId={sendingInvoiceId}
        refundingInvoiceId={refundingInvoiceId}
        onLoadMore={loadMoreInvoices}
        hasMore={hasMoreInvoices}
        loadingMore={loadingMoreInvoices}
      />
      <FinanceRevenueSidebar
        revenue={revenueByClient}
        upcomingPayments={upcomingPayments}
        totalOutstanding={stats.totalOutstanding}
        currencyTotals={stats.currencyTotals}
        primaryCurrency={stats.primaryCurrency}
      />
    </div>
  )
}
