'use client';
import { ListTodo, LoaderCircle, Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { TaskRecord, TaskStatus } from '@/types/tasks';
const noop = () => { };
const EMPTY_PENDING_STATUS_UPDATES = new Set<string>();
import { TaskDataTable } from './task-data-table';
import { TASKS_THEME } from './tasks-theme';
export function TaskListLoadingState() {
    return (<TaskDataTable tasks={[]} loading onOpen={noop} onEdit={noop} onDelete={noop} onQuickStatusChange={noop} pendingStatusUpdates={EMPTY_PENDING_STATUS_UPDATES}/>);
}
export function TaskListErrorState({ error, loading, onRefresh }: {
    error: string;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (<div className="p-4">
      <div className="mx-4 my-8 px-4 text-center">
        <TriangleAlert className="mx-auto size-8 text-destructive" aria-hidden/>
        <p className="mt-2 text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4 h-8" onClick={onRefresh} disabled={loading}>
          {loading ? (<LoaderCircle className="mr-2 size-4 animate-spin"/>) : (<RefreshCw className="mr-2 size-4"/>)}
          Try again
        </Button>
      </div>
    </div>);
}
export function TaskListEmptyState({ emptyStateMessage, showEmptyStateFiltered, onClearFilters, onCreateTask }: {
    emptyStateMessage: string;
    showEmptyStateFiltered: boolean;
    onClearFilters?: () => void;
    onCreateTask?: () => void;
}) {
    return (<div className="p-4">
      <div className={TASKS_THEME.emptyPanel}>
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
          <ListTodo className="size-6 text-muted-foreground" aria-hidden/>
        </div>
        <p className="text-base font-semibold tracking-tight text-foreground">No tasks here yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {showEmptyStateFiltered
            ? 'Nothing matches your filters. Try clearing search or status filters.'
            : emptyStateMessage}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {showEmptyStateFiltered && onClearFilters ? (<Button type="button" variant="outline" size="sm" className="h-9" onClick={onClearFilters}>
              Clear filters
            </Button>) : null}
          {!showEmptyStateFiltered && onCreateTask ? (<Button type="button" size="sm" className="h-9 gap-1.5" onClick={onCreateTask}>
              <Plus className="size-4" aria-hidden/>
              Create task
            </Button>) : null}
        </div>
      </div>
    </div>);
}
export function TaskListLoadMore({ loadingMore, onLoadMore }: {
    loadingMore: boolean;
    onLoadMore: () => void;
}) {
    return (<div className="border-t border-border/80 px-4 py-3">
      <Button variant="ghost" size="sm" className="h-8 w-full text-muted-foreground" onClick={onLoadMore} disabled={loadingMore}>
        {loadingMore ? (<span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin"/>
            Loading…
          </span>) : ('Load more')}
      </Button>
    </div>);
}
export function TaskListItems({ onDelete, onEdit, onOpen, onQuickStatusChange, onSelectToggle, pendingStatusUpdates, selectedTaskIds, tasks }: {
    onDelete: (task: TaskRecord) => void;
    onEdit: (task: TaskRecord) => void;
    onOpen: (task: TaskRecord) => void;
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
    onSelectToggle?: (taskId: string, checked: boolean) => void;
    pendingStatusUpdates: Set<string>;
    selectedTaskIds?: Set<string>;
    tasks: TaskRecord[];
}) {
    return (<TaskDataTable tasks={tasks} pendingStatusUpdates={pendingStatusUpdates} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onQuickStatusChange={onQuickStatusChange} selectedTaskIds={selectedTaskIds} onSelectToggle={onSelectToggle}/>);
}
