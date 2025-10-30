'use client'

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
import { TaskRecord, TaskPriority, TaskStatus } from '@/types/tasks'
import { authService } from '@/services/auth'

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
  const { user, loading: authLoading } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formState, setFormState] = useState<TaskFormState>(() => buildInitialFormState(selectedClient ?? undefined))
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setFormState(buildInitialFormState(selectedClient ?? undefined))
    setCreateError(null)
  }, [selectedClient])

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
      setLoading(false)
      return
    }

    if (!selectedClientId) {
      setTasks([])
      setLoading(false)
      return
    }

    let cancelled = false

    const loadTasks = async () => {
      setLoading(true)
      setError(null)
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

        const data = (await response.json()) as TaskRecord[]
        if (!cancelled) {
          setTasks(Array.isArray(data) ? data : [])
        }
      } catch (fetchError: unknown) {
        console.error('Failed to fetch tasks', fetchError)
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error loading tasks')
          setTasks([])
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

  const filteredTasks = useMemo(() => {
    return tasksForClient.filter((task) => {
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
      const title = task.title.toLowerCase()
      const description = (task.description ?? '').toLowerCase()
      const query = searchQuery.toLowerCase()
      const matchesSearch = title.includes(query) || description.includes(query)
      const matchesAssignee =
        selectedAssignee === 'all' ||
        task.assignedTo.some((assignee) => assignee.toLowerCase().includes(selectedAssignee.toLowerCase()))

      return matchesStatus && matchesSearch && matchesAssignee
    })
  }, [tasksForClient, selectedStatus, searchQuery, selectedAssignee])

  const taskCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0,
    }

    tasksForClient.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1
    })

    return counts
  }, [tasksForClient])

  const assigneeOptions = useMemo(() => {
    const options = new Set<string>()
    tasksForClient.forEach((task) => {
      task.assignedTo.forEach((member) => {
        if (member && member.trim().length > 0) {
          options.add(member)
        }
      })
    })
    return Array.from(options).sort((a, b) => a.localeCompare(b))
  }, [tasksForClient])

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
            </div>
          </div>

          <ScrollArea className="max-h-[520px]">
            <div className="divide-y divide-muted/30">
              {loading && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading tasks…</div>
              )}
              {!loading && error && (
                <div className="px-6 py-12 text-center text-sm text-destructive">{error}</div>
              )}
              {!loading && !error &&
                filteredTasks.map((task) => (
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
                          <Badge variant="outline" className="border border-dashed">
                            {task.client ?? 'Internal'}
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
              {!loading && !error && filteredTasks.length === 0 && (
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
