'use client'

import { memo } from 'react'

import { Card, CardContent } from '@/shared/ui/card'
import type { TaskStatus } from '@/types/tasks'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
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

export const TaskSummaryCards = memo(function TaskSummaryCards({ taskCounts }: TaskSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <Card key={card.status} className="overflow-hidden border-muted/50 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{card.label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{taskCounts[card.status]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
