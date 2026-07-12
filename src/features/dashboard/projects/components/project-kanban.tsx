'use client';
import { useCallback, useId, useMemo, useReducer } from 'react';
import { GripVertical } from 'lucide-react';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { PROJECT_STATUSES } from '@/types/projects';
import { Badge } from '@/shared/ui/badge';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ProjectCard } from './project-card';
import { canDragProjectKanbanCard, INITIAL_PROJECT_KANBAN_STATE, projectKanbanReducer, resolveProjectKanbanMoveTarget, type DraggedProject, } from './project-kanban-logic';
import { formatStatusLabel, STATUS_DOT_STYLES } from './utils';

export interface ProjectKanbanProps {
    projects: ProjectRecord[];
    pendingStatusUpdates: Set<string>;
    onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
    onEdit: (project: ProjectRecord) => void;
    onDelete: (project: ProjectRecord) => void;
}

export function ProjectKanban({ projects, pendingStatusUpdates, onUpdateStatus, onEdit, onDelete, }: ProjectKanbanProps) {
    const [{ draggedProject, dragOverStatus, boardAnnouncement }, dispatch] = useReducer(projectKanbanReducer, INITIAL_PROJECT_KANBAN_STATE);
    const keyboardInstructionsId = useId();
    const columns = useMemo(() => PROJECT_STATUSES.map((status) => ({
        status,
        label: formatStatusLabel(status),
        items: projects.filter((project) => project.status === status),
    })), [projects]);
    const handleDragStart = useCallback((event: React.DragEvent, project: ProjectRecord) => {
        if (!canDragProjectKanbanCard(project, pendingStatusUpdates))
            return;
        dispatch({
            type: 'startDrag',
            draggedProject: { id: project.id, sourceStatus: project.status },
        });
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', project.id);
    }, [pendingStatusUpdates]);
    const handleDragOver = useCallback((event: React.DragEvent, status: ProjectStatus) => {
        if (!draggedProject)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        dispatch({ type: 'setDragOverStatus', status });
    }, [draggedProject]);
    const handleDragLeave = useCallback(() => {
        dispatch({ type: 'setDragOverStatus', status: null });
    }, []);
    const handleDrop = useCallback((event: React.DragEvent, targetStatus: ProjectStatus) => {
        event.preventDefault();
        dispatch({ type: 'setDragOverStatus', status: null });
        if (!draggedProject)
            return;
        const project = projects.find((entry) => entry.id === draggedProject.id);
        if (project &&
            draggedProject.sourceStatus !== targetStatus &&
            canDragProjectKanbanCard(project, pendingStatusUpdates)) {
            dispatch({
                type: 'setBoardAnnouncement',
                message: `${project.name} moved to ${formatStatusLabel(targetStatus)}.`,
            });
            void onUpdateStatus(project, targetStatus);
        }
        dispatch({ type: 'resetDragState' });
    }, [draggedProject, projects, pendingStatusUpdates, onUpdateStatus]);
    const handleKeyboardMoveProject = useCallback((project: ProjectRecord, direction: 'previous' | 'next') => {
        if (!canDragProjectKanbanCard(project, pendingStatusUpdates))
            return;
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
    }, [pendingStatusUpdates, onUpdateStatus]);
    const handleDragEnd = useCallback(() => {
        dispatch({ type: 'resetDragState' });
    }, []);
    return (<div className="space-y-3 py-2">
      <LiveRegion message={boardAnnouncement}/>
      <p id={keyboardInstructionsId} className="sr-only">
        Use Alt plus Left Arrow or Alt plus Right Arrow on a project card grip to move it between status
        columns. You can also drag projects by the grip handle. Status updates save when you drop a card in
        another column.
      </p>
      <p className="px-1 text-xs text-muted-foreground">
        Drag projects between columns to update status. Use the grip handle so card links and menus stay
        clickable.
      </p>
      <ScrollArea className="w-full">
        <div className="flex min-h-[28rem] w-full gap-4 pb-4 pr-2">
          {columns.map((column) => (<ProjectKanbanColumn key={column.status} column={column} dragOverStatus={dragOverStatus} draggedProject={draggedProject} handleDragEnd={handleDragEnd} handleDragLeave={handleDragLeave} handleDragOver={handleDragOver} handleDrop={handleDrop} handleDragStart={handleDragStart} keyboardInstructionsId={keyboardInstructionsId} onDelete={onDelete} onEdit={onEdit} onKeyboardMoveProject={handleKeyboardMoveProject} onUpdateStatus={onUpdateStatus} pendingStatusUpdates={pendingStatusUpdates}/>))}
        </div>
      </ScrollArea>
    </div>);
}

