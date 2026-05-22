'use client'

import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import {
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { buildProjectTasksRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { STATUS_ACCENT_COLORS, formatStatusLabel } from './utils'

export type ProjectActionsMenuProps = {
  project: ProjectRecord
  onEdit: (project: ProjectRecord) => void
  onDelete: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  triggerClassName?: string
  align?: 'start' | 'end'
  showEditItem?: boolean
}

export function ProjectActionsMenu({
  project,
  onEdit,
  onDelete,
  onUpdateStatus,
  triggerClassName,
  align = 'end',
  showEditItem = true,
}: ProjectActionsMenuProps) {
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
        PROJECT_STATUSES.flatMap((status) =>
          status !== project.status
            ? [[status, () => onUpdateStatus(project, status)] as const]
            : [],
        ),
      ) as Partial<Record<ProjectStatus, () => void>>,
    [onUpdateStatus, project],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-8 text-muted-foreground/60 hover:text-foreground', triggerClassName)}
          aria-label={`Actions for ${project.name}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52">
        {showEditItem ? (
          <DropdownMenuItem onClick={handleEdit} className="gap-2">
            <Pencil className="size-4" />
            <span>Edit project</span>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href={createTaskHref} prefetch>
            <Plus className="size-4" />
            <span>Create task</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href={tasksHref} prefetch>
            <ListChecks className="size-4" />
            <span>View tasks</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href={collaborationHref} prefetch>
            <MessageSquare className="size-4" />
            <span>Open discussion</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Update status
          </span>
        </div>
        {PROJECT_STATUSES.flatMap((status) =>
          status !== project.status
            ? [(
          <DropdownMenuItem key={status} onClick={statusUpdateHandlers[status]} className="gap-2">
            <div className="size-2 rounded-full" style={statusAccentStyles[status]} />
            <span>{formatStatusLabel(status)}</span>
          </DropdownMenuItem>
        )]
            : [],
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleDelete}>
          <Trash2 className="size-4" />
          <span>Delete project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
