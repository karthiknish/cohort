import { memo, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CircleCheck, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { FadeInItem } from '@/components/ui/animate-in'
import { cn } from '@/lib/utils'
import type { DashboardTaskItem } from '@/types/dashboard'

interface TasksCardProps {
  tasks: DashboardTaskItem[]
  loading: boolean
}

const TASK_ITEM_HEIGHT = 56 // Estimated height per task item

export function TasksCard({ tasks, loading }: TasksCardProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => TASK_ITEM_HEIGHT,
    overscan: 5,
    getItemKey: (index) => tasks[index]?.id ?? index,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Upcoming Tasks</CardTitle>
          <CardDescription>Priority items for this week</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Manage tasks">
          <Link href="/dashboard/tasks">
            <Calendar className="h-4 w-4" />
            <span className="sr-only">Manage tasks</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : tasks.length > 0 ? (
          <div
            ref={parentRef}
            className="h-full max-h-[320px] overflow-auto"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualItem) => {
                const task = tasks[virtualItem.index]
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <TaskItem task={task} />
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-8 text-center text-sm text-muted-foreground">
            <CircleCheck className="h-8 w-8 text-muted-foreground/50" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">All caught up!</p>
              <p>No pending tasks on your radar.</p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/dashboard/tasks/new">Create a task</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const TaskItem = memo(function TaskItem({ task }: { task: DashboardTaskItem }) {
  const priorityDotClass = useMemo(
    () =>
      task.priority === 'urgent'
        ? 'bg-rose-500'
        : task.priority === 'high'
          ? 'bg-orange-500'
          : task.priority === 'medium'
            ? 'bg-yellow-500'
            : 'bg-slate-400',
    [task.priority]
  )

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors hover:bg-muted/50 hover:border-border">
      <div className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0', priorityDotClass)} />
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm font-medium leading-none truncate">{task.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate max-w-[120px]">{task.clientName}</span>
          <span>•</span>
          <span className={cn(
            task.dueLabel === 'Today' ? 'text-orange-600 font-medium' : ''
          )}>{task.dueLabel}</span>
        </div>
      </div>
    </div>
  )
})
