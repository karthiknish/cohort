'use client'

import Link from 'next/link'
import {
  Calendar,
  ListChecks,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '../../collaboration/utils'
import { STATUS_CLASSES, STATUS_ICONS, formatStatusLabel, formatTaskSummary, formatDateRange, formatDate } from './utils'

export interface ProjectRowProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}

export function ProjectRow({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: ProjectRowProps) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  return (
    <div className={cn(
      "rounded-md border border-muted/40 bg-background p-4 shadow-sm transition-all",
      isPendingUpdate && "opacity-75 pointer-events-none"
    )}>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge variant="secondary" className={cn(STATUS_CLASSES[project.status], "cursor-pointer hover:opacity-80 gap-1")}>
                  {isPendingUpdate ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  {formatStatusLabel(project.status)}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="text-xs font-medium text-muted-foreground" disabled>
                  Change status
                </DropdownMenuItem>
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onUpdateStatus(project, status)}>
                    {formatStatusLabel(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {project.clientName ? (
              project.clientId ? (
                <Link href={`/dashboard/clients?clientId=${project.clientId}`}>
                  <Badge variant="outline" className="border-dashed hover:bg-muted cursor-pointer">
                    {project.clientName}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="border-dashed">
                  {project.clientName}
                </Badge>
              )
            ) : null}
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              {formatTaskSummary(project.openTaskCount, project.taskCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(project.startDate, project.endDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {project.recentActivityAt ? `Updated ${formatRelativeTime(project.recentActivityAt)}` : 'No recent activity'}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="inline-flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3 text-xs text-muted-foreground">
          <div className="text-right">
            <p>Created {formatDate(project.createdAt)}</p>
            <p>Updated {formatDate(project.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => onEdit(project)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={tasksHref} prefetch>
                <ListChecks className="h-4 w-4" />
                View tasks
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={collaborationHref} prefetch>
                <MessageSquare className="h-4 w-4" />
                Open discussion
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
