'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'

const mockTasks = [
  {
    id: '1',
    title: 'Review Q3 performance report for Tech Corp',
    description: 'Analyze campaign performance and prepare quarterly review',
    status: 'in-progress',
    priority: 'high',
    assignedTo: ['John Doe'],
    client: 'Tech Corp',
    dueDate: '2024-01-15',
    createdAt: '2024-01-10',
    tags: ['report', 'analytics']
  },
  {
    id: '2',
    title: 'Create new proposal for StartupXYZ',
    description: 'Develop comprehensive PPC and social media strategy',
    status: 'todo',
    priority: 'medium',
    assignedTo: ['Jane Smith'],
    client: 'StartupXYZ',
    dueDate: '2024-01-20',
    createdAt: '2024-01-11',
    tags: ['proposal', 'new-client']
  },
  {
    id: '3',
    title: 'Optimize Google Ads campaigns',
    description: 'Review and adjust bids, keywords, and ad copy',
    status: 'todo',
    priority: 'low',
    assignedTo: ['Mike Johnson'],
    client: 'Retail Store',
    dueDate: '2024-01-25',
    createdAt: '2024-01-12',
    tags: ['optimization', 'google-ads']
  },
  {
    id: '4',
    title: 'Client meeting preparation',
    description: 'Prepare slides and performance data for client meeting',
    status: 'review',
    priority: 'high',
    assignedTo: ['Sarah Wilson', 'John Doe'],
    client: 'Fashion Brand',
    dueDate: '2024-01-16',
    createdAt: '2024-01-09',
    tags: ['meeting', 'client']
  },
  {
    id: '5',
    title: 'Set up conversion tracking',
    description: 'Implement conversion tracking for new landing pages',
    status: 'completed',
    priority: 'medium',
    assignedTo: ['Mike Johnson'],
    client: 'Tech Corp',
    dueDate: '2024-01-13',
    createdAt: '2024-01-08',
    tags: ['technical', 'tracking']
  }
]

const teamMembers = [
  { id: '1', name: 'John Doe', avatar: 'JD' },
  { id: '2', name: 'Jane Smith', avatar: 'JS' },
  { id: '3', name: 'Mike Johnson', avatar: 'MJ' },
  { id: '4', name: 'Sarah Wilson', avatar: 'SW' }
]

const statusColors: Record<string, string> = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'review': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800'
}

const priorityColors: Record<string, string> = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800'
}

export default function TasksPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')

  const filteredTasks = mockTasks.filter(task => {
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAssignee = selectedAssignee === 'all' || 
                           task.assignedTo.some(assignee => assignee.toLowerCase().includes(selectedAssignee.toLowerCase()))
    
    return matchesStatus && matchesSearch && matchesAssignee
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track tasks across your team and clients.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">To Do</p>
              <p className="text-lg font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">In Progress</p>
              <p className="text-lg font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Review</p>
              <p className="text-lg font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Completed</p>
              <p className="text-lg font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
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
                  placeholder="Search tasks..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Assignees</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <li key={task.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {task.assignedTo.join(', ')}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due {task.dueDate}
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {task.client}
                          </span>
                        </div>
                      </div>
                      {task.tags.length > 0 && (
                        <div className="mt-2 flex items-center space-x-2">
                          {task.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
