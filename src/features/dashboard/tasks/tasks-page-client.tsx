'use client'

import { Suspense, useMemo } from 'react'

import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { Card, CardContent } from '@/shared/ui/card'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { useTasksPageContent } from './use-tasks-page-content'

export type TasksPageClientProps = {
  initialProjectId?: string | null
  initialProjectName?: string | null
  initialClientId?: string | null
  initialClientName?: string | null
  initialAction?: string | null
  initialSearchParamsString?: string
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

function TasksPageContent(props: TasksPageClientProps) {
  return useTasksPageContent(props)
}

export default function TasksPageClient(props: TasksPageClientProps) {
  const suspenseFallback = useMemo(() => <TasksPageFallback />, [])

  return (
    <PageMotionShell reveal={false}>
      <Suspense fallback={suspenseFallback}>
        <TasksPageContent {...props} />
      </Suspense>
    </PageMotionShell>
  )
}
