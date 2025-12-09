'use client'

import { useCallback, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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

import { useAuth } from '@/contexts/auth-context'
import type { FinanceInvoice } from '@/types/finance'
import { formatCurrency } from '../utils'
import { BarChart3, FileText, Users, Megaphone, RefreshCw, AlertCircle } from 'lucide-react'

export function FinanceDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client'
  const [activeTab, setActiveTab] = useState('overview')

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
          title: '📊 No data to export',
          description: 'Add some invoices or costs first, then try exporting again.',
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
        title: '📥 Export complete!',
        description: `Downloaded ${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''} and ${costs.length} cost${costs.length !== 1 ? 's' : ''} to CSV.`,
      })
    } catch (error) {
      console.error('Failed to export finance data:', error)
      toast({
        title: '❌ Export failed',
        description: 'Unable to generate CSV file. Please try again.',
        variant: 'destructive',
      })
    }
  }, [filteredInvoices, costs, toast])

  const isInitialLoading = !hasAttemptedLoad && isLoading
  const isRefreshing = hasAttemptedLoad && isLoading

  if (isInitialLoading) {
    return <FinanceDashboardSkeleton />
  }

  // Error state with retry
  if (loadError && !hasAttemptedLoad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Unable to load finance data</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">{loadError}</p>
        <Button onClick={() => void refresh()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Finance data partially unavailable</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{loadError}</span>
            <Button variant="outline" size="sm" onClick={() => void refresh()} className="ml-4 gap-2">
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Invoices
          </TabsTrigger>
          {!isClient && (
            <TabsTrigger value="recurring" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Recurring
            </TabsTrigger>
          )}
          {!isClient && (
            <TabsTrigger value="costs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Costs
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Charts Section - Full Width */}
          <FinanceChartsSection data={chartData} currency={stats.primaryCurrency} />
          
          {/* Revenue Sidebar - Below Charts */}
          <FinanceRevenueSidebar
            revenue={revenueByClient}
            upcomingPayments={upcomingPayments}
            totalOutstanding={stats.totalOutstanding}
            currencyTotals={stats.currencyTotals}
            primaryCurrency={stats.primaryCurrency}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4 mt-0">
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

        {!isClient && (
          <TabsContent value="recurring" className="space-y-4 mt-0">
            <RecurringInvoicesCard />
          </TabsContent>
        )}

        {!isClient && (
          <TabsContent value="costs" className="space-y-4 mt-0">
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
        )}
      </Tabs>

    </div>
  )
}
