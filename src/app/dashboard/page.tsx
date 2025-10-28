import { Suspense } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign
  },
  {
    name: 'Active Clients',
    value: '24',
    change: '+4',
    changeType: 'positive',
    icon: Users
  },
  {
    name: 'Conversion Rate',
    value: '3.24%',
    change: '+0.8%',
    changeType: 'positive',
    icon: TrendingUp
  },
  {
    name: 'ROAS',
    value: '4.2x',
    change: '-0.3x',
    changeType: 'negative',
    icon: BarChart3
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'task',
    message: 'New task assigned: "Q4 Campaign Review"',
    time: '2 minutes ago',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'alert',
    message: 'Google Ads budget exceeded for Client ABC',
    time: '1 hour ago',
    icon: AlertCircle,
    color: 'text-red-600'
  },
  {
    id: 3,
    type: 'activity',
    message: 'Meta campaign "Holiday Sale" reached 50% of budget',
    time: '3 hours ago',
    icon: Activity,
    color: 'text-blue-600'
  }
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Review Q3 performance report',
    dueDate: 'Today',
    priority: 'high',
    client: 'Tech Corp'
  },
  {
    id: 2,
    title: 'Create proposal for new client',
    dueDate: 'Tomorrow',
    priority: 'medium',
    client: 'StartupXYZ'
  },
  {
    id: 3,
    title: 'Optimize Google Ads campaigns',
    dueDate: 'This week',
    priority: 'low',
    client: 'Retail Store'
  }
]

function StatsCard({ stat }: { stat: typeof stats[0] }) {
  const Icon = stat.icon
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          <p className={`mt-2 text-sm font-medium ${
            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
}

function ActivityItem({ item }: { item: typeof recentActivity[0] }) {
  const Icon = item.icon
  return (
    <div className="flex items-start space-x-3">
      <div className={`p-2 rounded-full bg-gray-50 ${item.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{item.message}</p>
        <p className="text-xs text-gray-500 mt-1">{item.time}</p>
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: typeof upcomingTasks[0] }) {
  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{task.title}</p>
        <p className="text-xs text-gray-500 mt-1">{task.client}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">{task.dueDate}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back! Here's an overview of your agency performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
              <div className="mt-4">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Analytics chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                Recent Activity
              </h3>
              <div className="mt-4 space-y-4">
                {recentActivity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
              <div className="mt-4 space-y-3">
                {upcomingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
