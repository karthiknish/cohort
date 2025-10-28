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
  ResponsiveContainer 
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
  Eye
} from 'lucide-react'

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

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
  'paid': 'bg-green-100 text-green-800',
  'overdue': 'bg-red-100 text-red-800'
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

  const filteredInvoices = mockInvoices.filter(invoice => 
    filterStatus === 'all' || invoice.status === filterStatus
  )

  const totalOutstanding = filteredInvoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage invoices, track revenue, and monitor financial performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`mt-2 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <li key={invoice.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.id} - {invoice.clientName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {invoice.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Issued {invoice.issuedDate}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due {invoice.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">${invoice.amount.toLocaleString()}</p>
                        {invoice.status === 'overdue' && (
                          <p className="text-xs text-red-600">Overdue</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-indigo-600">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Client</h3>
          <div className="space-y-4">
            {['Tech Corp', 'StartupXYZ', 'Retail Store', 'Fashion Brand'].map((client, index) => (
              <div key={client} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{client}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${[(25000, 18000, 12000, 15000)][index].toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[(15, 12, 8, 10)][index]}% of total
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Payments</h3>
          <div className="space-y-4">
            {filteredInvoices
              .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
              .slice(0, 3)
              .map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.clientName}</p>
                    <p className="text-xs text-gray-500">Due {invoice.dueDate}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${invoice.amount.toLocaleString()}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