function ProjectKanbanColumn({ column, dragOverStatus, draggedProject, handleDragEnd, handleDragLeave, handleDragOver, handleDrop, handleDragStart, keyboardInstructionsId, onDelete, onEdit, onKeyboardMoveProject, onUpdateStatus, pendingStatusUpdates, }: {
    column: {
        status: ProjectStatus;
        label: string;
        items: ProjectRecord[];
    };
    dragOverStatus: ProjectStatus | null;
    draggedProject: DraggedProject | null;
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
    pendingStatusUpdates: Set<string>;
}) {
    const handleDragOverColumn = useCallback((event: React.DragEvent) => {
        handleDragOver(event, column.status);
    }, [handleDragOver, column.status]);
    const handleDropColumn = useCallback((event: React.DragEvent) => {
        handleDrop(event, column.status);
    }, [handleDrop, column.status]);
    const isActive = dragOverStatus === column.status;
    return (<div className={cn('flex min-h-[28rem] w-72 shrink-0 flex-col rounded-lg border bg-muted/20 p-3 transition-colors', isActive ? 'border-primary/50 bg-primary/5' : 'border-border/60')}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={STATUS_DOT_STYLES[column.status]}/>
          <span className="text-sm font-semibold text-foreground">{column.label}</span>
          <Badge variant="secondary" className="h-5 text-[11px] font-medium">
            {column.items.length}
          </Badge>
        </div>
      </div>
      <div className="flex-1 space-y-2" onDragOver={handleDragOverColumn} onDragLeave={handleDragLeave} onDrop={handleDropColumn}>
        {column.items.length === 0 ? (<div className={cn('flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 p-4 text-center', isActive && 'border-primary/35 bg-primary/5')}>
            {draggedProject ? (<>
                <GripVertical className="mb-1.5 size-5 text-muted-foreground" aria-hidden/>
                <p className="text-xs font-medium text-muted-foreground">Drop to move here</p>
              </>) : (<p className="text-xs text-muted-foreground">No projects in this column</p>)}
          </div>) : (<>
            {column.items.map((project) => (<ProjectKanbanCard key={project.id} project={project} draggedProject={draggedProject} handleDragEnd={handleDragEnd} handleDragStart={handleDragStart} keyboardInstructionsId={keyboardInstructionsId} onDelete={onDelete} onEdit={onEdit} onKeyboardMoveProject={onKeyboardMoveProject} onUpdateStatus={onUpdateStatus} pendingStatusUpdates={pendingStatusUpdates}/>))}
            {draggedProject ? (<div className={cn('flex min-h-16 flex-col items-center justify-center rounded-lg border border-dashed p-3 text-center transition-colors', isActive ? 'border-primary/35 bg-primary/5' : 'border-border/40 bg-background/40')}>
                <GripVertical className="mb-1 size-4 text-muted-foreground" aria-hidden/>
                <p className="text-xs font-medium text-muted-foreground">Drop to move here</p>
              </div>) : null}
          </>)}
      </div>
    </div>);
}

function ProjectKanbanCard({ project, draggedProject, handleDragEnd, handleDragStart, keyboardInstructionsId, onDelete, onEdit, onKeyboardMoveProject, onUpdateStatus, pendingStatusUpdates, }: {
    project: ProjectRecord;
    draggedProject: DraggedProject | null;
    handleDragEnd: () => void;
    handleDragStart: (event: React.DragEvent, project: ProjectRecord) => void;
    keyboardInstructionsId: string;
    onDelete: (project: ProjectRecord) => void;
    onEdit: (project: ProjectRecord) => void;
    onKeyboardMoveProject: (project: ProjectRecord, direction: 'previous' | 'next') => void;
    onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
    pendingStatusUpdates: Set<string>;
}) {
    const isDragging = draggedProject?.id === project.id;
    const isLocked = !canDragProjectKanbanCard(project, pendingStatusUpdates);
    const onGripDragStart = useCallback((event: React.DragEvent<HTMLButtonElement>) => {
        handleDragStart(event, project);
    }, [handleDragStart, project]);
    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!event.altKey)
            return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            onKeyboardMoveProject(project, 'previous');
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            onKeyboardMoveProject(project, 'next');
        }
    }, [onKeyboardMoveProject, project]);
    return (<li className={cn('list-none', isDragging && 'opacity-40')}>
      <div className="flex items-start gap-1.5">
        {isLocked ? null : (<button type="button" className="mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60 active:cursor-grabbing" aria-label={`Move ${project.name} to another status column`} aria-describedby={keyboardInstructionsId} aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight" aria-grabbed={isDragging} draggable onDragStart={onGripDragStart} onDragEnd={handleDragEnd} onKeyDown={handleKeyDown}>
            <GripVertical className="size-4" aria-hidden/>
          </button>)}
        <div className={cn('min-w-0 flex-1', !isLocked && 'active:scale-[0.99]')}>
          <ProjectCard project={project} onDelete={onDelete} onEdit={onEdit} onUpdateStatus={onUpdateStatus} isPendingUpdate={pendingStatusUpdates.has(project.id)} compact kanban/>
        </div>
      </div>
    </li>);
}
