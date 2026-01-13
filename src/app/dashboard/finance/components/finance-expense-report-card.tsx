'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { RefreshCw, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

import { useQuery } from 'convex/react'
import { useClientContext } from '@/contexts/client-context'
import { financeExpensesApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import type { ExpenseReportResponse, ExpenseStatus } from '@/types/expenses'
import { formatCurrency } from '../utils'

function isoFromDateInput(value: string, boundary: 'start' | 'end'): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  // Ensure we always pass a UTC ISO string to the API.
  const suffix = boundary === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z'
  return new Date(`${trimmed}${suffix}`).toISOString()
}

const STATUSES: ExpenseStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'paid']

export function FinanceExpenseReportCard({ currency, embedded = false }: { currency: string; embedded?: boolean }) {
  const { toast } = useToast()

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { workspaceId } = useClientContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ExpenseReportResponse | null>(null)

  const [queryFrom, setQueryFrom] = useState<string | undefined>(undefined)
  const [queryTo, setQueryTo] = useState<string | undefined>(undefined)

  const convexReport = useQuery(
    financeExpensesApi.report,
    workspaceId
      ? {
          workspaceId,
          from: queryFrom,
          to: queryTo,
        }
      : 'skip'
  )

  const resolvedCurrency = (currency ?? 'USD').toUpperCase()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!workspaceId) {
        setLoading(false)
        return
      }

      const from = isoFromDateInput(fromDate, 'start') ?? undefined
      const to = isoFromDateInput(toDate, 'end') ?? undefined

      setQueryFrom(from)
      setQueryTo(to)
    } catch (e) {
      setError(asErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, workspaceId])

  useEffect(() => {
    if (convexReport === undefined) return
    if (!convexReport) return
    setReport(convexReport as ExpenseReportResponse)
  }, [convexReport])

  const totals = useMemo(() => {
    const rows = report?.rows ?? []
    const total = rows.reduce((acc, r) => acc + (r.total ?? 0), 0)
    const count = rows.reduce((acc, r) => acc + (r.count ?? 0), 0)
    return { total, count, rows: rows.length }
  }, [report])

  const handleExportCsv = useCallback(() => {
    try {
      const rows = report?.rows ?? []
      if (rows.length === 0) {
        toast({ title: 'Nothing to export', description: 'Run the report first.' })
        return
      }

      const headers = [
        'Employee ID',
        'Total',
        'Currency',
        'Count',
        ...STATUSES.flatMap((s) => [`${s} total`, `${s} count`]),
      ]

      const csvRows = rows.map((r) => {
        const base = [
          r.employeeId ?? '',
          String(r.total ?? 0),
          (r.currency ?? resolvedCurrency).toUpperCase(),
          String(r.count ?? 0),
        ]

        const breakdown = STATUSES.flatMap((s) => {
          const cell = r.byStatus?.[s]
          return [String(cell?.total ?? 0), String(cell?.count ?? 0)]
        })

        return [...base, ...breakdown]
      })

      const csvContent = [
        headers.join(','),
        ...csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({ title: 'Export complete', description: `Downloaded ${rows.length} row${rows.length === 1 ? '' : 's'}.` })
    } catch (e) {
      toast({ title: 'Export failed', description: asErrorMessage(e), variant: 'destructive' })
    }
  }, [report?.rows, resolvedCurrency, toast])

  const Wrapper = embedded ? 'div' : Card
  const HeaderWrapper = embedded ? 'div' : CardHeader
  const ContentWrapper = embedded ? 'div' : CardContent

  return (
    <Wrapper className={embedded ? 'space-y-6' : 'border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow'}>
      {!embedded && (
        <HeaderWrapper className="flex flex-col gap-4 border-b border-muted/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Expense Reports</CardTitle>
            <CardDescription>Admin summary by employee (last 500 expenses; filterable by date).</CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={() => void refresh()} disabled={loading} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Run
            </Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={loading || !(report?.rows?.length)} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </HeaderWrapper>
      )}

      <ContentWrapper className={embedded ? '' : 'space-y-6 pt-6'}>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="expense-report-from">From</Label>
            <Input id="expense-report-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expense-report-to">To</Label>
            <Input id="expense-report-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="rounded-md border border-muted/40 bg-muted/10 p-3">
            <div className="text-xs text-muted-foreground">Employees</div>
            <div className="text-lg font-semibold">{totals.rows}</div>
          </div>
          <div className="rounded-md border border-muted/40 bg-muted/10 p-3">
            <div className="text-xs text-muted-foreground">Total Amount</div>
            <div className="text-lg font-semibold">{formatCurrency(totals.total, resolvedCurrency)}</div>
            <div className="text-xs text-muted-foreground">{totals.count} expense{totals.count === 1 ? '' : 's'}</div>
          </div>
        </div>

        <div className="rounded-md border border-muted/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>By status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report?.rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    {loading ? 'Loading…' : 'Run the report to see results.'}
                  </TableCell>
                </TableRow>
              ) : (
                (report?.rows ?? [])
                  .slice()
                  .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
                  .map((row) => (
                    <TableRow key={row.employeeId}>
                      <TableCell className="font-medium">{row.employeeId}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.total ?? 0, (row.currency ?? resolvedCurrency).toUpperCase())}</TableCell>
                      <TableCell className="text-right">{row.count ?? 0}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {STATUSES.map((s) => {
                          const cell = row.byStatus?.[s]
                          const count = cell?.count ?? 0
                          const total = cell?.total ?? 0
                          if (!count && !total) return null
                          return (
                            <span key={s} className="mr-3 inline-flex items-center gap-1">
                              <span className="capitalize text-foreground">{s}</span>
                              <span>({count})</span>
                            </span>
                          )
                        })}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </ContentWrapper>
    </Wrapper>
  )
}
