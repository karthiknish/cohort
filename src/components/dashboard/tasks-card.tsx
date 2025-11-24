import Link from 'next/link'

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

export function TasksCard({ tasks, loading }: TasksCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Upcoming Tasks</CardTitle>
          <CardDescription>Important actions scheduled this week</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs">
          <Link href="/dashboard/tasks">Manage tasks</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <FadeInItem key={task.id}>
              <TaskItem task={task} />
            </FadeInItem>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted/60 p-6 text-center text-sm text-muted-foreground">
            <p>No open tasks on your radar. Add an item to keep your team aligned.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/tasks/new">Create a task</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TaskItem({ task }: { task: DashboardTaskItem }) {
  const priorityColors: Record<DashboardTaskItem['priority'], string> = {
    urgent: 'bg-rose-100 text-rose-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  return (
    <Card className="border-muted bg-background">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.clientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('capitalize', priorityColors[task.priority] ?? 'bg-muted text-muted-foreground')}>
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">{task.dueLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}
