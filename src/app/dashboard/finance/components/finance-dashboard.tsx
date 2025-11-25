'use client'

import { useCallback } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useToast } from '@/components/ui/use-toast'

import { useFinanceData } from '../hooks/use-finance-data'
import { FinanceHeader } from './finance-header'
import { FinanceStatsGrid } from './finance-stats-grid'
import { FinanceCostsCard } from './finance-costs-card'
import { FinanceChartsSection } from './finance-charts-section'
import { FinanceInvoiceTable } from './finance-invoice-table'
import { FinanceRevenueSidebar } from './finance-revenue-sidebar'
import { FinanceDashboardSkeleton } from './finance-dashboard-skeleton'
import { RecurringInvoicesCard } from './recurring-invoices-card'
import { RelatedPages } from '@/components/dashboard/related-pages'
import { useAuth } from '@/contexts/auth-context'
import type { FinanceInvoice } from '@/types/finance'
import { formatCurrency } from '../utils'
import { BarChart3, FileText, Users, Megaphone } from 'lucide-react'

export function FinanceDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
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

  const handleExportData = useCallback(() => {
    try {
      // Validate data exists before export
      if (!filteredInvoices || !costs) {
        toast({
          title: 'Export failed',
          description: 'No data available for export',
          variant: 'destructive',
        })
        return
      }

      // Create CSV content for invoices
      const csvHeaders = ['Invoice ID', 'Client', 'Amount', 'Status', 'Issue Date', 'Due Date', 'Paid Date', 'Currency']
      const csvRows = filteredInvoices.map(invoice => [
        invoice.id || '',
        invoice.clientName || 'Unknown',
        invoice.amount?.toString() || '0',
        invoice.status || 'unknown',
        invoice.issuedDate || '',
        invoice.dueDate || '',
        invoice.paidDate || '',
        invoice.currency || 'USD'
      ])

      // Add costs section
      csvRows.push(['', '', '', '', '', '', '', ''])
      csvRows.push(['COSTS', '', '', '', '', '', '', ''])
      csvRows.push(['Cost ID', 'Category', 'Amount', 'Cadence', 'Currency', '', '', ''])
      costs.forEach(cost => {
        csvRows.push([
          cost.id || '',
          cost.category || 'Unknown',
          cost.amount?.toString() || '0',
          cost.cadence || 'monthly',
          cost.currency || 'USD',
          '', '', ''
        ])
      })

      // Convert to CSV string
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `finance-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url) // Clean up

      // Success feedback
      toast({
        title: 'Export successful',
        description: `Downloaded ${filteredInvoices.length} invoices and ${costs.length} costs`,
      })
    } catch (error) {
      console.error('Failed to export finance data:', error)
      toast({
        title: 'Export failed',
        description: 'Unable to generate CSV file',
        variant: 'destructive',
      })
    }
  }, [filteredInvoices, costs, toast])

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
        onExportData={handleExportData}
      />
      <FinanceStatsGrid stats={stats} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <FinanceChartsSection data={chartData} currency={stats.primaryCurrency} />
            </div>
            <div className="col-span-3">
              <FinanceRevenueSidebar
                revenue={revenueByClient}
                upcomingPayments={upcomingPayments}
                totalOutstanding={stats.totalOutstanding}
                currencyTotals={stats.currencyTotals}
                primaryCurrency={stats.primaryCurrency}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <RecurringInvoicesCard />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
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
        </TabsContent>
      </Tabs>

      <RelatedPages
        title="Related features"
        description="Navigate to features that work together with Finance."
        pages={[
          { name: 'Analytics', href: '/dashboard/analytics', description: 'Ad spend & performance', icon: BarChart3 },
          { name: 'Proposals', href: '/dashboard/proposals', description: 'Create client proposals', icon: FileText },
          { name: 'Clients', href: '/dashboard/clients', description: 'Manage workspaces', icon: Users },
          { name: 'Ads', href: '/dashboard/ads', description: 'Ad platform integrations', icon: Megaphone },
        ]}
      />
    </div>
  )
}
