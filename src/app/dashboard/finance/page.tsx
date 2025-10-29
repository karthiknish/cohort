'use client'

import { useState } from 'react'
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
  TrendingDown,
  CreditCard,
  FileText,
  Calendar,
  Plus,
  Download,
  Eye,
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
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const mockRevenueData = [
  { month: 'Jan', revenue: 40000, expenses: 24000, profit: 16000 },
  { month: 'Feb', revenue: 30000, expenses: 13980, profit: 16020 },
  { month: 'Mar', revenue: 45000, expenses: 28000, profit: 17000 },
  { month: 'Apr', revenue: 52000, expenses: 32000, profit: 20000 },
  { month: 'May', revenue: 48000, expenses: 29000, profit: 19000 },
  { month: 'Jun', revenue: 61000, expenses: 35000, profit: 26000 },
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
    description: 'Monthly PPC Management'
  },
  {
    id: 'INV-002',
    clientId: 'StartupXYZ',
    clientName: 'StartupXYZ Inc.',
    amount: 7500,
    status: 'sent',
    dueDate: '2024-01-20',
    issuedDate: '2024-01-05',
    description: 'Q1 Marketing Strategy'
  },
  {
    id: 'INV-003',
    clientId: 'Retail Store',
    clientName: 'Retail Store LLC',
    amount: 3200,
    status: 'overdue',
    dueDate: '2024-01-10',
    issuedDate: '2023-12-27',
    description: 'Social Media Management'
  },
  {
    id: 'INV-004',
    clientId: 'Fashion Brand',
    clientName: 'Fashion Brand Co.',
    amount: 8900,
    status: 'draft',
    dueDate: '2024-01-25',
    issuedDate: '2024-01-12',
    description: 'Full-Service Digital Marketing'
  }
]

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
}

const stats = [
  {
    name: 'Total Revenue',
    value: '$276,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign
  },
  {
    name: 'Total Expenses',
    value: '$161,980',
    change: '+8.2%',
    trend: 'up',
    icon: CreditCard
  },
  {
    name: 'Net Profit',
    value: '$114,020',
    change: '+18.7%',
    trend: 'up',
    icon: TrendingUp
  },
  {
    name: 'Outstanding Invoices',
    value: '$11,700',
    change: '-5.3%',
    trend: 'down',
    icon: FileText
  }
]

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredInvoices = mockInvoices.filter((invoice) =>
    filterStatus === 'all' || invoice.status === filterStatus
  )

  const totalOutstanding = filteredInvoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Finance dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage invoices, track revenue, and monitor overall cash flow performance.
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
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="border-muted/60 bg-background">
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <span
                    className={cn(
                      'inline-flex items-center text-xs font-medium',
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Revenue vs expenses</CardTitle>
            <CardDescription>Monthly totals for the selected lookback period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Monthly profit</CardTitle>
            <CardDescription>Profitability trends based on consolidated invoicing.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#6366f1" name="Profit" />
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
                        ${invoice.amount.toLocaleString()}
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
                    ${[25000, 18000, 12000, 15000][index].toLocaleString()}
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
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.clientName}</p>
                    <p className="text-xs text-muted-foreground">Due {invoice.dueDate}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">${invoice.amount.toLocaleString()}</p>
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
