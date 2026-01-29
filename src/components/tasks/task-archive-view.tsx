'use client'

import { useMemo } from 'react'
import { Archive, RotateCcw, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatRelativeTime } from '@/lib/utils'
import { TaskRecord } from '@/types/tasks'
import { formatDate, formatStatusLabel } from './task-types'

type TaskArchiveViewProps = {
  archivedTasks: TaskRecord[]
  onRestore?: (task: TaskRecord) => void
  onPermanentlyDelete?: (task: TaskRecord) => void
  loading?: boolean
}

export function TaskArchiveView({
  archivedTasks,
  onRestore,
  onPermanentlyDelete,
  loading = false,
}: TaskArchiveViewProps) {
  // Statistics
  const stats = useMemo(() => {
    const byStatus = archivedTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = archivedTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { byStatus, byPriority, total: archivedTasks.length }
  }, [archivedTasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading archive...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20">
            <Archive className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Archived Tasks</h2>
            <p className="text-sm text-muted-foreground">
              {stats.total} {stats.total === 1 ? 'task' : 'tasks'} in archive
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center">
                <Archive className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byStatus.completed || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byPriority.urgent || 0}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byPriority.high || 0}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archived Tasks List */}
      {archivedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">No archived tasks yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Tasks you archive will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Archived Tasks</CardTitle>
            <CardDescription>
              These tasks are archived and won't appear in your main task list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-muted/40 bg-background/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        <Badge variant="outline" className="text-[10px]">
                          {formatStatusLabel(task.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Due: {task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
                        {task.deletedAt && (
                          <span>Archived {formatRelativeTime(new Date(task.deletedAt))}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onRestore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore(task)}
                          className="h-8 gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                      )}
                      {onPermanentlyDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPermanentlyDelete(task)}
                          className="h-8 gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Archive toggle for task cards
export function ArchiveToggle({
  isArchived,
  onArchive,
  onUnarchive,
  className,
}: {
  isArchived: boolean
  onArchive?: () => void
  onUnarchive?: () => void
  className?: string
}) {
  if (isArchived) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onUnarchive}
        className={cn('h-8 gap-1 text-amber-600 hover:text-amber-700', className)}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Unarchive
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onArchive}
      className={cn('h-8 gap-1 text-muted-foreground hover:text-foreground', className)}
    >
      <Archive className="h-3.5 w-3.5" />
      Archive
    </Button>
  )
}
