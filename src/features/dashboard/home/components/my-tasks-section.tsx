'use client';
import { useClientNowMs } from '@/lib/hooks/use-client-relative-time';
import { Link } from '@/shared/ui/link';
import { useConvexAuth, useQuery } from 'convex/react';
import { ArrowUpRight, CheckSquare, Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuth } from '@/shared/contexts/auth-context';
import { tasksApi } from '@/lib/convex-api';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { cn, getWorkspaceId } from '@/lib/utils';
import type { TaskRecord } from '@/types/tasks';
// ─── Helpers ──────────────────────────────────────────────────────────────────
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
type BadgeVariant = 'destructive' | 'warning' | 'info' | 'secondary' | 'success' | 'default';
const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
    urgent: 'destructive',
    high: 'warning',
    medium: 'info',
    low: 'secondary',
};
const STATUS_VARIANT: Record<string, BadgeVariant> = {
    'todo': 'secondary',
    'in-progress': 'info',
    'review': 'default',
    'completed': 'success',
    'archived': 'secondary',
};
type TaskGroup = {
    label: string;
    tone: 'critical' | 'warning' | 'neutral';
    tasks: TaskRecord[];
};
function groupTasks(tasks: TaskRecord[], nowMs: number): TaskGroup[] {
    const overdue: TaskRecord[] = [];
    const today: TaskRecord[] = [];
    const soon: TaskRecord[] = [];
    const later: TaskRecord[] = [];
    const noduedate: TaskRecord[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const todayEnd = new Date(nowMs);
    todayEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(nowMs + 7 * dayMs);
    for (const t of tasks) {
        if (!t.dueDate) {
            noduedate.push(t);
            continue;
        }
        const dueMs = Date.parse(t.dueDate);
        if (!Number.isFinite(dueMs)) {
            noduedate.push(t);
            continue;
        }
        if (dueMs < nowMs) {
            overdue.push(t);
        }
        else if (dueMs <= todayEnd.getTime()) {
            today.push(t);
        }
        else if (dueMs <= weekEnd.getTime()) {
            soon.push(t);
        }
        else {
            later.push(t);
        }
    }
    const groups: TaskGroup[] = [];
    if (overdue.length > 0)
        groups.push({ label: 'Overdue', tone: 'critical', tasks: overdue });
    if (today.length > 0)
        groups.push({ label: 'Due today', tone: 'warning', tasks: today });
    if (soon.length > 0)
        groups.push({ label: 'This week', tone: 'neutral', tasks: soon });
    if (later.length > 0)
        groups.push({ label: 'Upcoming', tone: 'neutral', tasks: later });
    if (noduedate.length > 0)
        groups.push({ label: 'No due date', tone: 'neutral', tasks: noduedate });
    return groups;
}
function formatDueDate(dueDate: string | null | undefined, nowMs: number): string {
    if (!dueDate)
        return '';
    const dueMs = Date.parse(dueDate);
    if (!Number.isFinite(dueMs))
        return '';
    const diffMs = dueMs - nowMs;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffMs < 0) {
        const overDays = Math.abs(diffDays);
        if (overDays === 0)
            return 'Due today (overdue)';
        return `${overDays}d overdue`;
    }
    if (diffDays === 0)
        return 'Due today';
    if (diffDays === 1)
        return 'Due tomorrow';
    return `Due in ${diffDays}d`;
}
const TONE_HEADER: Record<string, string> = {
    critical: 'text-destructive',
    warning: 'text-warning',
    neutral: 'text-muted-foreground',
};
// ─── Task row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, nowMs }: {
    task: TaskRecord;
    nowMs: number;
}) {
    const isOverdue = task.dueDate ? Date.parse(task.dueDate) < nowMs : false;
    return (<Link href={`/dashboard/tasks?taskId=${task.id}`} className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-muted hover:bg-muted/40">
      <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md border', isOverdue ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-muted bg-muted/40 text-muted-foreground')}>
        <CheckSquare className="size-3.5" aria-hidden/>
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{task.title}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Priority */}
          <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'secondary'} className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide">
            {task.priority}
          </Badge>

          {/* Status */}
          <Badge variant={STATUS_VARIANT[task.status] ?? 'secondary'} className="rounded-full px-2 py-0 text-[10px] font-medium capitalize">
            {task.status.replace('-', ' ')}
          </Badge>

          {/* Client badge */}
          {task.client && (<Badge variant="secondary" className="max-w-[120px] truncate rounded-full px-2 py-0 text-[10px]">
              {task.client}
            </Badge>)}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {task.dueDate && (<p className={cn('flex items-center gap-1 text-[11px]', isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            <Clock className="size-3"/>
            {formatDueDate(task.dueDate, nowMs)}
          </p>)}
        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"/>
      </div>
    </Link>);
}
// ─── Skeleton ─────────────────────────────────────────────────────────────────
const TASK_SKELETON_KEYS = ['ts-a', 'ts-b', 'ts-c', 'ts-d'] as const;
function TaskSkeleton() {
    return (<div className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5">
      <Skeleton className="size-7 shrink-0 rounded-md"/>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4"/>
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-14 rounded-full"/>
          <Skeleton className="h-4 w-16 rounded-full"/>
        </div>
      </div>
    </div>);
}
// ─── Main export ──────────────────────────────────────────────────────────────
export function MyTasksSection() {
    const { user } = useAuth();
    const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const currentTimeMs = useClientNowMs();
    const workspaceId = getWorkspaceId(user);
    const canQuery = isAuthenticated && !isConvexLoading && !!workspaceId && !!user?.id;
    const rawTasks = useQuery(tasksApi.listForUser, canQuery ? { workspaceId, userId: user?.id ?? '' } : 'skip') as unknown[] | undefined;
    const tasksError = useConvexQueryError({ data: rawTasks, skipped: !canQuery, fallbackMessage: 'Unable to load your tasks.' });
    const tasks: TaskRecord[] = rawTasks
        ? rawTasks.flatMap((r) => {
            const t = mapConvexTask(r);
            return t ? [t] : [];
        })
        : [];
    const groups = groupTasks(tasks, currentTimeMs);
    const isLoading = rawTasks === undefined;
    const openCount = tasks.length;
    return (<Card className="border-muted/60 bg-background shadow-sm">
      <CardHeader className="border-b border-muted/40 pb-4">
        <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Workload</CardDescription>
        <CardTitle className="text-lg tracking-tight">My work</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            {!isLoading && openCount > 0 && (<Badge variant="secondary" className="rounded-full text-xs tabular-nums">
                {openCount}
              </Badge>)}
            <Button asChild variant="ghost" size="sm" className="w-fit">
              <Link href="/dashboard/tasks">View all tasks</Link>
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4">
        {tasksError ? (<Alert variant="destructive"><AlertDescription>{tasksError}</AlertDescription></Alert>) : isLoading ? (<div className="space-y-1">
            {TASK_SKELETON_KEYS.map((k) => (<TaskSkeleton key={k}/>))}
          </div>) : tasks.length === 0 ? (<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <CheckSquare className="size-5 opacity-60"/>
            </span>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up, no open tasks assigned to you right now.</p>
          </div>) : (<div className="space-y-4">
            {groups.map((group) => (<div key={group.label}>
                <p className={cn('mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider', TONE_HEADER[group.tone])}>
                  {group.label}
                  <span className="ml-1.5 font-normal opacity-70 tabular-nums">({group.tasks.length})</span>
                </p>
                <div className="space-y-0.5">
                  {group.tasks.map((t) => (<TaskRow key={t.id} task={t} nowMs={currentTimeMs}/>))}
                </div>
              </div>))}
          </div>)}
      </CardContent>
    </Card>);
}
