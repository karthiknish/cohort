'use client';
import { useMemo } from 'react';
import { useClientNowMs } from '@/lib/hooks/use-client-relative-time';
import Link from 'next/link';
import { useConvexAuth, useQuery } from 'convex/react';
import { ArrowUpRight, CheckSquare, Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { tasksApi } from '@/lib/convex-api';
import { getPreviewTasks } from '@/lib/preview-data';
import { cn, getWorkspaceId } from '@/lib/utils';
import type { TaskRecord } from '@/types/tasks';
function mapConvexTask(raw: unknown): TaskRecord | null {
    if (!raw || typeof raw !== 'object')
        return null;
    const r = raw as Record<string, unknown>;
    return {
        id: String(r.legacyId ?? ''),
        title: String(r.title ?? ''),
        description: typeof r.description === 'string' ? r.description : null,
        status: (r.status as TaskRecord['status']) ?? 'todo',
        priority: (r.priority as TaskRecord['priority']) ?? 'medium',
        assignedTo: Array.isArray(r.assignedTo) ? (r.assignedTo as string[]) : [],
        clientId: typeof r.clientId === 'string' ? r.clientId : null,
        client: typeof r.client === 'string' ? r.client : null,
        projectId: typeof r.projectId === 'string' ? r.projectId : null,
        projectName: typeof r.projectName === 'string' ? r.projectName : null,
        dueDate: typeof r.dueDateMs === 'number' ? new Date(r.dueDateMs).toISOString() : null,
        createdAt: typeof r.createdAtMs === 'number' ? new Date(r.createdAtMs).toISOString() : null,
        updatedAt: typeof r.updatedAtMs === 'number' ? new Date(r.updatedAtMs).toISOString() : null,
    };
}
function isOpenTask(task: TaskRecord): boolean {
    return task.status !== 'completed' && task.status !== 'archived';
}
function formatDueDate(dueDate: string | null | undefined, nowMs: number): string {
    if (!dueDate)
        return 'No due date';
    const dueMs = Date.parse(dueDate);
    if (!Number.isFinite(dueMs))
        return 'No due date';
    const diffMs = dueMs - nowMs;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffMs < 0) {
        const overDays = Math.abs(diffDays);
        return overDays === 0 ? 'Overdue today' : `${overDays}d overdue`;
    }
    if (diffDays === 0)
        return 'Due today';
    if (diffDays === 1)
        return 'Due tomorrow';
    return `Due in ${diffDays}d`;
}
function partitionTasks(tasks: TaskRecord[], nowMs: number) {
    const pending: TaskRecord[] = [];
    const upcoming: TaskRecord[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const weekEnd = nowMs + 7 * dayMs;
    const todayEnd = new Date(nowMs);
    todayEnd.setHours(23, 59, 59, 999);
    for (const task of tasks) {
        if (!task.dueDate) {
            pending.push(task);
            continue;
        }
        const dueMs = Date.parse(task.dueDate);
        if (!Number.isFinite(dueMs)) {
            pending.push(task);
            continue;
        }
        if (dueMs <= weekEnd) {
            pending.push(task);
        }
        else {
            upcoming.push(task);
        }
    }
    const sortByDue = (a: TaskRecord, b: TaskRecord) => {
        const aMs = a.dueDate ? Date.parse(a.dueDate) : Number.MAX_SAFE_INTEGER;
        const bMs = b.dueDate ? Date.parse(b.dueDate) : Number.MAX_SAFE_INTEGER;
        return aMs - bMs;
    };
    pending.sort(sortByDue);
    upcoming.sort(sortByDue);
    return { pending, upcoming };
}
function TaskRow({ task, nowMs }: {
    task: TaskRecord;
    nowMs: number;
}) {
    const isOverdue = task.dueDate ? Date.parse(task.dueDate) < nowMs : false;
    return (<li>
      <Link href={`/dashboard/tasks?taskId=${task.id}`} className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
        <CheckSquare className={cn('mt-0.5 size-4 shrink-0', isOverdue ? 'text-destructive' : 'text-muted-foreground')} aria-hidden/>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground group-hover:text-primary">{task.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className={cn('inline-flex items-center gap-1', isOverdue && 'font-medium text-destructive')}>
              <Clock className="size-3" aria-hidden/>
              {formatDueDate(task.dueDate, nowMs)}
            </span>
            {task.client ? <span className="truncate">{task.client}</span> : null}
            {task.projectName ? <span className="truncate text-muted-foreground/80">{task.projectName}</span> : null}
          </div>
        </div>
        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden/>
      </Link>
    </li>);
}
function TaskGroup({ title, tasks, nowMs, emptyMessage, }: {
    title: string;
    tasks: TaskRecord[];
    nowMs: number;
    emptyMessage: string;
}) {
    return (<div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
        {tasks.length > 0 ? <span className="ml-1.5 font-normal">({tasks.length})</span> : null}
      </h3>
      {tasks.length === 0 ? (<p className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>) : (<ul className="divide-y divide-border/50 rounded-lg border border-border/60 bg-card">
          {tasks.map((task) => (<TaskRow key={task.id} task={task} nowMs={nowMs}/>))}
        </ul>)}
    </div>);
}
function TasksSkeleton() {
    return (<div className="space-y-6">
      {['pending', 'upcoming'].map((key) => (<div key={key} className="space-y-2">
          <Skeleton className="h-3 w-24"/>
          <Skeleton className="h-24 w-full rounded-lg"/>
        </div>))}
    </div>);
}
export function ForYouTasks() {
    const { user } = useAuth();
    const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const { isPreviewMode } = usePreview();
    const nowMs = useClientNowMs();
    const workspaceId = getWorkspaceId(user);
    const canQuery = isAuthenticated && !isConvexLoading && !!workspaceId && !!user?.id;
    const rawTasks = useQuery(tasksApi.listForUser, canQuery ? { workspaceId, userId: user?.id ?? '' } : 'skip') as unknown[] | undefined;
    const tasks = (() => {
        if (isPreviewMode) {
            return getPreviewTasks(null).filter(isOpenTask);
        }
        if (!rawTasks)
            return [];
        return rawTasks.flatMap((row) => {
            const task = mapConvexTask(row);
            return task && isOpenTask(task) ? [task] : [];
        });
    })();
    const { pending, upcoming } = partitionTasks(tasks, nowMs);
    const isLoading = !isPreviewMode && rawTasks === undefined;
    if (isLoading) {
        return <TasksSkeleton />;
    }
    return (<section aria-labelledby="for-you-tasks-heading" className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="for-you-tasks-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Work items
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Assigned to you - due soon and what&apos;s coming up.</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
          <Link href="/dashboard/tasks">View all</Link>
        </Button>
      </div>

      <TaskGroup title="Pending" tasks={pending} nowMs={nowMs} emptyMessage="Nothing due this week. You're caught up on near-term work."/>
      <TaskGroup title="Upcoming" tasks={upcoming} nowMs={nowMs} emptyMessage="No work scheduled beyond this week."/>
    </section>);
}
