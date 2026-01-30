'use client'

import { useCallback, useEffect, useMemo } from 'react'
import type { ElementType } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { useToast } from '@/components/ui/use-toast'

import { useFinanceData } from '../hooks/use-finance-data'
import { FinanceHeader } from './finance-header'
import { FinanceStatsGrid } from './finance-stats-grid'
import { FinanceCostsCard } from './finance-costs-card'
import { FinanceExpensesCard } from './finance-expenses-card'
import { FinanceExpenseReportCard } from './finance-expense-report-card'
import { FinancePurchaseOrdersCard } from './finance-purchase-orders-card'
import { FinanceChartsSection } from './finance-charts-section'
import { FinanceForecastCard } from './finance-forecast-card'
import { FinanceInvoiceTable } from './finance-invoice-table'
import { FinanceRevenueSidebar } from './finance-revenue-sidebar'
import { FinanceDashboardSkeleton } from './finance-dashboard-skeleton'
import { RecurringInvoicesCard } from './recurring-invoices-card'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { FinanceInvoice } from '@/types/finance'
import { formatCurrency } from '../utils'
import {
  BarChart3,
  RefreshCw,
  CircleAlert,
  FileText,
  Repeat,
  Receipt,
  Wallet,
  ClipboardList,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePersistedTab } from '@/hooks/use-persisted-tab'

