'use client'

import { memo } from 'react'

import { Clock, CheckCircle2, CircleAlert, Eye as EyeIcon, Circle, CirclePlay } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { TaskStatus } from '@/types/tasks'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
  completionRate: number
}

type SummaryCardConfig = {
  status: TaskStatus
  label: string
  icon: typeof Clock
  iconClass: string
}

const summaryCards: SummaryCardConfig[] = [
  {
    status: 'todo',
    label: 'To do',
    icon: Circle,
    iconClass: 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
    icon: CirclePlay,
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    status: 'review',
    label: 'Needs Review',
    icon: EyeIcon,
    iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    status: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
]

export const TaskSummaryCards = memo(function TaskSummaryCards({ taskCounts, completionRate }: TaskSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {summaryCards.map((card) => (
        <Card key={card.status} className="overflow-hidden border-muted/50 bg-background shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm',
                card.iconClass
              )}
            >
              <card.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{card.label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{taskCounts[card.status]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="overflow-hidden border-muted/50 bg-background shadow-sm transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Flow Efficiency</p>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
