'use client';

import { useCallback, useId, useReducer } from 'react';
import { GripVertical } from 'lucide-react';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { PROJECT_STATUSES } from '@/types/projects';
import { Badge } from '@/shared/ui/badge';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ProjectCard } from '../project-card';
import {
  canDragProjectKanbanCard,
  resolveProjectKanbanMoveTarget,
} from '../../utils/project-filters';
import { formatStatusLabel, STATUS_DOT_STYLES } from '../../utils/project-formatters';
import type { ProjectKanbanDragState } from '../../types';

type KanbanAction =
  | { type: 'startDrag'; projectId: string; sourceStatus: ProjectStatus }
  | { type: 'setDragOverStatus'; status: ProjectStatus | null }
  | { type: 'resetDragState' }
  | { type: 'setBoardAnnouncement'; message: string };

const INITIAL_KANBAN_STATE: ProjectKanbanDragState = {
  draggedProjectId: null,
  draggedSourceStatus: null,
  dragOverStatus: null,
  boardAnnouncement: '',
};

function kanbanReducer(state: ProjectKanbanDragState, action: KanbanAction): ProjectKanbanDragState {
  switch (action.type) {
    case 'startDrag':
      return {
        ...state,
        draggedProjectId: action.projectId,
        draggedSourceStatus: action.sourceStatus,
      };
    case 'setDragOverStatus':
      return { ...state, dragOverStatus: action.status };
    case 'resetDragState':
      return { ...state, draggedProjectId: null, draggedSourceStatus: null, dragOverStatus: null };
    case 'setBoardAnnouncement':
      return { ...state, boardAnnouncement: action.message };
    default:
      return state;
  }
}

export interface BoardViewProps {
  projects: ProjectRecord[];
  pendingStatusUpdates: Set<string>;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  onEdit: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
  onViewDetails?: (project: ProjectRecord) => void;
}

