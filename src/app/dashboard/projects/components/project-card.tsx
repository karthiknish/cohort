'use client'

import Link from 'next/link'
import {
  ListChecks,
  LoaderCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '../../collaboration/utils'
import { STATUS_CLASSES, STATUS_ICONS, formatStatusLabel } from './utils'

export interface ProjectCardProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}

export function ProjectCard({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: ProjectCardProps) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  return (
    <div className={cn(
      "flex flex-col justify-between rounded-md border border-muted/40 bg-background p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md",
      isPendingUpdate && "opacity-75 pointer-events-none"
    )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className={cn(STATUS_CLASSES[project.status], "gap-1")}>
                  {isPendingUpdate ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  {formatStatusLabel(project.status)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {isPendingUpdate ? 'Updating status...' : 'Click menu to change status'}
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs font-medium text-muted-foreground" disabled>
                  Change status
                </DropdownMenuItem>
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onUpdateStatus(project, status)}>
                    {formatStatusLabel(status)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {project.clientName && (
          project.clientId ? (
            <Link href={`/dashboard/clients?clientId=${project.clientId}`} className="hover:underline">
              <p className="text-xs font-medium text-muted-foreground">{project.clientName}</p>
            </Link>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">{project.clientName}</p>
          )
        )}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{project.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            <span>{project.openTaskCount} open tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : 'No activity'}</span>
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{project.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-muted/40">
        <Button asChild size="sm" variant="ghost" className="flex-1 h-8 text-xs">
          <Link href={tasksHref} prefetch>
            Tasks
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button asChild size="sm" variant="ghost" className="flex-1 h-8 text-xs">
          <Link href={collaborationHref} prefetch>
            Chat
          </Link>
        </Button>
      </div>
    </div>
  )
}
