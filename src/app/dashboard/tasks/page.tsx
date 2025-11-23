'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Loader2,
  X,
  LayoutGrid,
  List,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useNavigationContext } from '@/contexts/navigation-context'
import { TaskRecord, TaskPriority, TaskStatus } from '@/types/tasks'
import { authService } from '@/services/auth'
import { isFeatureEnabled } from '@/lib/features'
import { Skeleton } from '@/components/ui/skeleton'

type SummaryCardConfig = {
  status: TaskStatus
  label: string
  icon: typeof Clock
  iconClass: string
}

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  clientId: string | null
  clientName: string
  dueDate: string
  tags: string
}

type TaskListResponse = {
  tasks?: TaskRecord[]
  nextCursor?: string | null
}

type ProjectFilter = {
  id: string | null
  name: string | null
}

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

const buildInitialFormState = (client?: { id: string | null; name: string | null }): TaskFormState => ({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignedTo: '',
  clientId: client?.id ?? null,
  clientName: client?.name ?? '',
  dueDate: '',
  tags: '',
})

export default function TasksPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { navigationState, setProjectContext } = useNavigationContext()
  const { toast } = useToast()
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>(() => ({
    id: searchParams.get('projectId'),
    name: searchParams.get('projectName'),
  }))
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [activeTab, setActiveTab] = useState('all-tasks')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formState, setFormState] = useState<TaskFormState>(() => buildInitialFormState(selectedClient ?? undefined))
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const initialLoading = loading && tasks.length === 0

  const resetForm = useCallback(() => {
    setFormState(buildInitialFormState(selectedClient ?? undefined))
    setCreateError(null)
  }, [selectedClient])

  useEffect(() => {
    const id = searchParams.get('projectId')
    const name = searchParams.get('projectName')
    setProjectFilter((prev) => (prev.id === id && prev.name === name ? prev : { id, name }))
    
    // Update navigation context when project filter changes
    if (isFeatureEnabled('BIDIRECTIONAL_NAV') && id && name) {
      setProjectContext(id, name)
    }
  }, [searchParams, setProjectContext])

  const clearProjectFilter = useCallback(() => {
    setProjectFilter({ id: null, name: null })
    const params = new URLSearchParams(searchParams.toString())
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      setIsCreateOpen(open)
      if (open) {
        setCreateError(null)
        setFormState((prev) => ({
          ...prev,
          clientId: selectedClient?.id ?? null,
          clientName: selectedClient?.name ?? '',
        }))
      } else {
        resetForm()
      }
    },
    [resetForm, selectedClient],
  )

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      clientId: selectedClient?.id ?? null,
      clientName: selectedClient?.name ?? '',
    }))
  }, [selectedClient])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user?.id) {
      setTasks([])
      setNextCursor(null)
      setLoading(false)
      return
    }

    if (!selectedClientId) {
      setTasks([])
      setNextCursor(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const loadTasks = async () => {
      setLoading(true)
      setError(null)
      setNextCursor(null)
      try {
        const token = await authService.getIdToken()
        const search = new URLSearchParams()
        if (selectedClientId) {
          search.set('clientId', selectedClientId)
        }
        const queryString = search.toString()
        const url = `/api/tasks${queryString ? `?${queryString}` : ''}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          const message = payload?.error ?? 'Unable to load tasks'
          throw new Error(message)
        }

        const data = (await response.json()) as TaskListResponse
        if (!cancelled) {
          const entries = Array.isArray(data?.tasks) ? data.tasks : []
          setTasks(entries)
          setNextCursor(typeof data?.nextCursor === 'string' && data.nextCursor.length > 0 ? data.nextCursor : null)
        }
      } catch (fetchError: unknown) {
        console.error('Failed to fetch tasks', fetchError)
        if (!cancelled) {
          const message = fetchError instanceof Error ? fetchError.message : 'Unexpected error loading tasks'
          setError(message)
          setTasks([])
          setNextCursor(null)
          toast({
            title: 'Error loading tasks',
            description: message,
            variant: 'destructive',
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      cancelled = true
    }
  }, [authLoading, selectedClientId, user?.id])

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !nextCursor) {
      return
    }

    setLoadingMore(true)
    try {
      const token = await authService.getIdToken()
      const params = new URLSearchParams()
      if (selectedClientId) {
        params.set('clientId', selectedClientId)
      }
      params.set('after', nextCursor)
      const url = `/api/tasks?${params.toString()}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        const message = payload?.error ?? 'Unable to load additional tasks'
        throw new Error(message)
      }

      const data = (await response.json()) as TaskListResponse
      const entries = Array.isArray(data?.tasks) ? data.tasks : []
      setTasks((prev) => [...prev, ...entries])
      setNextCursor(typeof data?.nextCursor === 'string' && data.nextCursor.length > 0 ? data.nextCursor : null)
    } catch (error) {
      console.error('Failed to load additional tasks', error)
      toast({
        title: 'Task pagination error',
        description: error instanceof Error ? error.message : 'Unable to load more tasks',
        variant: 'destructive',
      })
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, nextCursor, selectedClientId, toast])

  const tasksForClient = useMemo(() => {
    if (!selectedClientId && !selectedClient) {
      return tasks
    }

    const normalizedClientName = selectedClient?.name?.toLowerCase() ?? null

    return tasks.filter((task) => {
      if (selectedClientId) {
        if (task.clientId) {
          return task.clientId === selectedClientId
        }
        if (normalizedClientName && task.client) {
          return task.client.toLowerCase() === normalizedClientName
        }
        return false
      }

      if (normalizedClientName) {
        return task.client?.toLowerCase() === normalizedClientName
      }

      return true
    })
  }, [tasks, selectedClientId, selectedClient])

  const projectScopedTasks = useMemo(() => {
    if (!projectFilter.id && !projectFilter.name) {
      return tasksForClient
    }

    const targetId = projectFilter.id
    const targetName = projectFilter.name?.toLowerCase() ?? null

    return tasksForClient.filter((task) => {
      if (targetId && task.projectId === targetId) {
        return true
      }
      if (targetName && task.projectName && task.projectName.toLowerCase() === targetName) {
        return true
      }
      return false
    })
  }, [projectFilter.id, projectFilter.name, tasksForClient])

  const filteredTasks = useMemo(() => {
    return projectScopedTasks.filter((task) => {
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
      const title = task.title.toLowerCase()
      const description = (task.description ?? '').toLowerCase()
      const query = searchQuery.toLowerCase()
      const matchesSearch = title.includes(query) || description.includes(query)
      
      let matchesAssignee = true
      if (activeTab === 'my-tasks') {
        // If "My Tasks" tab is active, filter by current user
        // We assume user.name or user.email might be in assignedTo
        // This is a loose check since assignedTo is just strings
        if (user?.name) {
           matchesAssignee = task.assignedTo.some(a => a.toLowerCase() === user.name?.toLowerCase())
        } else {
           matchesAssignee = false
        }
      } else {
        // Otherwise use the dropdown filter
        matchesAssignee =
          selectedAssignee === 'all' ||
          task.assignedTo.some((assignee) => assignee.toLowerCase().includes(selectedAssignee.toLowerCase()))
      }

      return matchesStatus && matchesSearch && matchesAssignee
    })
  }, [projectScopedTasks, selectedStatus, searchQuery, selectedAssignee, activeTab, user?.name])

  const taskCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0,
    }

    projectScopedTasks.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1
    })

    return counts
  }, [projectScopedTasks])

  const assigneeOptions = useMemo(() => {
    const options = new Set<string>()
    projectScopedTasks.forEach((task) => {
      task.assignedTo.forEach((member) => {
        if (member && member.trim().length > 0) {
          options.add(member)
        }
      })
    })
    return Array.from(options).sort((a, b) => a.localeCompare(b))
  }, [projectScopedTasks])

  useEffect(() => {
    if (selectedAssignee !== 'all' && !assigneeOptions.includes(selectedAssignee)) {
      setSelectedAssignee('all')
    }
  }, [assigneeOptions, selectedAssignee])

  const summaryCards: SummaryCardConfig[] = useMemo(
    () => [
      { status: 'todo', label: 'To do', icon: Clock, iconClass: 'bg-muted text-muted-foreground' },
      { status: 'in-progress', label: 'In progress', icon: AlertCircle, iconClass: 'bg-blue-100 text-blue-700' },
      { status: 'review', label: 'Review', icon: Clock, iconClass: 'bg-amber-100 text-amber-700' },
      { status: 'completed', label: 'Completed', icon: CheckCircle, iconClass: 'bg-emerald-100 text-emerald-700' },
    ],
    [],
  )

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as 'all' | TaskStatus)
  }

  const handleAssigneeChange = (value: string) => {
    setSelectedAssignee(value)
  }

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.id) {
      setCreateError('You must be signed in to create tasks.')
      return
    }

    if (!selectedClientId) {
      setCreateError('Select a client from the dashboard before creating tasks.')
      return
    }

    const trimmedTitle = formState.title.trim()
    if (!trimmedTitle) {
      setCreateError('Title is required.')
      return
    }

    setCreating(true)
    setCreateError(null)

    const assignedMembers = formState.assignedTo
      .split(',')
      .map((member) => member.trim())
      .filter((member) => member.length > 0)

    const normalizedTags = formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const normalizedClientName = (selectedClient?.name ?? formState.clientName).trim()

    const payload = {
      title: trimmedTitle,
      description: formState.description.trim() || undefined,
      status: formState.status,
      priority: formState.priority,
      assignedTo: assignedMembers,
      clientId: selectedClientId,
      client: normalizedClientName || undefined,
      dueDate: formState.dueDate || undefined,
      tags: normalizedTags,
    }

    try {
      const token = await authService.getIdToken()
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const rawBody = await response.text()

      if (!response.ok) {
        let message = 'Unable to create task'
        try {
          const parsed = JSON.parse(rawBody) as { error?: string } | null
          if (parsed?.error) {
            message = parsed.error
          }
        } catch {
          // swallow JSON parse errors and fall back to generic message
        }
        throw new Error(message)
      }

      let createdTask: TaskRecord
      try {
        createdTask = JSON.parse(rawBody) as TaskRecord
      } catch {
        throw new Error('Received an invalid response while creating the task')
      }

      setTasks((previous) => [createdTask, ...previous])
      setError(null)
      handleCreateOpenChange(false)
      toast({
        title: 'Task created',
        description: `Task "${createdTask.title}" has been added.`,
      })
    } catch (taskError: unknown) {
      console.error('Failed to create task', taskError)
      setCreateError(
        taskError instanceof Error ? taskError.message : 'Unexpected error creating task',
      )
    } finally {
      setCreating(false)
    }
  }

  function TaskCard({ task }: { task: TaskRecord }) {
    return (
      <div className="flex flex-col justify-between rounded-md border border-muted/40 bg-background p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-2">{task.title}</h3>
            <Badge variant="secondary" className={statusColors[task.status]}>
              {task.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            {task.client && (
              task.clientId ? (
                <Link href={`/dashboard/clients?clientId=${task.clientId}`}>
                  <Badge variant="outline" className="border-dashed hover:bg-muted cursor-pointer">
                    {task.client}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="border-dashed">
                  {task.client}
                </Badge>
              )
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">{task.description}</p>
          )}
          
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">
                {task.assignedTo.length > 0 ? task.assignedTo.join(', ') : 'Unassigned'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}</span>
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {task.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground">
                  #{tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{task.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-end pt-3 border-t border-muted/40">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            View Details
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Task management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track assignments across teams and clients.
          </p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
          <SheetTrigger asChild>
            <Button onClick={() => setCreateError(null)}>
              <Plus className="mr-2 h-4 w-4" /> New task
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-md px-0">
            <form className="flex h-full flex-col" onSubmit={handleCreateTask}>
              <SheetHeader>
                <SheetTitle>Create task</SheetTitle>
                <SheetDescription>
                  Provide task details, assignments, and scheduling information.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    autoFocus
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="e.g. Prepare Q4 campaign brief"
                    required
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Add context, goals, or next steps"
                    rows={4}
                    disabled={creating}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <Select
                      value={formState.status}
                      onValueChange={(value) =>
                        setFormState((prev) => ({ ...prev, status: value as TaskStatus }))
                      }
                      disabled={creating}
                    >
                      <SelectTrigger id="task-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in-progress">In progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={formState.priority}
                      onValueChange={(value) =>
                        setFormState((prev) => ({ ...prev, priority: value as TaskPriority }))
                      }
                      disabled={creating}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-assigned">Assigned to</Label>
                  <Input
                    id="task-assigned"
                    value={formState.assignedTo}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, assignedTo: event.target.value }))
                    }
                    placeholder="Separate multiple names with commas"
                    disabled={creating}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-client">Client</Label>
                    <Input
                      id="task-client"
                      value={formState.clientName}
                      placeholder="Select a client from the dashboard"
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Switch clients from the main dashboard to change this assignment.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due date</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={formState.dueDate}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, dueDate: event.target.value }))
                      }
                      disabled={creating}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-tags">Tags</Label>
                  <Input
                    id="task-tags"
                    value={formState.tags}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, tags: event.target.value }))
                    }
                    placeholder="Separate tags with commas"
                    disabled={creating}
                  />
                </div>
                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
              </div>
              <SheetFooter className="sm:flex-row-reverse">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create task'}
                </Button>
                <SheetClose asChild>
                  <Button type="button" variant="outline" disabled={creating}>
                    Cancel
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.status} className="border-muted/60 bg-background">
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconClass}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase text-muted-foreground">{card.label}</p>
                <p className="text-lg font-semibold text-foreground">{taskCounts[card.status]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all-tasks" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <TabsList>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border bg-background p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="border-b border-muted/40 pb-4">
            <CardTitle>{activeTab === 'my-tasks' ? 'My Assignments' : 'All Tasks'}</CardTitle>
            <CardDescription>
              {activeTab === 'my-tasks' 
                ? 'Tasks assigned specifically to you.' 
                : 'Search, filter, and monitor active work across the agency.'}
            </CardDescription>
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
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
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
                {activeTab === 'all-tasks' && (
                  <Select value={selectedAssignee} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All assignees</SelectItem>
                      {assigneeOptions.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {(projectFilter.id || projectFilter.name) && (
              <div className="mx-4 mb-3 mt-2 flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
                <span className="font-medium">
                  Showing tasks for {projectFilter.name ?? 'selected project'}
                </span>
                <div className="flex items-center gap-2">
                  {isFeatureEnabled('BIDIRECTIONAL_NAV') && projectFilter.id && (
                    <Button asChild variant="outline" size="sm" className="h-6 text-xs">
                      <Link href={`/dashboard/projects?projectId=${projectFilter.id}&projectName=${encodeURIComponent(projectFilter.name || '')}`}>
                        View Project
                      </Link>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-primary hover:text-primary"
                    onClick={clearProjectFilter}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Clear project filter</span>
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="max-h-[520px]">
              <div className={viewMode === 'grid' ? "grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3" : "divide-y divide-muted/30"}>
                {initialLoading && (
                  <div className={viewMode === 'grid' ? "col-span-full space-y-6 px-6 py-6" : "space-y-6 px-6 py-6"}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex flex-wrap gap-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-10" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!loading && error && (
                  <div className={viewMode === 'grid' ? "col-span-full px-6 py-12 text-center text-sm text-destructive" : "px-6 py-12 text-center text-sm text-destructive"}>{error}</div>
                )}
                {!loading && !error &&
                  filteredTasks.map((task) => (
                    viewMode === 'grid' ? (
                      <TaskCard key={task.id} task={task} />
                    ) : (
                      <div key={task.id} className="px-6 py-4 transition hover:bg-muted/40">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground truncate max-w-[260px] sm:max-w-[360px]">
                                {task.title}
                              </p>
                              <Badge variant="secondary" className={statusColors[task.status]}>
                                {task.status}
                              </Badge>
                              <Badge variant="outline" className={priorityColors[task.priority]}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {task.assignedTo.length > 0 ? task.assignedTo.join(', ') : 'Unassigned'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                              </span>
                              {task.clientId ? (
                                <Link href={`/dashboard/clients?clientId=${task.clientId}`}>
                                  <Badge variant="outline" className="border border-dashed hover:bg-muted cursor-pointer">
                                    {task.client ?? 'Internal'}
                                  </Badge>
                                </Link>
                              ) : (
                                <Badge variant="outline" className="border border-dashed">
                                  {task.client ?? 'Internal'}
                                </Badge>
                              )}
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
                    )
                  ))}
                {!loading && !error && filteredTasks.length > 0 && nextCursor && (
                  <div className={viewMode === 'grid' ? "col-span-full px-6 py-4 text-center" : "px-6 py-4 text-center"}>
                    <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                      {loadingMore ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading…
                        </span>
                      ) : (
                        'Load more tasks'
                      )}
                    </Button>
                  </div>
                )}
                {!loading && !error && filteredTasks.length === 0 && (
                  <div className={viewMode === 'grid' ? "col-span-full px-6 py-12 text-center text-sm text-muted-foreground" : "px-6 py-12 text-center text-sm text-muted-foreground"}>
                    No tasks match the current filters.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'No due date'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
