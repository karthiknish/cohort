'use client';

import { Link } from '@/shared/ui/link';
import { memo } from 'react';
import { ViewTransition } from '@/shared/ui/view-transition';
import { Calendar, LoaderCircle, MessageSquare } from 'lucide-react';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { buildProjectTasksRoute } from '@/lib/project-routes';
import { clickableCardClass, listItemEnterClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '../../collaboration/utils';
import { ProjectActionsMenu } from './project-actions-menu';
import { ProjectTaskProgress } from './project-task-progress';
import {
  STATUS_CLASSES,
  STATUS_ICONS,
  formatDateRange,
  formatStatusLabel,
  isProjectOverdue,
} from '../utils/project-formatters';

export interface ProjectCardProps {
  project: ProjectRecord;
  onDelete: (project: ProjectRecord) => void;
  onEdit: (project: ProjectRecord) => void;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  onViewDetails?: (project: ProjectRecord) => void;
  isPendingUpdate?: boolean;
  compact?: boolean;
  kanban?: boolean;
}

function ProjectCardComponent({
  project,
  onDelete,
  onEdit,
  onUpdateStatus,
  onViewDetails,
  isPendingUpdate,
  compact = false,
  kanban = false,
}: ProjectCardProps) {
  const tasksHref = buildProjectTasksRoute({
    projectId: project.id,
    projectName: project.name,
    clientId: project.clientId,
    clientName: project.clientName,
  });
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`;
  const StatusIcon = STATUS_ICONS[project.status];
  const overdue = isProjectOverdue(project);

  const handleCardClick = () => {
    onViewDetails?.(project);
  };

  return (
    <ViewTransition>
      <article
        className={cn(
          'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-border/30',
          'transition-[border-color,box-shadow,transform] hover:border-primary/20 hover:shadow-md',
          listItemEnterClass,
          clickableCardClass,
          compact ? 'p-3.5' : 'p-5',
          isPendingUpdate && 'pointer-events-none opacity-75',
          onViewDetails && 'cursor-pointer',
        )}
        onClick={onViewDetails ? handleCardClick : undefined}
        role={onViewDetails ? 'button' : undefined}
        tabIndex={onViewDetails ? 0 : undefined}
        onKeyDown={
          onViewDetails
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick();
                }
              }
            : undefined
        }
        aria-label={onViewDetails ? `View details for ${project.name}` : undefined}
      >
        <div
          className={cn(
            'absolute bottom-0 left-0 top-0 w-1 rounded-l-xl',
            project.status === 'active'
              ? 'bg-success'
              : project.status === 'planning'
                ? 'bg-muted-foreground/50'
                : project.status === 'on_hold'
                  ? 'bg-warning'
                  : 'bg-info',
          )}
          aria-hidden
        />

        <div className="space-y-3 px-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    'font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors',
                    compact ? 'text-sm' : 'text-lg',
                  )}
                >
                  {project.name}
                </h3>
                {overdue ? (
                  <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[10px]">
                    Overdue
                  </Badge>
                ) : null}
              </div>
              {project.clientName ? (
                <p className="text-xs text-muted-foreground">
                  {project.clientId ? (
                    <Link
                      href={`/dashboard/clients?clientId=${project.clientId}`}
                      className="font-medium hover:text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.clientName}
                    </Link>
                  ) : (
                    project.clientName
                  )}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="group">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(STATUS_CLASSES[project.status], 'h-6 gap-1 border px-2 py-0')}
                  >
                    {isPendingUpdate ? (
                      <LoaderCircle className="size-3 animate-spin" />
                    ) : (
                      <StatusIcon className="size-3" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {formatStatusLabel(project.status)}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isPendingUpdate
                    ? 'Updating status…'
                    : kanban
                      ? 'Drag the grip to move columns, or use the menu'
                      : 'Use the menu to change status'}
                </TooltipContent>
              </Tooltip>
              <ProjectActionsMenu
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateStatus={onUpdateStatus}
                onViewDetails={onViewDetails}
              />
            </div>
          </div>

          {!compact && project.description ? (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {project.description}
            </p>
          ) : null}

          <ProjectTaskProgress project={project} />

          {!compact ? (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {formatDateRange(project.startDate, project.endDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="size-3.5" />
                {project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : 'No recent chat'}
              </span>
            </div>
          ) : null}

          {project.tags.length > 0 && !compact ? (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="h-5 px-2 text-[10px] font-medium">
                  #{tag}
                </Badge>
              ))}
              {project.tags.length > 3 ? (
                <span className="text-[10px] text-muted-foreground">+{project.tags.length - 3}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className={cn('flex items-center gap-2 border-t border-muted/30 px-2', compact ? 'mt-3 pt-3' : 'mt-4 pt-4')}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="group"
        >
          <Button asChild size="sm" variant="ghost" className="h-8 flex-1 text-xs font-semibold">
            <Link href={tasksHref} prefetch>
              Tasks
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4 opacity-50" />
          <Button asChild size="sm" variant="ghost" className="h-8 flex-1 text-xs font-semibold">
            <Link href={collaborationHref} prefetch>
              Discussion
            </Link>
          </Button>
        </div>
      </article>
    </ViewTransition>
  );
}

export const ProjectCard = Object.assign(ProjectCardComponent, { displayName: 'ProjectCard' });
