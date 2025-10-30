'use client'

import { FormEvent, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Calendar,
  Plus,
  Download,
  Eye,
  Trash,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type CostFrequency = 'monthly' | 'quarterly' | 'annual'

type CostEntry = {
  id: string
  category: string
  amount: number
  cadence: CostFrequency
}

const baselineRevenueData = [
  { month: 'Jan', revenue: 40000, operatingExpenses: 24000 },
  { month: 'Feb', revenue: 30000, operatingExpenses: 13980 },
  { month: 'Mar', revenue: 45000, operatingExpenses: 28000 },
  { month: 'Apr', revenue: 52000, operatingExpenses: 32000 },
  { month: 'May', revenue: 48000, operatingExpenses: 29000 },
  { month: 'Jun', revenue: 61000, operatingExpenses: 35000 },
]

const initialCosts: CostEntry[] = [
  { id: 'cost-saas', category: 'SaaS & tooling', amount: 1200, cadence: 'monthly' },
  { id: 'cost-office', category: 'Team enablement', amount: 4500, cadence: 'quarterly' },
  { id: 'cost-overhead', category: 'Agency overhead', amount: 18000, cadence: 'annual' },
]

const mockInvoices = [
  {
    id: 'INV-001',
    clientId: 'Tech Corp',
    clientName: 'Tech Corp Solutions',
    amount: 5000,
    status: 'paid',
    dueDate: '2024-01-15',
    issuedDate: '2024-01-01',
    description: 'Monthly PPC Management',
  },
  {
    id: 'INV-002',
    clientId: 'StartupXYZ',
    clientName: 'StartupXYZ Inc.',
    amount: 7500,
    status: 'sent',
    dueDate: '2024-01-20',
    issuedDate: '2024-01-05',
    description: 'Q1 Marketing Strategy',
  },
  {
    id: 'INV-003',
    clientId: 'Retail Store',
    clientName: 'Retail Store LLC',
    amount: 3200,
    status: 'overdue',
    dueDate: '2024-01-10',
    issuedDate: '2023-12-27',
    description: 'Social Media Management',
  },
  {
    id: 'INV-004',
    clientId: 'Fashion Brand',
    clientName: 'Fashion Brand Co.',
    amount: 8900,
    status: 'draft',
    dueDate: '2024-01-25',
    issuedDate: '2024-01-12',
    description: 'Full-Service Digital Marketing',
  },
]

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

const normalizeMonthly = (amount: number, cadence: CostFrequency): number => {
  if (cadence === 'monthly') return amount
  if (cadence === 'quarterly') return amount / 3
  return amount / 12
}

const formatCadence = (cadence: CostFrequency): string => {
  if (cadence === 'monthly') return 'Monthly'
  if (cadence === 'quarterly') return 'Quarterly'
  return 'Annual'
}

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [filterStatus, setFilterStatus] = useState('all')
  const [companyCosts, setCompanyCosts] = useState<CostEntry[]>(initialCosts)
  const [newCost, setNewCost] = useState<{ category: string; amount: string; cadence: CostFrequency }>(
    { category: '', amount: '', cadence: 'monthly' },
  )

  const filteredInvoices = useMemo(
    () =>
      mockInvoices.filter((invoice) => filterStatus === 'all' || invoice.status === filterStatus),
    [filterStatus],
  )

  const monthlyCostTotal = useMemo(
    () => companyCosts.reduce((sum, cost) => sum + normalizeMonthly(cost.amount, cost.cadence), 0),
    [companyCosts],
  )

  const transformedRevenueData = useMemo(
    () =>
      baselineRevenueData.map((entry) => {
        const totalExpenses = entry.operatingExpenses + monthlyCostTotal
        return {
          ...entry,
          totalExpenses,
          companyCosts: monthlyCostTotal,
          profit: entry.revenue - totalExpenses,
        }
      }),
    [monthlyCostTotal],
  )

  const totalRevenue = useMemo(
    () => transformedRevenueData.reduce((sum, entry) => sum + entry.revenue, 0),
    [transformedRevenueData],
  )
  const totalExpenses = useMemo(
    () => transformedRevenueData.reduce((sum, entry) => sum + entry.totalExpenses, 0),
    [transformedRevenueData],
  )
  const totalCompanyCosts = useMemo(
    () => monthlyCostTotal * baselineRevenueData.length,
    [monthlyCostTotal],
  )
  const netProfit = totalRevenue - totalExpenses

  const totalOutstanding = filteredInvoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const statCards = useMemo(
    () => [
      {
        name: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        helper: `${selectedPeriod.toUpperCase()} lookback`,
        icon: DollarSign,
      },
      {
        name: 'Total Expenses',
        value: formatCurrency(totalExpenses),
        helper: `Includes ${formatCurrency(totalCompanyCosts)} company costs`,
        icon: CreditCard,
      },
      {
        name: 'Company Costs',
        value: formatCurrency(totalCompanyCosts),
        helper: `${formatCurrency(Math.round(monthlyCostTotal))} average per month`,
        icon: FileText,
      },
      {
        name: 'Net Profit',
        value: formatCurrency(netProfit),
        helper: netProfit >= 0 ? 'Positive margin' : 'Review costs',
        icon: TrendingUp,
      },
    ],
    [netProfit, totalCompanyCosts, totalExpenses, totalRevenue, selectedPeriod, monthlyCostTotal],
  )

  const handleAddCost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amountValue = Number(newCost.amount)
    if (!newCost.category.trim() || !Number.isFinite(amountValue) || amountValue <= 0) {
      return
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cost-${Date.now()}`
    setCompanyCosts((prev) => [...prev, { id, category: newCost.category.trim(), amount: amountValue, cadence: newCost.cadence }])
    setNewCost({ category: '', amount: '', cadence: 'monthly' })
  }

  const handleRemoveCost = (id: string) => {
    setCompanyCosts((prev) => prev.filter((cost) => cost.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Finance dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage invoices, track revenue, and keep company-wide costs tied directly to your reporting charts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="border-muted/60 bg-background">
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <span className="text-xs text-muted-foreground">{stat.helper}</span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Operating costs</CardTitle>
            <CardDescription>
              Track SaaS, people, and overhead expenses that roll into financial charts.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit bg-primary/10 text-xs font-medium uppercase tracking-wide text-primary">
            {formatCurrency(Math.round(monthlyCostTotal))} per month
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddCost} className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,auto]">
            <div className="space-y-1">
              <Label htmlFor="cost-category">Cost category</Label>
              <Input
                id="cost-category"
                value={newCost.category}
                onChange={(event) => setNewCost((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="e.g. Creative tooling"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cost-amount">Amount</Label>
              <Input
                id="cost-amount"
                type="number"
                min="0"
                value={newCost.amount}
                onChange={(event) => setNewCost((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="1500"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cost-cadence">Cadence</Label>
              <Select
                value={newCost.cadence}
                onValueChange={(value: CostFrequency) => setNewCost((prev) => ({ ...prev, cadence: value }))}
              >
                <SelectTrigger id="cost-cadence">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add cost
              </Button>
            </div>
          </form>

          <Separator />

          <div className="space-y-3">
            {companyCosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No company-level costs captured yet.</p>
            ) : (
              companyCosts.map((cost) => (
                <div
                  key={cost.id}
                  className="flex flex-col gap-3 rounded-lg border border-muted/40 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cost.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCadence(cost.cadence)} · {formatCurrency(Math.round(cost.amount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {formatCurrency(Math.round(normalizeMonthly(cost.amount, cost.cadence)))} / mo
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveCost(cost.id)}
                      aria-label={`Remove ${cost.category}`}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Revenue vs expenses</CardTitle>
            <CardDescription>Monthly totals that now incorporate company-level operating costs.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transformedRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="totalExpenses" stroke="#ef4444" strokeWidth={2} name="Total expenses" />
                <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Expense composition</CardTitle>
            <CardDescription>Breakdown of campaign spend vs operating costs by month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="operatingExpenses" stackId="expenses" fill="#6366f1" name="Campaign spend" />
                <Bar dataKey="companyCosts" stackId="expenses" fill="#f59e0b" name="Company costs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>Filter, download, and monitor the latest billing activity.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[420px]">
            <div className="divide-y divide-muted/30">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {invoice.id} · {invoice.clientName}
                      </p>
                      <Badge variant="secondary" className={statusColors[invoice.status as InvoiceStatus]}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Issued {invoice.issuedDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Due {invoice.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(invoice.amount)}
                      </p>
                      {invoice.status === 'overdue' && (
                        <span className="text-xs font-medium text-red-600">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View invoice">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download invoice">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Revenue by client</CardTitle>
            <CardDescription>Top contributing clients by collected revenue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Tech Corp', 'StartupXYZ', 'Retail Store', 'Fashion Brand'].map((client, index) => (
              <div key={client} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">{client}</span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    {formatCurrency([25000, 18000, 12000, 15000][index])}
                  </p>
                  <p>{[15, 12, 8, 10][index]}% of total</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Upcoming payments</CardTitle>
            <CardDescription>Outstanding invoices expected within the next 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredInvoices
              .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
              .slice(0, 3)
              .map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.clientName}</p>
                    <p className="text-xs text-muted-foreground">Due {invoice.dueDate}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
                </div>
              ))}
            {totalOutstanding === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming payments in the selected range.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
