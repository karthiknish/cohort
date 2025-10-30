'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useFinanceData } from '../hooks/use-finance-data'
import { FinanceHeader } from './finance-header'
import { FinanceStatsGrid } from './finance-stats-grid'
import { FinanceCostsCard } from './finance-costs-card'
import { FinanceChartsSection } from './finance-charts-section'
import { FinanceInvoiceTable } from './finance-invoice-table'
import { FinanceRevenueSidebar } from './finance-revenue-sidebar'
import { FinanceDashboardSkeleton } from './finance-dashboard-skeleton'

export function FinanceDashboard() {
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
  } = useFinanceData()

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
      />
      <FinanceChartsSection data={chartData} />
      <FinanceInvoiceTable
        invoices={filteredInvoices}
        selectedStatus={invoiceStatusFilter}
        onSelectStatus={setInvoiceStatusFilter}
      />
      <FinanceRevenueSidebar
        revenue={revenueByClient}
        upcomingPayments={upcomingPayments}
        totalOutstanding={stats.totalOutstanding}
      />
    </div>
  )
}
