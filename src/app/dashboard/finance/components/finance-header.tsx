'use client'

import Link from 'next/link'

import { CreditCard, Plus, RefreshCw, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  onCreateInvoice?: () => void
  paymentsHref?: string
  onExportData?: () => void
}

export function FinanceHeader({
  selectedPeriod,
  onSelectPeriod,
  onRefresh,
  refreshing,
  onCreateInvoice,
  paymentsHref,
  onExportData,
}: FinanceHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Finance dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage invoices, track revenue, and keep company-wide costs tied directly to your reporting charts.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedPeriod} onValueChange={onSelectPeriod}>
          <SelectTrigger className="w-[160px]">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void onRefresh()} disabled={refreshing}>
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh data
          </Button>
          {onExportData && (
            <Button variant="outline" onClick={() => void onExportData()}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
          {paymentsHref && (
            <Button asChild variant="outline">
              <Link href={paymentsHref} className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </Link>
            </Button>
          )}
          <Button onClick={onCreateInvoice} disabled={!onCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" /> Create invoice
          </Button>
        </div>
      </div>
    </div>
  )
}
