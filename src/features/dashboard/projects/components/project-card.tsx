'use client'

import Link from 'next/link'
import { memo, useCallback, useMemo, ViewTransition } from 'react'
import {
  ListChecks,
  LoaderCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Separator } from '@/shared/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { buildProjectTasksRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '../../collaboration/utils'
import { STATUS_CLASSES, STATUS_ICONS, formatStatusLabel, STATUS_ACCENT_COLORS } from './utils'

export interface ProjectCardProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}

function ProjectCardComponent({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: ProjectCardProps) {
  const tasksHref = buildProjectTasksRoute({
    projectId: project.id,
    projectName: project.name,
    clientId: project.clientId,
    clientName: project.clientName,
  })
  const createTaskHref = buildProjectTasksRoute({
    projectId: project.id,
    projectName: project.name,
    clientId: project.clientId,
    clientName: project.clientName,
    action: 'create',
  })
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  const handleEdit = useCallback(() => onEdit(project), [onEdit, project])
  const handleDelete = useCallback(() => onDelete(project), [onDelete, project])
  const statusAccentStyles = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(STATUS_ACCENT_COLORS).map(([status, backgroundColor]) => [status, { backgroundColor }]),
      ) as Record<ProjectStatus, { backgroundColor: string }>,
    [],
  )

  const statusUpdateHandlers = useMemo(
    () =>
      Object.fromEntries(
        PROJECT_STATUSES.filter((status) => status !== project.status).map((status) => [
          status,
          () => onUpdateStatus(project, status),
        ]),
      ) as Partial<Record<ProjectStatus, () => void>>,
    [onUpdateStatus, project],
  )

  return (
    <ViewTransition>
      <div className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-muted/40 bg-background p-5 shadow-sm motion-chromatic hover:border-primary/40 hover:shadow-md dark:hover:bg-muted/10",
        isPendingUpdate && "opacity-75 pointer-events-none"
      )}>
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity group-hover:opacity-100",
          project.status === 'active' ? 'bg-success' :
            project.status === 'planning' ? 'bg-muted-foreground/60' :
              project.status === 'on_hold' ? 'bg-warning' : 'bg-info'
        )}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.clientName && (
              <div className="flex items-center gap-1.5">
                {project.clientId ? (
                  <Link href={`/dashboard/clients?clientId=${project.clientId}`} className="text-xs font-semibold text-muted-foreground/70 hover:text-primary hover:underline transition-colors flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {project.clientName}
                  </Link>
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground/70 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {project.clientName}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    STATUS_CLASSES[project.status],
                    "h-6 border px-2 py-0 cursor-pointer motion-chromatic hover:opacity-90 gap-1.5"
                  )}
                >
                  {isPendingUpdate ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {formatStatusLabel(project.status)}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-medium">
                {isPendingUpdate ? 'Updating status...' : 'Manage project status'}
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground" aria-label="Project actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link href={createTaskHref} prefetch>
                    <Plus className="h-4 w-4" />
                    <span>Create Task</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Update Status
                  </span>
                </div>
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={statusUpdateHandlers[status]} className="gap-2">
                    <div className="h-2 w-2 rounded-full" style={statusAccentStyles[status]} />
                    <span>{formatStatusLabel(status)}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {project.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 pt-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-success/10 text-success">
                <ListChecks className="h-3.5 w-3.5" />
              </div>
              <span>{project.openTaskCount} active tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-info/10 text-info">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <span className="tabular-nums">
                {project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : 'No recent chat'}
              </span>
            </div>
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-4.5 bg-muted/40 text-muted-foreground/70 font-medium">
                #{tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] font-bold text-muted-foreground/40">+{project.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2.5 pt-4 border-t border-muted/30">
        <Button asChild size="sm" variant="ghost" className="flex-1 h-9 text-xs font-bold uppercase tracking-wider hover:bg-primary/5 hover:text-primary motion-chromatic">
          <Link href={tasksHref} prefetch>
            Tasks
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4 opacity-50" />
        <Button asChild size="sm" variant="ghost" className="flex-1 h-9 text-xs font-bold uppercase tracking-wider hover:bg-primary/5 hover:text-primary motion-chromatic">
          <Link href={collaborationHref} prefetch>
            Discussion
          </Link>
        </Button>
      </div>
      </div>
    </ViewTransition>
  )
}

export const ProjectCard = memo(ProjectCardComponent)
ProjectCard.displayName = 'ProjectCard'
