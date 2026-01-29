'use client'

import { useState } from 'react'
import { Link2, Unlink, Plus, ChevronRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { TaskRecord, TaskDependency } from '@/types/tasks'

type TaskDependencyManagerProps = {
  task: TaskRecord
  allTasks: TaskRecord[]
  onUpdateDependencies: (dependencies: TaskDependency[]) => void
  readonly?: boolean
}

const DEPENDENCY_TYPE_LABELS: Record<TaskDependency['type'], string> = {
  blocks: 'Blocks',
  'blocked-by': 'Blocked by',
  related: 'Related to',
  parent: 'Parent of',
  child: 'Subtask of',
}

const DEPENDENCY_TYPE_COLORS: Record<TaskDependency['type'], string> = {
  blocks: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  'blocked-by': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  related: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  parent: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  child: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
}

function DependencyLink({ task, type, onRemove, readonly }: {
  task: TaskRecord
  type: TaskDependency['type']
  onRemove?: () => void
  readonly?: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/40 border border-border group">
      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-sm truncate font-medium">{task.title}</span>
      <Badge
        variant="outline"
        className={cn('text-[10px] shrink-0', DEPENDENCY_TYPE_COLORS[type])}
      >
        {DEPENDENCY_TYPE_LABELS[type]}
      </Badge>
      {!readonly && onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <Unlink className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export function TaskDependencyManager({
  task,
  allTasks,
  onUpdateDependencies,
  readonly = false,
}: TaskDependencyManagerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<TaskDependency['type']>('related')

  // Get linked tasks
  const linkedTasks = (task.dependencies || []).map(dep => {
    const linkedTask = allTasks.find(t => t.id === dep.taskId)
    return { ...dep, task: linkedTask }
  }).filter(dep => dep.task)

  // Available tasks to link (exclude current task and already linked)
  const linkedTaskIds = new Set((task.dependencies || []).map(d => d.taskId))
  const availableTasks = allTasks.filter(
    t => t.id !== task.id && !linkedTaskIds.has(t.id)
  )

  // Filter by search
  const filteredTasks = searchQuery
    ? availableTasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableTasks

  const handleLinkTask = (targetTaskId: string) => {
    const newDependency: TaskDependency = {
      taskId: targetTaskId,
      type: selectedType,
    }
    onUpdateDependencies([...(task.dependencies || []), newDependency])
    setSearchQuery('')
  }

  const handleUnlinkTask = (taskId: string) => {
    onUpdateDependencies((task.dependencies || []).filter(d => d.taskId !== taskId))
  }

  // Check for circular dependencies
  const hasCircularDependency = (task.dependencies || []).some(dep => {
    if (dep.type === 'parent' || dep.type === 'child') {
      const linkedTask = allTasks.find(t => t.id === dep.taskId)
      return linkedTask?.parentId === task.id
    }
    return false
  })

  return (
    <div className="space-y-3">
      {/* Linked tasks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Dependencies</h4>
          {!readonly && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <Plus className="h-3 w-3" />
                  Link Task
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold">Link a task</h5>

                  {/* Dependency type selector */}
                  <Select value={selectedType} onValueChange={(v) => setSelectedType(v as TaskDependency['type'])}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blocks">Blocks (this task blocks another)</SelectItem>
                      <SelectItem value="blocked-by">Blocked by (this task is blocked by another)</SelectItem>
                      <SelectItem value="related">Related to</SelectItem>
                      <SelectItem value="parent">Parent of (creates subtask)</SelectItem>
                      <SelectItem value="child">Subtask of (creates parent)</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search input */}
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />

                  {/* Task list */}
                  <ScrollArea className="h-48">
                    <div className="space-y-1 pr-2">
                      {filteredTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          {searchQuery ? 'No matching tasks' : 'No tasks available'}
                        </p>
                      ) : (
                        filteredTasks.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleLinkTask(t.id)}
                            className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <p className="text-sm font-medium truncate">{t.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {t.client && `${t.client} • `}
                              {t.status}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {hasCircularDependency && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Circular dependency detected</span>
          </div>
        )}

        {linkedTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No dependencies. Link tasks to show relationships.
          </p>
        ) : (
          <div className="space-y-2">
            {linkedTasks.map((dep) => dep.task && (
              <DependencyLink
                key={dep.taskId}
                task={dep.task}
                type={dep.type}
                onRemove={readonly ? undefined : () => handleUnlinkTask(dep.taskId)}
                readonly={readonly}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dependency tree visualization */}
      {linkedTasks.length > 0 && (
        <div className="border-t border-muted pt-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Dependency Map
          </h5>
          <div className="text-sm space-y-1">
            {linkedTasks
              .filter(dep => dep.type === 'child')
              .map((dep) => dep.task && (
                <div key={dep.taskId} className="flex items-center gap-1 text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{dep.task.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Subtask inline creation
export function SubtaskCreator({
  onCreateSubtask,
  parentId,
}: {
  onCreateSubtask: (title: string, parentId: string) => void
  parentId: string
}) {
  const [title, setTitle] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onCreateSubtask(title.trim(), parentId)
      setTitle('')
      setIsExpanded(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        <Plus className="h-4 w-4" />
        Add subtask
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Subtask title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 text-sm"
        autoFocus
      />
      <Button type="submit" size="sm" className="h-8">
        Add
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(false)}
        className="h-8"
      >
        Cancel
      </Button>
    </form>
  )
}
