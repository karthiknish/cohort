'use client'

import { memo } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { TaskStatus } from '@/types/tasks'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
  completionRate: number
}

type SummaryCardConfig = {
  status: TaskStatus
  label: string
}

const summaryCards: SummaryCardConfig[] = [
  {
    status: 'todo',
    label: 'To do',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
  },
  {
    status: 'review',
    label: 'Needs Review',
  },
  {
    status: 'completed',
    label: 'Completed',
  },
]

export const TaskSummaryCards = memo(function TaskSummaryCards({ taskCounts, completionRate }: TaskSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {summaryCards.map((card) => (
        <Card key={card.status} className="overflow-hidden border-muted/50 bg-background shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
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
