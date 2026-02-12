'use client'

import Link from 'next/link'

import { CreditCard, Plus, RefreshCw, Download, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

const PERIOD_OPTIONS = [
  { value: '1m', label: 'Last month' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
]

interface FinanceHeaderProps {
  selectedPeriod: string
  onSelectPeriod: (value: string) => void
  onRefresh: () => Promise<void> | void
  refreshing: boolean
  scopeLabel?: string | null
  scopeHelper?: string | null
  onCreateInvoice?: () => void
  paymentsHref?: string
  manageInvoicesHref?: string
  onExportData?: () => void
}

export function FinanceHeader({
  selectedPeriod,
  onSelectPeriod,
  onRefresh,
  refreshing,
  scopeLabel,
  scopeHelper,
  onCreateInvoice,
  paymentsHref,
  manageInvoicesHref,
  onExportData,
}: FinanceHeaderProps) {
  return (
    <div className={DASHBOARD_THEME.layout.header}>
      <div className="space-y-1.5">
        <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.finance?.title ?? 'Finance'}</h1>
        <p className={cn(DASHBOARD_THEME.layout.subtitle, 'text-base max-w-2xl')}>
          {PAGE_TITLES.finance?.description ?? 'Manage invoices, track revenue, and keep company-wide costs tied directly to your reporting charts.'}
        </p>
        {scopeLabel ? (
          <p className="text-xs text-muted-foreground">
            Viewing: <span className="font-medium text-foreground">{scopeLabel}</span>
            {scopeHelper ? <span className="text-muted-foreground"> · {scopeHelper}</span> : null}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedPeriod} onValueChange={onSelectPeriod}>
          <SelectTrigger className="w-full sm:w-[160px] shadow-sm">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void onRefresh()} disabled={refreshing} className={cn(getButtonClasses('outline'), 'shadow-sm')}>
            <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && DASHBOARD_THEME.animations.spin)} />
            Refresh
          </Button>
          {onExportData && (
            <Button variant="outline" onClick={() => void onExportData()} className={cn(getButtonClasses('outline'), 'shadow-sm')}>
              <Download className="mr-2 h-4 w-4" />
              Export all
            </Button>
          )}
          {manageInvoicesHref ? (
            <Button asChild variant="outline" className={cn(getButtonClasses('outline'), 'shadow-sm')}>
              <Link href={manageInvoicesHref} className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manage invoices
              </Link>
            </Button>
          ) : null}
          {paymentsHref && (
            <Button asChild variant="outline" className={cn(getButtonClasses('outline'), 'shadow-sm')}>
              <Link href={paymentsHref} className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </Link>
            </Button>
          )}
          {onCreateInvoice && (
            <Button onClick={onCreateInvoice} className={cn(getButtonClasses('primary'), 'shadow-sm')}>
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
