'use client';
import { Suspense, useMemo } from 'react';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { useTasksPageContent } from './use-tasks-page-content';
import { TasksPageSkeleton } from './tasks-page-skeleton';
export type TasksPageClientProps = {
    initialProjectId?: string | null;
    initialProjectName?: string | null;
    initialClientId?: string | null;
    initialClientName?: string | null;
    initialAction?: string | null;
    initialSearchParamsString?: string;
};
function TasksPageContent(props: TasksPageClientProps) {
    return useTasksPageContent(props);
}
const TASKS_PAGE_FALLBACK = <TasksPageSkeleton />;
export default function TasksPageClient(props: TasksPageClientProps) {
    return (<PageMotionShell reveal={false} className="flex flex-col flex-1 min-h-0 gap-6">
      <Suspense fallback={TASKS_PAGE_FALLBACK}>
        <TasksPageContent {...props}/>
      </Suspense>
    </PageMotionShell>);
}
