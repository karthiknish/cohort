'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Mail,
  Globe,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type ClientStatus = 'active' | 'prospect' | 'inactive'
type ClientPerformance = 'up' | 'down' | 'neutral'

const mockClients: Array<{
  id: string
  name: string
  industry: string
  website: string
  status: ClientStatus
  monthlyRevenue: number
  totalSpent: number
  campaigns: number
  lastContact: string
  nextMeeting: string | null
  performance: ClientPerformance
  accountManager: string
}> = [
  {
    id: '1',
    name: 'Tech Corp Solutions',
    industry: 'Technology',
    website: 'techcorp.com',
    status: 'active',
    monthlyRevenue: 15000,
    totalSpent: 125000,
    campaigns: 8,
    lastContact: '2024-01-10',
    nextMeeting: '2024-01-15',
    performance: 'up',
    accountManager: 'John Doe'
  },
  {
    id: '2',
    name: 'StartupXYZ Inc.',
    industry: 'E-commerce',
    website: 'startupxyz.com',
    status: 'active',
    monthlyRevenue: 7500,
    totalSpent: 45000,
    campaigns: 4,
    lastContact: '2024-01-12',
    nextMeeting: '2024-01-18',
    performance: 'up',
    accountManager: 'Jane Smith'
  },
  {
    id: '3',
    name: 'Retail Store LLC',
    industry: 'Retail',
    website: 'retailstore.com',
    status: 'active',
    monthlyRevenue: 5000,
    totalSpent: 30000,
    campaigns: 3,
    lastContact: '2024-01-08',
    nextMeeting: '2024-01-20',
    performance: 'down',
    accountManager: 'Mike Johnson'
  },
  {
    id: '4',
    name: 'Fashion Brand Co.',
    industry: 'Fashion',
    website: 'fashionbrand.com',
    status: 'prospect',
    monthlyRevenue: 0,
    totalSpent: 0,
    campaigns: 0,
    lastContact: '2024-01-05',
    nextMeeting: '2024-01-22',
    performance: 'neutral',
    accountManager: 'Sarah Wilson'
  },
  {
    id: '5',
    name: 'Healthcare Plus',
    industry: 'Healthcare',
    website: 'healthcareplus.com',
    status: 'inactive',
    monthlyRevenue: 0,
    totalSpent: 25000,
    campaigns: 2,
    lastContact: '2023-12-15',
    nextMeeting: null,
    performance: 'down',
    accountManager: 'John Doe'
  }
]

const statusColors: Record<ClientStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  prospect: 'bg-blue-100 text-blue-800',
  inactive: 'bg-slate-100 text-slate-800',
}

const performanceIcons: Record<ClientPerformance, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: BarChart3,
}

const performanceColors: Record<ClientPerformance, string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  neutral: 'text-slate-600',
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterIndustry, setFilterIndustry] = useState('all')

  const filteredClients = mockClients.filter((client) => {
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    const matchesIndustry = filterIndustry === 'all' || client.industry === filterIndustry
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesIndustry && matchesSearch
  })

  const stats = [
    {
      name: 'Total Clients',
      value: mockClients.filter(c => c.status === 'active').length,
      icon: Users
    },
    {
      name: 'Monthly Revenue',
      value: `$${mockClients.reduce((sum, c) => sum + c.monthlyRevenue, 0).toLocaleString()}`,
      icon: DollarSign
    },
    {
      name: 'Active Campaigns',
      value: mockClients.reduce((sum, c) => sum + c.campaigns, 0),
      icon: BarChart3
    },
    {
      name: 'Prospects',
      value: mockClients.filter(c => c.status === 'prospect').length,
      icon: TrendingUp
    }
  ]

  const industries = ['all', ...Array.from(new Set(mockClients.map(c => c.industry)))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Client Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your client relationships and track their performance.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add client
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="border-muted/60 bg-background">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">{stat.name}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="gap-4 space-y-0 divide-y divide-muted/40 p-0 sm:divide-y-0">
          <div className="space-y-1 p-6 pb-4">
            <CardTitle>Clients overview</CardTitle>
            <CardDescription>Search, filter, and review all accounts under management.</CardDescription>
          </div>
          <Separator className="sm:hidden" />
          <div className="flex flex-col gap-3 p-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients…"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Filter industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry === 'all' ? 'All industries' : industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[540px]">
            <div className="divide-y divide-muted/40">
              {filteredClients.map((client) => {
                const PerformanceIcon = performanceIcons[client.performance]
                return (
                  <div key={client.id} className="px-6 py-4 transition hover:bg-muted/40">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 items-start gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <span className="text-sm font-medium">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{client.name}</p>
                            <Badge variant="secondary" className={statusColors[client.status]}>
                              {client.status}
                            </Badge>
                            <PerformanceIcon className={`h-4 w-4 ${performanceColors[client.performance]}`} />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{client.industry}</span>
                            <span>•</span>
                            <span>{client.campaigns} campaigns</span>
                            <span>•</span>
                            <span>Managed by {client.accountManager}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {client.website}
                            </span>
                            {client.nextMeeting && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Next meeting {client.nextMeeting}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full flex-col items-start gap-3 text-sm text-muted-foreground md:w-auto md:items-end">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">${client.monthlyRevenue.toLocaleString()}/mo</p>
                          <p className="text-xs text-muted-foreground">${client.totalSpent.toLocaleString()} lifetime</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
