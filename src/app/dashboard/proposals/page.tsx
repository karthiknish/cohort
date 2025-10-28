'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  DollarSign,
  Send,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

const mockProposals = [
  {
    id: 'PROP-001',
    clientId: 'Tech Corp',
    clientName: 'Tech Corp Solutions',
    title: 'Q1 Digital Marketing Strategy',
    status: 'sent',
    totalAmount: 15000,
    validUntil: '2024-02-15',
    createdAt: '2024-01-10',
    description: 'Comprehensive digital marketing including PPC, social media, and content strategy'
  },
  {
    id: 'PROP-002',
    clientId: 'StartupXYZ',
    clientName: 'StartupXYZ Inc.',
    title: 'PPC Campaign Launch',
    status: 'accepted',
    totalAmount: 7500,
    validUntil: '2024-01-30',
    createdAt: '2024-01-05',
    description: 'Google Ads and Meta Ads campaign setup and management'
  },
  {
    id: 'PROP-003',
    clientId: 'Retail Store',
    clientName: 'Retail Store LLC',
    title: 'Social Media Management Package',
    status: 'draft',
    totalAmount: 5000,
    validUntil: '2024-02-10',
    createdAt: '2024-01-12',
    description: 'Monthly social media management across all platforms'
  },
  {
    id: 'PROP-004',
    clientId: 'Fashion Brand',
    clientName: 'Fashion Brand Co.',
    title: 'Full-Service Marketing Partnership',
    status: 'rejected',
    totalAmount: 25000,
    validUntil: '2024-01-20',
    createdAt: '2023-12-28',
    description: 'End-to-end marketing services including analytics and reporting'
  }
]

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
  'accepted': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800'
}

const statusIcons = {
  'draft': Clock,
  'sent': Send,
  'accepted': CheckCircle,
  'rejected': XCircle
}

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredProposals = mockProposals.filter(proposal => {
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const stats = [
    {
      name: 'Total Proposals',
      value: mockProposals.length,
      icon: FileText
    },
    {
      name: 'Pending',
      value: mockProposals.filter(p => p.status === 'sent').length,
      icon: Clock
    },
    {
      name: 'Accepted',
      value: mockProposals.filter(p => p.status === 'accepted').length,
      icon: CheckCircle
    },
    {
      name: 'Total Value',
      value: `$${mockProposals.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}`,
      icon: DollarSign
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposal Generator</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create, manage, and track client proposals.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
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
                  placeholder="Search proposals..."
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredProposals.map((proposal) => {
              const StatusIcon = statusIcons[proposal.status]
              return (
                <li key={proposal.id}>
                  <div className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-gray-900">
                            {proposal.id} - {proposal.title}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[proposal.status]}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {proposal.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Client: {proposal.clientName}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {proposal.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${proposal.totalAmount.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Valid until {proposal.validUntil}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created {proposal.createdAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {proposal.status === 'draft' && (
                          <button className="p-2 text-gray-400 hover:text-indigo-600">
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-indigo-600">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-indigo-600">
                          <Download className="h-5 w-5" />
                        </button>
                        {proposal.status === 'draft' && (
                          <button className="p-2 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Proposal</h3>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                      Client
                    </label>
                    <select
                      id="client"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option>Select a client...</option>
                      <option>Tech Corp</option>
                      <option>StartupXYZ</option>
                      <option>Retail Store</option>
                      <option>Fashion Brand</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter proposal title..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe the scope of work..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Total Amount ($)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      id="validUntil"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Services
                  </label>
                  <div className="space-y-2">
                    {['PPC Management', 'Social Media Marketing', 'SEO Services', 'Content Creation', 'Email Marketing'].map((service) => (
                      <label key={service} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        <span className="ml-2 text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
