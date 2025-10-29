'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-blue-100 text-blue-800',
  review: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function TasksPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')

  const filteredTasks = mockTasks.filter((task) => {
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAssignee = selectedAssignee === 'all' ||
      task.assignedTo.some((assignee) => assignee.toLowerCase().includes(selectedAssignee.toLowerCase()))

    return matchesStatus && matchesSearch && matchesAssignee
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Task management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track assignments across teams and clients.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/60 bg-background">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase text-muted-foreground">To do</p>
              <p className="text-lg font-semibold text-foreground">2</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase text-muted-foreground">In progress</p>
              <p className="text-lg font-semibold text-foreground">1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Review</p>
              <p className="text-lg font-semibold text-foreground">1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold text-foreground">1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <CardTitle>All tasks</CardTitle>
          <CardDescription>Search, filter, and monitor active work across the agency.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks…"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="max-h-[520px]">
            <div className="divide-y divide-muted/30">
              {filteredTasks.map((task) => (
                <div key={task.id} className="px-6 py-4 transition hover:bg-muted/40">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[260px] sm:max-w-[360px]">
                          {task.title}
                        </p>
                        <Badge variant="secondary" className={statusColors[task.status as TaskStatus]}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[task.priority as TaskPriority]}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {task.assignedTo.join(', ')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Due {task.dueDate}
                        </span>
                        <Badge variant="outline" className="border border-dashed">
                          {task.client}
                        </Badge>
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Task actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No tasks match the current filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
