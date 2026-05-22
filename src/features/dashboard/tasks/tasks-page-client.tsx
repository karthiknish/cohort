'use client'

import { useTasksPageContent } from './use-tasks-page-content'


import { useQuery } from 'convex/react'
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  formatDate,
  mergeTaskParticipants,
  ProjectFilterBanner,
  TaskBulkToolbar,
  TaskFilters,
  type TaskParticipant,
  TaskResultsCount,
  TasksHeader,
  TaskSummaryCards,
  TaskViewControls,
  useDebouncedValue,
  useTaskFilters,
  useTaskForm,
  useTasks,
} from '@/features/dashboard/tasks'
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { Card, CardContent } from '@/shared/ui/card'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useNavigationContext } from '@/shared/contexts/navigation-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { usersApi } from '@/lib/convex-api'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { TASKS_THEME } from './tasks-theme'
import { isFeatureEnabled } from '@/lib/features'
import { cn, exportToCsv } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'


const TaskList = dynamic(() => import('@/features/dashboard/tasks/task-list').then((mod) => mod.TaskList), {
  loading: () => <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>,
})

const TaskKanban = dynamic(
  () => import('@/features/dashboard/tasks/task-kanban').then((mod) => mod.TaskKanban),
  {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading board…</div>,
    ssr: false,
  }
)

const CreateTaskSheet = dynamic(
  () => import('@/features/dashboard/tasks/task-form-sheets').then((mod) => mod.CreateTaskSheet),
  { ssr: false }
)

const EditTaskSheet = dynamic(
  () => import('@/features/dashboard/tasks/task-form-sheets').then((mod) => mod.EditTaskSheet),
  { ssr: false }
)

const DeleteTaskDialog = dynamic(
  () => import('@/features/dashboard/tasks/delete-task-dialog').then((mod) => mod.DeleteTaskDialog),
  { ssr: false }
)

const TASKS_PAGE_FALLBACK = <TasksPageFallback />

type TasksPageClientProps = {
  initialProjectId?: string | null
  initialProjectName?: string | null
  initialClientId?: string | null
  initialClientName?: string | null
  initialAction?: string | null
  initialSearchParamsString?: string
}

export default function TasksPageClient({
  initialProjectId = null,
  initialProjectName = null,
  initialClientId = null,
  initialClientName = null,
  initialAction = null,
  initialSearchParamsString = '',
}: TasksPageClientProps) {
  return (
    <PageMotionShell reveal={false}>
      <Suspense fallback={TASKS_PAGE_FALLBACK}>
        <TasksPageContent
        initialAction={initialAction}
        initialClientId={initialClientId}
        initialClientName={initialClientName}
        initialProjectId={initialProjectId}
        initialProjectName={initialProjectName}
        initialSearchParamsString={initialSearchParamsString}
      />
      </Suspense>
    </PageMotionShell>
  )
}

function TasksPageFallback() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Loading tasks…
        </CardContent>
      </Card>
    </div>
  )
}

function TasksPageContent({
  initialAction,
  initialClientId,
  initialClientName,
  initialProjectId,
  initialProjectName,
  initialSearchParamsString,
}: TasksPageClientProps) {
  return useTasksPageContent({
    initialAction,
    initialClientId,
    initialClientName,
    initialProjectId,
    initialProjectName,
    initialSearchParamsString,
  })
}
