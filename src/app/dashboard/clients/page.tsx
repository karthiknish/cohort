'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Users, 
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react'

const mockClients = [
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

const statusColors: Record<string, string> = {
  'active': 'bg-green-100 text-green-800',
  'prospect': 'bg-blue-100 text-blue-800',
  'inactive': 'bg-gray-100 text-gray-800'
}

const performanceIcons: Record<string, any> = {
  'up': TrendingUp,
  'down': TrendingDown,
  'neutral': BarChart3
}

const performanceColors: Record<string, string> = {
  'up': 'text-green-600',
  'down': 'text-red-600',
  'neutral': 'text-gray-600'
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterIndustry, setFilterIndustry] = useState('all')

  const filteredClients = mockClients.filter(client => {
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    const matchesIndustry = filterIndustry === 'all' || client.industry === filterIndustry
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your client relationships and track their performance.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{stat.name}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search clients..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredClients.map((client) => {
              const PerformanceIcon = performanceIcons[client.performance]
              return (
                <li key={client.id}>
                  <div className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-indigo-600">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {client.name}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                                {client.status}
                              </span>
                              <PerformanceIcon className={`h-4 w-4 ${performanceColors[client.performance]}`} />
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{client.industry}</span>
                              <span>•</span>
                              <span>{client.campaigns} campaigns</span>
                              <span>•</span>
                              <span>Managed by {client.accountManager}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-1" />
                                {client.website}
                              </div>
                              {client.nextMeeting && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Next meeting {client.nextMeeting}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${client.monthlyRevenue.toLocaleString()}/mo
                          </p>
                          <p className="text-xs text-gray-500">
                            ${client.totalSpent.toLocaleString()} total
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-indigo-600">
                            <BarChart3 className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-indigo-600">
                            <Mail className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-indigo-600">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