// Section header component for consistency
function SectionHeader({
  icon: Icon,
  title,
  description,
  count
}: {
  icon: ElementType
  title: string
  description?: string
  count?: number
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        "bg-muted text-muted-foreground group-data-[state=open]:bg-primary/10 group-data-[state=open]:text-primary"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {typeof count === 'number' && count > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      <ChevronDown className={cn(
        "h-4 w-4 text-muted-foreground transition-transform duration-200",
        "group-data-[state=open]:rotate-180"
      )} />
    </div>
  )
}

export function FinanceDashboard() {
  const { user } = useAuth()
  const { selectedClientId, selectedClient } = useClientContext()
  const { toast } = useToast()
  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client'

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
    forecast,
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
      if (!filteredInvoices || !costs) {
        toast({
          title: 'No data to export',
          description: 'Add some invoices or costs first, then try exporting again.',
          variant: 'destructive',
        })
        return
      }

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

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `finance-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export complete!',
        description: `Downloaded ${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''} and ${costs.length} cost${costs.length !== 1 ? 's' : ''} to CSV.`,
      })
    } catch (error) {
      console.error('Failed to export finance data:', error)
      toast({
        title: 'Export failed',
        description: 'Unable to generate CSV file. Please try again.',
        variant: 'destructive',
      })
    }
  }, [filteredInvoices, costs, toast])

  const isInitialLoading = !hasAttemptedLoad && isLoading
  const isRefreshing = hasAttemptedLoad && isLoading

  const isEmptyState = useMemo(() => {
    const hasInvoices = filteredInvoices.length > 0
    const hasCosts = costs.length > 0
    const hasChart = chartData.length > 0
    return !isLoading && !loadError && !hasInvoices && !hasCosts && !hasChart
  }, [chartData.length, costs.length, filteredInvoices.length, isLoading, loadError])

  const scopeLabel = selectedClient?.name ?? (selectedClientId ? 'Selected workspace' : 'All workspaces')
  const scopeHelper = selectedClient ? 'Scoped to the selected workspace' : 'Showing totals across workspaces'

  const sections = useMemo(() => {
    const base = [
      { value: 'overview', label: 'Overview', targetId: 'finance-overview' },
      { value: 'invoices', label: 'Invoices', targetId: 'finance-invoices' },
    ]

    if (!isClient) {
      base.push({ value: 'recurring', label: 'Recurring', targetId: 'finance-recurring' })
      base.push({ value: 'costs', label: 'Costs', targetId: 'finance-costs' })
      base.push({ value: 'expenses', label: 'Expenses', targetId: 'finance-expenses' })
      base.push({ value: 'pos', label: 'POs', targetId: 'finance-purchase-orders' })
      if (isAdmin) {
        base.push({ value: 'reports', label: 'Reports', targetId: 'finance-expense-reports' })
      }
    }

    return base
  }, [isAdmin, isClient])

  // Memoize section values to prevent infinite re-renders (React error #301)
  const sectionValues = useMemo(() => sections.map((s) => s.value), [sections])

  const sectionTabs = usePersistedTab<string>({
    param: 'section',
    defaultValue: sections[0]?.value ?? 'overview',
    allowedValues: sectionValues,
    storageNamespace: 'dashboard:finance',
    syncToUrl: true,
  })

  const activeSection = sectionTabs.value
  const setActiveSection = sectionTabs.setValue

  // Reset activeSection if it's no longer in the available sections
  useEffect(() => {
    if (activeSection && !sections.some((s) => s.value === activeSection)) {
      setActiveSection(sections[0]?.value ?? 'overview')
    }
  }, [activeSection, sections, setActiveSection])

  const handleJumpTo = useCallback(
    (value: string) => {
      setActiveSection(value)
      const section = sections.find((s) => s.value === value)
      if (!section) return
      const el = document.getElementById(section.targetId)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [sections, setActiveSection]
  )

  if (isInitialLoading) {
    return <FinanceDashboardSkeleton />
  }

  // Error state with retry (no data loaded)
  if (loadError && hasAttemptedLoad && filteredInvoices.length === 0 && costs.length === 0 && chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <CircleAlert className="h-8 w-8 text-destructive" />
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
          <CircleAlert className="h-4 w-4" />
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
        scopeLabel={scopeLabel}
        scopeHelper={scopeHelper}
        paymentsHref="/dashboard/finance/payments"
        manageInvoicesHref={!isClient ? '/dashboard/clients' : undefined}
        onExportData={handleExportData}
      />

      <FinanceStatsGrid stats={stats} />

      {/* Sticky jump navigation (reduces long-scroll cognitive load) */}
      {sections.some((s) => s.value === activeSection) && (
        <div className="sticky top-0 z-20 -mx-6 border-b border-muted/40 bg-background/75 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-muted-foreground">Jump to</div>
            <Tabs value={activeSection} onValueChange={handleJumpTo}>
              <TabsList className="w-full justify-start sm:w-auto">
                {sections.map((s) => (
                  <TabsTrigger key={s.value} value={s.value}>
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmptyState && (
        <Alert className="border-muted/60 bg-muted/20">
          <BarChart3 className="h-4 w-4" />
          <AlertTitle>Get started with Finance</AlertTitle>
          <AlertDescription>
            Add your first invoice or cost to unlock revenue, expense, and profit charts.
            {!isClient ? (
              <span className="block mt-2 text-xs text-muted-foreground">
                Tip: Add costs below to capture overhead, and use the <span className="font-medium text-foreground">Manage invoices</span> button to send invoices.
              </span>
            ) : (
              <span className="block mt-2 text-xs text-muted-foreground">
                Tip: Once invoices are issued and paid, they’ll appear here automatically.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Section - Charts & Revenue Sidebar */}
      <section
        id="finance-overview"
        className="grid scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)] xl:items-start"
      >
        <div className="space-y-6">
          <FinanceChartsSection data={chartData} currency={stats.primaryCurrency} />
          {forecast && forecast.length > 0 && (
            <FinanceForecastCard data={forecast} currency={stats.primaryCurrency} />
          )}
        </div>
        <div className="xl:sticky xl:top-6">
          <FinanceRevenueSidebar
            revenue={revenueByClient}
            upcomingPayments={upcomingPayments}
            totalOutstanding={stats.totalOutstanding}
            currencyTotals={stats.currencyTotals}
            primaryCurrency={stats.primaryCurrency}
          />
        </div>
      </section>

      {/* Invoices Section */}
      <section id="finance-invoices" className="scroll-mt-24">
      <Collapsible defaultOpen>
        <Card className="overflow-hidden">
          <CollapsibleTrigger className="group w-full text-left">
            <CardHeader className="cursor-pointer py-4 transition-colors hover:bg-muted/30 group-data-[state=open]:bg-muted/20">
              <SectionHeader
                icon={FileText}
                title="Invoices"
                description="Track sent and paid invoices"
                count={filteredInvoices.length}
              />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
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
                embedded
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      </section>

      {/* Recurring Invoices - Admin/Team only */}
      {!isClient && (
        <section id="finance-recurring" className="scroll-mt-24">
        <Collapsible defaultOpen={false}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger className="group w-full text-left">
              <CardHeader className="cursor-pointer py-4 transition-colors hover:bg-muted/30 group-data-[state=open]:bg-muted/20">
                <SectionHeader
                  icon={Repeat}
                  title="Recurring Invoices"
                  description="Automated billing schedules"
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <RecurringInvoicesCard />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        </section>
      )}

      {/* Costs & Expenses Grid - Admin/Team only */}
      {!isClient && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Costs Section */}
          <section id="finance-costs" className="scroll-mt-24">
          <Collapsible defaultOpen>
            <Card className="overflow-hidden h-fit">
              <CollapsibleTrigger className="group w-full text-left">
                <CardHeader className="cursor-pointer py-4 transition-colors hover:bg-muted/30 group-data-[state=open]:bg-muted/20">
                  <SectionHeader
                    icon={Receipt}
                    title="Company Costs"
                    description={`${formatCurrency(monthlyCostTotal, stats.primaryCurrency)}/mo`}
                    count={costs.length}
                  />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
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
                    embedded
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          </section>

          {/* Expenses Section */}
          <section id="finance-expenses" className="scroll-mt-24">
          <Collapsible defaultOpen>
            <Card className="overflow-hidden h-fit">
              <CollapsibleTrigger className="group w-full text-left">
                <CardHeader className="cursor-pointer py-4 transition-colors hover:bg-muted/30 group-data-[state=open]:bg-muted/20">
                  <SectionHeader
                    icon={Wallet}
                    title="Expenses"
                    description="Track reimbursable expenses"
                  />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <FinanceExpensesCard currency={stats.primaryCurrency} embedded />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          </section>
        </div>
      )}

      {/* Purchase Orders - Admin/Team only */}
      {!isClient && (
        <section id="finance-purchase-orders" className="scroll-mt-24">
        <Collapsible defaultOpen={false}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger className="group w-full text-left">
              <CardHeader className="cursor-pointer py-4 transition-colors hover:bg-muted/30 group-data-[state=open]:bg-muted/20">
                <SectionHeader
                  icon={ClipboardList}
                  title="Purchase Orders"
                  description="Manage vendor purchase orders"
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <FinancePurchaseOrdersCard currency={stats.primaryCurrency} embedded />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        </section>
      )}

      {/* Expense Reports - Admin only */}
      {!isClient && isAdmin && (
        <section id="finance-expense-reports" className="scroll-mt-24">
        <Collapsible defaultOpen={false}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger className="group w-full text-left">
              <CardHeader className="cursor-pointer py-4 transition-colors hover:bg-muted/30 group-data-[state=open]:bg-muted/20">
                <SectionHeader
                  icon={FileSpreadsheet}
                  title="Expense Reports"
                  description="Review and approve team expense reports"
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <FinanceExpenseReportCard currency={stats.primaryCurrency} embedded />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        </section>
      )}
    </div>
  )
}
