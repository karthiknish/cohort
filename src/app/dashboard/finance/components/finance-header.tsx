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
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance Dashboard</h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Manage invoices, track revenue, and keep company-wide costs tied directly to your reporting charts.
        </p>
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
          <Button variant="outline" onClick={() => void onRefresh()} disabled={refreshing} className="shadow-sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onExportData && (
            <Button variant="outline" onClick={() => void onExportData()} className="shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {paymentsHref && (
            <Button asChild variant="outline" className="shadow-sm">
              <Link href={paymentsHref} className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </Link>
            </Button>
          )}
          {onCreateInvoice && (
            <Button onClick={onCreateInvoice} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
