'use client'

import { memo } from 'react'

import { Clock, CircleCheck, CircleAlert, Eye as EyeIcon } from 'lucide-react'

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
    icon: Clock,
    iconClass: 'bg-muted/80 text-muted-foreground',
  },
  {
    status: 'in-progress',
    label: 'In progress',
    icon: CircleAlert,
    iconClass: 'bg-muted/80 text-muted-foreground',
  },
  {
    status: 'review',
    label: 'Review',
    icon: EyeIcon,
    iconClass: 'bg-muted/80 text-muted-foreground',
  },
  {
    status: 'completed',
    label: 'Completed',
    icon: CircleCheck,
    iconClass: 'bg-muted/80 text-muted-foreground',
  },
]

export const TaskSummaryCards = memo(function TaskSummaryCards({ taskCounts, completionRate }: TaskSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {summaryCards.map((card) => (
        <Card key={card.status} className="border-muted/60 bg-background">
          <CardContent className="flex items-center gap-3 p-4">
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                card.iconClass
              )}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{card.label}</p>
              <p className="text-lg font-semibold text-foreground">{taskCounts[card.status]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="border-muted/60 bg-background">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex-1">
            <p className="text-xs uppercase text-muted-foreground">Completion</p>
            <p className="text-lg font-semibold text-foreground">{completionRate}%</p>
            <Progress value={completionRate} className="mt-1.5 h-1.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
