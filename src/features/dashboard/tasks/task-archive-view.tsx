'use client'

import { useCallback, useMemo } from 'react'
import { Archive, RotateCcw, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { TaskRecord } from '@/types/tasks'
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

  const handleRestore = useCallback((task: TaskRecord) => {
    onRestore?.(task)
  }, [onRestore])

  const handleDelete = useCallback((task: TaskRecord) => {
    onPermanentlyDelete?.(task)
  }, [onPermanentlyDelete])

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
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
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
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-destructive" />
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
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-info" />
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
              These tasks are archived and will not appear in your main task list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {archivedTasks.map((task) => (
                  <ArchivedTaskRow
                    key={task.id}
                    task={task}
                    onRestore={onRestore ? handleRestore : undefined}
                    onPermanentlyDelete={onPermanentlyDelete ? handleDelete : undefined}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ArchivedTaskRow({
  task,
  onRestore,
  onPermanentlyDelete,
}: {
  task: TaskRecord
  onRestore?: (task: TaskRecord) => void
  onPermanentlyDelete?: (task: TaskRecord) => void
}) {
  const handleRestoreClick = useCallback(() => {
    onRestore?.(task)
  }, [onRestore, task])

  const handleDeleteClick = useCallback(() => {
    onPermanentlyDelete?.(task)
  }, [onPermanentlyDelete, task])

  return (
    <div className="flex items-center justify-between rounded-lg border border-muted/40 bg-background/50 p-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium">{task.title}</h4>
          <Badge variant="outline" className="text-[10px]">
            {formatStatusLabel(task.status)}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Due: {task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
          {task.deletedAt ? <span>Archived {formatRelativeTime(new Date(task.deletedAt))}</span> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRestore ? (
          <Button variant="ghost" size="sm" onClick={handleRestoreClick} className="h-8 gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </Button>
        ) : null}
        {onPermanentlyDelete ? (
          <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="h-8 gap-1 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        ) : null}
      </div>
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
        className={cn('h-8 gap-1 text-warning hover:text-warning/80', className)}
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