export function BoardView({
  projects,
  pendingStatusUpdates,
  onUpdateStatus,
  onEdit,
  onDelete,
  onViewDetails,
}: BoardViewProps) {
  const [state, dispatch] = useReducer(kanbanReducer, INITIAL_KANBAN_STATE);
  const keyboardInstructionsId = useId();

  const columns = PROJECT_STATUSES.map((status) => ({
    status,
    label: formatStatusLabel(status),
    items: projects.filter((project) => project.status === status),
  }));

  const handleDragStart = useCallback(
    (event: React.DragEvent, project: ProjectRecord) => {
      if (!canDragProjectKanbanCard(project, pendingStatusUpdates)) return;
      dispatch({
        type: 'startDrag',
        projectId: project.id,
        sourceStatus: project.status,
      });
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', project.id);
    },
    [pendingStatusUpdates],
  );

  const handleDragOver = (event: React.DragEvent, status: ProjectStatus) => {
    if (!state.draggedProjectId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (state.dragOverStatus !== status) {
      dispatch({ type: 'setDragOverStatus', status });
    }
  };

  const handleDragLeave = () => {
    dispatch({ type: 'setDragOverStatus', status: null });
  };

  const handleDrop = (event: React.DragEvent, targetStatus: ProjectStatus) => {
    event.preventDefault();
    dispatch({ type: 'setDragOverStatus', status: null });
    if (!state.draggedProjectId) return;
    const project = projects.find((entry) => entry.id === state.draggedProjectId);
    if (
      project &&
      state.draggedSourceStatus !== targetStatus &&
      canDragProjectKanbanCard(project, pendingStatusUpdates)
    ) {
      dispatch({
        type: 'setBoardAnnouncement',
        message: `${project.name} moved to ${formatStatusLabel(targetStatus)}.`,
      });
      void onUpdateStatus(project, targetStatus);
    }
    dispatch({ type: 'resetDragState' });
  };

  const handleKeyboardMoveProject = (project: ProjectRecord, direction: 'previous' | 'next') => {
    if (!canDragProjectKanbanCard(project, pendingStatusUpdates)) return;
    const targetStatus = resolveProjectKanbanMoveTarget(project.status, direction);
    if (!targetStatus) {
      dispatch({
        type: 'setBoardAnnouncement',
        message: `${project.name} is already in the ${formatStatusLabel(project.status)} column.`,
      });
      return;
    }
    dispatch({
      type: 'setBoardAnnouncement',
      message: `${project.name} moved to ${formatStatusLabel(targetStatus)}.`,
    });
    void onUpdateStatus(project, targetStatus);
  };

  const handleDragEnd = () => {
    dispatch({ type: 'resetDragState' });
  };

  return (
    <div className="space-y-3 py-2">
      <LiveRegion message={state.boardAnnouncement} />
      <p id={keyboardInstructionsId} className="sr-only">
        Use Alt plus Left Arrow or Alt plus Right Arrow on a project card grip to move it between status
        columns. You can also drag projects by the grip handle. Status updates save when you drop a card in
        another column.
      </p>
      <p className="px-1 text-xs text-muted-foreground">
        Drag the <span className="font-medium text-primary/70">grip handle</span> to move projects between
        columns, or use <kbd className="rounded border border-border/60 bg-muted/40 px-1 text-[10px] font-medium">Alt</kbd> +{' '}
        <kbd className="rounded border border-border/60 bg-muted/40 px-1 text-[10px] font-medium">←/→</kbd> on a card.
      </p>
      <ScrollArea className="w-full">
        <div className="flex min-h-[28rem] w-full gap-4 pb-4 pr-2">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              dragState={state}
              handleDragEnd={handleDragEnd}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              keyboardInstructionsId={keyboardInstructionsId}
              onDelete={onDelete}
              onEdit={onEdit}
              onKeyboardMoveProject={handleKeyboardMoveProject}
              onUpdateStatus={onUpdateStatus}
              onViewDetails={onViewDetails}
              pendingStatusUpdates={pendingStatusUpdates}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function KanbanColumn({
  column,
  dragState,
  handleDragEnd,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleDragStart,
  keyboardInstructionsId,
  onDelete,
  onEdit,
  onKeyboardMoveProject,
  onUpdateStatus,
  onViewDetails,
  pendingStatusUpdates,
}: {
  column: { status: ProjectStatus; label: string; items: ProjectRecord[] };
  dragState: ProjectKanbanDragState;
  handleDragEnd: () => void;
  handleDragLeave: () => void;
  handleDragOver: (event: React.DragEvent, status: ProjectStatus) => void;
  handleDrop: (event: React.DragEvent, status: ProjectStatus) => void;
  handleDragStart: (event: React.DragEvent, project: ProjectRecord) => void;
  keyboardInstructionsId: string;
  onDelete: (project: ProjectRecord) => void;
  onEdit: (project: ProjectRecord) => void;
  onKeyboardMoveProject: (project: ProjectRecord, direction: 'previous' | 'next') => void;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  onViewDetails?: (project: ProjectRecord) => void;
  pendingStatusUpdates: Set<string>;
}) {
  const isDragTarget = dragState.dragOverStatus === column.status;
  const isDraggingFrom = dragState.draggedSourceStatus === column.status;
  const handleColumnDragOver = (event: React.DragEvent<HTMLDivElement>) =>
    handleDragOver(event, column.status);
  const handleColumnDrop = (event: React.DragEvent<HTMLDivElement>) => handleDrop(event, column.status);

  return (
    <section
      aria-label={`${column.label} projects`}
      className={cn(
        'flex min-w-[17.5rem] max-w-[22rem] flex-1 flex-col rounded-xl border border-border/60 bg-muted/15 shadow-sm transition-colors',
        isDragTarget && 'border-primary/30 bg-primary/5 ring-1 ring-primary/15',
        isDraggingFrom && !isDragTarget && 'opacity-60',
      )}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleColumnDrop}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-2.5 rounded-full shadow-sm" style={STATUS_DOT_STYLES[column.status]} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {column.label}
          </span>
        </div>
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold tabular-nums">
          {column.items.length}
        </Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <ul className="list-none space-y-3 p-3">
          {column.items.length === 0 ? (
            <li
              className={cn(
                'flex min-h-24 list-none flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 p-4 text-center',
                isDragTarget && 'border-primary/35 bg-primary/5',
              )}
            >
              {dragState.draggedProjectId ? (
                <>
                  <GripVertical className="mb-1.5 size-5 text-muted-foreground" aria-hidden />
                  <p className="text-xs font-medium text-muted-foreground">Drop to move here</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-muted-foreground">Empty column</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                    Drag a project here or use the card menu
                  </p>
                </>
              )}
            </li>
          ) : (
            <>
              {column.items.map((project) => (
                <KanbanProjectItem
                  key={project.id}
                  dragState={dragState}
                  handleDragEnd={handleDragEnd}
                  handleDragStart={handleDragStart}
                  keyboardInstructionsId={keyboardInstructionsId}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onKeyboardMoveProject={onKeyboardMoveProject}
                  onUpdateStatus={onUpdateStatus}
                  onViewDetails={onViewDetails}
                  pending={pendingStatusUpdates.has(project.id)}
                  project={project}
                  reorderEnabled={canDragProjectKanbanCard(project, pendingStatusUpdates)}
                />
              ))}
              {dragState.draggedProjectId ? (
                <li
                  className={cn(
                    'flex min-h-16 list-none flex-col items-center justify-center rounded-lg border border-dashed p-3 text-center transition-colors',
                    isDragTarget
                      ? 'border-primary/35 bg-primary/5'
                      : 'border-border/40 bg-background/40',
                  )}
                >
                  <GripVertical className="mb-1 size-4 text-muted-foreground" aria-hidden />
                  <p className="text-xs font-medium text-muted-foreground">Drop to move here</p>
                </li>
              ) : null}
            </>
          )}
        </ul>
      </ScrollArea>
    </section>
  );
}

function KanbanProjectItem({
  dragState,
  handleDragEnd,
  handleDragStart,
  keyboardInstructionsId,
  onDelete,
  onEdit,
  onKeyboardMoveProject,
  onUpdateStatus,
  onViewDetails,
  pending,
  project,
  reorderEnabled,
}: {
  dragState: ProjectKanbanDragState;
  handleDragEnd: () => void;
  handleDragStart: (event: React.DragEvent, project: ProjectRecord) => void;
  keyboardInstructionsId: string;
  onDelete: (project: ProjectRecord) => void;
  onEdit: (project: ProjectRecord) => void;
  onKeyboardMoveProject: (project: ProjectRecord, direction: 'previous' | 'next') => void;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  onViewDetails?: (project: ProjectRecord) => void;
  pending: boolean;
  project: ProjectRecord;
  reorderEnabled: boolean;
}) {
  const isDragging = dragState.draggedProjectId === project.id;
  const onGripDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    handleDragStart(event, project);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!event.altKey) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onKeyboardMoveProject(project, 'previous');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onKeyboardMoveProject(project, 'next');
    }
  };
  return (
    <li className={cn('list-none', isDragging && 'opacity-40')}>
      <div className="flex items-start gap-1.5">
        {reorderEnabled ? (
          <button
            type="button"
            className="mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-border/60 bg-primary/8 text-primary/70 transition-colors hover:bg-primary/15 hover:text-primary active:cursor-grabbing"
            aria-label={`Move ${project.name} to another status column`}
            aria-describedby={keyboardInstructionsId}
            aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
            aria-grabbed={isDragging}
            draggable
            onDragStart={onGripDragStart}
            onDragEnd={handleDragEnd}
            onKeyDown={handleKeyDown}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        ) : null}
        <div className={cn('min-w-0 flex-1 motion-chromatic', reorderEnabled && 'active:scale-[0.99]')}>
          <ProjectCard
            project={project}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateStatus={onUpdateStatus}
            onViewDetails={onViewDetails}
            isPendingUpdate={pending}
            compact
            kanban
          />
        </div>
      </div>
    </li>
  );
}
